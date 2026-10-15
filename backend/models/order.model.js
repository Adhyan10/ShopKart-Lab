const mongoose = require("mongoose");

// Items are a purchase-time snapshot: name/price/image are copied from Product,
// so later catalog edits never change what the customer actually bought.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], validate: [(v) => v.length > 0, "Order has no items"] },
    shippingAddress: { type: shippingAddressSchema, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
      default: "PENDING_PAYMENT",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    needsReview: { type: Boolean, default: false }, // paid, but stock could not be fully reserved
  },
  { timestamps: true }
);

// "My Orders" lists one user's orders newest first
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
