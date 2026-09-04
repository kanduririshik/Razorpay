export type PaymentMethod = "UPI" | "Card" | "Netbanking" | "Wallet";

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "RECOVERED";

export type FailureReason =
  | "Insufficient Funds"
  | "Card Declined"
  | "Timeout"
  | "Network Error"
  | "Bank Server Error"
  | "Authentication Failed";

export type RecoveryStrategy =
  | "RETRY_PAYMENT"
  | "SEND_PAYMENT_LINK"
  | "SUGGEST_ALTERNATIVE_METHOD"
  | "SEND_PERSONALIZED_REMINDER"
  | "HUMAN_REVIEW";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RecoveryStatus = "PENDING" | "EXECUTED" | "RECOVERED" | "FAILED";

export type AgentEventType =
  | "PAYMENT_DETECTED"
  | "CUSTOMER_ANALYSIS"
  | "HISTORY_FOUND"
  | "VALUE_ANALYSIS"
  | "FAILURE_ANALYSIS"
  | "DECISION"
  | "STRATEGY_SELECTED"
  | "ACTION_EXECUTED"
  | "RECOVERY_SUCCESS"
  | "RECOVERY_FAILED";

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  lifetimeValue: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  preferredPaymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentData {
  id: string;
  paymentId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  failureReason: FailureReason | null;
  createdAt: string;
  updatedAt: string;
  razorpayLinkId?: string;
  razorpayShortUrl?: string;
  razorpayMode?: "live" | "test" | "simulation";
  originalAmount?: number;
  testPaymentAmount?: number;
  customer?: CustomerData;
  recoveryActions?: RecoveryActionData[];
  agentEvents?: AgentEventData[];
}

export interface RecoveryActionData {
  id: string;
  paymentId: string;
  customerId: string;
  strategy: RecoveryStrategy;
  priority: PriorityLevel;
  aiReason: string;
  message: string;
  expectedRecovery: number;
  actualRecovery: number | null;
  status: RecoveryStatus;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerData;
  payment?: PaymentData;
}

export interface AgentEventData {
  id: string;
  paymentId: string;
  eventType: AgentEventType;
  description: string;
  metadata?: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  revenueAtRisk: number;
  revenueRecovered: number;
  failedPayments: number;
  recoveryAttempts: number;
  successfulRecoveries: number;
  recoveryRate: number;
  // Dynamic delta from recent recovery
  lastSimulatedRecovery?: {
    customerName: string;
    amount: number;
    paymentId: string;
    strategy: string;
    timestamp: string;
  };
}

export interface AIAnalysisResult {
  priority: PriorityLevel;
  recoveryProbability: number;
  strategy: RecoveryStrategy;
  reason: string;
  expectedRecovery: number;
  message: string;
  scoreBreakdown?: {
    customerValueScore: number;
    paymentHistoryScore: number;
    failureScore: number;
    repeatCustomerScore: number;
    recentActivityScore: number;
  };
}

export interface SimulationStep {
  stage: "DETECTING" | "ANALYZING" | "INVESTIGATING" | "DECIDING" | "ACTING" | "RECOVERING";
  label: string;
  description: string;
  detail?: string;
  timestamp: string;
  status: "pending" | "active" | "completed";
}

export interface FurnitureProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  category: "Living Room" | "Bedroom" | "Dining Room" | "Storage" | "Home Office";
  rating: number;
  reviewsCount: number;
  image: string;
  dimensions: string;
  material: string;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: FurnitureProduct;
  quantity: number;
}

export interface OrderData {
  id: string;
  orderId: string; // e.g. "RA98231"
  paymentId: string; // e.g. "PAY98231"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: {
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  status: "PAYMENT_PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED";
  paymentStatus: "PENDING" | "FAILED" | "RECOVERED" | "SUCCESS";
  paymentMethod: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAlert {
  id: string;
  type: "PAYMENT_FAILED" | "PAYMENT_RECOVERED" | "INFO";
  paymentId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  method: string;
  failureReason: string;
  recoveryProbability: number;
  priority: string;
  strategy: string;
  status: "UNRESOLVED" | "RECOVERED" | "WAITING_CUSTOMER";
  createdAt: string;
  resolvedAt?: string;
}
