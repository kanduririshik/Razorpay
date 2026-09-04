import { PrismaClient } from "@prisma/client";
import { FIRST_NAMES, LAST_NAMES, PAYMENT_METHODS, FAILURE_REASONS, getRandomElement, getRandomInt } from "../src/mock-data/indianNames";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting RecoverAI database seeding...");

  // 1. Clean existing records
  await prisma.agentEvent.deleteMany();
  await prisma.recoveryAction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customer.deleteMany();

  console.log("Cleared existing data.");

  // Target figures:
  // Customers: exactly 500
  // Payments: exactly 1500
  // Failed Payments: exactly 238
  // Total Revenue: ~₹24.8L (₹2,480,000)
  // Revenue at Risk: ~₹1.45L (₹145,200)
  // Revenue Recovered: ~₹87.4K (₹87,400)
  // Recovery Attempts: 190 (or 194)
  // Successful Recoveries: 117
  // Recovery Rate: 60.2%

  // 2. Create Flagship Customer: Rahul Sharma
  const rahul = await prisma.customer.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      phone: "+91 98201 45892",
      lifetimeValue: 82450.0,
      totalPayments: 14,
      successfulPayments: 13,
      failedPayments: 1,
      preferredPaymentMethod: "UPI",
    },
  });

  // Flagship Failed Payment for Rahul Sharma
  await prisma.payment.create({
    data: {
      paymentId: "PAY98231",
      customerId: rahul.id,
      amount: 8999.0,
      currency: "INR",
      status: "FAILED",
      method: "UPI",
      failureReason: "Insufficient Funds",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  // 13 past successful payments for Rahul Sharma
  const pastAmounts = [4500, 6200, 8999, 12000, 5400, 3999, 7800, 4200, 9500, 6800, 5200, 3852, 4000];
  for (let i = 0; i < pastAmounts.length; i++) {
    await prisma.payment.create({
      data: {
        paymentId: `PAY_RS_HIST_${i + 1}`,
        customerId: rahul.id,
        amount: pastAmounts[i],
        currency: "INR",
        status: "SUCCESS",
        method: "UPI",
        createdAt: new Date(Date.now() - (150 - i * 10) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 3. Create Highlight Customer: Priya Reddy
  const priya = await prisma.customer.create({
    data: {
      name: "Priya Reddy",
      email: "priya.reddy@yahoo.co.in",
      phone: "+91 97112 84920",
      lifetimeValue: 36500.0,
      totalPayments: 6,
      successfulPayments: 5,
      failedPayments: 1,
      preferredPaymentMethod: "Card",
    },
  });

  await prisma.payment.create({
    data: {
      paymentId: "PAY98232",
      customerId: priya.id,
      amount: 4500.0,
      currency: "INR",
      status: "FAILED",
      method: "Card",
      failureReason: "Card Declined",
      createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    },
  });

  // 4. Create Highlight Customer: Arjun Kumar
  const arjun = await prisma.customer.create({
    data: {
      name: "Arjun Kumar",
      email: "arjun.kumar@outlook.com",
      phone: "+91 98330 11928",
      lifetimeValue: 94000.0,
      totalPayments: 9,
      successfulPayments: 8,
      failedPayments: 1,
      preferredPaymentMethod: "UPI",
    },
  });

  await prisma.payment.create({
    data: {
      paymentId: "PAY98233",
      customerId: arjun.id,
      amount: 19999.0,
      currency: "INR",
      status: "FAILED",
      method: "Netbanking",
      failureReason: "Timeout",
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
  });

  // 5. Create Remaining 497 Customers (Total 500)
  const createdCustomers = [rahul, priya, arjun];
  const usedEmails = new Set<string>([rahul.email, priya.email, arjun.email]);

  for (let i = 4; i <= 500; i++) {
    const fn = getRandomElement(FIRST_NAMES);
    const ln = getRandomElement(LAST_NAMES);
    const name = `${fn} ${ln}`;
    let email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    while (usedEmails.has(email)) {
      email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}_${getRandomInt(10, 999)}@example.com`;
    }
    usedEmails.add(email);

    const phone = `+91 ${getRandomInt(90000, 99999)} ${getRandomInt(10000, 99999)}`;
    const preferredMethod = getRandomElement(PAYMENT_METHODS);

    // Some high value, some medium, some new
    const isHighValue = Math.random() < 0.15;
    const ltv = isHighValue ? getRandomInt(45000, 150000) : getRandomInt(1200, 32000);
    const totalP = isHighValue ? getRandomInt(8, 25) : getRandomInt(1, 7);
    const successP = Math.max(0, totalP - (Math.random() < 0.3 ? 1 : 0));
    const failedP = totalP - successP;

    const cust = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        lifetimeValue: ltv,
        totalPayments: totalP,
        successfulPayments: successP,
        failedPayments: failedP,
        preferredPaymentMethod: preferredMethod,
        createdAt: new Date(Date.now() - getRandomInt(10, 180) * 24 * 60 * 60 * 1000),
      },
    });

    createdCustomers.push(cust);
  }

  console.log(`Created ${createdCustomers.length} customers.`);

  // 6. Failed Payments Allocation:
  // Total failed payments must be exactly 238.
  // We already created 3 failed payments (Rahul: 8999, Priya: 4500, Arjun: 19999 = 33,498).
  // Remaining failed payments: 238 - 3 = 235 failed payments.
  // Remaining failed revenue target: 145,200 - 33,498 = 111,702.
  // Target average = 111,702 / 235 = ~475.3 per failed payment.
  const remainingFailedCount = 235;
  const targetRemainingFailedSum = 111702;
  const failedAmounts: number[] = [];

  let currentFailedSum = 0;
  for (let i = 0; i < remainingFailedCount - 1; i++) {
    // Generate realistic payment failure amounts (between ₹199 and ₹1299)
    const baseAmt = getRandomInt(249, 799);
    failedAmounts.push(baseAmt);
    currentFailedSum += baseAmt;
  }
  // The last amount balances to exactly reach the ₹145,200 total!
  const lastFailedAmt = Math.max(199, targetRemainingFailedSum - currentFailedSum);
  failedAmounts.push(lastFailedAmt);

  const createdFailedPayments: any[] = [];

  for (let i = 0; i < remainingFailedCount; i++) {
    // Pick customer (from index 3 onwards)
    const cust = createdCustomers[(i % (createdCustomers.length - 3)) + 3];
    const method = getRandomElement(PAYMENT_METHODS);
    const failureReason = getRandomElement(FAILURE_REASONS);
    const daysAgo = (i / remainingFailedCount) * 14; // spread over last 14 days
    const hoursAgo = daysAgo * 24 + getRandomInt(1, 23);

    const payment = await prisma.payment.create({
      data: {
        paymentId: `PAY_F_${10000 + i}`,
        customerId: cust.id,
        amount: failedAmounts[i],
        currency: "INR",
        status: "FAILED",
        method,
        failureReason,
        createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      },
    });

    createdFailedPayments.push(payment);
  }

  console.log(`Created ${createdFailedPayments.length + 3} failed payments (Total: 238).`);

  // 7. Successful Payments Allocation:
  // Total payments needed = 1500
  // Already created: 13 (Rahul past) + 3 (Rahul, Priya, Arjun failed) + 235 (remaining failed) = 251 payments.
  // Need remaining successful payments: 1500 - 251 = 1249 payments.
  // Target total revenue = ₹2,480,000 (₹24.8L).
  // Rahul's 13 past payments sum = 75,700.
  // Remaining sum for successful payments: 2,480,000 - 75,700 = 2,404,300.
  // Average per successful payment = 2,404,300 / 1249 = ~1,925.
  const remainingSuccessCount = 1249;
  const targetSuccessSum = 2404300;
  let currentSuccessSum = 0;
  const successAmounts: number[] = [];

  for (let i = 0; i < remainingSuccessCount - 1; i++) {
    const amt = getRandomInt(499, 3499);
    successAmounts.push(amt);
    currentSuccessSum += amt;
  }
  const lastSuccessAmt = Math.max(499, targetSuccessSum - currentSuccessSum);
  successAmounts.push(lastSuccessAmt);

  for (let i = 0; i < remainingSuccessCount; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const method = getRandomElement(PAYMENT_METHODS);
    const daysAgo = (i / remainingSuccessCount) * 90; // spread over last 90 days

    await prisma.payment.create({
      data: {
        paymentId: `PAY_S_${20000 + i}`,
        customerId: cust.id,
        amount: successAmounts[i],
        currency: "INR",
        status: "SUCCESS",
        method,
        failureReason: null,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`Seeded exactly 1500 total payments (1262 SUCCESS + 238 FAILED).`);

  // 8. Seed Recovery Actions:
  // Recovery Attempts: 190
  // Successful Recoveries: 117
  // Revenue Recovered: ₹87,400 (~87.4K)
  // Recovery Rate: 117 / 194.3 ≈ 60.2%
  // Let's create 194 recovery action attempts with 117 marked RECOVERED summing to ₹87,400!
  const targetRecoveredSum = 87400;
  const recoveredCount = 117;
  const unrecoveredCount = 194 - 117; // 77 attempts (executed / pending / failed)

  const recoveredAmounts: number[] = [];
  let curRecSum = 0;
  for (let i = 0; i < recoveredCount - 1; i++) {
    const amt = getRandomInt(350, 1150);
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
    const cust = createdCustomers[(i * 3) % createdCustomers.length];
    const payment = createdFailedPayments[i % createdFailedPayments.length];
    const strategy = getRandomElement(STRATEGIES);
    const amount = recoveredAmounts[i];

    await prisma.recoveryAction.create({
      data: {
        paymentId: payment.id,
        customerId: cust.id,
        strategy,
        priority: "HIGH",
        aiReason: "High lifetime value customer with temporary failure.",
        message: "Automated recovery action dispatched.",
        expectedRecovery: amount,
        actualRecovery: amount,
        status: "RECOVERED",
        createdAt: new Date(Date.now() - getRandomInt(1, 14) * 24 * 60 * 60 * 1000),
      },
    });
  }

  for (let i = 0; i < unrecoveredCount; i++) {
    const cust = createdCustomers[(i * 5) % createdCustomers.length];
    const payment = createdFailedPayments[(i + recoveredCount) % createdFailedPayments.length];
    const strategy = getRandomElement(STRATEGIES);

    await prisma.recoveryAction.create({
      data: {
        paymentId: payment.id,
        customerId: cust.id,
        strategy,
        priority: Math.random() < 0.5 ? "MEDIUM" : "LOW",
        aiReason: "Algorithmic recovery initiated; awaiting customer completion.",
        message: "Recovery notification dispatched.",
        expectedRecovery: payment.amount,
        actualRecovery: null,
        status: Math.random() < 0.7 ? "EXECUTED" : "PENDING",
        createdAt: new Date(Date.now() - getRandomInt(1, 5) * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`Created 194 Recovery Actions (117 Successful Recoveries = 60.2% Recovery Rate).`);

  // 9. Seed Initial Agent Events (Audit Log)
  const initialEvents = [
    {
      paymentId: createdFailedPayments[0].id,
      eventType: "PAYMENT_DETECTED",
      description: "Failed payment detected on UPI gateway.",
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
    },
    {
      paymentId: createdFailedPayments[0].id,
      eventType: "CUSTOMER_ANALYSIS",
      description: "Customer history analyzed. LTV threshold verified.",
      createdAt: new Date(Date.now() - 34 * 60 * 1000),
    },
    {
      paymentId: createdFailedPayments[0].id,
      eventType: "DECISION",
      description: "Calculated recovery probability 82%. Priority: HIGH.",
      createdAt: new Date(Date.now() - 33 * 60 * 1000),
    },
    {
      paymentId: createdFailedPayments[0].id,
      eventType: "ACTION_EXECUTED",
      description: "Generated simulated payment recovery link and dispatched reminder.",
      createdAt: new Date(Date.now() - 32 * 60 * 1000),
    },
    {
      paymentId: createdFailedPayments[1].id,
      eventType: "RECOVERY_SUCCESS",
      description: "₹1,249 successfully recovered through smart retry.",
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  for (const ev of initialEvents) {
    await prisma.agentEvent.create({
      data: ev,
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
