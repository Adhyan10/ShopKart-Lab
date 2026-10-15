import { Link } from "react-router-dom";
import { formatDate, rupees, shortId } from "../utils/format";

function OrderCard({ order }) {
  return (
    <article className="order-card">
      <header>
        <h3>Order #{shortId(order._id)}</h3>
        <span className="order-date">{formatDate(order.createdAt)}</span>
      </header>
      <ul>
        {order.items.map((item) => (
          <li key={item.product}>{item.name} × {item.quantity}</li>
        ))}
      </ul>
      <p>Total: <b>{rupees(order.totalAmount)}</b></p>
      <p>Status: <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></p>
      <Link className="btn" to={`/orders/${order._id}`}>View Details</Link>
    </article>
  );
}

export default OrderCard;
