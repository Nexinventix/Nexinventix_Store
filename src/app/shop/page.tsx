"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Suspense } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import ProductCard, {
  type Product,
} from "@/components/ProductCard/ProductCard";

import styles from "./Shop.module.css";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: string;
  name: string;
  slug: string;
};

type SortOption =
  | "latest"
  | "price-low"
  | "price-high"
  | "name"
  | "rating";

/* =========================================================
   SHOP PAGE
========================================================= */

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* =========================================================
     PRODUCT STATE
  ========================================================= */

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filterError, setFilterError] =
    useState("");

  /* =========================================================
     APPLIED FILTER STATE
  ========================================================= */

  const [search, setSearch] =
    useState(searchParams.get("search") || "");

  const [selectedCategory, setSelectedCategory] =
    useState(searchParams.get("category") || "");

  const [selectedBrand, setSelectedBrand] =
    useState(searchParams.get("brand") || "");

  const [minPrice, setMinPrice] =
    useState(searchParams.get("minPrice") || "");

  const [maxPrice, setMaxPrice] =
    useState(searchParams.get("maxPrice") || "");

  /* =========================================================
     DRAFT FILTER STATE

     Typing does not trigger a product request.
     Filters are applied with Enter or Apply Filters.
  ========================================================= */

  const [searchInput, setSearchInput] =
    useState(searchParams.get("search") || "");

  const [brandInput, setBrandInput] =
    useState(searchParams.get("brand") || "");

  const [minPriceInput, setMinPriceInput] =
    useState(searchParams.get("minPrice") || "");

  const [maxPriceInput, setMaxPriceInput] =
    useState(searchParams.get("maxPrice") || "");

  /* =========================================================
     SORT / UI STATE
  ========================================================= */

  const [sortBy, setSortBy] =
    useState<SortOption>("latest");

  const [showFilters, setShowFilters] =
    useState(false);

  /* =========================================================
     KEEP STATE SYNCHRONIZED WITH URL
  ========================================================= */

  useEffect(() => {
    const urlSearch =
      searchParams.get("search") || "";

    const urlCategory =
      searchParams.get("category") || "";

    const urlBrand =
      searchParams.get("brand") || "";

    const urlMinPrice =
      searchParams.get("minPrice") || "";

    const urlMaxPrice =
      searchParams.get("maxPrice") || "";

    setSearch(urlSearch);
    setSelectedCategory(urlCategory);
    setSelectedBrand(urlBrand);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);

    setSearchInput(urlSearch);
    setBrandInput(urlBrand);
    setMinPriceInput(urlMinPrice);
    setMaxPriceInput(urlMaxPrice);

    setFilterError("");
  }, [searchParams]);

  /* =========================================================
     UPDATE URL
  ========================================================= */

  const updateUrl = ({
    nextSearch = search,
    nextCategory = selectedCategory,
    nextBrand = selectedBrand,
    nextMinPrice = minPrice,
    nextMaxPrice = maxPrice,
  }: {
    nextSearch?: string;
    nextCategory?: string;
    nextBrand?: string;
    nextMinPrice?: string;
    nextMaxPrice?: string;
  } = {}) => {
    const params = new URLSearchParams();

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    if (nextBrand.trim()) {
      params.set("brand", nextBrand.trim());
    }

    if (nextMinPrice !== "") {
      params.set("minPrice", nextMinPrice);
    }

    if (nextMaxPrice !== "") {
      params.set("maxPrice", nextMaxPrice);
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
      {
        scroll: false,
      }
    );
  };

  /* =========================================================
     APPLY TEXT / PRICE FILTERS
  ========================================================= */

  const applyFilters = () => {
    const nextSearch = searchInput.trim();
    const nextBrand = brandInput.trim();
    const nextMinPrice = minPriceInput.trim();
    const nextMaxPrice = maxPriceInput.trim();

    const parsedMin =
      nextMinPrice === ""
        ? undefined
        : Number(nextMinPrice);

    const parsedMax =
      nextMaxPrice === ""
        ? undefined
        : Number(nextMaxPrice);

    /* ---------------------------------------------------------
       VALIDATE PRICE VALUES
    --------------------------------------------------------- */

    if (
      parsedMin !== undefined &&
      (!Number.isFinite(parsedMin) || parsedMin < 0)
    ) {
      setFilterError(
        "Enter a valid minimum price of zero or more."
      );
      return;
    }

    if (
      parsedMax !== undefined &&
      (!Number.isFinite(parsedMax) || parsedMax < 0)
    ) {
      setFilterError(
        "Enter a valid maximum price of zero or more."
      );
      return;
    }

    if (
      parsedMin !== undefined &&
      parsedMax !== undefined &&
      parsedMin > parsedMax
    ) {
      setFilterError(
        "Minimum price cannot be greater than maximum price."
      );
      return;
    }

    setFilterError("");

    setSearch(nextSearch);
    setSelectedBrand(nextBrand);
    setMinPrice(nextMinPrice);
    setMaxPrice(nextMaxPrice);

    updateUrl({
      nextSearch,
      nextCategory: selectedCategory,
      nextBrand,
      nextMinPrice,
      nextMaxPrice,
    });

    setShowFilters(false);
  };

  /* =========================================================
     HANDLE ENTER KEY
  ========================================================= */

  const handleFilterKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFilters();
    }
  };

  /* =========================================================
     GET CATEGORIES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const response = await fetch(
          "/api/categories?active=true",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load categories.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load categories."
          );
        }

        if (!cancelled) {
          setCategories(
            Array.isArray(data.categories)
              ? data.categories
              : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("CATEGORIES ERROR:", error);
        }
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     GET PRODUCTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        /* -----------------------------------------------------
           ONLY ACTIVE PRODUCTS
        ----------------------------------------------------- */

        params.set("active", "true");

        /* -----------------------------------------------------
           SEARCH
        ----------------------------------------------------- */

        if (search.trim()) {
          params.set("search", search.trim());
        }

        /* -----------------------------------------------------
           CATEGORY
        ----------------------------------------------------- */

        if (selectedCategory) {
          params.set("category", selectedCategory);
        }

        /* -----------------------------------------------------
           BRAND
        ----------------------------------------------------- */

        if (selectedBrand.trim()) {
          params.set("brand", selectedBrand.trim());
        }

        /* -----------------------------------------------------
           MINIMUM PRICE
        ----------------------------------------------------- */

        if (minPrice !== "") {
          params.set("minPrice", minPrice);
        }

        /* -----------------------------------------------------
           MAXIMUM PRICE
        ----------------------------------------------------- */

        if (maxPrice !== "") {
          params.set("maxPrice", maxPrice);
        }

        const response = await fetch(
          `/api/products?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load products: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load products."
          );
        }

        if (!cancelled) {
          setProducts(
            Array.isArray(data.products)
              ? data.products
              : []
          );
        }
      } catch (error) {
        if (cancelled) return;

        console.error("SHOP PRODUCTS ERROR:", error);

        setError(
          "Unable to load products right now. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
  ]);

  /* =========================================================
     HANDLE CATEGORY
  ========================================================= */

  const handleCategoryChange = (
    categorySlug: string
  ) => {
    setSelectedCategory(categorySlug);
    setFilterError("");

    updateUrl({
      nextSearch: search,
      nextCategory: categorySlug,
      nextBrand: selectedBrand,
      nextMinPrice: minPrice,
      nextMaxPrice: maxPrice,
    });

    setShowFilters(false);
  };

  /* =========================================================
     CLEAR SEARCH
  ========================================================= */

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setFilterError("");

    updateUrl({
      nextSearch: "",
      nextCategory: selectedCategory,
      nextBrand: selectedBrand,
      nextMinPrice: minPrice,
      nextMaxPrice: maxPrice,
    });
  };

  /* =========================================================
     CLEAR BRAND
  ========================================================= */

  const clearBrand = () => {
    setSelectedBrand("");
    setBrandInput("");
    setFilterError("");

    updateUrl({
      nextSearch: search,
      nextCategory: selectedCategory,
      nextBrand: "",
      nextMinPrice: minPrice,
      nextMaxPrice: maxPrice,
    });
  };

  /* =========================================================
     SORT PRODUCTS
  ========================================================= */

  const sortedProducts = useMemo(() => {
    const result = [...products];

    switch (sortBy) {
      case "price-low":
        return result.sort(
          (a, b) => a.price - b.price
        );

      case "price-high":
        return result.sort(
          (a, b) => b.price - a.price
        );

      case "name":
        return result.sort(
          (a, b) => a.name.localeCompare(b.name)
        );

      case "rating":
        return result.sort(
          (a, b) =>
            (b.rating || 0) - (a.rating || 0)
        );

      case "latest":
      default:
        return result;
    }
  }, [products, sortBy]);

  /* =========================================================
     CLEAR ALL FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");

    setSelectedCategory("");

    setSelectedBrand("");
    setBrandInput("");

    setMinPrice("");
    setMinPriceInput("");

    setMaxPrice("");
    setMaxPriceInput("");

    setSortBy("latest");
    setFilterError("");
    setShowFilters(false);

    router.push(pathname, {
      scroll: false,
    });
  };

  /* =========================================================
     CHECK WHETHER FILTERS ARE ACTIVE
  ========================================================= */

  const hasFilters =
    search.trim() !== "" ||
    selectedCategory !== "" ||
    selectedBrand !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sortBy !== "latest";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <Header />

      <main className={styles.shopPage}>
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className={styles.pageHeader}>
          <div className={styles.container}>
            <div>
              <span className={styles.eyebrow}>
                NEXINVENTIX STORE
              </span>

              <h1>Shop Technology</h1>

              <p>
                Discover laptops, computers, monitors,
                accessories and other technology products.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            SHOP CONTENT
        ================================================= */}

        <section className={styles.shopSection}>
          <div className={styles.container}>
            {/* MOBILE FILTER BUTTON */}

            <button
              type="button"
              className={styles.mobileFilterButton}
              onClick={() =>
                setShowFilters((value) => !value)
              }
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={18} />

              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <div className={styles.shopLayout}>
              {/* =================================================
                  SIDEBAR
              ================================================= */}

              <aside
                className={`${styles.sidebar} ${
                  showFilters ? styles.sidebarOpen : ""
                }`}
              >
                <div className={styles.sidebarHeader}>
                  <h2>Filters</h2>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={styles.clearButton}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className={styles.filterGroup}>
                  <label htmlFor="shop-search">
                    Search Products
                  </label>

                  <div className={styles.searchBox}>
                    <Search size={17} />

                    <input
                      id="shop-search"
                      type="text"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(event) =>
                        setSearchInput(event.target.value)
                      }
                      onKeyDown={handleFilterKeyDown}
                    />

                    {searchInput && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        aria-label="Clear search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* =================================================
                    CATEGORIES
                ================================================= */}

                <div className={styles.filterGroup}>
                  <label>Categories</label>

                  <div className={styles.categoryList}>
                    <button
                      type="button"
                      className={
                        selectedCategory === ""
                          ? styles.activeCategory
                          : ""
                      }
                      onClick={() =>
                        handleCategoryChange("")
                      }
                    >
                      All Products
                    </button>

                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category.id}
                        className={
                          selectedCategory === category.slug
                            ? styles.activeCategory
                            : ""
                        }
                        onClick={() =>
                          handleCategoryChange(category.slug)
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* =================================================
                    BRAND
                ================================================= */}

                <div className={styles.filterGroup}>
                  <label htmlFor="shop-brand">
                    Brand
                  </label>

                  <input
                    id="shop-brand"
                    type="text"
                    placeholder="e.g. Dell"
                    value={brandInput}
                    onChange={(event) =>
                      setBrandInput(event.target.value)
                    }
                    onKeyDown={handleFilterKeyDown}
                  />

                  {brandInput && (
                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={clearBrand}
                    >
                      Clear brand
                    </button>
                  )}
                </div>

                {/* =================================================
                    PRICE
                ================================================= */}

                <div className={styles.filterGroup}>
                  <label>Price Range (₦)</label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Min price"
                      aria-label="Minimum price"
                      value={minPriceInput}
                      onChange={(event) =>
                        setMinPriceInput(event.target.value)
                      }
                      onKeyDown={handleFilterKeyDown}
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Max price"
                      aria-label="Maximum price"
                      value={maxPriceInput}
                      onChange={(event) =>
                        setMaxPriceInput(event.target.value)
                      }
                      onKeyDown={handleFilterKeyDown}
                    />
                  </div>
                </div>

                {/* =================================================
                    FILTER VALIDATION ERROR
                ================================================= */}

                {filterError && (
                  <p role="alert">
                    {filterError}
                  </p>
                )}

                {/* =================================================
                    APPLY FILTERS
                ================================================= */}

                <button
                  type="button"
                  className={styles.mobileCloseFilters}
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
              </aside>

              {/* =================================================
                  PRODUCTS AREA
              ================================================= */}

              <div className={styles.productsArea}>
                {/* TOOLBAR */}

                <div className={styles.toolbar}>
                  <div className={styles.resultsCount}>
                    {loading
                      ? "Loading products..."
                      : `${sortedProducts.length} ${
                          sortedProducts.length === 1
                            ? "product"
                            : "products"
                        }`}
                  </div>

                  <div className={styles.sortWrapper}>
                    <label htmlFor="sort">
                      Sort by
                    </label>

                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(
                          event.target.value as SortOption
                        )
                      }
                    >
                      <option value="latest">
                        Latest
                      </option>

                      <option value="price-low">
                        Price: Low to High
                      </option>

                      <option value="price-high">
                        Price: High to Low
                      </option>

                      <option value="name">
                        Name: A-Z
                      </option>

                      <option value="rating">
                        Highest Rated
                      </option>
                    </select>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div className={styles.message}>
                    <p>{error}</p>

                    <button
                      type="button"
                      onClick={() =>
                        router.refresh()
                      }
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* LOADING */}

                {loading && !error && (
                  <div className={styles.loadingGrid}>
                    {Array.from({ length: 8 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className={styles.skeleton}
                        >
                          <div
                            className={styles.skeletonImage}
                          />

                          <div
                            className={styles.skeletonLine}
                          />

                          <div
                            className={`${styles.skeletonLine} ${styles.short}`}
                          />

                          <div
                            className={`${styles.skeletonLine} ${styles.priceSkeleton}`}
                          />
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* PRODUCTS */}

                {!loading &&
                  !error &&
                  sortedProducts.length > 0 && (
                    <div className={styles.productGrid}>
                      {sortedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                        />
                      ))}
                    </div>
                  )}

                {/* EMPTY */}

                {!loading &&
                  !error &&
                  sortedProducts.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        <Search size={28} />
                      </div>

                      <h2>No products found</h2>

                      <p>
                        {search
                          ? `We couldn't find any products matching "${search}".`
                          : "We couldn't find any products matching your current filters."}
                      </p>

                      <button
                        type="button"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: "40px 20px", textAlign: "center" }}>
          Loading shop...
        </main>
      }
    >
      <ShopContent />
    </Suspense>
  );
}