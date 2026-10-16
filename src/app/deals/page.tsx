
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header/Header";
import ProductCard, {
  type Product,
} from "@/components/ProductCard/ProductCard";
import styles from "./Deals.module.css";
import Footer from "@/components/Footer/Footer";

type DealsResponse = {
  success: boolean;
  products?: Product[];
  message?: string;
};

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const loadDeals = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products?active=true&limit=100", {
        cache: "no-store",
        signal,
      });

      const result: DealsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load deals.");
      }

      const allProducts = Array.isArray(result.products)
        ? result.products
        : [];

      const discountedProducts = allProducts
        .filter((product) => {
          const currentPrice = Number(product.price);
          const oldPrice = Number(product.oldPrice);

          return (
            Number.isFinite(currentPrice) &&
            Number.isFinite(oldPrice) &&
            currentPrice > 0 &&
            oldPrice > currentPrice
          );
        })
        .sort((a, b) => {
          const discountA =
            ((Number(a.oldPrice) - Number(a.price)) /
              Number(a.oldPrice)) *
            100;

          const discountB =
            ((Number(b.oldPrice) - Number(b.price)) /
              Number(b.oldPrice)) *
            100;

          return discountB - discountA;
        });

      setProducts(discountedProducts);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      console.error("Failed to load deals:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading deals."
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadDeals(controller.signal);

    return () => controller.abort();
  }, [loadDeals, retryKey]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);

  const totalSavings = products.reduce(
    (total, product) =>
      total + (Number(product.oldPrice) - Number(product.price)),
    0
  );

  return (
    <>
      <Header />

      <main className={styles.dealsPage}>
        {/* Promotional hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              NEXINVENTIX SPECIAL OFFERS
            </span>

            <h1>
              Great Gadgets.
              <br />
              <span>Better Prices.</span>
            </h1>

            <p>
              Discover discounted technology and get more value
              on your next gadget purchase.
            </p>

            <Link href="/shop" className={styles.heroButton}>
              Explore All Products
              <span aria-hidden="true">→</span>
            </Link>

            <div className={styles.heroNote}>
              <span>✓</span>
              Only products with listed discounts appear below.
            </div>
          </div>

          <div className={styles.heroArtwork} aria-hidden="true">
            <div className={styles.artGlow} />
            <div className={styles.artCircle}>
              <span className={styles.artPercent}>%</span>
            </div>
            <span className={styles.artLabel}>SPECIAL OFFERS</span>
            <span className={styles.artSparkle}>✦</span>
            <span className={styles.artSparkleTwo}>✧</span>
          </div>
        </section>

        {/* Deals summary */}
        <section className={styles.summary}>
          <div className={styles.summaryText}>
            <span className={styles.sectionEyebrow}>SAVE MORE</span>
            <h2>Deals worth checking out</h2>
            <p>
              Compare original and current prices before you buy.
            </p>
          </div>

          <div className={styles.summaryStats}>
            <div className={styles.stat}>
              <strong>{loading ? "—" : products.length}</strong>
              <span>Discounted products</span>
            </div>

            <div className={styles.statDivider} />

            <div className={styles.stat}>
              <strong>
                {loading ? "—" : formatPrice(totalSavings)}
              </strong>
              <span>Combined listed savings</span>
            </div>
          </div>
        </section>

        {/* Product deals */}
        <section className={styles.dealsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                HANDPICKED FOR YOU
              </span>
              <h2>Current Deals</h2>
            </div>

            <Link href="/shop" className={styles.viewAll}>
              Shop all products <span aria-hidden="true">→</span>
            </Link>
          </div>

          {loading ? (
            <div className={styles.productGrid} aria-label="Loading deals">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className={styles.skeletonCard} key={index}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonLinePrice} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className={styles.stateCard} role="alert">
              <div className={styles.stateIcon}>!</div>
              <h3>We couldn’t load the deals</h3>
              <p>{error}</p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => setRetryKey((key) => key + 1)}
              >
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>%</div>
              <h3>No discounted products just yet</h3>
              <p>
                We haven’t found products with a valid original price
                and a lower current price. Explore the full store
                while we update our offers.
              </p>
              <Link href="/shop" className={styles.retryButton}>
                Browse the shop
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <>
              <p className={styles.resultsCount}>
                Showing {products.length}{" "}
                {products.length === 1 ? "deal" : "deals"}
              </p>

              <div className={styles.productGrid}>
                {products.map((product) => {
                  const oldPrice = Number(product.oldPrice);
                  const currentPrice = Number(product.price);

                  const discount = Math.round(
                    ((oldPrice - currentPrice) / oldPrice) * 100
                  );

                  return (
                    <div className={styles.dealCard} key={product.id}>
                      <span className={styles.discountBadge}>
                        {discount}% OFF
                      </span>

                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Bottom call to action */}
        <section className={styles.bottomCta}>
          <div>
            <span>STILL LOOKING FOR SOMETHING?</span>
            <h2>Your next favourite gadget could be here.</h2>
            <p>Explore the full collection at Nexinventix Store.</p>
          </div>

          <Link href="/shop" className={styles.ctaButton}>
            Explore the Store
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
