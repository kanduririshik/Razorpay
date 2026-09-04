"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Sparkles,
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Zap,
  ExternalLink,
  ChevronRight,
  Armchair,
  Check,
} from "lucide-react";
import {
  formatINR,
  formatDate,
  getPriorityBadge,
  getStatusBadge,
  getStrategyLabel,
  getFailureReasonClass,
} from "@/lib/utils";
import { useSimulation } from "@/context/SimulationContext";
import { useDemoData } from "@/context/DemoDataContext";
import { useRazorpaySync } from "@/hooks/useRazorpaySync";

export default function AdminPaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || "PAY98231";
  const paymentId = rawId.toUpperCase();

  const { openSimulation, isSimulating, metricsRevision } = useSimulation();
  const { getPaymentById, getOrder, initiateRecovery } = useDemoData();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoveryInitiated, setRecoveryInitiated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Auto-refresh when Razorpay payment is confirmed server-side
  useRazorpaySync({
    watchPaymentId: paymentId,
    onRecovered: (_pid, _amt) => {
      loadPayment(); // Reload payment data from LocalStorage
    },
  });

  function loadPayment() {
    setLoading(true);
    setError(null);
    try {
      const result = getPaymentById(paymentId);
      if (!result) throw new Error("Payment record not found");
      setData(result);
      setIsVerified(Boolean(result.payment.isVerified));

      // Check if recovery is already in progress
      if (
        result.payment.recoveryActions &&
        result.payment.recoveryActions.length > 0 &&
        result.payment.status !== "RECOVERED"
      ) {
        setRecoveryInitiated(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load payment details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayment();
  }, [paymentId, metricsRevision, getPaymentById]);

  const handleStartRecovery = () => {
    // Initiate recovery record in store
    initiateRecovery(paymentId);
    setRecoveryInitiated(true);
    // Run existing 6-stage simulation modal
    openSimulation(paymentId);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-electric mx-auto" />
        <p className="text-xs text-slate-400">Loading payment forensic telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Payment Record Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error}</p>
        <Link
          href="/admin/payments"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Payments</span>
        </Link>
      </div>
    );
  }

  const { payment, aiAnalysis } = data;
  const customer = data.customer || payment.customer;
  const order = getOrder(paymentId);

  const orderId = order?.orderId || "RA98231";
  const productName = order?.items[0]?.productName || "Modern 3-Seater Sofa";
  const isRecovered = payment.status === "RECOVERED";

  const priorityBadge = getPriorityBadge(aiAnalysis?.priority || "HIGH");
  const statusBadge = getStatusBadge(payment.status);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/payments"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments</span>
        </Link>

        {/* Top Direct Action */}
        <div className="flex items-center space-x-3">
          {isRecovered ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>RECOVERED &bull; {formatINR(payment.amount)}</span>
            </span>
          ) : recoveryInitiated ? (
            <Link
              href={`/recovery/${payment.paymentId}`}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5"
            >
              <span>Open Customer Recovery Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : !isVerified ? (
            <button
              onClick={() => {
                const { verifyPaymentIssue } = require("@/lib/data/store");
                verifyPaymentIssue(payment.paymentId);
                setIsVerified(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>Verify Payment Issue</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono rounded-xl flex items-center space-x-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Payment Issue Verified</span>
              </span>
              <button
                onClick={handleStartRecovery}
                disabled={isSimulating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-ai-600 hover:from-brand-accent/90 hover:to-ai-600/90 text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition-all flex items-center space-x-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>START RECOVERY</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Flagship Notice & State Status */}
      {recoveryInitiated && !isRecovered && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-amber-400">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>RECOVERY INITIATED &bull; WAITING FOR CUSTOMER</span>
            </div>
            <p className="text-sm font-semibold text-white">
              Customer: {customer?.name || "Rahul Sharma"} &bull; Amount: {formatINR(payment.amount)}
            </p>
            <p className="text-xs text-amber-200/80">
              Simulated recovery notification generated. Strategy: <strong className="text-white">SEND_PAYMENT_LINK</strong>.
            </p>
          </div>

          <Link
            href={`/recovery/${payment.paymentId}`}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all inline-flex items-center space-x-2 shrink-0"
          >
            <span>Proceed as Customer to Complete Payment</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {isRecovered && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>RECOVERY SUCCESSFUL &bull; LEDGER SYNCHRONIZED</span>
            </div>
            <p className="text-sm font-semibold text-white">
              Customer {customer?.name || "Rahul Sharma"} completed recovery payment of {formatINR(payment.amount)}.
            </p>
            <p className="text-xs text-slate-400">
              Order confirmed and shipping pipeline active.
            </p>
          </div>

          <Link
            href={`/order/${orderId}`}
            className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-semibold rounded-xl text-xs transition-colors shrink-0"
          >
            View Shipping Timeline &rarr;
          </Link>
        </div>
      )}

      {/* Exact Payment Overview Grid */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase block tracking-wider">
              Payment Identifier
            </span>
            <div className="flex items-center space-x-2.5 mt-0.5">
              <h1 className="text-2xl font-bold font-mono text-white">
                {payment.paymentId}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold font-mono ${statusBadge.bg}`}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[11px] font-mono text-slate-500 uppercase block tracking-wider">
              Amount
            </span>
            <span className="text-3xl font-bold text-amber-400 font-mono">
              {formatINR(payment.amount)}
            </span>
          </div>
        </div>

        {/* 6 Key Attributes Grid as required by prompt */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">CUSTOMER</span>
            <span className="font-semibold text-white block truncate">
              {customer?.name || "Rahul Sharma"}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">ORDER</span>
            <span className="font-semibold text-amber-300 block">
              #{orderId}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">PRODUCT</span>
            <span className="font-semibold text-slate-200 block truncate">
              {productName}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">PAYMENT METHOD</span>
            <span className="font-semibold text-white block">
              {payment.method}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">STATUS</span>
            <span className={`font-semibold block ${isRecovered ? "text-emerald-400" : "text-rose-400"}`}>
              {payment.status}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">FAILURE REASON</span>
            <span className="font-semibold text-rose-300 block uppercase truncate">
              {payment.failureReason || "PAYMENT FAILED"}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Customer Intelligence & AI Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* CUSTOMER INTELLIGENCE CARD */}
        <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                CUSTOMER INTELLIGENCE
              </h3>
              <p className="text-[10px] text-slate-400">
                Aggregated merchant relationship &amp; reliability index
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] block">
                Customer LTV
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {formatINR(customer?.lifetimeValue || 82450)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] block">
                Previous Payments
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {customer?.successfulPayments || 13} successful / {customer?.totalPayments || 14}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] block">
                Customer Value Tier
              </span>
              <span className="text-sm font-bold text-purple-300">
                HIGH (Merchant VIP)
              </span>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] block">
                Preferred Channel
              </span>
              <span className="text-sm font-bold text-slate-200">
                {customer?.preferredPaymentMethod || "UPI"} &bull; WhatsApp
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="text-slate-300 font-semibold block">Contact Details:</span>
            <p>Email: {customer?.email || "rahul.sharma@gmail.com"}</p>
            <p>Phone: {customer?.phone || "+91 98201 45892"}</p>
          </div>
        </div>

        {/* AI AGENT REASONING & RECOMMENDATION CARD */}
        <div className="p-6 rounded-2xl bg-surface-100 border border-brand-accent/40 shadow-xl shadow-brand-accent/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-brand-accent/20 text-brand-electric rounded-xl border border-brand-accent/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  RECOVERAI ANALYSIS
                </h3>
                <p className="text-[10px] text-slate-400">
                  Deterministic Heuristic &amp; Risk Diagnostic
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Recovery Probability
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                87%
              </span>
            </div>
          </div>

          {/* Reasoning Checklist */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2.5 text-slate-200 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Customer has strong payment history</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-200 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>13 of 14 previous payments successful (93% completion)</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-200 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>High customer lifetime value (₹82,450)</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-200 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Failure reason appears potentially temporary (&quot;Insufficient Funds&quot;)</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-200 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Recovery probability is high (87% confidence)</span>
            </div>
          </div>

          {/* RECOMMENDATION BOX */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-slate-400 uppercase tracking-wider text-[11px] block font-semibold">
              RECOMMENDATION
            </span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Recovery Probability:</span>
              <span className="text-emerald-400 font-bold">87%</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Priority Tier:</span>
              <span className="text-amber-400 font-bold">HIGH</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Recommended Strategy:</span>
              <span className="text-purple-300 font-bold">SEND_PAYMENT_LINK</span>
            </div>
          </div>

          {/* START RECOVERY BUTTON */}
          <div>
            {isRecovered ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-mono text-emerald-300">
                ✓ Revenue already recovered ({formatINR(payment.amount)})
              </div>
            ) : (
              <button
                onClick={handleStartRecovery}
                disabled={isSimulating}
                className="w-full py-3.5 bg-gradient-to-r from-brand-accent via-ai-600 to-emerald-500 hover:from-brand-accent/90 hover:to-emerald-400 text-white font-bold rounded-xl text-sm shadow-xl shadow-brand-accent/20 transition-all hover:scale-[1.01] flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>START RECOVERY (RUN 6-STAGE AGENT)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
