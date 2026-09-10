"use client";

import { motion } from "framer-motion";
import { History, FileAudio, ExternalLink } from "lucide-react";
import { verdictLabel, riskLabel, riskColor, verdictColor, pct, formatTimestamp, cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";

interface HistoryTableProps {
  entries: AnalysisResult[];
  onSelect: (entry: AnalysisResult) => void;
}

export default function HistoryTable({ entries, onSelect }: HistoryTableProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs text-slate-400 mb-3">
            <History size={13} />
            Case Review Log
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Previous Analyses</h2>
          <p className="text-slate-400 text-sm">Review past voice forensic reports and case files</p>
        </motion.div>

        {/* ── table container ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">File</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Analyzed</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {entries.map((entry) => {
                  const vc = verdictColor(entry.verdict);
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => onSelect(entry)}
                      className="group cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      {/* file */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <FileAudio size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                          <span className="text-xs font-medium text-white group-hover:text-cyan-300 transition-colors truncate max-w-[140px] sm:max-w-[200px]">
                            {entry.fileName}
                          </span>
                        </div>
                      </td>

                      {/* verdict */}
                      <td className="py-3.5 px-4">
                        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", vc.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", entry.verdict === "human" ? "bg-emerald-400" : entry.verdict === "cloned" ? "bg-red-400" : "bg-amber-400")} />
                          {verdictLabel(entry.verdict)}
                        </span>
                      </td>

                      {/* confidence */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-mono text-slate-300">{pct(entry.confidence)}</span>
                      </td>

                      {/* risk */}
                      <td className="py-3.5 px-4">
                        <span className={cn("text-xs font-medium", riskColor(entry.riskLevel))}>
                          {riskLabel(entry.riskLevel)}
                        </span>
                      </td>

                      {/* timestamp */}
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</span>
                      </td>

                      {/* action */}
                      <td className="py-3.5 px-5 text-right">
                        <button className="text-slate-500 group-hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
