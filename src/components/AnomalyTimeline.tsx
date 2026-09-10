"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, Clock, Zap } from "lucide-react";
import type { TimelineAnomaly } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface AnomalyTimelineProps {
  anomalies: TimelineAnomaly[];
  duration: number;
  currentTime?: number;
  onSeek?: (timestampSec: number) => void;
  className?: string;
}

export default function AnomalyTimeline({
  anomalies,
  duration,
  currentTime = 0,
  onSeek,
  className,
}: AnomalyTimelineProps) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<TimelineAnomaly | null>(null);

  const getSeverityBadge = (severity: TimelineAnomaly["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low":
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
  };

  const getSeverityMarkerColor = (severity: TimelineAnomaly["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-red-500 shadow-[0_0_10px_#ef4444]";
      case "medium":
        return "bg-amber-500 shadow-[0_0_8px_#f59e0b]";
      case "low":
      default:
        return "bg-cyan-400 shadow-[0_0_8px_#06b6d4]";
    }
  };

  return (
    <div className={cn("rounded-2xl bg-slate-900/60 border border-white/[0.08] p-5 backdrop-blur-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Timeline Anomaly Localization
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {anomalies.length} {anomalies.length === 1 ? "Anomaly" : "Anomalies"} Detected
        </span>
      </div>

      {/* Interactive Timeline Track */}
      <div className="relative my-6 pt-4 pb-2">
        {/* Base Timeline Bar */}
        <div className="relative w-full h-3 rounded-full bg-slate-800/80 border border-white/[0.06] overflow-hidden">
          {/* Anomaly regions on track */}
          {duration > 0 &&
            anomalies.map((ano) => {
              const leftPercent = Math.max(0, Math.min(100, (ano.startSec / duration) * 100));
              const widthPercent = Math.max(2, Math.min(100 - leftPercent, ((ano.endSec - ano.startSec) / duration) * 100));

              return (
                <div
                  key={ano.id}
                  className={cn(
                    "absolute top-0 bottom-0 opacity-75 cursor-pointer transition-opacity hover:opacity-100",
                    ano.severity === "high"
                      ? "bg-red-500"
                      : ano.severity === "medium"
                      ? "bg-amber-500"
                      : "bg-cyan-400"
                  )}
                  style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  onClick={() => {
                    setSelectedAnomaly(ano);
                    onSeek?.(ano.startSec);
                  }}
                  title={`${ano.label} @ ${ano.startSec.toFixed(2)}s`}
                />
              );
            })}

          {/* Current Playhead Indicator */}
          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_6px_#fff]"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          )}
        </div>

        {/* Time ruler ticks */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-0.5">
          <span>0.00s</span>
          <span>{formatDuration(duration / 4)}</span>
          <span>{formatDuration(duration / 2)}</span>
          <span>{formatDuration((duration * 3) / 4)}</span>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Anomaly Marker Pins */}
        {duration > 0 &&
          anomalies.map((ano) => {
            const leftPercent = Math.max(0, Math.min(98, (ano.startSec / duration) * 100));
            const isSelected = selectedAnomaly?.id === ano.id;

            return (
              <button
                key={`pin-${ano.id}`}
                onClick={() => {
                  setSelectedAnomaly(ano);
                  onSeek?.(ano.startSec);
                }}
                className="absolute -top-3.5 -translate-x-1/2 p-1 group z-20 cursor-pointer"
                style={{ left: `${leftPercent}%` }}
              >
                <div
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center transition-transform",
                    getSeverityMarkerColor(ano.severity),
                    isSelected ? "scale-125 ring-2 ring-white" : "group-hover:scale-110"
                  )}
                />
              </button>
            );
          })}
      </div>

      {/* Selected Anomaly Highlight Details */}
      <AnimatePresence>
        {selectedAnomaly && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-cyan-400" />
                <span className="font-semibold text-white">{selectedAnomaly.label}</span>
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                    getSeverityBadge(selectedAnomaly.severity)
                  )}
                >
                  {selectedAnomaly.severity} Severity
                </span>
              </div>
              <span className="font-mono text-[11px] text-cyan-300">
                {selectedAnomaly.startSec.toFixed(2)}s &ndash; {selectedAnomaly.endSec.toFixed(2)}s
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {selectedAnomaly.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anomaly List */}
      {anomalies.length === 0 ? (
        <div className="p-4 text-center text-xs text-emerald-400/90 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 flex items-center justify-center gap-2">
          <Info size={14} />
          <span>No localized vocoder artifacts or phase discontinuities detected. Audio signal shows continuous organic flow.</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {anomalies.map((ano) => (
            <div
              key={ano.id}
              onClick={() => {
                setSelectedAnomaly(ano);
                onSeek?.(ano.startSec);
              }}
              className={cn(
                "flex items-start justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-xs",
                selectedAnomaly?.id === ano.id
                  ? "bg-cyan-500/[0.08] border-cyan-500/40 shadow-sm"
                  : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    ano.severity === "high"
                      ? "bg-red-500"
                      : ano.severity === "medium"
                      ? "bg-amber-500"
                      : "bg-cyan-400"
                  )}
                />
                <div>
                  <div className="font-medium text-white">{ano.label}</div>
                  <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    {ano.description}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-cyan-300 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  {ano.startSec.toFixed(2)}s - {ano.endSec.toFixed(2)}s
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
