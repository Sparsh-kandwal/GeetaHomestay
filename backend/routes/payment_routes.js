import express from 'express';
import { checkout, checkPaymentStatus, getKey, paymentVerification } from '../controllers/paymentController.js';
import { bookingFailed } from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post("/checkout", requireAuth, paymentLimiter, checkout)
router.post("/paymentVerification", requireAuth, paymentLimiter, paymentVerification)
router.get("/getKey", getKey)
router.post("/rollbackBooking", requireAuth, paymentLimiter, bookingFailed)
router.post("/checkPaymentStatus", requireAuth, paymentLimiter, checkPaymentStatus)

export default router