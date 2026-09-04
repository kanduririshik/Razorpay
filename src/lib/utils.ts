import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PriorityLevel, RecoveryStrategy, PaymentStatus, FailureReason } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs >= 10 ? lakhs.toFixed(1) : lakhs.toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getPriorityBadge(priority: PriorityLevel) {
  switch (priority) {
    case "CRITICAL":
      return {
        bg: "bg-red-500/15 text-red-400 border-red-500/30",
        label: "CRITICAL",
        dot: "bg-red-500",
      };
    case "HIGH":
      return {
        bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        label: "HIGH",
        dot: "bg-amber-500",
      };
    case "MEDIUM":
      return {
        bg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        label: "MEDIUM",
        dot: "bg-blue-500",
      };
    case "LOW":
    default:
      return {
        bg: "bg-slate-500/15 text-slate-400 border-slate-500/30",
        label: "LOW",
        dot: "bg-slate-500",
      };
  }
}

export function getStatusBadge(status: PaymentStatus | string) {
  switch (status) {
    case "SUCCESS":
    case "RECOVERED":
      return {
        bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        label: status === "RECOVERED" ? "Recovered" : "Successful",
      };
    case "FAILED":
      return {
        bg: "bg-red-500/15 text-red-400 border-red-500/30",
        label: "Failed",
      };
    case "PENDING":
    case "EXECUTED":
      return {
        bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        label: status === "EXECUTED" ? "Action Sent" : "Pending",
      };
    default:
      return {
        bg: "bg-slate-500/15 text-slate-400 border-slate-500/30",
        label: status,
      };
  }
}

export function getStrategyLabel(strategy: RecoveryStrategy): string {
  switch (strategy) {
    case "SEND_PAYMENT_LINK":
      return "Payment Link";
    case "RETRY_PAYMENT":
      return "Smart Retry";
    case "SUGGEST_ALTERNATIVE_METHOD":
      return "Alternative Method";
    case "SEND_PERSONALIZED_REMINDER":
      return "Personalized Reminder";
    case "HUMAN_REVIEW":
      return "Human Review";
    default:
      return strategy;
  }
}

export function getFailureReasonClass(reason: FailureReason | string | null): string {
  switch (reason) {
    case "Insufficient Funds":
      return "text-amber-300";
    case "Card Declined":
      return "text-rose-300";
    case "Timeout":
      return "text-blue-300";
    case "Network Error":
      return "text-purple-300";
    case "Bank Server Error":
      return "text-orange-300";
    case "Authentication Failed":
      return "text-pink-300";
    default:
      return "text-slate-300";
  }
}

/**
 * Classifies a raw Razorpay failure description/reason into a user-friendly RecoverAI category,
 * while preserving the raw error information.
 */
export function classifyRazorpayFailure(
  rawReason?: string | null,
  errorCode?: string | null
): { category: string; rawDescription: string } {
  const raw = rawReason?.trim() || errorCode?.trim() || "Payment declined by bank gateway";
  const str = `${rawReason || ""} ${errorCode || ""}`.toLowerCase();

  let category = "PAYMENT FAILED";
  if (str.includes("upi") || str.includes("vpa") || str.includes("mpin")) {
    category = "UPI PAYMENT FAILURE";
  } else if (str.includes("insufficient") || str.includes("balance") || str.includes("funds")) {
    category = "INSUFFICIENT FUNDS";
  } else if (str.includes("card") || str.includes("cvv") || str.includes("expiry") || str.includes("declined")) {
    category = "CARD DECLINED";
  } else if (str.includes("auth") || str.includes("otp") || str.includes("verification") || str.includes("3ds")) {
    category = "AUTHENTICATION FAILURE";
  } else if (str.includes("timeout") || str.includes("network")) {
    category = "TIMEOUT / NETWORK ERROR";
  } else if (str.includes("bank") || str.includes("issuer") || str.includes("server")) {
    category = "BANK DECLINED";
  } else {
    category = "PAYMENT METHOD FAILURE";
  }

  return {
    category,
    rawDescription: raw,
  };
}

