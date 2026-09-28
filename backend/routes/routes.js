import express from 'express';
import createOrder from '../controllers/book.js';
import { addToCart, changeMember, deletefromCart, getCart, updateCart } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import getRoomAvailability from '../controllers/availabilityController.js';
import { getAllRooms } from '../controllers/roomData.js';
import { getAllTestimonials } from '../controllers/TestimonialController.js';
import { getUserBookings } from '../controllers/bookingController.js';
import sendInvoice from '../controllers/EmailController.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send('Hello! The backend is working.');
});

router.post('/bookroom', requireAuth, bookingLimiter, createOrder);
router.post('/addToCart', requireAuth, addToCart);
router.get('/getCart',  requireAuth, getCart);
router.post('/updateCart', requireAuth, updateCart);
router.post('/changeQuantity', requireAuth, changeMember);
router.post('/deleteFromCart', requireAuth, deletefromCart);
router.post('/checkAvailability', requireAuth, getRoomAvailability);
router.get('/allRooms', getAllRooms);
router.post('/bookings', requireAuth, getUserBookings);
router.post("/email", requireAuth, sendInvoice);

router.get('/testimonials', getAllTestimonials);
export default router;
