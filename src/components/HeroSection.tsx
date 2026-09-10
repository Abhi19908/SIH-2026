"use client";

import { motion } from "framer-motion";
import { Shield, ArrowDown, Mic, Fingerprint, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* ── ambient background ── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.04] blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[80px]" />
      </div>

      {/* ── grid overlay ── */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── floating icons ── */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[18%] left-[12%] text-cyan-500/20"
      >
        <Mic size={32} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[25%] right-[15%] text-emerald-500/20"
      >
        <Fingerprint size={36} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[30%] left-[18%] text-indigo-500/20"
      >
        <Waves size={28} />
      </motion.div>

      {/* ── badge ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm text-xs tracking-widest uppercase text-slate-400"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        SIH 2026 &middot; Voice Forensics Intelligence
      </motion.div>

      {/* ── waveform hero graphic ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="flex items-center gap-[2px] h-16">
          {Array.from({ length: 60 }).map((_, i) => {
            const h = Math.abs(Math.sin(i * 0.25)) * 100;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.015, ease: "easeOut" }}
                className={cn(
                  "w-[3px] rounded-full",
                  i < 20 ? "bg-emerald-500/60" : i < 40 ? "bg-cyan-500/60" : "bg-indigo-500/60"
                )}
              />
            );
          })}
        </div>
      </motion.div>

      {/* ── shield icon ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-6"
      >
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/10">
          <Shield size={40} className="text-cyan-400" />
          <div className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.1)]" />
        </div>
      </motion.div>

      {/* ── headline ── */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
      >
        <span className="text-white">Detect</span>{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Voice Cloning
        </span>{" "}
        <br className="hidden sm:block" />
        <span className="text-white">in Seconds</span>
      </motion.h1>

      {/* ── subtitle ── */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-5 max-w-2xl text-center text-base sm:text-lg text-slate-400 leading-relaxed"
      >
        AI-powered speech forensic analysis that identifies cloned, synthetic, and
        deepfake audio with explainable confidence scoring. Protect against voice
        fraud with military-grade detection.
      </motion.p>

      {/* ── trust indicators ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-500"
      >
        {[
          "98.7% Detection Accuracy",
          "6 Analysis Dimensions",
          "Real-Time Processing",
          "Explainable AI",
        ].map((t) => (
          <span key={t} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.04] bg-white/[0.02]">
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            {t}
          </span>
        ))}
      </motion.div>

      {/* ── CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="mt-10 flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={onGetStarted}
          className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm tracking-wide transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Shield size={16} />
            Analyze Voice
          </span>
        </button>
        <button className="px-8 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-slate-300 text-sm font-medium hover:bg-white/[0.05] transition-all">
          Learn How It Works
        </button>
      </motion.div>

      {/* ── scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ArrowDown size={20} className="text-slate-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}
