"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Loader2,
  Package,
  Star,
  Eye,
} from "lucide-react";

import "../products.css";
import "./new-product.css";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Specification = {
  id: number;
  name: string;
  value: string;
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    categoryId: "",
    sku: "",
    description: "",
    price: "",
    oldPrice: "",
    stock: "",
    image: "",
    image2: "",
    image3: "",
    featured: false,
    isActive: true,
  });

  /*
   * =========================================================
   * SPECIFICATIONS
   * =========================================================
   *
   * Start with one empty row so the user can immediately
   * enter a specification.
   */

  const [specifications, setSpecifications] =
    useState<Specification[]>([
      {
        id: Date.now() + Math.random(),
        name: "",
        value: "",
      },
    ]);

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
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
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =========================================================
     SPECIFICATIONS
  ========================================================= */

  function addSpecification() {
    setSpecifications((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        name: "",
        value: "",
      },
    ]);
  }

  function removeSpecification(id: number) {
    setSpecifications((previous) => {
      const updated = previous.filter(
        (item) => item.id !== id
      );

      /*
       * Always keep one specification row available.
       */
      if (updated.length === 0) {
        return [
          {
            id: Date.now() + Math.random(),
            name: "",
            value: "",
          },
        ];
      }

      return updated;
    });
  }

  function updateSpecification(
    id: number,
    field: "name" | "value",
    value: string
  ) {
    setSpecifications((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter the product name.");
      return;
    }

    if (!form.categoryId) {
      alert("Please select a category.");
      return;
    }

    if (!form.sku.trim()) {
      alert("Please enter the SKU.");
      return;
    }

    if (!form.price) {
      alert("Please enter the selling price.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      alert("Please enter a valid selling price.");
      return;
    }

    try {
      setSaving(true);

      /* =====================================================
         CONVERT SPECIFICATION ROWS TO OBJECT
      ===================================================== */

      const specificationObject =
        specifications.reduce(
          (
            result: Record<string, string>,
            specification
          ) => {
            const name =
              specification.name.trim();

            const value =
              specification.value.trim();

            if (name && value) {
              result[name] = value;
            }

            return result;
          },
          {}
        );

      /* =====================================================
         CREATE PRODUCT PAYLOAD
      ===================================================== */

      const payload = {
        name: form.name.trim(),

        brand:
          form.brand.trim() || null,

        categoryId:
          form.categoryId,

        description:
          form.description.trim() || null,

        price,

        oldPrice:
          form.oldPrice.trim()
            ? Number(form.oldPrice)
            : null,

        stock:
          form.stock.trim()
            ? Number(form.stock)
            : 0,

        sku:
          form.sku.trim(),

        image:
          form.image.trim() || null,

        image2:
          form.image2.trim() || null,

        image3:
          form.image3.trim() || null,

        specifications:
          specificationObject,

        featured:
          form.featured,

        isActive:
          form.isActive,
      };

      /*
       * Temporary diagnostics.
       *
       * These allow us to confirm that the specification
       * rows and the final payload contain the values
       * before the request reaches the API.
       */

      console.log(
        "CREATE PRODUCT SPECIFICATIONS:",
        specifications
      );

      console.log(
        "SPECIFICATION OBJECT:",
        specificationObject
      );

      console.log(
        "CREATE PRODUCT PAYLOAD:",
        payload
      );

      /* =====================================================
         SEND PRODUCT TO API
      ===================================================== */

      const response = await fetch(
        "/api/products",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to create product."
        );

        return;
      }

      alert(
        "Product created successfully."
      );

      window.location.href =
        "/admin/products";
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      alert(
        "Something went wrong while creating the product."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="new-product-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="new-product-header">

        <div>

          <a
            href="/admin/products"
            className="back-products"
          >
            <ArrowLeft size={14} />
            Products
          </a>

          <p className="products-eyebrow">
            CATALOG / NEW
          </p>

          <h1>Add Product</h1>

          <p>
            Add a new gadget to the
            Nexinventix store.
          </p>

        </div>

      </div>

      <form
        className="new-product-form"
        onSubmit={handleSubmit}
      >

        <div className="new-product-layout">

          {/* =================================================
              MAIN CONTENT
          ================================================== */}

          <div className="new-product-main">

            {/* =================================================
                PRODUCT INFORMATION
            ================================================== */}

            <section className="product-form-card">

              <div className="form-card-heading">

                <div className="form-heading-icon">
                  <Package size={17} />
                </div>

                <div>
                  <h2>
                    Product Information
                  </h2>

                  <p>
                    Basic information about
                    this product.
                  </p>
                </div>

              </div>

              <div className="form-grid">

                {/* PRODUCT NAME */}

                <div className="form-field form-field-full">

                  <label>
                    Product Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. MacBook Pro 14-inch M4"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* BRAND */}

                <div className="form-field">

                  <label>
                    Brand
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Apple"
                    value={form.brand}
                    onChange={(event) =>
                      updateField(
                        "brand",
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-field">

                  <label>
                    Category
                    <span>*</span>
                  </label>

                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      updateField(
                        "categoryId",
                        event.target.value
                      )
                    }
                    disabled={
                      loadingCategories
                    }
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select category"}
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

                </div>

                {/* SKU */}

                <div className="form-field">

                  <label>
                    SKU
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. APP-MBP-001"
                    value={form.sku}
                    onChange={(event) =>
                      updateField(
                        "sku",
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* STOCK */}

                <div className="form-field">

                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.stock}
                    onChange={(event) =>
                      updateField(
                        "stock",
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="form-field form-field-full">

                  <label>
                    Description
                  </label>

                  <textarea
                    rows={6}
                    placeholder="Describe the product..."
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                PRICING
            ================================================== */}

            <section className="product-form-card">

              <div className="form-card-heading">

                <div className="form-heading-icon">
                  ₦
                </div>

                <div>
                  <h2>
                    Pricing & Inventory
                  </h2>

                  <p>
                    Set the product pricing
                    and stock.
                  </p>
                </div>

              </div>

              <div className="form-grid">

                {/* SELLING PRICE */}

                <div className="form-field">

                  <label>
                    Selling Price
                    <span>*</span>
                  </label>

                  <div className="price-input">

                    <span>₦</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(event) =>
                        updateField(
                          "price",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

                {/* COMPARE PRICE */}

                <div className="form-field">

                  <label>
                    Compare-at Price
                  </label>

                  <div className="price-input">

                    <span>₦</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      value={form.oldPrice}
                      onChange={(event) =>
                        updateField(
                          "oldPrice",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                IMAGES
            ================================================== */}

            <section className="product-form-card">

              <div className="form-card-heading">

                <div className="form-heading-icon">
                  <ImageIcon size={17} />
                </div>

                <div>
                  <h2>
                    Product Images
                  </h2>

                  <p>
                    Add image URLs for your
                    product.
                  </p>
                </div>

              </div>

              <div className="image-fields">

                <ImageInput
                  label="Primary Image"
                  value={form.image}
                  onChange={(value) =>
                    updateField(
                      "image",
                      value
                    )
                  }
                  required
                />

                <ImageInput
                  label="Image 2"
                  value={form.image2}
                  onChange={(value) =>
                    updateField(
                      "image2",
                      value
                    )
                  }
                />

                <ImageInput
                  label="Image 3"
                  value={form.image3}
                  onChange={(value) =>
                    updateField(
                      "image3",
                      value
                    )
                  }
                />

              </div>

            </section>

            {/* =================================================
                SPECIFICATIONS
            ================================================== */}

            <section className="product-form-card">

              <div className="form-card-heading specification-heading">

                <div>

                  <h2>
                    Specifications
                  </h2>

                  <p>
                    Add technical details
                    for this product.
                  </p>

                </div>

                <button
                  type="button"
                  className="add-specification"
                  onClick={addSpecification}
                >
                  <Plus size={14} />
                  Add Specification
                </button>

              </div>

              <div className="specification-list">

                {specifications.map(
                  (specification, index) => (
                    <div
                      className="specification-row"
                      key={specification.id}
                    >

                      {/* ROW NUMBER */}

                      <div className="specification-number">
                        {index + 1}
                      </div>

                      {/* SPECIFICATION NAME */}

                      <input
                        type="text"
                        placeholder="Specification name"
                        value={
                          specification.name
                        }
                        onChange={(event) =>
                          updateSpecification(
                            specification.id,
                            "name",
                            event.target.value
                          )
                        }
                      />

                      {/* SPECIFICATION VALUE */}

                      <input
                        type="text"
                        placeholder="Specification value"
                        value={
                          specification.value
                        }
                        onChange={(event) =>
                          updateSpecification(
                            specification.id,
                            "value",
                            event.target.value
                          )
                        }
                      />

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeSpecification(
                            specification.id
                          )
                        }
                        title="Remove specification"
                        aria-label={`Remove specification ${
                          index + 1
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>
                  )
                )}

              </div>

            </section>

          </div>

          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="new-product-sidebar">

            {/* STORE STATUS */}

            <section className="product-form-card">

              <div className="form-card-heading">

                <div className="form-heading-icon">
                  <Eye size={16} />
                </div>

                <div>
                  <h2>
                    Store Settings
                  </h2>

                  <p>
                    Control product visibility.
                  </p>
                </div>

              </div>

              {/* ACTIVE PRODUCT */}

              <ToggleOption
                icon={
                  <Eye size={15} />
                }
                title="Active Product"
                description="Show this product in the store."
                checked={form.isActive}
                onChange={(value) =>
                  updateField(
                    "isActive",
                    value
                  )
                }
              />

              {/* FEATURED PRODUCT */}

              <ToggleOption
                icon={
                  <Star size={15} />
                }
                title="Featured Product"
                description="Highlight this product in featured sections."
                checked={form.featured}
                onChange={(value) =>
                  updateField(
                    "featured",
                    value
                  )
                }
              />

            </section>

            {/* SAVE */}

            <section className="product-save-card">

              <div className="save-card-icon">
                <Save size={18} />
              </div>

              <h3>
                Ready to publish?
              </h3>

              <p>
                Save this product to add it
                to your store catalog.
              </p>

              <button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={15}
                      className="product-spinner"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Product
                  </>
                )}
              </button>

            </section>

          </aside>

        </div>

      </form>

    </div>
  );
}

/* =========================================================
   IMAGE INPUT
========================================================= */

function ImageInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="image-input">

      <label>
        {label}
        {required && <span>*</span>}
      </label>

      <div className="image-preview">

        {value ? (
          <img
            src={value}
            alt={label}
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <ImageIcon size={20} />
        )}

      </div>

      <input
        type="url"
        placeholder="https://..."
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />

    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleOption({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="toggle-option">

      <div className="toggle-option-icon">
        {icon}
      </div>

      <div className="toggle-option-content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <button
        type="button"
        className={`toggle-switch ${
          checked ? "checked" : ""
        }`}
        onClick={() =>
          onChange(!checked)
        }
        aria-label={title}
      >
        <span />
      </button>

    </div>
  );
}