"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, WandSparkles, BrainCircuit, ScanSearch, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineStage, PipelineStep } from "@/lib/types";

interface AnalysisPipelineProps {
  stage: PipelineStage;
}

const STEPS: Omit<PipelineStep, "status" | "progress">[] = [
  { id: "ingesting", label: "Audio Ingestion", description: "Decoding and loading the audio signal into the analysis buffer" },
  { id: "preprocessing", label: "Pre-processing", description: "Normalization, noise reduction, and silence trimming" },
  { id: "extracting", label: "Feature Extraction", description: "Extracting MFCC, spectral, prosodic, and temporal features" },
  { id: "inferring", label: "Model Inference", description: "Running multi-head detection model across six forensic dimensions" },
  { id: "complete", label: "Verdict Ready", description: "All analysis complete — results are available" },
];

const ICONS: Record<string, React.ElementType> = {
  ingesting: Database,
  preprocessing: WandSparkles,
  extracting: ScanSearch,
  inferring: BrainCircuit,
  complete: ShieldCheck,
};

const ORDER: PipelineStage[] = ["ingesting", "preprocessing", "extracting", "inferring", "complete"];

function stepStatus(step: PipelineStage, current: PipelineStage): "pending" | "active" | "complete" {
  const si = ORDER.indexOf(step);
  const ci = ORDER.indexOf(current);
  if (si < ci) return "complete";
  if (si === ci) return "active";
  return "pending";
}

export default function AnalysisPipeline({ stage }: AnalysisPipelineProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    if (stage === "idle") return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12, 100));
    }, 200);
    return () => clearInterval(interval);
  }, [stage]);

  if (stage === "idle") return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analysis Pipeline</h2>
          <p className="text-slate-400 text-sm">Real-time forensic analysis in progress</p>
        </motion.div>

        {/* ── pipeline ── */}
        <div className="relative space-y-3">
          {STEPS.map((step, i) => {
            const status = stepStatus(step.id, stage);
            const Icon = ICONS[step.id];
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                  status === "active"
                    ? "border-cyan-500/20 bg-cyan-500/[0.04] shadow-[0_0_30px_rgba(6,182,212,0.06)]"
                    : status === "complete"
                      ? "border-emerald-500/15 bg-emerald-500/[0.03]"
                      : "border-white/[0.04] bg-white/[0.01]"
                )}
              >
                {/* icon */}
                <div
                  className={cn(
                    "flex-shrink-0 p-2.5 rounded-xl border transition-colors",
                    status === "active"
                      ? "bg-cyan-500/10 border-cyan-500/15 text-cyan-400"
                      : status === "complete"
                        ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-400"
                        : "bg-white/[0.03] border-white/[0.06] text-slate-500"
                  )}
                >
                  {status === "complete" ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>

                {/* text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        status === "active" ? "text-white" : status === "complete" ? "text-emerald-300" : "text-slate-500"
                      )}
                    >
                      {step.label}
                    </span>
                    {status === "active" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className={cn("text-xs mt-0.5", status === "pending" ? "text-slate-600" : "text-slate-400")}>
                    {step.description}
                  </p>

                  {/* progress bar for active step */}
                  {status === "active" && (
                    <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                  )}
                </div>

                {/* status badge */}
                <div className="flex-shrink-0">
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      status === "active"
                        ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/[0.06]"
                        : status === "complete"
                          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]"
                          : "text-slate-600 border-white/[0.04] bg-white/[0.02]"
                    )}
                  >
                    {status === "active" ? "Processing" : status === "complete" ? "Done" : "Queued"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
