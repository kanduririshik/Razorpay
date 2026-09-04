"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { SimulationStep } from "@/lib/types";
import { initiateRecoveryAction, getStoredState, saveRazorpayLinkData } from "@/lib/data/store";

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

      // Track the real payment link result
      let razorpayLinkResult: {
        shortUrl: string;
        linkId: string;
        mode: "live" | "test" | "simulation";
        referenceId: string;
        originalAmount?: number;
        testPaymentAmount?: number;
      } | null = null;

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

          // On ACTING stage (index 4): call Razorpay payment-link API
          if (i === 4) {
            try {
              // Get payment + customer data from local store
              const state = getStoredState();
              const payment = state.payments.find(
                (p) => p.id === targetPaymentId || p.paymentId === targetPaymentId
              );
              const customer = payment
                ? state.customers.find((c) => c.id === payment.customerId)
                : null;
              const order = state.orders?.find(
                (o) => o.paymentId === (payment?.paymentId ?? targetPaymentId)
              );

              if (payment && customer) {
                const linkRes = await fetch("/api/razorpay/payment-link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    paymentId: payment.paymentId,
                    orderId: order?.orderId ?? "RA" + payment.paymentId.replace("PAY", ""),
                    amount: payment.amount,
                    currency: payment.currency ?? "INR",
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    description: `Payment recovery for ${order?.items?.[0]?.productName ?? "furniture order"} — RecoverAI`,
                  }),
                });

                if (linkRes.ok) {
                  const linkData = await linkRes.json();
                  if (linkData.success) {
                    razorpayLinkResult = {
                      shortUrl: linkData.shortUrl,
                      linkId: linkData.linkId,
                      mode: linkData.mode,
                      referenceId: linkData.referenceId,
                      originalAmount: linkData.originalAmount,
                      testPaymentAmount: linkData.testPaymentAmount,
                    };
                    // Persist to shared LocalStorage store immediately
                    saveRazorpayLinkData(payment.paymentId, {
                      linkId: linkData.linkId,
                      shortUrl: linkData.shortUrl,
                      mode: linkData.mode,
                      referenceId: linkData.referenceId,
                      originalAmount: linkData.originalAmount,
                      testPaymentAmount: linkData.testPaymentAmount,
                    });
                    // Update ACTING stage description with link info
                    setStages((prev) =>
                      prev.map((s, idx) =>
                        idx === 4
                          ? {
                              ...s,
                              description:
                                linkData.mode === "live" || linkData.mode === "test"
                                  ? `✅ Razorpay Payment Link created: ${linkData.shortUrl} (₹${linkData.testPaymentAmount})`
                                  : `Recovery link dispatched: ${linkData.shortUrl}`,
                            }
                          : s
                      )
                    );
                  }
                }
              }
            } catch (linkErr) {
              console.warn("[RecoverAI] Payment link creation error (non-fatal):", linkErr);
            }
            // Extra delay on ACTING stage for visual effect
            await new Promise((res) => setTimeout(res, 1000));
          } else {
            // 650ms delay per stage
            await new Promise((res) => setTimeout(res, 650));
          }
        }

        // ── Initiate recovery in LocalStorage (WAITING_CUSTOMER state) ──
        let initiateResult: any;
        try {
          initiateResult = initiateRecoveryAction(targetPaymentId);
        } catch (e) {
          console.warn("[RecoverAI] initiateRecoveryAction failed:", e);
        }

        const state = getStoredState();
        const payment = state.payments.find(
          (p) => p.id === targetPaymentId || p.paymentId === targetPaymentId
        );

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
            // Use the real Razorpay link if available, otherwise fall back to /recovery/[id]
            simulatedLink: razorpayLinkResult?.shortUrl ?? initiateResult?.recoveryUrl ?? `/recovery/${targetPaymentId}`,
            razorpayLinkMode: razorpayLinkResult?.mode ?? "simulation",
            razorpayLinkId: razorpayLinkResult?.linkId,
            originalAmount: razorpayLinkResult?.originalAmount ?? payment?.amount ?? 32999,
            testPaymentAmount: razorpayLinkResult?.testPaymentAmount ?? 1000,
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
        const modeStr =
          razorpayLinkResult?.mode === "live"
            ? "Real Razorpay payment link sent."
            : "Recovery link dispatched.";
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
