"use client";

import React, { useEffect } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { CheckCircle2, Loader2, Sparkles, X, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { formatINR } from "@/lib/utils";

export default function SimulationModal() {
  const {
    isModalOpen,
    closeSimulation,
    activeStageIndex,
    stages,
    isSimulating,
    isComplete,
    simulationData,
  } = useSimulation();

  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isComplete) {
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#38bdf8", "#8b5cf6", "#f59e0b"],
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [isComplete]);

  if (!isModalOpen) return null;

  const result = simulationData?.simulation;
  const recoveredAmount = result?.amount || 8999;
  const customerName = result?.customerName || "Rahul Sharma";
  const probability = Math.round((result?.recoveryProbability || 0.87) * 100);
  const strategy = (result?.strategy || "SEND_PAYMENT_LINK").replace(/_/g, " ");
  const recoveryLink = result?.simulatedLink || "";
  const isLiveMode = result?.razorpayLinkMode === "live";

  const handleCopyLink = () => {
    if (recoveryLink) {
      navigator.clipboard.writeText(recoveryLink).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface-100 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-surface-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-accent/20 border border-brand-accent/40 rounded-lg text-brand-electric">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-white">
                  RecoverAI Autonomous Recovery Agent
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {isSimulating ? "RUNNING" : isComplete ? "RECOVERED" : "READY"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live autonomous decision & recovery workflow pipeline
              </p>
            </div>
          </div>
          <button
            onClick={closeSimulation}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isComplete ? (
            <>
              {/* Progress Stepper */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>STAGE {activeStageIndex + 1} OF 6</span>
                  <span className="text-brand-electric">
                    {Math.round(((activeStageIndex + 1) / 6) * 100)}% COMPLETE
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-accent via-ai-500 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${((activeStageIndex + 1) / 6) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 6-Stage Timeline List */}
              <div className="space-y-3">
                {stages.map((stg, idx) => {
                  const isActive = idx === activeStageIndex;
                  const isDone = idx < activeStageIndex;

                  return (
                    <div
                      key={stg.stage}
                      className={`flex items-start space-x-3.5 p-3 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? "bg-slate-800/90 border-brand-accent/60 shadow-lg shadow-brand-accent/5"
                          : isDone
                          ? "bg-slate-900/40 border-slate-800/80 text-slate-400"
                          : "bg-transparent border-slate-800/40 text-slate-600 opacity-60"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isActive ? (
                          <Loader2 className="w-5 h-5 text-brand-electric animate-spin" />
                        ) : isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-medium ${
                              isActive
                                ? "text-white font-semibold"
                                : isDone
                                ? "text-slate-200"
                                : "text-slate-500"
                            }`}
                          >
                            {stg.label}
                          </span>
                          {stg.timestamp && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {stg.timestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {stg.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Terminal Logs Footer */}
              <div className="bg-black/50 rounded-xl p-3.5 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1">
                <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
                  <span>AGENT DECISION LOG</span>
                </div>
                <div className="text-brand-electric">
                  &gt; [RecoverAI] Analyzing payment payload for transience classification...
                </div>
                <div className="text-emerald-400">
                  &gt; [Telemetry] Gateway connection verified. No real transaction triggered.
                </div>
              </div>
            </>
          ) : (
            /* Completed Screen */
            <div className="text-center py-4 space-y-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Recovery Link Dispatched
                  </span>
                  {isLiveMode ? (
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      RAZORPAY LIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      SIMULATION MODE
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {formatINR(recoveredAmount)}
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  {isLiveMode
                    ? <>Real Razorpay payment link sent to <span className="text-slate-200 font-medium">{customerName}</span>. Awaiting customer payment.</>  
                    : <>Recovery link dispatched to <span className="text-slate-200 font-medium">{customerName}</span>. Awaiting customer action.</>}
                </p>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Recovery Probability
                  </span>
                  <span className="text-lg font-bold text-brand-electric font-mono">
                    {probability}%
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Selected Strategy
                  </span>
                  <span className="text-sm font-semibold text-purple-400 truncate block">
                    {strategy}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Agent Action
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 truncate block">
                    {isLiveMode ? "Razorpay Link Sent" : "Link Dispatched"}
                  </span>
                </div>
              </div>

              {/* Recovery Link Output */}
              {recoveryLink && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-w-lg mx-auto text-left">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mb-2">
                    <span>{isLiveMode ? "Razorpay Payment Link (Test Mode):" : "Secure Recovery Link:"}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isLiveMode ? "bg-blue-500/20 text-blue-400" : "bg-slate-700 text-slate-400"
                    }`}>
                      {isLiveMode ? "REAL" : "SIM"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 text-xs font-mono text-slate-300 bg-black/40 p-2 rounded border border-slate-800 truncate">
                      {recoveryLink}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="flex-shrink-0 px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg border border-slate-600 transition-colors font-medium"
                    >
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>
                  {!isLiveMode && (
                    <p className="text-[10px] text-slate-500 mt-2">
                      Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to generate real Razorpay links.
                    </p>
                  )}
                </div>
              )}

              {/* Notice */}
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {isLiveMode
                    ? "Real Razorpay payment link created. Payment verified server-side on completion."
                    : "Executed autonomously by RecoverAI Agent. Awaiting customer action."}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={closeSimulation}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
                >
                  <span>Done &amp; View Updated Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
