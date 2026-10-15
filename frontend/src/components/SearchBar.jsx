function SearchBar({ search, category, categories, onSearchChange, onCategoryChange }) {
  return (
    <div className="search-bar" role="search">
      <label className="sr-only" htmlFor="product-search">Search products</label>
      <input
        id="product-search"
        type="search"
        placeholder="Search by product name"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <label className="sr-only" htmlFor="product-category">Category</label>
      <select id="product-category" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;
