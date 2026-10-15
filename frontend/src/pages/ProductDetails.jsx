import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { useNotice } from "../context/NoticeContext";
import { rupees } from "../utils/format";
import usePageMeta from "../hooks/usePageMeta";

function ProductDetails() {
  const { id } = useParams(); // value of :id from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cartError, setCartError] = useState("");
  const { cartItems, busyId, addItem } = useCart();
  const notify = useNotice();
  usePageMeta(product ? product.name : "Product", product ? product.description.slice(0, 155) : "Product details at ShopKart.");

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(false);

    fetchProductById(id)
      .then((data) => {
        if (isCurrent) setProduct(data.product);
      })
      .catch(() => {
        if (isCurrent) setError(true);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleAdd = async () => {
    setCartError("");
    try {
      await addItem(product._id);
      notify.success(`${product.name} added to cart.`);
    } catch (err) {
      setCartError(err.message);
    }
  };

  if (loading) return <p className="status">Loading product...</p>;
  if (error || !product) {
    return (
      <div className="status error">
        <p>We could not find that product.</p>
        <Link className="btn" to="/products">Back to Products</Link>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="details">
      <Link to="/products">← Back to products</Link>
      <div className="details-body">
        <img src={product.image} alt={product.name} width="480" height="480" />
        <div>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p className="price">{rupees(product.price)}</p>
          <p className="category">Category: {product.category}</p>
          <p className={inStock ? "in-stock" : "out-stock"}>
            {inStock ? `In Stock (${product.stock} left)` : "Out of Stock"}
          </p>
          <button className="btn cart-btn" onClick={handleAdd} disabled={!inStock || busyId === product._id}>
            {busyId === product._id ? "Adding..." : cartItems.some((i) => i.product._id === product._id) ? "Add Another" : "Add to Cart"}
          </button>
          {cartError && <p className="status error small">{cartError}</p>}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
