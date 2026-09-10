"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, Shield, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import { BENCHMARK_SUITE } from "@/lib/benchmarks";
import type { BenchmarkSample } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BenchmarkSelectorProps {
  onSelectBenchmark: (sample: BenchmarkSample) => void;
  isLoading: boolean;
}

export default function BenchmarkSelector({ onSelectBenchmark, isLoading }: BenchmarkSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (bench: BenchmarkSample) => {
    setSelectedId(bench.id);
    onSelectBenchmark(bench);
  };

  return (
    <div className="mt-8 pt-6 border-t border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Judge Testbench &middot; 1-Click Evaluation Presets
          </span>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline-block">
          Click any preset to load synthesized audio &amp; run DSP pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {BENCHMARK_SUITE.map((bench) => {
          const isSelected = selectedId === bench.id;
          const isHuman = bench.expectedVerdict === "human";
          const isCloned = bench.expectedVerdict === "cloned";

          return (
            <motion.button
              key={bench.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(bench)}
              disabled={isLoading}
              className={cn(
                "relative text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between group",
                isSelected
                  ? "border-cyan-500/50 bg-cyan-500/[0.08] shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  : isHuman
                  ? "border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/[0.05]"
                  : isCloned
                  ? "border-red-500/20 bg-red-500/[0.02] hover:border-red-500/40 hover:bg-red-500/[0.05]"
                  : "border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40 hover:bg-amber-500/[0.05]"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={cn(
                      "text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold border",
                      isHuman
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : isCloned
                        ? "text-red-400 border-red-500/30 bg-red-500/10"
                        : "text-amber-400 border-amber-500/30 bg-amber-500/10"
                    )}
                  >
                    {bench.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{bench.durationSeconds}s</span>
                </div>

                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {bench.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {bench.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Play size={10} className="text-cyan-400 fill-cyan-400" />
                  Run Benchmark
                </span>
                {isSelected && (
                  <span className="text-cyan-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> Loaded
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
