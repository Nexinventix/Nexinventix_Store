"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Heart,
  Eye,
  ShoppingBag,
  Star,
  Check,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import styles from "./ProductCard.module.css";

const WISHLIST_KEY = "nexinventix-wishlist";
const WISHLIST_EVENT = "nexinventix-wishlist-updated";

export interface Product {
  id: string;
  name: string;
  slug: string;

  brand?: string | null;
  description?: string | null;

  image?: string | null;
  image2?: string | null;
  image3?: string | null;

  price: number;
  oldPrice?: number | null;
  sku: string;
  rating?: number | null;
  reviews?: number;

  specifications?: Record<string, string> | null;

  stock: number;

  featured?: boolean;
  isActive?: boolean;

  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
}

function readWishlist(): unknown[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(WISHLIST_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getWishlistItemId(item: unknown): string | null {
  if (typeof item === "string") {
    return item;
  }

  if (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    typeof item.id === "string"
  ) {
    return item.id;
  }

  return null;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [wishlistReady, setWishlistReady] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();

  const syncWishlistState = useCallback(() => {
    const savedProducts = readWishlist();

    setLiked(
      savedProducts.some(
        (item) => getWishlistItemId(item) === product.id
      )
    );
  }, [product.id]);

  useEffect(() => {
    syncWishlistState();
    setWishlistReady(true);

    const handleWishlistUpdate = () => {
      syncWishlistState();
    };

    window.addEventListener("storage", handleWishlistUpdate);
    window.addEventListener(
      WISHLIST_EVENT,
      handleWishlistUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleWishlistUpdate
      );

      window.removeEventListener(
        WISHLIST_EVENT,
        handleWishlistUpdate
      );
    };
  }, [syncWishlistState]);

  const handleToggleWishlist = () => {
    if (typeof window === "undefined") return;

    const savedProducts = readWishlist();

    const alreadySaved = savedProducts.some(
      (item) => getWishlistItemId(item) === product.id
    );

    const updatedWishlist = alreadySaved
      ? savedProducts.filter(
          (item) => getWishlistItemId(item) !== product.id
        )
      : [...savedProducts, product];

    try {
      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(updatedWishlist)
      );

      setLiked(!alreadySaved);

      window.dispatchEvent(new Event(WISHLIST_EVENT));
    } catch {
      // Storage may be unavailable or full.
      // Keep the current wishlist state unchanged.
      syncWishlistState();
    }
  };

  const rating =
    typeof product.rating === "number"
      ? product.rating
      : 0;

  const reviews =
    typeof product.reviews === "number"
      ? product.reviews
      : 0;

  const specifications = product.specifications || {};

  const specificationEntries =
    Object.entries(specifications).slice(0, 3);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) /
            product.oldPrice) *
            100
        )
      : 0;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice,
        stock: product.stock,
        sku: product.sku,
        category: product.category,
      },
      1
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageArea}>
        {discount > 0 && (
          <span className={styles.discount}>
            -{discount}%
          </span>
        )}

        {product.stock <= 5 && product.stock > 0 && (
          <span className={styles.stockBadge}>
            Only {product.stock} left
          </span>
        )}

        {product.stock === 0 && (
          <span className={styles.outOfStock}>
            Out of Stock
          </span>
        )}

        <button
          type="button"
          className={`${styles.wishlist} ${
            liked ? styles.liked : ""
          }`}
          onClick={handleToggleWishlist}
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={liked}
          disabled={!wishlistReady}
          title={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={18}
            fill={liked ? "currentColor" : "none"}
          />
        </button>

        <Link
          href={`/products/${product.slug}`}
          className={styles.imageLink}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShoppingBag size={30} />
            </div>
          )}
        </Link>

        <div className={styles.quickActions}>
          <Link
            href={`/products/${product.slug}`}
            className={styles.quickAction}
            aria-label="Quick view"
          >
            <Eye size={16} />
            <span>Quick View</span>
          </Link>
        </div>
      </div>

      <div className={styles.content}>
        {product.brand && (
          <span className={styles.brand}>
            {product.brand}
          </span>
        )}

        <Link
          href={`/products/${product.slug}`}
          className={styles.productName}
        >
          {product.name}
        </Link>

        {product.description && (
          <p className={styles.description}>
            {product.description}
          </p>
        )}

        {specificationEntries.length > 0 && (
          <div className={styles.specs}>
            {specificationEntries.map(([name, value]) => (
              <span key={name}>{value}</span>
            ))}
          </div>
        )}

        <div className={styles.rating}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                fill={
                  star <= Math.round(rating)
                    ? "currentColor"
                    : "none"
                }
              />
            ))}
          </div>

          {rating > 0 ? (
            <span>
              {rating.toFixed(1)} ({reviews})
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>

        <div className={styles.priceRow}>
          <div>
            <span className={styles.price}>
              ₦
              {product.price.toLocaleString("en-NG")}
            </span>

            {product.oldPrice &&
              product.oldPrice > product.price && (
                <span className={styles.oldPrice}>
                  ₦
                  {product.oldPrice.toLocaleString("en-NG")}
                </span>
              )}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.cartButton} ${
            added ? styles.added : ""
          }`}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || added}
        >
          {added ? (
            <>
              <Check size={17} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag size={17} />
              {product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}