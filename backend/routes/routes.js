import express from 'express';
import createOrder from '../controllers/book.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send('Hello! The backend is working.');
});

router.post('/bookroom', verifyToken, createOrder);
export default router;
