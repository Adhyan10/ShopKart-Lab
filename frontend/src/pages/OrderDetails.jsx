import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrderById } from "../services/api";
import { formatDate, shortId } from "../utils/format";
import OrderSummary from "../components/OrderSummary";
import usePageMeta from "../hooks/usePageMeta";

function OrderDetails() {
  usePageMeta("Order Details", "Shipping address, items and payment details for your ShopKart order.");
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderById(id).then((data) => setOrder(data.order)).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="status error">
        <p>{error}</p>
        <Link className="btn" to="/orders">Back to My Orders</Link>
      </div>
    );
  }
  if (!order) return <p className="status">Loading order...</p>;

  const a = order.shippingAddress;
  return (
    <div>
      <h2>Order #{shortId(order._id)}</h2>
      <p className="muted">Placed on {formatDate(order.createdAt)} · Status: {order.status} · Payment: {order.paymentStatus}</p>
      <div className="checkout-layout">
        <section className="shipping-form">
          <h3>Shipping To</h3>
          <address>
            {a.fullName}<br />{a.addressLine1}<br />{a.city}, {a.state} {a.pincode}<br />Phone: {a.phone}
          </address>
          {order.razorpayPaymentId && <p className="muted small">Payment ID: {order.razorpayPaymentId}</p>}
        </section>
        <OrderSummary items={order.items} total={order.totalAmount} />
      </div>
      <p><Link to="/orders">← Back to My Orders</Link></p>
    </div>
  );
}

export default OrderDetails;
