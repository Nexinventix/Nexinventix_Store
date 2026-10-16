"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Store,
  RefreshCw,
  Tag,
} from "lucide-react";

import Header from "@/components/Header/Header";
import styles from "./Brands.module.css";
import Footer from "@/components/Footer/Footer";

type Product = {
  id: string;
  name: string;
  brand?: string | null;
  isActive?: boolean;
};

type BrandInfo = {
  name: string;
  count: number;
  initial: string;
};

type ApiResponse = {
  success?: boolean;
  products?: Product[];
  brands?: string[];
  message?: string;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const loadBrands = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const [filtersResponse, productsResponse] = await Promise.all([
        fetch("/api/products/filters", {
          cache: "no-store",
          signal,
        }),
        fetch("/api/products?active=true&limit=100", {
          cache: "no-store",
          signal,
        }),
      ]);

      if (!filtersResponse.ok || !productsResponse.ok) {
        throw new Error("Unable to load brands at the moment.");
      }

      const filtersData: ApiResponse = await filtersResponse.json();
      const productsData: ApiResponse = await productsResponse.json();

      if (
        filtersData.success === false ||
        productsData.success === false
      ) {
        throw new Error(
          filtersData.message ||
            productsData.message ||
            "The store returned an invalid response."
        );
      }

      const brandNames = Array.isArray(filtersData.brands)
        ? filtersData.brands
        : [];

      const products = Array.isArray(productsData.products)
        ? productsData.products
        : [];

      const counts = new Map<string, number>();

      for (const product of products) {
        const name = product.brand?.trim();

        if (name) {
          const key = name.toLocaleLowerCase();
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }

      const uniqueBrands = new Map<string, string>();

      // Include brands returned by the filters API.
      for (const name of brandNames) {
        if (typeof name !== "string" || !name.trim()) {
          continue;
        }

        const trimmedName = name.trim();
        const key = trimmedName.toLocaleLowerCase();

        if (!uniqueBrands.has(key)) {
          uniqueBrands.set(key, trimmedName);
        }
      }

      // Also include brands found directly in the product response.
      for (const product of products) {
        const name = product.brand?.trim();

        if (!name) {
          continue;
        }

        const key = name.toLocaleLowerCase();

        if (!uniqueBrands.has(key)) {
          uniqueBrands.set(key, name);
        }
      }

      const brandList: BrandInfo[] = Array.from(
        uniqueBrands.entries()
      )
        .map(([key, name]) => ({
          name,
          count: counts.get(key) ?? 0,
          initial: name.charAt(0).toUpperCase(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (!signal.aborted) {
        setBrands(brandList);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      console.error("Failed to load brands:", err);

      if (!signal.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading brands."
        );
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadBrands(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadBrands, retryKey]);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter((brand) =>
      brand.name.toLocaleLowerCase().includes(query)
    );
  }, [brands, search]);

  const totalProducts = brands.reduce(
    (total, brand) => total + brand.count,
    0
  );

  return (
    <>
      <Header />

      <main className={styles.brandsPage}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              DISCOVER YOUR FAVOURITES
            </span>

            <h1>
              Shop by
              <br />
              <span>Brand.</span>
            </h1>

            <p>
              Explore the technology brands available at Nexinventix.
              Find your preferred brand and browse its products in one
              place.
            </p>

            <a href="#brand-directory" className={styles.heroButton}>
              Explore Brands
              <ArrowRight size={18} />
            </a>

            <div className={styles.heroNote}>
              <Store size={16} />
              Brands are listed from products available in our store.
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div
              className={`${styles.visualCircle} ${styles.visualCircleOne}`}
            />

            <div
              className={`${styles.visualCircle} ${styles.visualCircleTwo}`}
            />

            <div
              className={`${styles.brandTile} ${styles.brandTileOne}`}
            >
              A
            </div>

            <div
              className={`${styles.brandTile} ${styles.brandTileTwo}`}
            >
              HP
            </div>

            <div
              className={`${styles.brandTile} ${styles.brandTileThree}`}
            >
              D
            </div>

            <div
              className={`${styles.brandTile} ${styles.brandTileFour}`}
            >
              +
            </div>

            <div className={styles.visualCaption}>
              <Tag size={16} />
              TECH YOU TRUST
            </div>
          </div>
        </section>

        {/* Directory summary */}
        <section className={styles.overview}>
          <div>
            <span className={styles.sectionEyebrow}>
              OUR COLLECTION
            </span>

            <h2>Find your brand</h2>

            <p>
              Browse the brands represented by products in our catalogue.
            </p>
          </div>

          <div className={styles.overviewStats}>
            <div>
              <strong>{loading ? "—" : brands.length}</strong>
              <span>Brands</span>
            </div>

            <div className={styles.statDivider} />

            <div>
              <strong>{loading ? "—" : totalProducts}</strong>
              <span>Products counted</span>
            </div>
          </div>
        </section>

        {/* Brand directory */}
        <section
          id="brand-directory"
          className={styles.directory}
        >
          <div className={styles.directoryHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                BRAND DIRECTORY
              </span>

              <h2>Explore all brands</h2>
            </div>

            <label className={styles.searchBox}>
              <Search size={19} />

              <input
                type="search"
                placeholder="Search brands..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search brands"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear brand search"
                >
                  ×
                </button>
              )}
            </label>
          </div>

          {loading ? (
            <div className={styles.brandGrid}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className={styles.skeletonCard}
                  key={index}
                >
                  <div className={styles.skeletonLogo} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className={styles.stateCard} role="alert">
              <div className={styles.stateIcon}>!</div>

              <h3>We couldn’t load the brands</h3>

              <p>{error}</p>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setRetryKey((key) => key + 1)}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>
                <Search size={24} />
              </div>

              <h3>
                {brands.length === 0
                  ? "No brands available yet"
                  : "No matching brands"}
              </h3>

              <p>
                {brands.length === 0
                  ? "Brands will appear here when active products with brand names are available in the store."
                  : `We couldn't find a brand matching "${search}". Try another name.`}
              </p>

              {search && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}

              {brands.length === 0 && (
                <Link
                  href="/shop"
                  className={styles.primaryButton}
                >
                  Browse the shop
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className={styles.resultsLine}>
                Showing {filteredBrands.length}{" "}
                {filteredBrands.length === 1 ? "brand" : "brands"}
              </div>

              <div className={styles.brandGrid}>
                {filteredBrands.map((brand, index) => {
                  const colorClass =
                    styles[`brandColor${index % 6}`];

                  return (
                    <Link
                      href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                      className={styles.brandCard}
                      key={brand.name.toLocaleLowerCase()}
                    >
                      <div
                        className={`${styles.brandLogo} ${colorClass ?? ""}`}
                      >
                        <span>{brand.initial}</span>
                      </div>

                      <div className={styles.brandInfo}>
                        <h3>{brand.name}</h3>

                        <p>
                          {brand.count}{" "}
                          {brand.count === 1 ? "product" : "products"}
                        </p>
                      </div>

                      <span className={styles.brandArrow}>
                        <ArrowRight size={18} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Bottom CTA */}
        <section className={styles.bottomCta}>
          <div>
            <span>MORE TO DISCOVER</span>

            <h2>Still exploring your options?</h2>

            <p>
              Browse our full collection of gadgets and accessories.
            </p>
          </div>

          <Link href="/shop" className={styles.ctaButton}>
            Shop All Products
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}