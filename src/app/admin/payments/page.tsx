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
  Zap,
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

export default function AdminPaymentsPage() {
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
  }, [page, search, method, failureReason, priority, status, metricsRevision, getPayments]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Payments Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction forensics, transience classification, and AI recovery status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => openSimulation("PAY98231")}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-r from-brand-accent to-ai-600 hover:from-brand-accent/90 hover:to-ai-600/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-accent/20 transition-all flex items-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SIMULATE RECOVERY</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Payment ID, Customer name, or Email (e.g. Rahul Sharma, PAY98231)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-accent font-mono"
            >
              <option value="ALL">Status: All</option>
              <option value="FAILED">Status: Failed (At Risk)</option>
              <option value="RECOVERED">Status: Recovered</option>
              <option value="SUCCESS">Status: Successful</option>
            </select>

            {/* Method Filter */}
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-accent font-mono"
            >
              <option value="ALL">Method: All</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Failure Reason */}
            <select
              value={failureReason}
              onChange={(e) => {
                setFailureReason(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-accent font-mono"
            >
              <option value="ALL">Failure Reason: All</option>
              {FAILURE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-accent font-mono"
            >
              <option value="ALL">Priority: All</option>
              <option value="CRITICAL">Priority: Critical</option>
              <option value="HIGH">Priority: High</option>
              <option value="MEDIUM">Priority: Medium</option>
              <option value="LOW">Priority: Low</option>
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
                  const isRahul = p.customer?.name?.includes("Rahul Sharma") || p.paymentId === "PAY98231";
                  const priorityBadge = getPriorityBadge(p.priority || "HIGH");
                  const statusBadge = getStatusBadge(p.status);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isRahul
                          ? "bg-amber-500/5 border-l-2 border-amber-400"
                          : ""
                      }`}
                    >
                      {/* Payment ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        <Link
                          href={`/admin/payments/${p.paymentId}`}
                          className="hover:text-brand-electric transition-colors"
                        >
                          {p.paymentId}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center space-x-1.5">
                          <span>{p.customer?.name || "Customer"}</span>
                          {isRahul && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] border border-amber-500/40">
                              FLAGSHIP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {p.customer?.email}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {formatINR(p.amount)}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {p.method}
                      </td>

                      {/* Failure Reason */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[11px] font-medium ${getFailureReasonClass(
                            p.failureReason
                          )}`}
                        >
                          {p.failureReason || "N/A"}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityBadge.bg}`}
                        >
                          {priorityBadge.label}
                        </span>
                      </td>

                      {/* Recovery Probability */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-semibold">
                            {Math.round((p.recoveryProbability || 0.75) * 100)}%
                          </span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-emerald-400 h-full rounded-full"
                              style={{
                                width: `${Math.round(
                                  (p.recoveryProbability || 0.75) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* AI Recommendation */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-purple-300">
                        {getStrategyLabel(p.strategy || "SEND_PAYMENT_LINK")}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge.bg}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {p.status === "FAILED" && (
                            <button
                              onClick={() => openSimulation(p.paymentId)}
                              disabled={isSimulating}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 transition-colors"
                              title="Run AI Recovery"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            href={`/admin/payments/${p.paymentId}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="View Forensics"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-surface-50/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing{" "}
            <span className="font-mono text-slate-200">
              {Math.min(1, totalCount)} - {Math.min(page * 15, totalCount)}
            </span>{" "}
            of <span className="font-mono text-slate-200">{totalCount}</span>{" "}
            records
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
