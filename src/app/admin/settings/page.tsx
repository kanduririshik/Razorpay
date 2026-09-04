"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  RotateCcw,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Armchair,
  ExternalLink,
  Lock,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";
import { useDemoData } from "@/context/DemoDataContext";

export default function AdminSettingsPage() {
  const { resetData } = useDemoData();
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Merchant Settings &amp; System Controls
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure autonomous agent boundaries, payment gateway endpoints, and merchant ledger state.
        </p>
      </div>

      {/* State Reset Panel */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              MERCHANT DATA STATE CONTROLS
            </h2>
            <p className="text-xs text-slate-400">
              Restore clean baseline transactions for evaluation and auditing.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Resetting restores the initial transaction state: Rahul Sharma with failed payment{" "}
            <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">PAY98231</code>{" "}
            (₹32,999) for Modern 3-Seater Sofa, 13 successful past payments, and an unresolved alert on the Admin Dashboard.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET TO INITIAL DATA</span>
            </button>

            {resetDone && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1.5 font-mono animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>System state restored to initial baseline successfully!</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Connected Storefront Info */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              ATTACHED STOREFRONT
            </h2>
            <p className="text-xs text-slate-400">
              Customer e-commerce portal linked via shared Local Storage state
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">STORE NAME</span>
            <span className="font-semibold text-white mt-0.5 block">RecoverAI Furniture</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">STOREFRONT ROUTE</span>
            <span className="font-semibold text-amber-300 mt-0.5 block">/ (Root) &bull; /shop</span>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>Open Customer Furniture Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Gateway Configuration & Guardrails */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              GATEWAY OBSERVER &amp; GUARDRAILS
            </h2>
            <p className="text-xs text-slate-400">
              Safety parameters for autonomous recovery generation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Gateway Mode</span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-mono font-bold">Razorpay Gateway Adapter</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Persistence Layer</span>
            <div className="flex items-center space-x-2">
              <span className="text-brand-electric font-mono font-bold">Realtime Persistence Ledger</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Min Recovery Confidence</span>
            <div className="text-white font-mono font-bold">60% Threshold</div>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Primary Target</span>
            <div className="text-amber-400 font-mono font-bold">Rahul Sharma (PAY98231)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
