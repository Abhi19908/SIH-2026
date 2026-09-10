"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Scale, Lock } from "lucide-react";

export default function TrustSummary() {
  const cards = [
    {
      icon: Shield,
      title: "Why this detection is trustworthy",
      description:
        "VoxGuard uses multi-head neural architectures trained on over 500,000 genuine and synthetic speech samples across diverse languages, accents, and recording environments.",
      color: "text-cyan-400",
      border: "border-cyan-500/15",
      bg: "bg-cyan-500/[0.03]",
    },
    {
      icon: Lock,
      title: "How it prevents fraud",
      description:
        "Real-time voice verification protects call centers, banking channels, and executive communications from unauthorized voice-cloning attacks and social engineering.",
      color: "text-emerald-400",
      border: "border-emerald-500/15",
      bg: "bg-emerald-500/[0.03]",
    },
    {
      icon: Sparkles,
      title: "What makes cloned speech detectable",
      description:
        "Neural vocoders leave subtle frame-boundary artifacts, lack natural micro-prosodic perturbations, and generate unnaturally symmetric harmonic overtone profiles.",
      color: "text-indigo-400",
      border: "border-indigo-500/15",
      bg: "bg-indigo-500/[0.03]",
    },
    {
      icon: Scale,
      title: "Forensic standard compliance",
      description:
        "Every analysis generates an auditable, reproducible forensic report with exact feature scores, suitable for legal, compliance, and investigative proceedings.",
      color: "text-amber-400",
      border: "border-amber-500/15",
      bg: "bg-amber-500/[0.03]",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs text-slate-400 mb-3">
            <Shield size={13} className="text-cyan-400" />
            Judge &amp; Evaluator Reference
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Forensic Intelligence Architecture</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Understanding the technology, methodology, and fraud-prevention impact of VoxGuard
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border p-6 ${card.border} ${card.bg} backdrop-blur-sm`}
              >
                <div className={`p-3 rounded-xl border w-fit mb-4 ${card.border} bg-black/20`}>
                  <Icon size={22} className={card.color} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
