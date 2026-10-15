import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchCart, addToCart, updateCartQuantity, removeFromCart } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

// ONE shared cart for Navbar, ProductCard and Cart page
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]); // [{ product, quantity }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState(null); // product whose request is running

  const refreshCart = useCallback(() => {
    setLoading(true);
    setError(false);
    fetchCart()
      .then((data) => setCartItems(data.cart))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Load the cart after login, clear it on logout
  useEffect(() => {
    if (user) refreshCart();
    else setCartItems([]);
  }, [user, refreshCart]);

  // Every API call returns the new cart, so state always mirrors the database.
  // Errors are re-thrown so the component can show a message.
  const mutate = async (productId, apiCall) => {
    setBusyId(productId);
    try {
      const data = await apiCall();
      setCartItems(data.cart);
    } finally {
      setBusyId(null);
    }
  };

  const addItem = (productId) => mutate(productId, () => addToCart(productId));
  const updateQuantity = (productId, quantity) =>
    mutate(productId, () => updateCartQuantity(productId, quantity));
  const removeItem = (productId) => mutate(productId, () => removeFromCart(productId));

  // After a verified payment the server already emptied the cart; mirror that locally
  const clearCart = () => setCartItems([]);

  // Derived values: calculated from state, never stored
  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems, loading, error, busyId, totalUnits, subtotal,
        refreshCart, addItem, updateQuantity, removeItem, clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
