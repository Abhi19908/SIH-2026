"use client";

import { useState, useEffect } from "react";
import { Shield, Sparkles, Volume2, VolumeX, Cpu, Terminal, ExternalLink } from "lucide-react";
import { isSoundEnabled, setSoundEnabled, playSound } from "@/lib/soundFx";

interface NavbarProps {
  onAnalyzeClick: () => void;
  onOpenArchitecture?: () => void;
}

export default function Navbar({ onAnalyzeClick, onOpenArchitecture }: NavbarProps) {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      setTimeout(() => playSound.click(), 50);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.08] bg-[#06080d]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & SIH Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Shield size={20} className="text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white font-mono">
                VOX<span className="text-cyan-400">GUARD</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                SIH26104
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Neural Audio Forensic Defense
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
          <a
            href="#upload"
            onClick={() => playSound.click()}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all"
          >
            Audit Workspace
          </a>
          <a
            href="#compare"
            onClick={() => playSound.click()}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all flex items-center gap-1 text-cyan-300"
          >
            <Sparkles size={12} /> A/B Compare
          </a>
          <a
            href="#results"
            onClick={() => playSound.click()}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all"
          >
            DSP Analysis
          </a>
          <a
            href="#history"
            onClick={() => playSound.click()}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all"
          >
            Case Archive
          </a>
          {onOpenArchitecture && (
            <button
              onClick={() => {
                playSound.click();
                onOpenArchitecture();
              }}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 cursor-pointer"
            >
              <Cpu size={13} /> Architecture
            </button>
          )}
        </nav>

        {/* Right Tools & CTA */}
        <div className="flex items-center gap-2.5">
          {/* Audio FX Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? "Mute Sci-Fi Audio FX" : "Enable Sci-Fi Audio FX"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              soundOn
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "bg-slate-900 border-white/[0.06] text-slate-500"
            }`}
          >
            {soundOn ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} />}
            <span className="hidden sm:inline text-[11px]">{soundOn ? "SFX ON" : "SFX OFF"}</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/Abhi19908/SIH-2026"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound.click()}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            <Terminal size={13} className="text-slate-400" />
            <span>GitHub</span>
            <ExternalLink size={10} className="text-slate-500 ml-0.5" />
          </a>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              playSound.click();
              onAnalyzeClick();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Run Forensic Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
