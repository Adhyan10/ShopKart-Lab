import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";
import { useNotice } from "../context/NoticeContext";
import { rupees } from "../utils/format";

function ProductCard({ product, initiallySaved = false }) {
  const inStock = product.stock > 0;
  const [saved, setSaved] = useState(initiallySaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cartError, setCartError] = useState("");
  const { cartItems, busyId, addItem } = useCart();
  const notify = useNotice();
  const inCart = cartItems.find((i) => i.product._id === product._id);
  const adding = busyId === product._id;
  const maxedOut = inCart && inCart.quantity >= product.stock;

  // Wishlist ids arrive after the first render
  useEffect(() => setSaved(initiallySaved), [initiallySaved]);

  const handleAdd = async () => {
    setCartError("");
    try {
      await addItem(product._id);
      notify.success(`${product.name} added to cart.`);
    } catch (err) {
      setCartError(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await addToWishlist(product._id);
      setSaved(true);
      notify.success(`${product.name} added to your wishlist.`);
    } catch (err) {
      // 409 means it was already saved - treat as saved
      if (err.message === "Product already in wishlist") setSaved(true);
      else setError("Unable to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <img src={product.image} alt={product.name} width="300" height="300" loading="lazy" />
      <h3>{product.name}</h3>
      <p className="price">{rupees(product.price)}</p>
      <p className="category">{product.category}</p>
      <p className={inStock ? "in-stock" : "out-stock"}>
        {inStock ? "In Stock" : "Out of Stock"}
      </p>
      <Link className="btn" to={`/products/${product._id}`}>
        View Details
      </Link>
      <button className="btn cart-btn" onClick={handleAdd} disabled={!inStock || adding || maxedOut}>
        {adding ? "Adding..." : maxedOut ? "Max in cart" : inCart ? "Add Another" : "Add to Cart"}
      </button>
      {cartError && <p className="status error small">{cartError}</p>}
      <button className={`btn wish-btn${saved ? " saved" : ""}`} onClick={handleSave} disabled={saving || saved}>
        {saving ? "Saving..." : saved ? "In Wishlist" : "Add to Wishlist"}
      </button>
      {error && <p className="status error small">{error}</p>}
    </div>
  );
}

export default ProductCard;
