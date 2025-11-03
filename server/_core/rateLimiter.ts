/**
 * Rate limiting middleware for OTP endpoints
 * Prevents abuse of OTP code generation
 */

import rateLimit from "express-rate-limit";

/**
 * Rate limiter for OTP code requests
 * Allows 5 requests per 15 minutes per IP address
 */
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many OTP requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
});

/**
 * Stricter rate limiter for OTP verification attempts
 * Allows 10 attempts per 15 minutes per IP
 */
export const otpVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 verification attempts per windowMs
  message: {
    error: "Too many verification attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful verifications
});

/**
 * General API rate limiter
 * Protects against API abuse
 */
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    error: "Too many requests, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for static assets
  skip: (req) => {
    return req.path.startsWith("/assets/") || 
           req.path.startsWith("/legal/") ||
           req.path.endsWith(".css") || 
           req.path.endsWith(".js") ||
           req.path.endsWith(".png") ||
           req.path.endsWith(".jpg") ||
           req.path.endsWith(".svg");
  },
});
