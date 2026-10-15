const express = require("express");
const {
  createProduct,
  getProducts,
  getCategories,
  getProductById,
} = require("../controllers/product.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Products come from the seed script. Manual creation is OFF unless explicitly enabled for local
// testing (there is no admin role, so it must never be on where real payments are taken).
if (process.env.ENABLE_PRODUCT_CREATE === "true") router.post("/", protect, createProduct);
// Browsing the catalog requires login
router.get("/", protect, getProducts);
// must be declared before "/:id" or "categories" would be read as an id
router.get("/categories", protect, getCategories);
router.get("/:id", protect, getProductById);

module.exports = router;
