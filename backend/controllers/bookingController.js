import mongoose from "mongoose";
import Booking from "../models/booking.js";
import { rollbackBookings } from "../utils/rollbackBookings.js";

const PENDING_VISIBILITY_WINDOW_MS = 5 * 60 * 1000;

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const pendingCutoff = new Date(Date.now() - PENDING_VISIBILITY_WINDOW_MS);

    await rollbackBookings(userId, { createdBefore: pendingCutoff });

    const bookings = await Booking.find({
      userId,
      paymentStatus: { $in: ["confirmed", "pending"] },
    }).sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const bookingFailed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Missing bookingId" });
    }

    // Support looking up by either the individual document _id or the group bookingId
    const query = mongoose.Types.ObjectId.isValid(bookingId)
      ? { $or: [{ bookingId }, { _id: bookingId }], paymentStatus: "pending" }
      : { bookingId, paymentStatus: "pending" };

    // Ownership check: fetch the booking(s) by bookingId/_id and verify
    // the authenticated user actually owns them before rolling back.
    const bookings = await Booking.find(query);

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: "No pending booking found with this ID" });
    }

    // Every booking doc grouped under this bookingId must belong to the requester
    const ownerUserId = bookings[0].userId.toString();
    if (ownerUserId !== userId) {
      return res.status(403).json({ success: false, message: "You are not authorized to cancel this booking" });
    }

    // Always use the group bookingId so all room items from the checkout order are rolled back
    const groupBookingId = bookings[0].bookingId;
    await rollbackBookings(userId, { bookingId: groupBookingId });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in bookingFailed:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
