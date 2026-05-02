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
  const { userId, bookingId } = req.body;
  await rollbackBookings(userId, { bookingId });
  res.status(200).json({ success: true });
};
