import type { Metadata } from "next";
import "./globals.css";
import { DemoDataProvider } from "@/context/DemoDataContext";
import { SimulationProvider } from "@/context/SimulationContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Slander's Furniture Store | Handcrafted Luxury Living",
  description:
    "Timeless solid wood furniture crafted for modern Indian homes. Pan-India white-glove delivery.",
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
            <CustomerAuthProvider>
              <AppShell>{children}</AppShell>
            </CustomerAuthProvider>
          </SimulationProvider>
        </DemoDataProvider>
      </body>
    </html>
  );
}
