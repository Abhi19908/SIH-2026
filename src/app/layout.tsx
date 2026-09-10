import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxGuard — AI Voice-Cloning Detection & Forensic Intelligence",
  description:
    "Security-grade AI speech forensic analysis to detect cloned, synthetic, and deepfake audio. Built for Smart India Hackathon 2026 (SIH26104).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e]">{children}</body>
    </html>
  );
}
