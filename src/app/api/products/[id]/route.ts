import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   HELPER — CREATE SLUG
========================================================= */

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================
   GET SINGLE PRODUCT
   GET /api/products/[id]

   Supports BOTH:

   /api/products/<mongodb-id>
   /api/products/<product-slug>

   Example:

   /api/products/68f123abc...
   /api/products/dell-testing
========================================================= */

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    /*
     * A MongoDB ObjectId is exactly
     * 24 hexadecimal characters.
     */
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);

    let product;

    if (isObjectId) {
      /*
       * If the parameter is a valid MongoDB ID,
       * search by ID.
       */
      product =
        await prisma.product.findUnique({
          where: {
            id,
          },
          include: {
            category: true,
          },
        });
    } else {
      /*
       * Otherwise, treat the parameter
       * as a product slug.
       *
       * This prevents Prisma from trying to
       * interpret "dell-testing" as an ObjectId.
       */
      product =
        await prisma.product.findUnique({
          where: {
            slug: id,
          },
          include: {
            category: true,
          },
        });
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "GET /api/products/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE PRODUCT
   PUT /api/products/[id]

   IMPORTANT:
   Admin updates continue to use the MongoDB product ID.
========================================================= */

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    /* -------------------------------------------------------
       FIND EXISTING PRODUCT
    ------------------------------------------------------- */

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    /* -------------------------------------------------------
       GET DATA
    ------------------------------------------------------- */

    const {
      name,
      brand,
      categoryId,
      description,
      image,
      image2,
      image3,
      price,
      oldPrice,
      stock,
      sku,
      specifications,
      rating,
      reviews,
      featured,
      isActive,
    } = body;

    /* -------------------------------------------------------
       BASIC VALIDATION
    ------------------------------------------------------- */

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product category is required.",
        },
        { status: 400 }
      );
    }

    if (!sku?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU is required.",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       VALIDATE PRICE
    ------------------------------------------------------- */

    const parsedPrice = Number(price);

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid selling price.",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       VALIDATE OLD PRICE
    ------------------------------------------------------- */

    let parsedOldPrice: number | null =
      null;

    if (
      oldPrice !== undefined &&
      oldPrice !== null &&
      oldPrice !== ""
    ) {
      const value = Number(oldPrice);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Compare-at price must be a valid number.",
          },
          { status: 400 }
        );
      }

      parsedOldPrice = value;
    }

    /* -------------------------------------------------------
       VALIDATE STOCK
    ------------------------------------------------------- */

    let parsedStock = 0;

    if (
      stock !== undefined &&
      stock !== null &&
      stock !== ""
    ) {
      const value = Number(stock);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Stock must be a valid positive number.",
          },
          { status: 400 }
        );
      }

      parsedStock = Math.floor(value);
    }

    /* -------------------------------------------------------
       CHECK CATEGORY
    ------------------------------------------------------- */

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       CHECK SKU DUPLICATE
    ------------------------------------------------------- */

    const cleanSku = sku.trim();

    const duplicateSku =
      await prisma.product.findFirst({
        where: {
          sku: cleanSku,
          NOT: {
            id,
          },
        },
      });

    if (duplicateSku) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another product already uses this SKU.",
        },
        { status: 409 }
      );
    }

    /* -------------------------------------------------------
       CREATE SLUG
    ------------------------------------------------------- */

    let slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create a valid product slug.",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       CHECK SLUG DUPLICATE
    ------------------------------------------------------- */

    const duplicateSlug =
      await prisma.product.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
      });

    if (duplicateSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    /* -------------------------------------------------------
       UPDATE PRODUCT
    ------------------------------------------------------- */

    const product =
      await prisma.product.update({
        where: {
          id,
        },

        data: {
          name: name.trim(),

          slug,

          brand:
            brand?.trim() || null,

          /*
           * IMPORTANT:
           * The Prisma Client expects the
           * category relationship to be
           * updated using connect.
           */

          category: {
            connect: {
              id: categoryId,
            },
          },

          description:
            description?.trim() || null,

          image:
            image?.trim() || null,

          image2:
            image2?.trim() || null,

          image3:
            image3?.trim() || null,

          price: parsedPrice,

          oldPrice: parsedOldPrice,

          stock: parsedStock,

          sku: cleanSku,

          specifications:
            specifications &&
            typeof specifications ===
              "object"
              ? specifications
              : {},

          rating:
            rating !== undefined &&
            rating !== null &&
            rating !== ""
              ? Number(rating)
              : null,

          reviews:
            reviews !== undefined &&
            reviews !== null &&
            reviews !== ""
              ? Number(reviews)
              : 0,

          featured:
            featured === undefined
              ? existingProduct.featured
              : Boolean(featured),

          isActive:
            isActive === undefined
              ? existingProduct.isActive
              : Boolean(isActive),
        },

        include: {
          category: true,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "PUT /api/products/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update product.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE PRODUCT
   DELETE /api/products/[id]

   IMPORTANT:
   Delete continues to use the MongoDB
   product ID.
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    /* -------------------------------------------------------
       CHECK PRODUCT
    ------------------------------------------------------- */

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    /* -------------------------------------------------------
       DELETE PRODUCT
    ------------------------------------------------------- */

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/products/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete product.",
      },
      { status: 500 }
    );
  }
}