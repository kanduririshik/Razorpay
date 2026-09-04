"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Play,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  formatINR,
  getPriorityBadge,
  getStatusBadge,
  getStrategyLabel,
  getFailureReasonClass,
} from "@/lib/utils";
import { useSimulation } from "@/context/SimulationContext";
import { useDemoData } from "@/context/DemoDataContext";
import { PAYMENT_METHODS, FAILURE_REASONS } from "@/mock-data/indianNames";

export default function PaymentsPage() {
  const { openSimulation, isSimulating, metricsRevision } = useSimulation();
  const { getPayments } = useDemoData();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("ALL");
  const [failureReason, setFailureReason] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [status, setStatus] = useState("FAILED");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  function loadPayments() {
    setLoading(true);
    try {
      const data = getPayments({
        page,
        limit: 15,
        search,
        status,
        method,
        failureReason,
        priority,
      });
      setPayments(data.payments || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, [search, method, failureReason, priority, status, page, metricsRevision, getPayments]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Failed Payments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold">
              {totalCount} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and algorithmic recovery prioritization for payment drop-offs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadPayments()}
            disabled={loading}
            className="p-2 bg-surface-100 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh payment table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-electric" : ""}`} />
          </button>

          <button
            onClick={() => openSimulation("PAY98231")}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-r from-brand-accent to-ai-600 hover:from-brand-accent/90 hover:to-ai-600/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-accent/20 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RECOVER RAHUL SHARMA (₹8,999)</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID or customer..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="FAILED">Status: FAILED (At Risk)</option>
              <option value="RECOVERED">Status: RECOVERED</option>
              <option value="SUCCESS">Status: SUCCESS</option>
              <option value="ALL">Status: ALL</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="ALL">All Payment Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Failure Reason Filter */}
          <div>
            <select
              value={failureReason}
              onChange={(e) => {
                setFailureReason(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="ALL">All Failure Reasons</option>
              {FAILURE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Failure Reason</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Recovery Prob.</th>
                <th className="py-3 px-4">AI Recommendation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-brand-electric mb-2" />
                    Fetching payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No matching payments found for current filters.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isRahul = p.customer?.name?.includes("Rahul Sharma");
                  const priorityBadge = getPriorityBadge(p.aiAnalysis?.priority);
                  const statusBadge = getStatusBadge(p.status);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isRahul
                          ? "bg-brand-accent/5 border-l-2 border-brand-accent"
                          : ""
                      }`}
                    >
                      {/* Payment ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        <Link
                          href={`/payments/${p.id}`}
                          className="hover:text-brand-electric transition-colors"
                        >
                          {p.paymentId}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center space-x-1.5">
                          <span>{p.customer?.name}</span>
                          {isRahul && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-brand-accent/20 text-brand-electric">
                              HIGH PRIORITY
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {p.customer?.email}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatINR(p.amount)}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {p.method}
                      </td>

                      {/* Failure Reason */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-medium ${getFailureReasonClass(
                            p.failureReason
                          )}`}
                        >
                          {p.failureReason || "N/A"}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${priorityBadge.bg}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`}
                          />
                          <span>{priorityBadge.label}</span>
                        </span>
                      </td>

                      {/* Recovery Probability */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-200">
                            {Math.round(
                              (p.aiAnalysis?.recoveryProbability || 0) * 100
                            )}
                            %
                          </span>
                        </div>
                      </td>

                      {/* AI Recommendation */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                          {getStrategyLabel(p.aiAnalysis?.strategy)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge.bg}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/payments/${p.id}`}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          Details
                        </Link>

                        {p.status === "FAILED" && (
                          <button
                            onClick={() => openSimulation(p.id)}
                            disabled={isSimulating}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors inline-flex items-center space-x-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Simulate</span>
                          </button>
                        )}
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
            Showing page <span className="font-mono text-white">{page}</span> of{" "}
            <span className="font-mono text-white">{totalPages}</span> ({totalCount} total)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
