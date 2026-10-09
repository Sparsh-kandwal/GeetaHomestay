import crypto from "crypto";
import Payment from "../models/paymentmodel.js";
import Booking from "../models/booking.js";
import WebhookEvent from "../models/webhookEvent.js";
import { processPaymentConfirmation } from "./paymentController.js";
import { rollbackBookings } from "../utils/rollbackBookings.js";

/**
 * Handles incoming Razorpay Webhooks.
 *
 * IMPORTANT TECHNICAL CONSTRAINT:
 * This endpoint receives the raw unparsed request body (Buffer) via express.raw()
 * before express.json() is applied globally, preserving exact bytes for HMAC signature check.
 *
 * AUTH:
 * No requireAuth middleware is applied. Razorpay's servers call this directly.
 * Authentication is solely via the X-Razorpay-Signature HMAC verification.
 */
export const razorpayWebhook = async (req, res) => {
  // 1. Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const receivedSignature = req.headers["x-razorpay-signature"];
  if (!receivedSignature) {
    console.warn("[Webhook] Missing x-razorpay-signature header");
    return res.status(400).json({ error: "Missing x-razorpay-signature header" });
  }

  // Get raw body as string
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString("utf8")
    : typeof req.body === "string"
    ? req.body
    : JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    console.warn("[Webhook] Invalid webhook signature rejected");
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  // 2. Parse verified payload
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.warn("[Webhook] Failed to parse JSON body");
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  const eventId = event.id || event.event_id;
  const eventType = event.event;
  const payload = event.payload || {};

  console.log(`[Webhook] Valid signature verified for event: ${eventType}, eventId: ${eventId}`);

  // 3. Idempotency check via WebhookEvent collection
  if (eventId) {
    try {
      await WebhookEvent.create({
        eventId,
        eventType,
        status: "processing",
      });
    } catch (err) {
      if (err.code === 11000) {
        console.log(`[Webhook] Duplicate event ${eventId} (${eventType}) already recorded — short-circuiting with 200`);
        return res.status(200).json({ status: "ok", message: "Event already processed" });
      }
      console.error("[Webhook] Error recording WebhookEvent:", err.message);
      return res.status(500).json({ error: "Failed to record webhook event" });
    }
  }

  // 4. Respond 200 quickly once signature is verified and event is queued/recorded
  res.status(200).json({ status: "ok" });

  // 5. Downstream asynchronous processing
  try {
    switch (eventType) {
      case "payment.captured":
        await handlePaymentCaptured(payload, eventId);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload, eventId);
        break;

      case "refund.processed":
        await handleRefundProcessed(payload, eventId);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}, eventId: ${eventId}`);
    }

    if (eventId) {
      await WebhookEvent.updateOne({ eventId }, { $set: { status: "processed" } });
    }
  } catch (error) {
    console.error(`[Webhook] Downstream processing error for ${eventType} (${eventId}):`, error.message);
    if (eventId) {
      await WebhookEvent.updateOne({ eventId }, { $set: { status: "failed" } });
    }
  }
};

/**
 * Handles payment.captured
 * Cross-checks stored Payment record by razorpay_order_id, verifies amount, and confirms bookings.
 */
async function handlePaymentCaptured(payload, eventId) {
  const razorpayPayment = payload.payment?.entity;
  if (!razorpayPayment) {
    console.error(`[Webhook] payment.captured (${eventId}): Missing payment entity in payload`);
    return;
  }

  const orderId = razorpayPayment.order_id;
  if (!orderId) {
    console.error(`[Webhook] payment.captured (${eventId}): Missing order_id in payment entity`);
    return;
  }

  // Look up Payment document for this order
  const paymentDoc = await Payment.findOne({ razorpay_order_id: orderId });
  if (!paymentDoc) {
    console.error(`[Webhook] payment.captured (${eventId}): No Payment record found for order ${orderId}`);
    return;
  }

  // Idempotency: if already confirmed by frontend, treat as no-op success
  if (paymentDoc.status === "success") {
    console.log(`[Webhook] payment.captured (${eventId}): Payment ${orderId} already confirmed — no-op success`);
    return;
  }

  // Strict check: expectedAmount must match captured amount (in paise)
  const expectedPaise = Math.round(paymentDoc.expectedAmount * 100);
  if (razorpayPayment.amount !== expectedPaise) {
    console.error(
      `[Webhook] payment.captured (${eventId}): Amount mismatch for order ${orderId}. Expected ${expectedPaise} paise, received ${razorpayPayment.amount} paise`
    );
    paymentDoc.status = "failed";
    paymentDoc.razorpay_payment_id = razorpayPayment.id;
    paymentDoc.amount = (razorpayPayment.amount || 0) / 100;
    paymentDoc.failureReason = `Webhook captured amount mismatch: expected ${expectedPaise} paise, got ${razorpayPayment.amount} paise`;
    await paymentDoc.save();
    return;
  }

  // Atomic claim: transition from "created" to "processing"
  const claimedPayment = await Payment.findOneAndUpdate(
    { razorpay_order_id: orderId, status: "created" },
    { $set: { status: "processing" } },
    { new: true }
  );

  if (!claimedPayment) {
    const recheck = await Payment.findOne({ razorpay_order_id: orderId });
    if (recheck?.status === "success") {
      console.log(`[Webhook] payment.captured (${eventId}): Payment ${orderId} already confirmed by frontend — no-op success`);
      return;
    }
    console.log(`[Webhook] payment.captured (${eventId}): Payment ${orderId} in state '${recheck?.status}' — skipping`);
    return;
  }

  // Confirm bookings and payment via the shared helper
  const result = await processPaymentConfirmation({
    paymentDoc: claimedPayment,
    razorpayPayment,
    paymentMethod: razorpayPayment.method,
  });

  if (result.success) {
    console.log(
      `[Webhook] payment.captured (${eventId}): Confirmed booking for order ${orderId}, paymentId: ${razorpayPayment.id}`
    );
  } else {
    console.error(
      `[Webhook] payment.captured (${eventId}): Confirmation failed for order ${orderId}: ${result.error}`
    );
  }
}

/**
 * Handles payment.failed
 * Marks payment as failed and rolls back associated pending bookings.
 */
async function handlePaymentFailed(payload, eventId) {
  const razorpayPayment = payload.payment?.entity;
  if (!razorpayPayment) {
    console.error(`[Webhook] payment.failed (${eventId}): Missing payment entity in payload`);
    return;
  }

  const orderId = razorpayPayment.order_id;
  if (!orderId) {
    console.error(`[Webhook] payment.failed (${eventId}): Missing order_id in payment entity`);
    return;
  }

  const paymentDoc = await Payment.findOne({ razorpay_order_id: orderId });
  if (!paymentDoc) {
    console.error(`[Webhook] payment.failed (${eventId}): No Payment record found for order ${orderId}`);
    return;
  }

  // Idempotency: skip if already terminal
  if (["failed", "success", "refunded"].includes(paymentDoc.status)) {
    console.log(
      `[Webhook] payment.failed (${eventId}): Payment ${orderId} already in terminal state '${paymentDoc.status}' — skipping`
    );
    return;
  }

  paymentDoc.status = "failed";
  paymentDoc.razorpay_payment_id = razorpayPayment.id;
  paymentDoc.amount = (razorpayPayment.amount || 0) / 100;
  paymentDoc.failureReason =
    razorpayPayment.error_description ||
    razorpayPayment.error_reason ||
    "Payment failed (webhook notification)";
  await paymentDoc.save();

  // Roll back pending bookings to release dates
  await rollbackBookings(paymentDoc.user.toString(), {
    bookingId: paymentDoc.bookingId,
  });

  console.log(
    `[Webhook] payment.failed (${eventId}): Payment ${orderId} marked failed, bookings rolled back`
  );
}

/**
 * Handles refund.processed
 * Updates Payment status to "refunded" and links booking status.
 * If stay has already passed, does not re-free booked dates; flags for review.
 */
async function handleRefundProcessed(payload, eventId) {
  const refundEntity = payload.refund?.entity;
  if (!refundEntity) {
    console.error(`[Webhook] refund.processed (${eventId}): Missing refund entity in payload`);
    return;
  }

  const paymentId = refundEntity.payment_id;
  if (!paymentId) {
    console.error(`[Webhook] refund.processed (${eventId}): Missing payment_id in refund entity`);
    return;
  }

  const paymentDoc = await Payment.findOne({ razorpay_payment_id: paymentId });
  if (!paymentDoc) {
    console.error(`[Webhook] refund.processed (${eventId}): No Payment record found for paymentId ${paymentId}`);
    return;
  }

  if (paymentDoc.status === "refunded") {
    console.log(`[Webhook] refund.processed (${eventId}): Payment ${paymentId} already marked refunded — skipping`);
    return;
  }

  paymentDoc.status = "refunded";
  paymentDoc.failureReason = `Refund processed: ${refundEntity.id}, amount: ₹${(refundEntity.amount || 0) / 100}`;

  const bookings = await Booking.find({
    $or: [{ bookingId: paymentDoc.bookingId }, { _id: paymentDoc.bookingId }],
  });

  const now = new Date();
  const hasPastStay = bookings.some((b) => new Date(b.checkOut) < now);

  if (hasPastStay) {
    // Stay has passed: do not re-free booked dates, flag for review
    paymentDoc.failureReason += " (Stay already completed; dates preserved, flagged for review)";
    await paymentDoc.save();
    await Booking.updateMany(
      { $or: [{ bookingId: paymentDoc.bookingId }, { _id: paymentDoc.bookingId }] },
      { $set: { paymentStatus: "refunded" } }
    );
    console.log(
      `[Webhook] refund.processed (${eventId}): Stay completed for booking ${paymentDoc.bookingId}. Status set to refunded without releasing dates.`
    );
  } else {
    // Future stay: mark booking refunded and release inventory
    await paymentDoc.save();
    await Booking.updateMany(
      { $or: [{ bookingId: paymentDoc.bookingId }, { _id: paymentDoc.bookingId }] },
      { $set: { paymentStatus: "refunded" } }
    );
    await rollbackBookings(paymentDoc.user.toString(), {
      bookingId: paymentDoc.bookingId,
    });
    console.log(
      `[Webhook] refund.processed (${eventId}): Future booking ${paymentDoc.bookingId} marked refunded, dates rolled back.`
    );
  }
}
