/**
 * GET /api/razorpay/check-payment-status
 *
 * Authoritative server-side status check for a Razorpay Payment Link or Payment ID.
 * Queries Razorpay API directly via Basic Auth to get the exact payment status
 * and actual failure reason.
 *
 * Query params:
 *   ?linkId=plink_xxx
 *   ?paymentId=pay_xxx
 *   ?internalPaymentId=PAY98231
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchPaymentLink, verifyPaymentById } from "@/lib/razorpay/payment-links";
import { getRazorpayConfig } from "@/lib/razorpay/config";
import { razorpayFetch } from "@/lib/razorpay/client";
import { storeFailedPayment, storeVerifiedRecovery } from "@/lib/razorpay/sync-buffer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const config = getRazorpayConfig();
  if (!config.isConfigured) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: "Razorpay is not configured",
    });
  }

  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get("linkId");
  const paymentId = searchParams.get("paymentId");
  const internalPaymentId = searchParams.get("internalPaymentId") || "PAY98231";
  const internalOrderId = searchParams.get("internalOrderId") || "RA98231";

  try {
    // 1. If specific Razorpay payment ID provided
    if (paymentId && paymentId.startsWith("pay_")) {
      const res = await verifyPaymentById(paymentId);
      if (res.success) {
        const payment = res.data;
        const isFailed = payment.status === "failed";
        const isCaptured = payment.status === "captured";

        if (isFailed) {
          const failureReason =
            payment.error_description ||
            payment.error_reason ||
            "Payment was declined by the bank";

          storeFailedPayment({
            paymentId: internalPaymentId,
            orderId: internalOrderId,
            razorpayPaymentId: payment.id,
            razorpayPaymentLinkId: payment.payment_link_id || linkId || "",
            amount: Math.round(payment.amount / 100),
            failureReason,
            errorCode: payment.error_code || "BAD_REQUEST_ERROR",
            status: "FAILED",
            timestamp: new Date().toISOString(),
            source: "status_check",
          });

          return NextResponse.json({
            success: true,
            status: "FAILED",
            failureReason,
            errorCode: payment.error_code,
            razorpayPaymentId: payment.id,
          });
        }

        if (isCaptured) {
          storeVerifiedRecovery({
            paymentId: internalPaymentId,
            razorpayPaymentId: payment.id,
            razorpayPaymentLinkId: payment.payment_link_id || linkId || "",
            amount: Math.round(payment.amount / 100),
            status: "RECOVERED",
            verifiedAt: new Date().toISOString(),
            source: "callback",
          });

          return NextResponse.json({
            success: true,
            status: "RECOVERED",
            razorpayPaymentId: payment.id,
          });
        }
      }
    }

    // 2. If Payment Link ID provided, inspect link and its payment attempts
    if (linkId && linkId.startsWith("plink_")) {
      const linkRes = await fetchPaymentLink(linkId);
      if (linkRes.success) {
        const link = linkRes.data;

        // If link status is paid
        if (link.status === "paid") {
          return NextResponse.json({
            success: true,
            status: "PAID",
            linkId: link.id,
            amountPaid: link.amount_paid / 100,
          });
        }

        // Check payments array for attempts
        if (Array.isArray(link.payments) && link.payments.length > 0) {
          const latestAttempt: any = link.payments[link.payments.length - 1];
          const attemptId = typeof latestAttempt === "string" ? latestAttempt : latestAttempt?.id;

          if (attemptId) {
            const payRes = await verifyPaymentById(attemptId);
            if (payRes.success) {
              const pay = payRes.data;
              if (pay.status === "failed") {
                const failureReason =
                  pay.error_description ||
                  pay.error_reason ||
                  "Payment was declined by the bank";

                storeFailedPayment({
                  paymentId: internalPaymentId,
                  orderId: internalOrderId,
                  razorpayPaymentId: pay.id,
                  razorpayPaymentLinkId: link.id,
                  amount: Math.round(pay.amount / 100),
                  failureReason,
                  errorCode: pay.error_code || "BAD_REQUEST_ERROR",
                  status: "FAILED",
                  timestamp: new Date().toISOString(),
                  source: "status_check",
                });

                return NextResponse.json({
                  success: true,
                  status: "FAILED",
                  failureReason,
                  errorCode: pay.error_code,
                  razorpayPaymentId: pay.id,
                  linkId: link.id,
                });
              }

              if (pay.status === "captured") {
                return NextResponse.json({
                  success: true,
                  status: "RECOVERED",
                  razorpayPaymentId: pay.id,
                  linkId: link.id,
                });
              }
            }
          }
        }

        // Return current link status
        return NextResponse.json({
          success: true,
          status: link.status.toUpperCase(),
          linkId: link.id,
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: "Could not retrieve status from Razorpay",
    });
  } catch (err: any) {
    console.error("[RecoverAI] /api/razorpay/check-payment-status error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
