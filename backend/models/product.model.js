const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], trim: true },
  description: { type: String, required: [true, "Description is required"] },
  category: { type: String, required: [true, "Category is required"], trim: true },
  image: { type: String, required: [true, "Image is required"] },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0.01, "Price must be greater than 0"],
  },
  stock: {
    type: Number,
    required: [true, "Stock is required"],
    min: [0, "Stock cannot be negative"],
  },
  externalId: { type: Number, unique: true, sparse: true }, // id in the source catalog API (seed upserts on it)
  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ category: 1 });
productSchema.index({ name: 1 });

module.exports = mongoose.model("Product", productSchema);
