import { Link } from "react-router-dom";
import { rupees } from "../utils/format";

function CartItem({ item, busy, onChangeQuantity, onRemove }) {
  const { product, quantity } = item;

  return (
    <div className={`cart-item${busy ? " busy" : ""}`}>
      <img src={product.image} alt={product.name} width="96" height="96" loading="lazy" />
      <div className="cart-info">
        <Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link>
        <p className="category">{product.category}</p>
        <p className="unit-price">{rupees(product.price)} each</p>
        <div className="qty">
          <button disabled={busy || quantity <= 1} onClick={() => onChangeQuantity(quantity - 1)} aria-label="Decrease quantity">−</button>
          <span>{quantity}</span>
          <button disabled={busy || quantity >= product.stock} onClick={() => onChangeQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
        </div>
        {quantity >= product.stock && <p className="max-note">Max stock reached</p>}
      </div>
      <div className="cart-side">
        <p className="line-total">{rupees(product.price * quantity)}</p>
        <button className="remove-btn" disabled={busy} onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}

export default CartItem;
