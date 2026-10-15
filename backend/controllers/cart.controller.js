const mongoose = require("mongoose");
const User = require("../models/user.model");
const Product = require("../models/product.model");

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Load the logged-in user's cart with full Product data (populate)
const loadCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });
  return user;
};

// Same JSON for every endpoint: the full, up-to-date cart
const sendCart = async (res, userId, message, status = 200) => {
  const user = await loadCart(userId);
  // skip rows whose product was deleted from the catalog
  const cart = user.cart.filter((item) => item.product);
  res.status(status).json({ success: true, message, cart });
};

// Shared checks: valid id + product exists. Returns the product or null (response already sent).
const findProduct = async (res, productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    fail(res, 400, "Invalid product ID");
    return null;
  }
  const product = await Product.findById(productId);
  if (!product) fail(res, 404, "Product not found");
  return product;
};

// POST /cart/:productId  -> add with quantity 1, or +1 if already in cart
const addToCart = async (req, res, next) => {
  try {
    const product = await findProduct(res, req.params.productId);
    if (!product) return;

    const user = await User.findById(req.userId);
    const item = user.cart.find((i) => i.product.equals(product._id));
    const newQuantity = (item ? item.quantity : 0) + 1;

    if (newQuantity > product.stock) {
      return fail(res, 400, `Only ${product.stock} in stock`);
    }

    if (item) item.quantity = newQuantity;
    else user.cart.push({ product: product._id, quantity: 1 });
    await user.save();

    await sendCart(res, req.userId, "Cart updated");
  } catch (err) {
    next(err);
  }
};

// GET /cart
const getCart = async (req, res, next) => {
  try {
    await sendCart(res, req.userId, "Cart loaded");
  } catch (err) {
    next(err);
  }
};

// PATCH /cart/:productId  body: { quantity }
const updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return fail(res, 400, "Quantity must be a whole number, at least 1");
    }

    const product = await findProduct(res, req.params.productId);
    if (!product) return;
    if (quantity > product.stock) return fail(res, 400, `Only ${product.stock} in stock`);

    const user = await User.findById(req.userId);
    const item = user.cart.find((i) => i.product.equals(product._id));
    if (!item) return fail(res, 404, "Product not in cart");

    item.quantity = quantity;
    await user.save();

    await sendCart(res, req.userId, "Quantity updated");
  } catch (err) {
    next(err);
  }
};

// DELETE /cart/:productId
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return fail(res, 400, "Invalid product ID");

    const result = await User.updateOne(
      { _id: req.userId, "cart.product": productId },
      { $pull: { cart: { product: productId } } }
    );
    if (result.modifiedCount === 0) return fail(res, 404, "Product not in cart");

    await sendCart(res, req.userId, "Product removed from cart");
  } catch (err) {
    next(err);
  }
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart };
