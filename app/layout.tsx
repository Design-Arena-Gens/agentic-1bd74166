import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Management System - TMS",
  description: "A psychological prosthetic for discretionary traders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
