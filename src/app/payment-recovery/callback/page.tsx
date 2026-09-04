"use client";

/**
 * /payment-recovery/callback
 *
 * Razorpay redirects the customer here after completing a payment link.
 * This page:
 * 1. Reads Razorpay query parameters from the URL
 * 2. Calls /api/razorpay/verify-payment (server-side HMAC verification)
 * 3. Updates LocalStorage state to RECOVERED
 * 4. Redirects to /payment-success or /payment-failed based on result
 *
 * URL format from Razorpay:
 * /payment-recovery/callback?
 *   razorpay_payment_id=pay_xxx
 *   &razorpay_payment_link_id=plink_xxx
 *   &razorpay_payment_link_reference_id=RECOVER-PAY98231-xxx
 *   &razorpay_payment_link_status=paid
 *   &razorpay_signature=xxx
 *
 * Simulation format (from /recovery/[id] page):
 * /payment-recovery/callback?
 *   sim_payment_id=sim_pay_xxx
 *   &recoverai_payment_id=PAY98231
 *   &sim_success=1
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getStoredState,
  saveStoredState,
  completeCustomerRecovery as completeCustomerRecoveryInStore,
} from "@/lib/data/store";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "failed" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    async function handleCallback() {
      try {
        // ── Read URL parameters ──────────────────────────────────────────
        const razorpayPaymentId = searchParams.get("razorpay_payment_id");
        const razorpayPaymentLinkId = searchParams.get("razorpay_payment_link_id");
        const razorpayPaymentLinkReferenceId = searchParams.get("razorpay_payment_link_reference_id");
        const razorpayPaymentLinkStatus = searchParams.get("razorpay_payment_link_status");
        const razorpaySignature = searchParams.get("razorpay_signature");

        // Simulation params
        const simPaymentId = searchParams.get("sim_payment_id");
        const recoveraiPaymentId = searchParams.get("recoverai_payment_id");
        const simSuccess = searchParams.get("sim_success");

        // ── Extract RecoverAI payment ID ─────────────────────────────────
        // From live: parse from reference_id e.g. "RECOVER-PAY98231-xxx"
        // From sim: direct recoverai_payment_id param
        let ourPaymentId = recoveraiPaymentId;
        if (!ourPaymentId && razorpayPaymentLinkReferenceId) {
          const parts = razorpayPaymentLinkReferenceId.split("-");
          // Format: RECOVER-PAY98231-SUFFIX → index 1 = "PAY98231"
          if (parts.length >= 2) {
            ourPaymentId = parts[1];
          }
        }

        if (!ourPaymentId) {
          setStatus("error");
          setMessage("Invalid callback URL: missing payment reference.");
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // ── Call server-side verification ────────────────────────────────
        const verifyBody = razorpayPaymentId
          ? {
              razorpayPaymentId,
              razorpayPaymentLinkId,
              razorpayPaymentLinkReferenceId,
              razorpayPaymentLinkStatus,
              razorpaySignature,
              recoveraiPaymentId: ourPaymentId,
            }
          : {
              // Simulation flow
              razorpayPaymentId: simPaymentId ?? undefined,
              recoveraiPaymentId: ourPaymentId,
            };

        const res = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verifyBody),
        });

        const result = await res.json();

        if (result.verified || (simSuccess === "1" && result.success)) {
          // ── Update LocalStorage ──────────────────────────────────────
          setMessage("Payment confirmed! Updating your order...");

          // Find the order associated with this payment
          const state = getStoredState();
          const order = state.orders.find(
            (o) =>
              o.paymentId === ourPaymentId ||
              o.id === ourPaymentId
          );

          if (order) {
            completeCustomerRecoveryInStore(ourPaymentId!);
            setStatus("success");
            setMessage("Payment successful! Redirecting to your order...");

            setTimeout(() => {
              router.push(
                `/payment-success?orderId=${order.orderId}&paymentId=${ourPaymentId}&amount=${order.totalAmount}`
              );
            }, 1500);
          } else {
            // No order found — still mark success
            setStatus("success");
            setMessage("Payment verified. Redirecting...");
            setTimeout(() => {
              router.push(`/payment-success?paymentId=${ourPaymentId}`);
            }, 1500);
          }
        } else {
          setStatus("failed");
          setMessage(result.message ?? "Payment verification failed.");
          setTimeout(() => {
            router.push(`/payment-failed?paymentId=${ourPaymentId}`);
          }, 2500);
        }
      } catch (err: any) {
        console.error("[RecoverAI callback] Error:", err);
        setStatus("error");
        setMessage("An error occurred while verifying your payment.");
        setTimeout(() => router.push("/"), 3000);
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "48px",
          textAlign: "center",
          maxWidth: "440px",
          width: "90%",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>
          {status === "verifying" && "⏳"}
          {status === "success" && "✅"}
          {status === "failed" && "❌"}
          {status === "error" && "⚠️"}
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#ffffff",
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "12px",
          }}
        >
          {status === "verifying" && "Verifying Payment"}
          {status === "success" && "Payment Successful!"}
          {status === "failed" && "Payment Failed"}
          {status === "error" && "Something Went Wrong"}
        </h1>

        {/* Message */}
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "15px",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          {message}
        </p>

        {/* Spinner for verifying */}
        {status === "verifying" && (
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255,255,255,0.1)",
              borderTop: "3px solid #6366f1",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }}
          />
        )}

        {/* Status indicator bar */}
        <div
          style={{
            marginTop: "28px",
            height: "4px",
            borderRadius: "2px",
            background:
              status === "success"
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : status === "failed"
                ? "linear-gradient(90deg, #ef4444, #f87171)"
                : status === "error"
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #6366f1, #8b5cf6)",
            animation: status === "verifying" ? "pulse 1.5s ease-in-out infinite" : "none",
          }}
        />

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "16px" }}>
          Secured by RecoverAI × Razorpay
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function PaymentRecoveryCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
      }}>
        Loading...
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
