import type { Metadata } from "next";
import "./globals.css";
import { DemoDataProvider } from "@/context/DemoDataContext";
import { SimulationProvider } from "@/context/SimulationContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "RecoverAI Furniture & Autonomous Revenue Recovery Agent",
  description:
    "Autonomous AI revenue recovery platform and bespoke furniture e-commerce store with real-time Razorpay integration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased">
        <DemoDataProvider>
          <SimulationProvider>
            <AppShell>{children}</AppShell>
          </SimulationProvider>
        </DemoDataProvider>
      </body>
    </html>
  );
}
