"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import UploadCard from "@/components/UploadCard";
import AnalysisPipeline from "@/components/AnalysisPipeline";
import DetectionResults from "@/components/DetectionResults";
import HistoryTable from "@/components/HistoryTable";
import TrustSummary from "@/components/TrustSummary";
import FloatingAnalyzeButton from "@/components/FloatingAnalyzeButton";
import Footer from "@/components/Footer";

import { analyzeRealAudio, getInitialHistory } from "@/lib/analysis";
import type { AnalysisResult, BenchmarkSample, PipelineStage } from "@/lib/types";

export default function Home() {
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>(() => getInitialHistory());

  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  const processAudioFile = useCallback(
    async (file: File | Blob, forcedVerdict?: "human" | "cloned" | "suspicious") => {
      setResult(null);
      setStage("ingesting");

      // Visual pipeline progression synchronized with real Web Audio decoding & DSP
      setTimeout(() => setStage("preprocessing"), 400);
      setTimeout(() => setStage("extracting"), 900);
      setTimeout(() => setStage("inferring"), 1500);

      try {
        const forensicResult = await analyzeRealAudio(file, forcedVerdict);

        setTimeout(() => {
          setStage("complete");
          setResult(forensicResult);
          setHistory((prev) => [forensicResult, ...prev.slice(0, 9)]);

          // Smooth scroll into forensic results view
          setTimeout(() => {
            document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
          }, 250);
        }, 2200);
      } catch (err) {
        console.error("Forensic analysis error:", err);
        setStage("idle");
      }
    },
    []
  );

  const handleBenchmarkSelect = useCallback(
    async (bench: BenchmarkSample) => {
      try {
        const { file } = await bench.generateAudio();
        processAudioFile(file, bench.expectedVerdict);
      } catch (err) {
        console.error("Benchmark generation error:", err);
      }
    },
    [processAudioFile]
  );

  const handleHistorySelect = (item: AnalysisResult) => {
    setResult(item);
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar onAnalyzeClick={scrollToUpload} />

      <main className="pt-16">
        <HeroSection onGetStarted={scrollToUpload} />

        <div id="upload">
          <UploadCard
            onFileSelected={(file) => processAudioFile(file)}
            onSelectBenchmark={handleBenchmarkSelect}
            isAnalyzing={stage !== "idle" && stage !== "complete"}
          />
        </div>

        <div id="pipeline">
          <AnalysisPipeline stage={stage} />
        </div>

        {result && (
          <div id="results" className="space-y-12">
            <DetectionResults result={result} />
          </div>
        )}

        {history.length > 0 && (
          <div id="history">
            <HistoryTable entries={history} onSelect={handleHistorySelect} />
          </div>
        )}

        <TrustSummary />
      </main>

      <Footer />
      <FloatingAnalyzeButton onClick={scrollToUpload} visible={stage === "idle" || stage === "complete"} />
    </div>
  );
}
