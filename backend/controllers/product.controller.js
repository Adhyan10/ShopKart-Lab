const mongoose = require("mongoose");
const Product = require("../models/product.model");

const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

// Escape regex special characters so user input is treated as plain text
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /products
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, image, price, stock } = req.body; // whitelist: no mass assignment
    const product = await Product.create({ name, description, category, image, price, stock });
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// GET /products?search=&category=&sort=
const getProducts = async (req, res, next) => {
  try {
    const { sort } = req.query;
    // Query values can arrive as arrays/objects (?category[$ne]=x); only plain strings are accepted
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category : "";

    // Build the filter dynamically from whichever query params were sent
    const filter = {};
    if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .select("name price category image stock")
      .sort(SORT_OPTIONS[sort] || { createdAt: -1 })
      .lean(); // plain objects: faster, nothing here needs Mongoose documents

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// GET /products/categories  -> sorted list of category names that exist in the catalog
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");
    res.set("Cache-Control", "private, max-age=300"); // categories change only when the catalog is re-seeded
    res.json({ success: true, categories: categories.sort() });
  } catch (err) {
    next(err);
  }
};

// GET /products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProduct, getProducts, getCategories, getProductById };
