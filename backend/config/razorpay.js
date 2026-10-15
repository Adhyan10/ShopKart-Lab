const Razorpay = require("razorpay");

let client = null;

// Created lazily so the server still boots (and browsing works) without payment keys.
// The key secret stays on the backend: it is only used here and for signature checks.
const getRazorpay = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const err = new Error("Payments are not configured");
    err.status = 503;
    throw err;
  }
  if (!client) {
    client = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  }
  return client;
};

module.exports = { getRazorpay };
