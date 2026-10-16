"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
} from "lucide-react";

import styles from "./HeroCarousel.module.css";

const slides = [
  {
    id: 1,
    eyebrow: "NEXINVENTIX GADGET STORE",
    title: "Technology For",
    highlight: "Your Next Move.",
    description:
      "Shop laptops, computers, gadgets and accessories for work, school, business, creativity and everyday life.",
    button: "Shop Now",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Laptop and technology workspace",
  },
  {
    id: 2,
    eyebrow: "POWER YOUR WORK",
    title: "Built For",
    highlight: "Big Ideas.",
    description:
      "Discover reliable computers and technology for professionals, developers, creators, students and businesses.",
    button: "Explore Computers",
    href: "/shop?category=laptops",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Modern laptop for work and productivity",
  },
  {
    id: 3,
    eyebrow: "COMPLETE YOUR SETUP",
    title: "Everything You",
    highlight: "Need. In One Place.",
    description:
      "From monitors and storage to accessories, networking and everyday tech essentials, find what you need at Nexinventix.",
    button: "Explore Accessories",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Complete technology workspace setup",
  },
];

const AUTO_PLAY_TIME = 6000;

export default function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setActiveSlide(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, AUTO_PLAY_TIME);

    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = slides[activeSlide];

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Nexinventix featured products"
    >
      <div className={styles.backgroundGlow}></div>

      <div className={styles.heroContainer}>
        {/* CONTENT */}
        <div className={styles.content} key={`content-${slide.id}`}>
          <div className={styles.eyebrow}>
            <span></span>
            {slide.eyebrow}
          </div>

          <h1>
            {slide.title}
            <br />
            <strong>{slide.highlight}</strong>
          </h1>

          <p>{slide.description}</p>

          <div className={styles.buttons}>
            <Link href={slide.href} className={styles.primaryButton}>
              {slide.button}
              <ArrowRight size={18} />
            </Link>

            <Link href="/shop" className={styles.secondaryButton}>
              Shop All
            </Link>
          </div>

          <div className={styles.trustPoints}>
            <div>
              <ShieldCheck size={17} />
              <span>Genuine Products</span>
            </div>

            <div>
              <Truck size={17} />
              <span>Nationwide Delivery</span>
            </div>
          </div>
        </div>

        {/* PRODUCT IMAGE */}
        <div className={styles.visual} key={`visual-${slide.id}`}>
          <div className={styles.imageGlow}></div>

          <div className={styles.imageWrapper}>
            <img src={slide.image} alt={slide.imageAlt} />
          </div>

          <div className={styles.floatingCard}>
            <span>Premium</span>
            <strong>Technology</strong>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className={styles.controls}>
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous slide"
          className={styles.arrowButton}
        >
          <ChevronLeft size={20} />
        </button>

        <div className={styles.dots}>
          {slides.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeSlide ? "true" : undefined}
              className={`${styles.dot} ${
                index === activeSlide ? styles.activeDot : ""
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className={styles.arrowButton}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* SLIDE NUMBER */}
      <div className={styles.slideNumber}>
        <strong>{String(activeSlide + 1).padStart(2, "0")}</strong>

        <span>/</span>

        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}