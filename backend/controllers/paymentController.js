import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/paymentmodel.js";
import Booking from "../models/booking.js";
import Cart_item from "../models/cart.js";
import { rollbackBookings } from "../utils/rollbackBookings.js";
import { sendInvoiceForBookingId } from "./EmailController.js";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const paymentVerification = async (req, res) => {
  let bookingFailed = false;
  let userIdForRollback;
  let bookingIdForRollback;

  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      bookingId,
    } = req.body;

    userIdForRollback = userId;
    let targetBookingId = bookingId;

    // Ownership check: if a bookingId is supplied, verify the
    // authenticated user actually owns those booking docs in the DB.
    // Supports either group bookingId or document _id.
    if (bookingId) {
      const query = mongoose.Types.ObjectId.isValid(bookingId)
        ? { $or: [{ bookingId }, { _id: bookingId }] }
        : { bookingId };
      const ownershipCheck = await Booking.findOne(query);
      if (!ownershipCheck) {
        return res.status(404).json({ success: false, error: "Booking not found" });
      }
      if (ownershipCheck.userId.toString() !== userId) {
        return res.status(403).json({ success: false, error: "You are not authorized to verify payment for this booking" });
      }
      targetBookingId = ownershipCheck.bookingId;
    }
    bookingIdForRollback = targetBookingId;

    const pendingQuery = { userId, paymentStatus: "pending" };
    if (targetBookingId) {
      pendingQuery.bookingId = targetBookingId;
    }

    const pendingBookings = await Booking.find(pendingQuery);
    const bookingIds = [...new Set(pendingBookings.map((booking) => String(booking.bookingId)))];

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      bookingFailed = true;
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    const payment = new Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user: userId,
      amount: amount / 100,
      status: "success",
    });

    await payment.save();

    await Booking.updateMany(pendingQuery, {
      $set: { paymentStatus: "confirmed" },
    });

    for (const groupedBookingId of bookingIds) {
      try {
        await sendInvoiceForBookingId(groupedBookingId);
      } catch (emailError) {
        console.error(`Failed to send invoice for booking ${groupedBookingId}:`, emailError.message);
      }
    }

    await Cart_item.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Payment Verified Successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    bookingFailed = true;
    console.error("Payment Verification Error:", error);
  }

  if (bookingFailed) {
    await rollbackBookings(userIdForRollback, { bookingId: bookingIdForRollback });
    return res.status(500).json({ success: false, error: "Payment verification failed" });
  }
};

export const getKey = (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId, bookingId } = req.body;

    if (!paymentId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: !paymentId ? "Missing paymentId" : "Missing bookingId",
      });
    }

    // 1. Fetch the booking from the DB first (supports either group bookingId or document _id)
    const query = mongoose.Types.ObjectId.isValid(bookingId)
      ? { $or: [{ bookingId }, { _id: bookingId }] }
      : { bookingId };
    const booking = await Booking.findOne(query);

    // 2. If no booking is found, return 404
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 3. Compare booking's real owner (userId) against req.user.id —
    // return 403 immediately and do NOT proceed to any Razorpay call if mismatch
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to check payment status for this booking",
      });
    }

    const targetBookingId = booking.bookingId;

    // 4. Only after ownership is confirmed, proceed with the Razorpay API call
    const payment = await instance.payments.fetch(paymentId);

    if (payment.status === "captured") {
      const pendingQuery = { userId, paymentStatus: "pending" };
      if (targetBookingId) {
        pendingQuery.bookingId = targetBookingId;
      }

      const pendingBookings = await Booking.find(pendingQuery);
      const bookingIds = [...new Set(pendingBookings.map((booking) => String(booking.bookingId)))];

      await Booking.updateMany(pendingQuery, {
        $set: { paymentStatus: "confirmed" },
      });

      for (const groupedBookingId of bookingIds) {
        try {
          await sendInvoiceForBookingId(groupedBookingId);
        } catch (emailError) {
          console.error(`Failed to send invoice for booking ${groupedBookingId}:`, emailError.message);
        }
      }

      return res.status(200).json({ success: true, message: "Payment confirmed" });
    }

    if (payment.status === "failed") {
      await rollbackBookings(userId, { bookingId: targetBookingId });
      return res.status(400).json({ success: false, message: "Payment failed, booking rolled back" });
    }

    return res.status(200).json({ success: false, message: "Payment still pending" });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
