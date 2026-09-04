"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  XCircle,
  RotateCcw,
  ShoppingBag,
  Eye,
  ShieldAlert,
} from "lucide-react";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") || "PAY98231";
  const orderId = searchParams.get("orderId") || "RA98231";
  const queryReason = searchParams.get("reason");

  const { getOrder, getPaymentById } = useDemoData();
  const order = getOrder(orderId);
  const paymentQuery = getPaymentById(paymentId);

  const amount = order?.totalAmount || paymentQuery?.payment.amount || 32999;
  const failureReason =
    queryReason ||
    order?.failureReason ||
    paymentQuery?.payment.failureReason ||
    "Payment was declined by the bank";
  const method = order?.paymentMethod || paymentQuery?.payment.method || "UPI";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
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
            Slander&apos;s Furniture Store
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Payment could not be completed
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed pt-1">
            Your transaction was declined by the bank gateway. Your furniture reservation is still on hold.
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
            <span className="text-slate-500">Original Amount</span>
            <span className="font-bold text-white text-sm">{formatINR(amount)}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Actual Test Transaction</span>
            <span className="font-semibold text-blue-300">₹1,000</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Status</span>
            <span className="font-semibold text-red-400">Payment Failed</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Failure Reason</span>
            <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-semibold border border-red-500/30 text-right max-w-[200px] truncate" title={failureReason}>
              {failureReason}
            </span>
          </div>
        </div>

        {/* Action Buttons: Try Again, View Order */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/checkout"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>

          <Link
            href={`/order/${orderId}`}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>View Order</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
