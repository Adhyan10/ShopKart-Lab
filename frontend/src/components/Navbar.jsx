import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNotice } from "../context/NoticeContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalUnits } = useCart();
  const navigate = useNavigate();
  const notify = useNotice();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);

  // Close the mobile menu after navigating, and on Escape
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus(); // keep keyboard focus somewhere visible
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    logout();
    notify.success("You have been logged out.");
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to={user ? "/home" : "/login"}>
          <span className="brand-mark" aria-hidden="true">S</span>ShopKart
        </Link>
        <button
          type="button"
          ref={toggleRef}
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <div
          id="main-nav"
          className={`header-menu${menuOpen ? " open" : ""}`}
          onClick={(e) => e.target.closest("a") && setMenuOpen(false)} // also closes when the current page is clicked
        >
          {user && (
            <nav className="pill-nav" aria-label="Main">
              <NavLink to="/home">Home</NavLink>
              <NavLink to="/products">Products</NavLink>
              <NavLink to="/wishlist">Wishlist</NavLink>
              <NavLink to="/orders">Orders</NavLink>
            </nav>
          )}
          <div className="header-actions">
            {user ? (
              <>
                <NavLink className="cart-pill" to="/cart">Cart ({totalUnits})</NavLink>
                <span className="user">Hi, {user.name}</span>
                <button type="button" className="link-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className="plain-link" to="/login">Login</NavLink>
                <NavLink className="cart-pill" to="/register">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
