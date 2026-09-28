import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Normalizes request IP address for rate limiting using express-rate-limit's helper.
 * Properly handles IPv4 and IPv6-mapped addresses.
 */
const getClientIp = (req) => {
  return ipKeyGenerator(req.ip);
};

/**
 * Rate limiter for authentication endpoints (/auth/google).
 * Prevents credential-stuffing and brute-force attacks.
 * - 15 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  keyGenerator: (req) => getClientIp(req),
});

/**
 * Rate limiter for payment endpoints (checkout, verification, status check, rollback).
 * Prevents replay attacks and abuse of Razorpay API calls.
 * - 30 requests per 5-minute window per user+IP (or IP if unauthenticated).
 * - Generous enough to accommodate multi-step checkout (checkout -> verification -> status check)
 *   and retries while completely blocking automated scraping or carding bots.
 */
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment requests. Please try again after a few minutes.",
  },
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return req.user?.id ? `${req.user.id}_${ip}` : ip;
  },
});

/**
 * Rate limiter for the booking creation endpoint (/bookroom).
 * Prevents inventory exhaustion attacks (spam-creating pending bookings to hold dates).
 * - 10 requests per 5-minute window per user+IP.
 */
export const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many booking attempts. Please try again after a few minutes.",
  },
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return req.user?.id ? `${req.user.id}_${ip}` : ip;
  },
});
