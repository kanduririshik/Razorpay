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

    // ── SIMULATION FALLBACK: Razorpay not configured ──────────────────────
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
        message: "Simulation mode: Razorpay keys not configured. Using simulated payment link.",
      });
    }

    // ── LIVE: Create real Razorpay payment link ───────────────────────────
    const result = await createPaymentLink({
      amount,
      currency,
      description:
        description ??
        `Payment recovery for Order ${orderId} — RecoverAI`,
      customerName,
      customerEmail,
      customerPhone: customerPhone.startsWith("+") ? customerPhone : `+91${customerPhone.replace(/\D/g, "")}`,
      referenceId,
      orderId,
      paymentId,
    });

    if (!result.success) {
      console.error("[RecoverAI] Razorpay API error:", result.error);
      // Graceful degradation to simulation
      const appUrl = config.appUrl || "http://localhost:3000";
      return NextResponse.json({
        success: true,
        linkId: `fallback_link_${paymentId}_${Date.now()}`,
        shortUrl: `${appUrl}/recovery/${paymentId}`,
        referenceId,
        mode: "simulation",
        message: `Razorpay API error (${result.error.code}): falling back to simulation.`,
        razorpayError: result.error.description,
      });
    }

    return NextResponse.json({
      success: true,
      linkId: result.data.id,
      shortUrl: result.data.short_url,
      referenceId,
      mode: "live",
    });
  } catch (err: any) {
    console.error("[RecoverAI] /api/razorpay/payment-link error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
