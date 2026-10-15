const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], trim: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email is invalid"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // never returned in queries unless asked for
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Product references, not copies
  // Cart = Product reference + quantity (price/stock always come from Product)
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, default: 1, min: 1 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
