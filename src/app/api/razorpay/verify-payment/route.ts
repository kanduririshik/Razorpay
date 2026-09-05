/**
 * POST /api/razorpay/verify-payment
 *
 * Server-side verification of a completed Razorpay payment from Standard Checkout.
 *
 * Standard Checkout returns:
 *   razorpay_payment_id: string
 *   razorpay_order_id: string
 *   razorpay_signature: string
 *
 * Verification Rules:
 * 1. HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET) === razorpay_signature
 * 2. Fetch payment from Razorpay API to confirm status is "captured" or "authorized"
 * 3. Verify payment.order_id === razorpay_order_id
 * 4. IDEMPOTENCY: Check if razorpay_payment_id has already been processed.
 *    If already processed, return success without double-crediting revenue.
 * 5. Store verified recovery in SyncBuffer with original order value (₹32,999).
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { fetchRazorpayPayment } from "@/lib/razorpay/orders";
import {
  storeVerifiedRecovery,
  isPaymentProcessed,
  markPaymentProcessed,
} from "@/lib/razorpay/sync-buffer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const razorpayPaymentId =
      body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpayOrderId =
      body.razorpay_order_id || body.razorpayOrderId;
    const razorpaySignature =
      body.razorpay_signature || body.razorpaySignature;

    const internalPaymentId =
      body.internalPaymentId || body.recoveraiPaymentId || body.paymentId || "PAY98231";
    const internalOrderId =
      body.internalOrderId || body.orderId || "RA98231";
    const originalAmount =
      Number(body.originalAmount) || 32999;

    const config = getRazorpayConfig();

    // ── FALLBACK IF LOCAL KEYS NOT LOADED: Delegate to production gateway ────
    if (!config.isConfigured) {
      try {
        const prodRes = await fetch("https://razorpay-rishik.vercel.app/api/razorpay/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const prodData = await prodRes.json();
        return NextResponse.json(prodData);
      } catch (delegateErr) {
        console.warn("[RecoverAI] Verify delegation failed:", delegateErr);
      }

      return NextResponse.json(
        { success: false, verified: false, status: "FAILED", message: "Razorpay credentials not configured." },
        { status: 503 }
      );
    }

    // ── Validate Required Signature Parameters ──────────────────────────────
    if (!razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, verified: false, status: "FAILED", message: "Missing Razorpay payment ID or signature." },
        { status: 400 }
      );
    }

    // ── IDEMPOTENCY CHECK ───────────────────────────────────────────────────
    if (isPaymentProcessed(razorpayPaymentId)) {
      console.log(`[RecoverAI] Idempotency: Payment ${razorpayPaymentId} already processed.`);
      return NextResponse.json({
        success: true,
        verified: true,
        status: "RECOVERED",
        idempotent: true,
        amount: originalAmount,
        razorpayPaymentId,
        razorpayOrderId,
        message: "Payment verified successfully (idempotent duplicate request).",
        mode: config.keyId.startsWith("rzp_test_") ? "test" : "live",
      });
    }

    // ── SIGNATURE VERIFICATION ──────────────────────────────────────────────
    // For Standard Checkout with Orders API:
    // Signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
    let isSignatureValid = false;

    if (razorpayOrderId) {
      const orderPayload = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = createHmac("sha256", config.keySecret)
        .update(orderPayload)
        .digest("hex");

      try {
        isSignatureValid = timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(razorpaySignature)
        );
      } catch {
        isSignatureValid = expectedSignature === razorpaySignature;
      }
    } else if (body.razorpayPaymentLinkId) {
      // Backward compatibility for payment link signatures if ever invoked
      const linkPayload = [
        body.razorpayPaymentLinkId,
        body.razorpayPaymentLinkReferenceId || "",
        body.razorpayPaymentLinkStatus || "",
        razorpayPaymentId,
      ].join("|");

      const expectedSignature = createHmac("sha256", config.keySecret)
        .update(linkPayload)
        .digest("hex");

      isSignatureValid = expectedSignature === razorpaySignature;
    }

    if (!isSignatureValid) {
      console.error("[RecoverAI] Signature verification failed:", {
        razorpayOrderId,
        razorpayPaymentId,
      });
      return NextResponse.json(
        { success: false, verified: false, status: "FAILED", message: "Signature verification failed. Invalid Razorpay signature." },
        { status: 400 }
      );
    }

    // ── VERIFY RAZORPAY PAYMENT STATUS VIA API ──────────────────────────────
    const paymentResult = await fetchRazorpayPayment(razorpayPaymentId);

    if (!paymentResult.success) {
      console.error("[RecoverAI] Could not fetch payment from Razorpay API:", paymentResult.error);
      return NextResponse.json(
        {
          success: false,
          verified: false,
          status: "FAILED",
          message: `Razorpay API error: ${paymentResult.error.description}`,
        },
        { status: 502 }
      );
    }

    const payment = paymentResult.data;

    // Verify order ID matches if order exists
    if (razorpayOrderId && payment.order_id && payment.order_id !== razorpayOrderId) {
      console.error("[RecoverAI] Order ID mismatch:", {
        expected: razorpayOrderId,
        received: payment.order_id,
      });
      return NextResponse.json(
        { success: false, verified: false, status: "FAILED", message: "Payment order ID mismatch." },
        { status: 400 }
      );
    }

    // Verify payment is successful (captured or authorized)
    if (payment.status !== "captured" && payment.status !== "authorized") {
      console.warn(`[RecoverAI] Payment status not successful: ${payment.status}`);
      return NextResponse.json({
        success: true,
        verified: false,
        status: payment.status === "failed" ? "FAILED" : "PENDING",
        message: `Payment status in Razorpay: ${payment.status}`,
        mode: config.keyId.startsWith("rzp_test_") ? "test" : "live",
      });
    }

    // ── MARK PROCESSED & STORE RECOVERY ─────────────────────────────────────
    markPaymentProcessed(razorpayPaymentId);

    // Store in SyncBuffer with full original order value (₹32,999)
    storeVerifiedRecovery({
      paymentId: internalPaymentId,
      razorpayPaymentId,
      razorpayOrderId: razorpayOrderId || payment.order_id,
      amount: originalAmount, // Business value ₹32,999 recovered
      status: "RECOVERED",
      verifiedAt: new Date().toISOString(),
      source: "checkout_verify",
    });

    const isTestMode = config.keyId.startsWith("rzp_test_");

    console.log(`[RecoverAI] ✅ Recovery verified for ${internalPaymentId} (${internalOrderId}) — ₹${originalAmount}`);

    return NextResponse.json({
      success: true,
      verified: true,
      status: "RECOVERED",
      amount: originalAmount,
      testTransactionAmount: Math.round(payment.amount / 100),
      razorpayPaymentId,
      razorpayOrderId: razorpayOrderId || payment.order_id,
      message: "Payment verified successfully. Recovery confirmed.",
      mode: isTestMode ? "test" : "live",
    });
  } catch (err: any) {
    console.error("[RecoverAI] /api/razorpay/verify-payment error:", err);
    return NextResponse.json(
      { success: false, verified: false, status: "FAILED", message: "Internal server error" },
      { status: 500 }
    );
  }
}
