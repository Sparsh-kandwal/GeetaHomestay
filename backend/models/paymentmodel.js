import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true,
    },
    razorpay_payment_id: {
      type: String,
      required: false,
    },
    razorpay_signature: {
      type: String,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    expectedAmount: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: false,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "processing", "success", "failed", "refunded", "needs_review"],
      default: "created",
    },
    payment_method: {
      type: String,
    },
    receipt: {
      type: String,
    },
    failureReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index(
  { razorpay_payment_id: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpay_payment_id: { $type: "string" } },
  }
);
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ user: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
