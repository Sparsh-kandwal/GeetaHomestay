import mongoose from "mongoose";
import BookedDate from "../models/bookedDates.js";
import Booking from "../models/booking.js";

/**
 * Rolls back bookings by:
 * 1. Removing booked dates atomically with $inc: -roomsBooked.
 * 2. Changing matching pending bookings to cancelled.
 * @param {String} userId
 * @param {Object} options
 * @param {String} options.bookingId
 * @param {Date} options.createdBefore
 */
export const rollbackBookings = async (userId, options = {}) => {
  try {
    if (!userId) {
      console.error("rollbackBookings: No userId provided.");
      return;
    }

    const { bookingId, createdBefore } = options;
    const query = { userId, paymentStatus: "pending" };

    if (bookingId) {
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        query.$or = [{ bookingId }, { _id: bookingId }];
      } else {
        query.bookingId = bookingId;
      }
    }

    if (createdBefore) {
      query.createdAt = { $lt: createdBefore };
    }

    const pendingBookings = await Booking.find(query);

    if (!pendingBookings.length) {
      return;
    }

    for (const booking of pendingBookings) {
      const { roomType, checkIn, checkOut, roomsBooked } = booking;

      for (
        let date = new Date(checkIn);
        date < new Date(checkOut);
        date.setDate(date.getDate() + 1)
      ) {
        const formattedDate = date.toISOString().split("T")[0];
        const dateObj = new Date(formattedDate + "T00:00:00.000Z");

        // Atomic decrement using exact UTC midnight Date matching
        await BookedDate.findOneAndUpdate(
          { date: dateObj, roomType },
          { $inc: { quantity: -roomsBooked } }
        );

        // Clean up documents that have dropped to zero or below
        await BookedDate.deleteOne({ date: dateObj, roomType, quantity: { $lte: 0 } });
      }
    }

    await Booking.updateMany(
      { _id: { $in: pendingBookings.map((booking) => booking._id) } },
      { $set: { paymentStatus: "cancelled" } }
    );
  } catch (error) {
    console.error("rollbackBookings Error:", error);
  }
};
