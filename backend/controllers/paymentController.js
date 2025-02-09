import Razorpay from "razorpay"
import crypto from 'crypto'
import Payment from "../models/paymentmodel.js";
import Booking from "../models/booking.js";
import Cart_item from "../models/cart.js";
import { rollbackBookings } from "../utils/rollbackBookings.js";

const instance = new Razorpay({
  key_id : process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



export const checkout = async (req, res) => {
  try {
   
    const options = {
      amount: Number(req.body.amount )* 100, // Razorpay expects the amount in paise (100 paise = 1 INR)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    // Create order
    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      order
    }) 

  } catch (error) {
    res.status(500).json({ error: error.message });
  }


};




export const paymentVerification = async (req, res) => {

  let bookingFailed = false;

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = req.body;


    const body = razorpay_order_id + "|" + razorpay_payment_id;


    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      bookingFailed = true
    }

    const payment = new Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user: userId,
      amount,
      status: "success",
    });

    await payment.save();

    await Booking.updateMany(
      { userId, paymentStatus: "pending" },
      { $set: { paymentStatus: "confirmed" } }
    );



    await Cart_item.deleteMany({ userId });

    res.status(200).json({ success: true, message: "Payment verified successfully" });

  } catch (error) {
    bookingFailed = true
    console.error("Payment Verification Error:", error);
  }

  if (bookingFailed) {
    await rollbackBookings(userId);
  }


};


export const getKey = (req,res)=>{
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID
  })
}
