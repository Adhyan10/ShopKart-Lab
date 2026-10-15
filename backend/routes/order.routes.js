const express = require("express");
const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Every order route needs a valid JWT
router.use(protect);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;
