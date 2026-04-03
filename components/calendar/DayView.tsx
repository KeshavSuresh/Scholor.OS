"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BLOCK_COLORS } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2 } from "lucide-react";
import type { BlockType } from "@/lib/types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BLOCK_TYPES = Object.keys(BLOCK_COLORS) as BlockType[];

interface AddForm {
  hour: number;
  label: string;
  type: BlockType;
  endHour: string;
}

export function DayView({ date }: { date: Date }) {
  const dateStr = date.toISOString().slice(0, 10);
  const { blocks, addBlock, removeBlock } = useAppStore();
  const dayBlocks = blocks
    .filter((b) => b.date === dateStr)
    .sort((a, b) => a.startHour - b.startHour);

  const [modal, setModal] = useState<AddForm | null>(null);

  const openModal = (hour: number) => {
    setModal({ hour, label: "", type: "Study", endHour: String(hour + 1) });
  };

  const submit = () => {
    if (!modal || !modal.label.trim()) return;
    const end = parseInt(modal.endHour);
    addBlock({
      date: dateStr,
      startHour: modal.hour,
      endHour: Math.max(modal.hour + 1, isNaN(end) ? modal.hour + 1 : end),
      label: modal.label,
      type: modal.type,
    });
    setModal(null);
  };

  const isOccupied = (hour: number) =>
    dayBlocks.some((b) => b.startHour < hour && b.endHour > hour);

  const hasConflict = (hour: number) =>
    dayBlocks.filter((b) => b.startHour <= hour && b.endHour > hour).length > 1;

  return (
    <>
      <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "52px 1fr" }}>
          {HOURS.map((hour) => {
            const block = dayBlocks.find((b) => b.startHour === hour);
            const occupied = isOccupied(hour);
            const conflict = hasConflict(hour);
            const canAdd = !occupied && !block;

            return (
              <>
                {/* Hour label */}
                <div
                  key={`h-${hour}`}
                  className="border-b border-[#2a2a35] px-2 py-3 text-right shrink-0"
                >
                  <span className="text-[10px] text-[#6b6b80] font-mono">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>

                {/* Slot */}
                <div
                  key={`s-${hour}`}
                  className={`border-b border-[#2a2a35] min-h-[52px] relative group transition-colors ${
                    canAdd ? "cursor-pointer hover:bg-[#18181f]" : ""
                  } ${conflict ? "bg-[#ff6a5e]/5" : ""}`}
                  onClick={() => canAdd && openModal(hour)}
                >
                  {/* Existing block */}
                  {block && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-x-1 top-1 rounded-lg px-3 py-2 flex items-start justify-between gap-2"
                      style={{
                        background: BLOCK_COLORS[block.type] + "22",
                        borderLeft: `3px solid ${BLOCK_COLORS[block.type]}`,
                        minHeight: `${(block.endHour - block.startHour) * 52 - 8}px`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: BLOCK_COLORS[block.type] }}
                        >
                          {block.label}
                        </p>
                        <p className="text-[10px] text-[#6b6b80] mt-0.5">
                          {block.type} · {block.startHour}:00 – {block.endHour}:00
                        </p>
                      </div>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="text-[#6b6b80] hover:text-[#ff6a5e] transition-colors shrink-0 mt-0.5"
                        title="Remove block"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  )}

                  {/* Add hint */}
                  {canAdd && (
                    <div className="absolute inset-0 flex items-center justify-end pr-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Plus size={13} className="text-[#6b6b80]" />
                    </div>
                  )}
                </div>
              </>
            );
          })}
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
                placeholder="Label (e.g. Calculus lecture)"
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

              {/* Color preview */}
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
