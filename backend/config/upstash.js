const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

// create a ratelimiter that allows 30 requests per 60 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "60 s"),
});

module.exports = ratelimit;
