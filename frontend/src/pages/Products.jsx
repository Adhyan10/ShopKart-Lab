import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchProducts, fetchWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import usePageMeta from "../hooks/usePageMeta";

function Products() {
  usePageMeta("Products", "Browse and search all ShopKart products by name and category.");
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Which products are already wishlisted (so hearts survive a refresh)
  useEffect(() => {
    fetchWishlist()
      .then((data) => setSavedIds(data.wishlist.map((p) => p._id)))
      .catch(() => {}); // hearts just start empty; card still reports errors on click
  }, []);

  // Category options come from the catalog itself
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {}); // the filter just stays empty; products still load
  }, []);

  // Re-fetch from the backend whenever search or category changes
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(false);

    fetchProducts({ search, category })
      .then((data) => {
        if (isCurrent) setProducts(data.products);
      })
      .catch(() => {
        if (isCurrent) setError(true);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    // Ignore results of outdated requests (e.g. while the user is still typing)
    return () => {
      isCurrent = false;
    };
  }, [search, category]);

  // Keep the selected category in the URL so it is shareable and survives refresh
  const handleCategoryChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("category", value);
    } else {
      nextParams.delete("category");
    }
    setSearchParams(nextParams);
  };

  return (
    <div>
      <h2>Products</h2>
      <SearchBar
        search={search}
        category={category}
        categories={categories}
        onSearchChange={setSearch}
        onCategoryChange={handleCategoryChange}
      />

      {loading && <p className="status">Loading products...</p>}
      {!loading && error && (
        <p className="status error">Something went wrong while loading products.</p>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="status">No products found.</p>
      )}

      {!loading && !error && (
        <div className="grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              initiallySaved={savedIds.includes(product._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
