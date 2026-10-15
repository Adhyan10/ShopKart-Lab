import { Link } from "react-router-dom";
import { rupees } from "../utils/format";

function WishlistCard({ product, onRemove, removing }) {
  const inStock = product.stock > 0;

  return (
    <div className="card">
      <img src={product.image} alt={product.name} width="300" height="300" loading="lazy" />
      <h3>{product.name}</h3>
      <p className="price">{rupees(product.price)}</p>
      <p className="category">{product.category}</p>
      <p className={inStock ? "in-stock" : "out-stock"}>
        {inStock ? `${product.stock} units left` : "Out of Stock"}
      </p>
      <Link className="btn" to={`/products/${product._id}`}>
        View Details
      </Link>
      <button className="btn wish-btn" onClick={() => onRemove(product._id)} disabled={removing}>
        {removing ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}

export default WishlistCard;
