// backend/controllers/bookingController.js

import Booking from '../models/booking.js';

// Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user is set by auth middleware

    const bookings = await Booking.find({ userId });
    console.log(bookings)
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};