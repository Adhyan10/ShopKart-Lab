const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const { getRazorpay } = require("../config/razorpay");
const { validateShippingAddress } = require("../utils/shipping");

const PAISE_PER_RUPEE = 100;

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Rebuilds the order from the user's CURRENT cart + CURRENT product data.
// Nothing price- or quantity-related is read from the request body.
// Returns { items, totalAmount } or { error }.
const buildSnapshot = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.cart.length === 0) return { error: "Your cart is empty" };

  const products = await Product.find({ _id: { $in: user.cart.map((i) => i.product) } });
  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  const items = [];
  for (const cartItem of user.cart) {
    const product = productById.get(cartItem.product.toString());
    if (!product) return { error: "A product in your cart is no longer available" };
    if (cartItem.quantity > product.stock) {
      return { error: `Insufficient stock for ${product.name}. Only ${product.stock} left.` };
    }
    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.image,
    });
  }

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items, totalAmount };
};

// POST /orders/create-payment-order   body: { shippingAddress }
const createPaymentOrder = async (req, res, next) => {
  try {
    const { address, error: addressError } = validateShippingAddress(req.body.shippingAddress);
    if (addressError) return fail(res, 400, addressError);

    const { items, totalAmount, error } = await buildSnapshot(req.userId);
    if (error) return fail(res, 400, error);

    const razorpay = getRazorpay(); // throws 503 if keys are missing, before anything is saved

    const order = await Order.create({
      user: req.userId,
      items,
      shippingAddress: address,
      totalAmount,
    });

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * PAISE_PER_RUPEE),
        currency: "INR",
        receipt: order._id.toString(),
      });
    } catch (gatewayError) {
      await Order.deleteOne({ _id: order._id }); // no dangling pending order; cart is untouched
      console.error("Razorpay order creation failed:", gatewayError);
      return fail(res, 502, "Could not start the payment. Please try again.");
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID, // public key id only, never the secret
    });
  } catch (err) {
    next(err);
  }
};

const isValidSignature = (razorpayOrderId, paymentId, signature) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Takes stock for a paid order. Conditional ($gte) so stock can never go negative.
// Returns true when every line was reserved.
const reduceStock = async (items) => {
  const result = await Product.bulkWrite(
    items.map((i) => ({
      updateOne: {
        filter: { _id: i.product, stock: { $gte: i.quantity } },
        update: { $inc: { stock: -i.quantity } },
      },
    }))
  );
  return result.modifiedCount === items.length;
};

// POST /orders/verify-payment
const verifyPayment = async (req, res, next) => {
  try {
    const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body;
    if (
      !mongoose.isValidObjectId(shopKartOrderId) ||
      typeof razorpay_payment_id !== "string" || !razorpay_payment_id ||
      typeof razorpay_signature !== "string" || !razorpay_signature
    ) {
      return fail(res, 400, "Missing payment details");
    }
    if (!process.env.RAZORPAY_KEY_SECRET) return fail(res, 503, "Payments are not configured");

    // Only the owner's order; the trusted Razorpay order id is the one WE stored
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.userId });
    if (!order || !order.razorpayOrderId) return fail(res, 404, "Order not found");

    if (order.paymentStatus === "PAID") {
      return res.json({ success: true, message: "Order already confirmed", order }); // safe retry
    }

    if (!isValidSignature(order.razorpayOrderId, razorpay_payment_id, razorpay_signature)) {
      return fail(res, 400, "Invalid payment signature");
    }

    // Atomic PENDING -> PAID: of two concurrent verifications only one wins and touches stock/cart
    const confirmed = await Order.findOneAndUpdate(
      { _id: order._id, user: req.userId, paymentStatus: "PENDING" },
      { $set: { paymentStatus: "PAID", status: "PLACED", razorpayPaymentId: razorpay_payment_id } },
      { new: true }
    );
    if (!confirmed) {
      const current = await Order.findById(order._id);
      return res.json({ success: true, message: "Order already confirmed", order: current });
    }

    await User.updateOne({ _id: req.userId }, { $set: { cart: [] } });

    let finalOrder = confirmed;
    try {
      if (!(await reduceStock(confirmed.items))) {
        // Money is captured but stock ran out in between: flag it for manual fulfilment/refund
        console.error(`Order ${confirmed._id} paid but stock could not be fully reserved`);
        finalOrder = await Order.findByIdAndUpdate(confirmed._id, { needsReview: true }, { new: true });
      }
    } catch (stockError) {
      console.error(`Stock update failed for paid order ${confirmed._id}:`, stockError);
      finalOrder = await Order.findByIdAndUpdate(confirmed._id, { needsReview: true }, { new: true });
    }

    res.json({ success: true, message: "Payment verified", order: finalOrder });
  } catch (err) {
    next(err);
  }
};

// GET /orders  (only the logged-in user's orders, newest first; unpaid attempts are hidden)
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId, paymentStatus: "PAID" }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// GET /orders/:id  (404 for both "missing" and "someone else's" so ids can't be probed)
const getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, "Invalid order ID");
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return fail(res, 404, "Order not found");
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };
