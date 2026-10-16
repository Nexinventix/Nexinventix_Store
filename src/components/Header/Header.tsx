"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Search,
  ShoppingCart,
  UserRound,
  Menu,
  X,
  ChevronDown,
  Heart,
  MapPin,
} from "lucide-react";

import styles from "./Header.module.css";
import { useCart } from "@/context/CartContext";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [categoryOpen, setCategoryOpen] =
    useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileCategoryOpen, setMobileCategoryOpen] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [mobileSearchQuery, setMobileSearchQuery] =
    useState("");

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (data.success) {
          setCategories(
            data.categories || []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load header categories:",
          error
        );
      }
    }

    loadCategories();
  }, []);


  useEffect(() => {
    const WISHLIST_KEY = "nexinventix-wishlist";
    const WISHLIST_EVENT = "nexinventix-wishlist-updated";

    function updateWishlistCount() {
      try {
        const saved = localStorage.getItem(WISHLIST_KEY);
        const products: unknown = saved
          ? JSON.parse(saved)
          : [];

        if (!Array.isArray(products)) {
          setWishlistCount(0);
          return;
        }

        const uniqueIds = new Set<string>();

        products.forEach((item: unknown) => {
          if (typeof item === "string") {
            uniqueIds.add(item);
          } else if (
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            typeof item.id === "string"
          ) {
            uniqueIds.add(item.id);
          }
        });

        setWishlistCount(uniqueIds.size);
      } catch {
        setWishlistCount(0);
      }
    }

    updateWishlistCount();

    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener(WISHLIST_EVENT, updateWishlistCount);

    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener(WISHLIST_EVENT, updateWishlistCount);
    };
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
    query: string
  ) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/shop");
      return;
    }

    router.push(
      `/shop?search=${encodeURIComponent(
        trimmedQuery
      )}`
    );

    setCategoryOpen(false);
    setMobileMenuOpen(false);
  }

  /* =========================================================
     CLOSE DESKTOP CATEGORY MENU
  ========================================================= */

  function closeCategoryMenu() {
    setCategoryOpen(false);
  }

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setMobileCategoryOpen(false);
  }

  return (
    <header className={styles.header}>

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div className={styles.topBar}>

        <div className={styles.container}>

          <div className={styles.topLeft}>

            <span>
              <MapPin size={14} />
              Lagos, Nigeria
            </span>

            <span>
              Need help? Call +234 906 472 8676
            </span>

          </div>

          <div className={styles.topRight}>

            <Link href="/track-order">
              Track Order
            </Link>

            <Link href="/contact">
              Contact Us
            </Link>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN HEADER
      ====================================================== */}

      <div className={styles.mainHeader}>

        <div className={styles.container}>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            className={
              styles.mobileMenuButton
            }
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Open menu"
          >
            <Menu size={25} />
          </button>

          {/* LOGO */}

          <Link
            href="/"
            className={styles.logo}
          >
              <img src="logo.png" alt="Inventix Logo" className={styles.logoInventix}/>
           
          </Link>

          {/* SEARCH */}

          <div
            className={
              styles.searchWrapper
            }
          >
            <form
              className={
                styles.searchForm
              }
              onSubmit={(event) =>
                handleSearch(
                  event,
                  searchQuery
                )
              }
            >
              <input
                type="search"
                placeholder="Search for laptops, gadgets and accessories..."
                aria-label="Search products"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
              />

              <button
                type="submit"
                aria-label="Search"
              >
                <Search size={21} />
              </button>
            </form>
          </div>

          {/* ACTIONS */}

          <div
            className={styles.actions}
          >

            {/* ACCOUNT */}

            {/* <Link
              href="/account"
              className={
                styles.actionItem
              }
            >
              <UserRound size={23} />

              <span
                className={
                  styles.actionText
                }
              >
                <small>
                  Hello, Sign in
                </small>

                <strong>
                  Account
                </strong>
              </span>
            </Link> */}

            {/* WISHLIST */}

            <Link
              href="/wishlist"
              className={
                styles.iconAction
              }
              aria-label="Wishlist"
            >
              <Heart size={23} />

              {wishlistCount > 0 && (
                <span className={styles.badge}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              className={
                styles.cartAction
              }
              aria-label="Shopping cart"
            >
              <ShoppingCart
                size={25}
                
              />
              <span
                className={
                  styles.badge
                }
              >
                {itemCount}
              </span>
              <span
                className={
                  styles.cartText
                }
              >
                <small>
                  Shopping
                </small>

                <strong>
                  Cart
                </strong>
              </span>

              <span
                className={
                  styles.badge
                }
              >
                {itemCount}
              </span>
            </Link>

          </div>

        </div>

      </div>

      {/* =====================================================
          DESKTOP NAVIGATION
      ====================================================== */}

      <nav
        className={
          styles.navigation
        }
      >

        <div
          className={
            styles.container
          }
        >

          {/* SHOP CATEGORIES */}

          <div
            className={
              styles.categoryMenu
            }
          >

            <button
              type="button"
              onClick={() =>
                setCategoryOpen(
                  (previous) =>
                    !previous
                )
              }
              className={
                styles.categoryButton
              }
              aria-expanded={
                categoryOpen
              }
            >
              <Menu size={19} />

              <span>
                Shop Categories
              </span>

              <ChevronDown
                size={17}
                className={
                  categoryOpen
                    ? styles.rotate
                    : ""
                }
              />
            </button>

            <div
              className={`${
                styles.categoryDropdown
              } ${
                categoryOpen
                  ? styles.categoryDropdownOpen
                  : ""
              }`}
            >

              {categories.length > 0 ? (
                categories.map(
                  (category) => (
                    <Link
                      href={`/shop?category=${encodeURIComponent(
                        category.slug
                      )}`}
                      key={category.id}
                      onClick={
                        closeCategoryMenu
                      }
                    >
                      {category.name}
                    </Link>
                  )
                )
              ) : (
                <span>
                  No categories available
                </span>
              )}

            </div>

          </div>

          {/* MAIN NAVIGATION */}

          <div
            className={
              styles.navLinks
            }
          >
            <Link href="/">
              Home
            </Link>

            <Link href="/shop">
              Shop
            </Link>

            <Link href="/deals">
              Deals
            </Link>

            <Link href="/brands">
              Brands
            </Link>

            <Link href="/about">
              About Us
            </Link>

            <Link href="/contact">
              Contact
            </Link>
          </div>

          {/* HOT DEALS */}

          <Link
            href="/deals"
            className={
              styles.dealsLink
            }
          >
            <span
              className={
                styles.dealDot
              }
            />

            Hot Deals
          </Link>

        </div>

      </nav>

      {/* =====================================================
          MOBILE DRAWER OVERLAY
      ====================================================== */}

      <div
        className={`${
          styles.mobileOverlay
        } ${
          mobileMenuOpen
            ? styles.mobileOverlayOpen
            : ""
        }`}
        onClick={closeMobileMenu}
      />

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}

      <aside
        className={`${
          styles.mobileDrawer
        } ${
          mobileMenuOpen
            ? styles.mobileDrawerOpen
            : ""
        }`}
      >

        {/* MOBILE HEADER */}

        <div
          className={
            styles.mobileDrawerHeader
          }
        >

          <Link
            href="/"
            className={styles.logo}
            onClick={
              closeMobileMenu
            }
          >
            <span
              className={
                styles.logoNex
              }
            >
              NEX
            </span>

            <span
              className={
                styles.logoInventix
              }
            >
              INVENTIX
            </span>
          </Link>

          <button
            type="button"
            onClick={
              closeMobileMenu
            }
            aria-label="Close menu"
            className={
              styles.closeButton
            }
          >
            <X size={25} />
          </button>

        </div>

        {/* MOBILE SEARCH */}

        <div
          className={
            styles.mobileSearch
          }
        >

          <form
            className={
              styles.searchForm
            }
            onSubmit={(event) =>
              handleSearch(
                event,
                mobileSearchQuery
              )
            }
          >

            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={
                mobileSearchQuery
              }
              onChange={(event) =>
                setMobileSearchQuery(
                  event.target.value
                )
              }
            />

            <button
              type="submit"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

          </form>

        </div>

        {/* MOBILE NAVIGATION */}

        <nav
          className={
            styles.mobileNav
          }
        >

          <Link
            href="/"
            onClick={
              closeMobileMenu
            }
          >
            Home
          </Link>

          <Link
            href="/shop"
            onClick={
              closeMobileMenu
            }
          >
            Shop All
          </Link>

          <Link
            href="/deals"
            onClick={
              closeMobileMenu
            }
          >
            Deals
          </Link>

          {/* MOBILE CATEGORIES */}

          <button
            type="button"
            className={
              styles.mobileCategoryTitle
            }
            onClick={() =>
              setMobileCategoryOpen(
                (previous) =>
                  !previous
              )
            }
            aria-expanded={
              mobileCategoryOpen
            }
          >
            <span>
              Categories
            </span>

            <ChevronDown
              size={17}
              className={
                mobileCategoryOpen
                  ? styles.rotate
                  : ""
              }
            />
          </button>

          {mobileCategoryOpen && (
            <div
              className={
                styles.mobileCategoryList
              }
            >

              {categories.map(
                (category) => (
                  <Link
                    href={`/shop?category=${encodeURIComponent(
                      category.slug
                    )}`}
                    key={category.id}
                    onClick={
                      closeMobileMenu
                    }
                    className={
                      styles.mobileCategoryLink
                    }
                  >
                    {category.name}
                  </Link>
                )
              )}

            </div>
          )}

          <Link
            href="/brands"
            onClick={
              closeMobileMenu
            }
          >
            Brands
          </Link>

          <Link
            href="/about"
            onClick={
              closeMobileMenu
            }
          >
            About Us
          </Link>

          <Link
            href="/contact"
            onClick={
              closeMobileMenu
            }
          >
            Contact
          </Link>

        </nav>

        {/* MOBILE ACCOUNT LINKS */}

        <div
          className={
            styles.mobileAccountLinks
          }
        >

          <Link
            href="/account"
            onClick={
              closeMobileMenu
            }
          >
            <UserRound size={19} />
            My Account
          </Link>

          <Link
            href="/wishlist"
            onClick={closeMobileMenu}
          >
            <Heart size={19} />
            <span>Wishlist</span>

            {wishlistCount > 0 && (
              <span className={styles.mobileCartCount}>
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            onClick={
              closeMobileMenu
            }
          >
            <ShoppingCart size={19} />

            <span>
              Cart
            </span>

            {itemCount > 0 && (
              <span className={styles.mobileCartCount}>
                {itemCount}
              </span>
            )}
          </Link>

        </div>

      </aside>

    </header>
  );
}