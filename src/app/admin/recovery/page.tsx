"use client";

import React, { useEffect, useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Percent,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Zap,
} from "lucide-react";
import {
  formatINR,
  formatINRCompact,
  formatPercent,
  formatDate,
  getPriorityBadge,
  getStatusBadge,
  getStrategyLabel,
} from "@/lib/utils";
import { useSimulation } from "@/context/SimulationContext";
import { useDemoData } from "@/context/DemoDataContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = ["#0284c7", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];

export default function AdminRecoveryPage() {
  const { openSimulation, isSimulating, metricsRevision } = useSimulation();
  const { getRecoveryData } = useDemoData();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [strategyFilter, setStrategyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  function loadRecoveryData() {
    setLoading(true);
    try {
      const json = getRecoveryData({
        page,
        limit: 15,
        strategy: strategyFilter,
        status: statusFilter,
      });
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecoveryData();
  }, [strategyFilter, statusFilter, page, metricsRevision, getRecoveryData]);

  const metrics = data?.metrics || {
    revenueAtRisk: 145200,
    recoveryAttempts: 194,
    successfulRecoveries: 117,
    revenueRecovered: 87400,
    recoveryRate: 0.602,
  };

  const yieldData = data?.recoveryYieldByStrategy || [];
  const successRates = data?.strategySuccessRate || [];
  const actions = data?.actions || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Revenue Recovery Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous intervention outcomes, strategy efficiency, and recovered capital ledger.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadRecoveryData()}
            disabled={loading}
            className="p-2 bg-surface-100 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-electric" : ""}`} />
          </button>

          <button
            onClick={() => openSimulation("PAY98231")}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>RUN SIMULATION (₹32,999)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-surface-100 border border-emerald-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Revenue Recovered</span>
            <RotateCcw className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatINR(metrics.revenueRecovered)}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Synced with Ledger</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-100 border border-rose-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Revenue at Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatINR(metrics.revenueAtRisk)}
          </div>
          <span className="text-[11px] text-slate-400">Active drop-offs</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-100 border border-purple-500/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recovery Rate</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatPercent(metrics.recoveryRate)}
          </div>
          <span className="text-[11px] text-purple-400">Heuristic Benchmark</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-100 border border-blue-500/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recovery Attempts</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics.recoveryAttempts}
          </div>
          <span className="text-[11px] text-slate-400">Total actions dispatched</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-100 border border-teal-500/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Successful Recoveries</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics.successfulRecoveries}
          </div>
          <span className="text-[11px] text-teal-400">Completed conversions</span>
        </div>
      </div>

      {/* Strategy Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recovery Yield by Strategy
              </h3>
              <p className="text-xs text-slate-400">Total capital recovered per strategy</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="strategy"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(s: string) => s.split(" ")[0]}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => formatINRCompact(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Recovered"]}
                />
                <Bar dataKey="recovered" radius={[6, 6, 0, 0]}>
                  {yieldData.map((_: any, index: number) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Strategy Success Conversion Rate
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous agent conversion percentage by action type
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {successRates.map((item: any) => (
              <div key={item.strategy} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-medium">{item.strategy}</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {item.rate}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-brand-accent to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, item.rate)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery Actions Table */}
      <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden shadow-sm space-y-4">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Recovery Actions Ledger</h3>
            <p className="text-xs text-slate-400">
              Audit trail of autonomous recovery dispatches and confirmations
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={strategyFilter}
              onChange={(e) => {
                setStrategyFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-accent font-mono"
            >
              <option value="ALL">All Strategies</option>
              <option value="SEND_PAYMENT_LINK">Payment Link</option>
              <option value="RETRY_PAYMENT">Smart Retry</option>
              <option value="SUGGEST_ALTERNATIVE_METHOD">Alternative Method</option>
              <option value="SEND_PERSONALIZED_REMINDER">Personalized Reminder</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-accent font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECOVERED">Recovered</option>
              <option value="EXECUTED">Executed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Strategy</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Actual Recovered</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading recovery actions...
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No recovery actions match selected filters.
                  </td>
                </tr>
              ) : (
                actions.map((act: any) => {
                  const priorityBadge = getPriorityBadge(act.priority);
                  const statusBadge = getStatusBadge(act.status);

                  return (
                    <tr key={act.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-brand-electric">
                        {act.payment?.paymentId || act.paymentId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{act.customer?.name}</div>
                        <span className="text-[11px] text-slate-400">{act.customer?.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-mono">
                          {getStrategyLabel(act.strategy)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${priorityBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
                          <span>{priorityBadge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {formatINR(act.expectedRecovery)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {act.actualRecovery ? formatINR(act.actualRecovery) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge.bg}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {formatDate(act.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data?.pagination && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Page <span className="text-white font-mono">{data.pagination.page}</span> of{" "}
              <span className="text-white font-mono">{data.pagination.totalPages}</span>
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
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
