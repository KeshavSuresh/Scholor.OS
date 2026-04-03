"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BLOCK_COLORS, todayStr } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2 } from "lucide-react";
import type { BlockType } from "@/lib/types";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–midnight
const BLOCK_TYPES = Object.keys(BLOCK_COLORS) as BlockType[];

interface AddForm {
  dateStr: string;
  hour: number;
  label: string;
  type: BlockType;
  endHour: string;
}

export function WeekView({ date }: { date: Date }) {
  const { blocks, addBlock, removeBlock } = useAppStore();
  const today = todayStr();
  const [modal, setModal] = useState<AddForm | null>(null);

  // Get Monday of the week
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const openModal = (dateStr: string, hour: number) => {
    setModal({ dateStr, hour, label: "", type: "Study", endHour: String(hour + 1) });
  };

  const submit = () => {
    if (!modal || !modal.label.trim()) return;
    const end = parseInt(modal.endHour);
    addBlock({
      date: modal.dateStr,
      startHour: modal.hour,
      endHour: Math.max(modal.hour + 1, isNaN(end) ? modal.hour + 1 : end),
      label: modal.label,
      type: modal.type,
    });
    setModal(null);
  };

  return (
    <>
      <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl overflow-auto">
        <div className="grid min-w-[600px]" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          {/* Header */}
          <div className="border-b border-[#2a2a35]" />
          {days.map((d) => {
            const ds = d.toISOString().slice(0, 10);
            const isToday = ds === today;
            return (
              <div
                key={ds}
                className={`border-b border-l border-[#2a2a35] px-2 py-2 text-center ${
                  isToday ? "bg-[#7c6aff]/10" : ""
                }`}
              >
                <p className="text-[10px] text-[#6b6b80]">
                  {d.toLocaleDateString("en-CA", { weekday: "short" })}
                </p>
                <p className={`text-sm font-medium ${isToday ? "text-[#7c6aff]" : ""}`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <>
              <div key={`h-${hour}`} className="border-b border-[#2a2a35] px-1 py-1 text-right">
                <span className="text-[9px] text-[#6b6b80] font-mono">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
              {days.map((d) => {
                const ds = d.toISOString().slice(0, 10);
                const block = blocks.find((b) => b.date === ds && b.startHour === hour);
                const occupied = blocks.some(
                  (b) => b.date === ds && b.startHour < hour && b.endHour > hour
                );
                const canAdd = !block && !occupied;

                return (
                  <div
                    key={`${ds}-${hour}`}
                    className={`border-b border-l border-[#2a2a35] min-h-[36px] relative group ${
                      canAdd ? "cursor-pointer hover:bg-[#18181f]" : ""
                    } transition-colors`}
                    onClick={() => canAdd && openModal(ds, hour)}
                  >
                    {block && (
                      <div
                        className="absolute inset-x-0.5 top-0.5 rounded px-1 py-0.5 flex items-center justify-between gap-1"
                        style={{
                          background: BLOCK_COLORS[block.type] + "33",
                          borderLeft: `2px solid ${BLOCK_COLORS[block.type]}`,
                          minHeight: `${(block.endHour - block.startHour) * 36 - 4}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="text-[9px] truncate flex-1"
                          style={{ color: BLOCK_COLORS[block.type] }}
                        >
                          {block.label}
                        </span>
                        <button
                          onClick={() => removeBlock(block.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#6b6b80] hover:text-[#ff6a5e] transition-all shrink-0"
                        >
                          <X size={9} />
                        </button>
                      </div>
                    )}
                    {canAdd && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Plus size={10} className="text-[#6b6b80]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Add Block Modal */}
      <AnimatePresence>
        {modal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold font-syne">
                  Add Block · {modal.hour.toString().padStart(2, "0")}:00
                </h2>
                <button onClick={() => setModal(null)} className="text-[#6b6b80] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <input
                className="input-field"
                placeholder="Label (e.g. Study session)"
                value={modal.label}
                onChange={(e) => setModal({ ...modal, label: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#6b6b80] mb-1 block">Type</label>
                  <select
                    className="input-field"
                    value={modal.type}
                    onChange={(e) => setModal({ ...modal, type: e.target.value as BlockType })}
                  >
                    {BLOCK_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#6b6b80] mb-1 block">End hour</label>
                  <input
                    type="number"
                    min={modal.hour + 1}
                    max={24}
                    className="input-field"
                    value={modal.endHour}
                    onChange={(e) => setModal({ ...modal, endHour: e.target.value })}
                  />
                </div>
              </div>

              <div
                className="rounded-lg px-3 py-2 text-sm font-medium"
                style={{
                  background: BLOCK_COLORS[modal.type] + "22",
                  borderLeft: `3px solid ${BLOCK_COLORS[modal.type]}`,
                  color: BLOCK_COLORS[modal.type],
                }}
              >
                {modal.label || "Preview"} · {modal.hour}:00 – {modal.endHour || modal.hour + 1}:00
              </div>

              <button
                className="btn-primary w-full py-2 disabled:opacity-40"
                onClick={submit}
                disabled={!modal.label.trim()}
              >
                Add Block
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
