const jwt = require("jsonwebtoken");

// Expects header: Authorization: Bearer <token>
const protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { protect };
