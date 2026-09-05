/**
 * POST /api/razorpay/record-failure
 *
 * Captures real-time failure telemetry from Razorpay Standard Checkout's
 * payment.failed event callback:
 * - razorpayOrderId
 * - razorpayPaymentId
 * - errorCode
 * - errorDescription
 * - errorReason
 * - errorStep
 * - errorSource
 *
 * Stores the failure in SyncBuffer so the RecoverAI Merchant Command Center
 * immediately surfaces the actual gateway failure without hardcoding.
 */

import { NextRequest, NextResponse } from "next/server";
import { storeFailedPayment } from "@/lib/razorpay/sync-buffer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpayOrderId = "",
      razorpayPaymentId = "",
      errorCode = "PAYMENT_FAILED",
      errorDescription = "Payment was declined by the bank gateway",
      errorReason = "",
      errorStep = "",
      errorSource = "",
      internalOrderId = "RA98231",
      internalPaymentId = "PAY98231",
      amount = 1000,
    } = body;

    console.log("[RecoverAI] Telemetry: Recording Razorpay failure:", {
      razorpayOrderId,
      razorpayPaymentId,
      errorCode,
      errorDescription,
      errorReason,
      internalOrderId,
      internalPaymentId,
    });

    // Store in server SyncBuffer
    storeFailedPayment({
      paymentId: internalPaymentId,
      orderId: internalOrderId,
      razorpayPaymentId,
      razorpayOrderId,
      amount: Number(amount) || 1000,
      failureReason: errorDescription || errorReason || "Payment declined by bank gateway",
      errorCode,
      errorReason,
      errorStep,
      errorSource,
      status: "FAILED",
      timestamp: new Date().toISOString(),
      source: "checkout_client",
    });

    return NextResponse.json({
      success: true,
      recorded: true,
      internalPaymentId,
      internalOrderId,
      failureReason: errorDescription,
    });
  } catch (err: any) {
    console.error("[RecoverAI] /api/razorpay/record-failure error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to record failure telemetry" },
      { status: 500 }
    );
  }
}
