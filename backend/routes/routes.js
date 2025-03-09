import express from 'express';
import createOrder from '../controllers/book.js';
import { addToCart, changeMember, deletefromCart, getCart, updateCart } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';
import getRoomAvailability from '../controllers/availabilityController.js';
import { getAllRooms } from '../controllers/roomData.js';
import { getAllTestimonials } from '../controllers/TestimonialController.js';
import Booking from '../models/booking.js';
import { getUserBookings } from '../controllers/bookingController.js';
import sendInvoice from '../controllers/EmailController.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send('Hello! The backend is working.');
});

router.post('/bookroom', verifyToken, createOrder);
router.post('/addToCart', verifyToken, addToCart);
router.get('/getCart',  verifyToken, getCart);
router.post('/updateCart', verifyToken, updateCart);
router.post('/changeQuantity', verifyToken, changeMember);
router.post('/deleteFromCart', verifyToken, deletefromCart);
router.post('/checkAvailability', verifyToken, getRoomAvailability);
router.get('/allRooms', getAllRooms)
router.post('/bookings', verifyToken,getUserBookings);
router.post("/email", sendInvoice)

router.get('/testimonials',getAllTestimonials )
export default router;