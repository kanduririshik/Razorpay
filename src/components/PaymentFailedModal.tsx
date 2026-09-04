"use client";

import React from "react";
import Link from "next/link";
import { XCircle, RotateCcw, ShieldAlert, ArrowRight, ExternalLink, X } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface PaymentFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  paymentId: string;
  amount: number;
  testAmount?: number;
  failureReason: string;
  onRetry?: () => void;
}

export default function PaymentFailedModal({
  isOpen,
  onClose,
  orderId,
  paymentId,
  amount,
  testAmount = 1000,
  failureReason,
  onRetry,
}: PaymentFailedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 space-y-6 animate-scale-up overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
            <XCircle className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
              Slander&apos;s Furniture Store
            </span>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight mt-0.5">
              Payment Failed
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Your transaction could not be processed by Razorpay gateway.
            </p>
          </div>
        </div>

        {/* Failure Reason Callout */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-1.5 text-left">
          <div className="flex items-center space-x-2 text-red-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>GATEWAY DECLINE REASON</span>
          </div>
          <p className="text-sm font-semibold text-red-200 pl-6">
            {failureReason || "Payment was declined by the bank"}
          </p>
        </div>

        {/* Transaction Summary Grid */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">Order Reference</span>
            <span className="font-semibold text-white">#{orderId}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">Payment ID</span>
            <span className="font-semibold text-amber-400">{paymentId}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">Order Amount</span>
            <span className="font-bold text-white">{formatINR(amount)}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">Razorpay Test Cap</span>
            <span className="font-semibold text-blue-300">₹{testAmount.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="text-slate-500">Gateway Status</span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 text-[11px]">
              FAILED
            </span>
          </div>
        </div>

        {/* Notice for Demo Evaluator */}
        <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
          <span className="text-amber-400 font-medium">Autonomous Recovery:</span> This failed payment is recorded in RecoverAI. You can view the telemetry and trigger the AI recovery link from the Merchant Admin.
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {onRetry ? (
              <button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            ) : (
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </Link>
            )}

            <Link
              href={`/admin/payments/${paymentId}`}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <span>RecoverAI Admin</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors text-center"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
