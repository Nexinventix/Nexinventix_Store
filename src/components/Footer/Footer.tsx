
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Truck,
} from "lucide-react";
import styles from "./Footer.module.css";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories?active=true");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error("Unable to load categories");
        }

        if (!cancelled) {
          const categoryList = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.categories)
              ? result.categories
              : [];

          setCategories(categoryList.slice(0, 6));
        }
      } catch (error) {
        console.error("Footer categories error:", error);
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleNewsletterSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // Newsletter subscriptions will be connected to a backend later.
    // Do not submit or store customer information until that is implemented.
    setEmail("");
  }

  return (
    <footer className={styles.footer}>
      {/* Newsletter / Call to action */}
      {/* <div className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <div className={styles.newsletterIcon}>
            <Mail size={26} />
          </div>

          <div>
            <h2>Stay Ahead of Technology</h2>
            <p>
              Discover the latest gadgets, new arrivals, and technology
              updates from Nexinventix.
            </p>
          </div>
        </div>

        <form
          className={styles.newsletterForm}
          onSubmit={handleNewsletterSubmit}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address"
            disabled
          />

          <button type="submit" disabled>
            Coming Soon
            <ArrowRight size={17} />
          </button>

          <span className={styles.newsletterNote}>
            Newsletter subscriptions are coming soon.
          </span>
        </form>
      </div> */}

      {/* Main footer */}
      <div className={styles.footerMain}>
        <div className={styles.footerGrid}>
          {/* Company information */}
          <div className={styles.companyColumn}>
            {/* <Link href="/" className={styles.logo}>
              <span className={styles.logoMark}>N</span>
              <span className={styles.logoText}>
                NEX<span>INVENTIX</span>
                <small>GADGET STORE</small>
              </span>
            </Link> */}
            <Link
                href="/"
                className={styles.logo}
                >
              <img src="logo2.png" alt="Inventix Logo" className={styles.logoInventix}/>
        
            </Link>

            <p className={styles.companyDescription}>
              Your destination for quality gadgets and technology.
              We make it easier to find the devices and accessories
              you need for work, learning, entertainment, and everyday life.
            </p>

            <div className={styles.location}>
              <MapPin size={18} />
              <span>Lagos, Nigeria</span>
            </div>

            
            <div className={styles.socialLinks}>
            <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
            >
                f
            </a>

            <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
            >
                ◎
            </a>
            </div>

          </div>

          {/* Quick links */}
          <div className={styles.footerColumn}>
            <h3>Quick Links</h3>

            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/shop">Shop All Products</Link>
              </li>
              <li>
                <Link href="/deals">Hot Deals</Link>
              </li>
              <li>
                <Link href="/brands">Shop by Brand</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Dynamic categories */}
          <div className={styles.footerColumn}>
            <h3>Shop Categories</h3>

            <ul>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/shop?category=${encodeURIComponent(
                        category.slug
                      )}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link href="/shop">Explore All Categories</Link>
                </li>
              )}

              <li>
                <Link href="/shop" className={styles.viewAll}>
                  View All Products
                  <ArrowRight size={14} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div className={styles.footerColumn}>
            <h3>Customer Service</h3>

            <ul>
              <li>
                <Link href="/contact">Contact Support</Link>
              </li>
              <li>
                <Link href="/track-order">Track Your Order</Link>
              </li>
              <li>
                <Link href="/account">My Account</Link>
              </li>
              <li>
                <Link href="/wishlist">My Wishlist</Link>
              </li>
              <li>
                <Link href="/cart">Shopping Cart</Link>
              </li>
            </ul>

            <div className={styles.supportCard}>
              <div className={styles.supportIcon}>
                <Phone size={17} />
              </div>

              <div>
                <span>Need assistance?</span>
                <Link href="/contact">Talk to our team</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust and delivery strip */}
      <div className={styles.serviceStrip}>
        <div className={styles.serviceItem}>
          <Truck size={21} />
          <div>
            <strong>Convenient Shopping</strong>
            <span>Shop from anywhere</span>
          </div>
        </div>

        <div className={styles.serviceItem}>
          <Smartphone size={21} />
          <div>
            <strong>Technology for Everyone</strong>
            <span>Find gadgets for your needs</span>
          </div>
        </div>

        <div className={styles.serviceItem}>
          <Mail size={21} />
          <div>
            <strong>Customer Support</strong>
            <span>We're here to help</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.footerBottom}>
        <p>
          © {new Date().getFullYear()} Nexinventix Technology.
          All rights reserved.
        </p>

        <div className={styles.bottomLinks}>
          <Link href="/about">About Nexinventix</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
