import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWishlist, removeFromWishlist } from "../services/api";
import { useNotice } from "../context/NoticeContext";
import WishlistCard from "../components/WishlistCard";
import usePageMeta from "../hooks/usePageMeta";

function Wishlist() {
  usePageMeta("My Wishlist", "Products you have saved to your ShopKart wishlist.");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState("");
  const notify = useNotice();

  const load = () => {
    setLoading(true);
    setError(false);
    fetchWishlist()
      .then((data) => setItems(data.wishlist))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    setRemoveError("");
    try {
      await removeFromWishlist(productId);
      setItems((current) => current.filter((p) => p._id !== productId));
      notify.success("Removed from your wishlist.");
    } catch {
      setRemoveError("Unable to remove product. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <p className="status">Loading your wishlist...</p>;

  if (error) {
    return (
      <div className="status error">
        <p>Unable to load wishlist.</p>
        <button className="btn" onClick={load}>Try Again</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="status">
        <p>Your wishlist is empty.</p>
        <p>Start saving products you love.</p>
        <Link className="btn" to="/products">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>My Wishlist</h2>
      <p>{items.length} product{items.length === 1 ? "" : "s"} saved</p>
      {removeError && <p className="status error">{removeError}</p>}
      <div className="grid">
        {items.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            removing={removingId === product._id}
          />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
