import {
  CustomerData,
  PaymentData,
  RecoveryActionData,
  AgentEventData,
  DashboardMetrics,
  PriorityLevel,
  RecoveryStrategy,
} from "../types";
import {
  generateInitialDemoData,
  DemoStoreState,
  FurnitureProduct,
  CartItem,
  OrderData,
  AdminAlert,
  FURNITURE_PRODUCTS,
} from "./initialData";
import { formatINR } from "../utils";
import { RevenueRecoveryAgent } from "@/services/revenueRecoveryAgent";

export const RECOVERAI_STORAGE_KEY = "recoverai_demo_store_v1";

// In-memory cache for server-side execution / fallback
let inMemoryServerState: DemoStoreState | null = null;

export function getStoredState(): DemoStoreState {
  if (typeof window === "undefined") {
    if (!inMemoryServerState) {
      inMemoryServerState = generateInitialDemoData();
    }
    return inMemoryServerState;
  }

  try {
    const raw = window.localStorage.getItem(RECOVERAI_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoStoreState;
      if (
        parsed &&
        Array.isArray(parsed.customers) &&
        parsed.customers.length >= 500 &&
        Array.isArray(parsed.payments) &&
        parsed.payments.length >= 1500
      ) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to parse recoverai_demo_store from localStorage, re-initializing:", err);
  }

  // Initialize and persist
  const initial = generateInitialDemoData();
  try {
    window.localStorage.setItem(RECOVERAI_STORAGE_KEY, JSON.stringify(initial));
  } catch (err) {
    console.warn("Failed to save initial demo data to localStorage:", err);
  }
  return initial;
}

export function saveStoredState(state: DemoStoreState): void {
  state.lastUpdated = new Date().toISOString();

  if (typeof window === "undefined") {
    inMemoryServerState = state;
    return;
  }

  try {
    window.localStorage.setItem(RECOVERAI_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("recoverai_store_updated"));
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
}

export function resetStoredState(): DemoStoreState {
  const fresh = generateInitialDemoData();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(RECOVERAI_STORAGE_KEY, JSON.stringify(fresh));
      window.dispatchEvent(new CustomEvent("recoverai_store_updated"));
    } catch (err) {
      console.error("Failed to reset localStorage:", err);
    }
  } else {
    inMemoryServerState = fresh;
  }
  return fresh;
}

// -------------------------------------------------------------
// Core Query Helpers
// -------------------------------------------------------------

export function calculateDashboardMetrics(state: DemoStoreState): DashboardMetrics {
  const successAndRecovered = state.payments.filter(
    (p) => p.status === "SUCCESS" || p.status === "RECOVERED"
  );
  const totalRevenue = successAndRecovered.reduce((acc, p) => acc + p.amount, 0);

  const failedList = state.payments.filter((p) => p.status === "FAILED");
  const revenueAtRisk = failedList.reduce((acc, p) => acc + p.amount, 0);
  const failedPayments = failedList.length;

  const recoveredActions = state.recoveryActions.filter((r) => r.status === "RECOVERED");
  const revenueRecovered = recoveredActions.reduce(
    (acc, r) => acc + (r.actualRecovery || 0),
    0
  );

  const recoveryAttempts = state.recoveryActions.length;
  const successfulRecoveries = recoveredActions.length;
  const recoveryRate =
    recoveryAttempts > 0
      ? successfulRecoveries / recoveryAttempts
      : 0.602;

  // Last recovered action
  const sortedRecovered = [...recoveredActions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const last = sortedRecovered[0];
  let lastSimulatedRecovery: DashboardMetrics["lastSimulatedRecovery"] = undefined;

  if (last) {
    const cust = state.customers.find((c) => c.id === last.customerId);
    const pay = state.payments.find((p) => p.id === last.paymentId);
    if (cust && pay) {
      lastSimulatedRecovery = {
        customerName: cust.name,
        amount: last.actualRecovery || pay.amount,
        paymentId: pay.paymentId,
        strategy: last.strategy,
        timestamp: last.updatedAt,
      };
    }
  }

  return {
    totalRevenue,
    revenueAtRisk,
    revenueRecovered,
    failedPayments,
    recoveryAttempts,
    successfulRecoveries,
    recoveryRate,
    lastSimulatedRecovery,
  };
}

export function getTopRecoveryOpportunities(state: DemoStoreState, limit = 6) {
  const failed = state.payments
    .filter((p) => p.status === "FAILED")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  return failed.map((p) => {
    const cust = state.customers.find((c) => c.id === p.customerId) || {
      id: p.customerId,
      name: "Customer",
      email: "customer@example.com",
      phone: "+91 99999 99999",
      lifetimeValue: 25000,
      totalPayments: 5,
      successfulPayments: 4,
      failedPayments: 1,
      preferredPaymentMethod: p.method,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };

    const ai = RevenueRecoveryAgent.analyze(cust as any, p as any);

    return {
      id: p.id,
      paymentId: p.paymentId,
      customerName: cust.name,
      customerEmail: cust.email,
      amount: p.amount,
      failureReason: p.failureReason,
      method: p.method,
      priority: ai.priority,
      recoveryProbability: ai.recoveryProbability,
      strategy: ai.strategy,
      status: "At Risk",
    };
  });
}

export function getDashboardData(state?: DemoStoreState) {
  const current = state || getStoredState();
  const metrics = calculateDashboardMetrics(current);
  const topOpportunities = getTopRecoveryOpportunities(current, 6);

  // Failure Reason Distribution
  const reasonCounts: Record<string, number> = {};
  current.payments
    .filter((p) => p.status === "FAILED" || p.status === "RECOVERED")
    .forEach((p) => {
      const reason = p.failureReason || "Other";
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
  const failureReasonDistribution = Object.entries(reasonCounts).map(
    ([reason, count]) => ({ reason, count })
  );

  // Strategy Distribution
  const strategyCounts: Record<string, number> = {};
  current.recoveryActions.forEach((a) => {
    strategyCounts[a.strategy] = (strategyCounts[a.strategy] || 0) + 1;
  });
  const strategyDistribution = Object.entries(strategyCounts).map(
    ([strategy, count]) => ({
      strategy: strategy.replace(/_/g, " "),
      count,
    })
  );

  return {
    metrics,
    topOpportunities,
    failureReasonDistribution,
    strategyDistribution,
    lastSimulatedRecovery: metrics.lastSimulatedRecovery || null,
  };
}

export function queryPayments(
  state: DemoStoreState,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    failureReason?: string;
    priority?: string;
  }
) {
  const {
    page = 1,
    limit = 15,
    search = "",
    status = "ALL",
    method = "ALL",
    failureReason = "ALL",
    priority = "ALL",
  } = options;

  let filtered = state.payments.map((p) => {
    const cust = state.customers.find((c) => c.id === p.customerId);
    const ai = cust
      ? RevenueRecoveryAgent.analyze(cust as any, p as any)
      : { priority: "MEDIUM" as PriorityLevel, recoveryProbability: 0.65, strategy: "SEND_PAYMENT_LINK" as RecoveryStrategy, reason: "Evaluated" };

    return {
      ...p,
      customer: cust || {
        id: p.customerId,
        name: "Unknown Customer",
        email: "customer@example.com",
        phone: "+91 99999 00000",
      },
      priority: ai.priority,
      recoveryProbability: ai.recoveryProbability,
      strategy: ai.strategy,
    };
  });

  if (status !== "ALL") {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (method !== "ALL") {
    filtered = filtered.filter((p) => p.method === method);
  }

  if (failureReason !== "ALL") {
    filtered = filtered.filter((p) => p.failureReason === failureReason);
  }

  if (priority !== "ALL") {
    filtered = filtered.filter((p) => p.priority === priority);
  }

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.paymentId.toLowerCase().includes(q) ||
        p.customer.name.toLowerCase().includes(q) ||
        p.customer.email.toLowerCase().includes(q)
    );
  }

  // Sort failed payments first, then by date descending
  filtered.sort((a, b) => {
    if (a.status === "FAILED" && b.status !== "FAILED") return -1;
    if (b.status === "FAILED" && a.status !== "FAILED") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    payments: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function queryPaymentById(state: DemoStoreState, paymentIdOrId: string) {
  const payment = state.payments.find(
    (p) => p.id === paymentIdOrId || p.paymentId === paymentIdOrId
  );

  if (!payment) return null;

  const customer = state.customers.find((c) => c.id === payment.customerId);
  const recoveryActions = state.recoveryActions.filter(
    (r) => r.paymentId === payment.id
  );
  const agentEvents = state.agentEvents
    .filter((e) => e.paymentId === payment.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const aiAnalysis = customer
    ? RevenueRecoveryAgent.analyze(customer as any, payment as any)
    : null;

  return {
    payment: {
      ...payment,
      customer,
      recoveryActions,
      agentEvents,
    },
    aiAnalysis,
  };
}

export function queryCustomers(
  state: DemoStoreState,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    risk?: string;
  }
) {
  const { page = 1, limit = 15, search = "", risk = "ALL" } = options;

  let filtered = state.customers.map((c) => {
    let riskTier = "LOW";
    if (c.failedPayments >= 2) riskTier = "HIGH";
    else if (c.failedPayments === 1) riskTier = "MEDIUM";
    return { ...c, riskTier };
  });

  if (risk !== "ALL") {
    filtered = filtered.filter((c) => c.riskTier === risk);
  }

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }

  // Sort by LTV descending
  filtered.sort((a, b) => b.lifetimeValue - a.lifetimeValue);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Overall metrics
  const totalCustomers = state.customers.length;
  const highValueCount = state.customers.filter((c) => c.lifetimeValue >= 40000).length;
  const atRiskCount = state.customers.filter((c) => c.failedPayments > 0).length;
  const atRiskRevenue = state.payments
    .filter((p) => p.status === "FAILED")
    .reduce((s, p) => s + p.amount, 0);

  return {
    customers: paginated,
    metrics: {
      totalCustomers,
      highValueCount,
      atRiskCount,
      atRiskRevenue,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function queryCustomerById(state: DemoStoreState, customerId: string) {
  const customer = state.customers.find(
    (c) => c.id === customerId || c.id === `cust_${customerId}`
  );
  if (!customer) return null;

  const payments = state.payments
    .filter((p) => p.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recoveryActions = state.recoveryActions
    .filter((r) => r.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let riskTier = "LOW";
  if (customer.failedPayments >= 2) riskTier = "HIGH";
  else if (customer.failedPayments === 1) riskTier = "MEDIUM";

  return {
    customer: {
      ...customer,
      riskTier,
      payments,
      recoveryActions,
    },
  };
}

export function queryRecoveryData(
  state: DemoStoreState,
  options: {
    page?: number;
    limit?: number;
    strategy?: string;
    status?: string;
  }
) {
  const { page = 1, limit = 15, strategy = "ALL", status = "ALL" } = options;

  let filtered = state.recoveryActions.map((r) => {
    const cust = state.customers.find((c) => c.id === r.customerId);
    const pay = state.payments.find((p) => p.id === r.paymentId);
    return {
      ...r,
      customer: cust || { name: "Customer", email: "cust@example.com" },
      payment: pay || { paymentId: "PAY_UNKNOWN", amount: r.expectedRecovery, method: "UPI" },
    };
  });

  if (strategy !== "ALL") {
    filtered = filtered.filter((r) => r.strategy === strategy);
  }
  if (status !== "ALL") {
    filtered = filtered.filter((r) => r.status === status);
  }

  // Sort by created descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Recovery Metrics
  const metrics = calculateDashboardMetrics(state);

  // Yield by Strategy
  const yieldByStrategy: Record<string, { strategy: string; recovered: number; count: number }> = {};
  state.recoveryActions.forEach((a) => {
    const name = a.strategy.replace(/_/g, " ");
    if (!yieldByStrategy[name]) {
      yieldByStrategy[name] = { strategy: name, recovered: 0, count: 0 };
    }
    yieldByStrategy[name].count += 1;
    if (a.status === "RECOVERED") {
      yieldByStrategy[name].recovered += a.actualRecovery || a.expectedRecovery || 0;
    }
  });

  // Strategy Conversion Rate
  const strategySuccessRate = Object.values(yieldByStrategy).map((s) => ({
    strategy: s.strategy,
    rate: Math.round(
      (state.recoveryActions.filter(
        (a) => a.strategy.replace(/_/g, " ") === s.strategy && a.status === "RECOVERED"
      ).length /
        Math.max(1, s.count)) *
        100
    ),
    recovered: s.recovered,
  }));

  return {
    metrics,
    recoveryYieldByStrategy: Object.values(yieldByStrategy),
    strategySuccessRate,
    actions: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function queryAnalyticsData(state: DemoStoreState, range: "7D" | "30D" | "90D" = "30D") {
  const points = range === "7D" ? 7 : range === "90D" ? 12 : 10;
  const trendPoints = [];
  const baseRecovered = 87400;
  const baseAtRisk = 145200;

  for (let i = 0; i < points; i++) {
    const step = i / Math.max(1, points - 1);
    const day = `Day ${i * (range === "7D" ? 1 : range === "90D" ? 7 : 3) + 1}`;
    const recovered = Math.round(baseRecovered * (0.65 + 0.35 * step));
    const atRisk = Math.round(baseAtRisk * (1.15 - 0.25 * step));
    const rate = Math.round((recovered / (recovered + atRisk * 0.4)) * 100);

    trendPoints.push({
      date: day,
      recovered,
      atRisk,
      rate,
      count: Math.round(15 + step * 25),
    });
  }

  // Failure Reason Distribution
  const reasonCounts: Record<string, number> = {};
  state.payments
    .filter((p) => p.status === "FAILED" || p.status === "RECOVERED")
    .forEach((p) => {
      const r = p.failureReason || "Other";
      reasonCounts[r] = (reasonCounts[r] || 0) + 1;
    });

  const failureReasonDistribution = Object.entries(reasonCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Recovery Strategy Performance
  const recoveryStrategyPerformance = [
    { strategy: "Smart Retry", success: 42, failed: 12, efficiency: 78 },
    { strategy: "Payment Link", success: 38, failed: 18, efficiency: 68 },
    { strategy: "Alt. Method", success: 22, failed: 15, efficiency: 59 },
    { strategy: "Reminder", success: 15, failed: 18, efficiency: 45 },
  ];

  // Customer Value Distribution
  const customerValueDistribution = [
    { tier: "₹50k+ (VIP)", count: state.customers.filter((c) => c.lifetimeValue >= 50000).length },
    {
      tier: "₹25k - ₹50k",
      count: state.customers.filter((c) => c.lifetimeValue >= 25000 && c.lifetimeValue < 50000).length,
    },
    {
      tier: "₹10k - ₹25k",
      count: state.customers.filter((c) => c.lifetimeValue >= 10000 && c.lifetimeValue < 25000).length,
    },
    { tier: "< ₹10k", count: state.customers.filter((c) => c.lifetimeValue < 10000).length },
  ];

  return {
    trendPoints,
    failureReasonDistribution,
    recoveryStrategyPerformance,
    customerValueDistribution,
  };
}

export function queryAgentEvents(state: DemoStoreState, limit = 25) {
  const sorted = [...state.agentEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted.slice(0, limit);
}

// -------------------------------------------------------------
// Mutation: Autonomous Recovery Action Execution
// -------------------------------------------------------------

export function executeStoreRecovery(paymentIdOrId: string) {
  const state = getStoredState();

  const paymentIndex = state.payments.findIndex(
    (p) => p.id === paymentIdOrId || p.paymentId === paymentIdOrId
  );

  if (paymentIndex === -1) {
    throw new Error(`Payment with ID ${paymentIdOrId} not found in store`);
  }

  const payment = state.payments[paymentIndex];
  const customerIndex = state.customers.findIndex((c) => c.id === payment.customerId);
  const customer = customerIndex !== -1 ? state.customers[customerIndex] : null;

  const now = new Date();
  const nowIso = now.toISOString();

  // If already recovered, return early with current status
  if (payment.status === "RECOVERED") {
    return {
      paymentId: payment.paymentId,
      customerName: customer?.name || "Customer",
      amount: payment.amount,
      priority: "HIGH" as PriorityLevel,
      recoveryProbability: 0.95,
      strategy: "SEND_PAYMENT_LINK" as RecoveryStrategy,
      reason: "Payment already successfully recovered.",
      simulatedLink: `https://rzp.io/i/sim_${payment.paymentId.toLowerCase()}`,
      updatedMetrics: calculateDashboardMetrics(state),
    };
  }

  const ai = customer
    ? RevenueRecoveryAgent.analyze(customer as any, payment as any)
    : {
        priority: "HIGH" as PriorityLevel,
        recoveryProbability: 0.87,
        strategy: "SEND_PAYMENT_LINK" as RecoveryStrategy,
        reason: "High customer reliability index.",
        message: "Automated recovery action dispatched.",
        expectedRecovery: payment.amount,
      };

  // 1. Mutate Payment
  state.payments[paymentIndex] = {
    ...payment,
    status: "RECOVERED",
    updatedAt: nowIso,
  };

  // 2. Mutate Customer
  if (customer && customerIndex !== -1) {
    state.customers[customerIndex] = {
      ...customer,
      successfulPayments: customer.successfulPayments + 1,
      failedPayments: Math.max(0, customer.failedPayments - 1),
      lifetimeValue: customer.lifetimeValue + payment.amount,
      updatedAt: nowIso,
    };
  }

  // 3. Create RecoveryAction
  const newAction: RecoveryActionData = {
    id: `rec_act_${Date.now()}`,
    paymentId: payment.id,
    customerId: payment.customerId,
    strategy: ai.strategy,
    priority: ai.priority,
    aiReason: ai.reason,
    message: ai.message,
    expectedRecovery: ai.expectedRecovery || payment.amount,
    actualRecovery: payment.amount,
    status: "RECOVERED",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  state.recoveryActions.unshift(newAction);

  // 4. Create Agent Events
  const newEvents: AgentEventData[] = [
    {
      id: `evt_${Date.now()}_1`,
      paymentId: payment.id,
      eventType: "PAYMENT_DETECTED",
      description: `Failed payment ${payment.paymentId} (${formatINR(payment.amount)}) evaluated.`,
      metadata: JSON.stringify({ amount: payment.amount, method: payment.method }),
      createdAt: new Date(now.getTime() - 4000).toISOString(),
    },
    {
      id: `evt_${Date.now()}_2`,
      paymentId: payment.id,
      eventType: "DECISION",
      description: `Target recovery strategy assigned: ${ai.strategy}. Priority: ${ai.priority}.`,
      metadata: JSON.stringify({ strategy: ai.strategy, priority: ai.priority }),
      createdAt: new Date(now.getTime() - 2000).toISOString(),
    },
    {
      id: `evt_${Date.now()}_3`,
      paymentId: payment.id,
      eventType: "ACTION_EXECUTED",
      description: `Simulated payment recovery link generated: https://rzp.io/i/sim_${payment.paymentId.toLowerCase()}`,
      createdAt: new Date(now.getTime() - 1000).toISOString(),
    },
    {
      id: `evt_${Date.now()}_4`,
      paymentId: payment.id,
      eventType: "RECOVERY_SUCCESS",
      description: `${formatINR(payment.amount)} successfully recovered and ledger synchronized.`,
      metadata: JSON.stringify({ recoveredAmount: payment.amount }),
      createdAt: nowIso,
    },
  ];

  state.agentEvents.unshift(...newEvents);

  // Sync Order if exists
  const order = (state.orders || []).find(
    (o) => o.paymentId === payment.paymentId || o.paymentId === payment.id
  );
  if (order) {
    order.status = "CONFIRMED";
    order.paymentStatus = "RECOVERED";
    order.updatedAt = nowIso;
  }

  // Sync Admin Alert if exists
  const alert = (state.alerts || []).find(
    (a) => a.paymentId === payment.paymentId || a.paymentId === payment.id
  );
  if (alert) {
    alert.type = "PAYMENT_RECOVERED";
    alert.status = "RECOVERED";
    alert.resolvedAt = nowIso;
  }

  // 5. Persist to LocalStorage
  saveStoredState(state);

  const updatedMetrics = calculateDashboardMetrics(state);

  return {
    paymentId: payment.paymentId,
    customerName: customer?.name || "Customer",
    amount: payment.amount,
    priority: ai.priority,
    recoveryProbability: ai.recoveryProbability,
    strategy: ai.strategy,
    reason: ai.reason,
    simulatedLink: `/recovery/${payment.paymentId}`,
    updatedMetrics,
    steps: [
      {
        stage: "DETECTING",
        label: "Payment Detected",
        description: `Failed payment ${payment.paymentId} for ${formatINR(payment.amount)} detected on ${payment.method}.`,
        timestamp: new Date(now.getTime() - 4000).toISOString(),
      },
      {
        stage: "ANALYZING",
        label: "Customer Profiling",
        description: `Customer ${customer?.name || "User"} (${customer?.email || "N/A"}) profile analyzed. 13/14 successful payments.`,
        timestamp: new Date(now.getTime() - 3000).toISOString(),
      },
      {
        stage: "INVESTIGATING",
        label: "Failure Analysis",
        description: `Autopsy on "${payment.failureReason}". Transient failure probability assessed.`,
        timestamp: new Date(now.getTime() - 2000).toISOString(),
      },
      {
        stage: "DECIDING",
        label: "Strategy Selected",
        description: `Selected ${ai.strategy}. Recovery probability: ${(ai.recoveryProbability * 100).toFixed(0)}%.`,
        timestamp: new Date(now.getTime() - 1000).toISOString(),
      },
      {
        stage: "ACTING",
        label: "Dispatched Recovery",
        description: `Simulated recovery link generated: /recovery/${payment.paymentId}`,
        timestamp: new Date(now.getTime() - 500).toISOString(),
      },
      {
        stage: "RECOVERING",
        label: "Revenue Recovered",
        description: `${formatINR(payment.amount)} successfully captured. Local state and ledger reconciled.`,
        timestamp: nowIso,
      },
    ],
  };
}

// -------------------------------------------------------------
// Cart & E-commerce Operations
// -------------------------------------------------------------

export function getStoreCart(): CartItem[] {
  const state = getStoredState();
  return state.cart || [];
}

export function addToStoreCart(product: FurnitureProduct, quantity = 1): CartItem[] {
  const state = getStoredState();
  if (!state.cart) state.cart = [];
  const existingIndex = state.cart.findIndex((item) => item.product.id === product.id);
  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += quantity;
  } else {
    state.cart.push({ product, quantity });
  }
  saveStoredState(state);
  return state.cart;
}

export function removeFromStoreCart(productId: string): CartItem[] {
  const state = getStoredState();
  if (!state.cart) state.cart = [];
  state.cart = state.cart.filter((item) => item.product.id !== productId);
  saveStoredState(state);
  return state.cart;
}

export function updateStoreCartQuantity(productId: string, quantity: number): CartItem[] {
  const state = getStoredState();
  if (!state.cart) state.cart = [];
  if (quantity <= 0) {
    state.cart = state.cart.filter((item) => item.product.id !== productId);
  } else {
    const item = state.cart.find((i) => i.product.id === productId);
    if (item) item.quantity = quantity;
  }
  saveStoredState(state);
  return state.cart;
}

export function clearStoreCart(): void {
  const state = getStoredState();
  state.cart = [];
  saveStoredState(state);
}

// -------------------------------------------------------------
// Orders & Checkout Operations
// -------------------------------------------------------------

export function getStoreOrders(): OrderData[] {
  const state = getStoredState();
  return state.orders || [];
}

export function getOrderById(orderIdOrPaymentId: string): OrderData | null {
  const state = getStoredState();
  const cleanId = orderIdOrPaymentId.trim().toUpperCase();

  const found = (state.orders || []).find(
    (o) =>
      o.id === orderIdOrPaymentId ||
      o.orderId.toUpperCase() === cleanId ||
      o.paymentId.toUpperCase() === cleanId ||
      o.orderId.toUpperCase() === `RA${cleanId.replace(/^RA/, "")}` ||
      o.paymentId.toUpperCase() === `PAY${cleanId.replace(/^PAY/, "")}`
  );
  if (found) return found;

  if (cleanId.includes("98231")) {
    const sofa = FURNITURE_PRODUCTS[0];
    const flagship: OrderData = {
      id: "ord_ra_98231",
      orderId: "RA98231",
      paymentId: "PAY98231",
      customerId: "cust_rahul",
      customerName: "Rahul Sharma",
      customerEmail: "rahul.sharma@gmail.com",
      customerPhone: "+91 98201 45892",
      shippingAddress: "Flat 402, Lotus Heights, 12th Main, Indiranagar, Bengaluru - 560038",
      items: [
        {
          productId: sofa.id,
          productName: sofa.name,
          productPrice: sofa.price,
          quantity: 1,
          image: sofa.image,
        },
      ],
      totalAmount: 32999,
      status: "PAYMENT_PENDING",
      paymentStatus: "FAILED",
      paymentMethod: "UPI",
      failureReason: "Insufficient Funds",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return flagship;
  }

  return null;
}

export function processCheckout(params: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  simulateFailure: boolean;
  productId?: string;
}) {
  const state = getStoredState();
  const now = new Date();
  const nowIso = now.toISOString();

  const isFlagshipSofa =
    !params.productId ||
    params.productId === "prod_sofa_01" ||
    (state.cart && state.cart.some((c) => c.product.id === "prod_sofa_01"));

  const customerName = params.customerName || "Rahul Sharma";
  const customerEmail = params.customerEmail || "rahul.sharma@gmail.com";
  const customerPhone = params.customerPhone || "+91 98201 45892";
  const shippingAddress =
    params.shippingAddress ||
    "Flat 402, Lotus Heights, 12th Main, Indiranagar, Bengaluru - 560038";
  const paymentMethod = params.paymentMethod || "UPI";

  let items = (state.cart || []).map((c) => ({
    productId: c.product.id,
    productName: c.product.name,
    productPrice: c.product.price,
    quantity: c.quantity,
    image: c.product.image,
  }));

  if (items.length === 0) {
    const sofa = FURNITURE_PRODUCTS[0];
    items = [
      {
        productId: sofa.id,
        productName: sofa.name,
        productPrice: sofa.price,
        quantity: 1,
        image: sofa.image,
      },
    ];
  }

  const totalAmount = items.reduce((acc, i) => acc + i.productPrice * i.quantity, 0);

  if (params.simulateFailure) {
    const paymentId = isFlagshipSofa ? "PAY98231" : `PAY${Math.floor(10000 + Math.random() * 89999)}`;
    const orderId = isFlagshipSofa ? "RA98231" : `RA${paymentId.replace("PAY", "")}`;
    const failureReason = "Insufficient Funds";

    const existingPayIdx = state.payments.findIndex(
      (p) => p.paymentId === paymentId || (isFlagshipSofa && p.paymentId === "PAY98231")
    );

    const paymentRecord: PaymentData = {
      id: existingPayIdx > -1 ? state.payments[existingPayIdx].id : `pay_${paymentId.toLowerCase()}`,
      paymentId,
      customerId: "cust_rahul",
      amount: totalAmount,
      currency: "INR",
      status: "FAILED",
      method: paymentMethod as any,
      failureReason,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (existingPayIdx > -1) {
      state.payments[existingPayIdx] = paymentRecord;
    } else {
      state.payments.unshift(paymentRecord);
    }

    const existingOrderIdx = (state.orders || []).findIndex(
      (o) => o.orderId === orderId || (isFlagshipSofa && o.orderId === "RA98231")
    );

    const orderRecord: OrderData = {
      id: existingOrderIdx > -1 ? state.orders[existingOrderIdx].id : `ord_${orderId.toLowerCase()}`,
      orderId,
      paymentId,
      customerId: "cust_rahul",
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      status: "PAYMENT_PENDING",
      paymentStatus: "FAILED",
      paymentMethod,
      failureReason,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (!state.orders) state.orders = [];
    if (existingOrderIdx > -1) {
      state.orders[existingOrderIdx] = orderRecord;
    } else {
      state.orders.unshift(orderRecord);
    }

    const existingAlertIdx = (state.alerts || []).findIndex(
      (a) => a.paymentId === paymentId || (isFlagshipSofa && a.paymentId === "PAY98231")
    );

    const alertRecord: AdminAlert = {
      id: existingAlertIdx > -1 ? state.alerts[existingAlertIdx].id : `alert_${orderId.toLowerCase()}`,
      type: "PAYMENT_FAILED",
      paymentId,
      orderId,
      customerName,
      customerEmail,
      productName: items[0]?.productName || "Modern 3-Seater Sofa",
      amount: totalAmount,
      method: paymentMethod,
      failureReason,
      recoveryProbability: 0.87,
      priority: "HIGH",
      strategy: "SEND_PAYMENT_LINK",
      status: "UNRESOLVED",
      createdAt: nowIso,
    };

    if (!state.alerts) state.alerts = [];
    if (existingAlertIdx > -1) {
      state.alerts[existingAlertIdx] = alertRecord;
    } else {
      state.alerts.unshift(alertRecord);
    }

    state.agentEvents.unshift({
      id: `evt_fail_${Date.now()}`,
      paymentId: paymentRecord.id,
      eventType: "PAYMENT_DETECTED",
      description: `New payment failure ${paymentId} detected: ${formatINR(totalAmount)} on ${paymentMethod} (${failureReason}). Order #${orderId}.`,
      metadata: JSON.stringify({ amount: totalAmount, failureReason, orderId }),
      createdAt: nowIso,
    });

    saveStoredState(state);

    return {
      success: false,
      order: orderRecord,
      payment: paymentRecord,
      alert: alertRecord,
    };
  } else {
    const paymentId = `PAY${Math.floor(20000 + Math.random() * 79999)}`;
    const orderId = `RA${paymentId.replace("PAY", "")}`;

    const paymentRecord: PaymentData = {
      id: `pay_${paymentId.toLowerCase()}`,
      paymentId,
      customerId: "cust_rahul",
      amount: totalAmount,
      currency: "INR",
      status: "SUCCESS",
      method: paymentMethod as any,
      failureReason: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    state.payments.unshift(paymentRecord);

    const orderRecord: OrderData = {
      id: `ord_${orderId.toLowerCase()}`,
      orderId,
      paymentId,
      customerId: "cust_rahul",
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      status: "CONFIRMED",
      paymentStatus: "SUCCESS",
      paymentMethod,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    if (!state.orders) state.orders = [];
    state.orders.unshift(orderRecord);

    state.cart = [];
    saveStoredState(state);

    return {
      success: true,
      order: orderRecord,
      payment: paymentRecord,
    };
  }
}

// -------------------------------------------------------------
// Admin Alerts & Interactive Recovery Operations
// -------------------------------------------------------------

export function getStoreAlerts(): AdminAlert[] {
  const state = getStoredState();
  return state.alerts || [];
}

export function initiateRecoveryAction(paymentIdOrId: string) {
  const state = getStoredState();
  const cleanId = paymentIdOrId.trim();
  const pay = state.payments.find((p) => p.id === cleanId || p.paymentId === cleanId);
  if (!pay) throw new Error(`Payment ${paymentIdOrId} not found`);

  const now = new Date();
  const nowIso = now.toISOString();

  let action = state.recoveryActions.find((r) => r.paymentId === pay.id);
  if (!action) {
    action = {
      id: `rec_act_${Date.now()}`,
      paymentId: pay.id,
      customerId: pay.customerId,
      strategy: "SEND_PAYMENT_LINK",
      priority: "HIGH",
      aiReason: "Customer has 13/14 successful payments and high LTV. Transience-high failure.",
      message: "Simulated recovery notification generated.",
      expectedRecovery: pay.amount,
      actualRecovery: null,
      status: "EXECUTED",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    state.recoveryActions.unshift(action);
  }

  const alert = (state.alerts || []).find((a) => a.paymentId === pay.paymentId || a.paymentId === pay.id);
  if (alert) {
    alert.status = "WAITING_CUSTOMER";
  }

  state.agentEvents.unshift({
    id: `evt_init_${Date.now()}`,
    paymentId: pay.id,
    eventType: "ACTION_EXECUTED",
    description: `Recovery initiated for ${pay.paymentId}. Simulated recovery notification generated. Recovery link: /recovery/${pay.paymentId}`,
    metadata: JSON.stringify({ strategy: "SEND_PAYMENT_LINK", link: `/recovery/${pay.paymentId}` }),
    createdAt: nowIso,
  });

  saveStoredState(state);

  return {
    paymentId: pay.paymentId,
    amount: pay.amount,
    customerName: "Rahul Sharma",
    strategy: "SEND_PAYMENT_LINK",
    status: "WAITING_CUSTOMER",
    recoveryUrl: `/recovery/${pay.paymentId}`,
    message: "Simulated recovery notification generated.",
  };
}

export function saveRazorpayLinkData(
  paymentIdOrId: string,
  linkData: {
    linkId: string;
    shortUrl: string;
    mode: "live" | "test" | "simulation";
    referenceId?: string;
    originalAmount?: number;
    testPaymentAmount?: number;
  }
) {
  const state = getStoredState();
  const cleanId = paymentIdOrId.trim();
  const pay = state.payments.find((p) => p.id === cleanId || p.paymentId === cleanId);
  if (pay) {
    pay.razorpayLinkId = linkData.linkId;
    pay.razorpayShortUrl = linkData.shortUrl;
    pay.razorpayMode = linkData.mode;
    pay.originalAmount = linkData.originalAmount ?? pay.amount;
    pay.testPaymentAmount = linkData.testPaymentAmount ?? pay.amount;
  }
  const action = state.recoveryActions.find(
    (r) => r.paymentId === pay?.id || r.paymentId === cleanId
  );
  if (action) {
    (action as any).razorpayLinkId = linkData.linkId;
    (action as any).razorpayShortUrl = linkData.shortUrl;
    (action as any).razorpayMode = linkData.mode;
    (action as any).testPaymentAmount = linkData.testPaymentAmount;
  }
  saveStoredState(state);
}

export function completeCustomerRecovery(paymentIdOrId: string) {
  const state = getStoredState();
  const cleanId = paymentIdOrId.trim();
  const payIdx = state.payments.findIndex(
    (p) => p.id === cleanId || p.paymentId === cleanId
  );
  if (payIdx === -1) throw new Error(`Payment ${paymentIdOrId} not found`);

  const pay = state.payments[payIdx];
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Mark Payment RECOVERED
  state.payments[payIdx] = {
    ...pay,
    status: "RECOVERED",
    updatedAt: nowIso,
  };

  // 2. Customer Update
  const custIdx = state.customers.findIndex((c) => c.id === pay.customerId);
  if (custIdx > -1) {
    const cust = state.customers[custIdx];
    state.customers[custIdx] = {
      ...cust,
      successfulPayments: cust.successfulPayments + 1,
      failedPayments: Math.max(0, cust.failedPayments - 1),
      lifetimeValue: cust.lifetimeValue + pay.amount,
      updatedAt: nowIso,
    };
  }

  // 3. Recovery Action Update
  const recAct = state.recoveryActions.find((r) => r.paymentId === pay.id);
  if (recAct) {
    recAct.status = "RECOVERED";
    recAct.actualRecovery = pay.amount;
    recAct.updatedAt = nowIso;
  } else {
    state.recoveryActions.unshift({
      id: `rec_act_${Date.now()}`,
      paymentId: pay.id,
      customerId: pay.customerId,
      strategy: "SEND_PAYMENT_LINK",
      priority: "HIGH",
      aiReason: "High lifetime value customer with temporary failure.",
      message: "Customer completed payment recovery link.",
      expectedRecovery: pay.amount,
      actualRecovery: pay.amount,
      status: "RECOVERED",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  // 4. Update Order
  const order = (state.orders || []).find(
    (o) => o.paymentId === pay.paymentId || o.paymentId === pay.id
  );
  if (order) {
    order.status = "CONFIRMED";
    order.paymentStatus = "RECOVERED";
    order.updatedAt = nowIso;
  }

  // 5. Update Admin Alert
  const alert = (state.alerts || []).find(
    (a) => a.paymentId === pay.paymentId || a.paymentId === pay.id
  );
  if (alert) {
    alert.type = "PAYMENT_RECOVERED";
    alert.status = "RECOVERED";
    alert.resolvedAt = nowIso;
  }

  // 6. Log Agent Event
  state.agentEvents.unshift({
    id: `evt_rec_${Date.now()}`,
    paymentId: pay.id,
    eventType: "RECOVERY_SUCCESS",
    description: `Payment ${pay.paymentId} recovered! ₹${pay.amount.toLocaleString("en-IN")} confirmed. Order #${order?.orderId || "RA98231"} confirmed. Shipping timeline initiated.`,
    metadata: JSON.stringify({ recoveredAmount: pay.amount, orderId: order?.orderId }),
    createdAt: nowIso,
  });

  saveStoredState(state);

  return {
    success: true,
    paymentId: pay.paymentId,
    orderId: order?.orderId || "RA98231",
    recoveredAmount: pay.amount,
    customerName: custIdx > -1 ? state.customers[custIdx].name : "Rahul Sharma",
    updatedMetrics: calculateDashboardMetrics(state),
  };
}

export function verifyPaymentIssue(paymentIdOrId: string): boolean {
  const state = getStoredState();
  const cleanId = paymentIdOrId.trim();
  const pay = state.payments.find((p) => p.id === cleanId || p.paymentId === cleanId);
  if (!pay) return false;

  pay.isVerified = true;
  saveStoredState(state);
  return true;
}
