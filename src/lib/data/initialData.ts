import {
  CustomerData,
  PaymentData,
  RecoveryActionData,
  AgentEventData,
} from "../types";
import { FIRST_NAMES, LAST_NAMES, PAYMENT_METHODS, FAILURE_REASONS } from "../../mock-data/indianNames";

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

export const FURNITURE_PRODUCTS: FurnitureProduct[] = [
  {
    id: "prod_sofa_01",
    name: "Modern 3-Seater Sofa",
    price: 32999,
    originalPrice: 39999,
    description: "Architectural modern 3-seater sofa crafted with high-density resilient foam, pocket-spring support, and stain-resistant Belgian woven fabric in Slate Grey.",
    category: "Living Room",
    rating: 4.8,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    dimensions: '84" W x 36" D x 34" H',
    material: "Kiln-dried Teak & Belgian Linen",
    inStock: true,
    featured: true,
  },
  {
    id: "prod_bed_02",
    name: "King Size Bed",
    price: 45999,
    originalPrice: 54999,
    description: "Solid Sheesham wood king bed featuring an acoustic upholstered headboard in Charcoal Velvet and hydraulic storage compartments.",
    category: "Bedroom",
    rating: 4.9,
    reviewsCount: 96,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    dimensions: '78" W x 82" L x 48" H',
    material: "Solid Indian Sheesham Wood",
    inStock: true,
    featured: true,
  },
  {
    id: "prod_dining_03",
    name: "Premium Dining Table Set",
    price: 28499,
    originalPrice: 34999,
    description: "6-seater solid oak dining table set with cushioned ergonomic chairs and matte scratch-resistant finish for family gatherings.",
    category: "Dining Room",
    rating: 4.7,
    reviewsCount: 68,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    dimensions: '60" L x 36" W x 30" H',
    material: "European White Oak",
    inStock: true,
    featured: true,
  },
  {
    id: "prod_wardrobe_04",
    name: "Designer Wardrobe",
    price: 36999,
    originalPrice: 42999,
    description: "Spacious 3-door engineered wood wardrobe with soft-close German hinges, integrated full-length vanity mirror, and customizable drawer organizers.",
    category: "Storage",
    rating: 4.6,
    reviewsCount: 52,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
    dimensions: '48" W x 22" D x 78" H',
    material: "Engineered Hardwood & Brushed Brass",
    inStock: true,
  },
  {
    id: "prod_chair_05",
    name: "Lounge Chair",
    price: 12999,
    originalPrice: 16999,
    description: "Ergonomic mid-century modern accent armchair with brushed champagne gold legs and plush high-resilience foam cushioning.",
    category: "Living Room",
    rating: 4.9,
    reviewsCount: 84,
    image: "https://images.unsplash.com/photo-1580481077194-c78203c9eb02?auto=format&fit=crop&w=800&q=80",
    dimensions: '32" W x 30" D x 33" H',
    material: "Cotton Velvet & Steel Legs",
    inStock: true,
  },
  {
    id: "prod_desk_06",
    name: "Premium Study Table",
    price: 14999,
    originalPrice: 18999,
    description: "Minimalist executive home office desk with dual wire-routing grommets and two discreet push-to-open stationery drawers.",
    category: "Home Office",
    rating: 4.8,
    reviewsCount: 61,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    dimensions: '48" W x 24" D x 30" H',
    material: "Solid Acacia Wood & Matte Black Metal",
    inStock: true,
  },
];

export interface DemoStoreState {
  customers: CustomerData[];
  payments: PaymentData[];
  recoveryActions: RecoveryActionData[];
  agentEvents: AgentEventData[];
  orders: OrderData[];
  alerts: AdminAlert[];
  cart: CartItem[];
  lastUpdated: string;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateInitialDemoData(): DemoStoreState {
  const rng = mulberry32(1337);
  const getRand = () => rng();
  const getInt = (min: number, max: number) =>
    Math.floor(getRand() * (max - min + 1)) + min;
  const getElem = <T>(arr: readonly T[] | T[]): T =>
    arr[Math.floor(getRand() * arr.length)];

  const customers: CustomerData[] = [];
  const payments: PaymentData[] = [];
  const recoveryActions: RecoveryActionData[] = [];
  const agentEvents: AgentEventData[] = [];
  const orders: OrderData[] = [];
  const alerts: AdminAlert[] = [];

  const baseTime = new Date("2026-09-04T10:00:00.000Z");

  // 1. Flagship Customer: Rahul Sharma
  const rahul: CustomerData = {
    id: "cust_rahul",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98201 45892",
    lifetimeValue: 82450.0,
    totalPayments: 14,
    successfulPayments: 13,
    failedPayments: 1,
    preferredPaymentMethod: "UPI",
    createdAt: new Date(baseTime.getTime() - 150 * 86400000).toISOString(),
    updatedAt: baseTime.toISOString(),
  };
  customers.push(rahul);

  // Flagship Failed Payment for Rahul Sharma: PAY98231 for Modern 3-Seater Sofa (₹32,999)
  const payRahul: PaymentData = {
    id: "pay_rahul_flagship",
    paymentId: "PAY98231",
    customerId: rahul.id,
    amount: 32999.0,
    currency: "INR",
    status: "FAILED",
    method: "UPI",
    failureReason: "Insufficient Funds",
    createdAt: new Date(baseTime.getTime() - 2 * 3600000).toISOString(),
    updatedAt: new Date(baseTime.getTime() - 2 * 3600000).toISOString(),
  };
  payments.push(payRahul);

  // Initial Flagship Order for Rahul Sharma
  const orderRahul: OrderData = {
    id: "ord_ra_98231",
    orderId: "RA98231",
    paymentId: "PAY98231",
    customerId: rahul.id,
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@gmail.com",
    customerPhone: "+91 98201 45892",
    shippingAddress: "Flat 402, Lotus Heights, 12th Main, Indiranagar, Bengaluru - 560038",
    items: [
      {
        productId: "prod_sofa_01",
        productName: "Modern 3-Seater Sofa",
        productPrice: 32999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      },
    ],
    totalAmount: 32999,
    status: "PAYMENT_PENDING",
    paymentStatus: "FAILED",
    paymentMethod: "UPI",
    failureReason: "Insufficient Funds",
    createdAt: new Date(baseTime.getTime() - 2 * 3600000).toISOString(),
    updatedAt: new Date(baseTime.getTime() - 2 * 3600000).toISOString(),
  };
  orders.push(orderRahul);

  // Initial Flagship Admin Alert
  const alertRahul: AdminAlert = {
    id: "alert_ra_98231",
    type: "PAYMENT_FAILED",
    paymentId: "PAY98231",
    orderId: "RA98231",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@gmail.com",
    productName: "Modern 3-Seater Sofa",
    amount: 32999,
    method: "UPI",
    failureReason: "Insufficient Funds",
    recoveryProbability: 0.87,
    priority: "HIGH",
    strategy: "SEND_PAYMENT_LINK",
    status: "UNRESOLVED",
    createdAt: new Date(baseTime.getTime() - 2 * 3600000).toISOString(),
  };
  alerts.push(alertRahul);

  // 13 past successful payments for Rahul Sharma
  const pastAmounts = [
    4500, 6200, 8999, 12000, 5400, 3999, 7800, 4200, 9500, 6800, 5200, 3852, 4000,
  ];
  pastAmounts.forEach((amt, idx) => {
    payments.push({
      id: `pay_rahul_hist_${idx + 1}`,
      paymentId: `PAY_RS_HIST_${idx + 1}`,
      customerId: rahul.id,
      amount: amt,
      currency: "INR",
      status: "SUCCESS",
      method: "UPI",
      failureReason: null,
      createdAt: new Date(baseTime.getTime() - (150 - idx * 10) * 86400000).toISOString(),
      updatedAt: new Date(baseTime.getTime() - (150 - idx * 10) * 86400000).toISOString(),
    });
  });

  // 2. Highlight Customer: Priya Reddy
  const priya: CustomerData = {
    id: "cust_priya",
    name: "Priya Reddy",
    email: "priya.reddy@yahoo.co.in",
    phone: "+91 97112 84920",
    lifetimeValue: 36500.0,
    totalPayments: 6,
    successfulPayments: 5,
    failedPayments: 1,
    preferredPaymentMethod: "Card",
    createdAt: new Date(baseTime.getTime() - 90 * 86400000).toISOString(),
    updatedAt: baseTime.toISOString(),
  };
  customers.push(priya);

  const payPriya: PaymentData = {
    id: "pay_priya_flagship",
    paymentId: "PAY98232",
    customerId: priya.id,
    amount: 4500.0,
    currency: "INR",
    status: "FAILED",
    method: "Card",
    failureReason: "Card Declined",
    createdAt: new Date(baseTime.getTime() - 3.5 * 3600000).toISOString(),
    updatedAt: new Date(baseTime.getTime() - 3.5 * 3600000).toISOString(),
  };
  payments.push(payPriya);

  // 3. Highlight Customer: Arjun Kumar
  const arjun: CustomerData = {
    id: "cust_arjun",
    name: "Arjun Kumar",
    email: "arjun.kumar@outlook.com",
    phone: "+91 98330 11928",
    lifetimeValue: 94000.0,
    totalPayments: 9,
    successfulPayments: 8,
    failedPayments: 1,
    preferredPaymentMethod: "UPI",
    createdAt: new Date(baseTime.getTime() - 110 * 86400000).toISOString(),
    updatedAt: baseTime.toISOString(),
  };
  customers.push(arjun);

  const payArjun: PaymentData = {
    id: "pay_arjun_flagship",
    paymentId: "PAY98233",
    customerId: arjun.id,
    amount: 19999.0,
    currency: "INR",
    status: "FAILED",
    method: "Netbanking",
    failureReason: "Timeout",
    createdAt: new Date(baseTime.getTime() - 1.5 * 3600000).toISOString(),
    updatedAt: new Date(baseTime.getTime() - 1.5 * 3600000).toISOString(),
  };
  payments.push(payArjun);

  // 4. Remaining Customers (Total exactly 500 customers)
  for (let i = 4; i <= 500; i++) {
    const fn = getElem(FIRST_NAMES);
    const ln = getElem(LAST_NAMES);
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    const phone = `+91 ${getInt(90000, 99999)} ${getInt(10000, 99999)}`;
    const method = getElem(PAYMENT_METHODS);

    const isHighValue = getRand() < 0.15;
    const ltv = isHighValue ? getInt(45000, 150000) : getInt(1200, 32000);
    const totalP = isHighValue ? getInt(8, 25) : getInt(1, 7);
    const successP = Math.max(0, totalP - (getRand() < 0.3 ? 1 : 0));
    const failedP = totalP - successP;

    customers.push({
      id: `cust_${i}`,
      name,
      email,
      phone,
      lifetimeValue: ltv,
      totalPayments: totalP,
      successfulPayments: successP,
      failedPayments: failedP,
      preferredPaymentMethod: method,
      createdAt: new Date(baseTime.getTime() - getInt(10, 180) * 86400000).toISOString(),
      updatedAt: baseTime.toISOString(),
    });
  }

  // 5. Remaining Failed Payments (Total exactly 238 failed)
  // Target sum = 145,200 (1.45L)
  const targetFailedTotal = 145200;
  const knownFailed = payRahul.amount + payPriya.amount + payArjun.amount; // 32,999 + 4,500 + 19,999 = 57,498
  const remainingFailed = 238 - 3; // 235
  const targetRemFailed = Math.max(0, targetFailedTotal - knownFailed); // 87,702

  let curFailed = 0;
  const failedAmts: number[] = [];
  for (let i = 0; i < remainingFailed - 1; i++) {
    const amt = Math.floor(targetRemFailed / remainingFailed) + ((i % 11) - 5) * 8;
    failedAmts.push(amt);
    curFailed += amt;
  }
  failedAmts.push(Math.max(199, targetRemFailed - curFailed));

  const createdFailedPayments: PaymentData[] = [payRahul, payPriya, payArjun];

  for (let i = 0; i < remainingFailed; i++) {
    const cust = customers[3 + (i % (customers.length - 3))];
    const method = getElem(PAYMENT_METHODS);
    const failureReason = getElem(FAILURE_REASONS);
    const hoursAgo = (i / remainingFailed) * 14 * 24 + getInt(1, 23);

    const pay: PaymentData = {
      id: `pay_f_${10000 + i}`,
      paymentId: `PAY_F_${10000 + i}`,
      customerId: cust.id,
      amount: failedAmts[i],
      currency: "INR",
      status: "FAILED",
      method,
      failureReason,
      createdAt: new Date(baseTime.getTime() - hoursAgo * 3600000).toISOString(),
      updatedAt: new Date(baseTime.getTime() - hoursAgo * 3600000).toISOString(),
    };
    payments.push(pay);
    createdFailedPayments.push(pay);
  }

  // 6. Remaining Success Payments (Total 1500 payments: 1262 SUCCESS + 238 FAILED)
  // Target total revenue = 2,480,000 (24.8L)
  const targetSuccessTotal = 2480000;
  const rahulPastSum = pastAmounts.reduce((a, b) => a + b, 0); // 77,450
  const remainingSuccess = 1500 - 238 - pastAmounts.length; // 1249
  const targetRemSuccess = targetSuccessTotal - rahulPastSum;

  let curSuccess = 0;
  const successAmts: number[] = [];
  for (let i = 0; i < remainingSuccess - 1; i++) {
    const amt = Math.floor(targetRemSuccess / remainingSuccess) + ((i % 23) - 11) * 30;
    successAmts.push(amt);
    curSuccess += amt;
  }
  successAmts.push(targetRemSuccess - curSuccess);

  for (let i = 0; i < remainingSuccess; i++) {
    const cust = customers[i % customers.length];
    const method = getElem(PAYMENT_METHODS);
    const daysAgo = (i / remainingSuccess) * 90;

    payments.push({
      id: `pay_s_${20000 + i}`,
      paymentId: `PAY_S_${20000 + i}`,
      customerId: cust.id,
      amount: successAmts[i],
      currency: "INR",
      status: "SUCCESS",
      method,
      failureReason: null,
      createdAt: new Date(baseTime.getTime() - daysAgo * 86400000).toISOString(),
      updatedAt: new Date(baseTime.getTime() - daysAgo * 86400000).toISOString(),
    });
  }

  // 7. Recovery Actions (194 attempts, exactly 117 RECOVERED summing to ₹87,400)
  const targetRecoveredSum = 87400;
  const recoveredCount = 117;
  const unrecoveredCount = 194 - 117; // 77

  const recoveredAmounts: number[] = [];
  let curRecSum = 0;
  for (let i = 0; i < recoveredCount - 1; i++) {
    const amt = getInt(350, 1150);
    recoveredAmounts.push(amt);
    curRecSum += amt;
  }
  recoveredAmounts.push(Math.max(200, targetRecoveredSum - curRecSum));

  const STRATEGIES = [
    "SEND_PAYMENT_LINK",
    "RETRY_PAYMENT",
    "SUGGEST_ALTERNATIVE_METHOD",
    "SEND_PERSONALIZED_REMINDER",
  ] as const;

  for (let i = 0; i < recoveredCount; i++) {
    const cust = customers[(i * 3) % customers.length];
    const payment = createdFailedPayments[i % createdFailedPayments.length];
    const strategy = getElem(STRATEGIES);
    const amount = recoveredAmounts[i];

    recoveryActions.push({
      id: `rec_act_${i + 1}`,
      paymentId: payment.id,
      customerId: cust.id,
      strategy,
      priority: "HIGH",
      aiReason: "High lifetime value customer with temporary failure.",
      message: "Automated recovery action dispatched.",
      expectedRecovery: amount,
      actualRecovery: amount,
      status: "RECOVERED",
      createdAt: new Date(baseTime.getTime() - getInt(1, 14) * 86400000).toISOString(),
      updatedAt: new Date(baseTime.getTime() - getInt(1, 14) * 86400000).toISOString(),
    });
  }

  for (let i = 0; i < unrecoveredCount; i++) {
    const cust = customers[(i * 5) % customers.length];
    const payment = createdFailedPayments[(i + recoveredCount) % createdFailedPayments.length];
    const strategy = getElem(STRATEGIES);

    recoveryActions.push({
      id: `rec_act_${recoveredCount + i + 1}`,
      paymentId: payment.id,
      customerId: cust.id,
      strategy,
      priority: getRand() < 0.5 ? "MEDIUM" : "LOW",
      aiReason: "Algorithmic recovery initiated; awaiting customer completion.",
      message: "Recovery notification dispatched.",
      expectedRecovery: payment.amount,
      actualRecovery: null,
      status: getRand() < 0.7 ? "EXECUTED" : "PENDING",
      createdAt: new Date(baseTime.getTime() - getInt(1, 5) * 86400000).toISOString(),
      updatedAt: new Date(baseTime.getTime() - getInt(1, 5) * 86400000).toISOString(),
    });
  }

  // 8. Seed Initial Agent Events (Audit Log)
  agentEvents.push(
    {
      id: "evt_1",
      paymentId: payRahul.id,
      eventType: "PAYMENT_DETECTED",
      description: "Failed payment PAY98231 for ₹32,999 detected on UPI gateway (Order #RA98231).",
      metadata: JSON.stringify({ amount: 32999, method: "UPI", orderId: "RA98231" }),
      createdAt: new Date(baseTime.getTime() - 35 * 60000).toISOString(),
    },
    {
      id: "evt_2",
      paymentId: payRahul.id,
      eventType: "CUSTOMER_ANALYSIS",
      description: "Customer history analyzed for Rahul Sharma. LTV: ₹82,450 verified.",
      metadata: JSON.stringify({ customerId: rahul.id }),
      createdAt: new Date(baseTime.getTime() - 34 * 60000).toISOString(),
    },
    {
      id: "evt_3",
      paymentId: payRahul.id,
      eventType: "HISTORY_FOUND",
      description: "Customer has 13 successful past transactions with 93% reliability.",
      metadata: JSON.stringify({ successfulPayments: 13 }),
      createdAt: new Date(baseTime.getTime() - 33 * 60000).toISOString(),
    },
    {
      id: "evt_4",
      paymentId: payRahul.id,
      eventType: "VALUE_ANALYSIS",
      description: "Customer lifetime value: ₹82,450. High-Value Merchant Tier.",
      metadata: JSON.stringify({ ltv: 82450 }),
      createdAt: new Date(baseTime.getTime() - 32 * 60000).toISOString(),
    },
    {
      id: "evt_5",
      paymentId: payRahul.id,
      eventType: "FAILURE_ANALYSIS",
      description: 'Failure classified as transience-high: "Insufficient Funds".',
      createdAt: new Date(baseTime.getTime() - 31 * 60000).toISOString(),
    },
    {
      id: "evt_6",
      paymentId: payRahul.id,
      eventType: "DECISION",
      description: "Calculated recovery probability: 87%. Priority: HIGH.",
      metadata: JSON.stringify({ probability: 0.87 }),
      createdAt: new Date(baseTime.getTime() - 30 * 60000).toISOString(),
    },
    {
      id: "evt_7",
      paymentId: payRahul.id,
      eventType: "STRATEGY_SELECTED",
      description: "Recommended SEND_PAYMENT_LINK strategy via WhatsApp & SMS notification.",
      createdAt: new Date(baseTime.getTime() - 29 * 60000).toISOString(),
    }
  );

  // Default initial cart: Modern 3-Seater Sofa
  const cart: CartItem[] = [
    {
      product: FURNITURE_PRODUCTS[0],
      quantity: 1,
    },
  ];

  return {
    customers,
    payments,
    recoveryActions,
    agentEvents,
    orders,
    alerts,
    cart,
    lastUpdated: baseTime.toISOString(),
  };
}
