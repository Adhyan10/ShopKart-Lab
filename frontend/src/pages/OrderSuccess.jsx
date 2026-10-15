import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrderById } from "../services/api";
import { rupees, shortId } from "../utils/format";
import usePageMeta from "../hooks/usePageMeta";

function OrderSuccess() {
  usePageMeta("Order Placed", "Your ShopKart order has been placed successfully.");
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderById(id).then((data) => setOrder(data.order)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="status error">{error}</p>;
  if (!order) return <p className="status">Loading your order...</p>;

  return (
    <div className="order-success">
      <h2>Order Placed Successfully</h2>
      <p>Thank you! Your payment was verified and your order has been saved.</p>
      <dl>
        <dt>Order ID</dt><dd>{order._id}</dd>
        <dt>Reference</dt><dd>#{shortId(order._id)}</dd>
        <dt>Total</dt><dd>{rupees(order.totalAmount)}</dd>
        <dt>Status</dt><dd>{order.status}</dd>
      </dl>
      <p className="actions">
        <Link className="btn" to="/orders">View My Orders</Link>{" "}
        <Link className="btn" to="/products">Continue Shopping</Link>
      </p>
    </div>
  );
}

export default OrderSuccess;
