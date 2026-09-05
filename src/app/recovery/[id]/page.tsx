"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  loadRazorpayCheckoutScript,
  RazorpayCheckoutOptions,
  RazorpaySuccessResponse,
  RazorpayFailureResponse,
} from "@/lib/razorpay/checkout-client";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Armchair,
  QrCode,
  Building2,
  Loader2,
  Lock,
  AlertCircle,
} from "lucide-react";

export default function CustomerRecoveryPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || "PAY98231";
  const paymentId = rawId.toUpperCase();

  const { getPaymentById, completeRecovery, getOrder } = useDemoData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chosenMethod, setChosenMethod] = useState("UPI Fast-Pay");

  const query = getPaymentById(paymentId);
  const order = getOrder(paymentId);

  const originalAmount = order?.totalAmount || query?.payment?.amount || 32999;
  const productName = order?.items[0]?.productName || "Modern 3-Seater Sofa";
  const orderId = order?.orderId || "RA98231";
  const testGatewayAmount = 1000;

  // Preload checkout.js on page mount
  useEffect(() => {
    loadRazorpayCheckoutScript().catch(() => {});
  }, []);

  const handleCompletePayment = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Ensure Razorpay Standard Checkout script is ready
      const scriptReady = await loadRazorpayCheckoutScript();
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Could not load Razorpay gateway. Please verify your connection.");
      }

      // 2. Create Razorpay recovery order via Orders API (server enforces ₹1,000 test cap)
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "recovery",
          orderId,
          paymentId,
          originalAmount,
          customer: {
            name: "Rahul Sharma",
            email: "rahul.sharma@gmail.com",
            contact: "9820145892",
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to create Razorpay recovery order.");
      }

      // 3. Initialize Razorpay Standard Checkout modal
      const options: RazorpayCheckoutOptions = {
        key: orderData.keyId,
        amount: orderData.amount, // 100000 paise = ₹1,000
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "Slander's Furniture Store",
        description: `Recovery Payment for Order #${orderId} (₹${originalAmount.toLocaleString("en-IN")})`,
        prefill: {
          name: "Rahul Sharma",
          email: "rahul.sharma@gmail.com",
          contact: "9820145892",
        },
        notes: {
          orderId,
          paymentId,
          originalAmount: originalAmount.toString(),
          testAmount: testGatewayAmount.toString(),
          type: "recovery",
        },
        theme: {
          color: "#059669",
        },
        modal: {
          ondismiss: () => {
            console.log("[Recovery] Razorpay checkout dismissed by customer");
            setIsSubmitting(false);
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          console.log("[Recovery] Razorpay payment successful, verifying server-side...", response);

          try {
            // 4. Server-side payment verification (HMAC signature + API status check)
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internalOrderId: orderId,
                internalPaymentId: paymentId,
                originalAmount,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.verified) {
              throw new Error(verifyData.message || "Payment could not be verified by server.");
            }

            // 5. Update local store state upon verified confirmation (+₹32,999 recovered)
            completeRecovery(paymentId);
            setIsSubmitting(false);

            // 6. Navigate to success confirmation page
            router.push(
              `/payment-success?paymentId=${encodeURIComponent(paymentId)}&orderId=${encodeURIComponent(orderId)}&recovered=true`
            );
          } catch (verifyErr: any) {
            console.error("[Recovery] Server verification error:", verifyErr);
            setIsSubmitting(false);
            setErrorMessage(verifyErr.message || "Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (failResponse: RazorpayFailureResponse) => {
        console.warn("[Recovery] Payment attempt failed inside gateway:", failResponse);
        setIsSubmitting(false);
        setErrorMessage(
          failResponse.error?.description || "Payment was declined by Razorpay test gateway."
        );
      });

      rzp.open();
    } catch (err: any) {
      console.error("[Recovery] Error initiating recovery checkout:", err);
      setIsSubmitting(false);
      setErrorMessage(err.message || "Payment gateway unavailable. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Slander&apos;s Furniture Store
              </p>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                Complete Your Furniture Reservation
              </h1>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold flex items-center space-x-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Order Reserved</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* VIP Customer Greeting */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Dear Rahul Sharma,
            </span>
            <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
              VIP Tier 1
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your reservation for the <strong className="text-white">{productName}</strong> has been secured. Complete this step to instantly dispatch white-glove delivery.
          </p>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Order ID</span>
            <span className="font-semibold text-amber-300 block">#{orderId}</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Payment ID</span>
            <span className="font-semibold text-white block truncate">{paymentId}</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Original Order Value</span>
            <span className="font-bold text-white block">{formatINR(originalAmount)}</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Test Mode Gateway</span>
            <span className="font-semibold text-blue-300 block font-mono">
              ₹{testGatewayAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Gateway Test Instructions */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-blue-300 font-semibold font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>RAZORPAY TEST RECOVERY INSTRUCTION</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Click <strong>Complete Payment — ₹1,000</strong> below. Razorpay Standard Checkout will open. Select <strong>UPI</strong>, enter <code className="text-amber-300 bg-black/60 px-1.5 py-0.5 rounded font-mono font-bold select-all">success@razorpay</code>, and complete the payment.
          </p>
          <p className="text-[10px] text-slate-400 border-t border-blue-500/20 pt-1">
            Razorpay Test Mode — ₹1,000 test transaction. Order &amp; Recovery value: ₹32,999.
          </p>
        </div>

        {/* Security / Verification Badge */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold tracking-wider font-mono text-slate-200">
              Razorpay Standard Checkout Channel
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">256-Bit SSL Encrypted</span>
        </div>

        {/* Action Button: COMPLETE PAYMENT */}
        <div className="space-y-3">
          <button
            onClick={handleCompletePayment}
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening Razorpay Checkout...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  Complete Payment — ₹{testGatewayAmount.toLocaleString("en-IN")}
                </span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-500 font-mono">
            Opens official Razorpay Standard Checkout • Confirms order {orderId} ({formatINR(originalAmount)}) upon test payment.
          </p>
        </div>
      </div>
    </div>
  );
}
