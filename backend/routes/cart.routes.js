const express = require("express");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Every cart route needs a valid JWT
router.use(protect);

router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateQuantity);
router.delete("/:productId", removeFromCart);

module.exports = router;
