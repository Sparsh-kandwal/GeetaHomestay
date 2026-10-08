import mongoose from "mongoose";
import Booking from "../models/booking.js";
import User from "../models/user.js";
import { transporter } from "../utils/MailClient.js";
import { InvoiceTemplate } from "../constants/InvoiceTemplate.js";

export const sendInvoiceForBookingId = async (bookingId) => {
  console.log("[sendInvoiceForBookingId] === START for bookingId:", bookingId);
  const isValidObjectId = mongoose.Types.ObjectId.isValid(bookingId);
  const query = isValidObjectId
    ? { $or: [{ bookingId }, { _id: bookingId }], paymentStatus: "confirmed" }
    : { bookingId, paymentStatus: "confirmed" };

  console.log("[sendInvoiceForBookingId] Querying confirmed bookings:", JSON.stringify(query));
  const bookings = await Booking.find(query);
  if (bookings.length === 0) {
    console.error("[sendInvoiceForBookingId] FAIL: No confirmed bookings found for bookingId:", bookingId);
    const error = new Error("No confirmed bookings found for this ID");
    error.code = "BOOKINGS_NOT_CONFIRMED";
    throw error;
  }

  if (bookings.every((booking) => booking.emailSent)) {
    console.log("[sendInvoiceForBookingId] Invoices already sent for all bookings. Skipping.");
    return { alreadySent: true };
  }

  const user = await User.findById(bookings[0].userId);
  if (!user) {
    console.error("[sendInvoiceForBookingId] FAIL: User not found for userId:", bookings[0].userId);
    const error = new Error("User not found");
    error.code = "USER_NOT_FOUND";
    throw error;
  }
  console.log("[sendInvoiceForBookingId] Sending invoice email to user:", user.email);

  const actualGroupBookingId = bookings[0].bookingId;

  const invoiceData = {
    bookingId: actualGroupBookingId,
    userEmail: user.email,
    userName: user.userName || "Guest",
    totalAmount: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
    bookings: bookings.map(({ roomType, checkIn, checkOut, totalAmount }) => ({
      roomType,
      checkIn: new Date(checkIn).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      checkOut: new Date(checkOut).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      amount: totalAmount,
    })),
  };
  const emailContent = InvoiceTemplate(invoiceData);

  await transporter.sendMail({
    from: '"Geeta Home Stay" <geetahomestaykpg@gmail.com>',
    to: user.email,
    subject: "Booking Confirmation & Invoice",
    text: "Thank you for choosing us",
    html: emailContent,
  });

  await transporter.sendMail({
    from: '"Geeta Home Stay" <geetahomestaykpg@gmail.com>',
    to: "geetahomestaykpg@gmail.com",
    subject: "Booking Confirmation & Invoice",
    text: "Thank you for choosing us",
    html: emailContent,
  });

  await Booking.updateMany({ bookingId: actualGroupBookingId }, { $set: { emailSent: true } });

  console.log("Invoice sent successfully to:", user.email);
  return { alreadySent: false, email: user.email };
};

const sendInvoice = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    const query = mongoose.Types.ObjectId.isValid(bookingId)
      ? { $or: [{ bookingId }, { _id: bookingId }], paymentStatus: "confirmed" }
      : { bookingId, paymentStatus: "confirmed" };

    const bookings = await Booking.find(query);
    if (bookings.length === 0) {
      return res.status(409).json({ error: "Booking is not confirmed yet" });
    }

    // Verify ownership: user must own this booking
    if (bookings[0].userId.toString() !== userId) {
      return res.status(403).json({ error: "You are not authorized to view or send this booking invoice" });
    }

    const result = await sendInvoiceForBookingId(bookings[0].bookingId);

    return res.status(200).json({
      message: result.alreadySent ? "Invoice already sent" : "Invoice sent successfully",
      alreadySent: result.alreadySent,
    });
  } catch (error) {
    console.error("Error:", error.message);

    if (error.code === "BOOKINGS_NOT_CONFIRMED") {
      return res.status(409).json({ error: "Booking is not confirmed yet" });
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(500).json({ error: "Failed to send invoice email" });
  }
};

export default sendInvoice;
