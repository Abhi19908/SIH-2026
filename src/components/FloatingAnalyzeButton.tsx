"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface FloatingAnalyzeButtonProps {
  onClick: () => void;
  visible: boolean;
}

export default function FloatingAnalyzeButton({ onClick, visible }: FloatingAnalyzeButtonProps) {
  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all"
    >
      <Zap size={15} />
      Quick Analyze
    </motion.button>
  );
}
