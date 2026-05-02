import Razorpay from "razorpay";
import crypto from "crypto";
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      amount,
      bookingId,
    } = req.body;

    userIdForRollback = userId;
    bookingIdForRollback = bookingId;

    const pendingQuery = { userId, paymentStatus: "pending" };
    if (bookingId) {
      pendingQuery.bookingId = bookingId;
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
    const { paymentId, userId, bookingId } = req.body;

    if (!paymentId || !userId) {
      return res.status(400).json({ success: false, message: "Missing paymentId or userId" });
    }

    const payment = await instance.payments.fetch(paymentId);

    if (payment.status === "captured") {
      const pendingQuery = { userId, paymentStatus: "pending" };
      if (bookingId) {
        pendingQuery.bookingId = bookingId;
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
      await rollbackBookings(userId, { bookingId });
      return res.status(400).json({ success: false, message: "Payment failed, booking rolled back" });
    }

    return res.status(200).json({ success: false, message: "Payment still pending" });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
