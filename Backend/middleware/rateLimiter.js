import rateLimit from "express-rate-limit";

// ============= LOGIN RATE LIMITER =============
// Prevents brute force attacks by limiting login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per windowMs
  message: "Too many login attempts. Please try again in 15 minutes.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req, res) => {
    // Don't rate limit if it's a GET request
    return req.method === "GET";
  },
  keyGenerator: (req, res) => {
    // Use IP address as the key (you can also use email if available)
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
      data: null
    });
  }
});

// ============= GENERAL API RATE LIMITER =============
// Moderate rate limiting for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Max 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// ============= REGISTER RATE LIMITER =============
// Strict rate limiting for registration endpoints
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 registration attempts per hour
  message: "Too many accounts created from this IP, please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again later.",
      data: null
    });
  }
});

// ============= STRICT RATE LIMITER =============
// Very strict rate limiting for sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 requests per minute
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  }
});
