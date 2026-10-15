import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../services/api";
import OrderCard from "../components/OrderCard";
import usePageMeta from "../hooks/usePageMeta";

function Orders() {
  usePageMeta("My Orders", "View your previous ShopKart orders and their status.");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchOrders()
      .then((data) => setOrders(data.orders))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [attempt]);

  if (loading) return <p className="status">Loading your orders...</p>;

  if (error) {
    return (
      <div className="status error">
        <p>Unable to load your orders.</p>
        <button className="btn" onClick={() => setAttempt((n) => n + 1)}>Try Again</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="status">
        <p>You have not placed any orders yet.</p>
        <Link className="btn" to="/products">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>My Orders</h2>
      <div className="order-list">
        {orders.map((order) => <OrderCard key={order._id} order={order} />)}
      </div>
    </div>
  );
}

export default Orders;
