import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/paymentmodel.js";
import Booking from "../models/booking.js";
import Cart_item from "../models/cart.js";
import { rollbackBookings } from "../utils/rollbackBookings.js";
import { sendInvoiceForBookingId } from "./EmailController.js";

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Shared confirmation function between paymentVerification and checkPaymentStatus.
 * Confirms bookings only when payment amount matches expected amount exactly,
 * marks Payment record with final state, and triggers invoice email on state change.
 */
export const processPaymentConfirmation = async ({
  paymentDoc,
  razorpayPayment,
  signature = null,
  paymentMethod = null,
}) => {
  const expectedPaise = Math.round(paymentDoc.expectedAmount * 100);

  // Strict verification of Razorpay payment payload
  if (
    razorpayPayment.order_id !== paymentDoc.razorpay_order_id ||
    razorpayPayment.currency !== "INR" ||
    (razorpayPayment.status !== "captured" && razorpayPayment.status !== "authorized") ||
    razorpayPayment.amount !== expectedPaise
  ) {
    paymentDoc.status = "failed";
    paymentDoc.razorpay_payment_id = razorpayPayment.id;
    if (signature) paymentDoc.razorpay_signature = signature;
    paymentDoc.amount = (razorpayPayment.amount || 0) / 100;
    paymentDoc.failureReason = `Payment details mismatch: order=${razorpayPayment.order_id}, status=${razorpayPayment.status}, amount=${razorpayPayment.amount} (expected ${expectedPaise})`;
    await paymentDoc.save();
    return {
      success: false,
      status: 400,
      error: "Payment verification failed: payment details mismatch",
    };
  }

  // Atomic update of bookings conditioned on paymentStatus: "pending"
  const confirmResult = await Booking.updateMany(
    {
      $or: [{ bookingId: paymentDoc.bookingId }, { _id: paymentDoc.bookingId }],
      userId: paymentDoc.user,
      paymentStatus: "pending",
    },
    { $set: { paymentStatus: "confirmed" } }
  );

  // If bookings are no longer pending (e.g. rolled back/cancelled after 5 min),
  // do NOT silently confirm. Mark for manual review/refund.
  if (confirmResult.modifiedCount === 0) {
    paymentDoc.status = "needs_review";
    paymentDoc.razorpay_payment_id = razorpayPayment.id;
    if (signature) paymentDoc.razorpay_signature = signature;
    paymentDoc.amount = razorpayPayment.amount / 100;
    paymentDoc.failureReason =
      "Valid payment captured but matching bookings were no longer in pending status";
    await paymentDoc.save();
    console.error(
      `CRITICAL: Booking ${paymentDoc.bookingId} was not pending but received valid payment ${razorpayPayment.id}. Status set to needs_review.`
    );
    return {
      success: false,
      status: 409,
      error: "Booking is no longer pending (expired or cancelled). Payment held for review/refund.",
    };
  }

  // Success path
  paymentDoc.status = "success";
  paymentDoc.razorpay_payment_id = razorpayPayment.id;
  if (signature) paymentDoc.razorpay_signature = signature;
  paymentDoc.amount = razorpayPayment.amount / 100;
  paymentDoc.payment_method = paymentMethod || razorpayPayment.method || "card";
  await paymentDoc.save();

  // Send invoice email only because modifiedCount > 0
  try {
    await sendInvoiceForBookingId(paymentDoc.bookingId);
  } catch (emailError) {
    console.error(
      `Failed to send invoice for booking ${paymentDoc.bookingId}:`,
      emailError.message
    );
  }

  await Cart_item.deleteMany({ userId: paymentDoc.user });

  return {
    success: true,
    status: 200,
    paymentId: razorpayPayment.id,
  };
};

export const checkout = async (req, res) => {
  try {
    console.log("[checkout] === START /payment/checkout ===");
    console.log("[checkout] req.body:", JSON.stringify(req.body));
    console.log("[checkout] req.user:", JSON.stringify(req.user));

    const userId = req.user?.id;
    if (!userId) {
      console.log("[checkout] FAIL: No userId in req.user");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    console.log("[checkout] userId:", userId);

    const { bookingId } = req.body;
    if (!bookingId) {
      console.log("[checkout] FAIL: Missing bookingId in request body");
      return res.status(400).json({ success: false, message: "Missing bookingId" });
    }
    console.log("[checkout] bookingId:", bookingId);

    // Lookup pending bookings for the bookingId (supports document _id or group bookingId)
    const isValidObjectId = mongoose.Types.ObjectId.isValid(bookingId);
    console.log("[checkout] isValidObjectId:", isValidObjectId);

    const query = isValidObjectId
      ? { $or: [{ bookingId }, { _id: bookingId }], paymentStatus: "pending" }
      : { bookingId, paymentStatus: "pending" };
    console.log("[checkout] DB query:", JSON.stringify(query));

    const pendingBookings = await Booking.find(query);
    console.log("[checkout] pendingBookings found:", pendingBookings?.length || 0);

    if (!pendingBookings || pendingBookings.length === 0) {
      console.log("[checkout] FAIL: No pending bookings found for bookingId:", bookingId);
      return res
        .status(404)
        .json({ success: false, message: "No pending bookings found for this ID" });
    }

    // Verify ownership
    const bookingUserId = pendingBookings[0].userId.toString();
    console.log("[checkout] Ownership check: booking.userId=%s, req.user.id=%s, match=%s",
      bookingUserId, userId, bookingUserId === userId);

    if (bookingUserId !== userId) {
      console.log("[checkout] FAIL: Ownership mismatch — blocking checkout");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to checkout this booking",
      });
    }

    const groupBookingId = pendingBookings[0].bookingId;
    console.log("[checkout] groupBookingId:", groupBookingId);

    // Server-side calculation of total from DB records (never trust client)
    const individualAmounts = pendingBookings.map(b => ({
      roomType: b.roomType,
      totalAmount: b.totalAmount,
      discount: b.discount,
    }));
    console.log("[checkout] Individual booking amounts:", JSON.stringify(individualAmounts));

    const expectedAmount = Math.round(
      pendingBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    );
    console.log("[checkout] expectedAmount (INR):", expectedAmount);

    if (isNaN(expectedAmount) || expectedAmount <= 0) {
      console.log("[checkout] FAIL: Invalid expectedAmount:", expectedAmount);
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking total amount" });
    }

    // Amount in paise: integer guaranteed
    const amountInPaise = Math.round(expectedAmount * 100);
    console.log("[checkout] amountInPaise:", amountInPaise);

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId,
        bookingId: groupBookingId.toString(),
      },
    };
    console.log("[checkout] Razorpay order options:", JSON.stringify(options));

    console.log("[checkout] Creating Razorpay order...");
    const order = await instance.orders.create(options);
    console.log("[checkout] Razorpay order created:", JSON.stringify({
      id: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
    }));

    // Persist Payment record in "created" status linked to order, user, booking, and expectedAmount
    console.log("[checkout] Persisting Payment record...");
    const paymentRecord = await Payment.create({
      razorpay_order_id: order.id,
      user: userId,
      bookingId: groupBookingId,
      expectedAmount,
      currency: "INR",
      status: "created",
      receipt,
    });
    console.log("[checkout] Payment record created: _id=%s, razorpay_order_id=%s",
      paymentRecord._id, paymentRecord.razorpay_order_id);

    console.log("[checkout] === SUCCESS — returning order to client ===");
    res.status(200).json({
      success: true,
      order,
      expectedAmount,
    });
  } catch (error) {
    console.error("[checkout] === UNCAUGHT ERROR ===");
    console.error("[checkout] Error name:", error.name);
    console.error("[checkout] Error message:", error.message);
    console.error("[checkout] Error stack:", error.stack);
    if (error.response) {
      console.error("[checkout] Razorpay API error response:", JSON.stringify(error.response));
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const paymentVerification = async (req, res) => {
  let claimedPayment = null;

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required payment verification parameters",
      });
    }

    // 1. Verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    // 2. Atomic claim of the Payment record
    claimedPayment = await Payment.findOneAndUpdate(
      { razorpay_order_id, user: userId, status: "created" },
      { $set: { status: "processing" } },
      { new: true }
    );

    if (!claimedPayment) {
      const existing = await Payment.findOne({ razorpay_order_id, user: userId });
      if (existing && existing.status === "success") {
        return res
          .status(409)
          .json({ success: false, error: "Payment has already been processed" });
      }
      return res.status(409).json({
        success: false,
        error: "Payment cannot be processed (already processed, in progress, or unauthorized)",
      });
    }

    // 3. Fetch payment details from Razorpay API
    const razorpayPayment = await instance.payments.fetch(razorpay_payment_id);

    // 4. Confirm payment and bookings via shared helper
    const result = await processPaymentConfirmation({
      paymentDoc: claimedPayment,
      razorpayPayment,
      signature: razorpay_signature,
      paymentMethod: razorpayPayment.method,
    });

    if (!result.success) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Verified Successfully",
      paymentId: result.paymentId,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    if (claimedPayment && claimedPayment.status === "processing") {
      claimedPayment.status = "failed";
      claimedPayment.failureReason = error.message;
      await claimedPayment.save().catch(() => {});
    }
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { paymentId, bookingId } = req.body;

    if (!paymentId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: !paymentId ? "Missing paymentId" : "Missing bookingId",
      });
    }

    // 1. Fetch booking from DB first (supports either group bookingId or document _id)
    const query = mongoose.Types.ObjectId.isValid(bookingId)
      ? { $or: [{ bookingId }, { _id: bookingId }] }
      : { bookingId };
    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 2. Ownership check strictly before any external Razorpay call
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to check payment status for this booking",
      });
    }

    const targetBookingId = booking.bookingId;

    // 3. Fetch payment from Razorpay API
    const razorpayPayment = await instance.payments.fetch(paymentId);

    // 4. Verify payment belongs to the order created for this booking and user
    const paymentDoc = await Payment.findOne({
      razorpay_order_id: razorpayPayment.order_id,
      user: userId,
    });

    if (!paymentDoc || paymentDoc.bookingId.toString() !== targetBookingId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to this booking order",
      });
    }

    // If already confirmed
    if (paymentDoc.status === "success") {
      return res.status(200).json({ success: true, message: "Payment already confirmed" });
    }

    if (razorpayPayment.status === "captured") {
      // Atomic claim to transition from "created" to "processing"
      const claimedPayment = await Payment.findOneAndUpdate(
        { _id: paymentDoc._id, status: "created" },
        { $set: { status: "processing" } },
        { new: true }
      );

      if (!claimedPayment) {
        if (paymentDoc.status === "processing") {
          return res.status(409).json({ success: false, message: "Payment is currently being processed" });
        }
        return res.status(409).json({ success: false, message: `Payment is already ${paymentDoc.status}` });
      }

      const result = await processPaymentConfirmation({
        paymentDoc: claimedPayment,
        razorpayPayment,
        paymentMethod: razorpayPayment.method,
      });

      if (!result.success) {
        return res.status(result.status).json({ success: false, message: result.error });
      }

      return res.status(200).json({ success: true, message: "Payment confirmed" });
    }

    if (razorpayPayment.status === "failed") {
      paymentDoc.status = "failed";
      paymentDoc.failureReason = "Razorpay payment status marked as failed";
      await paymentDoc.save();
      await rollbackBookings(userId, { bookingId: targetBookingId });
      return res.status(400).json({ success: false, message: "Payment failed, booking rolled back" });
    }

    return res.status(200).json({ success: false, message: "Payment still pending" });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
