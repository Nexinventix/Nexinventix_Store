"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

/* =========================================================
   CART ITEM
========================================================= */

export type CartItem = {
  id: string;
  name: string;
  slug: string;

  brand?: string | null;

  image?: string | null;

  price: number;

  oldPrice?: number | null;

  stock: number;

  quantity: number;

  sku: string;

  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

/* =========================================================
   CART CONTEXT
========================================================= */

type CartContextType = {
  items: CartItem[];

  addToCart: (
    product: Omit<CartItem, "quantity">,
    quantity?: number
  ) => void;

  removeFromCart: (
    productId: string
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  getItemQuantity: (
    productId: string
  ) => number;

  itemCount: number;

  subtotal: number;
};

/* =========================================================
   CONTEXT
========================================================= */

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

/* =========================================================
   STORAGE KEY
========================================================= */

const CART_STORAGE_KEY =
  "nexinventix-cart";

/* =========================================================
   PROVIDER
========================================================= */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<
    CartItem[]
  >([]);

  const [mounted, setMounted] =
    useState(false);

  /* =======================================================
     LOAD CART
  ======================================================= */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (savedCart) {
        const parsedCart =
          JSON.parse(savedCart);

        if (
          Array.isArray(parsedCart)
        ) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "CART LOAD ERROR:",
        error
      );
    }

    setMounted(true);
  }, []);

  /* =======================================================
     SAVE CART
  ======================================================= */

  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "CART SAVE ERROR:",
        error
      );
    }
  }, [items, mounted]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = (
    product: Omit<CartItem, "quantity">,
    quantity = 1
  ) => {
    setItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            item.id === product.id
        );

      if (existingItem) {
        const newQuantity =
          Math.min(
            existingItem.quantity +
              quantity,
            product.stock
          );

        return currentItems.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    newQuantity,
                }
              : item
        );
      }

      const safeQuantity =
        Math.min(
          Math.max(quantity, 1),
          product.stock
        );

      return [
        ...currentItems,
        {
          ...product,
          quantity:
            safeQuantity,
        },
      ];
    });
  };

  /* =======================================================
     REMOVE FROM CART
  ======================================================= */

  const removeFromCart = (
    productId: string
  ) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.id !== productId
      )
    );
  };

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = (
    productId: string,
    quantity: number
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const safeQuantity =
          Math.min(
            Math.max(quantity, 1),
            item.stock
          );

        return {
          ...item,
          quantity:
            safeQuantity,
        };
      })
    );
  };

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart = () => {
    setItems([]);
  };

  /* =======================================================
     GET ITEM QUANTITY
  ======================================================= */

  const getItemQuantity = (
    productId: string
  ) => {
    const item = items.find(
      (item) =>
        item.id === productId
    );

    return item?.quantity || 0;
  };

  /* =======================================================
     TOTAL ITEM COUNT
  ======================================================= */

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [items]
  );

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0
      ),
    [items]
  );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = {
    items,

    addToCart,

    removeFromCart,

    updateQuantity,

    clearCart,

    getItemQuantity,

    itemCount,

    subtotal,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================================================
   CART HOOK
========================================================= */

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside a CartProvider."
    );
  }

  return context;
}