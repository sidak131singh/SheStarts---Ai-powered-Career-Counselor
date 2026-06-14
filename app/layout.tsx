import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SheStarts Career Compass — AI Career Counseling for Women Returners",
  description: "AI-powered career counseling for women restarting their careers after a break. Get personalized recommendations, 30/60/90-day roadmaps, and a Career Readiness Score.",
  keywords: "career restart, women returning to work, career break, AI counselor, career planning, HR jobs, remote work India",
  authors: [{ name: "SheStarts" }],
  openGraph: {
    title: "SheStarts Career Compass",
    description: "Your AI-powered career counselor for restarting after a break",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
