"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
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
} from "lucide-react";

export default function CustomerRecoveryPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || "PAY98231";
  const paymentId = rawId.toUpperCase();

  const { getPaymentById, completeRecovery, getOrder } = useDemoData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chosenMethod, setChosenMethod] = useState("UPI Fast-Pay");

  const query = getPaymentById(paymentId);
  const order = getOrder(paymentId);

  const amount = order?.totalAmount || query?.payment?.amount || 32999;
  const productName = order?.items[0]?.productName || "Modern 3-Seater Sofa";
  const orderId = order?.orderId || "RA98231";

  const payment = query?.payment;
  const initialShortUrl = (payment as any)?.razorpayShortUrl;
  const [liveLink, setLiveLink] = useState<string | null>(initialShortUrl || null);
  const [liveAmount, setLiveAmount] = useState<number | null>((payment as any)?.testPaymentAmount || null);

  // Auto-resolve live Razorpay payment link if not yet populated
  React.useEffect(() => {
    if (!initialShortUrl && payment) {
      fetch("/api/razorpay/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.paymentId,
          orderId,
          amount,
          originalAmount: amount,
          type: "recovery",
          currency: "INR",
          customerName: "Rahul Sharma",
          customerEmail: "rahul.sharma@gmail.com",
          customerPhone: "9820145892",
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && (data.mode === "live" || data.mode === "test") && data.shortUrl) {
            setLiveLink(data.shortUrl);
            setLiveAmount(data.testPaymentAmount || 1000);
          }
        })
        .catch(() => {});
    }
  }, [initialShortUrl, payment, orderId, amount]);

  const effectiveShortUrl = liveLink || initialShortUrl;
  const isRazorpayLive = Boolean(
    effectiveShortUrl &&
    ((payment as any)?.razorpayMode === "live" ||
      (payment as any)?.razorpayMode === "test" ||
      effectiveShortUrl.startsWith("https://rzp.io/"))
  );
  const effectivePayAmount = isRazorpayLive && liveAmount ? liveAmount : amount;

  const handleCompletePayment = async () => {
    setIsSubmitting(true);

    // ── LIVE RAZORPAY PAYMENT LINK ──────────────────────────────────────
    // If a real Razorpay shortUrl exists:
    // 1. DO NOT run the 900ms simulation
    // 2. DO NOT immediately call completeRecovery()
    // 3. Redirect the browser to the Razorpay hosted payment link
    if (isRazorpayLive && effectiveShortUrl) {
      window.location.href = effectiveShortUrl;
      return;
    }

    // ── SIMULATION FALLBACK (only when unconfigured or explicit simulation) ──
    await new Promise((res) => setTimeout(res, 900));

    try {
      await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recoveraiPaymentId: paymentId,
        }),
      });
    } catch (e) {
      // Non-fatal
    }

    const result = completeRecovery(paymentId);
    setIsSubmitting(false);

    router.push(
      `/payment-success?paymentId=${result.paymentId}&orderId=${result.orderId}&recovered=true`
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>SECURE PAYMENT LINK — SLANDER&apos;S FURNITURE STORE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            COMPLETE YOUR ORDER
          </h1>

          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Your previous payment attempt was declined. Complete your payment below to confirm your furniture order.
          </p>
        </div>

        {/* Item & Amount Card */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Armchair className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Order</span>
                <h3 className="text-base font-semibold text-white">{productName}</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">
                {isRazorpayLive && liveAmount ? "Original Value" : "Amount"}
              </span>
              <span className="text-xl font-bold text-amber-400 font-mono">
                {formatINR(amount)}
              </span>
            </div>
          </div>

          {/* Test Mode Note if applicable */}
          {isRazorpayLive && liveAmount && liveAmount !== amount && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs space-y-1">
              <div className="font-semibold flex items-center justify-between">
                <span>Razorpay Test Mode — {formatINR(liveAmount)} test transaction.</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Original payment value: {formatINR(amount)}. Completing this test payment confirms your full furniture order.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-400 pt-1">
            <div>
              <span className="text-slate-500 block">Merchant:</span>
              <span className="text-white font-semibold">Slander&apos;s Furniture Store</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status:</span>
              <span className="text-amber-400 font-semibold">{payment?.failureReason || "Payment Pending"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Method:</span>
              <span className="text-emerald-400 font-semibold">
                {isRazorpayLive ? "Razorpay Gateway" : "Instant Pay"}
              </span>
            </div>
          </div>
        </div>

        {/* Method Selector */}
        {!isRazorpayLive && (
        <div className="space-y-3">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Select Resolution Channel:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setChosenMethod("UPI Fast-Pay")}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                chosenMethod === "UPI Fast-Pay"
                  ? "bg-amber-500/10 border-amber-500 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-semibold text-slate-200">UPI 1-Click Pay</p>
                  <p className="text-[10px] text-slate-500">Auto-routed backup VPA</p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border border-amber-500 flex items-center justify-center">
                {chosenMethod === "UPI Fast-Pay" && (
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setChosenMethod("Tokenized Card")}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                chosenMethod === "Tokenized Card"
                  ? "bg-amber-500/10 border-amber-500 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-semibold text-slate-200">Alternative Card</p>
                  <p className="text-[10px] text-slate-500">Zero OTP retry</p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center">
                {chosenMethod === "Tokenized Card" && (
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
            </button>
          </div>
        </div>
        )}

        {/* Security / Verification Badge */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold tracking-wider font-mono text-slate-200">
              {isRazorpayLive ? "Razorpay Hosted Payment Channel" : "Verified Recovery Channel"}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">256-Bit SSL Encrypted</span>
        </div>

        {/* Action Button: COMPLETE PAYMENT */}
        <div className="space-y-3">
          <button
            onClick={handleCompletePayment}
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isRazorpayLive ? "Redirecting to Razorpay..." : "Processing Payment..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  Complete Payment — {formatINR(effectivePayAmount)}
                </span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-500 font-mono">
            {isRazorpayLive
              ? `Opens official Razorpay hosted checkout • Confirms order ${orderId} (${formatINR(amount)}) upon test payment.`
              : `Secure Payment Completion • Confirms your furniture order and triggers immediate logistics fulfillment.`}
          </p>
        </div>
      </div>
    </div>
  );
}
