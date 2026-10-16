"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ShoppingCart,
  Trash2,
  RefreshCw,
} from "lucide-react";

import Header from "@/components/Header/Header";
import styles from "./Wishlist.module.css";
import Footer from "@/components/Footer/Footer";

type WishlistProduct = {
  id: string;
  name: string;
  slug?: string;
  brand?: string | null;
  image?: string | null;
  price: number;
  oldPrice?: number | null;
  stock?: number;
};

const WISHLIST_KEY = "nexinventix-wishlist";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(price);
}

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      setLoading(true);
      setError("");

      try {
        const saved = localStorage.getItem(WISHLIST_KEY);
        const savedItems: unknown = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(savedItems)) {
          throw new Error("Your saved wishlist data is invalid.");
        }

        // Support both product objects and product IDs.
        const savedProducts = savedItems.filter(
          (item): item is WishlistProduct =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            typeof item.id === "string"
        );

        const savedIds = savedItems.filter(
          (item): item is string => typeof item === "string"
        );

        const response = await fetch(
          "/api/products?active=true&limit=100",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Unable to load products from the store.");
        }

        const data = await response.json();
        const allProducts: WishlistProduct[] = Array.isArray(
          data.products
        )
          ? data.products
          : [];

        const savedMap = new Map<string, WishlistProduct>();

        // Keep valid saved product objects as a fallback.
        for (const product of savedProducts) {
          savedMap.set(product.id, product);
        }

        // Refresh saved items with current catalogue data.
        for (const product of allProducts) {
          if (
            savedIds.includes(product.id) ||
            savedMap.has(product.id)
          ) {
            savedMap.set(product.id, product);
          }
        }

        // IDs with no matching catalogue record cannot be displayed.
        const validProducts = Array.from(savedMap.values()).filter(
          (product) =>
            typeof product.name === "string" &&
            typeof product.price === "number"
        );

        if (!cancelled) {
          setProducts(validProducts);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Wishlist loading error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading your wishlist."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  
function saveWishlist(nextProducts: WishlistProduct[]) {
  localStorage.setItem(
    "nexinventix-wishlist",
    JSON.stringify(nextProducts)
  );

  window.dispatchEvent(
    new Event("nexinventix-wishlist-updated")
  );
}


  
function removeProduct(id: string) {
  const nextProducts = products.filter(
    (product) => product.id !== id
  );

  // Update the page immediately.
  setProducts(nextProducts);

  // Update localStorage and notify the header.
  saveWishlist(nextProducts);
}


  
function clearWishlist() {
  setProducts([]);
  saveWishlist([]);
}


  function addToCart(product: WishlistProduct) {
    /*
      This button is intentionally linked to the next implementation
      step. We'll connect it to your existing CartContext after
      confirming the current context API.
    */
    window.location.href = `/product/${product.slug || product.id}`;
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              YOUR PERSONAL COLLECTION
            </span>

            <h1>
              Your Wishlist<span>.</span>
            </h1>

            <p>
              Keep your favourite gadgets in one place and come back
              when you're ready to choose.
            </p>

            <div className={styles.heroMeta}>
              <Heart size={17} />
              {loading
                ? "Loading saved products..."
                : `${products.length} saved ${
                    products.length === 1 ? "item" : "items"
                  }`}
            </div>
          </div>

          <div className={styles.heroIcon} aria-hidden="true">
            <Heart size={78} strokeWidth={1.2} />
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                SAVED FOR LATER
              </span>
              <h2>Favourite products</h2>
            </div>

            {products.length > 0 && !loading && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearWishlist}
              >
                <Trash2 size={16} />
                Clear wishlist
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={25} className={styles.spinner} />
              <p>Loading your wishlist...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState} role="alert">
              <div className={styles.emptyIcon}>
                <Heart size={30} />
              </div>
              <h3>We couldn't load your wishlist</h3>
              <p>{error}</p>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => window.location.reload()}
              >
                Try again
                <RefreshCw size={16} />
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Heart size={32} />
              </div>

              <h3>Your wishlist is waiting</h3>

              <p>
                You haven't saved any products yet. Browse the store
                and tap the heart on products you'd like to revisit.
              </p>

              <Link href="/shop" className={styles.primaryButton}>
                Explore products
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <article
                  className={styles.productCard}
                  key={product.id}
                >
                  <Link
                    href={`/product/${product.slug || product.id}`}
                    className={styles.productImage}
                  >
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <ShoppingCart size={34} />
                      </div>
                    )}
                  </Link>

                  <div className={styles.productInfo}>
                    {product.brand && (
                      <span className={styles.brand}>
                        {product.brand}
                      </span>
                    )}

                    <Link
                      href={`/product/${product.slug || product.id}`}
                      className={styles.productName}
                    >
                      {product.name}
                    </Link>

                    <div className={styles.priceRow}>
                      <strong>{formatPrice(product.price)}</strong>

                      {typeof product.oldPrice === "number" &&
                        product.oldPrice > product.price && (
                          <del>{formatPrice(product.oldPrice)}</del>
                        )}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.cartButton}
                        onClick={() => addToCart(product)}
                        disabled={
                          typeof product.stock === "number" &&
                          product.stock <= 0
                        }
                      >
                        <ShoppingCart size={16} />
                        {typeof product.stock === "number" &&
                        product.stock <= 0
                          ? "Out of stock"
                          : "View product"}
                      </button>

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeProduct(product.id)}
                        disabled={removingId === product.id}
                        aria-label={`Remove ${product.name} from wishlist`}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.bottomCta}>
          <div>
            <h2>Still looking for something?</h2>
            <p>Explore more products in the Nexinventix catalogue.</p>
          </div>

          <Link href="/shop" className={styles.ctaButton}>
            Continue shopping
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}