"use client";

import React, { useState } from "react";
import { Search, Bell, Sparkles, Shield, User, ExternalLink, Check } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import Link from "next/link";

export default function Header() {
  const { openSimulation, isSimulating } = useSimulation();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Agent recovered ₹8,999",
      subtitle: "Rahul Sharma completed payment link",
      time: "2m ago",
      type: "recovery",
    },
    {
      id: 2,
      title: "High Risk Payment Detected",
      subtitle: "Arjun Kumar - ₹19,999 (Timeout)",
      time: "15m ago",
      type: "alert",
    },
    {
      id: 3,
      title: "Recovery Strategy Optimized",
      subtitle: "UPI smart retry rate increased to 74%",
      time: "1h ago",
      type: "info",
    },
  ];

  return (
    <header className="h-16 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payments, customers (e.g. Rahul Sharma, PAY98231)..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3.5">
        {/* AGENT ACTIVE Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">AGENT ACTIVE</span>
          <span className="text-[10px] text-emerald-400/70 border-l border-emerald-500/20 pl-1.5">
            Autonomous Recovery
          </span>
        </div>

        {/* Global Trigger Simulation Button */}
        <button
          onClick={() => openSimulation("PAY98231")}
          disabled={isSimulating}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-brand-accent to-ai-600 hover:from-brand-accent/90 hover:to-ai-600/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isSimulating ? "PROCESSING..." : "RUN AI RECOVERY"}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-electric animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">
                  Agent Notifications
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  3 unread
                </span>
              </div>
              <div className="space-y-1.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {n.subtitle}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-1 text-center">
                <Link
                  href="/agent"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-brand-electric hover:underline block"
                >
                  View full Agent Audit Log →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Merchant Profile */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            AR
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              Alex Rivera
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              Merchant Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
