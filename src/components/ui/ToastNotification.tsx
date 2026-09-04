"use client";

import React from "react";
import { useSimulation } from "@/context/SimulationContext";
import { CheckCircle, X } from "lucide-react";

export default function ToastNotification() {
  const { toastMessage, setToastMessage } = useSimulation();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center space-x-3 bg-slate-900/95 border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md glow-success">
      <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
        <CheckCircle className="w-5 h-5" />
      </div>
      <div className="text-sm font-medium pr-2">
        {toastMessage}
      </div>
      <button
        onClick={() => setToastMessage(null)}
        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
