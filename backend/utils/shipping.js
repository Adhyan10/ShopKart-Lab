const PHONE_PATTERN = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
const PINCODE_PATTERN = /^\d{6}$/;

const FIELD_LABELS = {
  fullName: "Full name",
  phone: "Phone",
  addressLine1: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

// Returns { address } (trimmed copy) or { error } with a user-facing message.
const validateShippingAddress = (input) => {
  if (!input || typeof input !== "object") return { error: "Shipping address is required" };

  const address = {};
  for (const [field, label] of Object.entries(FIELD_LABELS)) {
    const value = typeof input[field] === "string" ? input[field].trim() : "";
    if (!value) return { error: `${label} is required` };
    address[field] = value;
  }

  if (!PHONE_PATTERN.test(address.phone.replace(/[\s-]/g, ""))) {
    return { error: "Phone must be a valid 10-digit mobile number" };
  }
  if (!PINCODE_PATTERN.test(address.pincode)) {
    return { error: "Pincode must contain 6 digits" };
  }

  return { address: { ...address, phone: address.phone.replace(/[\s-]/g, "") } };
};

module.exports = { validateShippingAddress };
