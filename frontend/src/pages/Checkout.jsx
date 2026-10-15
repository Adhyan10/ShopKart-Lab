import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNotice } from "../context/NoticeContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import { loadRazorpayScript } from "../utils/razorpay";
import { EMPTY_ADDRESS, validateAddress } from "../utils/shippingValidation";
import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import usePageMeta from "../hooks/usePageMeta";

const CANCELLED_MESSAGE = "Payment was not completed. Your cart has not been cleared.";

function Checkout() {
  usePageMeta("Checkout", "Enter your shipping details and pay securely for your ShopKart order.");
  const { user } = useAuth();
  const { cartItems, loading, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const notify = useNotice();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(null); // paid, but the server has not confirmed yet
  const orderDone = useRef(false); // stops the empty-cart redirect once we clear the cart ourselves

  if (loading) return <p className="status">Loading your cart...</p>;
  if (cartItems.length === 0 && !orderDone.current) return <Navigate to="/cart" replace />;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  // Sends the Razorpay result to the server. If this fails AFTER the customer paid, the payload is
  // kept so confirmation can be retried without creating (and paying for) a second order.
  const confirmPayment = async (payload) => {
    setFormError("");
    setPlacing(true);
    try {
      const data = await verifyPayment(payload);
      orderDone.current = true;
      setUnconfirmed(null);
      clearCart();
      notify.success("Payment successful. Your order has been placed.");
      navigate(`/order-success/${data.order._id}`, { replace: true });
    } catch (err) {
      setUnconfirmed(payload);
      setFormError(`We could not confirm your payment yet: ${err.message}. Please try again. Do not pay twice.`);
      setPlacing(false);
    }
  };

  const openCheckout = (checkout) => {
    const razorpay = new window.Razorpay({
      key: checkout.key,
      amount: checkout.amount,
      currency: checkout.currency,
      order_id: checkout.razorpayOrderId,
      name: "ShopKart",
      description: "ShopKart Order",
      prefill: { name: address.fullName.trim(), email: user.email, contact: `+91${address.phone.replace(/\D/g, "").slice(-10)}` },
      handler: (response) => // never trusted: the server verifies the signature
        confirmPayment({
          shopKartOrderId: checkout.shopKartOrderId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      modal: {
        ondismiss: () => {
          setFormError(CANCELLED_MESSAGE);
          setPlacing(false);
        },
      },
    });
    // The popup stays open so the customer can retry inside it: keep the form locked meanwhile
    razorpay.on("payment.failed", () => {
      setFormError("Payment failed. Your cart has not been cleared. You can retry in the payment window.");
    });
    razorpay.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (unconfirmed) return confirmPayment(unconfirmed);

    setFormError("");
    const errors = validateAddress(address);
    setFieldErrors(errors);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus(); // keyboard / screen-reader users land on the problem
      return; // no backend call on invalid input
    }

    setPlacing(true);
    try {
      // Load the payment script first so a blocked script never leaves a pending order behind
      if (!(await loadRazorpayScript())) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }
      openCheckout(await createPaymentOrder(address));
    } catch (err) {
      setFormError(err.message);
      setPlacing(false);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <p className="muted">Signed in as {user.name}. <Link to="/cart">Back to cart</Link></p>
      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <CheckoutForm address={address} errors={fieldErrors} disabled={placing || Boolean(unconfirmed)} onChange={handleChange} />
        <OrderSummary items={cartItems} total={subtotal}>
          {formError && <p className="status error banner" role="alert">{formError}</p>}
          <button className="btn checkout-btn" disabled={placing}>
            {placing ? "Processing..." : unconfirmed ? "Confirm My Payment" : "Place Order & Pay"}
          </button>
          <p className="muted small">Secure payment by Razorpay (test mode).</p>
        </OrderSummary>
      </form>
    </div>
  );
}

export default Checkout;
