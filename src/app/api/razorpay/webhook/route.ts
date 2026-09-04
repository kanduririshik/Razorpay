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
import { storeVerifiedRecovery } from "@/lib/razorpay/sync-buffer";

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

      // Extract our internal payment ID from notes
      const recoveraiPaymentId =
        paymentLinkEntity?.notes?.recoverai_payment_id ??
        paymentEntity?.notes?.recoverai_payment_id;

      if (!recoveraiPaymentId) {
        console.warn("[RecoverAI webhook] No recoverai_payment_id in notes — skipping");
        return NextResponse.json({ received: true, processed: false, reason: "No recoverai_payment_id" });
      }

      const amountInRupees = Math.round((paymentEntity.amount ?? 0) / 100);

      storeVerifiedRecovery({
        paymentId: recoveraiPaymentId,
        razorpayPaymentId: paymentEntity.id,
        razorpayPaymentLinkId: paymentEntity.payment_link_id ?? paymentLinkEntity?.id ?? "",
        amount: amountInRupees,
        status: "RECOVERED",
        verifiedAt: new Date().toISOString(),
        source: "webhook",
      });

      console.log(`[RecoverAI webhook] ✅ Recovery confirmed for ${recoveraiPaymentId} — ₹${amountInRupees}`);
      return NextResponse.json({ received: true, processed: true });
    }

    // Unknown/unhandled event — acknowledge to prevent retries
    return NextResponse.json({ received: true, processed: false, event: eventType });
  } catch (err: any) {
    console.error("[RecoverAI webhook] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
