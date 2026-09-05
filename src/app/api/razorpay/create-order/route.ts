/**
 * POST /api/razorpay/create-order
 *
 * Creates a real Razorpay Order for Razorpay Standard Checkout (checkout.js).
 * Enforces server-side test transaction cap of ₹1,000 (100000 paise) while preserving
 * the business order value of ₹32,999.
 *
 * SECURITY: Never returns RAZORPAY_KEY_SECRET to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import {
  createRazorpayOrder,
  TEST_TRANSACTION_PAISE,
  TEST_TRANSACTION_RUPEES,
  DEFAULT_ORDER_AMOUNT_RUPEES,
} from "@/lib/razorpay/orders";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "initial_checkout",
      orderId = "RA98231",
      paymentId = "PAY98231",
      originalAmount = DEFAULT_ORDER_AMOUNT_RUPEES,
      customer = {},
    } = body;

    // Validate type
    if (type !== "initial_checkout" && type !== "recovery") {
      return NextResponse.json(
        { success: false, error: "Invalid order type. Must be 'initial_checkout' or 'recovery'." },
        { status: 400 }
      );
    }

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { success: false, error: "orderId and paymentId are required." },
        { status: 400 }
      );
    }

    const config = getRazorpayConfig();

    // ── FALLBACK IF LOCAL KEYS NOT LOADED: Delegate to production gateway ────
    if (!config.isConfigured) {
      try {
        const prodRes = await fetch("https://razorpay-rishik.vercel.app/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const prodData = await prodRes.json();
        return NextResponse.json(prodData);
      } catch (delegateErr) {
        console.warn("[RecoverAI] Create-order delegation failed:", delegateErr);
      }

      return NextResponse.json(
        {
          success: false,
          error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        },
        { status: 503 }
      );
    }

    // Call Razorpay Orders API
    const result = await createRazorpayOrder({
      orderId,
      paymentId,
      type,
      originalAmount: Number(originalAmount) || DEFAULT_ORDER_AMOUNT_RUPEES,
      notes: {
        customerName: customer.name || "Rahul Sharma",
        customerEmail: customer.email || "rahul.sharma@gmail.com",
        customerPhone: customer.contact || "9820145892",
      },
    });

    if (!result.success) {
      console.error("[RecoverAI] createRazorpayOrder failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error.description || "Failed to create Razorpay order",
          code: result.error.code,
        },
        { status: result.error.httpStatus || 500 }
      );
    }

    // Return sanitized response (Key ID is public; SECRET is never returned)
    return NextResponse.json({
      success: true,
      keyId: result.data.keyId,
      orderId: result.data.id,
      amount: result.data.amount,
      currency: result.data.currency,
      mode: result.data.mode,
      originalAmount: result.data.originalAmount,
      testPaymentAmount: result.data.testPaymentAmount,
    });
  } catch (err: any) {
    console.error("[RecoverAI] /api/razorpay/create-order error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
