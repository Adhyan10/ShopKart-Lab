import { rupees } from "../utils/format";

// Works for cart rows ({ product, quantity }) and order items ({ name, price, quantity })
const normalise = (item) => ({
  key: item.product?._id ?? item.product,
  name: item.product?.name ?? item.name,
  price: item.product?.price ?? item.price,
  quantity: item.quantity,
});

function OrderSummary({ items, total, children }) {
  return (
    <section className="order-summary">
      <h3>Order Summary</h3>
      <ul>
        {items.map(normalise).map((i) => (
          <li key={i.key}>
            <span>{i.name} × {i.quantity}</span>
            <span>{rupees(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="summary-total"><span>Total</span><span>{rupees(total)}</span></p>
      {children}
    </section>
  );
}

export default OrderSummary;
