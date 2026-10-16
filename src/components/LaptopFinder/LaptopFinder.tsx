"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

import styles from "./LaptopFinder.module.css";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
};

type PriceRange = {
  label: string;
  min: number;
  max: number;
};

type PopularCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

type FilterResponse = {
  success: boolean;
  count?: number;
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  priceRanges: PriceRange[];
  popularCategories: PopularCategory[];
  message?: string;
};

/* =========================================================
   LAPTOP FINDER
========================================================= */

export default function LaptopFinder() {
  /* =========================================================
     DATABASE DATA
  ========================================================= */

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [brands, setBrands] =
    useState<string[]>([]);

  const [priceRanges, setPriceRanges] =
    useState<PriceRange[]>([]);

  const [popularCategories, setPopularCategories] =
    useState<PopularCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================================
     FILTER STATE
  ========================================================= */

  const [category, setCategory] =
    useState("");

  const [brand, setBrand] =
    useState("");

  const [priceRange, setPriceRange] =
    useState("");

  /* =========================================================
     LOAD CATEGORIES + BRANDS + PRICE RANGES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadFinderData() {
      try {
        setLoading(true);
        setError("");

        const [
          categoriesResponse,
          filtersResponse,
        ] = await Promise.all([
          fetch("/api/categories?active=true", {
            cache: "no-store",
          }),

          fetch("/api/products/filters", {
            cache: "no-store",
          }),
        ]);

        /* =====================================================
           CHECK API RESPONSES
        ===================================================== */

        if (!categoriesResponse.ok) {
          throw new Error(
            "Failed to load product categories."
          );
        }

        if (!filtersResponse.ok) {
          throw new Error(
            "Failed to load product filters."
          );
        }

        const categoryData =
          await categoriesResponse.json();

        const filterData: FilterResponse =
          await filtersResponse.json();

        if (
          !categoryData.success ||
          !filterData.success
        ) {
          throw new Error(
            filterData.message ||
              "Failed to load shopping filters."
          );
        }

        if (cancelled) return;

        /* =====================================================
           CATEGORIES
        ===================================================== */

        setCategories(
          Array.isArray(categoryData.categories)
            ? categoryData.categories
            : []
        );

        /* =====================================================
           BRANDS
        ===================================================== */

        setBrands(
          Array.isArray(filterData.brands)
            ? filterData.brands
            : []
        );

        /* =====================================================
           PRICE RANGES
        ===================================================== */

        setPriceRanges(
          Array.isArray(filterData.priceRanges)
            ? filterData.priceRanges
            : []
        );

        /* =====================================================
           POPULAR CATEGORIES
        ===================================================== */

        setPopularCategories(
          Array.isArray(filterData.popularCategories)
            ? filterData.popularCategories
            : []
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "FINDER DATA ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load shopping filters."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFinderData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     SELECTED PRICE RANGE
  ========================================================= */

  const selectedPriceRange = useMemo(() => {
    return priceRanges.find(
      (item) =>
        `${item.min}:${item.max}` === priceRange
    );
  }, [priceRanges, priceRange]);

  /* =========================================================
     SUBMIT FINDER
  ========================================================= */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const params = new URLSearchParams();

    /* ---------------------------------------------------------
       CATEGORY
    --------------------------------------------------------- */

    if (category) {
      params.set("category", category);
    }

    /* ---------------------------------------------------------
       BRAND
    --------------------------------------------------------- */

    if (brand) {
      params.set("brand", brand);
    }

    /* ---------------------------------------------------------
       PRICE
    --------------------------------------------------------- */

    if (selectedPriceRange) {
      params.set(
        "minPrice",
        String(selectedPriceRange.min)
      );

      params.set(
        "maxPrice",
        String(selectedPriceRange.max)
      );
    }

    const query = params.toString();

    window.location.href = query
      ? `/shop?${query}`
      : "/shop";
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setCategory("");
    setBrand("");
    setPriceRange("");
  };

  const hasFilters = Boolean(
    category ||
    brand ||
    priceRange
  );

  /* =========================================================
     QUICK CATEGORY LINKS
  ========================================================= */

  const quickCategories = popularCategories;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* =================================================
            HEADER
        ================================================= */}

        <div className={styles.heading}>
          <div className={styles.headingIcon}>
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <span className={styles.eyebrow}>
              SMART SHOPPING
            </span>

            <h2>
              Find The Right Tech
              <span>{" "}Faster.</span>
            </h2>

            <p>
              Tell us what you're looking for and we'll
              help you find the right technology for your needs.
            </p>
          </div>
        </div>

        {/* =================================================
            FINDER
        ================================================= */}

        <form
          className={styles.finder}
          onSubmit={handleSubmit}
        >
          <div className={styles.fields}>
            {/* =================================================
                CATEGORY
            ================================================= */}

            <div className={styles.field}>
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                disabled={loading}
              >
                <option value="">
                  {loading
                    ? "Loading categories..."
                    : "Any Category"}
                </option>

                {categories.map((item) => (
                  <option
                    key={item.id}
                    value={item.slug}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                BRAND
            ================================================= */}

            <div className={styles.field}>
              <label htmlFor="brand">
                Brand
              </label>

              <select
                id="brand"
                value={brand}
                onChange={(event) =>
                  setBrand(event.target.value)
                }
                disabled={loading}
              >
                <option value="">
                  {loading
                    ? "Loading brands..."
                    : "Any Brand"}
                </option>

                {brands.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                PRICE
            ================================================= */}

            <div className={styles.field}>
              <label htmlFor="priceRange">
                Price Range
              </label>

              <select
                id="priceRange"
                value={priceRange}
                onChange={(event) =>
                  setPriceRange(event.target.value)
                }
                disabled={
                  loading || priceRanges.length === 0
                }
              >
                <option value="">
                  {loading
                    ? "Loading price ranges..."
                    : priceRanges.length > 0
                      ? "Any Budget"
                      : "No price ranges available"}
                </option>

                {priceRanges.map((item) => (
                  <option
                    key={`${item.min}:${item.max}`}
                    value={`${item.min}:${item.max}`}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                BUTTON
            ================================================= */}

            <button
              type="submit"
              className={styles.findButton}
              disabled={loading}
            >
              <Search size={18} />

              <span>Find Products</span>

              <ArrowRight size={17} />
            </button>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <p role="alert">
              {error}
            </p>
          )}

          {/* =================================================
              CLEAR
          ================================================= */}

          {hasFilters && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          )}
        </form>

        {/* =================================================
            QUICK LINKS
        ================================================= */}

        <div className={styles.quickLinks}>
          <span>Popular categories:</span>

          {quickCategories.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setCategory(item.slug)}
            >
              {item.name}
            </button>
          ))}

          {brands.slice(0, 1).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setBrand(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}