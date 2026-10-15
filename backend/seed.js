require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

// Products come from a public catalog API instead of a hardcoded list.
const CATALOG_URL =
  "https://dummyjson.com/products?limit=0&select=title,description,category,price,stock,thumbnail";
// Not everyday-shop items (cars cost lakhs and would look odd next to a ₹499 t-shirt)
const SKIPPED_CATEGORIES = new Set(["vehicle", "motorcycle"]);
const USD_TO_INR = Number(process.env.USD_TO_INR) || 83; // the API prices in USD, the shop sells in INR

// "mens-shirts" -> "Mens Shirts"
const toTitle = (slug) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const toProduct = (p) => ({
  externalId: p.id,
  name: p.title,
  description: p.description,
  category: toTitle(p.category),
  image: p.thumbnail,
  price: Math.max(1, Math.round(p.price * USD_TO_INR)),
  stock: p.stock,
});

const fetchCatalog = async () => {
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error(`Catalog API responded with ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error("Catalog API returned no products");
  }
  return data.products.filter((p) => !SKIPPED_CATEGORIES.has(p.category)).map(toProduct);
};

const run = async () => {
  try {
    const products = await fetchCatalog();
    await mongoose.connect(process.env.MONGO_URI);

    // Upsert (not delete + insert) so product ids stay stable for existing carts and orders
    // Stock is written only when a product is first inserted, so re-seeding never undoes real sales
    const result = await Product.bulkWrite(
      products.map(({ stock, ...catalogFields }) => ({
        updateOne: {
          filter: { externalId: catalogFields.externalId },
          update: { $set: catalogFields, $setOnInsert: { stock } },
          upsert: true,
        },
      }))
    );
    console.log(
      `Catalog synced: ${result.upsertedCount} added, ${result.modifiedCount} updated, ${products.length} total`
    );
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
