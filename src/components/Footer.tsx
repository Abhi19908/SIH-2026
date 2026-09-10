import { Shield, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#05070a] py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
            <Shield size={16} className="text-cyan-400" />
          </div>
          <span className="text-sm font-bold text-white">
            Vox<span className="text-cyan-400">Guard</span>
          </span>
          <span className="text-xs text-slate-500">&middot; Smart India Hackathon 2026</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span>Problem Statement: SIH26104</span>
          <span>&middot;</span>
          <span>Voice-Cloning Detection</span>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          Built with <Heart size={12} className="text-red-400 fill-red-400" /> for SIH 2026
        </div>
      </div>
    </footer>
  );
}
