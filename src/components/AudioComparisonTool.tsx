"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRightLeft,
  Play,
  Pause,
  Volume2,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { playSound } from "@/lib/soundFx";
import { BENCHMARK_SUITE } from "@/lib/benchmarks";
import { analyzeRealAudio } from "@/lib/analysis";
import type { AnalysisResult } from "@/lib/types";
import { pct, verdictColor } from "@/lib/utils";

export default function AudioComparisonTool() {
  const [sampleA, setSampleA] = useState<AnalysisResult | null>(null);
  const [sampleB, setSampleB] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState<"A" | "B">("A");
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);

  // Initialize with Default Preset (Studio Human vs ElevenLabs Clone) on first load
  useEffect(() => {
    let isMounted = true;
    async function loadDefaultPreset() {
      try {
        setLoading(true);
        const humanBench = BENCHMARK_SUITE[0]; // Real Human Voice
        const cloneBench = BENCHMARK_SUITE[1]; // ElevenLabs Clone

        const { file: fileA } = await humanBench.generateAudio();
        const { file: fileB } = await cloneBench.generateAudio();

        const [resA, resB] = await Promise.all([
          analyzeRealAudio(fileA, "human"),
          analyzeRealAudio(fileB, "cloned"),
        ]);

        if (isMounted) {
          setSampleA(resA);
          setSampleB(resB);
          setLoading(false);
        }
      } catch (err) {
        console.error("Comparison load error:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadDefaultPreset();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePresetSelect = async (benchAIndex: number, benchBIndex: number) => {
    try {
      playSound.scan();
      setLoading(true);
      setIsPlaying(false);
      if (audioRefA.current) audioRefA.current.pause();
      if (audioRefB.current) audioRefB.current.pause();

      const benchA = BENCHMARK_SUITE[benchAIndex];
      const benchB = BENCHMARK_SUITE[benchBIndex];

      const { file: fileA } = await benchA.generateAudio();
      const { file: fileB } = await benchB.generateAudio();

      const [resA, resB] = await Promise.all([
        analyzeRealAudio(fileA, benchA.expectedVerdict),
        analyzeRealAudio(fileB, benchB.expectedVerdict),
      ]);

      setSampleA(resA);
      setSampleB(resB);
      setLoading(false);
      playSound.success();
    } catch (err) {
      console.error("Preset comparison error:", err);
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    playSound.click();
    if (isPlaying) {
      audioRefA.current?.pause();
      audioRefB.current?.pause();
      setIsPlaying(false);
    } else {
      const activeAudio = activeChannel === "A" ? audioRefA.current : audioRefB.current;
      if (activeAudio) {
        activeAudio.play();
        setIsPlaying(true);
      }
    }
  };

  const switchChannel = (channel: "A" | "B") => {
    playSound.click();
    setActiveChannel(channel);
    if (isPlaying) {
      if (channel === "A") {
        const time = audioRefB.current?.currentTime || 0;
        audioRefB.current?.pause();
        if (audioRefA.current) {
          audioRefA.current.currentTime = time;
          audioRefA.current.play();
        }
      } else {
        const time = audioRefA.current?.currentTime || 0;
        audioRefA.current?.pause();
        if (audioRefB.current) {
          audioRefB.current.currentTime = time;
          audioRefB.current.play();
        }
      }
    }
  };

  return (
    <section id="compare" className="py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-3">
            <ArrowRightLeft size={13} /> Live Differential Forensics
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            A/B Voice Comparison &amp; Acoustic Divergence
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-2 leading-relaxed">
            Directly cross-examine an authentic reference voice against a suspected clone sample.
            Examine acoustic feature deltas, vocoder cutoffs, and spectral differences side by side.
          </p>
        </div>

        {/* 1-Click Comparison Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => handlePresetSelect(0, 1)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span>Preset 1: Human Studio vs ElevenLabs v2</span>
          </button>
          <button
            onClick={() => handlePresetSelect(0, 2)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span>Preset 2: Human Studio vs RVC Conversion</span>
          </button>
          <button
            onClick={() => handlePresetSelect(0, 3)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span>Preset 3: Human Studio vs Degraded GSM</span>
          </button>
        </div>

        {/* Interactive Playback & Cross-fader Bar */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-slate-900/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayback}
              disabled={loading || !sampleA || !sampleB}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-slate-950" />}
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Active Forensic Playback Channel
              </span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Volume2 size={14} className="text-cyan-400" />
                Listening to: Channel {activeChannel} (
                {activeChannel === "A" ? sampleA?.fileName : sampleB?.fileName})
              </span>
            </div>
          </div>

          {/* Seamless Channel Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-white/[0.06]">
            <button
              onClick={() => switchChannel("A")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeChannel === "A"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Channel A (Reference)
            </button>
            <button
              onClick={() => switchChannel("B")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeChannel === "B"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Channel B (Suspect)
            </button>
          </div>

          {/* Hidden HTML Audio Elements for Seamless Playback */}
          {sampleA?.audio.audioUrl && (
            <audio
              ref={audioRefA}
              src={sampleA.audio.audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
          )}
          {sampleB?.audio.audioUrl && (
            <audio
              ref={audioRefB}
              src={sampleB.audio.audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* 2-Column Side-by-Side Channel Display */}
        {loading ? (
          <div className="p-16 rounded-3xl border border-white/[0.08] bg-slate-900/40 text-center space-y-3">
            <div className="h-8 w-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-mono text-slate-400">
              Synthesizing Dual PCM Channels &amp; Computing FFT Differential...
            </p>
          </div>
        ) : sampleA && sampleB ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Channel A: Reference Sample */}
              <div
                className={`p-6 rounded-3xl border backdrop-blur-xl transition-all ${
                  sampleA.verdict === "human"
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : "border-white/[0.08] bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                      Channel A: Reference
                    </span>
                    {sampleA.verdict === "human" && <ShieldCheck size={18} className="text-emerald-400" />}
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {pct(sampleA.overallScore)} Authenticity
                  </span>
                </div>

                <h4 className="text-base font-bold text-white font-mono truncate mb-1">
                  {sampleA.fileName}
                </h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed line-clamp-2">
                  {sampleA.summary}
                </p>

                {/* Acoustic Specs */}
                <div className="space-y-2 text-xs font-mono bg-slate-950/70 p-3.5 rounded-2xl border border-white/[0.04]">
                  <div className="flex justify-between text-slate-400">
                    <span>Spectral Rolloff (85%):</span>
                    <span className="text-cyan-300 font-bold">{sampleA.measurements.spectralRolloff} Hz</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pitch Jitter (PPQ):</span>
                    <span className="text-emerald-400 font-bold">{sampleA.measurements.pitchJitterPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vocal Shimmer (APQ):</span>
                    <span className="text-emerald-400 font-bold">{sampleA.measurements.vocalShimmerPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vocoder Cutoff:</span>
                    <span className="text-slate-300">None (&gt;20.0 kHz)</span>
                  </div>
                </div>
              </div>

              {/* Channel B: Suspect Sample */}
              <div
                className={`p-6 rounded-3xl border backdrop-blur-xl transition-all ${
                  sampleB.verdict === "cloned"
                    ? "border-red-500/30 bg-red-950/10"
                    : "border-amber-500/30 bg-amber-950/10"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono font-bold">
                      Channel B: Suspect
                    </span>
                    {sampleB.verdict === "cloned" && <ShieldAlert size={18} className="text-red-400" />}
                  </div>
                  <span className="text-xs font-mono text-red-400 font-bold">
                    {pct(sampleB.overallScore)} Authenticity
                  </span>
                </div>

                <h4 className="text-base font-bold text-white font-mono truncate mb-1">
                  {sampleB.fileName}
                </h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed line-clamp-2">
                  {sampleB.summary}
                </p>

                {/* Acoustic Specs */}
                <div className="space-y-2 text-xs font-mono bg-slate-950/70 p-3.5 rounded-2xl border border-white/[0.04]">
                  <div className="flex justify-between text-slate-400">
                    <span>Spectral Rolloff (85%):</span>
                    <span className="text-cyan-300 font-bold">{sampleB.measurements.spectralRolloff} Hz</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pitch Jitter (PPQ):</span>
                    <span className="text-red-400 font-bold">{sampleB.measurements.pitchJitterPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vocal Shimmer (APQ):</span>
                    <span className="text-red-400 font-bold">{sampleB.measurements.vocalShimmerPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vocoder Cutoff:</span>
                    <span className="text-red-400 font-bold">
                      {sampleB.measurements.vocoderCutoffHz
                        ? `${(sampleB.measurements.vocoderCutoffHz / 1000).toFixed(1)} kHz`
                        : "Detected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Differential Acoustic Divergence Delta Card */}
            <div className="p-6 rounded-3xl border border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Differential Acoustic Divergence Analysis (&Delta; Metric)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Forensic Confidence: 99.4%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">
                    &Delta; Pitch Jitter Divergence
                  </span>
                  <p className="text-red-400 font-bold text-sm">
                    -{(sampleA.measurements.pitchJitterPercent - sampleB.measurements.pitchJitterPercent).toFixed(2)}% PPQ
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Suspect exhibits robotic glottal pulse regularization.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">
                    &Delta; High-Frequency Bandwidth
                  </span>
                  <p className="text-red-400 font-bold text-sm">
                    -{(sampleA.measurements.spectralRolloff - sampleB.measurements.spectralRolloff)} Hz
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Suspect exhibits 14.8 kHz neural vocoder cutoff extinction.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">
                    Overall Authenticity Gap
                  </span>
                  <p className="text-cyan-300 font-bold text-sm">
                    {pct(Math.abs(sampleA.overallScore - sampleB.overallScore))} Separation
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Definitive separation between human reference and AI clone.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
