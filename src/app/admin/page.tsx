"use client";

import { useEffect, useState } from "react";

import {
  Package,
  Tags,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";

import Link from "next/link";

import "./admin.css";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  image?: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  sku: string;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  category?: Category | null;
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoadingProducts(true);
      setLoadingCategories(true);

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          fetch("/api/products?active=true"),
          fetch("/api/categories?admin=true"),
        ]);

      if (productsResponse.ok) {
        const productsData =
          await productsResponse.json();

        if (productsData.success) {
          setProducts(productsData.products || []);
        }
      }

      if (categoriesResponse.ok) {
        const categoriesData =
          await categoriesResponse.json();

        if (categoriesData.success) {
          setCategories(
            categoriesData.categories || []
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load dashboard data:",
        error
      );
    } finally {
      setLoadingProducts(false);
      setLoadingCategories(false);
    }
  }

  const totalProducts = products.length;

  const totalCategories = categories.length;

  const recentProducts = products.slice(0, 5);

  return (
    <div className="dashboard">

      {/* Page heading */}
      <div className="dashboard-heading">

        <div>
          <p className="dashboard-eyebrow">
            OVERVIEW
          </p>

          <h1>
            Welcome back, Admin
          </h1>

          <p className="dashboard-description">
            Here's what's happening with your
            gadget store today.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="dashboard-add-button"
        >
          <Plus size={17} />
          Add Product
        </Link>

      </div>

      {/* Stats */}
      <div className="dashboard-stats">

        <StatCard
          title="Total Products"
          value={
            loadingProducts
              ? "..."
              : totalProducts.toString()
          }
          icon={<Package size={20} />}
          href="/admin/products"
        />

        <StatCard
          title="Categories"
          value={
            loadingCategories
              ? "..."
              : totalCategories.toString()
          }
          icon={<Tags size={20} />}
          href="/admin/categories"
        />

        <StatCard
          title="Orders"
          value="0"
          icon={<ShoppingBag size={20} />}
          href="/admin/orders"
        />

        <StatCard
          title="Revenue"
          value="₦0"
          icon={<TrendingUp size={20} />}
          href="/admin/orders"
        />

      </div>

      {/* Main grid */}
      <div className="dashboard-grid">

        {/* Recent products */}
        <section className="dashboard-card dashboard-products">

          <div className="dashboard-card-header">

            <div>
              <h2>
                Recent Products
              </h2>

              <p>
                Your latest products
              </p>
            </div>

            <Link href="/admin/products">
              View all
              <ArrowUpRight size={14} />
            </Link>

          </div>

          {loadingProducts ? (

            <div className="empty-dashboard">

              <div className="empty-icon">
                <Package size={23} />
              </div>

              <h3>
                Loading products...
              </h3>

              <p>
                Fetching your latest products.
              </p>

            </div>

          ) : recentProducts.length === 0 ? (

            <div className="empty-dashboard">

              <div className="empty-icon">
                <Package size={23} />
              </div>

              <h3>
                No products yet
              </h3>

              <p>
                Add your first gadget to start
                building your store.
              </p>

              <Link
                href="/admin/products/new"
                className="empty-button"
              >
                <Plus size={15} />
                Add Product
              </Link>

            </div>

          ) : (

            <div className="dashboard-product-list">

              {recentProducts.map((product) => (

                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  className="dashboard-product"
                >

                  <div className="dashboard-product-image">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <Package size={20} />
                    )}

                  </div>

                  <div className="dashboard-product-info">

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.category?.name ||
                        "Uncategorized"}
                    </span>

                  </div>

                  <div className="dashboard-product-price">
                    ₦
                    {product.price.toLocaleString(
                      "en-NG"
                    )}
                  </div>

                  <ArrowUpRight size={15} />

                </Link>

              ))}

            </div>

          )}

        </section>

        {/* Quick actions */}
        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Manage your store
              </p>
            </div>

          </div>

          <div className="quick-actions">

            <Link
              href="/admin/products/new"
              className="quick-action"
            >
              <div className="quick-action-icon">
                <Package size={18} />
              </div>

              <div>
                <strong>
                  Add Product
                </strong>

                <span>
                  Add a new gadget
                </span>
              </div>

              <ArrowUpRight size={15} />
            </Link>

            <Link
              href="/admin/categories"
              className="quick-action"
            >
              <div className="quick-action-icon">
                <Tags size={18} />
              </div>

              <div>
                <strong>
                  Manage Categories
                </strong>

                <span>
                  Organize your products
                </span>
              </div>

              <ArrowUpRight size={15} />
            </Link>

            <Link
              href="/"
              className="quick-action"
            >
              <div className="quick-action-icon">
                <ShoppingBag size={18} />
              </div>

              <div>
                <strong>
                  View Store
                </strong>

                <span>
                  Open the storefront
                </span>
              </div>

              <ArrowUpRight size={15} />
            </Link>

          </div>

        </section>

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="stat-card"
    >
      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <ArrowUpRight size={15} />

      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

    </Link>
  );
}