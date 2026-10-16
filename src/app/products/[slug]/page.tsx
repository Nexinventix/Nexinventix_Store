"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import Header from "@/components/Header/Header";
import { useCart } from "@/context/CartContext";
import styles from "./ProductDetails.module.css";

type Product = {
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

  stock: number;

  sku: string;

  rating?: number | null;
  reviews?: number;

  specifications?:
    | Record<string, string>
    | null;

  featured?: boolean;
  isActive?: boolean;

  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

interface ProductDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const router = useRouter();

  const { addToCart } = useCart();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [quantity, setQuantity] =
    useState(1);

  const [liked, setLiked] =
    useState(false);

  const [added, setAdded] =
    useState(false);

  const [slug, setSlug] =
    useState("");

  /* =========================================================
     GET SLUG
  ========================================================= */

  useEffect(() => {
    async function getParams() {
      const resolvedParams =
        await params;

      setSlug(
        resolvedParams.slug
      );
    }

    getParams();
  }, [params]);

  /* =========================================================
     GET PRODUCT
  ========================================================= */

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        /*
         * We first try the product
         * endpoint using the slug.
         */

        const response =
          await fetch(
            `/api/products/${slug}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Product not found."
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Product not found."
          );
        }

        setProduct(
          data.product
        );
      } catch (error) {
        console.error(
          "PRODUCT DETAILS ERROR:",
          error
        );

        setError(
          "We couldn't find this product."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  /* =========================================================
     PRODUCT IMAGES
  ========================================================= */

  const images = useMemo(() => {
    if (!product) return [];

    return [
      product.image,
      product.image2,
      product.image3,
    ].filter(
      (
        image
      ): image is string =>
        Boolean(image)
    );
  }, [product]);

  /* =========================================================
     SPECIFICATIONS
  ========================================================= */

  const specifications =
    product?.specifications || {};

  const specificationEntries =
    Object.entries(
      specifications
    );

  /* =========================================================
     DISCOUNT
  ========================================================= */

  const discount =
    product?.oldPrice &&
    product.oldPrice >
      product.price
      ? Math.round(
          ((product.oldPrice -
            product.price) /
            product.oldPrice) *
            100
        )
      : 0;

  /* =========================================================
     RATING
  ========================================================= */

  const rating =
    typeof product?.rating ===
    "number"
      ? product.rating
      : 0;

  const reviews =
    typeof product?.reviews ===
    "number"
      ? product.reviews
      : 0;

  /* =========================================================
     QUANTITY
  ========================================================= */

  const increaseQuantity =
    () => {
      if (!product) return;

      setQuantity(
        (current) =>
          Math.min(
            current + 1,
            product.stock
          )
      );
    };

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(
            current - 1,
            1
          )
      );
    };

/* =========================================================
   CART PRODUCT
========================================================= */

const getCartProduct = () => {
  if (!product) return null;

  return {
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
  };
};

/* =========================================================
   ADD TO CART
========================================================= */

const handleAddToCart = () => {
  if (!product || product.stock <= 0) return;

  const cartProduct = getCartProduct();

  if (!cartProduct) return;

  addToCart(cartProduct, quantity);

  setAdded(true);

  setTimeout(() => {
    setAdded(false);
  }, 1800);
};

/* =========================================================
   BUY NOW
========================================================= */

const handleBuyNow = () => {
  if (!product || product.stock <= 0) return;

  const cartProduct = getCartProduct();

  if (!cartProduct) return;

  addToCart(cartProduct, quantity);

  router.push("/cart");
};

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <>
        <Header />

        <main
          className={
            styles.page
          }
        >
          <div
            className={
              styles.loading
            }
          >
            <div
              className={
                styles.loadingImage
              }
            />

            <div
              className={
                styles.loadingContent
              }
            >
              <div
                className={
                  styles.loadingLine
                }
              />

              <div
                className={`${styles.loadingLine} ${styles.loadingShort}`}
              />

              <div
                className={`${styles.loadingLine} ${styles.loadingPrice}`}
              />

              <div
                className={
                  styles.loadingBlock
                }
              />
            </div>
          </div>
        </main>
      </>
    );
  }

  /* =========================================================
     ERROR / NOT FOUND
  ========================================================= */

  if (error || !product) {
    return (
      <>
        <Header />

        <main
          className={
            styles.page
          }
        >
          <div
            className={
              styles.notFound
            }
          >
            <div
              className={
                styles.notFoundIcon
              }
            >
              <ShoppingBag
                size={32}
              />
            </div>

            <h1>
              Product Not Found
            </h1>

            <p>
              The product you're
              looking for may have
              been removed or is no
              longer available.
            </p>

            <Link
              href="/shop"
              className={
                styles.backToShop
              }
            >
              <ArrowLeft
                size={17}
              />
              Back to Shop
            </Link>
          </div>
        </main>
      </>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <>
      <Header />

      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.container
          }
        >
          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <div
            className={
              styles.breadcrumb
            }
          >
            <Link href="/">
              Home
            </Link>

            <span>/</span>

            <Link href="/shop">
              Shop
            </Link>

            {product.category && (
              <>
                <span>/</span>

                <Link
                  href={`/shop?category=${product.category.slug}`}
                >
                  {
                    product.category
                      .name
                  }
                </Link>
              </>
            )}

            <span>/</span>

            <strong>
              {product.name}
            </strong>
          </div>

          {/* =================================================
              PRODUCT
          ================================================= */}

          <section
            className={
              styles.productSection
            }
          >
            {/* =================================================
                IMAGE GALLERY
            ================================================= */}

            <div
              className={
                styles.gallery
              }
            >
              <div
                className={
                  styles.mainImage
                }
              >
                {discount > 0 && (
                  <span
                    className={
                      styles.discount
                    }
                  >
                    -{discount}%
                  </span>
                )}

                <button
                  type="button"
                  className={`${styles.wishlist} ${
                    liked
                      ? styles.liked
                      : ""
                  }`}
                  onClick={() =>
                    setLiked(
                      (value) =>
                        !value
                    )
                  }
                  aria-label={
                    liked
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    size={20}
                    fill={
                      liked
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                {images.length >
                0 ? (
                  <img
                    src={
                      images[
                        selectedImage
                      ]
                    }
                    alt={
                      product.name
                    }
                  />
                ) : (
                  <div
                    className={
                      styles.noImage
                    }
                  >
                    <ShoppingBag
                      size={50}
                    />
                  </div>
                )}

                {images.length >
                  1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.imageArrow} ${styles.imageArrowLeft}`}
                      onClick={() =>
                        setSelectedImage(
                          (
                            current
                          ) =>
                            current ===
                            0
                              ? images.length -
                                1
                              : current -
                                1
                        )
                      }
                      aria-label="Previous image"
                    >
                      <ChevronLeft
                        size={20}
                      />
                    </button>

                    <button
                      type="button"
                      className={`${styles.imageArrow} ${styles.imageArrowRight}`}
                      onClick={() =>
                        setSelectedImage(
                          (
                            current
                          ) =>
                            current ===
                            images.length -
                              1
                              ? 0
                              : current +
                                1
                        )
                      }
                      aria-label="Next image"
                    >
                      <ChevronRight
                        size={20}
                      />
                    </button>
                  </>
                )}
              </div>

              {/* THUMBNAILS */}

              {images.length >
                1 && (
                <div
                  className={
                    styles.thumbnails
                  }
                >
                  {images.map(
                    (
                      image,
                      index
                    ) => (
                      <button
                        type="button"
                        key={
                          image
                        }
                        className={`${styles.thumbnail} ${
                          selectedImage ===
                          index
                            ? styles.activeThumbnail
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedImage(
                            index
                          )
                        }
                      >
                        <img
                          src={
                            image
                          }
                          alt={`${product.name} view ${
                            index +
                            1
                          }`}
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div
              className={
                styles.details
              }
            >
              {/* BRAND */}

              {product.brand && (
                <span
                  className={
                    styles.brand
                  }
                >
                  {product.brand}
                </span>
              )}

              {/* NAME */}

              <h1>
                {product.name}
              </h1>

              {/* RATING */}

              <div
                className={
                  styles.ratingRow
                }
              >
                <div
                  className={
                    styles.stars
                  }
                >
                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (star) => (
                      <Star
                        key={
                          star
                        }
                        size={15}
                        fill={
                          star <=
                          Math.round(
                            rating
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )
                  )}
                </div>

                {rating > 0 ? (
                  <span>
                    {rating.toFixed(
                      1
                    )}{" "}
                    (
                    {
                      reviews
                    }{" "}
                    reviews)
                  </span>
                ) : (
                  <span>
                    No reviews yet
                  </span>
                )}

                <span
                  className={
                    styles.separator
                  }
                >
                  |
                </span>

                <span>
                  SKU:{" "}
                  {
                    product.sku
                  }
                </span>
              </div>

              {/* DESCRIPTION */}

              {product.description && (
                <p
                  className={
                    styles.description
                  }
                >
                  {
                    product.description
                  }
                </p>
              )}

              {/* PRICE */}

              <div
                className={
                  styles.priceSection
                }
              >
                <div
                  className={
                    styles.currentPrice
                  }
                >
                  ₦
                  {product.price.toLocaleString(
                    "en-NG"
                  )}
                </div>

                {product.oldPrice &&
                  product.oldPrice >
                    product.price && (
                    <div
                      className={
                        styles.oldPrice
                      }
                    >
                      ₦
                      {product.oldPrice.toLocaleString(
                        "en-NG"
                      )}
                    </div>
                  )}

                {discount > 0 && (
                  <span
                    className={
                      styles.saveBadge
                    }
                  >
                    Save{" "}
                    {discount}%
                  </span>
                )}
              </div>

              {/* STOCK */}

              <div
                className={
                  styles.stockStatus
                }
              >
                {product.stock >
                0 ? (
                  <>
                    <Check
                      size={17}
                    />

                    <span>
                      In Stock
                    </span>

                    {product.stock <=
                      5 && (
                      <small>
                        Only{" "}
                        {
                          product.stock
                        }{" "}
                        left
                      </small>
                    )}
                  </>
                ) : (
                  <>
                    <span
                      className={
                        styles.outOfStock
                      }
                    >
                      Out of Stock
                    </span>
                  </>
                )}
              </div>

              {/* SPECIFICATIONS */}

              {specificationEntries.length >
                0 && (
                <div
                  className={
                    styles.specifications
                  }
                >
                  <h2>
                    Key Specifications
                  </h2>

                  <div
                    className={
                      styles.specificationList
                    }
                  >
                    {specificationEntries.map(
                      ([
                        name,
                        value,
                      ]) => (
                        <div
                          key={
                            name
                          }
                          className={
                            styles.specification
                          }
                        >
                          <span>
                            {
                              name
                            }
                          </span>

                          <strong>
                            {
                              value
                            }
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* PURCHASE */}

              {product.stock >
                0 && (
                <div
                  className={
                    styles.purchase
                  }
                >
                  <div
                    className={
                      styles.quantity
                    }
                  >
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <=
                        1
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus
                        size={16}
                      />
                    </button>

                    <span>
                      {
                        quantity
                      }
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                        product.stock
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus
                        size={16}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`${styles.addToCart} ${
                      added
                        ? styles.added
                        : ""
                    }`}
                    onClick={
                      handleAddToCart
                    }
                    disabled={
                      added
                    }
                  >
                    {added ? (
                      <>
                        <Check
                          size={18}
                        />

                        Added to
                        Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag
                          size={18}
                        />

                        Add to
                        Cart
                      </>
                    )}
                  </button>

                 <button
                    type="button"
                    className={styles.buyNow}
                    onClick={handleBuyNow}
                    >
                    Buy Now
                </button>
                </div>
              )}

              {/* =================================================
                  SERVICE FEATURES
              ================================================= */}

              <div
                className={
                  styles.serviceFeatures
                }
              >
                <div
                  className={
                    styles.serviceFeature
                  }
                >
                  <Truck
                    size={21}
                  />

                  <div>
                    <strong>
                      Delivery
                    </strong>

                    <span>
                      Fast delivery
                      across
                      Nigeria
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.serviceFeature
                  }
                >
                  <ShieldCheck
                    size={21}
                  />

                  <div>
                    <strong>
                      Genuine
                      Products
                    </strong>

                    <span>
                      Quality
                      technology
                      products
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.serviceFeature
                  }
                >
                  <RotateCcw
                    size={21}
                  />

                  <div>
                    <strong>
                      Support
                    </strong>

                    <span>
                      Reliable
                      customer
                      support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              FULL SPECIFICATIONS
          ================================================= */}

          {specificationEntries.length >
            0 && (
            <section
              className={
                styles.fullSpecifications
              }
            >
              <div
                className={
                  styles.sectionHeading
                }
              >
                <span>
                  PRODUCT DETAILS
                </span>

                <h2>
                  Specifications
                </h2>
              </div>

              <div
                className={
                  styles.specificationTable
                }
              >
                {specificationEntries.map(
                  ([
                    name,
                    value,
                  ]) => (
                    <div
                      key={
                        name
                      }
                      className={
                        styles.tableRow
                      }
                    >
                      <span>
                        {
                          name
                        }
                      </span>

                      <strong>
                        {
                          value
                        }
                      </strong>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {product.description && (
            <section
              className={
                styles.descriptionSection
              }
            >
              <div
                className={
                  styles.sectionHeading
                }
              >
                <span>
                  ABOUT THIS PRODUCT
                </span>

                <h2>
                  Product Description
                </h2>
              </div>

              <p>
                {
                  product.description
                }
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}