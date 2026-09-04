"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  RefreshCw,
  PieChart as PieIcon,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatINRCompact } from "@/lib/utils";
import { useDemoData } from "@/context/DemoDataContext";

const COLORS = ["#0284c7", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

export default function AdminAnalyticsPage() {
  const { getAnalyticsData } = useDemoData();
  const [range, setRange] = useState<"7D" | "30D" | "90D">("30D");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function loadAnalytics() {
    setLoading(true);
    try {
      const json = getAnalyticsData(range);
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [range, getAnalyticsData]);

  const trendPoints = data?.trendPoints || [];
  const failureReasonDistribution = data?.failureReasonDistribution || [];
  const recoveryStrategyPerformance = data?.recoveryStrategyPerformance || [];
  const customerValueDistribution = data?.customerValueDistribution || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Revenue Recovery Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive multi-dimensional telemetry, conversion rates, and behavioral cohort distributions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time range switcher */}
          <div className="flex items-center space-x-1 p-1 bg-surface-100 border border-slate-800 rounded-xl">
            {(["7D", "30D", "90D"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  range === r
                    ? "bg-brand-accent text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="p-2 bg-surface-100 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-electric" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Recovery Trend */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue Recovery Trend</h3>
              <p className="text-xs text-slate-400">Recovered capital vs at-risk drop offs</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRecColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]}
                />
                <Area type="monotone" dataKey="recovered" name="Recovered" stroke="#10b981" strokeWidth={2} fill="url(#adminRecColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Drop-off Trend */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Failed Payment Volume vs Recovered Count</h3>
            <p className="text-xs text-slate-400">Total drop-offs vs agent successes</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                />
                <Bar dataKey="atRisk" name="At Risk (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered" name="Recovered (₹)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Recovery Rate Velocity */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recovery Rate Velocity (%)</h3>
            <p className="text-xs text-slate-400">Overall success percentage across intervals</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[40, 85]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v: number) => [`${v}%`, "Recovery Rate"]}
                />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Customer Value Cohort Distribution */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Customer Value Cohort Distribution</h3>
            <p className="text-xs text-slate-400">Seeded 500 customer breakdown by LTV tier</p>
          </div>

          <div className="space-y-3 pt-2">
            {customerValueDistribution.map((tier: any, idx: number) => (
              <div key={tier.tier} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-medium">{tier.tier}</span>
                  <span className="font-mono text-brand-electric font-semibold">
                    {tier.count} customers
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (tier.count / 500) * 100 * 2.5)}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 5: Failure Reason Breakdown */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Failure Reason Distribution</h3>
            <p className="text-xs text-slate-400">Primary gateway failure classifications</p>
          </div>

          <div className="space-y-2 text-xs">
            {failureReasonDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <span className="text-slate-300 font-medium">{item.name}</span>
                <span className="font-mono text-slate-400">
                  {item.value} occurrences
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 6: Recovery Strategy Performance */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Strategy Efficiency Index</h3>
            <p className="text-xs text-slate-400">Conversion efficiency across automated recovery channels</p>
          </div>

          <div className="space-y-2 text-xs">
            {recoveryStrategyPerformance.map((strat: any) => (
              <div key={strat.strategy} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div>
                  <span className="font-medium text-white block">{strat.strategy}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {strat.success} recovered • {strat.failed} dropped
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {strat.efficiency}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
