"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  CreditCard,
  RotateCcw,
  Clock,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { formatINR, formatDate, getStatusBadge, getStrategyLabel } from "@/lib/utils";
import { useDemoData } from "@/context/DemoDataContext";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  const { getCustomerById } = useDemoData();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadCustomer() {
    setLoading(true);
    try {
      const json = getCustomerById(customerId);
      if (!json) throw new Error("Customer not found");
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load customer profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomer();
  }, [customerId, getCustomerById]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-electric mx-auto" />
        <p className="text-xs text-slate-400">Loading customer telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Customer Not Found</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <Link
          href="/admin/customers"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  const { customer, payments, recoveryActions } = data.customer ? data : { customer: data, payments: [], recoveryActions: [] };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Back Nav */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-accent to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {customer.name?.charAt(0) || "C"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {customer.name}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                  customer.riskTier === "HIGH"
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : customer.riskTier === "MEDIUM"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {customer.riskTier} RISK
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center space-x-3">
              <span>{customer.email}</span>
              <span>&bull;</span>
              <span>{customer.phone}</span>
            </div>
          </div>
        </div>

        {/* High-level stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Lifetime Value
            </span>
            <span className="text-base font-bold text-white font-mono">
              {formatINR(customer.lifetimeValue)}
            </span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Success Ratio
            </span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {customer.successfulPayments} / {customer.totalPayments}
            </span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Total Transactions
            </span>
            <span className="text-base font-bold text-slate-200 font-mono">
              {customer.totalPayments}
            </span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Preferred Method
            </span>
            <span className="text-sm font-semibold text-brand-electric">
              {customer.preferredPaymentMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Payment History & Recovery Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments History */}
        <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Payment Transaction History</h3>
            <span className="text-xs text-slate-400 font-mono">
              {payments?.length || 0} Records
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
            {(payments || []).map((p: any) => {
              const statusBadge = getStatusBadge(p.status);
              return (
                <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/payments/${p.paymentId}`}
                        className="font-mono text-xs font-semibold text-brand-electric hover:underline"
                      >
                        {p.paymentId}
                      </Link>
                      <span className="text-xs text-slate-400">&bull; {p.method}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {formatDate(p.createdAt)}
                      {p.failureReason && ` &bull; Failure: ${p.failureReason}`}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-mono font-bold text-white text-xs">
                      {formatINR(p.amount)}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery Actions Ledger */}
        <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Autonomous Recovery Interventions</h3>
            <span className="text-xs text-slate-400 font-mono">
              {recoveryActions?.length || 0} Actions
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
            {(!recoveryActions || recoveryActions.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No autonomous recovery actions dispatched for this customer yet.
              </div>
            ) : (
              recoveryActions.map((r: any) => {
                const statusBadge = getStatusBadge(r.status);
                return (
                  <div key={r.id} className="p-3.5 space-y-1.5 hover:bg-slate-800/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {getStrategyLabel(r.strategy)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{r.aiReason}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                      <span>Expected: {formatINR(r.expectedRecovery)}</span>
                      {r.actualRecovery && (
                        <span className="text-emerald-400 font-bold">
                          Recovered: {formatINR(r.actualRecovery)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
