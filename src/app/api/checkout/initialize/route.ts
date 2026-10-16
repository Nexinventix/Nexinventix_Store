
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutRequest = {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  delivery: {
    address: string;
    city: string;
    state: string;
    note?: string;
  };
  items: CheckoutItem[];
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let orderId: string | undefined;

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured.");

      return NextResponse.json(
        { success: false, message: "Payment service is not configured." },
        { status: 500 }
      );
    }

    if (!appUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not configured.");

      return NextResponse.json(
        { success: false, message: "Application URL is not configured." },
        { status: 500 }
      );
    }

    let body: CheckoutRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const customer = {
      firstName: cleanString(body?.customer?.firstName),
      lastName: cleanString(body?.customer?.lastName),
      email: cleanString(body?.customer?.email).toLowerCase(),
      phone: cleanString(body?.customer?.phone),
    };

    const delivery = {
      address: cleanString(body?.delivery?.address),
      city: cleanString(body?.delivery?.city),
      state: cleanString(body?.delivery?.state),
      note: cleanString(body?.delivery?.note),
    };

    if (
      !customer.firstName ||
      !customer.lastName ||
      !isValidEmail(customer.email) ||
      !customer.phone
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid name, email address, and phone number.",
        },
        { status: 400 }
      );
    }

    if (!delivery.address || !delivery.city || !delivery.state) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete your delivery address, city, and state.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body?.items) ||
      body.items.length === 0 ||
      body.items.length > 50
    ) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty or invalid." },
        { status: 400 }
      );
    }

    // Validate and combine duplicate product IDs.
    const quantityByProduct = new Map<string, number>();

    for (const item of body.items) {
      const productId = cleanString(item?.productId);
      const quantity = item?.quantity;

      if (
        !/^[a-f\d]{24}$/i.test(productId) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { success: false, message: "One or more cart items are invalid." },
          { status: 400 }
        );
      }

      const combinedQuantity =
        (quantityByProduct.get(productId) ?? 0) + quantity;

      if (combinedQuantity > 100) {
        return NextResponse.json(
          { success: false, message: "The requested quantity is too high." },
          { status: 400 }
        );
      }

      quantityByProduct.set(productId, combinedQuantity);
    }

    const productIds = Array.from(quantityByProduct.keys());

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Some products are unavailable. Please refresh your cart.",
        },
        { status: 400 }
      );
    }

    let amountKobo = 0;

    const orderItems = products.map((product) => {
      const quantity = quantityByProduct.get(product.id)!;

      if (
        !Number.isFinite(product.price) ||
        product.price <= 0 ||
        !Number.isSafeInteger(product.stock) ||
        product.stock < quantity
      ) {
        throw new Error(
          `INSUFFICIENT_STOCK:${product.name}`
        );
      }

      const unitPriceKobo = Math.round(product.price * 100);

      if (!Number.isSafeInteger(unitPriceKobo) || unitPriceKobo <= 0) {
        throw new Error("INVALID_PRODUCT_PRICE");
      }

      const lineTotalKobo = unitPriceKobo * quantity;

      if (!Number.isSafeInteger(lineTotalKobo)) {
        throw new Error("ORDER_TOTAL_TOO_LARGE");
      }

      amountKobo += lineTotalKobo;

      return {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.image,
        quantity,
        unitPriceKobo,
        lineTotalKobo,
      };
    });

    if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
      return NextResponse.json(
        { success: false, message: "Unable to calculate your order total." },
        { status: 400 }
      );
    }

    const paymentReference = `NEX-${Date.now()}-${randomUUID()}`;

    // Save the order before contacting Paystack.
    const order = await prisma.order.create({
      data: {
        paymentReference,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        deliveryAddress: delivery.address,
        deliveryCity: delivery.city,
        deliveryState: delivery.state,
        deliveryNote: delivery.note || null,
        items: orderItems,
        amountKobo,
        currency: "NGN",
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    orderId = order.id;

    const baseUrl = appUrl.replace(/\/+$/, "");

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customer.email,
          amount: amountKobo,
          reference: paymentReference,
          currency: "NGN",
          callback_url: `${baseUrl}/api/payments/paystack/callback`,
          metadata: {
            orderId: order.id,
            paymentReference,
            customerName: `${customer.firstName} ${customer.lastName}`,
            custom_fields: [
              {
                display_name: "Order Reference",
                variable_name: "order_reference",
                value: paymentReference,
              },
            ],
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    const paystackResult = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackResult.status ||
      !paystackResult.data?.authorization_url
    ) {
      console.error("Paystack initialization failed:", paystackResult);

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAYMENT_INITIALIZATION_FAILED" },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "We could not start your payment. Please try again.",
        },
        { status: 502 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentAccessCode: paystackResult.data.access_code ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResult.data.authorization_url,
      reference: paymentReference,
    });
  } catch (error) {
    console.error("CHECKOUT INITIALIZATION ERROR:", error);

    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return NextResponse.json(
        {
          success: false,
          message: `${error.message.replace("INSUFFICIENT_STOCK:", "")} is out of stock or has insufficient stock.`,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "INVALID_PRODUCT_PRICE") {
      return NextResponse.json(
        { success: false, message: "A product has an invalid price." },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "ORDER_TOTAL_TOO_LARGE") {
      return NextResponse.json(
        { success: false, message: "Your order total is too large." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to initialize checkout. Please try again.",
      },
      { status: 500 }
    );
  }
}
