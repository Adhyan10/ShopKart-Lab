const ratelimit = require("../config/upstash");

// 30 requests per minute per IP
const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit(req.ip);
    if (!success) {
      return res
        .status(429)
        .json({ success: false, message: "Too many requests. Please wait a moment and try again." });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = rateLimiter;
