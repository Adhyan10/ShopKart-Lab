const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const AUTH_KEY = "shopkart_auth";

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))?.token || null;
  } catch {
    return null;
  }
};

// Sends the JWT (if logged in) and throws the backend's error message on failure
const request = async (path, options = {}) => {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Please check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
};

export const registerUser = (body) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(body) });

export const loginUser = (body) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(body) });

// Query params (search, category) are sent to the backend, which filters in MongoDB
export const fetchProducts = ({ search = "", category = "" } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  const query = params.toString();
  return request(`/products${query ? `?${query}` : ""}`);
};

export const fetchCategories = () => request("/products/categories");

// URL param (:id) identifies one specific product
export const fetchProductById = (id) => request(`/products/${id}`);

// Wishlist (user is identified by the JWT, never sent in the body)
export const fetchWishlist = () => request("/wishlist");
export const addToWishlist = (productId) => request(`/wishlist/${productId}`, { method: "POST" });
export const removeFromWishlist = (productId) =>
  request(`/wishlist/${productId}`, { method: "DELETE" });

// Cart (every call returns the full updated cart: { cart: [{ product, quantity }] })
export const fetchCart = () => request("/cart");
export const addToCart = (productId) => request(`/cart/${productId}`, { method: "POST" });
export const updateCartQuantity = (productId, quantity) =>
  request(`/cart/${productId}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
export const removeFromCart = (productId) =>
  request(`/cart/${productId}`, { method: "DELETE" });

// Orders (the server rebuilds items and total from the cart; only the address is sent)
export const createPaymentOrder = (shippingAddress) =>
  request("/orders/create-payment-order", { method: "POST", body: JSON.stringify({ shippingAddress }) });
export const verifyPayment = (body) =>
  request("/orders/verify-payment", { method: "POST", body: JSON.stringify(body) });
export const fetchOrders = () => request("/orders");
export const fetchOrderById = (id) => request(`/orders/${id}`);
