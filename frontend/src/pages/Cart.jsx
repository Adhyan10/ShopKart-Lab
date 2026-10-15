import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import { useNotice } from "../context/NoticeContext";
import { rupees } from "../utils/format";
import usePageMeta from "../hooks/usePageMeta";

function Cart() {
  usePageMeta("My Cart", "Review the items in your ShopKart cart before checkout.");
  const { cartItems, loading, error, busyId, totalUnits, subtotal,
    refreshCart, updateQuantity, removeItem } = useCart();
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const notify = useNotice();

  // Run a cart change and show the backend's message if it fails
  const run = async (action, successText) => {
    setActionError("");
    try {
      await action();
      if (successText) notify.success(successText);
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <p className="status">Loading your cart...</p>;

  if (error) {
    return (
      <div className="status error">
        <p>Unable to load your cart.</p>
        <button className="btn" onClick={refreshCart}>Try Again</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="status">
        <p className="empty-title">Your cart is empty</p>
        <p>Looks like you haven't added anything yet.</p>
        <Link className="btn" to="/products">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>My Cart</h2>
      {actionError && <p className="status error banner">{actionError}</p>}
      <div className="cart-layout">
        <div className="cart-list">
          {cartItems.map((item) => (
            <CartItem
              key={item.product._id}
              item={item}
              busy={busyId === item.product._id}
              onChangeQuantity={(q) => run(() => updateQuantity(item.product._id, q))}
              onRemove={() => run(() => removeItem(item.product._id), `${item.product.name} removed from cart.`)}
            />
          ))}
        </div>

        <aside className="receipt">
          <h3>Order Summary</h3>
          <div className="receipt-row"><span>Items</span><b>{totalUnits}</b></div>
          <div className="receipt-row total"><span>Subtotal</span><b>{rupees(subtotal)}</b></div>
          <button className="btn checkout-btn" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
