import { Link } from "react-router-dom";
import usePageMeta from "../hooks/usePageMeta";

function NotFound() {
  usePageMeta("Page Not Found", "The page you are looking for does not exist on ShopKart.");

  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>Sorry, we could not find the page you were looking for. It may have moved or the address may be wrong.</p>
      <p>
        <Link className="btn" to="/home">Go to Home</Link>{" "}
        <Link className="btn" to="/products">Browse Products</Link>
      </p>
    </div>
  );
}

export default NotFound;
