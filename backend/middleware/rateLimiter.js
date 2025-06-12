const rateLimit = require("express-rate-limit");
const express = require("express");

const perSecondLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20,
  message: "Too many requests in a short time. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

const perTwoMinuteLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 100,
  message: "Too many requests. Please wait before retrying.",
  standardHeaders: true,
  legacyHeaders: false,
});

const rateLimiter = express.Router();
rateLimiter.use(perSecondLimiter);
rateLimiter.use(perTwoMinuteLimiter);

module.exports = { rateLimiter };
