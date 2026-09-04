"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  RotateCcw,
  Bot,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  Zap,
  Armchair,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Revenue Recovery", href: "/admin/recovery", icon: RotateCcw },
  { label: "AI Agent", href: "/admin/agent", icon: Bot, isAgent: true },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0c1220] border-r border-slate-800 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none">
      <div>
        {/* Logo and Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-accent to-ai-500 flex items-center justify-center text-white shadow-lg shadow-brand-accent/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-bold text-white tracking-tight">
                  Recover<span className="text-brand-electric">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-accent/20 text-brand-electric font-semibold border border-brand-accent/30">
                  AGENT
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Razorpay AI Builder &apos;26</p>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-brand-accent/20 to-brand-accent/5 text-white border border-brand-accent/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-brand-electric"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.isAgent && (
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-ai-500/20 text-ai-500 border border-ai-500/30 text-[10px] font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Agent Status Card & Store Switcher */}
      <div className="p-4 border-t border-slate-800/80 space-y-2.5">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors group"
        >
          <div className="flex items-center space-x-2">
            <Armchair className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Furniture Storefront</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </Link>

        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Recovery Engine</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Autonomous Agent Active
          </p>
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>v1.0.0 (Phase 1)</span>
            <span className="text-emerald-400">Zero-Config</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
