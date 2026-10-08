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
    console.log("[bookingFailed] === START /payment/rollbackBooking ===");
    console.log("[bookingFailed] req.body:", JSON.stringify(req.body));
    console.log("[bookingFailed] req.user:", JSON.stringify(req.user));

    const userId = req.user.id;
    const { bookingId } = req.body;

    if (!bookingId) {
      console.warn("[bookingFailed] FAIL: Missing bookingId in request body");
      return res.status(400).json({ success: false, message: "Missing bookingId" });
    }
    console.log("[bookingFailed] bookingId to rollback:", bookingId);

    // Support looking up by either the individual document _id or the group bookingId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(bookingId);
    console.log("[bookingFailed] isValidObjectId:", isValidObjectId);
    const query = isValidObjectId
      ? { $or: [{ bookingId }, { _id: bookingId }], paymentStatus: "pending" }
      : { bookingId, paymentStatus: "pending" };
    console.log("[bookingFailed] DB query:", JSON.stringify(query));

    // Ownership check: fetch the booking(s) by bookingId/_id and verify
    // the authenticated user actually owns them before rolling back.
    const bookings = await Booking.find(query);
    console.log("[bookingFailed] Found %d matching bookings", bookings?.length || 0);

    if (bookings.length === 0) {
      console.warn("[bookingFailed] FAIL: No pending booking found with this ID");
      return res.status(404).json({ success: false, message: "No pending booking found with this ID" });
    }

    // Every booking doc grouped under this bookingId must belong to the requester
    const ownerUserId = bookings[0].userId.toString();
    console.log("[bookingFailed] Ownership check: booking.userId=%s, req.user.id=%s, match=%s",
      ownerUserId, userId, ownerUserId === userId);

    if (ownerUserId !== userId) {
      console.warn("[bookingFailed] FAIL: IDOR blocked — requester is not the booking owner");
      return res.status(403).json({ success: false, message: "You are not authorized to cancel this booking" });
    }

    // Always use the group bookingId so all room items from the checkout order are rolled back
    const groupBookingId = bookings[0].bookingId;
    console.log("[bookingFailed] Rolling back groupBookingId:", groupBookingId);
    await rollbackBookings(userId, { bookingId: groupBookingId });

    console.log("[bookingFailed] === SUCCESS: Booking rollback complete ===");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[bookingFailed] === UNCAUGHT ERROR ===");
    console.error("[bookingFailed] Error name:", error.name);
    console.error("[bookingFailed] Error message:", error.message);
    console.error("[bookingFailed] Error stack:", error.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
