require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const connectDB = require("./utils/db");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const rateLimiter = require("./middlewares/rateLimiter");

const app = express();
const PORT = process.env.PORT || 5001;

const isJwtSecretValid = () => Boolean(process.env.JWT_SECRET) && process.env.JWT_SECRET.length >= 16;

app.disable("x-powered-by");
app.set("trust proxy", 1); // real client IP behind Vercel's proxy (rate limiting)
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true })); // set CLIENT_ORIGIN in production
app.use(express.json({ limit: "10kb" }));     // This middleware will parse json bodies 

// Ensure DB is connected before any route runs (cached across serverless invocations)
app.use(async (req, res, next) => {
  try {
    if (!isJwtSecretValid()) throw new Error("JWT_SECRET is missing or too short (use at least 16 random characters)");
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/auth", rateLimiter, authRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", rateLimiter, orderRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  // Local / long-running server
  if (!isJwtSecretValid()) {
    console.error("JWT_SECRET is missing or too short (use at least 16 random characters)");
    process.exit(1);
  }
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      process.exit(1);
    });
}

// Exported for Vercel serverless
module.exports = app;
