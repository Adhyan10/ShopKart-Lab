const express = require("express");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Every wishlist route needs a valid JWT
router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
