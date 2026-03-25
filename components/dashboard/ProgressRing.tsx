"use client";
import { motion } from "framer-motion";

interface Props { pct: number; color: string; size?: number; stroke?: number; }

export function ProgressRing({ pct, color, size = 64, stroke = 6 }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a35" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="middle"
        className="rotate-90"
        style={{ fill: "#f0f0f5", fontSize: size * 0.22, fontFamily: "DM Mono", transform: `rotate(90deg) translate(0, -${size}px)` }}
      />
    </svg>
  );
}
