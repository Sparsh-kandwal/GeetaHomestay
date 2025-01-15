// backend/routes/routes.js

import express from 'express';
import { googleAuth, getMyProfile, updateProfile, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import createOrder from '../controllers/book.js';
import { addToCart, changeMember, deletefromCart, getCart, updateCart } from '../controllers/cartController.js';
import getRoomAvailability from '../controllers/availabilityController.js';
import { getAllRooms } from '../controllers/roomData.js';
import { getAllTestimonials } from '../controllers/TestimonialController.js';
import { getUserBookings } from '../controllers/bookingController.js';

const router = express.Router();

// Status Endpoint
router.get('/status', (req, res) => {
    res.send('Hello! The backend is working.');
});


// Booking Routes
router.post('/bookroom', verifyToken, createOrder);
router.get('/bookings', verifyToken, getUserBookings);

// Cart Routes
router.post('/addToCart', verifyToken, addToCart);
router.get('/getCart', verifyToken, getCart);
router.post('/updateCart', verifyToken, updateCart);
router.post('/checkAvailability', getRoomAvailability);
router.get('/allRooms', getAllRooms)
router.get('/testimonials',getAllTestimonials )
export default router;
