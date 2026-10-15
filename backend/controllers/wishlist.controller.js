const mongoose = require("mongoose");
const User = require("../models/user.model");
const Product = require("../models/product.model");

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// POST /wishlist/:productId
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return fail(res, 400, "Invalid product ID");

    if (!(await Product.exists({ _id: productId }))) return fail(res, 404, "Product not found");

    // Only matches if productId is NOT already in the array -> prevents duplicates atomically
    const result = await User.updateOne(
      { _id: req.userId, wishlist: { $ne: productId } },
      { $push: { wishlist: productId } }
    );
    if (result.modifiedCount === 0) return fail(res, 409, "Product already in wishlist");

    res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (err) {
    next(err);
  }
};

// GET /wishlist
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "wishlist",
      select: "name price category image stock",
    });
    if (!user) return fail(res, 401, "User no longer exists");

    res.json({ success: true, count: user.wishlist.length, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// DELETE /wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return fail(res, 400, "Invalid product ID");

    const result = await User.updateOne(
      { _id: req.userId, wishlist: productId },
      { $pull: { wishlist: productId } }
    );
    if (result.modifiedCount === 0) return fail(res, 404, "Product not in wishlist");

    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (err) {
    next(err);
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
