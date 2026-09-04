"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredState, saveStoredState } from "@/lib/data/store";
import { Loader2, AlertCircle } from "lucide-react";

function CheckoutCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState("Verifying payment with Razorpay gateway...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      const razorpayPaymentId = searchParams.get("razorpay_payment_id");
      const razorpayPaymentLinkId = searchParams.get("razorpay_payment_link_id");
      const razorpayLinkStatus = searchParams.get("razorpay_payment_link_status");
      const razorpaySignature = searchParams.get("razorpay_signature");
      const orderId = searchParams.get("orderId") || "RA98231";
      const paymentId = searchParams.get("paymentId") || "PAY98231";

      // Query authoritative server status from Razorpay API
      try {
        const queryParams = new URLSearchParams();
        if (razorpayPaymentLinkId) queryParams.set("linkId", razorpayPaymentLinkId);
        if (razorpayPaymentId) queryParams.set("paymentId", razorpayPaymentId);
        queryParams.set("internalPaymentId", paymentId);
        queryParams.set("internalOrderId", orderId);

        const statusRes = await fetch(`/api/razorpay/check-payment-status?${queryParams.toString()}`);
        const statusData = await statusRes.json();

        // 1. If Razorpay reports payment FAILED
        if (statusData.status === "FAILED" || razorpayLinkStatus === "failed") {
          const failureReason = statusData.failureReason || "Payment was declined by the bank";

          // Update LocalStorage recoverai_demo_store_v1 idempotently
          const state = getStoredState();
          const targetPayment = state.payments.find(
            (p) => p.paymentId === paymentId || p.id === paymentId
          );
          if (targetPayment) {
            targetPayment.status = "FAILED";
            targetPayment.failureReason = failureReason as any;
            targetPayment.razorpayLinkId = razorpayPaymentLinkId || targetPayment.razorpayLinkId;
            if (razorpayPaymentId) (targetPayment as any).razorpayPaymentId = razorpayPaymentId;
          }

          const targetOrder = state.orders?.find(
            (o) => o.orderId === orderId || o.paymentId === paymentId
          );
          if (targetOrder) {
            targetOrder.status = "PAYMENT_FAILED" as any;
            targetOrder.paymentStatus = "FAILED";
            targetOrder.failureReason = failureReason;
          }

          saveStoredState(state);

          // If opened as popup/child tab from checkout, post message to parent and close
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                {
                  type: "RAZORPAY_PAYMENT_FAILED",
                  reason: failureReason,
                  orderId,
                  paymentId,
                },
                "*"
              );
              window.close();
              return;
            } catch (postErr) {
              console.warn("Could not postMessage to opener:", postErr);
            }
          }

          setStatusText(`Payment failed: ${failureReason}. Redirecting...`);
          router.replace(
            `/checkout?failed=true&orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}&reason=${encodeURIComponent(failureReason)}`
          );
          return;
        }

        // 2. If Razorpay reports payment PAID or CAPTURED with valid signature
        if (statusData.status === "PAID" || statusData.status === "RECOVERED" || razorpayLinkStatus === "paid") {
          if (razorpaySignature && razorpayPaymentId && razorpayPaymentLinkId) {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId,
                razorpayPaymentLinkId,
                razorpayPaymentLinkReferenceId: searchParams.get("razorpay_payment_link_reference_id") || "",
                razorpayPaymentLinkStatus: razorpayLinkStatus || "paid",
                razorpaySignature,
                recoveraiPaymentId: paymentId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              router.replace(`/payment-success?orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}`);
              return;
            }
          }
        }

        // Default fallback to payment failed if not explicitly verified
        router.replace(
          `/payment-failed?orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}`
        );
      } catch (err) {
        console.error("[RecoverAI] Error in checkout callback:", err);
        router.replace(`/payment-failed?orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}`);
      }
    }

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
        <h2 className="text-xl font-serif font-bold text-white">
          Slander&apos;s Furniture Store
        </h2>
        <p className="text-xs text-slate-300 font-mono">{statusText}</p>
        <p className="text-[11px] text-slate-500">
          Syncing transaction state with Razorpay gateway...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}
