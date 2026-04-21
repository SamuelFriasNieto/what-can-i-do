import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "What Can I Do?",
  description: "Discover the best activities and experiences near you, powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
