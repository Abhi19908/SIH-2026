"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Waves, Sparkles, AlertCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Verdict } from "@/lib/types";

interface SpectrogramPanelProps {
  data: number[][];
  frequencies?: number[];
  verdict: Verdict;
  duration?: number;
  vocoderCutoffHz?: number;
  currentTime?: number;
  onSeek?: (timeSec: number) => void;
}

export default function SpectrogramPanel({
  data,
  frequencies = [],
  verdict,
  duration = 0,
  vocoderCutoffHz,
  currentTime = 0,
  onSeek,
}: SpectrogramPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ freq: number; time: number; power: number } | null>(null);

  const maxFreq = frequencies.length > 0 ? frequencies[frequencies.length - 1] : 16000;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const rows = data.length; // Frequency bins (0 = low freq, rows-1 = high freq)
    const cols = data[0]?.length || 1; // Time frames
    const cellW = w / cols;
    const cellH = h / rows;

    ctx.clearRect(0, 0, w, h);

    // High-contrast Scientific Colormaps (Thermal/Inferno style)
    const getInfernoColor = (v: number) => {
      // Clamped normalized power 0 to 1
      const p = Math.max(0, Math.min(1, v));
      if (verdict === "cloned") {
        // Red / Orange / Neon Pink cyber deepfake palette
        const r = Math.floor(p < 0.3 ? p * 3 * 180 : 180 + (p - 0.3) * 75);
        const g = Math.floor(p < 0.6 ? p * 0.5 * 100 : 30 + (p - 0.6) * 180);
        const b = Math.floor(p < 0.2 ? p * 50 : p > 0.8 ? (p - 0.8) * 500 : 40);
        return `rgb(${r},${g},${b})`;
      } else if (verdict === "human") {
        // Emerald / Cyan / Aquamarine natural organic palette
        const r = Math.floor(p > 0.7 ? (p - 0.7) * 300 : 10);
        const g = Math.floor(p < 0.2 ? p * 5 * 120 : 120 + (p - 0.2) * 135);
        const b = Math.floor(p * 255);
        return `rgb(${r},${g},${b})`;
      } else {
        // Amber / Yellow degraded cellular palette
        const r = Math.floor(p * 255);
        const g = Math.floor(p * 180);
        const b = Math.floor(p * 50);
        return `rgb(${r},${g},${b})`;
      }
    };

    // Render STFT spectrogram matrix
    // Note: Canvas Y=0 is top, so we invert rows to place low frequencies at the bottom
    for (let r = 0; r < rows; r++) {
      const invertedR = rows - 1 - r;
      for (let c = 0; c < cols; c++) {
        const val = data[r][c] || 0;
        ctx.fillStyle = getInfernoColor(val);
        ctx.fillRect(c * cellW, invertedR * cellH, cellW + 0.6, cellH + 0.6);
      }
    }

    // ── Vocoder Cutoff Guide Line ──
    if (vocoderCutoffHz && vocoderCutoffHz < maxFreq) {
      const cutoffRatio = vocoderCutoffHz / maxFreq;
      const cutoffY = h * (1 - cutoffRatio);

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, cutoffY);
      ctx.lineTo(w, cutoffY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset
    }

    // ── Playhead Cursor Line ──
    if (duration > 0) {
      const playheadX = (currentTime / duration) * w;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [data, frequencies, verdict, duration, vocoderCutoffHz, currentTime, maxFreq]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const timeRatio = Math.max(0, Math.min(1, x / rect.width));
    const freqRatio = Math.max(0, Math.min(1, 1 - y / rect.height));

    const timeSec = timeRatio * duration;
    const freqHz = freqRatio * maxFreq;

    const rows = data.length;
    const cols = data[0]?.length || 1;
    const r = Math.min(rows - 1, Math.floor(freqRatio * rows));
    const c = Math.min(cols - 1, Math.floor(timeRatio * cols));
    const power = data[r]?.[c] ?? 0;

    setHoverInfo({ freq: Math.round(freqHz), time: timeSec, power: Math.round(power * 100) });
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    onSeek?.(ratio * duration);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Waves size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            STFT Fourier Spectrogram (Time-Frequency Energy)
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          {hoverInfo ? (
            <span className="text-cyan-300 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {hoverInfo.freq} Hz &bull; {hoverInfo.time.toFixed(2)}s &bull; {hoverInfo.power}% Power
            </span>
          ) : (
            <span className="text-slate-500 text-[10px] uppercase tracking-wider">
              Hover over spectrogram to probe frequency
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Spectrogram Canvas */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="w-full h-44 rounded-xl cursor-crosshair bg-slate-950/80 border border-white/[0.04]"
        />

        {/* Vocoder Cutoff Marker Tag */}
        {vocoderCutoffHz && vocoderCutoffHz < maxFreq && (
          <div
            className="absolute right-2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-mono font-bold text-red-400 bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none"
            style={{ top: `${(1 - vocoderCutoffHz / maxFreq) * 100}%` }}
          >
            <AlertCircle size={10} />
            <span>AI Vocoder Cutoff: {(vocoderCutoffHz / 1000).toFixed(1)} kHz</span>
          </div>
        )}
      </div>

      {/* Axis Calibration Labels */}
      <div className="flex items-center justify-between mt-2 px-1 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1 text-slate-500">
          <span>0 Hz</span>
          <span>(Glottal F0)</span>
        </div>
        <span className="text-slate-400">Time &rarr; {formatDuration(duration)}</span>
        <div className="flex items-center gap-1 text-slate-500">
          <span>{Math.round(maxFreq / 1000)} kHz</span>
          <span>(Nyquist Bound)</span>
        </div>
      </div>
    </motion.div>
  );
}
