import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================================================
   GET PRODUCTS
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const brand = searchParams.get("brand")?.trim();

    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    const featured = searchParams.get("featured");
    const active = searchParams.get("active");

    const limitParam = searchParams.get("limit");

    /* ---------------------------------------------
       LIMIT
    --------------------------------------------- */

    let limit: number | undefined;

    if (limitParam) {
      const parsedLimit = Number(limitParam);

      if (
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0
      ) {
        limit = Math.min(parsedLimit, 100);
      }
    }

    /* ---------------------------------------------
       BUILD FILTER
    --------------------------------------------- */

    const where: any = {};

    /* Active products */

    if (active === "true") {
      where.isActive = true;
    }

    if (active === "false") {
      where.isActive = false;
    }

    /* Featured products */

    if (featured === "true") {
      where.featured = true;
    }

    if (featured === "false") {
      where.featured = false;
    }

    /* Category */

    if (category) {
      where.category = {
        slug: category,
      };
    }

    /* Brand */

    if (brand) {
      where.brand = {
        equals: brand,
        mode: "insensitive",
      };
    }

    /* Price */

    const minPrice = minPriceParam
      ? Number(minPriceParam)
      : undefined;

    const maxPrice = maxPriceParam
      ? Number(maxPriceParam)
      : undefined;

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      where.price = {};

      if (
        minPrice !== undefined &&
        Number.isFinite(minPrice)
      ) {
        where.price.gte = minPrice;
      }

      if (
        maxPrice !== undefined &&
        Number.isFinite(maxPrice)
      ) {
        where.price.lte = maxPrice;
      }
    }

    /* Search */

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    /* ---------------------------------------------
       FETCH PRODUCTS
    --------------------------------------------- */

    const products = await prisma.product.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      ...(limit
        ? {
            take: limit,
          }
        : {}),

      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products.",
      },
      { status: 500 }
    );
  }
}


/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("CREATE PRODUCT BODY:", body);

    console.log(
      "CREATE PRODUCT SPECIFICATIONS:",
      body.specifications
    );

    const {
      name,
      brand,
      categoryId,
      description,
      price,
      oldPrice,
      stock,
      sku,
      image,
      image2,
      image3,
      specifications,
      featured,
      isActive,
    } = body;

    /* ---------------------------------------------
       VALIDATION
    --------------------------------------------- */

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
          message: "Product category is required.",
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

    if (
      price === undefined ||
      price === null ||
      Number.isNaN(Number(price))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid product price is required.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
       CHECK CATEGORY
    --------------------------------------------- */

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
       CHECK SKU
    --------------------------------------------- */

    const existingSku = await prisma.product.findUnique({
      where: {
        sku: sku.trim(),
      },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this SKU already exists.",
        },
        { status: 409 }
      );
    }

    /* ---------------------------------------------
       CREATE SLUG
    --------------------------------------------- */

    let slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingSlug = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    /* ---------------------------------------------
       CREATE PRODUCT
    --------------------------------------------- */

    const product = await prisma.product.create({
      data: {
        name: name.trim(),

        slug,

        brand: brand?.trim() || null,

        categoryId,

        description:
          description?.trim() || null,

        price: Number(price),

        oldPrice:
          oldPrice !== undefined &&
          oldPrice !== null &&
          oldPrice !== ""
            ? Number(oldPrice)
            : null,

        stock:
          stock !== undefined &&
          stock !== null &&
          stock !== ""
            ? Number(stock)
            : 0,

        sku: sku.trim(),

        image: image?.trim() || null,

        image2: image2?.trim() || null,

        image3: image3?.trim() || null,

        specifications:
          specifications &&
          typeof specifications === "object"
            ? specifications
            : {},

        featured: Boolean(featured),

        isActive:
          isActive === undefined
            ? true
            : Boolean(isActive),
      },

      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product.",
      },
      { status: 500 }
    );
  }
}