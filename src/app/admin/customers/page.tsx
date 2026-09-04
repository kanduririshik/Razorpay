"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Award,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { formatINR, formatINRCompact } from "@/lib/utils";
import { useSimulation } from "@/context/SimulationContext";
import { useDemoData } from "@/context/DemoDataContext";

export default function AdminCustomersPage() {
  const { metricsRevision } = useSimulation();
  const { getCustomers } = useDemoData();

  const [customers, setCustomers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function loadCustomers() {
    setLoading(true);
    try {
      const data = getCustomers({
        page,
        limit: 15,
        search,
        risk,
      });
      setCustomers(data.customers || []);
      setMetrics(data.metrics || null);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [search, risk, page, metricsRevision, getCustomers]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lifetime value analysis, payment history, and churn risk intelligence.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Customers</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {metrics.totalCustomers.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">Active merchant patrons</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>VIP Tier (₹40k+ LTV)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {metrics.highValueCount}
            </div>
            <span className="text-[11px] text-amber-400 font-medium">Flagship Tier: Rahul Sharma</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Customers At Risk</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {metrics.atRiskCount}
            </div>
            <span className="text-[11px] text-rose-400">Has recent drop-offs</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>At-Risk Revenue</span>
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatINRCompact(metrics.atRiskRevenue)}
            </div>
            <span className="text-[11px] text-purple-400">Target for RecoverAI</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, email or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={risk}
            onChange={(e) => {
              setRisk(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-accent font-mono w-full sm:w-auto"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Lifetime Value (LTV)</th>
                <th className="py-3 px-4">Total Payments</th>
                <th className="py-3 px-4">Success History</th>
                <th className="py-3 px-4">Failed</th>
                <th className="py-3 px-4">Preferred Method</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-brand-electric mb-2" />
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No customers found matching criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isRahul = c.name.includes("Rahul Sharma");

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isRahul ? "bg-amber-500/5 border-l-2 border-amber-400" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center space-x-1.5">
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="hover:text-brand-electric transition-colors"
                          >
                            {c.name}
                          </Link>
                          {isRahul && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                              FLAGSHIP VIP ₹82.4K
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{c.email}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatINR(c.lifetimeValue)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {c.totalPayments}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2 font-mono text-emerald-400 font-semibold">
                          <span>{c.successfulPayments} / {c.totalPayments}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={
                            c.failedPayments > 0 ? "text-rose-400 font-bold" : "text-slate-500"
                          }
                        >
                          {c.failedPayments}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {c.preferredPaymentMethod}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                            c.riskTier === "HIGH"
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : c.riskTier === "MEDIUM"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {c.riskTier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span className="font-mono text-white">{page}</span> of{" "}
            <span className="font-mono text-white">{totalPages}</span> (500 total customers)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
