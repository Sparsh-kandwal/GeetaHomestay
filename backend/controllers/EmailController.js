import Booking from "../models/booking.js";
import User from "../models/user.js";
import { transporter } from "../utils/MailClient.js";
import { InvoiceTemplate } from "../constants/InvoiceTemplate.js";

const sendInvoice = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Step 1: Find all bookings with this bookingId
    const bookings = await Booking.find({ bookingId, paymentStatus: "confirmed" });
    if (bookings.length === 0) {
      return res.status(404).json({ error: "No bookings found for this ID" });
    }

    if (bookings.some((b) => b.emailSent)) {
      return res.status(400).json({ error: "Invoice already sent" });
    }

    // Step 2: Find the user using the userId from the first booking
    const user = await User.findById(bookings[0].userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", user);

    const invoiceData = {
      bookingId,
      userEmail: user.email,
      userName: user.userName || "Guest",
      totalAmount: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
      bookings: bookings.map(({ roomType, checkIn, checkOut, totalAmount }) => ({
        roomType,
        checkIn: new Date(checkIn).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }), 
        checkOut: new Date(checkOut).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }), 
        amount: totalAmount,
      })),
    };
    const emailContent = InvoiceTemplate(invoiceData);

    await transporter.sendMail({
      from: '"Geeta Home Stay" <geetahomestaykaranprayag@gmail.com>',
      to: user.email,
      subject: "Booking Confirmation & Invoice",
      text: `Thankyou for choosing us`,
      html: emailContent,
    });

    await Booking.updateMany({ bookingId }, { $set: { emailSent: true } });

    console.log("Invoice sent successfully to:", user.email);
    res.status(200).json({ message: "Invoice sent successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to send invoice email" });
  }
};

export default sendInvoice;
