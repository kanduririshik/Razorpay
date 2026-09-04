/**
 * POST /api/razorpay/payment-link
 *
 * Creates a standard Razorpay Payment Link for:
 * 1. Initial checkout from Slander's Furniture Store
 * 2. Recovery flow from RecoverAI Admin / Customer Recovery Page
 *
 * Request body:
 * {
 *   paymentId: string;       — RecoverAI payment ID (e.g. "PAY98231")
 *   orderId: string;         — RecoverAI order ID (e.g. "RA98231")
 *   amount: number;          — Amount in INR (e.g. 32999)
 *   originalAmount?: number; — Original business amount in INR (e.g. 32999)
 *   type?: string;           — "initial_checkout" | "recovery"
 *   currency?: string;       — Default "INR"
 *   customerName: string;
 *   customerEmail: string;
 *   customerPhone: string;
 *   description?: string;
 *   callbackUrl?: string;
 * }
 *
 * Response (success):
 * {
 *   success: true;
 *   linkId: string;          — Razorpay payment link ID
 *   shortUrl: string;        — Short URL to navigate to Razorpay (e.g. "https://rzp.io/...")
 *   referenceId: string;     — Our reference ID for tracking
 *   mode: "test" | "live"    — Resolved mode
 *   originalAmount: number;
 *   testPaymentAmount: number;
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createPaymentLink, generateRecoveryReferenceId } from "@/lib/razorpay/payment-links";
import { getRazorpayConfig } from "@/lib/razorpay/config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paymentId,
      orderId,
      amount,
      originalAmount: reqOriginalAmount,
      type,
      currency = "INR",
      customerName,
      customerEmail,
      customerPhone,
      description,
      callbackUrl,
    } = body;

    const originalAmount = Number(reqOriginalAmount || amount || 32999);

    // Validate required fields
    if (!paymentId || !orderId || !originalAmount || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Strictly normalize contact to digits only (between 8 and 14 digits)
    const rawDigits = (customerPhone || "").replace(/\D/g, "");
    const normalizedContact =
      rawDigits.length >= 8 && rawDigits.length <= 14 ? rawDigits : "9820145892";

    const config = getRazorpayConfig();
    const referenceId = generateRecoveryReferenceId(paymentId);

    // ── FALLBACK IF LOCAL KEYS NOT LOADED: Delegate to production gateway ────
    if (!config.isConfigured) {
      console.log("[RecoverAI] Local Razorpay not configured — delegating to production Vercel gateway");
      try {
        const prodRes = await fetch("https://razorpay-rishik.vercel.app/api/razorpay/payment-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            customerPhone: normalizedContact,
          }),
        });
        const prodData = await prodRes.json();
        console.log("[RecoverAI] Delegation response:", { status: prodRes.status, prodData });
        if (prodData.success && prodData.shortUrl) {
          return NextResponse.json(prodData);
        }
      } catch (delegateErr) {
        console.warn("[RecoverAI] Delegation failed, falling back to local simulation:", delegateErr);
      }

      const appUrl = config.appUrl || "http://localhost:3000";
      const simulatedShortUrl = `${appUrl}/recovery/${paymentId}`;
      return NextResponse.json({
        success: true,
        linkId: `sim_link_${paymentId}_${Date.now()}`,
        shortUrl: simulatedShortUrl,
        referenceId,
        mode: "simulation",
        originalAmount,
        testPaymentAmount: originalAmount,
        message: "Simulation mode: Razorpay keys not configured. Using simulated payment link.",
      });
    }

    // ── LIVE / TEST MODE: Create real Razorpay payment link ───────────────
    const isTestMode = config.keyId.startsWith("rzp_test_");
    // In Razorpay Test Mode, our application applies a ₹1,000 test transaction cap.
    // Original order value: ₹32,999. Actual Razorpay Test Mode transaction: ₹1,000.
    const paymentLinkAmount = isTestMode && originalAmount > 1000 ? 1000 : originalAmount;

    const result = await createPaymentLink({
      amount: paymentLinkAmount,
      originalAmount,
      currency,
      description:
        description ??
        (paymentLinkAmount !== originalAmount
          ? `Razorpay Test Mode — ₹1,000 test transaction. Original order value: ₹${originalAmount.toLocaleString("en-IN")}.`
          : `Order #${orderId} payment — Slander's Furniture Store`),
      customerName,
      customerEmail,
      customerPhone: normalizedContact,
      referenceId,
      orderId,
      paymentId,
      callbackUrl,
      notes: {
        recoverai_payment_id: paymentId,
        recoverai_order_id: orderId,
        recoverai_reference: referenceId,
        original_amount: String(originalAmount),
        test_recovery_amount: String(paymentLinkAmount),
        payment_id: paymentId,
        type: type || "checkout",
        purpose: "RecoverAI recovery test",
      },
    });

    if (!result.success) {
      // Safe error logging: NO secrets, only status, code, description, and field
      console.error("[Razorpay API Error]", {
        httpStatus: result.error.httpStatus,
        code: result.error.code,
        description: result.error.description,
        field: result.error.field,
        step: result.error.step,
        reason: result.error.reason,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error.description ?? "Razorpay API error",
          code: result.error.code ?? "RAZORPAY_API_ERROR",
          field: result.error.field,
          httpStatus: result.error.httpStatus ?? 502,
        },
        { status: result.error.httpStatus ?? 502 }
      );
    }

    const resolvedMode: "live" | "test" = isTestMode ? "test" : "live";

    return NextResponse.json({
      success: true,
      linkId: result.data.id,
      shortUrl: result.data.short_url,
      referenceId,
      mode: resolvedMode,
      originalAmount,
      testPaymentAmount: paymentLinkAmount,
      isTestCapped: paymentLinkAmount !== originalAmount,
    });
  } catch (err: any) {
    console.error("[RecoverAI] /api/razorpay/payment-link error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
