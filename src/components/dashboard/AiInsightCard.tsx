"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { formatINRCompact } from "@/lib/utils";
import Link from "next/link";

interface AiInsightCardProps {
  revenueAtRisk: number;
  failedPayments: number;
  opportunitiesCount?: number;
}

export default function AiInsightCard({
  revenueAtRisk,
  failedPayments,
  opportunitiesCount = 117,
}: AiInsightCardProps) {
  const { openSimulation, isSimulating } = useSimulation();

  return (
    <div className="relative rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-ai-500/30 shadow-xl glow-ai overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-ai-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-brand-accent/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-ai-500/20 border border-ai-500/40 text-ai-glow text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-400" />
            <span>AI INSIGHT &amp; REVENUE INTELLIGENCE</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {formatINRCompact(revenueAtRisk)} of revenue is currently at risk across{" "}
            <span className="text-amber-400 font-mono">{failedPayments}</span> failed
            payments.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            RecoverAI identified{" "}
            <span className="text-emerald-400 font-semibold font-mono">
              {opportunitiesCount} high-probability
            </span>{" "}
            recovery opportunities based on customer lifetime value, transience scoring,
            and optimal multi-channel outreach routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/payments"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:scale-[1.02] flex items-center space-x-2 shadow-sm"
          >
            <span>VIEW OPPORTUNITIES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => openSimulation("PAY98231")}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-ai-600 via-indigo-600 to-brand-accent hover:from-ai-500 hover:to-brand-accent/90 text-white text-xs font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/25 flex items-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSimulating ? "RUNNING AGENT..." : "AUTONOMOUS RECOVER NOW"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
