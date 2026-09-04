"use client";

import React from "react";
import { formatINRCompact, formatPercent } from "@/lib/utils";
import {
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Percent,
  XCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { DashboardMetrics } from "@/lib/types";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export default function KpiCards({ metrics }: KpiCardsProps) {
  const cards = [
    {
      label: "Total Revenue",
      value: formatINRCompact(metrics.totalRevenue),
      subtext: "1,500 total transactions",
      trend: "+12.4%",
      trendPositive: true,
      icon: TrendingUp,
      color: "from-blue-500/20 to-indigo-500/5",
      borderColor: "border-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Revenue at Risk",
      value: formatINRCompact(metrics.revenueAtRisk),
      subtext: `${metrics.failedPayments} failed payments`,
      trend: "Immediate Action",
      trendPositive: false,
      icon: AlertTriangle,
      color: "from-rose-500/20 to-amber-500/5",
      borderColor: "border-rose-500/30",
      iconColor: "text-rose-400",
      highlight: true,
    },
    {
      label: "Revenue Recovered",
      value: formatINRCompact(metrics.revenueRecovered),
      subtext: `${metrics.successfulRecoveries} payments recovered`,
      trend: "+₹8.9K today",
      trendPositive: true,
      icon: RotateCcw,
      color: "from-emerald-500/20 to-teal-500/5",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      highlightSuccess: true,
    },
    {
      label: "Recovery Rate",
      value: formatPercent(metrics.recoveryRate),
      subtext: `${metrics.successfulRecoveries} of ${metrics.recoveryAttempts} attempts`,
      trend: "+4.1% vs avg",
      trendPositive: true,
      icon: Percent,
      color: "from-purple-500/20 to-violet-500/5",
      borderColor: "border-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      label: "Failed Payments",
      value: metrics.failedPayments.toString(),
      subtext: "Awaiting AI action",
      trend: "238 baseline",
      trendPositive: false,
      icon: XCircle,
      color: "from-amber-500/20 to-orange-500/5",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`relative p-4 rounded-2xl bg-surface-100 border ${c.borderColor} shadow-sm overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg ${
              c.highlight ? "shadow-rose-900/10" : ""
            } ${c.highlightSuccess ? "shadow-emerald-900/10" : ""}`}
          >
            {/* Ambient subtle gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${c.color} pointer-events-none opacity-60`}
            />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {c.label}
                </span>
                <div
                  className={`p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 ${c.iconColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
                  {c.value}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-800/60">
                <span className="text-slate-400 truncate">{c.subtext}</span>
                <span
                  className={`font-medium ml-1 flex items-center shrink-0 ${
                    c.trendPositive ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {c.trendPositive && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                  {c.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
