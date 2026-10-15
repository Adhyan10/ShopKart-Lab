export const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

const REQUIRED = {
  fullName: "Full name is required.",
  phone: "Phone is required.",
  addressLine1: "Address is required.",
  city: "City is required.",
  state: "State is required.",
  pincode: "Pincode is required.",
};

// Returns { field: message } for every invalid field; {} means valid.
export const validateAddress = (address) => {
  const errors = {};
  for (const [field, message] of Object.entries(REQUIRED)) {
    if (!address[field].trim()) errors[field] = message;
  }
  if (!errors.phone && !/^[6-9]\d{9}$/.test(address.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "Phone must be a valid 10-digit mobile number.";
  }
  if (!errors.pincode && !/^\d{6}$/.test(address.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }
  return errors;
};
