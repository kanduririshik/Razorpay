"use client";

import React, { useEffect, useState } from "react";
import KpiCards from "@/components/dashboard/KpiCards";
import AiInsightCard from "@/components/dashboard/AiInsightCard";
import RevenueCharts from "@/components/dashboard/RevenueCharts";
import OpportunitiesTable from "@/components/dashboard/OpportunitiesTable";
import AdminAlertBanner from "@/components/admin/AdminAlertBanner";
import { useSimulation } from "@/context/SimulationContext";
import { useDemoData } from "@/context/DemoDataContext";
import { Sparkles, RefreshCw, Zap, Armchair, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { metricsRevision, openSimulation, isSimulating } = useSimulation();
  const { getDashboardData } = useDemoData();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const data = getDashboardData();
      setDashboardData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [metricsRevision, getDashboardData]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Good morning, Alex
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            RecoverAI Autonomous Revenue Recovery Command Center &bull; Razorpay AI Builder &apos;26
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold rounded-xl text-xs transition-colors"
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>View Furniture Store</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </Link>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="p-2 bg-surface-100 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-electric" : ""}`} />
          </button>

          <button
            onClick={() => openSimulation("PAY98231")}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-r from-brand-accent to-ai-600 hover:from-brand-accent/90 hover:to-ai-600/90 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-accent/20 transition-all flex items-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>RUN RECOVERY SIMULATION</span>
          </button>
        </div>
      </div>

      {/* LIVE ADMIN PAYMENT ISSUE ALERT BANNER */}
      <AdminAlertBanner />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadDashboard}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && !dashboardData ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
            ))}
          </div>
          <div className="h-36 rounded-2xl bg-slate-900 border border-slate-800" />
          <div className="h-72 rounded-2xl bg-slate-900 border border-slate-800" />
        </div>
      ) : dashboardData ? (
        <>
          {/* Real-time KPI Metric Cards */}
          <KpiCards metrics={dashboardData.metrics} />

          {/* AI Autonomous Intelligence Highlight */}
          <AiInsightCard
            revenueAtRisk={dashboardData.metrics.revenueAtRisk}
            failedPayments={dashboardData.metrics.failedPayments}
          />

          {/* Top Opportunities Table */}
          <OpportunitiesTable
            opportunities={dashboardData.topOpportunities}
          />

          {/* Charts & Analytics Visuals */}
          <RevenueCharts initialRange="30D" />
        </>
      ) : null}
    </div>
  );
}
