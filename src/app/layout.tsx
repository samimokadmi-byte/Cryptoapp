import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoTrend · Multi-Timeframe Analysis",
  description: "Institutional-grade crypto trend confluence dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface">{children}</body>
    </html>
  );
}
