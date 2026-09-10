"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Hash,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  Share2,
  Download,
} from "lucide-react";
import { cn, verdictColor, verdictLabel, riskLabel, riskColor, pct } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";

import AudioPlayerBar from "./AudioPlayerBar";
import WaveformPreview from "./WaveformPreview";
import SpectrogramPanel from "./SpectrogramPanel";
import RadarChart from "./RadarChart";
import AcousticMetricsCard from "./AcousticMetricsCard";
import AnomalyTimeline from "./AnomalyTimeline";
import ForensicReportModal from "./ForensicReportModal";

interface DetectionResultsProps {
  result: AnalysisResult;
}

export default function DetectionResults({ result }: DetectionResultsProps) {
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  const vc = verdictColor(result.verdict);
  const VerdictIcon =
    result.verdict === "human" ? ShieldCheck : result.verdict === "cloned" ? ShieldAlert : AlertTriangle;

  const handleSeek = (timeSec: number) => {
    setCurrentPlayTime(timeSec);
  };

  return (
    <section id="results" className="py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ── Section Title & Certificate Action ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-2">
              <Sparkles size={12} /> Real-Time DSP Forensic Audit
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Forensic Deepfake Analysis Report
            </h2>
            <p className="text-slate-400 text-sm mt-1 font-mono">
              Examined: <span className="text-cyan-300 font-semibold">{result.fileName}</span> &bull; SHA-256 Digest Validated
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCertificateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <FileCheck size={16} />
              View Judicial Forensic Certificate
            </button>
          </div>
        </div>

        {/* ── Audio Playback Bar with Synchronized Timeline ── */}
        <AudioPlayerBar
          audioUrl={result.audio.audioUrl}
          fileName={result.fileName}
          duration={result.audio.duration}
          onTimeUpdate={setCurrentPlayTime}
        />

        {/* ── Verdict Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "relative rounded-2xl border bg-gradient-to-br p-1 shadow-2xl overflow-hidden",
            vc.ring,
            vc.glow
          )}
        >
          <div className={cn("rounded-[14px] bg-slate-950/90 backdrop-blur-xl p-6 sm:p-8", vc.bg)}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left: Verdict Icon & Summary */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className={cn("p-5 rounded-2xl border bg-black/40 shrink-0", vc.ring)}
                >
                  <VerdictIcon size={44} className={vc.text} />
                </motion.div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                      PRIMARY FORENSIC CLASSIFICATION
                    </span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <Hash size={11} /> {result.id}
                    </span>
                  </div>

                  <h3 className={cn("text-3xl sm:text-4xl font-extrabold tracking-tight", vc.text)}>
                    {verdictLabel(result.verdict)}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Right: Confidence, Score & Risk */}
              <div className="flex items-center gap-6 sm:gap-8 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-8 text-center shrink-0">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Confidence</p>
                  <p className="text-3xl font-black font-mono text-white mt-0.5">{pct(result.confidence)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Authenticity</p>
                  <p className={cn("text-3xl font-black font-mono mt-0.5", vc.text)}>{pct(result.overallScore)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Risk Level</p>
                  <p className={cn("text-lg font-black uppercase font-mono mt-1", riskColor(result.riskLevel))}>
                    {riskLabel(result.riskLevel)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 2-Column Core Evidence Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Radar Chart & Architecture Stats (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 6-Axis Radar Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-md flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  6-Axis Forensic Radar Profile
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">Authenticity Polygon</span>
              </div>

              <RadarChart scores={result.radarScores} />

              <div className="mt-4 pt-4 border-t border-white/[0.06] w-full grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 uppercase block">Spectral Integrity</span>
                  <span className="font-mono font-bold text-cyan-300">{result.radarScores.spectralIntegrity}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 uppercase block">Prosody Naturalness</span>
                  <span className="font-mono font-bold text-cyan-300">{result.radarScores.prosodicNaturalness}%</span>
                </div>
              </div>
            </div>

            {/* Model & Crypto Validation Info */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-md text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Inference Engine</span>
                <span className="text-white font-semibold">{result.modelMetrics.inferenceEngine}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Processing Latency</span>
                <span className="text-cyan-300 font-bold">{result.modelMetrics.processingTimeMs} ms</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Samples Decoded</span>
                <span className="text-slate-300">{result.modelMetrics.samplesAnalyzed.toLocaleString()} PCM frames</span>
              </div>
              <div className="flex flex-col gap-1 text-slate-400">
                <span className="text-slate-500 uppercase text-[10px]">Cryptographic SHA-256</span>
                <span className="text-[10px] text-slate-400 truncate bg-slate-950/80 p-2 rounded border border-white/[0.04]">
                  {result.audio.sha256}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Feature Anomaly Breakdown & Explainability (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Feature Bars */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deep Acoustic Feature Breakdown
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {result.features.filter((f) => f.anomaly).length} Anomalies Flagged
                </span>
              </div>

              <div className="space-y-4">
                {result.features.map((f) => (
                  <div key={f.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{f.name}</span>
                        {f.anomaly ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                            Anomaly
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                            Organic
                          </span>
                        )}
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className={cn("font-bold", f.score < 0.5 ? "text-red-400" : f.score < 0.7 ? "text-amber-400" : "text-emerald-400")}>
                          {pct(f.score)}
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.score * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          f.score < 0.5
                            ? "bg-gradient-to-r from-red-500 to-rose-400"
                            : f.score < 0.7
                            ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                            : "bg-gradient-to-r from-emerald-500 to-cyan-400"
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <p className="text-[10px] text-slate-400 leading-tight">{f.description}</p>
                      {f.measuredValue && (
                        <span className="font-mono text-[10px] text-cyan-300 shrink-0 ml-2">
                          {f.measuredValue}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainability Insights */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Forensic Explainability &amp; Reasoning Log
              </h3>
              <div className="space-y-3">
                {result.insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-white">{insight.label}</span>
                      <span
                        className={cn(
                          "text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border",
                          insight.severity === "critical"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : insight.severity === "warning"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        )}
                      >
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">
                      {insight.detail}
                    </p>
                    <div className="text-[10px] font-mono text-cyan-400/90 bg-cyan-500/[0.05] p-1.5 rounded border border-cyan-500/10">
                      <span className="text-slate-500">Forensic Evidence:</span> {insight.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── DSP Acoustic Measurements Card ── */}
        <AcousticMetricsCard measurements={result.measurements} />

        {/* ── Timeline Anomaly Localization ── */}
        <AnomalyTimeline
          anomalies={result.timelineAnomalies}
          duration={result.audio.duration}
          currentTime={currentPlayTime}
          onSeek={handleSeek}
        />

        {/* ── Spectrogram & Waveform Visualizers ── */}
        <div className="space-y-6">
          <SpectrogramPanel
            data={result.spectrogramData}
            frequencies={result.spectrogramFrequencies}
            verdict={result.verdict}
            duration={result.audio.duration}
            vocoderCutoffHz={result.measurements.vocoderCutoffHz}
            currentTime={currentPlayTime}
            onSeek={handleSeek}
          />

          <WaveformPreview
            data={result.waveformData}
            verdict={result.verdict}
            duration={result.audio.duration}
            currentTime={currentPlayTime}
            anomalies={result.timelineAnomalies}
            onSeek={handleSeek}
          />
        </div>

        {/* ── Judicial Certificate Modal ── */}
        <ForensicReportModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          result={result}
        />
      </div>
    </section>
  );
}
