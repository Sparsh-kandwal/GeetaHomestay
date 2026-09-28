import crypto from "crypto";
import Payment from "../models/paymentmodel.js";
import { instance, processPaymentConfirmation } from "./paymentController.js";
import { rollbackBookings } from "../utils/rollbackBookings.js";

/**
 * POST /payment/webhook
 *
 * Razorpay server-to-server webhook handler.
 * Verifies signature using RAZORPAY_WEBHOOK_SECRET (not the API key secret).
 * Handles events: payment.captured, payment.failed, refund.processed.
 *
 * IMPORTANT: This endpoint must receive the raw request body for signature
 * verification. The route is mounted with express.raw() middleware in app.js
 * before express.json() can consume the body.
 *
 * Security:
 *  - No auth middleware (Razorpay cannot authenticate as a user).
 *  - Signature verification replaces user auth.
 *  - Idempotent: uses atomic findOneAndUpdate transitions to prevent
 *    double-processing if Razorpay retries a webhook.
 */
export const razorpayWebhook = async (req, res) => {
  // 1. Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const receivedSignature = req.headers["x-razorpay-signature"];
  if (!receivedSignature) {
    return res.status(400).json({ error: "Missing x-razorpay-signature header" });
  }

  // req.body is a raw Buffer when mounted with express.raw()
  const rawBody = typeof req.body === "string" ? req.body : req.body.toString("utf8");

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(receivedSignature, "hex")
    )
  ) {
    console.warn("Webhook signature verification failed");
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  // 2. Parse the verified payload
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  const eventType = event.event;
  const payload = event.payload;

  console.log(`[Webhook] Received event: ${eventType}`);

  try {
    switch (eventType) {
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "refund.processed":
        await handleRefundProcessed(payload);
        break;

      default:
        // Acknowledge unknown events to prevent Razorpay retries
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error(`[Webhook] Error processing ${eventType}:`, error);
    // Still return 200 to prevent Razorpay retries on server errors.
    // The payment will be in an inconsistent state — logged for manual review.
  }

  // Always respond 200 to Razorpay to acknowledge receipt
  return res.status(200).json({ status: "ok" });
};

/**
 * Handles payment.captured event.
 * This is the critical path — confirms bookings when the user's browser
 * may have closed before the frontend could call /paymentVerification.
 */
async function handlePaymentCaptured(payload) {
  const razorpayPayment = payload.payment?.entity;
  if (!razorpayPayment) {
    console.error("[Webhook] payment.captured: Missing payment entity in payload");
    return;
  }

  const orderId = razorpayPayment.order_id;
  if (!orderId) {
    console.error("[Webhook] payment.captured: Missing order_id in payment entity");
    return;
  }

  // Find the Payment document for this order
  const paymentDoc = await Payment.findOne({ razorpay_order_id: orderId });
  if (!paymentDoc) {
    console.error(
      `[Webhook] payment.captured: No Payment record found for order ${orderId}`
    );
    return;
  }

  // Idempotency: if already processed, skip
  if (paymentDoc.status === "success") {
    console.log(
      `[Webhook] payment.captured: Payment ${orderId} already confirmed — skipping`
    );
    return;
  }

  // Atomic claim: transition from "created" to "processing"
  // If the frontend's paymentVerification already claimed it, this returns null
  const claimedPayment = await Payment.findOneAndUpdate(
    { razorpay_order_id: orderId, status: "created" },
    { $set: { status: "processing" } },
    { new: true }
  );

  if (!claimedPayment) {
    // Another process (frontend verification) already claimed or processed this
    console.log(
      `[Webhook] payment.captured: Payment ${orderId} already claimed (status: ${paymentDoc.status}) — skipping`
    );
    return;
  }

  // Verify and confirm via the shared helper
  const result = await processPaymentConfirmation({
    paymentDoc: claimedPayment,
    razorpayPayment,
    paymentMethod: razorpayPayment.method,
  });

  if (result.success) {
    console.log(
      `[Webhook] payment.captured: Successfully confirmed payment ${razorpayPayment.id} for order ${orderId}`
    );
  } else {
    console.error(
      `[Webhook] payment.captured: Confirmation failed for ${orderId}: ${result.error}`
    );
  }
}

/**
 * Handles payment.failed event.
 * Marks payment as failed and rolls back bookings so inventory is released.
 */
async function handlePaymentFailed(payload) {
  const razorpayPayment = payload.payment?.entity;
  if (!razorpayPayment) {
    console.error("[Webhook] payment.failed: Missing payment entity in payload");
    return;
  }

  const orderId = razorpayPayment.order_id;
  if (!orderId) {
    console.error("[Webhook] payment.failed: Missing order_id in payment entity");
    return;
  }

  const paymentDoc = await Payment.findOne({ razorpay_order_id: orderId });
  if (!paymentDoc) {
    console.error(
      `[Webhook] payment.failed: No Payment record found for order ${orderId}`
    );
    return;
  }

  // Idempotency: skip if already terminal
  if (["failed", "success", "refunded"].includes(paymentDoc.status)) {
    console.log(
      `[Webhook] payment.failed: Payment ${orderId} already in terminal state (${paymentDoc.status}) — skipping`
    );
    return;
  }

  // Mark as failed
  paymentDoc.status = "failed";
  paymentDoc.razorpay_payment_id = razorpayPayment.id;
  paymentDoc.amount = (razorpayPayment.amount || 0) / 100;
  paymentDoc.failureReason =
    razorpayPayment.error_description ||
    razorpayPayment.error_reason ||
    "Payment failed (webhook notification)";
  await paymentDoc.save();

  // Rollback bookings to release inventory
  await rollbackBookings(paymentDoc.user.toString(), {
    bookingId: paymentDoc.bookingId,
  });

  console.log(
    `[Webhook] payment.failed: Payment ${orderId} marked failed, bookings rolled back`
  );
}

/**
 * Handles refund.processed event.
 * Updates the payment status to "refunded" for tracking.
 */
async function handleRefundProcessed(payload) {
  const refundEntity = payload.refund?.entity;
  if (!refundEntity) {
    console.error("[Webhook] refund.processed: Missing refund entity in payload");
    return;
  }

  const paymentId = refundEntity.payment_id;
  if (!paymentId) {
    console.error("[Webhook] refund.processed: Missing payment_id in refund entity");
    return;
  }

  // Atomic update to prevent double-processing
  const result = await Payment.findOneAndUpdate(
    {
      razorpay_payment_id: paymentId,
      status: { $nin: ["refunded"] },
    },
    {
      $set: {
        status: "refunded",
        failureReason: `Refund processed: ${refundEntity.id}, amount: ₹${(refundEntity.amount || 0) / 100}`,
      },
    },
    { new: true }
  );

  if (result) {
    console.log(
      `[Webhook] refund.processed: Payment ${paymentId} marked as refunded (refund: ${refundEntity.id})`
    );

    // Roll back bookings if they were confirmed
    await rollbackBookings(result.user.toString(), {
      bookingId: result.bookingId,
    });
  } else {
    console.log(
      `[Webhook] refund.processed: Payment ${paymentId} already refunded or not found — skipping`
    );
  }
}
