import BookedDate from "../models/bookedDates.js";
import Booking from "../models/booking.js";

/**
 * Rolls back bookings by:
 * 1. Removing booked dates.
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
      query.bookingId = bookingId;
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
        const existingDate = await BookedDate.findOne({ date: formattedDate, roomType });

        if (existingDate) {
          existingDate.quantity -= roomsBooked;

          if (existingDate.quantity <= 0) {
            await BookedDate.deleteOne({ _id: existingDate._id });
          } else {
            await existingDate.save();
          }
        }
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
