import express from 'express';
import createOrder from '../controllers/book.js';
import { addToCart, getCart, updateCart } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';
import getRoomAvailability from '../controllers/availabilityController.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send('Hello! The backend is working.');
});

router.post('/bookroom', verifyToken, createOrder);
router.post('/addToCart', verifyToken, addToCart);
router.get('/getCart',  verifyToken, getCart);
router.post('/updateCart', verifyToken, updateCart);
router.post('/checkAvailability', getRoomAvailability);
export default router;
