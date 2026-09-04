/**
 * POST /api/razorpay/payment-link
 *
 * Creates a Razorpay Payment Link for recovery flow.
 * Called by the admin SimulationModal during the ACTING stage.
 *
 * Request body:
 * {
 *   paymentId: string;       — RecoverAI payment ID (e.g. "PAY98231")
 *   orderId: string;         — RecoverAI order ID (e.g. "RA98231")
 *   amount: number;          — Amount in INR (e.g. 32999)
 *   currency?: string;       — Default "INR"
 *   customerName: string;
 *   customerEmail: string;
 *   customerPhone: string;
 *   description?: string;
 * }
 *
 * Response (success):
 * {
 *   success: true;
 *   linkId: string;          — Razorpay payment link ID
 *   shortUrl: string;        — Short URL to send to customer
 *   referenceId: string;     — Our reference ID for tracking
 *   mode: "live"             — "live" when Razorpay, "simulation" as fallback
 * }
 *
 * Response (not configured — graceful simulation fallback):
 * {
 *   success: true;
 *   linkId: string;          — Simulated link ID
 *   shortUrl: string;        — Simulated fallback URL
 *   referenceId: string;
 *   mode: "simulation"
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
      currency = "INR",
      customerName,
      customerEmail,
      customerPhone,
      description,
    } = body;

    // Validate required fields
    if (!paymentId || !orderId || !amount || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const config = getRazorpayConfig();
    const referenceId = generateRecoveryReferenceId(paymentId);

    // ── SIMULATION FALLBACK: Razorpay genuinely not configured ────────────
    if (!config.isConfigured) {
      console.log("[RecoverAI] Razorpay not configured — using simulation fallback");
      const appUrl = config.appUrl || "http://localhost:3000";
      const simulatedShortUrl = `${appUrl}/recovery/${paymentId}`;
      return NextResponse.json({
        success: true,
        linkId: `sim_link_${paymentId}_${Date.now()}`,
        shortUrl: simulatedShortUrl,
        referenceId,
        mode: "simulation",
        originalAmount: amount,
        testPaymentAmount: amount,
        message: "Simulation mode: Razorpay keys not configured. Using simulated payment link.",
      });
    }

    // ── LIVE / TEST MODE: Create real Razorpay payment link ───────────────
    const isTestMode = config.keyId.startsWith("rzp_test_");
    const originalAmount = amount;
    // In Razorpay Test Mode, unactivated accounts have a ₹15,000 limit per payment link.
    // When in Test Mode and amount > ₹15,000, cap the test link to ₹1,000 while retaining ₹32,999 in RecoverAI.
    const paymentLinkAmount = isTestMode && originalAmount > 15000 ? 1000 : originalAmount;

    const result = await createPaymentLink({
      amount: paymentLinkAmount,
      originalAmount,
      currency,
      description:
        description ??
        (paymentLinkAmount !== originalAmount
          ? `Razorpay Test Recovery for Order ${orderId} (Original: ₹${originalAmount.toLocaleString("en-IN")}) — RecoverAI`
          : `Payment recovery for Order ${orderId} — RecoverAI`),
      customerName,
      customerEmail,
      customerPhone: customerPhone.startsWith("+") ? customerPhone : `+91${customerPhone.replace(/\D/g, "")}`,
      referenceId,
      orderId,
      paymentId,
    });

    if (!result.success) {
      console.error("[RecoverAI] Razorpay API error:", result.error);
      // NEVER silently fall back to simulation when Razorpay is configured!
      return NextResponse.json(
        {
          success: false,
          error: result.error.description ?? "Razorpay API error",
          code: result.error.code ?? "RAZORPAY_API_ERROR",
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
