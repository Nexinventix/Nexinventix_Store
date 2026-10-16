import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProductFilterData = {
  brand: string | null;
  price: number;
  categoryId: string;
};

function getNiceStep(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  const magnitude = Math.pow(
    10,
    Math.floor(Math.log10(value))
  );

  const normalized = value / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;

  return 10 * magnitude;
}

function generatePriceRanges(prices: number[]) {
  if (prices.length === 0) {
    return [];
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return [
      {
        label: `₦${minPrice.toLocaleString("en-NG")}`,
        min: minPrice,
        max: maxPrice,
      },
    ];
  }

  const step = getNiceStep(
    (maxPrice - minPrice) / 4
  );

  const firstBoundary =
    Math.floor(minPrice / step) * step;

  const lastBoundary =
    Math.ceil(maxPrice / step) * step;

  const ranges: {
    label: string;
    min: number;
    max: number;
  }[] = [];

  let lower = firstBoundary;

  while (lower < lastBoundary) {
    const upper = lower + step;
    const rangeMin = Math.max(minPrice, lower);
    const rangeMax = Math.min(maxPrice, upper);

    const hasProducts = prices.some(
      (price) =>
        price >= rangeMin &&
        price <= rangeMax
    );

    if (hasProducts) {
      ranges.push({
        label: `₦${rangeMin.toLocaleString("en-NG")} – ₦${rangeMax.toLocaleString("en-NG")}`,
        min: rangeMin,
        max: rangeMax,
      });
    }

    lower = upper;
  }

  return ranges;
}

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
        },
        select: {
          brand: true,
          price: true,
          categoryId: true,
        },
      }),

      prisma.category.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    /* =========================================================
       BRANDS
    ========================================================= */

    const brands = Array.from(
      new Set(
        products
          .map((product) => product.brand?.trim())
          .filter(
            (brand): brand is string =>
              Boolean(brand)
          )
      )
    ).sort((a, b) => a.localeCompare(b));

    /* =========================================================
       PRICE RANGES
    ========================================================= */

    const prices = products
      .map((product) => product.price)
      .filter(
        (price) =>
          typeof price === "number" &&
          Number.isFinite(price) &&
          price >= 0
      );

    const minPrice =
      prices.length > 0
        ? Math.min(...prices)
        : null;

    const maxPrice =
      prices.length > 0
        ? Math.max(...prices)
        : null;

    const priceRanges =
      generatePriceRanges(prices);

    /* =========================================================
       POPULAR CATEGORIES

       Rank active categories by the number of active
       products associated with each category.
    ========================================================= */

    const categoryCounts = new Map<string, number>();

    for (const product of products) {
      categoryCounts.set(
        product.categoryId,
        (categoryCounts.get(product.categoryId) ?? 0) + 1
      );
    }

    const popularCategories = categories
      .filter(
        (category) =>
          (categoryCounts.get(category.id) ?? 0) > 0
      )
      .sort((a, b) => {
        const countDifference =
          (categoryCounts.get(b.id) ?? 0) -
          (categoryCounts.get(a.id) ?? 0);

        return countDifference || a.name.localeCompare(b.name);
      })
      .slice(0, 4)
      .map((category) => ({
        ...category,
        productCount:
          categoryCounts.get(category.id) ?? 0,
      }));

    /* =========================================================
       RESPONSE
    ========================================================= */

    return NextResponse.json({
      success: true,
      count: products.length,
      brands,
      minPrice,
      maxPrice,
      priceRanges,
      popularCategories,
    });
  } catch (error) {
    console.error(
      "PRODUCT FILTERS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load product filter options.",
      },
      { status: 500 }
    );
  }
}