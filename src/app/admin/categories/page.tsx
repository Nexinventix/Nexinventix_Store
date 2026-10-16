"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tags,
  Package,
  X,
  Check,
  Loader2,
} from "lucide-react";

import "./categories.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deleteCategory, setDeleteCategory] =
    useState<Category | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  async function fetchCategories() {
    try {
      setRefreshing(true);

      const response = await fetch(
        "/api/categories?admin=true",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleAdd() {
    setEditingCategory(null);
    setShowModal(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setShowModal(true);
  }

  function handleSaved() {
    setShowModal(false);
    setEditingCategory(null);
    fetchCategories();
  }

  async function handleDelete() {
    if (!deleteCategory) return;

    try {
      const response = await fetch(
        `/api/categories/${deleteCategory.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete category.");
        return;
      }

      setDeleteCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  const filteredCategories =
    categories.filter((category) => {
      const value = search.toLowerCase();

      return (
        category.name
          .toLowerCase()
          .includes(value) ||
        category.slug
          .toLowerCase()
          .includes(value)
      );
    });

  return (
    <div className="categories-page">

      {/* Header */}
      <div className="categories-heading">

        <div>
          <p className="categories-eyebrow">
            CATALOG
          </p>

          <h1>Categories</h1>

          <p>
            Organize your gadgets into easy-to-browse
            collections.
          </p>
        </div>

        <button
          className="category-add-button"
          onClick={handleAdd}
        >
          <Plus size={17} />
          Add Category
        </button>

      </div>

      {/* Toolbar */}
      <div className="categories-toolbar">

        <div className="category-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}

        </div>

        <div className="category-count">
          {refreshing && (
            <Loader2
              size={14}
              className="category-spinner"
            />
          )}

          {filteredCategories.length}{" "}
          {filteredCategories.length === 1
            ? "category"
            : "categories"}
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="categories-loading">

          <Loader2
            size={25}
            className="category-spinner"
          />

          <span>
            Loading categories...
          </span>

        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="categories-empty">

          <div className="categories-empty-icon">
            <Tags size={27} />
          </div>

          <h2>
            {search
              ? "No categories found"
              : "No categories yet"}
          </h2>

          <p>
            {search
              ? "Try a different search term."
              : "Create your first category to start organizing your store."}
          </p>

          {!search && (
            <button
              className="category-empty-button"
              onClick={handleAdd}
            >
              <Plus size={16} />
              Create Category
            </button>
          )}

        </div>
      ) : (
        <div className="categories-grid">

          {filteredCategories.map(
            (category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() =>
                  handleEdit(category)
                }
                onDelete={() =>
                  setDeleteCategory(category)
                }
              />
            )
          )}

        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteCategory && (
        <DeleteModal
          category={deleteCategory}
          onCancel={() =>
            setDeleteCategory(null)
          }
          onConfirm={handleDelete}
        />
      )}

    </div>
  );
}


/* =========================================
   CATEGORY CARD
========================================= */

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="category-card">

      <div className="category-card-image">

        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
          />
        ) : (
          <Tags size={31} />
        )}

        <span
          className={`category-status ${
            category.isActive
              ? "category-status-active"
              : "category-status-inactive"
          }`}
        >
          <span />
          {category.isActive
            ? "Active"
            : "Inactive"}
        </span>

      </div>

      <div className="category-card-content">

        <div className="category-card-top">

          <div>
            <h3>{category.name}</h3>

            <span>
              /{category.slug}
            </span>
          </div>

          <div className="category-product-count">
            <Package size={14} />
            {category._count.products}
          </div>

        </div>

        <p>
          {category.description ||
            "No description added yet."}
        </p>

        <div className="category-card-actions">

          <button
            className="category-edit"
            onClick={onEdit}
          >
            <Pencil size={14} />
            Edit
          </button>

          <button
            className="category-delete"
            onClick={onDelete}
          >
            <Trash2 size={14} />
            Delete
          </button>

        </div>

      </div>

    </article>
  );
}


/* =========================================
   CATEGORY MODAL
========================================= */

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(
    category?.name || ""
  );

  const [slug, setSlug] = useState(
    category?.slug || ""
  );

  const [description, setDescription] =
    useState(category?.description || "");

  const [image, setImage] = useState(
    category?.image || ""
  );

  const [isActive, setIsActive] =
    useState(category?.isActive ?? true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!category) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Category slug is required.");
      return;
    }

    try {
      setSaving(true);

      const endpoint = category
        ? `/api/categories/${category.id}`
        : "/api/categories";

      const method = category
        ? "PUT"
        : "POST";

      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            description,
            image,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to save category."
        );
        return;
      }

      onSaved();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="admin-modal">

        <div className="admin-modal-header">

          <div>
            <p>
              {category
                ? "UPDATE CATEGORY"
                : "NEW CATEGORY"}
            </p>

            <h2>
              {category
                ? "Edit Category"
                : "Add Category"}
            </h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>

        </div>

        <form
          className="category-form"
          onSubmit={handleSubmit}
        >

          <div className="form-field">

            <label>
              Category Name
              <span>*</span>
            </label>

            <input
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value
                )
              }
              placeholder="e.g. Laptops"
            />

          </div>

          <div className="form-field">

            <label>
              Slug
              <span>*</span>
            </label>

            <div className="slug-input">

              <span>/</span>

              <input
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                placeholder="laptops"
              />

            </div>

            <small>
              Used in product URLs and category
              filtering.
            </small>

          </div>

          <div className="form-field">

            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Brief description of this category..."
              rows={4}
            />

          </div>

          <div className="form-field">

            <label>
              Image URL
            </label>

            <input
              value={image}
              onChange={(event) =>
                setImage(event.target.value)
              }
              placeholder="https://..."
            />

            <small>
              We'll use image URLs, so no file upload
              is required.
            </small>

          </div>

          <label className="category-toggle">

            <div>

              <strong>
                Active Category
              </strong>

              <span>
                Visible throughout the store.
              </span>

            </div>

            <button
              type="button"
              className={`toggle ${
                isActive
                  ? "toggle-active"
                  : ""
              }`}
              onClick={() =>
                setIsActive(
                  !isActive
                )
              }
              aria-label="Toggle category"
            >
              <span />
            </button>

          </label>

          {error && (
            <div className="category-form-error">
              {error}
            </div>
          )}

          <div className="category-form-actions">

            <button
              type="button"
              className="form-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="form-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2
                    size={15}
                    className="category-spinner"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={15} />
                  {category
                    ? "Save Changes"
                    : "Create Category"}
                </>
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================
   DELETE MODAL
========================================= */

function DeleteModal({
  category,
  onCancel,
  onConfirm,
}: {
  category: Category;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const hasProducts =
    category._count.products > 0;

  return (
    <div className="admin-modal-backdrop">

      <div className="delete-modal">

        <div className="delete-icon">
          <Trash2 size={22} />
        </div>

        <h2>
          Delete "{category.name}"?
        </h2>

        <p>
          {hasProducts
            ? `This category contains ${category._count.products} product${
                category._count.products === 1
                  ? ""
                  : "s"
              }. You must move or delete those products before deleting this category.`
            : "This action cannot be undone. The category will be permanently removed."}
        </p>

        <div className="delete-actions">

          <button
            className="delete-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="delete-confirm"
            onClick={onConfirm}
            disabled={hasProducts}
          >
            <Trash2 size={15} />
            Delete Category
          </button>

        </div>

      </div>

    </div>
  );
}