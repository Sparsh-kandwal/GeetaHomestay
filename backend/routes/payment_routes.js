import express from 'express';
import { checkout, checkPaymentStatus, getKey, paymentVerification } from '../controllers/paymentController.js';
import { bookingFailed } from '../controllers/bookingController.js';

const router = express.Router();


router.post("/checkout", checkout )
router.post("/paymentVerification", paymentVerification)
router.get("/getKey", getKey)
router.post("/rollbackBooking", bookingFailed)
router.post("/checkPaymentStatus", checkPaymentStatus)

export default router