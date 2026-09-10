"use client";

import { motion } from "framer-motion";
import type { ForensicRadarScores } from "@/lib/types";

interface RadarChartProps {
  scores: ForensicRadarScores;
  className?: string;
}

interface AxisPoint {
  key: keyof ForensicRadarScores;
  label: string;
  angle: number;
}

const AXES: AxisPoint[] = [
  { key: "spectralIntegrity", label: "Spectral Integrity", angle: 0 },
  { key: "prosodicNaturalness", label: "Prosody Naturalness", angle: 60 },
  { key: "temporalCoherence", label: "Temporal Coherence", angle: 120 },
  { key: "harmonicStructure", label: "Harmonic Structure", angle: 180 },
  { key: "formantDynamics", label: "Formant Dynamics", angle: 240 },
  { key: "phaseContinuity", label: "Phase Continuity", angle: 300 },
];

export default function RadarChart({ scores, className }: RadarChartProps) {
  const size = 280;
  const center = size / 2;
  const radius = 95;
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Convert polar coordinates to Cartesian
  const polarToCartesian = (angleDeg: number, distance: number) => {
    // Angle -90 degrees so that angle 0 points straight up
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: center + distance * Math.cos(angleRad),
      y: center + distance * Math.sin(angleRad),
    };
  };

  // Generate web polygon paths
  const getLevelPolygon = (factor: number) => {
    return AXES.map((axis) => {
      const pt = polarToCartesian(axis.angle, radius * factor);
      return `${pt.x},${pt.y}`;
    }).join(" ");
  };

  // Generate data polygon path
  const dataPoints = AXES.map((axis) => {
    const rawVal = scores[axis.key] ?? 50;
    const normalized = Math.max(5, Math.min(100, rawVal)) / 100;
    return polarToCartesian(axis.angle, radius * normalized);
  });

  const dataPolygonString = dataPoints.map((pt) => `${pt.x},${pt.y}`).join(" ");

  // Calculate average authenticity score
  const avgScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  const getPolygonFill = () => {
    if (avgScore >= 70) return "rgba(16, 185, 129, 0.25)"; // Emerald
    if (avgScore <= 45) return "rgba(239, 68, 68, 0.25)"; // Red
    return "rgba(245, 158, 11, 0.25)"; // Amber
  };

  const getPolygonStroke = () => {
    if (avgScore >= 70) return "#10b981";
    if (avgScore <= 45) return "#ef4444";
    return "#f59e0b";
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className || ""}`}>
      <div className="relative w-[280px] h-[280px]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
        >
          {/* Background Grid Hexagons */}
          {levels.map((lvl, idx) => (
            <polygon
              key={idx}
              points={getLevelPolygon(lvl)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={idx === levels.length - 1 ? "1.5" : "1"}
              strokeDasharray={idx === levels.length - 1 ? undefined : "3 3"}
            />
          ))}

          {/* Radial Spokes */}
          {AXES.map((axis, i) => {
            const endPt = polarToCartesian(axis.angle, radius);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={endPt.x}
                y2={endPt.y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* Reference baseline ring for 50% */}
          <polygon
            points={getLevelPolygon(0.5)}
            fill="none"
            stroke="rgba(6, 182, 212, 0.3)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Forensic Data Filled Polygon */}
          <motion.polygon
            points={dataPolygonString}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            fill={getPolygonFill()}
            stroke={getPolygonStroke()}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Data Points on vertices */}
          {dataPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#ffffff"
              stroke={getPolygonStroke()}
              strokeWidth="2"
            />
          ))}

          {/* Axis Labels */}
          {AXES.map((axis, i) => {
            const labelPt = polarToCartesian(axis.angle, radius + 22);
            const val = scores[axis.key] ?? 0;
            return (
              <g key={i}>
                <text
                  x={labelPt.x}
                  y={labelPt.y - 4}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-slate-300 text-[9px] font-medium tracking-tight"
                >
                  {axis.label}
                </text>
                <text
                  x={labelPt.x}
                  y={labelPt.y + 7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-cyan-400 font-mono text-[9px] font-bold"
                >
                  {val}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Radar</span>
          <span className="text-sm font-bold font-mono text-white">{avgScore}%</span>
        </div>
      </div>
    </div>
  );
}
