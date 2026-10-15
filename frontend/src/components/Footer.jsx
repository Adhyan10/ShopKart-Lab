import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SITE } from "../config/site";

function Footer() {
  const { user } = useAuth();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section>
          <h4>{SITE.name}</h4>
          <p>Everyday essentials delivered to your door.</p>
        </section>
        <nav aria-label="Footer">
          <h4>Shop</h4>
          <ul>
            {user ? (
              <>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/wishlist">Wishlist</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
        <section>
          <h4>Contact</h4>
          <ul>
            <li><a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          </ul>
        </section>
      </div>
      <p className="copyright">&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
