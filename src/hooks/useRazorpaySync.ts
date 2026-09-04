"use client";

/**
 * useRazorpaySync — Client-side hook that polls /api/razorpay/sync
 * to detect when a payment has been server-verified (via webhook or callback)
 * and applies the update to LocalStorage + refreshes context.
 *
 * Used in the admin dashboard / payment details page to auto-refresh
 * when a customer completes their Razorpay payment.
 */

import { useEffect, useRef } from "react";
import { completeCustomerRecovery } from "@/lib/data/store";

interface UseRazorpaySyncOptions {
  /** Called when a verified recovery event is applied to LocalStorage */
  onRecovered?: (paymentId: string, amount: number) => void;
  /** Polling interval in ms (default: 3000) */
  intervalMs?: number;
  /** Whether to actively poll (default: true) */
  enabled?: boolean;
  /** If provided, only check for this specific paymentId */
  watchPaymentId?: string;
}

export function useRazorpaySync(options: UseRazorpaySyncOptions = {}) {
  const { onRecovered, intervalMs = 3000, enabled = true, watchPaymentId } = options;
  const appliedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        const url = watchPaymentId
          ? `/api/razorpay/sync?paymentId=${encodeURIComponent(watchPaymentId)}`
          : "/api/razorpay/sync";

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;

        const { events } = await res.json();
        if (!Array.isArray(events) || events.length === 0) return;

        for (const event of events) {
          const { paymentId, amount, status } = event;
          if (!paymentId || status !== "RECOVERED") continue;
          if (appliedRef.current.has(paymentId)) continue;

          // Apply to LocalStorage
          try {
            completeCustomerRecovery(paymentId);
            appliedRef.current.add(paymentId);
            console.log(`[RecoverAI sync] ✅ Applied recovery for ${paymentId} — ₹${amount}`);
            onRecovered?.(paymentId, amount);
          } catch (err) {
            console.warn(`[RecoverAI sync] Failed to apply recovery for ${paymentId}:`, err);
          }
        }
      } catch (err) {
        // Silently ignore — polling is best-effort
      }
    };

    // Poll immediately on mount, then on interval
    poll();
    const interval = setInterval(poll, intervalMs);
    return () => clearInterval(interval);
  }, [enabled, intervalMs, watchPaymentId, onRecovered]);
}
