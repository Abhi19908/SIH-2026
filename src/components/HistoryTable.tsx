"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  FileAudio,
  ExternalLink,
  Search,
  Download,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import {
  verdictLabel,
  riskLabel,
  riskColor,
  verdictColor,
  pct,
  formatTimestamp,
  cn,
} from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";
import { playSound } from "@/lib/soundFx";

interface HistoryTableProps {
  entries: AnalysisResult[];
  onSelect: (entry: AnalysisResult) => void;
}

export default function HistoryTable({ entries, onSelect }: HistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<string>("all");

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict =
      filterVerdict === "all" || entry.verdict === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  const exportCSV = () => {
    playSound.click();
    const headers = ["Case_ID", "File_Name", "Verdict", "Confidence", "Authenticity", "Risk_Level", "SHA256", "Timestamp"];
    const rows = entries.map((e) => [
      e.id,
      `"${e.fileName.replace(/"/g, '""')}"`,
      e.verdict,
      `${pct(e.confidence)}`,
      `${pct(e.overallScore)}`,
      e.riskLevel,
      e.audio.sha256,
      e.timestamp,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voxguard_forensic_case_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="history" className="py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-2">
              <History size={12} /> Forensic Case Archive
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Evidence Audit Log &amp; Case History
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Review and cross-reference verified forensic examination results with SHA-256 chain of custody.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Download size={14} className="text-cyan-400" />
              <span>Export CSV Case Log</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file or case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Verdict Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: "all", label: "All Cases" },
              { id: "human", label: "Authentic Human" },
              { id: "cloned", label: "AI Deepfakes" },
              { id: "suspicious", label: "Suspicious" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playSound.click();
                  setFilterVerdict(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  filterVerdict === tab.id
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400">
                <tr>
                  <th className="py-3.5 px-5">Case Identifier</th>
                  <th className="py-3.5 px-4">Audio Sample</th>
                  <th className="py-3.5 px-4">Forensic Verdict</th>
                  <th className="py-3.5 px-4">Authenticity</th>
                  <th className="py-3.5 px-4">Risk Severity</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Analyzed At</th>
                  <th className="py-3.5 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No matching forensic records found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const vc = verdictColor(entry.verdict);
                    const VerdictIcon =
                      entry.verdict === "human"
                        ? ShieldCheck
                        : entry.verdict === "cloned"
                        ? ShieldAlert
                        : AlertTriangle;

                    return (
                      <tr
                        key={entry.id}
                        onClick={() => {
                          playSound.click();
                          onSelect(entry);
                        }}
                        className="group cursor-pointer hover:bg-cyan-500/[0.03] transition-colors"
                      >
                        {/* Case ID */}
                        <td className="py-3.5 px-5">
                          <span className="text-cyan-400 font-bold group-hover:text-cyan-300 transition-colors">
                            {entry.id}
                          </span>
                        </td>

                        {/* File Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <FileAudio size={15} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                            <span className="text-white font-medium truncate max-w-[160px] sm:max-w-[220px]">
                              {entry.fileName}
                            </span>
                          </div>
                        </td>

                        {/* Verdict */}
                        <td className="py-3.5 px-4">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold", vc.text, vc.ring, vc.bg)}>
                            <VerdictIcon size={12} />
                            {verdictLabel(entry.verdict)}
                          </span>
                        </td>

                        {/* Authenticity Score */}
                        <td className="py-3.5 px-4">
                          <span className="text-white font-bold">{pct(entry.overallScore)}</span>
                        </td>

                        {/* Risk */}
                        <td className="py-3.5 px-4">
                          <span className={cn("font-bold uppercase text-[11px]", riskColor(entry.riskLevel))}>
                            {riskLabel(entry.riskLevel)}
                          </span>
                        </td>

                        {/* Analyzed At */}
                        <td className="py-3.5 px-4 hidden md:table-cell text-slate-400">
                          {formatTimestamp(entry.timestamp)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right">
                          <button className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-cyan-500/20 group-hover:text-cyan-300 text-slate-400 transition-all">
                            <ExternalLink size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
