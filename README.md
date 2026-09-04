# RecoverAI 🚀
### Autonomous AI Revenue Recovery Agent
**Built for the Razorpay AI Builder Internship 2026**

> *"RecoverAI doesn't just tell merchants that revenue was lost. It investigates failed payments, determines which customers are most likely to recover, chooses the best recovery strategy, executes the recovery workflow, and measures recovered revenue."*

---

## 🌟 Executive Summary

In online commerce and recurring payments, merchant revenue loss frequently occurs due to transient payment failures:
- **Insufficient Funds** (temporary liquidity timing)
- **Card Declines** (issuer-side security triggers)
- **Payment Timeouts & Network Drops**
- **Bank Server Outages**
- **Two-Factor Authentication Drop-offs**

**RecoverAI** transforms passive payment error monitoring into an active, autonomous revenue recovery engine. It continuously detects failed transactions, analyzes customer lifetime value and payment reliability, calculates recovery probabilities, determines the optimal recovery intervention (e.g., smart retry, simulated payment recovery link, or alternative method suggestion), simulates autonomous execution, and updates merchant financial metrics in real-time.

---

## 🛡️ Phase 1 Architecture & Zero-Credential Guarantee

This project is built specifically as a **Phase 1 Hackathon Prototype**:
- **Zero External Credentials Required**: No Razorpay API keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are required to run or evaluate the system.
- **Zero External LLM Keys Required**: The AI recovery agent operates using deterministic, multi-factor scoring algorithms that run locally.
- **Sandboxed `MockRazorpayService`**: All payment links and retry operations are cleanly abstracted behind an interface (`IRazorpayService`), ensuring no real payments, emails, SMS, or WhatsApp messages are sent.
- **Database Architecture**: Powered by Prisma ORM connected directly to Supabase PostgreSQL (Next.js → Backend/API → Prisma ORM → Supabase PostgreSQL).

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), Custom Fintech Design System, Glassmorphism |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Data Visualizations** | [Recharts](https://recharts.org/) |
| **Backend API** | Next.js App Router Server Endpoints (`/api/*`) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) + Supabase PostgreSQL |
| **AI Decision Engine** | Deterministic Multi-Factor Heuristic Recovery Agent |
| **Payment Layer** | `MockRazorpayService` (Compliant with official Razorpay API contract) |

---

## 📂 Project Architecture

```
d:/CODE FILES/Razorpay/
├── prisma/
│   ├── schema.prisma                  # Customer, Payment, RecoveryAction, AgentEvent models (PostgreSQL)
│   └── seed.ts                        # Seed script (500 customers, 1500 payments, 238 failed)
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with Sidebar, Header, SimulationModal
│   │   ├── page.tsx                   # Redirect to /dashboard
│   │   ├── globals.css                # Fintech dark theme, glow tokens, custom scrollbars
│   │   ├── dashboard/page.tsx         # Executive Dashboard (KPIs, AI Insight, Recharts, Top Opportunities)
│   │   ├── payments/
│   │   │   ├── page.tsx               # Failed Payments data table with multi-criteria filters
│   │   │   └── [id]/page.tsx          # Forensic Payment Autopsy & AI Scoring Breakdown
│   │   ├── recovery/page.tsx          # Revenue Recovery metrics, strategy yield, actions ledger
│   │   ├── agent/page.tsx             # Flagship AI Agent Command Center & Interactive Simulator
│   │   ├── customers/
│   │   │   ├── page.tsx               # 500-customer intelligence directory & risk segmentation
│   │   │   └── [id]/page.tsx          # Customer profile, LTV history, and recovery actions
│   │   ├── analytics/page.tsx         # 6 deep-dive charts with 7D/30D/90D time-range filters
│   │   ├── settings/page.tsx          # Integration status, sandbox boundary, and roadmap
│   │   └── api/
│   │       ├── dashboard/route.ts     # Dashboard KPIs and top opportunities
│   │       ├── payments/
│   │       │   ├── route.ts           # Payment search, filters, pagination, and AI scoring
│   │       │   └── [id]/route.ts      # Payment details with customer and history
│   │       ├── customers/
│   │       │   ├── route.ts           # Customer search, risk filters, and cohort stats
│   │       │   └── [id]/route.ts      # Customer profile and transaction history
│   │       ├── recovery/
│   │       │   ├── route.ts           # Recovery actions ledger and strategy stats
│   │       │   ├── analyze/route.ts   # On-demand AI scoring endpoint
│   │       │   └── simulate/route.ts  # Autonomous 6-stage simulation execution endpoint
│   │       ├── agent/
│   │       │   ├── events/route.ts    # Agent audit trail and activity events
│   │       │   └── run/route.ts       # Autonomous agent dispatch
│   │       └── analytics/route.ts     # Chart-ready time-series and distribution aggregates
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Navigation sidebar with active state and agent pulse
│   │   │   └── Header.tsx             # Header navbar with Demo Mode badge and quick actions
│   │   ├── dashboard/
│   │   │   ├── KpiCards.tsx           # Total Revenue, Risk, Recovered, Rate, Failed
│   │   │   ├── AiInsightCard.tsx      # Glowing AI opportunity highlight banner
│   │   │   ├── RevenueCharts.tsx      # Recharts visualizations (Area, Line, Bar, Pie)
│   │   │   └── OpportunitiesTable.tsx # Top recovery targets with one-click simulation
│   │   ├── agent/
│   │   │   └── SimulationModal.tsx    # Interactive 6-stage animated simulation modal
│   │   └── ui/
│   │       └── ToastNotification.tsx  # Dynamic toast alert on recovery completion
│   ├── context/
│   │   └── SimulationContext.tsx      # Global simulation state, timer orchestration, and refetch bus
│   ├── lib/
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── types.ts                   # Unified TypeScript domain definitions
│   │   └── utils.ts                   # INR currency formatting (₹24.8L, ₹8,999), badges, styling
│   ├── services/
│   │   ├── revenueRecoveryAgent.ts    # Multi-factor AI decision engine and simulation workflow
│   │   └── razorpay/
│   │       ├── types.ts               # Razorpay API contract interfaces
│   │       ├── mockRazorpayService.ts # Sandboxed mock implementation
│   │       └── index.ts               # Service export
│   └── mock-data/
│       └── indianNames.ts             # Authentic Indian names, failure causes, and methods
├── .env                               # Environment config (DATABASE_URL for Supabase PostgreSQL)
├── .env.example                       # Configuration template
├── package.json
└── README.md
```

---

## 🗄️ Database Schema (Prisma ORM)

The database schema models the entire revenue recovery lifecycle:

- **`Customer`**: Identity, email, phone, `lifetimeValue`, `totalPayments`, `successfulPayments`, `failedPayments`, `preferredPaymentMethod`.
- **`Payment`**: `paymentId` (e.g. `PAY98231`), `amount`, `currency`, `status` (`SUCCESS`, `FAILED`, `RECOVERED`), `method` (`UPI`, `Card`, `Netbanking`, `Wallet`), `failureReason`.
- **`RecoveryAction`**: Strategy chosen, priority level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `aiReason`, `expectedRecovery`, `actualRecovery`, `status` (`RECOVERED`, `EXECUTED`, `PENDING`).
- **`AgentEvent`**: Chronological audit trail of autonomous actions (`PAYMENT_DETECTED`, `CUSTOMER_ANALYSIS`, `HISTORY_FOUND`, `VALUE_ANALYSIS`, `FAILURE_ANALYSIS`, `DECISION`, `STRATEGY_SELECTED`, `ACTION_EXECUTED`, `RECOVERY_SUCCESS`).

### Supabase PostgreSQL Database Architecture
RecoverAI uses Supabase PostgreSQL for all persistence:
```
Next.js → Backend/API → Prisma ORM → Supabase PostgreSQL
```
1. Datasource is configured for PostgreSQL (`provider = "postgresql"`).
2. Connected via `DATABASE_URL` pointing to Supabase PostgreSQL.
3. Run `npx prisma db push` to synchronize schema or `npm run seed` to seed.

---

## 🤖 AI Agent Workflow & Decision Heuristics

The agent follows an autonomous 6-step loop:

```
DETECT → ANALYZE → INVESTIGATE → DECIDE → ACT → RECOVER
```

### 1. Multi-Factor Scoring Formula
$$\text{Recovery Probability} = 0.25 \cdot S_{\text{LTV}} + 0.30 \cdot S_{\text{History}} + 0.25 \cdot S_{\text{Transience}} + 0.15 \cdot S_{\text{Repeat}} + 0.05 \cdot S_{\text{Recency}}$$

- **Customer Value Score ($S_{\text{LTV}}$)**: Evaluates merchant lifetime value ($>₹50,000 \rightarrow 0.95$, $>₹25,000 \rightarrow 0.85$, etc.).
- **Payment History Score ($S_{\text{History}}$)**: Success ratio weighted by total completed orders.
- **Transience Score ($S_{\text{Transience}}$)**:
  - `Timeout` / `Network Error`: $0.88 - 0.91$ (Highly transient)
  - `Bank Server Error`: $0.85$ (Transient gateway issue)
  - `Insufficient Funds`: $0.82$ (Temporary liquidity issue)
  - `Authentication Failed`: $0.72$ (Session drop-off)
  - `Card Declined`: $0.65$ (Bank decline)

### 2. Strategy Selection Heuristic
- **`SEND_PAYMENT_LINK`**: High LTV customer with high historical reliability experiencing transient drop-off.
- **`RETRY_PAYMENT`**: Network timeouts or transient bank server errors.
- **`SUGGEST_ALTERNATIVE_METHOD`**: Preferred method differs from failed attempt (e.g. usually pays UPI, failed on Card).
- **`SEND_PERSONALIZED_REMINDER`**: First-time customer experiencing initial payment failure.
- **`HUMAN_REVIEW`**: $>3$ consecutive failures requiring merchant operations review.

---

## 📊 Calibrated Baseline Metrics

Seeded with realistic data representing an active Indian merchant:
- **Total Revenue**: **₹24.8L** (~₹24,80,000)
- **Revenue at Risk**: **₹1.45L** (~₹1,45,200 across 238 failed payments)
- **Revenue Recovered**: **₹87.4K** (~₹87,400 across 117 successful recoveries)
- **Recovery Rate**: **60.2%** (117 recoveries / 194 attempts)
- **Active Failed Payments**: **238**
- **Demo Cohort**: Exactly **500 customers** and **1,500 total payments**

### Flagship Demo Case
- **Customer**: **Rahul Sharma** (`rahul.sharma@gmail.com`)
- **Failed Payment**: **PAY98231** — **₹8,999** (UPI / Insufficient Funds)
- **Past History**: 13 successful transactions / 14 total
- **Lifetime Value**: **₹82,450**
- **AI Priority**: **HIGH**
- **Recovery Probability**: **87%**
- **Recommended Action**: **SEND PAYMENT LINK**

---

## 🎬 Step-by-Step Demo Flow

Follow this flow for the hackathon evaluation:

1. **Open Dashboard (`/dashboard`)**:
   - Verify KPI cards: Total Revenue (**₹24.8L**), Revenue at Risk (**₹1.45L**), Revenue Recovered (**₹87.4K**), Recovery Rate (**60.2%**), Failed Payments (**238**).
   - Observe the **AI Insight Card** highlighting ₹1.45L at risk and 117 high-probability opportunities.
2. **Navigate to Failed Payments (`/payments`)**:
   - Look up **Rahul Sharma** (`PAY98231`, ₹8,999, Insufficient Funds, 87% Probability, HIGH Priority).
   - Click **Details** to view the forensic payment autopsy.
3. **Inspect Payment Details (`/payments/[id]`)**:
   - Review the customer profile (LTV: ₹82,450, 13 successful transactions).
   - Examine the AI factor breakdown showing 87% probability and strategy `SEND_PAYMENT_LINK`.
4. **Trigger Autonomous Simulation**:
   - Click **SIMULATE RECOVERY** (or **RUN SIMULATION** in the top header or Agent page).
   - Watch the animated 6-stage progress timeline:
     - Stage 1: `DETECTING` — Intercepting gateway failure telemetry.
     - Stage 2: `ANALYZING` — Evaluating Rahul Sharma's profile.
     - Stage 3: `INVESTIGATING` — 13 successful payments found; LTV ₹82,450.
     - Stage 4: `DECIDING` — 87% recovery probability calculated; strategy selected.
     - Stage 5: `ACTING` — Generated simulated payment recovery link (`https://rzp.io/i/sim_...`).
     - Stage 6: `RECOVERING` — Customer completed checkout; ₹8,999 recovered!
5. **Observe Real-Time Dashboard Updates**:
   - Celebration confetti triggers.
   - Toast notification displays: *"₹8,999 revenue successfully recovered."*
   - Dashboard metrics automatically update:
     - Revenue Recovered increases: **₹87,400 → ₹96,399**
     - Revenue at Risk decreases: **₹1,45,200 → ₹1,36,201**
     - Recovery Rate increases dynamically!
6. **Explore AI Agent Command Center (`/agent`)**:
   - Review the live streaming **Agent Decision Log**, telemetry latency, and audit trail.

---

## 🛠️ Local Setup & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (v20+ recommended)
- `npm` v9 or higher

### 1. Clone & Install
```bash
git clone <repository-url>
cd Razorpay
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (or use default created automatically):
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
PORT=3000
```
*(No Razorpay credentials required)*

### 3. Database Initialization & Seeding
```bash
# Push schema to Supabase PostgreSQL database
npx prisma db push

# Seed 500 customers, 1500 payments, and 238 failed payments
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🔌 Phase 2: Live Razorpay Integration Roadmap

When transitioning from Phase 1 to Phase 2 production:
1. **Swap the Implementation**:
   Replace `MockRazorpayService` in `src/services/razorpay/index.ts` with the official Razorpay Node.js SDK:
   ```typescript
   import Razorpay from "razorpay";
   // initialize with process.env.RAZORPAY_KEY_ID & process.env.RAZORPAY_KEY_SECRET
   ```
2. **Listen to Webhooks**:
   Deploy an endpoint at `/api/webhooks/razorpay` to listen for:
   - `payment.failed` $\rightarrow$ Triggers `RevenueRecoveryAgent.analyze`
   - `payment.captured` $\rightarrow$ Marks payment and recovery action as `RECOVERED`
3. **Switch to Cloud PostgreSQL**:
   Update `datasource db` in `prisma/schema.prisma` to `postgresql`.

---

## 📄 License & Attribution

Built for the **Razorpay AI Builder Internship 2026** by the RecoverAI team.
All rights reserved.
