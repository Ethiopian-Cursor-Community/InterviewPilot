import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterviewPilot — AI Interview Practice",
  description:
    "Practice interviews with Captain. AI-powered voice and text interviews with real-time feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="bg-mesh antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
