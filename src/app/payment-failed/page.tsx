"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  ShieldCheck,
  Clock,
  ExternalLink,
} from "lucide-react";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") || "PAY98231";
  const orderId = searchParams.get("orderId") || "RA98231";

  const { getOrder, getPaymentById } = useDemoData();
  const order = getOrder(orderId);
  const paymentQuery = getPaymentById(paymentId);

  const amount = order?.totalAmount || paymentQuery?.payment.amount || 32999;
  const failureReason =
    order?.failureReason || paymentQuery?.payment.failureReason || "Insufficient Funds";
  const method = order?.paymentMethod || paymentQuery?.payment.method || "UPI";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Failure Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Failure Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/10 animate-fade-in">
          <XCircle className="w-11 h-11" />
        </div>

        {/* Title & Subtext */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">
            Payment Failed
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            {formatINR(amount)}
          </h1>
          <p className="text-sm font-semibold text-amber-300">
            {order?.items[0]?.productName || "Modern 3-Seater Sofa"}
          </p>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
            Your payment could not be completed. We&apos;ve notified the merchant so they can help recover your payment.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="max-w-md mx-auto bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 text-left space-y-3 font-mono text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Order ID</span>
            <span className="font-semibold text-white">#{orderId}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Payment ID</span>
            <span className="font-semibold text-amber-400">{paymentId}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Amount</span>
            <span className="font-bold text-white text-sm">{formatINR(amount)}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Payment Method</span>
            <span className="text-slate-300 font-semibold">{method}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Reason</span>
            <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
              {failureReason}
            </span>
          </div>
        </div>

        {/* Merchant Notification Verified Badge */}
        <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center space-x-2 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Merchant has been notified ✓</span>
        </div>

        {/* Action Buttons: Primary Continue Shopping, Secondary View Payment Details */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/admin/payments/${paymentId}`}
            className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-brand-electric" />
            <span>View Payment Details</span>
          </Link>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1 font-mono">
          <span>Order state preserved • Recovery assistance queued</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500 font-mono text-sm">
          Loading payment failure receipt...
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
