"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, MicOff, FileAudio, X, CheckCircle2, Info, Sparkles } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import BenchmarkSelector from "./BenchmarkSelector";
import type { BenchmarkSample } from "@/lib/types";

interface UploadCardProps {
  onFileSelected: (file: File) => void;
  onSelectBenchmark: (sample: BenchmarkSample) => void;
  isAnalyzing: boolean;
}

const SUPPORTED = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/flac", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/webm"];
const FORMATS = ["WAV", "MP3", "FLAC", "OGG", "M4A", "WebM"];

export default function UploadCard({ onFileSelected, onSelectBenchmark, isAnalyzing }: UploadCardProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!SUPPORTED.some((t) => file.type === t) && !file.name.match(/\.(wav|mp3|flac|ogg|m4a|webm)$/i)) {
        setError("Unsupported format. Please upload WAV, MP3, FLAC, OGG, M4A or WebM.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("File too large. Maximum size is 50 MB.");
        return;
      }
      setSelectedFile(file);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `mic_recording_${Date.now()}.webm`, { type: "audio/webm" });
        handleFile(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Microphone access denied. Please check your browser microphone permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const analyze = () => {
    if (selectedFile) onFileSelected(selectedFile);
  };

  return (
    <section id="upload" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-3">
            <Sparkles size={13} /> Deep Learning &amp; Mathematical Audio Forensics
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Upload Voice Sample for Forensic Screening
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Submit a recording, capture live microphone audio, or select a judge evaluation preset to run complete Fourier, spectral, and neural vocoder analysis.
          </p>
        </motion.div>

        {/* ── glass card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl"
        >
          {/* glow line */}
          <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {!selectedFile ? (
                <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* ── drop zone ── */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-4 py-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
                      dragActive
                        ? "border-cyan-500/50 bg-cyan-500/[0.05]"
                        : "border-white/[0.08] bg-white/[0.01] hover:border-cyan-500/30 hover:bg-white/[0.02]"
                    )}
                  >
                    <motion.div
                      animate={dragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20 text-cyan-400"
                    >
                      <Upload size={30} />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm text-slate-200 font-medium">
                        Drag &amp; drop audio file or <span className="text-cyan-400 font-semibold underline underline-offset-4">browse local storage</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 font-mono">
                        Max 50 MB &middot; {FORMATS.join(" / ")}
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </div>

                  {/* ── divider ── */}
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">or capture stream</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  {/* ── record button ── */}
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                      recording
                        ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-white/[0.03] text-slate-300 border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {recording ? (
                      <>
                        <MicOff size={16} />
                        <span>Stop Live Recording</span>
                        <span className="ml-2 h-2.5 w-2.5 rounded-full bg-red-400 animate-ping" />
                      </>
                    ) : (
                      <>
                        <Mic size={16} className="text-cyan-400" />
                        <span>Record Live Voice Sample</span>
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="fileinfo" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  {/* ── selected file ── */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.04]">
                    <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/20">
                      <FileAudio size={26} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate font-mono">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {formatBytes(selectedFile.size)} &middot; {selectedFile.type || "audio/raw"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* ── analyze button ── */}
                  <button
                    onClick={analyze}
                    disabled={isAnalyzing}
                    className={cn(
                      "mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all cursor-pointer",
                      isAnalyzing
                        ? "bg-cyan-500/20 text-cyan-300 cursor-wait"
                        : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:scale-[1.005] active:scale-[0.995]"
                    )}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
                        <span>Running DSP &amp; Neural Extraction Engine...</span>
                      </>
                    ) : (
                      <>
                        <FileAudio size={18} />
                        <span>Run Full Forensic Deepfake Analysis</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── error notice ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/[0.08] text-red-400 text-xs"
                >
                  <Info size={15} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 1-Click Judge Benchmark Presets ── */}
            <BenchmarkSelector onSelectBenchmark={onSelectBenchmark} isLoading={isAnalyzing} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
