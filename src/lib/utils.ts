// ── VoxGuard Utility Helpers ─────────────────────────────────────────

import type { Verdict, RiskLevel } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function verdictColor(verdict: Verdict) {
  return {
    human: { bg: "from-emerald-500/20 to-emerald-600/5", text: "text-emerald-400", ring: "ring-emerald-500/30", glow: "shadow-emerald-500/20" },
    cloned: { bg: "from-red-500/20 to-red-600/5", text: "text-red-400", ring: "ring-red-500/30", glow: "shadow-red-500/20" },
    suspicious: { bg: "from-amber-500/20 to-amber-600/5", text: "text-amber-400", ring: "ring-amber-500/30", glow: "shadow-amber-500/20" },
  }[verdict];
}

export function riskColor(risk: RiskLevel) {
  return {
    low: "text-emerald-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    critical: "text-red-400",
  }[risk];
}

export function verdictLabel(verdict: Verdict) {
  return {
    human: "Authentic Human",
    cloned: "Cloned / Synthetic",
    suspicious: "Suspicious",
  }[verdict];
}

export function riskLabel(risk: RiskLevel) {
  return {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    critical: "Critical Risk",
  }[risk];
}

export function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}
