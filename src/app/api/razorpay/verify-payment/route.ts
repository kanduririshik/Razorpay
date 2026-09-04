/**
 * POST /api/razorpay/verify-payment
 *
 * Server-side verification of a completed Razorpay payment.
 * Called from the /payment-recovery/callback page after redirect from Razorpay.
 *
 * For payment link redirects, Razorpay appends query params:
 *   razorpay_payment_id
 *   razorpay_payment_link_id
 *   razorpay_payment_link_reference_id
 *   razorpay_payment_link_status
 *   razorpay_signature
 *
 * Request body:
 * {
 *   razorpayPaymentId: string;
 *   razorpayPaymentLinkId: string;
 *   razorpayPaymentLinkReferenceId: string;
 *   razorpayPaymentLinkStatus: string;
 *   razorpaySignature: string;
 *   recoveraiPaymentId: string;   — Our internal payment ID
 * }
 *
 * Response:
 * {
 *   success: boolean;
 *   verified: boolean;
 *   status: "RECOVERED" | "FAILED" | "PENDING";
 *   amount?: number;
 *   razorpayPaymentId?: string;
 *   message: string;
 *   mode: "live" | "simulation";
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { verifyPaymentById } from "@/lib/razorpay/payment-links";
import { storeVerifiedRecovery } from "@/lib/razorpay/sync-buffer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpayPaymentId,
      razorpayPaymentLinkId,
      razorpayPaymentLinkReferenceId,
      razorpayPaymentLinkStatus,
      razorpaySignature,
      recoveraiPaymentId,
    } = body;

    const config = getRazorpayConfig();

    // ── SIMULATION MODE: No Razorpay keys configured ──────────────────────
    if (!config.isConfigured) {
      // Accept simulation payment IDs (sim_payment_xxx) as verified
      if (
        recoveraiPaymentId &&
        (razorpayPaymentId?.startsWith("sim_") || !razorpayPaymentId)
      ) {
        storeVerifiedRecovery({
          paymentId: recoveraiPaymentId,
          razorpayPaymentId: razorpayPaymentId ?? `sim_${Date.now()}`,
          razorpayPaymentLinkId: razorpayPaymentLinkId ?? "sim_link",
          amount: 0,
          status: "RECOVERED",
          verifiedAt: new Date().toISOString(),
          source: "callback",
        });
        return NextResponse.json({
          success: true,
          verified: true,
          status: "RECOVERED",
          message: "Simulation payment verified successfully.",
          mode: "simulation",
        });
      }
      return NextResponse.json(
        { success: false, verified: false, status: "FAILED", message: "Razorpay not configured and no simulation ID provided." },
        { status: 400 }
      );
    }

    // ── LIVE: Verify Razorpay signature ───────────────────────────────────
    if (!razorpayPaymentId || !razorpayPaymentLinkId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, verified: false, status: "FAILED", message: "Missing Razorpay parameters." },
        { status: 400 }
      );
    }

    // Signature verification: HMAC-SHA256 of "payment_link_id|payment_link_reference_id|payment_link_status|razorpay_payment_id"
    const expectedSignaturePayload = [
      razorpayPaymentLinkId,
      razorpayPaymentLinkReferenceId,
      razorpayPaymentLinkStatus,
      razorpayPaymentId,
    ].join("|");

    const expectedSignature = createHmac("sha256", config.keySecret)
      .update(expectedSignaturePayload)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("[RecoverAI] Signature mismatch", {
        expected: expectedSignature,
        received: razorpaySignature,
      });
      return NextResponse.json(
        { success: false, verified: false, status: "FAILED", message: "Signature verification failed. Payment not verified." },
        { status: 400 }
      );
    }

    // ── Fetch actual payment status from Razorpay API ────────────────────
    const paymentResult = await verifyPaymentById(razorpayPaymentId);

    if (!paymentResult.success) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          status: "FAILED",
          message: `Could not fetch payment from Razorpay: ${paymentResult.error.description}`,
        },
        { status: 502 }
      );
    }

    const payment = paymentResult.data;

    if (payment.status === "captured" || payment.status === "authorized") {
      // Store in sync buffer so client can poll and update LocalStorage
      storeVerifiedRecovery({
        paymentId: recoveraiPaymentId,
        razorpayPaymentId,
        razorpayPaymentLinkId,
        amount: Math.round(payment.amount / 100), // Convert paise to rupees
        status: "RECOVERED",
        verifiedAt: new Date().toISOString(),
        source: "callback",
      });

      return NextResponse.json({
        success: true,
        verified: true,
        status: "RECOVERED",
        amount: Math.round(payment.amount / 100),
        razorpayPaymentId,
        message: "Payment verified successfully. Recovery confirmed.",
        mode: "live",
      });
    }

    return NextResponse.json({
      success: true,
      verified: false,
      status: payment.status === "failed" ? "FAILED" : "PENDING",
      message: `Payment status from Razorpay: ${payment.status}`,
      mode: "live",
    });
  } catch (err: any) {
    console.error("[RecoverAI] /api/razorpay/verify-payment error:", err);
    return NextResponse.json(
      { success: false, verified: false, status: "FAILED", message: "Internal server error" },
      { status: 500 }
    );
  }
}
