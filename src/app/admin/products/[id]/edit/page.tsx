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

import "../../products.css";
import "../../new/new-product.css";

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

type Product = {
  id: string;
  name: string;
  brand: string | null;
  categoryId: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  sku: string;
  image: string | null;
  image2: string | null;
  image3: string | null;
  specifications: Record<string, string> | null;
  featured: boolean;
  isActive: boolean;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditProductPage({
  params,
}: PageProps) {
  const [productId, setProductId] = useState("");

  const [product, setProduct] =
    useState<Product | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
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

  const [specifications, setSpecifications] =
    useState<Specification[]>([]);

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    async function loadProduct() {
      try {
        const resolvedParams = await params;

        const id = resolvedParams.id;

        setProductId(id);

        if (!id) {
          alert("Product ID is missing.");
          return;
        }

        const [
          productResponse,
          categoryResponse,
        ] = await Promise.all([
          fetch(`/api/products/${id}`, {
            cache: "no-store",
          }),

          fetch("/api/categories?admin=true", {
            cache: "no-store",
          }),
        ]);

        const productData =
          await productResponse.json();

        const categoryData =
          await categoryResponse.json();

        if (!productResponse.ok) {
          alert(
            productData.message ||
              "Failed to load product."
          );

          return;
        }

        if (categoryData.success) {
          setCategories(
            categoryData.categories || []
          );
        }

        const loadedProduct =
          productData.product;

        setProduct(loadedProduct);

        setForm({
          name: loadedProduct.name || "",

          brand:
            loadedProduct.brand || "",

          categoryId:
            loadedProduct.categoryId || "",

          sku:
            loadedProduct.sku || "",

          description:
            loadedProduct.description || "",

          price:
            loadedProduct.price?.toString() || "",

          oldPrice:
            loadedProduct.oldPrice !== null &&
            loadedProduct.oldPrice !== undefined
              ? loadedProduct.oldPrice.toString()
              : "",

          stock:
            loadedProduct.stock?.toString() || "0",

          image:
            loadedProduct.image || "",

          image2:
            loadedProduct.image2 || "",

          image3:
            loadedProduct.image3 || "",

          featured:
            Boolean(loadedProduct.featured),

          isActive:
            loadedProduct.isActive !== false,
        });

        /* =====================================================
           LOAD SPECIFICATIONS
        ===================================================== */

        const specificationData =
          loadedProduct.specifications || {};

        const entries =
          Object.entries(specificationData);

        if (entries.length > 0) {
          setSpecifications(
            entries.map(([name, value]) => ({
              id: Date.now() + Math.random(),
              name,
              value: String(value),
            }))
          );
        } else {
          setSpecifications([
            {
              id: Date.now() + Math.random(),
              name: "",
              value: "",
            },
          ]);
        }
      } catch (error) {
        console.error(
          "LOAD PRODUCT ERROR:",
          error
        );

        alert(
          "Something went wrong while loading the product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params]);

  /* =========================================================
     UPDATE FIELD
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

      // Always keep one specification row available
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
     SUBMIT UPDATE
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!productId) {
      alert("Product ID is missing.");
      return;
    }

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

      console.log(
        "UPDATING PRODUCT:",
        productId,
        payload
      );

      const response = await fetch(
        `/api/products/${productId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log(
        "UPDATE RESPONSE:",
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update product."
        );

        return;
      }

      setProduct(data.product);

      alert(
        "Product updated successfully!"
      );

      window.location.href =
        "/admin/products";
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      alert(
        "Something went wrong while updating the product."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="new-product-page">
        <div className="product-loading-state">
          <Loader2
            size={24}
            className="product-spinner"
          />

          <p>
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="new-product-page">
        <div className="product-loading-state">
          <p>
            Product could not be found.
          </p>

          <a
            href="/admin/products"
            className="back-products"
          >
            <ArrowLeft size={14} />
            Back to Products
          </a>
        </div>
      </div>
    );
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
            CATALOG / EDIT
          </p>

          <h1>
            Edit Product
          </h1>

          <p>
            Update your gadget's information,
            pricing and availability.
          </p>
        </div>
      </div>

      <form
        className="new-product-form"
        onSubmit={handleSubmit}
      >
        <div className="new-product-layout">

          <div className="new-product-main">

            {/* PRODUCT INFORMATION */}

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

                <div className="form-field form-field-full">
                  <label>
                    Product Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                  />
                </div>

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
                  >
                    <option value="">
                      Select category
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

                <div className="form-field">
                  <label>
                    SKU
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={form.sku}
                    onChange={(event) =>
                      updateField(
                        "sku",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) =>
                      updateField(
                        "stock",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field form-field-full">
                  <label>
                    Description
                  </label>

                  <textarea
                    rows={6}
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

            {/* PRICING */}

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

            {/* IMAGES */}

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
                    Update your product
                    images.
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

            {/* SPECIFICATIONS */}

            <section className="product-form-card">

              <div className="form-card-heading specification-heading">

                <div>
                  <h2>
                    Specifications
                  </h2>

                  <p>
                    Update technical
                    details for this product.
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
                        placeholder="e.g. Processor"
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
                        placeholder="e.g. Apple M4"
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

          {/* SIDEBAR */}

          <aside className="new-product-sidebar">

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

            <section className="product-save-card">

              <div className="save-card-icon">
                <Save size={18} />
              </div>

              <h3>
                Save your changes
              </h3>

              <p>
                Update this product in
                your store catalog.
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
                    Save Changes
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

        <strong>{title}</strong>

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