"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { TimelineAnomaly, Verdict } from "@/lib/types";

interface WaveformPreviewProps {
  data: number[];
  verdict: Verdict;
  duration?: number;
  currentTime?: number;
  anomalies?: TimelineAnomaly[];
  onSeek?: (timeSec: number) => void;
}

export default function WaveformPreview({
  data,
  verdict,
  duration = 0,
  currentTime = 0,
  anomalies = [],
  onSeek,
}: WaveformPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = {
    human: { main: "#10b981", glow: "rgba(16, 185, 129, 0.2)" },
    cloned: { main: "#ef4444", glow: "rgba(239, 68, 68, 0.2)" },
    suspicious: { main: "#f59e0b", glow: "rgba(245, 158, 11, 0.2)" },
  };

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

    const { main, glow } = colors[verdict] || colors.suspicious;
    const w = rect.width;
    const h = rect.height;
    const mid = h / 2;
    const barW = Math.max(1, w / data.length);

    ctx.clearRect(0, 0, w, h);

    // ── Anomaly overlay regions ──
    if (duration > 0 && anomalies.length > 0) {
      anomalies.forEach((ano) => {
        const startX = (ano.startSec / duration) * w;
        const endX = (ano.endSec / duration) * w;
        const regionW = Math.max(4, endX - startX);

        ctx.fillStyle = ano.severity === "high" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.12)";
        ctx.fillRect(startX, 0, regionW, h);

        ctx.strokeStyle = ano.severity === "high" ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, 0, regionW, h);
      });
    }

    // ── Glow under ──
    ctx.fillStyle = glow;
    data.forEach((v, i) => {
      const barH = Math.abs(v) * mid * 0.9;
      ctx.fillRect(i * barW, mid - barH, Math.max(barW - 1, 1), barH * 2);
    });

    // ── Main waveform bars ──
    data.forEach((v, i) => {
      const barH = Math.max(1, Math.abs(v) * mid * 0.85);
      const isPastPlayhead = duration > 0 && (i / data.length) * duration <= currentTime;

      const gradient = ctx.createLinearGradient(0, mid - barH, 0, mid + barH);
      if (isPastPlayhead) {
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.5, "#38bdf8");
        gradient.addColorStop(1, `${main}99`);
      } else {
        gradient.addColorStop(0, main);
        gradient.addColorStop(0.5, main);
        gradient.addColorStop(1, `${main}55`);
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.rect(i * barW, mid - barH, Math.max(barW - 1, 1), barH * 2);
      ctx.fill();
    });

    // ── Zero line ──
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    // ── Playhead cursor line ──
    if (duration > 0) {
      const playheadX = (currentTime / duration) * w;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }
  }, [data, verdict, duration, currentTime, anomalies]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek?.(clickRatio * duration);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            PCM Amplitude Waveform &amp; Peak Envelope
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          {duration > 0 && (
            <span>
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          )}
          <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:inline">
            Click to Seek
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-32 rounded-xl cursor-pointer bg-slate-950/70 border border-white/[0.04]"
      />
    </motion.div>
  );
}
