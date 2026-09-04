"use client";

import React, { useState, useEffect } from "react";
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
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { formatINRCompact } from "@/lib/utils";

interface RevenueChartsProps {
  initialRange?: "7D" | "30D" | "90D";
}

const COLORS = ["#0284c7", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

export default function RevenueCharts({ initialRange = "30D" }: RevenueChartsProps) {
  const [range, setRange] = useState<"7D" | "30D" | "90D">(initialRange);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        const data = await res.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [range]);

  const trendData = analyticsData?.trendPoints || [];
  const reasonData = analyticsData?.failureReasonDistribution || [];
  const strategyData = analyticsData?.recoveryStrategyPerformance || [];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Recovery Intelligence &amp; Performance</h3>
          <p className="text-xs text-slate-400">
            Real-time multi-dimensional revenue recovery telemetry
          </p>
        </div>

        {/* 7D, 30D, 90D Filter Buttons */}
        <div className="flex items-center space-x-1 p-1 bg-surface-100 border border-slate-800 rounded-xl self-start sm:self-auto">
          {(["7D", "30D", "90D"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue at Risk vs Revenue Recovered */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Revenue at Risk vs Recovered</h4>
              <p className="text-xs text-slate-400">Comparison across selected interval</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>At Risk</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Recovered</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading telemetry...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
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
                    formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenueAtRisk"
                    name="Revenue at Risk"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenueRecovered"
                    name="Revenue Recovered"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRec)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Recovery Rate Trend */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Recovery Rate Velocity</h4>
              <p className="text-xs text-slate-400">Autonomous agent success percentage</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
              Target: 60.2%
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading velocity...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[40, 90]}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(val: number) => [`${val}%`, "Recovery Rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="recoveryRate"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#a855f7" }}
                    activeDot={{ r: 6, fill: "#c084fc" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Failed Payments by Reason */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Failed Payments by Reason</h4>
            <p className="text-xs text-slate-400">Root cause telemetry distribution</p>
          </div>

          <div className="h-64 w-full flex items-center">
            {loading ? (
              <div className="w-full text-center text-xs text-slate-500">Loading breakdown...</div>
            ) : (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 items-center">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reasonData}
                        dataKey="count"
                        nameKey="reason"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {reasonData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="space-y-1.5 pl-2 text-xs">
                  {reasonData.slice(0, 6).map((item: any, idx: number) => (
                    <div key={item.reason} className="flex items-center justify-between pr-4">
                      <span className="flex items-center space-x-2 text-slate-300 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="truncate">{item.reason}</span>
                      </span>
                      <span className="font-mono text-slate-400 font-medium ml-2">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Recovery Strategy Distribution */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Recovery Strategy Performance</h4>
            <p className="text-xs text-slate-400">Success rate by autonomous strategy</p>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading strategies...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="strategy"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(str: string) => str.split(" ")[0]}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(val: number, name: string) => [
                      name === "successRate" ? `${val}%` : val,
                      name === "successRate" ? "Success Rate" : name,
                    ]}
                  />
                  <Bar dataKey="successRate" radius={[6, 6, 0, 0]}>
                    {strategyData.map((_: any, index: number) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
