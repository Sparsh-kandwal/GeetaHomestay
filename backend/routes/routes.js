import express from 'express';
import createOrder from '../controllers/book.js';
import { addToCart, changeQuantity, getCart, updateCart } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';
import getRoomAvailability from '../controllers/availabilityController.js';
import { getAllRooms } from '../controllers/roomData.js';
import { getAllTestimonials } from '../controllers/TestimonialController.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send('Hello! The backend is working.');
});

router.post('/bookroom', verifyToken, createOrder);
router.post('/addToCart', verifyToken, addToCart);
router.get('/getCart',  verifyToken, getCart);
router.post('/updateCart', verifyToken, updateCart);
router.post('/changeQuantity', verifyToken, changeQuantity)
router.post('/checkAvailability', getRoomAvailability);
router.get('/allRooms', getAllRooms)
router.get('/testimonials',getAllTestimonials )
export default router;
