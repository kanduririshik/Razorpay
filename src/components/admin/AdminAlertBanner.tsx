"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";

export default function AdminAlertBanner() {
  const router = useRouter();
  const { getPaymentById, getOrder } = useDemoData();

  const paymentData = getPaymentById("PAY98231");
  const payment = paymentData?.payment;

  if (!payment) return null;

  const isRecovered = payment.status === "RECOVERED";
  const hasPendingRecoveryAction =
    payment.recoveryActions &&
    payment.recoveryActions.length > 0 &&
    !isRecovered;

  if (isRecovered) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  🟢 PAYMENT RECOVERED
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SUCCESSFUL
                </span>
              </div>

              <h2 className="text-base font-semibold text-white mt-1">
                Rahul Sharma &bull; {formatINR(payment.amount)} recovered
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5 font-mono">
                <span>Payment ID: <strong className="text-white">PAY98231</strong></span>
                <span>&bull;</span>
                <span>Strategy: <strong className="text-purple-300">SEND_PAYMENT_LINK</strong></span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-semibold">
                  Revenue Recovered Updated: ₹87,400 &rarr; ₹1,20,399
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/admin/payments/PAY98231"
              className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
            >
              <span>View Forensics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If recovery action initiated and waiting for customer completion
  if (hasPendingRecoveryAction) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-xl shadow-amber-950/30 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  🟡 RECOVERY INITIATED — WAITING FOR CUSTOMER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NOTIFICATION SENT
                </span>
              </div>

              <h2 className="text-base font-semibold text-white mt-1">
                Customer: Rahul Sharma &bull; Amount: {formatINR(payment.amount)}
              </h2>

              <p className="text-xs text-amber-200/90 mt-1">
                Simulated recovery notification generated. Strategy: <strong className="text-white">SEND_PAYMENT_LINK</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/recovery/PAY98231"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5"
            >
              <span>Open Customer Recovery Page →</span>
            </Link>
            <Link
              href="/admin/payments/PAY98231"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default: NEW PAYMENT ISSUE (Unresolved Failed State)
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-rose-950/50 border border-red-500/50 shadow-xl shadow-red-950/40 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                🔴 NEW PAYMENT ISSUE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 font-semibold">
                HIGH PRIORITY
              </span>
            </div>

            <h2 className="text-base font-bold text-white mt-1">
              Rahul Sharma&apos;s payment failed.
            </h2>

            <div className="flex flex-wrap items-center gap-2.5 text-xs mt-2 font-mono">
              <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-amber-300 font-bold">
                {formatINR(payment.amount)}
              </span>
              <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                Method: {payment.method}
              </span>
              <span className="px-2 py-0.5 bg-red-500/20 rounded border border-red-500/30 text-red-300">
                {payment.failureReason}
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-emerald-400 font-semibold">
                Recovery Probability: 87%
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-purple-300 font-semibold">
                Priority: HIGH
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/admin/payments/PAY98231"
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Review Payment →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
