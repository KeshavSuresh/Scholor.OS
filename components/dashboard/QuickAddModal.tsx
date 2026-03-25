"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { todayStr } from "@/lib/utils";
import type { BlockType, Priority } from "@/lib/types";

type Tab = "task" | "block";

export function QuickAddModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("task");
  const { courses, addAssignment, addBlock } = useAppStore();

  // Task form
  const [taskName, setTaskName] = useState("");
  const [taskCourse, setTaskCourse] = useState(courses[0]?.id ?? "");
  const [taskDue, setTaskDue] = useState(todayStr());
  const [taskPriority, setTaskPriority] = useState<Priority>("Medium");

  // Block form
  const [blockLabel, setBlockLabel] = useState("");
  const [blockDate, setBlockDate] = useState(todayStr());
  const [blockStart, setBlockStart] = useState(9);
  const [blockEnd, setBlockEnd] = useState(10);
  const [blockType, setBlockType] = useState<BlockType>("Study");

  const submitTask = () => {
    if (!taskName.trim()) return;
    addAssignment({ name: taskName, courseId: taskCourse, dueDate: taskDue, priority: taskPriority, estimatedHours: 1, status: "Not Started" });
    onClose();
  };

  const submitBlock = () => {
    if (!blockLabel.trim()) return;
    addBlock({ label: blockLabel, date: blockDate, startHour: blockStart, endHour: blockEnd, type: blockType });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold font-syne">Quick Add</h2>
          <button onClick={onClose} className="text-[#6b6b80] hover:text-white"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#18181f] rounded-lg p-1 gap-1">
          {(["task", "block"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-md text-sm capitalize transition-colors ${tab === t ? "bg-[#2a2a35] text-white" : "text-[#6b6b80]"}`}>
              {t === "task" ? "Assignment" : "Time Block"}
            </button>
          ))}
        </div>

        {tab === "task" ? (
          <div className="space-y-3">
            <input className="input-field" placeholder="Assignment name" value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitTask()} autoFocus />
            <select className="input-field" value={taskCourse} onChange={(e) => setTaskCourse(e.target.value)}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" className="input-field" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
            <select className="input-field" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as Priority)}>
              {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <button className="btn-primary w-full py-2" onClick={submitTask}>Add Assignment</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input className="input-field" placeholder="Block label" value={blockLabel}
              onChange={(e) => setBlockLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitBlock()} autoFocus />
            <input type="date" className="input-field" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#6b6b80] mb-1 block">Start Hour</label>
                <input type="number" min={0} max={23} className="input-field" value={blockStart}
                  onChange={(e) => setBlockStart(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-[#6b6b80] mb-1 block">End Hour</label>
                <input type="number" min={1} max={24} className="input-field" value={blockEnd}
                  onChange={(e) => setBlockEnd(Number(e.target.value))} />
              </div>
            </div>
            <select className="input-field" value={blockType} onChange={(e) => setBlockType(e.target.value as BlockType)}>
              {["Study", "Class", "Work", "Gym", "Break", "Sleep", "Personal"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <button className="btn-primary w-full py-2" onClick={submitBlock}>Add Block</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
