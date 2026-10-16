import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/categories/[id]
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "GET /api/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch category.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const {
      name,
      slug,
      description,
      image,
      isActive,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name and slug are required.",
        },
        { status: 400 }
      );
    }

    const duplicateSlug =
      await prisma.category.findFirst({
        where: {
          slug: slug.trim().toLowerCase(),
          NOT: {
            id,
          },
        },
      });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another category already uses this slug.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        isActive:
          isActive === undefined
            ? true
            : Boolean(isActive),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error(
      "PUT /api/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This category contains products and cannot be deleted. Move or delete its products first.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category.",
      },
      { status: 500 }
    );
  }
}