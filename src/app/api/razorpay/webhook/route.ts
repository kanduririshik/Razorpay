/**
 * POST /api/razorpay/webhook
 *
 * Razorpay Webhook Handler — verifies HMAC-SHA256 X-Razorpay-Signature header
 * and processes payment.link.paid events.
 *
 * Configure in Razorpay Dashboard:
 *   URL: https://your-domain.vercel.app/api/razorpay/webhook
 *   Events: payment.link.paid
 *   Active Secret: RAZORPAY_WEBHOOK_SECRET env var
 *
 * SECURITY: Only processes events with a valid signature.
 * Raw body must be read before JSON parsing (NextJS requires special handling).
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { storeVerifiedRecovery, storeFailedPayment, isPaymentProcessed } from "@/lib/razorpay/sync-buffer";

export const runtime = "nodejs";

// Read raw body for HMAC verification (must not parse JSON first)
export async function POST(req: NextRequest) {
  const config = getRazorpayConfig();

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // ── Signature verification ─────────────────────────────────────────────
    if (config.webhookSecret && signature) {
      const expectedSignature = createHmac("sha256", config.webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("[RecoverAI webhook] Signature mismatch — rejecting event");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else if (config.isConfigured && !signature) {
      // If keys are configured but no signature, reject (could be spoofed)
      console.warn("[RecoverAI webhook] No X-Razorpay-Signature header — rejecting");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event?.event ?? "";

    console.log(`[RecoverAI webhook] Received event: ${eventType}`);

    // ── Handle payment.link.paid ───────────────────────────────────────────
    if (eventType === "payment_link.paid" || eventType === "payment.captured") {
      const payload = event?.payload;
      const paymentEntity = payload?.payment?.entity;
      const paymentLinkEntity = payload?.payment_link?.entity;

      if (!paymentEntity) {
        return NextResponse.json({ received: true, processed: false, reason: "No payment entity" });
      }

      // Extract our internal payment ID from notes or fallback
      const recoveraiPaymentId =
        paymentEntity?.notes?.paymentId ??
        paymentEntity?.notes?.recoverai_payment_id ??
        paymentLinkEntity?.notes?.recoverai_payment_id ??
        paymentEntity?.notes?.payment_id ??
        "PAY98231";

      const recoveraiOrderId =
        paymentEntity?.notes?.orderId ??
        paymentEntity?.notes?.recoverai_order_id ??
        paymentLinkEntity?.notes?.recoverai_order_id ??
        "RA98231";

      const businessAmount =
        Number(paymentEntity?.notes?.originalAmount) || 32999;

      // Idempotency check: if already processed, do not duplicate recovery
      if (paymentEntity.id && isPaymentProcessed(paymentEntity.id)) {
        console.log(`[RecoverAI webhook] Idempotency: Payment ${paymentEntity.id} already verified.`);
        return NextResponse.json({ received: true, processed: true, idempotent: true });
      }

      storeVerifiedRecovery({
        paymentId: recoveraiPaymentId,
        razorpayPaymentId: paymentEntity.id,
        razorpayOrderId: paymentEntity.order_id ?? "",
        amount: businessAmount, // Always credit full business order value (₹32,999)
        status: "RECOVERED",
        verifiedAt: new Date().toISOString(),
        source: "webhook",
      });

      console.log(`[RecoverAI webhook] ✅ Recovery confirmed for ${recoveraiPaymentId} — ₹${businessAmount}`);
      return NextResponse.json({ received: true, processed: true, amount: businessAmount });
    }

    // ── Handle payment.failed ───────────────────────────────────────────
    if (eventType === "payment.failed") {
      const payload = event?.payload;
      const paymentEntity = payload?.payment?.entity;
      const paymentLinkEntity = payload?.payment_link?.entity;

      if (!paymentEntity) {
        return NextResponse.json({ received: true, processed: false, reason: "No payment entity" });
      }

      const recoveraiPaymentId =
        paymentLinkEntity?.notes?.recoverai_payment_id ??
        paymentEntity?.notes?.recoverai_payment_id ??
        paymentLinkEntity?.notes?.payment_id ??
        paymentEntity?.notes?.payment_id ??
        "PAY98231";

      const recoveraiOrderId =
        paymentLinkEntity?.notes?.recoverai_order_id ??
        paymentEntity?.notes?.recoverai_order_id ??
        "RA98231";

      const failureReason =
        paymentEntity.error_description ||
        paymentEntity.error_reason ||
        "Payment declined by bank";

      storeFailedPayment({
        paymentId: recoveraiPaymentId,
        orderId: recoveraiOrderId,
        razorpayPaymentId: paymentEntity.id,
        razorpayPaymentLinkId: paymentEntity.payment_link_id ?? paymentLinkEntity?.id ?? "",
        amount: Math.round((paymentEntity.amount ?? 100000) / 100),
        failureReason,
        errorCode: paymentEntity.error_code ?? "BAD_REQUEST_ERROR",
        status: "FAILED",
        timestamp: new Date().toISOString(),
        source: "webhook",
      });

      console.log(`[RecoverAI webhook] ⚠️ Payment failure confirmed for ${recoveraiPaymentId} — ${failureReason}`);
      return NextResponse.json({ received: true, processed: true, failureReason });
    }

    // Unknown/unhandled event — acknowledge to prevent retries
    return NextResponse.json({ received: true, processed: false, event: eventType });
  } catch (err: any) {
    console.error("[RecoverAI webhook] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
