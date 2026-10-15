export const rupees = (amount) => `₹${amount.toLocaleString("en-IN")}`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const shortId = (id) => id.slice(-8).toUpperCase();
