"use client";

import React from "react";
import Link from "next/link";
import { formatINR, getPriorityBadge, getStrategyLabel, getFailureReasonClass } from "@/lib/utils";
import { Sparkles, ArrowRight, Zap, Play } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";

interface OpportunityItem {
  id: string;
  paymentId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  failureReason: string | null;
  method: string;
  priority: any;
  recoveryProbability: number;
  strategy: any;
  status: string;
}

interface OpportunitiesTableProps {
  opportunities: OpportunityItem[];
}

export default function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const { openSimulation, isSimulating } = useSimulation();

  return (
    <div className="rounded-2xl bg-surface-100 border border-slate-800 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white">Top Recovery Opportunities</h3>
            <span className="px-2 py-0.5 rounded-full bg-ai-500/20 text-ai-500 border border-ai-500/30 text-[10px] font-mono font-medium">
              AI RANKED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Highest expected recovery yield prioritized by autonomous scoring
          </p>
        </div>

        <Link
          href="/payments"
          className="text-xs font-semibold text-brand-electric hover:underline flex items-center space-x-1"
        >
          <span>View All 238 Failed Payments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-50/50 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Failure Reason</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Recovery Probability</th>
              <th className="py-3 px-4">Recommended Action</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Autonomous Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No active high-priority recovery opportunities found.
                </td>
              </tr>
            ) : (
              opportunities.map((opp) => {
                const priorityBadge = getPriorityBadge(opp.priority);
                const isRahul = opp.customerName.includes("Rahul Sharma");

                return (
                  <tr
                    key={opp.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isRahul ? "bg-brand-accent/5 border-l-2 border-brand-accent" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center space-x-1.5">
                        <span>{opp.customerName}</span>
                        {isRahul && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-accent/20 text-brand-electric font-normal">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {opp.paymentId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatINR(opp.amount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-medium ${getFailureReasonClass(
                          opp.failureReason
                        )}`}
                      >
                        {opp.failureReason || "Gateway Error"}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        via {opp.method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${priorityBadge.bg}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`}
                        />
                        <span>{priorityBadge.label}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              opp.recoveryProbability >= 0.85
                                ? "bg-emerald-400"
                                : opp.recoveryProbability >= 0.7
                                ? "bg-brand-electric"
                                : "bg-amber-400"
                            }`}
                            style={{
                              width: `${opp.recoveryProbability * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200 text-xs">
                          {Math.round(opp.recoveryProbability * 100)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium text-[11px] inline-block">
                        {getStrategyLabel(opp.strategy)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                        At Risk
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/payments/${opp.paymentId || opp.id}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white inline-block transition-colors"
                        title="View Payment Breakdown"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => openSimulation(opp.id)}
                        disabled={isSimulating}
                        className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-[11px] shadow-sm transition-all inline-flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Simulate</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
