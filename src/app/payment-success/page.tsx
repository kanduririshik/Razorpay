"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Armchair,
  ExternalLink,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") || "PAY98231";
  const orderId = searchParams.get("orderId") || "RA98231";

  const { getOrder, getPaymentById } = useDemoData();
  const order = getOrder(orderId);
  const paymentQuery = getPaymentById(paymentId);

  const amount = order?.totalAmount || paymentQuery?.payment?.amount || 32999;
  const productName = order?.items[0]?.productName || "Modern 3-Seater Sofa";

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"],
      });
    } catch (e) {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-fade-in">
          <CheckCircle2 className="w-11 h-11" />
        </div>

        {/* Title & Subtext */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            ✓ Payment Successful
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight font-mono">
            {formatINR(amount)}
          </h1>
          <p className="text-base font-semibold text-white">
            Your payment has been recovered and your order is confirmed.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Order for <strong className="text-slate-200">{productName}</strong> is confirmed and entered the fulfillment queue.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="max-w-md mx-auto bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 text-left space-y-3 font-mono text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Order</span>
            <span className="font-semibold text-white">#{orderId}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Payment ID</span>
            <span className="font-semibold text-amber-400">{paymentId}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Item</span>
            <span className="font-semibold text-slate-200">{productName}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Status</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              RECOVERED
            </span>
          </div>
        </div>

        {/* Action Buttons: Primary Track Order, Secondary Continue Shopping */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/order/${orderId}`}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
          </Link>

          <Link
            href="/admin"
            className="w-full sm:w-auto px-4 py-3.5 text-xs text-brand-electric hover:underline flex items-center justify-center space-x-1 font-mono"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Portal →</span>
          </Link>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Payment Verified • Transaction Ledger & Fulfillment Synchronized</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500 font-mono text-sm">
          Loading payment receipt...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
