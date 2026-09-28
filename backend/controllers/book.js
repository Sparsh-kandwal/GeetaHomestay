import Booking from "../models/booking.js";
import Room from "../models/room.js";
import BookedDate from "../models/bookedDates.js";
import Cart_item from "../models/cart.js";
import mongoose from "mongoose";
import { rollbackBookings } from "../utils/rollbackBookings.js";
import {
  getKolkataTodayString,
  normalizeToKolkataDateString,
  calculateNights,
  isPositiveInteger,
} from "../utils/dateUtils.js";

const PENDING_VISIBILITY_WINDOW_MS = 5 * 60 * 1000;

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const pendingCutoff = new Date(Date.now() - PENDING_VISIBILITY_WINDOW_MS);
    await rollbackBookings(userId, { createdBefore: pendingCutoff });

    const activePendingBookings = await Booking.find({
      userId,
      paymentStatus: "pending",
      createdAt: { $gte: pendingCutoff },
    }).sort({ createdAt: -1 });

    if (activePendingBookings.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Existing pending booking found",
        bookings: activePendingBookings,
        hasPendingPayment: true,
      });
    }

    const cartItems = await Cart_item.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const todayKolkata = getKolkataTodayString();
    const validatedItems = [];
    const validationErrors = [];

    // =========================================================================
    // PHASE 1: Pure Pre-Validation of all cart items before any DB mutation
    // =========================================================================
    for (const cartItem of cartItems) {
      const { roomType, checkIn, checkOut, quantity, members } = cartItem;

      if (!isPositiveInteger(quantity)) {
        validationErrors.push({ roomType, message: "Invalid room quantity" });
        continue;
      }

      if (!isPositiveInteger(members)) {
        validationErrors.push({ roomType, message: "Invalid members count" });
        continue;
      }

      const normCheckIn = normalizeToKolkataDateString(checkIn);
      const normCheckOut = normalizeToKolkataDateString(checkOut);
      if (!normCheckIn || !normCheckOut) {
        validationErrors.push({ roomType, message: "Malformed check-in or check-out date" });
        continue;
      }

      if (normCheckIn < todayKolkata) {
        validationErrors.push({ roomType, message: "Check-in date cannot be in the past" });
        continue;
      }

      const totalDays = calculateNights(normCheckIn, normCheckOut);
      if (isNaN(totalDays) || totalDays <= 0) {
        validationErrors.push({ roomType, message: "Invalid booking dates: check-out must be after check-in" });
        continue;
      }

      const room = await Room.findOne({ roomType });
      if (!room) {
        validationErrors.push({ roomType, message: "Room type not found" });
        continue;
      }

      // Guest limit check: Fail closed if cap is missing or invalid
      const maxAdults = room.maxAdults ?? room._doc?.maxAdults;
      if (typeof maxAdults !== "number" || maxAdults <= 0) {
        validationErrors.push({ roomType, message: "Room capacity configuration is invalid" });
        continue;
      }

      if (members > maxAdults * quantity) {
        validationErrors.push({
          roomType,
          message: `Too many guests for ${quantity} room(s). Max allowed: ${maxAdults * quantity}`,
        });
        continue;
      }

      const totalRooms = room.totalRooms ?? room._doc?.totalRooms;
      if (typeof totalRooms !== "number" || totalRooms <= 0) {
        validationErrors.push({ roomType, message: "Room inventory configuration is invalid (totalRooms)" });
        continue;
      }

      if (quantity > totalRooms) {
        validationErrors.push({
          roomType,
          message: `Requested ${quantity} rooms, but homestay only has ${totalRooms} of this type`,
        });
        continue;
      }

      // Server-side price computation: Unit price with discount formula (rounded to integer rupees)
      const discount = typeof room.discount === "number" ? room.discount : (room._doc?.discount || 0);
      const unitPrice = Math.round(room.price * (1 - discount));
      const totalAmount = Math.round(totalDays * quantity * unitPrice);

      const checkInDate = new Date(normCheckIn + "T00:00:00.000Z");
      const checkOutDate = new Date(normCheckOut + "T00:00:00.000Z");

      validatedItems.push({
        roomType,
        quantity,
        members,
        normCheckIn,
        normCheckOut,
        checkInDate,
        checkOutDate,
        totalDays,
        totalRooms,
        discount,
        totalAmount,
      });
    }

    if (validationErrors.length > 0 || validatedItems.length !== cartItems.length) {
      return res.status(400).json({
        success: false,
        message: "Some cart items failed validation",
        errors: validationErrors,
      });
    }

    // =========================================================================
    // PHASE 2: Atomic All-or-Nothing Inventory Reservation
    // Uses findOneAndUpdate with conditional ceiling ($lte: totalRooms - quantity).
    // If any date fails, rolls back ALL reservations made across all items.
    // =========================================================================
    const reservedEntries = []; // Track { dateObj, roomType, quantity } for exact rollback
    let reservationFailed = false;
    const availabilityErrors = [];

    for (const item of validatedItems) {
      const { roomType, quantity, checkInDate, checkOutDate, totalRooms } = item;

      for (
        let date = new Date(checkInDate);
        date < checkOutDate;
        date.setDate(date.getDate() + 1)
      ) {
        const formattedDate = date.toISOString().split("T")[0];
        const dateObj = new Date(formattedDate + "T00:00:00.000Z");

        // 1. Check if document exists
        const existing = await BookedDate.findOne({ date: dateObj, roomType });

        if (!existing) {
          // Document does not exist yet for this date.
          // Try to create it. If two requests race to create concurrently,
          // the compound unique index { date: 1, roomType: 1 } will reject one with code 11000.
          try {
            await BookedDate.create({ date: dateObj, roomType, quantity });
            reservedEntries.push({ dateObj, roomType, quantity });
            continue;
          } catch (createErr) {
            if (createErr.code === 11000) {
              // Another request created it concurrently: fall through to atomic conditional increment
            } else {
              throw createErr;
            }
          }
        }

        // 2. Document exists (or was just created concurrently).
        // Atomically increment ONLY if current quantity allows it without exceeding totalRooms.
        const updated = await BookedDate.findOneAndUpdate(
          {
            date: dateObj,
            roomType,
            quantity: { $lte: totalRooms - quantity },
          },
          { $inc: { quantity } },
          { new: true }
        );

        if (!updated) {
          // Room is full on this night!
          reservationFailed = true;
          availabilityErrors.push({
            roomType,
            message: `No availability on ${formattedDate} (max ${totalRooms} rooms)`,
          });
          break;
        }

        reservedEntries.push({ dateObj, roomType, quantity });
      }

      if (reservationFailed) {
        break;
      }
    }

    // If ANY date for ANY cart item was unavailable, rollback all reservations
    if (reservationFailed) {
      for (const resv of reservedEntries) {
        await BookedDate.findOneAndUpdate(
          { date: resv.dateObj, roomType: resv.roomType },
          { $inc: { quantity: -resv.quantity } }
        );
        // Clean up zero or negative quantity documents
        await BookedDate.deleteOne({
          date: resv.dateObj,
          roomType: resv.roomType,
          quantity: { $lte: 0 },
        });
      }

      return res.status(400).json({
        success: false,
        message: "One or more dates are no longer available",
        errors: availabilityErrors,
      });
    }

    // =========================================================================
    // PHASE 3: Create Booking Records (All-or-Nothing Succeeded)
    // =========================================================================
    const bookingId = new mongoose.Types.ObjectId();
    const bookings = [];

    for (const item of validatedItems) {
      const booking = await Booking.create({
        bookingId,
        userId,
        roomType: item.roomType,
        members: item.members,
        checkIn: item.checkInDate,
        checkOut: item.checkOutDate,
        roomsBooked: item.quantity,
        totalAmount: item.totalAmount,
        discount: item.discount,
        paymentStatus: "pending",
      });

      bookings.push(booking);
    }

    res.status(200).json({
      success: true,
      message: "Bookings created successfully",
      bookings,
      hasPendingPayment: false,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ success: false, message: "Failed to create orders" });
  }
};

export default createOrder;
