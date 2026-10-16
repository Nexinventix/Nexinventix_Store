import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import HeroCarousel from "@/components/HeroCarousel/HeroCarousel";
import LaptopFinder from "@/components/LaptopFinder/LaptopFinder";
import ServiceCards from "@/components/ServiceCards/ServiceCards";
import ProductCarousel from "@/components/ProductCarousel/ProductCarousel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;

  brand?: string | null;
  description?: string | null;

  image?: string | null;
  image2?: string | null;
  image3?: string | null;

  price: number;
  oldPrice?: number | null;

  rating?: number | null;
  reviews?: number;

  specifications?: Record<string, string> | null;

  stock: number;

  featured?: boolean;
  isActive?: boolean;

  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

async function getLatestProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      include: {
        category: true,
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand,
      description: product.description,
      image: product.image,
      image2: product.image2,
      image3: product.image3,
      price: product.price,
      oldPrice: product.oldPrice,
      rating: product.rating,
      reviews: product.reviews,
      specifications:
        product.specifications &&
        typeof product.specifications === "object" &&
        !Array.isArray(product.specifications)
          ? (product.specifications as Record<string, string>)
          : null,
      stock: product.stock,
      featured: product.featured,
      isActive: product.isActive,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
    }));
  } catch (error) {
    console.error("LATEST PRODUCTS ERROR:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getLatestProducts();

  return (
    <>
      <Header />

      <main>
        <HeroCarousel />

        <LaptopFinder />

        <ServiceCards />

        <ProductCarousel
          eyebrow="NEW & TRENDING"
          title="Latest Arrivals"
          description="Discover the newest technology added to the Nexinventix collection."
          products={products}
          viewAllHref="/products"
        />
      </main>

      <Footer />
    </>
  );
}