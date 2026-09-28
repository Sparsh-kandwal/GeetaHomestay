import express from 'express';
import { checkout, checkPaymentStatus, getKey, paymentVerification } from '../controllers/paymentController.js';
import { bookingFailed } from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.post("/checkout", requireAuth, checkout)
router.post("/paymentVerification", requireAuth, paymentVerification)
router.get("/getKey", getKey)
router.post("/rollbackBooking", requireAuth, bookingFailed)
router.post("/checkPaymentStatus", requireAuth, checkPaymentStatus)

export default router