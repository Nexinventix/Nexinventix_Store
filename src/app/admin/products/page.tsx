"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Package,
  ChevronDown,
  X,
  Loader2,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";

import "./products.css";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  sku: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string | null;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  category: Category;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  const [deleting, setDeleting] = useState(false);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/products",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch products."
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(
        "LOAD PRODUCTS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  async function loadCategories() {
    try {
      const response = await fetch(
        "/api/categories?admin=true",
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
        "LOAD CATEGORIES ERROR:",
        error
      );
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return products.filter(
      (product) => {
        const matchesSearch =
          !query ||
          product.name
            .toLowerCase()
            .includes(query) ||
          product.sku
            .toLowerCase()
            .includes(query) ||
          product.brand
            ?.toLowerCase()
            .includes(query);

        const matchesCategory =
          categoryFilter === "all" ||
          product.category?.id ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    products,
    search,
    categoryFilter,
  ]);

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  async function handleDelete() {
    if (!deleteProduct) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/products/${deleteProduct.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to delete product."
        );

        return;
      }

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !==
            deleteProduct.id
        )
      );

      setDeleteProduct(null);
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      alert(
        "Something went wrong while deleting the product."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =========================================================
     FORMAT PRICE
  ========================================================= */

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }
    ).format(price);
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(date));
  }

  return (
    <div className="products-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="products-page-header">

        <div>
          <p className="products-eyebrow">
            CATALOG / PRODUCTS
          </p>

          <h1>Products</h1>

          <p className="products-description">
            Manage your gadgets, pricing,
            stock and product information.
          </p>
        </div>

        <a
          href="/admin/products/new"
          className="add-product-button"
        >
          <Plus size={15} />
          Add Product
        </a>

      </div>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="products-summary">

        <div className="summary-card">

          <div className="summary-card-icon">
            <Package size={16} />
          </div>

          <div>
            <span>Total Products</span>

            <strong>
              {products.length}
            </strong>
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-card-icon">
            <Eye size={16} />
          </div>

          <div>
            <span>Active</span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.isActive
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-card-icon">
            <Star size={16} />
          </div>

          <div>
            <span>Featured</span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.featured
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-card-icon">
            <SlidersHorizontal
              size={16}
            />
          </div>

          <div>
            <span>Categories</span>

            <strong>
              {categories.length}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <div className="products-toolbar">

        <div className="products-search">

          <Search size={15} />

          <input
            type="text"
            placeholder="Search products, SKU or brand..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}

        </div>


        <div className="products-filter">

          <SlidersHorizontal
            size={14}
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}

          </select>

          <ChevronDown size={13} />

        </div>

      </div>


      {/* =====================================================
          RESULT COUNT
      ====================================================== */}

      <div className="products-results-bar">

        <span>
          Showing{" "}
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "product"
            : "products"}
        </span>

        {(search ||
          categoryFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter(
                "all"
              );
            }}
          >
            Clear filters
          </button>
        )}

      </div>


      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="products-table-card">

        {loading ? (
          <div className="products-loading">

            <Loader2
              size={22}
              className="products-spinner"
            />

            <p>
              Loading products...
            </p>

          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="products-empty">

            <div className="products-empty-icon">
              <Package size={23} />
            </div>

            <h3>
              {products.length === 0
                ? "No products yet"
                : "No products found"}
            </h3>

            <p>
              {products.length === 0
                ? "Add your first gadget to start building your catalog."
                : "Try adjusting your search or category filter."}
            </p>

            {products.length === 0 && (
              <a
                href="/admin/products/new"
                className="empty-add-button"
              >
                <Plus size={14} />
                Add Product
              </a>
            )}

          </div>
        ) : (
          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>SKU</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>ADDED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (
                    <tr key={product.id}>

                      {/* PRODUCT */}

                      <td>

                        <div className="product-table-info">

                          <div className="product-table-image">

                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                              />
                            ) : (
                              <Package
                                size={18}
                              />
                            )}

                          </div>

                          <div>

                            <strong>
                              {product.name}
                            </strong>

                            {product.brand && (
                              <span>
                                {
                                  product.brand
                                }
                              </span>
                            )}

                          </div>

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        <span className="category-badge">
                          {
                            product
                              .category
                              ?.name ||
                            "Uncategorized"
                          }
                        </span>

                      </td>


                      {/* SKU */}

                      <td>

                        <span className="sku-text">
                          {product.sku}
                        </span>

                      </td>


                      {/* PRICE */}

                      <td>

                        <div className="product-price">

                          <strong>
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                          {product.oldPrice && (
                            <del>
                              {formatPrice(
                                product.oldPrice
                              )}
                            </del>
                          )}

                        </div>

                      </td>


                      {/* STOCK */}

                      <td>

                        <span
                          className={`stock-badge ${
                            product.stock ===
                            0
                              ? "out"
                              : product.stock <=
                                3
                              ? "low"
                              : "available"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} in stock`}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <div className="product-statuses">

                          <span
                            className={`status-badge ${
                              product.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {product.isActive ? (
                              <Eye size={10} />
                            ) : (
                              <EyeOff
                                size={10}
                              />
                            )}

                            {product.isActive
                              ? "Active"
                              : "Hidden"}
                          </span>

                          {product.featured && (
                            <span className="featured-badge">

                              <Star
                                size={9}
                              />

                              Featured

                            </span>
                          )}

                        </div>

                      </td>


                      {/* DATE */}

                      <td>

                        <span className="date-text">
                          {formatDate(
                            product.createdAt
                          )}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="product-actions">

                        <button
                            type="button"
                            className="product-action edit"
                            onClick={() =>
                                (window.location.href =
                                `/admin/products/${product.id}/edit`)
                            }
                            title="Edit product"
                            >
                            <Pencil size={15} />
                        </button>
 
                          <button
                            type="button"
                            className="product-action delete"
                            title="Delete product"
                            onClick={() =>
                              setDeleteProduct(
                                product
                              )
                            }
                          >
                            <Trash2
                              size={14}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteProduct && (
        <div
          className="delete-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteProduct(null);
            }
          }}
        >

          <div className="delete-modal">

            <button
              type="button"
              className="delete-modal-close"
              onClick={() =>
                setDeleteProduct(null)
              }
            >
              <X size={16} />
            </button>


            <div className="delete-modal-icon">
              <Trash2 size={19} />
            </div>


            <h2>
              Delete Product?
            </h2>

            <p>
              You are about to permanently
              delete{" "}
              <strong>
                {deleteProduct.name}
              </strong>
              .
              <br />
              This action cannot be undone.
            </p>


            <div className="delete-modal-actions">

              <button
                type="button"
                className="cancel-delete"
                onClick={() =>
                  setDeleteProduct(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={14}
                      className="products-spinner"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete Product
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}