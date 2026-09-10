"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ExplainabilityInsight } from "@/lib/types";
import { Zap, AudioLines, Timer, Radio, Bug } from "lucide-react";

interface ExplainabilityPanelProps {
  insights: ExplainabilityInsight[];
}

const CATEGORY_ICON: Record<string, React.ElementType> = {
  spectral: Radio,
  prosody: AudioLines,
  temporal: Timer,
  harmonic: Zap,
  artifacts: Bug,
};

const CATEGORY_LABEL: Record<string, string> = {
  spectral: "Spectral",
  prosody: "Prosody",
  temporal: "Temporal",
  harmonic: "Harmonic",
  artifacts: "Artifacts",
};

const SEVERITY_STYLE: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  normal: { dot: "bg-emerald-400", border: "border-emerald-500/15", bg: "bg-emerald-500/[0.04]", text: "text-emerald-400" },
  warning: { dot: "bg-amber-400", border: "border-amber-500/15", bg: "bg-amber-500/[0.04]", text: "text-amber-400" },
  critical: { dot: "bg-red-400", border: "border-red-500/15", bg: "bg-red-500/[0.04]", text: "text-red-400" },
};

export default function ExplainabilityPanel({ insights }: ExplainabilityPanelProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Explainability Insights</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Human-readable forensic reasoning behind the detection verdict. Each indicator maps to a specific
            analysis dimension.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => {
            const Icon = CATEGORY_ICON[insight.category] || Zap;
            const sev = SEVERITY_STYLE[insight.severity];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-xl border p-4 transition-all hover:border-white/[0.1]",
                  sev.border,
                  sev.bg
                )}
              >
                <div className="flex items-start gap-3">
                  {/* icon */}
                  <div className={cn("flex-shrink-0 p-2 rounded-lg border", sev.border, "bg-black/20")}>
                    <Icon size={16} className={sev.text} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white">{insight.label}</span>
                      <span className={cn("text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border", sev.border, sev.text)}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.detail}</p>

                    {/* severity bar */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{CATEGORY_LABEL[insight.category]}</span>
                      <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${insight.score * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                          className={cn(
                            "h-full rounded-full",
                            insight.severity === "critical"
                              ? "bg-red-400"
                              : insight.severity === "warning"
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                          )}
                        />
                      </div>
                      <span className={cn("text-[10px] font-mono", sev.text)}>
                        {Math.round(insight.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
