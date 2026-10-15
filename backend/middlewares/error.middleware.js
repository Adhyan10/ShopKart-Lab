const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

// Mongoose validation errors (missing field, bad price/stock) -> 400
const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }
  if (err.status) return res.status(err.status).json({ success: false, message: err.message });
  console.error(err);
  res.status(500).json({ success: false, message: "Server error" });
};

module.exports = { notFound, errorHandler };
