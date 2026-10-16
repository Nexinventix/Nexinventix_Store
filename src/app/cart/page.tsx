"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
} from "lucide-react";

import Header from "@/components/Header/Header";
import { useCart } from "@/context/CartContext";

import styles from "./Cart.module.css";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    itemCount,
  } = useCart();

  const [removingId, setRemovingId] = useState<string | null>(
    null
  );

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString("en-NG")}`;
  };

  const handleRemove = (productId: string) => {
    setRemovingId(productId);

    setTimeout(() => {
      removeFromCart(productId);
      setRemovingId(null);
    }, 150);
  };

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.container}>

          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <div className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>
                SHOPPING CART
              </span>

              <h1>Your Cart</h1>

              {itemCount > 0 && (
                <p>
                  You have {itemCount}{" "}
                  {itemCount === 1
                    ? "item"
                    : "items"}{" "}
                  in your cart.
                </p>
              )}
            </div>
          </div>

          {/* =====================================================
              EMPTY CART
          ===================================================== */}

          {items.length === 0 ? (
            <section className={styles.emptyCart}>

              <div className={styles.emptyIcon}>
                <ShoppingBag size={42} />
              </div>

              <h2>Your cart is empty</h2>

              <p>
                You haven't added any products to your
                cart yet. Explore our store and find
                something you love.
              </p>

              <Link
                href="/shop"
                className={styles.shopButton}
              >
                Start Shopping
              </Link>

            </section>
          ) : (

            /* ===================================================
               CART CONTENT
            =================================================== */

            <div className={styles.cartLayout}>

              {/* =================================================
                  CART ITEMS
              ================================================= */}

              <section className={styles.cartItems}>

                <div className={styles.cartItemsHeader}>
                  <h2>
                    Cart Items
                  </h2>

                  <span>
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </span>
                </div>

                <div className={styles.itemsList}>

                  {items.map((item) => (

                    <article
                      key={item.id}
                      className={`${styles.cartItem} ${
                        removingId === item.id
                          ? styles.removing
                          : ""
                      }`}
                    >

                      {/* PRODUCT IMAGE */}

                      <Link
                        href={`/products/${item.slug}`}
                        className={styles.itemImage}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <ShoppingBag size={30} />
                        )}
                      </Link>

                      {/* PRODUCT DETAILS */}

                      <div className={styles.itemDetails}>

                        {item.brand && (
                          <span
                            className={
                              styles.itemBrand
                            }
                          >
                            {item.brand}
                          </span>
                        )}

                        <Link
                          href={`/products/${item.slug}`}
                          className={
                            styles.itemName
                          }
                        >
                          {item.name}
                        </Link>

                        <span
                          className={
                            styles.itemSku
                          }
                        >
                          SKU: {item.sku}
                        </span>

                        <div
                          className={
                            styles.itemPriceMobile
                          }
                        >
                          {formatPrice(
                            item.price
                          )}
                        </div>

                        {/* QUANTITY */}

                        <div
                          className={
                            styles.quantitySection
                          }
                        >
                          <span>
                            Quantity
                          </span>

                          <div
                            className={
                              styles.quantityControl
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >=
                                item.stock
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* PRICE / REMOVE */}

                      <div
                        className={
                          styles.itemActions
                        }
                      >

                        <strong
                          className={
                            styles.itemPrice
                          }
                        >
                          {formatPrice(
                            item.price *
                              item.quantity
                          )}
                        </strong>

                        <button
                          type="button"
                          className={
                            styles.removeButton
                          }
                          onClick={() =>
                            handleRemove(
                              item.id
                            )
                          }
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 size={17} />

                          <span>
                            Remove
                          </span>
                        </button>

                      </div>

                    </article>

                  ))}

                </div>

                {/* CONTINUE SHOPPING */}

                <Link
                  href="/shop"
                  className={
                    styles.continueShopping
                  }
                >
                  <ArrowLeft size={17} />
                  Continue Shopping
                </Link>

              </section>

              {/* =================================================
                  ORDER SUMMARY
              ================================================= */}

              <aside className={styles.summary}>

                <h2>
                  Order Summary
                </h2>

                <div
                  className={
                    styles.summaryRows
                  }
                >

                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatPrice(
                        subtotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Delivery
                    </span>

                    <strong>
                      Calculated at checkout
                    </strong>
                  </div>

                </div>

                <div
                  className={
                    styles.summaryTotal
                  }
                >
                  <span>
                    Estimated Total
                  </span>

                  <strong>
                    {formatPrice(
                      subtotal
                    )}
                  </strong>
                </div>

                {/* CHECKOUT */}

                <button
                    type="button"
                    className={styles.checkoutButton}
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                </button>

                {/* TRUST FEATURES */}

                <div
                  className={
                    styles.trustFeatures
                  }
                >

                  <div
                    className={
                      styles.trustItem
                    }
                  >
                    <ShieldCheck
                      size={20}
                    />

                    <div>
                      <strong>
                        Secure Shopping
                      </strong>

                      <span>
                        Your information is
                        protected.
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      styles.trustItem
                    }
                  >
                    <Truck size={20} />

                    <div>
                      <strong>
                        Nationwide Delivery
                      </strong>

                      <span>
                        We deliver across
                        Nigeria.
                      </span>
                    </div>
                  </div>

                </div>

              </aside>

            </div>
          )}

        </div>
      </main>
    </>
  );
}