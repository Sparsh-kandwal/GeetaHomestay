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
    console.log("[rollbackBookings] === START ===");
    console.log("[rollbackBookings] userId:", userId, "options:", JSON.stringify(options));

    if (!userId) {
      console.error("[rollbackBookings] FAIL: No userId provided.");
      return;
    }

    const { bookingId, createdBefore } = options;
    const query = { userId, paymentStatus: "pending" };

    if (bookingId) {
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        query.$or = [{ bookingId }, { _id: bookingId }];
        console.log("[rollbackBookings] Using $or query for bookingId/_id:", bookingId);
      } else {
        query.bookingId = bookingId;
        console.log("[rollbackBookings] Using direct bookingId query:", bookingId);
      }
    }

    if (createdBefore) {
      query.createdAt = { $lt: createdBefore };
      console.log("[rollbackBookings] Filtering by createdBefore:", createdBefore);
    }

    console.log("[rollbackBookings] DB query:", JSON.stringify(query));
    const pendingBookings = await Booking.find(query);
    console.log("[rollbackBookings] Found %d pending bookings to roll back", pendingBookings.length);

    if (!pendingBookings.length) {
      console.log("[rollbackBookings] No pending bookings found — nothing to roll back");
      return;
    }

    for (const booking of pendingBookings) {
      const { roomType, checkIn, checkOut, roomsBooked } = booking;
      console.log("[rollbackBookings] Rolling back booking _id=%s: roomType=%s, checkIn=%s, checkOut=%s, roomsBooked=%d",
        booking._id, roomType, checkIn, checkOut, roomsBooked);

      for (
        let date = new Date(checkIn);
        date < new Date(checkOut);
        date.setDate(date.getDate() + 1)
      ) {
        const formattedDate = date.toISOString().split("T")[0];
        const dateObj = new Date(formattedDate + "T00:00:00.000Z");

        // Atomic decrement using exact UTC midnight Date matching
        const decremented = await BookedDate.findOneAndUpdate(
          { date: dateObj, roomType },
          { $inc: { quantity: -roomsBooked } }
        );
        console.log("[rollbackBookings] Decremented %s/%s: result=%s",
          formattedDate, roomType, decremented ? `quantity now ${decremented.quantity - roomsBooked}` : "NOT FOUND");

        // Clean up documents that have dropped to zero or below
        const deleted = await BookedDate.deleteOne({ date: dateObj, roomType, quantity: { $lte: 0 } });
        if (deleted.deletedCount > 0) {
          console.log("[rollbackBookings] Cleaned up zero-quantity record for %s/%s", formattedDate, roomType);
        }
      }
    }

    const cancelResult = await Booking.updateMany(
      { _id: { $in: pendingBookings.map((booking) => booking._id) } },
      { $set: { paymentStatus: "cancelled" } }
    );
    console.log("[rollbackBookings] Cancelled %d bookings (matched=%d)",
      cancelResult.modifiedCount, cancelResult.matchedCount);
    console.log("[rollbackBookings] === DONE ===");
  } catch (error) {
    console.error("[rollbackBookings] === UNCAUGHT ERROR ===");
    console.error("[rollbackBookings] Error name:", error.name);
    console.error("[rollbackBookings] Error message:", error.message);
    console.error("[rollbackBookings] Error stack:", error.stack);
  }
};
