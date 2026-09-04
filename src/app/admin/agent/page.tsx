"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Zap,
  PauseCircle,
  PlayCircle,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Cpu,
  Layers,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR, formatDate } from "@/lib/utils";

export default function AdminAgentCommandCenter() {
  const { openSimulation, isSimulating, metricsRevision } = useSimulation();
  const { getAgentEvents, getPayments } = useDemoData();

  const [agentActive, setAgentActive] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [failedPayments, setFailedPayments] = useState<any[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("PAY98231");
  const [loading, setLoading] = useState(true);

  function loadAgentData() {
    setLoading(true);
    try {
      const eventsData = getAgentEvents(25);
      const paymentsData = getPayments({ status: "FAILED", limit: 10 });
      setEvents(eventsData || []);
      setFailedPayments(paymentsData.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgentData();
  }, [metricsRevision, getAgentEvents, getPayments]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ai-500 to-brand-accent flex items-center justify-center text-white shadow-xl shadow-ai-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  RecoverAI Agent Command Center
                </h1>
                <span
                  className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                    agentActive
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      agentActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span>{agentActive ? "ACTIVE" : "PAUSED"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Revenue Recovery Assistant &bull; Real-Time Gateway Observer
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAgentActive(!agentActive)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 ${
              agentActive
                ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
                : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {agentActive ? (
              <>
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>PAUSE AGENT</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>RESUME AGENT</span>
              </>
            )}
          </button>

          <button
            onClick={() => openSimulation(selectedPaymentId)}
            disabled={isSimulating}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-ai-600 via-indigo-600 to-brand-accent hover:from-ai-500 hover:to-brand-accent text-white text-xs font-semibold shadow-xl shadow-indigo-500/25 transition-all flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap className="w-4 h-4" />
            <span>RUN RECOVERY SIMULATION</span>
          </button>
        </div>
      </div>

      {/* Main Agent Status & Target Selector Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-surface-100 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-ai-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-xs text-brand-electric font-mono">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>GATEWAY INGESTION ENGINE: MONITORING FAILED PAYMENTS</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Autonomous Decision Pipeline Operational
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                The agent listens to payment gateway drop-offs, extracts customer LTV,
                calculates recovery probability via deterministic multi-factor heuristics,
                and generates simulated recovery links without requiring real payment credentials.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-mono">
                  DECISION LATENCY
                </span>
                <span className="text-base font-bold text-white font-mono">
                  340 ms
                </span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-mono">
                  CURRENT TASK
                </span>
                <span className="text-xs font-semibold text-emerald-400 truncate block">
                  Scoring Pay Drops
                </span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-mono">
                  SAFETY BOUNDARY
                </span>
                <span className="text-xs font-semibold text-purple-400 block">
                  Mock Mode (Sandboxed)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Target Launcher Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-electric" />
                <span>Simulation Target</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Select &amp; Fire
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono">
                CHOOSE FAILED PAYMENT TARGET:
              </label>
              <select
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent font-mono"
              >
                <option value="PAY98231">
                  ★ Rahul Sharma (₹32,999 • UPI / Insufficient Funds • 87%)
                </option>
                <option value="PAY98232">
                  Priya Reddy (₹4,500 • Card / Card Declined • 72%)
                </option>
                <option value="PAY98233">
                  Arjun Kumar (₹19,999 • Netbanking / Timeout • 91%)
                </option>
                {failedPayments
                  .filter((p) => !["PAY98231", "PAY98232", "PAY98233"].includes(p.paymentId))
                  .slice(0, 6)
                  .map((p) => (
                    <option key={p.id} value={p.paymentId}>
                      {p.customer?.name} ({formatINR(p.amount)} • {p.failureReason})
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => openSimulation(selectedPaymentId)}
              disabled={isSimulating}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>RUN 6-STAGE RECOVERY NOW</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center font-mono">
              Executes DETECT &rarr; ANALYZE &rarr; INVESTIGATE &rarr; DECIDE &rarr; ACT &rarr; RECOVER
            </p>
          </div>
        </div>
      </div>

      {/* Agent Activity Timeline & Live Decision Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Agent Decision Terminal */}
        <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-surface-50/50">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-brand-electric" />
              <h3 className="text-xs font-semibold text-white font-mono">
                AGENT DECISION LOG &amp; REASONING MATRIX
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              STDOUT &bull; STREAMING
            </span>
          </div>

          <div className="p-4 font-mono text-xs text-slate-300 space-y-2 h-96 overflow-y-auto bg-black/40">
            <div className="text-slate-500 text-[11px]">
              # Initializing RecoverAI Autonomous Execution Kernel v1.0
            </div>
            <div className="text-slate-500 text-[11px]">
              # Razorpay Gateway Adapter: Event Listener & Recovery Engine active
            </div>
            <div className="text-brand-electric pt-1">
              [SYSTEM] Realtime Persistence Ledger: Synchronized &amp; active.
            </div>
            <div className="text-emerald-400">
              [HEALTHCHECK] Store loaded: 500 customers, 1,500 transactions, 6 furniture items.
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1 my-2">
              <div className="text-purple-400 text-[11px]">
                &gt; EVALUATION: TARGET PAY98231 (Rahul Sharma)
              </div>
              <div className="text-slate-300 text-[11px]">
                - Customer Lifetime Value: ₹82,450 (High Value Tier: 0.92)
              </div>
              <div className="text-slate-300 text-[11px]">
                - Successful Past Transactions: 13/14 (Reliability: 0.95)
              </div>
              <div className="text-slate-300 text-[11px]">
                - Failure Reason: Insufficient Funds (Temporary Transience: 0.80)
              </div>
              <div className="text-amber-400 text-[11px]">
                &gt;&gt; Calculated Recovery Probability: 87% | Priority: HIGH
              </div>
              <div className="text-emerald-400 text-[11px]">
                &gt;&gt; Selected Strategy: SEND_PAYMENT_LINK
              </div>
            </div>

            <div className="text-slate-400">
              [ACTION] Generated simulated payment recovery link: /recovery/PAY98231
            </div>
            <div className="text-slate-400">
              [DISPATCH] Recovery payload synthesized. Simulated notification generated.
            </div>
            <div className="text-emerald-400 font-bold">
              [RECOVERY] Autonomous agent confirmed simulation: ₹32,999 recovered.
            </div>
            <div className="text-slate-500">
              [LEDGER] Updated merchant dashboard: Risk -₹32,999 | Recovered +₹32,999.
            </div>
          </div>
        </div>

        {/* Right: Agent Activity Timeline */}
        <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-surface-50/50">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-semibold text-white font-mono">
                AGENT ACTIVITY AUDIT TRAIL
              </h3>
            </div>
            <button
              onClick={loadAgentData}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Refresh
            </button>
          </div>

          <div className="p-4 space-y-3 h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No recent agent events recorded yet. Click Run Recovery Simulation above.
              </div>
            ) : (
              events.map((ev: any) => {
                const isSuccess = ev.eventType === "RECOVERY_SUCCESS";
                const isDecision = ev.eventType === "DECISION";

                return (
                  <div
                    key={ev.id}
                    className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <div className="mt-0.5">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isDecision ? (
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-brand-electric my-1 shrink-0" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-slate-300">
                          {ev.eventType}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDate(ev.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        {ev.description}
                      </p>
                      {ev.paymentId && (
                        <span className="inline-block mt-1 font-mono text-[10px] text-brand-electric">
                          Target: {ev.paymentId}
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
