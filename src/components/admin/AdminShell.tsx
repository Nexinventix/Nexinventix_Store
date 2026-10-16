"use client";

import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Settings,
  Menu,
  X,
  LogOut,
  Store,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import "./AdminShell.css";

type AdminShellProps = {
  children: React.ReactNode;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminShell({
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="admin-shell">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="admin-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >
        <div className="admin-sidebar-top">

          <Link
            href="/admin"
            className="admin-logo"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span className="admin-logo-mark">
              N
            </span>

            <span>
              NEXINVENTIX
              <small>GADGET STORE</small>
            </span>
          </Link>

          <button
            className="admin-close-mobile"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="admin-navigation">

          <p className="admin-nav-label">
            MANAGEMENT
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(
                    item.href
                  );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${
                  isActive
                    ? "admin-nav-active"
                    : ""
                }`}
                onClick={() =>
                  setSidebarOpen(false)
                }
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            href="/"
            className="admin-store-link"
          >
            <Store size={18} />
            <span>View Store</span>
          </Link>

          <button className="admin-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* Main area */}
      <div className="admin-main">

        <header className="admin-header">

          <button
            className="admin-menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="admin-header-title">
            <span>Admin Dashboard</span>
          </div>

          <div className="admin-header-right">

            <div className="admin-user">
              <div className="admin-avatar">
                N
              </div>

              <div>
                <strong>
                  Administrator
                </strong>

                <span>
                  Store Manager
                </span>
              </div>
            </div>

          </div>

        </header>

        <main className="admin-content">
          {children}
        </main>

      </div>

    </div>
  );
}