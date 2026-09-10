"use client";

import { Activity, Zap, BarChart3, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { AcousticMeasurements } from "@/lib/types";

interface AcousticMetricsCardProps {
  measurements: AcousticMeasurements;
  className?: string;
}

export default function AcousticMetricsCard({ measurements, className }: AcousticMetricsCardProps) {
  const metricItems = [
    {
      label: "Pitch Jitter (PPQ)",
      value: `${measurements.pitchJitterPercent.toFixed(2)}%`,
      normalRange: "0.5% – 2.5%",
      isAnomalous: measurements.pitchJitterPercent < 0.25 || measurements.pitchJitterPercent > 4.5,
      description: "Organic micro-pitch frequency perturbations. Synthetic vocoders exhibit unnatural flatness (<0.25%).",
    },
    {
      label: "Vocal Shimmer (APQ)",
      value: `${measurements.vocalShimmerPercent.toFixed(2)}%`,
      normalRange: "1.5% – 5.0%",
      isAnomalous: measurements.vocalShimmerPercent < 0.8 || measurements.vocalShimmerPercent > 8.0,
      description: "Cycle-to-cycle amplitude variation of the glottal waveform.",
    },
    {
      label: "Spectral Flatness",
      value: measurements.spectralFlatness.toFixed(4),
      normalRange: "0.005 – 0.080",
      isAnomalous: measurements.spectralFlatness < 0.002 || measurements.spectralFlatness > 0.15,
      description: "Wiener entropy measuring tonal harmonic peaks vs noise floor distribution.",
    },
    {
      label: "Spectral Centroid",
      value: `${Math.round(measurements.spectralCentroid)} Hz`,
      normalRange: "1,200 – 2,800 Hz",
      isAnomalous: measurements.spectralCentroid < 800 || measurements.spectralCentroid > 3500,
      description: "Spectral center-of-mass indicating voice brightness and formant energy balance.",
    },
    {
      label: "Harmonic-to-Noise (HNR)",
      value: `${measurements.harmonicToNoiseRatioDb.toFixed(1)} dB`,
      normalRange: "12 – 24 dB",
      isAnomalous: measurements.harmonicToNoiseRatioDb > 26 || measurements.harmonicToNoiseRatioDb < 6,
      description: "Degree of acoustic periodicity versus breathiness and glottal aspiration noise.",
    },
    {
      label: "Spectral Rolloff (85%)",
      value: `${Math.round(measurements.spectralRolloff)} Hz`,
      normalRange: "3,500 – 7,500 Hz",
      isAnomalous: measurements.spectralRolloff < 3000,
      description: "Frequency below which 85% of total spectral power is concentrated.",
    },
    {
      label: "Dynamic Range",
      value: `${measurements.dynamicRangeDb.toFixed(1)} dB`,
      normalRange: "24 – 55 dB",
      isAnomalous: measurements.dynamicRangeDb < 18,
      description: "Ratio between peak signal envelope and background floor; AI voices often over-compress dynamics.",
    },
    {
      label: "Vocoder Cutoff Filter",
      value: measurements.vocoderCutoffHz ? `${(measurements.vocoderCutoffHz / 1000).toFixed(1)} kHz` : "None (Full-Band)",
      normalRange: "Full-Band (>20kHz)",
      isAnomalous: !!measurements.vocoderCutoffHz && measurements.vocoderCutoffHz <= 16000,
      description: "Steep brickwall roll-off typical of neural HiFi-GAN / MelGAN decoders.",
    },
  ];

  return (
    <div className={`rounded-2xl bg-slate-900/60 border border-white/[0.08] p-5 backdrop-blur-md ${className || ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Acoustic Signal Measurements (DSP Metrics)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Real-time Mathematical FFT Extraction
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metricItems.map((metric, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border transition-all ${
              metric.isAnomalous
                ? "bg-red-500/[0.04] border-red-500/30 hover:border-red-500/50"
                : "bg-white/[0.02] border-white/[0.05] hover:border-cyan-500/30"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-medium text-slate-300 truncate">
                {metric.label}
              </span>
              {metric.isAnomalous ? (
                <span className="text-[9px] uppercase font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                  Anomaly
                </span>
              ) : (
                <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Normal
                </span>
              )}
            </div>

            <div className="text-base font-bold font-mono text-white mb-1">
              {metric.value}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 font-mono">
              <span>Expected:</span>
              <span className="text-slate-400">{metric.normalRange}</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
