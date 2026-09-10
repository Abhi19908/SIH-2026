"use client";

import { motion } from "framer-motion";
import {
  Shield,
  ArrowDown,
  Sparkles,
  Zap,
  Cpu,
  FileCheck,
  Radio,
  Play,
} from "lucide-react";
import { playSound } from "@/lib/soundFx";

interface HeroSectionProps {
  onGetStarted: () => void;
  onQuickBenchmark?: () => void;
  onOpenArchitecture?: () => void;
}

export default function HeroSection({
  onGetStarted,
  onQuickBenchmark,
  onOpenArchitecture,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-16">
      {/* ── High-Tech Ambient Backdrop ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-cyan-500/[0.07] blur-[140px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[400px] rounded-full bg-blue-600/[0.05] blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[350px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
      </div>

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 -z-10 cyber-grid opacity-60 pointer-events-none" />

      {/* Top SIH 2026 Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="font-bold tracking-wider uppercase">SIH 2026 Problem SIH26104</span>
        <span className="text-cyan-500/60">&bull;</span>
        <span className="text-slate-300">Voice-Cloning Detection System</span>
      </motion.div>

      {/* Central High-Tech Shield Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative mb-6"
      >
        <div className="relative p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-cyan-500/20 via-slate-900/80 to-slate-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
          <Shield size={44} className="text-cyan-400" />
          <div className="absolute -inset-1 rounded-3xl border border-cyan-500/20 animate-pulse-ring pointer-events-none" />
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl"
      >
        <span className="text-white">Real-Time Forensic</span>{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
          Speech Deepfake
        </span>{" "}
        <br className="hidden sm:block" />
        <span className="text-white">Detection &amp; Defense Engine</span>
      </motion.h1>

      {/* Subtitle & Value Proposition */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 max-w-3xl text-center text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
      >
        Engineered for <span className="text-cyan-300 font-semibold">Smart India Hackathon 2026</span>.
        Deploys client-side <span className="text-white font-semibold">Radix-2 FFT DSP</span>,
        Wiener spectral entropy, vocal shimmer, and vocoder harmonic brickwall analysis to expose
        zero-shot AI voice synthesis, voice cloning, and audio impersonation in <span className="text-cyan-300 font-semibold">&lt;200ms</span>.
      </motion.p>

      {/* Animated Soundwave Frequency Spectrum Graphic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="my-8 flex items-center justify-center gap-1 sm:gap-1.5 h-12 px-6 py-2 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md"
      >
        <span className="text-[10px] font-mono text-cyan-400 mr-2 flex items-center gap-1 uppercase tracking-widest">
          <Radio size={12} className="animate-pulse text-cyan-400" /> FFT DSP
        </span>
        {Array.from({ length: 36 }).map((_, i) => {
          const h = 20 + Math.abs(Math.sin(i * 0.35)) * 75;
          return (
            <motion.div
              key={i}
              initial={{ height: "20%" }}
              animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`] }}
              transition={{
                duration: 1.2 + (i % 5) * 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="w-[3px] sm:w-[4px] rounded-full bg-gradient-to-t from-cyan-500 via-blue-400 to-emerald-400"
            />
          );
        })}
        <span className="text-[10px] font-mono text-slate-400 ml-2">22.05 kHz</span>
      </motion.div>

      {/* Key Architectural Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 text-xs font-mono text-slate-300 max-w-4xl"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] text-cyan-300">
          <Zap size={13} className="text-cyan-400" />
          <span>98.7% Accuracy (EER 1.24%)</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300">
          <Cpu size={13} className="text-emerald-400" />
          <span>Radix-2 FFT + Wiener Entropy</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] text-blue-300">
          <FileCheck size={13} className="text-blue-400" />
          <span>Judicial SHA-256 Certificate</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-3.5"
      >
        <button
          onClick={() => {
            playSound.scan();
            onGetStarted();
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          <span>Launch Forensic Audit</span>
        </button>

        {onQuickBenchmark && (
          <button
            onClick={() => {
              playSound.click();
              onQuickBenchmark();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-cyan-500/40 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Play size={13} className="text-cyan-400 fill-cyan-400" />
            <span>1-Click Judge Testbench</span>
          </button>
        )}

        {onOpenArchitecture && (
          <button
            onClick={() => {
              playSound.click();
              onOpenArchitecture();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-white/[0.08] bg-slate-950/60 hover:bg-white/[0.04] text-slate-300 text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Cpu size={14} className="text-slate-400" />
            <span>SIH26104 Defense Matrix</span>
          </button>
        )}
      </motion.div>

      {/* Down Arrow Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-12 cursor-pointer text-slate-500 hover:text-cyan-400 transition-colors"
        onClick={() => {
          playSound.click();
          onGetStarted();
        }}
      >
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
}
