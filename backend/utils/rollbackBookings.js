import BookedDate from "../models/bookedDates.js";
import Booking from "../models/booking.js";

/**
 * Rolls back bookings by:
 * 1. Removing booked dates.
 * 2. Changing "pending" bookings to "cancelled".
 * @param {String} userId - The user's ID.
 */
export const rollbackBookings = async (userId) => {
    try {
        if (!userId) {
            console.error("🔴 rollbackBookings: No userId provided.");
            return;
        }

        // Get all pending bookings for this user
        const pendingBookings = await Booking.find({ userId, paymentStatus: "pending" });

        if (!pendingBookings.length) {
            console.log("🔹 No pending bookings found for rollback.");
            return;
        }

        for (const booking of pendingBookings) {
            const { roomType, checkIn, checkOut, roomsBooked } = booking;

            // Remove booked dates
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

        // Update all "pending" bookings to "cancelled"
        await Booking.updateMany({ userId, paymentStatus: "pending" }, { $set: { paymentStatus: "cancelled" } });

        console.log("✅ rollbackBookings: Successfully rolled back bookings.");
    } catch (error) {
        console.error("🔴 rollbackBookings Error:", error);
    }
};
