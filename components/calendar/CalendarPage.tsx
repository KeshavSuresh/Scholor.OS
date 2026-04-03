"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { todayStr, BLOCK_COLORS } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { BlockType } from "@/lib/types";

type View = "day" | "week" | "month";
const BLOCK_TYPES = Object.keys(BLOCK_COLORS) as BlockType[];

export function CalendarPage() {
  const { addBlock } = useAppStore();
  const [view, setView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    date: todayStr(),
    label: "",
    type: "Study" as BlockType,
    startHour: "9",
    endHour: "10",
  });

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const label = currentDate.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
    ...(view === "day" ? { day: "numeric", weekday: "long" } : {}),
  });

  const submitBlock = () => {
    if (!form.label.trim()) return;
    const start = parseInt(form.startHour);
    const end = parseInt(form.endHour);
    addBlock({
      date: form.date,
      label: form.label,
      type: form.type,
      startHour: isNaN(start) ? 9 : start,
      endHour: isNaN(end) ? 10 : Math.max((isNaN(start) ? 9 : start) + 1, end),
    });
    setShowAdd(false);
    setForm({ date: todayStr(), label: "", type: "Study", startHour: "9", endHour: "10" });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg bg-[#111118] border border-[#2a2a35] hover:border-[#7c6aff] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h1 className="text-lg font-bold font-syne capitalize">{label}</h1>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg bg-[#111118] border border-[#2a2a35] hover:border-[#7c6aff] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs text-[#6b6b80] hover:text-white px-2 py-1 rounded-lg border border-[#2a2a35] transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#7c6aff] hover:opacity-85 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-opacity"
          >
            <Plus size={15} /> Add Block
          </button>
          <div className="flex bg-[#111118] border border-[#2a2a35] rounded-xl p-1 gap-1">
            {(["day", "week", "month"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                  view === v ? "bg-[#18181f] text-white font-medium" : "text-[#6b6b80] hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "day" && <DayView date={currentDate} />}
      {view === "week" && <WeekView date={currentDate} />}
      {view === "month" && (
        <MonthView
          date={currentDate}
          onDayClick={(d) => {
            setCurrentDate(d);
            setView("day");
          }}
        />
      )}

      {/* Add Block Modal */}
      <AnimatePresence>
        {showAdd && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold font-syne">Add Time Block</h2>
                <button onClick={() => setShowAdd(false)} className="text-[#6b6b80] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <input
                className="input-field"
                placeholder="Label (e.g. Calculus lecture)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && submitBlock()}
                autoFocus
              />

              <div>
                <label className="text-xs text-[#6b6b80] mb-1 block">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs text-[#6b6b80] mb-1 block">Type</label>
                  <select
                    className="input-field"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as BlockType })}
                  >
                    {BLOCK_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#6b6b80] mb-1 block">Start</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="input-field text-center"
                    value={form.startHour}
                    onChange={(e) => setForm({ ...form, startHour: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6b6b80] mb-1 block">End</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    className="input-field text-center"
                    value={form.endHour}
                    onChange={(e) => setForm({ ...form, endHour: e.target.value })}
                  />
                </div>
              </div>

              {/* Preview */}
              <div
                className="rounded-lg px-3 py-2 text-sm font-medium"
                style={{
                  background: BLOCK_COLORS[form.type] + "22",
                  borderLeft: `3px solid ${BLOCK_COLORS[form.type]}`,
                  color: BLOCK_COLORS[form.type],
                }}
              >
                {form.label || "Preview"} · {form.startHour}:00 – {form.endHour}:00
              </div>

              <button
                className="btn-primary w-full py-2 disabled:opacity-40"
                onClick={submitBlock}
                disabled={!form.label.trim()}
              >
                Add Block
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
