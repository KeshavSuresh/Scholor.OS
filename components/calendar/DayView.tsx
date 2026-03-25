"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BLOCK_COLORS } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, X, Trash2 } from "lucide-react";
import type { BlockType } from "@/lib/types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DayView({ date }: { date: Date }) {
  const dateStr = date.toISOString().slice(0, 10);
  const { blocks, addBlock, removeBlock } = useAppStore();
  const dayBlocks = blocks.filter((b) => b.date === dateStr).sort((a, b) => a.startHour - b.startHour);

  const [adding, setAdding] = useState<number | null>(null);
  const [form, setForm] = useState({ label: "", type: "Study" as BlockType, end: 1 });

  const submit = () => {
    if (!form.label.trim() || adding === null) return;
    addBlock({ date: dateStr, startHour: adding, endHour: Math.max(adding + 1, form.end), label: form.label, type: form.type });
    setAdding(null);
    setForm({ label: "", type: "Study", end: 1 });
  };

  // Conflict detection
  const hasConflict = (hour: number) => {
    const overlapping = dayBlocks.filter((b) => b.startHour <= hour && b.endHour > hour);
    return overlapping.length > 1;
  };

  return (
    <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: "48px 1fr" }}>
        {HOURS.map((hour) => {
          const block = dayBlocks.find((b) => b.startHour === hour);
          const occupied = dayBlocks.some((b) => b.startHour < hour && b.endHour > hour);
          const conflict = hasConflict(hour);

          return (
            <>
              {/* Hour label */}
              <div key={`h-${hour}`} className="border-b border-[#2a2a35] px-2 py-2 text-right">
                <span className="text-[10px] text-[#6b6b80] font-mono">{hour.toString().padStart(2, "0")}:00</span>
              </div>

              {/* Slot */}
              <div key={`s-${hour}`}
                className={`border-b border-[#2a2a35] min-h-[48px] relative cursor-pointer group transition-colors ${
                  !occupied && !block ? "hover:bg-[#18181f]" : ""
                } ${conflict ? "bg-[#ff6a5e]/5" : ""}`}
                onClick={() => !occupied && !block && setAdding(hour)}>
                {block && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-x-1 top-1 rounded-lg px-2 py-1 flex items-center justify-between"
                    style={{
                      background: BLOCK_COLORS[block.type] + "22",
                      borderLeft: `3px solid ${BLOCK_COLORS[block.type]}`,
                      minHeight: `${(block.endHour - block.startHour) * 48 - 8}px`,
                    }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: BLOCK_COLORS[block.type] }}>{block.label}</p>
                      <p className="text-[10px] text-[#6b6b80]">{block.type} · {block.startHour}:00–{block.endHour}:00</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                      className="opacity-0 group-hover:opacity-100 text-[#6b6b80] hover:text-[#ff6a5e] transition-all">
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                )}
                {adding === hour && (
                  <div className="absolute inset-x-1 top-1 z-10 bg-[#18181f] border border-[#7c6aff] rounded-lg p-2 space-y-1.5"
                    onClick={(e) => e.stopPropagation()}>
                    <input className="input-field text-xs py-1" placeholder="Block label" value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus />
                    <div className="flex gap-1.5">
                      <select className="input-field text-xs py-1 flex-1" value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as BlockType })}>
                        {Object.keys(BLOCK_COLORS).map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input type="number" min={hour + 1} max={24} className="input-field text-xs py-1 w-16 text-center"
                        placeholder="End" value={form.end || ""}
                        onChange={(e) => setForm({ ...form, end: parseInt(e.target.value) })} />
                    </div>
                    <div className="flex gap-1">
                      <button className="btn-primary flex-1 py-1 text-xs" onClick={submit}>Add</button>
                      <button onClick={() => setAdding(null)} className="text-[#6b6b80] hover:text-white px-2"><X size={12} /></button>
                    </div>
                  </div>
                )}
                {!occupied && !block && adding !== hour && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={12} className="text-[#6b6b80]" />
                  </div>
                )}
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}
