"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { SimulationStep } from "@/lib/types";
import { initiateRecoveryAction, getStoredState } from "@/lib/data/store";

interface SimulationContextType {
  isModalOpen: boolean;
  activeStageIndex: number;
  stages: SimulationStep[];
  isSimulating: boolean;
  isComplete: boolean;
  simulationData: any | null;
  metricsRevision: number;
  openSimulation: (paymentId?: string) => void;
  closeSimulation: () => void;
  runSimulation: (paymentId?: string) => Promise<void>;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const DEFAULT_STAGES: SimulationStep[] = [
  {
    stage: "DETECTING",
    label: "Detecting Failed Payment",
    description: "Intercepting gateway failure telemetry and verifying idempotency.",
    status: "pending",
    timestamp: "",
  },
  {
    stage: "ANALYZING",
    label: "Profiling Customer",
    description: "Evaluating transaction history, churn risk, and preferred channel.",
    status: "pending",
    timestamp: "",
  },
  {
    stage: "INVESTIGATING",
    label: "Investigating Root Cause",
    description: "Classifying failure transience and banking network signals.",
    status: "pending",
    timestamp: "",
  },
  {
    stage: "DECIDING",
    label: "Calculating Recovery Probability",
    description: "Running multi-factor scoring model and selecting optimal strategy.",
    status: "pending",
    timestamp: "",
  },
  {
    stage: "ACTING",
    label: "Executing Recovery Action",
    description: "Generated simulated payment recovery link and dispatched recovery payload.",
    status: "pending",
    timestamp: "",
  },
  {
    stage: "RECOVERING",
    label: "Recovering Revenue",
    description: "Synchronizing ledger and updating merchant balance in real time.",
    status: "pending",
    timestamp: "",
  },
];

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [stages, setStages] = useState<SimulationStep[]>(DEFAULT_STAGES);
  const [simulationData, setSimulationData] = useState<any | null>(null);
  const [metricsRevision, setMetricsRevision] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openSimulation = useCallback((paymentId?: string) => {
    setIsModalOpen(true);
    setIsComplete(false);
    setActiveStageIndex(0);
    setStages(
      DEFAULT_STAGES.map((s) => ({ ...s, status: "pending", timestamp: "" }))
    );
    if (paymentId) {
      runSimulation(paymentId);
    }
  }, []);

  const closeSimulation = useCallback(() => {
    setIsModalOpen(false);
    setIsSimulating(false);
  }, []);

  const runSimulation = useCallback(
    async (paymentId?: string) => {
      const targetPaymentId = paymentId || "PAY98231";

      setIsModalOpen(true);
      setIsSimulating(true);
      setIsComplete(false);
      setActiveStageIndex(0);

      const updatedStages = DEFAULT_STAGES.map((s) => ({
        ...s,
        status: "pending" as const,
        timestamp: "",
      }));
      setStages(updatedStages);

      try {
        // Step-by-step visual animation through stages
        for (let i = 0; i < DEFAULT_STAGES.length; i++) {
          setActiveStageIndex(i);

          const currentTimestamp = new Date().toLocaleTimeString("en-IN", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          setStages((prev) =>
            prev.map((s, idx) => ({
              ...s,
              status:
                idx < i
                  ? ("completed" as const)
                  : idx === i
                  ? ("active" as const)
                  : ("pending" as const),
              timestamp: idx === i ? currentTimestamp : s.timestamp,
            }))
          );

          // On ACTING stage (index 4): provision recovery action for customer
          if (i === 4) {
            setStages((prev) =>
              prev.map((s, idx) =>
                idx === 4
                  ? {
                      ...s,
                      description: `✅ Prepared Razorpay Standard Checkout recovery channel for customer (Order #RA98231)`,
                    }
                  : s
              )
            );
            // Delay on ACTING stage for visual telemetry effect
            await new Promise((res) => setTimeout(res, 900));
          } else {
            // 650ms delay per stage
            await new Promise((res) => setTimeout(res, 650));
          }
        }

        // Fetch latest state to get actual customer and payment amount
        const state = getStoredState();
        const payment = state.payments.find(
          (p) => p.id === targetPaymentId || p.paymentId === targetPaymentId
        );

        // ── Initiate recovery in LocalStorage (WAITING_CUSTOMER state) ──
        let initiateResult: any;
        try {
          initiateResult = initiateRecoveryAction(targetPaymentId);
        } catch (e) {
          console.warn("[RecoverAI] initiateRecoveryAction failed:", e);
        }

        const data = {
          success: true,
          simulation: {
            paymentId: initiateResult?.paymentId ?? targetPaymentId,
            customerName: initiateResult?.customerName ?? "Customer",
            amount: payment?.amount ?? initiateResult?.amount ?? 32999,
            priority: "HIGH",
            recoveryProbability: 0.87,
            strategy: "SEND_PAYMENT_LINK",
            reason: "High-value customer with transient failure.",
            simulatedLink: `/recovery/${targetPaymentId}`,
            razorpayLinkMode: "test",
            originalAmount: payment?.amount ?? 32999,
            testPaymentAmount: 1000,
          },
        };

        setSimulationData(data);
        setIsComplete(true);
        setIsSimulating(false);
        setActiveStageIndex(DEFAULT_STAGES.length - 1);

        setStages((prev) =>
          prev.map((s) => ({
            ...s,
            status: "completed" as const,
          }))
        );

        // Update dashboard metrics counter
        setMetricsRevision((prev) => prev + 1);

        // Toast feedback
        const amountStr = data.simulation?.amount
          ? `₹${data.simulation.amount.toLocaleString("en-IN")}`
          : "₹32,999";
        const modeStr = "Standard Checkout recovery channel dispatched.";
        setToastMessage(`${modeStr} Awaiting customer payment of ${amountStr}.`);

        // Auto dismiss toast after 6s
        setTimeout(() => {
          setToastMessage(null);
        }, 6000);
      } catch (err: any) {
        console.error("Simulation error:", err);
        setIsSimulating(false);
      }
    },
    []
  );

  return (
    <SimulationContext.Provider
      value={{
        isModalOpen,
        activeStageIndex,
        stages,
        isSimulating,
        isComplete,
        simulationData,
        metricsRevision,
        openSimulation,
        closeSimulation,
        runSimulation,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
