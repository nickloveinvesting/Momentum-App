/**
 * Root Layout for Momentum App
 * Includes global styles, fonts, and navigation
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentum - Expand Your Comfort Zone",
  description: "Action creates clarity. Small wins build identity. One challenge at a time.",
  keywords: ["personal growth", "challenges", "habits", "self-improvement"],
  authors: [{ name: "Momentum App" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
