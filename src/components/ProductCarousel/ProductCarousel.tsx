"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import ProductCard, {
  type Product,
} from "../ProductCard/ProductCard";

import styles from "./ProductCarousel.module.css";

interface ProductCarouselProps {
  title: string;
  eyebrow?: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
}

export default function ProductCarousel({
  title,
  eyebrow = "OUR COLLECTION",
  description,
  products,
  viewAllHref = "/laptops",
}: ProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const amount = carouselRef.current.clientWidth * 0.82;

    carouselRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* SECTION HEADER */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.eyebrow}>
              {eyebrow}
            </span>

            <h2>{title}</h2>

            {description && (
              <p>{description}</p>
            )}
          </div>

          <div className={styles.headerActions}>
            <Link
              href={viewAllHref}
              className={styles.viewAll}
            >
              View All
              <ArrowRight size={15} />
            </Link>

            <div className={styles.arrows}>
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous products"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next products"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div
          ref={carouselRef}
          className={styles.carousel}
        >
          {products.map((product) => (
            <div
              className={styles.product}
              key={product.id}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* MOBILE SCROLL INDICATOR */}
        <div className={styles.scrollHint}>
          <span></span>
          <p>Swipe to explore</p>
        </div>
      </div>
    </section>
  );
}