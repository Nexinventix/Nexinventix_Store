import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexinventix Store",
    template: "%s | Nexinventix Store",
  },

  description:
    "Shop quality laptops, computers, monitors, accessories, networking equipment and other technology products from Nexinventix Store.",

  applicationName: "Nexinventix Store",

  keywords: [
    "Nexinventix",
    "Nexinventix Store",
    "laptops",
    "computers",
    "computer accessories",
    "monitors",
    "networking",
    "technology store",
    "gadgets",
    "Nigeria",
  ],

  authors: [
    {
      name: "Nexinventix Technology",
    },
  ],

  creator: "Nexinventix Technology",

  publisher: "Nexinventix Technology",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Nexinventix Store",
    description:
      "Shop quality technology products, computers, laptops, accessories and more from Nexinventix Store.",
    siteName: "Nexinventix Store",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}