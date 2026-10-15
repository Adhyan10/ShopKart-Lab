import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, fetchProducts } from "../services/api";
import { rupees } from "../utils/format";
import usePageMeta from "../hooks/usePageMeta";
import ProductCard from "../components/ProductCard";

const FEATURED_COUNT = 4;

function Home() {
  usePageMeta("Home", "Shop by category and see the latest arrivals at ShopKart.");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchCategories().then((d) => setCategories(d.categories)).catch(() => {});
    fetchProducts().then((d) => setProducts(d.products)).catch(() => {});
  }, []);

  const featured = products.slice(0, FEATURED_COUNT);
  const spotlight = featured[0];

  return (
    <div>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-art" aria-hidden="true">
          <svg className="hero-wire" viewBox="0 0 600 500" fill="none">
            <defs>
              <linearGradient id="wire" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
                <stop offset="1" stopColor="#c9b6ff" stopOpacity=".6" />
              </linearGradient>
            </defs>
            <path d="M10 120 C 170 10, 330 60, 330 190 S 150 330, 240 420 S 470 470, 590 330" stroke="url(#wire)" strokeWidth="5" strokeLinecap="round" />
            <path d="M40 60 C 200 -10, 360 30, 380 150" stroke="url(#wire)" strokeWidth="2" strokeLinecap="round" opacity=".7" />
          </svg>
          <span className="glass orb" />
          <span className="glass shard" />
          <span className="glass tri" />
        </div>

        <h1 id="hero-title">
          <span className="line-light">Shop the</span>
          <span className="line-row">
            <a className="down" href="#latest" aria-label="Jump to latest arrivals">↓</a>
            <em>Latest</em>
          </span>
          <strong>Arrivals</strong>
        </h1>

        <ul className="hero-index" aria-label="On this page">
          <li><a href="#categories">Categories</a></li>
          <li><a href="#latest">Latest arrivals</a></li>
          <li><Link to="/products">All products</Link></li>
        </ul>

        {spotlight && (
          <Link className="hero-card" to={`/products/${spotlight._id}`}>
            <img src={spotlight.image} alt="" width="120" height="120" />
            <span className="hero-card-text">
              <small>Just in</small>
              <b>{spotlight.name}</b>
              <span>{rupees(spotlight.price)}</span>
            </span>
          </Link>
        )}

        <p className="hero-meta">
          <span className="chip">{products.length || "…"} products</span>
          <span className="chip">{categories.length || "…"} categories</span>
          <span className="hero-meta-text">Pay securely online with Razorpay.</span>
        </p>
      </section>

      {categories.length > 0 && (
        <section id="categories" className="block">
          <h2>Shop by category</h2>
          <ul className="category-list">
            {categories.map((c) => (
              <li key={c}><Link to={`/products?category=${encodeURIComponent(c)}`}>{c}</Link></li>
            ))}
          </ul>
        </section>
      )}

      {featured.length > 0 && (
        <section id="latest" className="block">
          <h2>Latest arrivals</h2>
          <div className="grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
