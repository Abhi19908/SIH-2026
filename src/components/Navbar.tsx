"use client";

import { Shield, Sparkles } from "lucide-react";

interface NavbarProps {
  onAnalyzeClick: () => void;
}

export default function Navbar({ onAnalyzeClick }: NavbarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-white/[0.04] bg-[#07090e]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/15">
            <Shield size={18} className="text-cyan-400" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Vox<span className="text-cyan-400">Guard</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-mono">
            v2.4
          </span>
        </div>

        {/* links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400">
          <a href="#upload" className="hover:text-white transition-colors">
            Upload
          </a>
          <a href="#pipeline" className="hover:text-white transition-colors">
            Pipeline
          </a>
          <a href="#results" className="hover:text-white transition-colors">
            Results
          </a>
          <a href="#explain" className="hover:text-white transition-colors">
            Forensics
          </a>
          <a href="#history" className="hover:text-white transition-colors">
            Cases
          </a>
        </nav>

        {/* CTA */}
        <button
          onClick={onAnalyzeClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/15 transition-all"
        >
          <Sparkles size={13} />
          Analyze Now
        </button>
      </div>
    </header>
  );
}
