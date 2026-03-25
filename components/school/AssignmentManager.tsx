"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { formatDate, todayStr } from "@/lib/utils";
import type { AssignmentStatus, Priority } from "@/lib/types";

const STATUSES: AssignmentStatus[] = ["Not Started", "In Progress", "Submitted", "Graded"];
const STATUS_COLORS: Record<AssignmentStatus, string> = {
  "Not Started": "#6b6b80",
  "In Progress": "#7c6aff",
  "Submitted": "#00e5a0",
  "Graded": "#ffd166",
};

export function AssignmentManager() {
  const { assignments, courses, addAssignment, updateAssignment, removeAssignment } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", courseId: "", dueDate: todayStr(), priority: "Medium" as Priority, estimatedHours: "1" });

  const submit = () => {
    if (!form.name.trim()) return;
    addAssignment({ ...form, estimatedHours: parseFloat(form.estimatedHours) || 1, status: "Not Started", courseId: form.courseId || courses[0]?.id });
    setForm({ name: "", courseId: "", dueDate: todayStr(), priority: "Medium", estimatedHours: "1" });
    setShowForm(false);
  };

  const today = todayStr();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold font-syne">Assignments</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#7c6aff] hover:opacity-85 text-white px-3 py-1.5 rounded-lg text-sm transition-opacity">
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#111118] border border-[#2a2a35] rounded-xl p-4 space-y-3">
          <input className="input-field" placeholder="Assignment name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <select className="input-field" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <input type="number" className="input-field" placeholder="Est. hours" value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1 py-2 text-sm" onClick={submit}>Add Assignment</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 text-[#6b6b80] hover:text-white"><X size={16} /></button>
          </div>
        </motion.div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-12 text-[#6b6b80]">
          <p className="text-3xl mb-2">📝</p>
          <p>No assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => {
            const course = courses.find((c) => c.id === a.courseId);
            const isOverdue = a.dueDate < today && a.status !== "Graded" && a.status !== "Submitted";
            return (
              <motion.div key={a.id} layout
                className="bg-[#111118] border border-[#2a2a35] rounded-xl p-3 flex items-center gap-3">
                <div className="w-1 h-10 rounded-full shrink-0" style={{ background: course?.color ?? "#6b6b80" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className={`text-xs ${isOverdue ? "text-[#ff6a5e]" : "text-[#6b6b80]"}`}>
                    {course?.name} · {isOverdue ? "Overdue · " : ""}{formatDate(a.dueDate)}
                  </p>
                </div>
                <select
                  value={a.status}
                  onChange={(e) => updateAssignment(a.id, { status: e.target.value as AssignmentStatus })}
                  className="text-xs rounded-lg px-2 py-1 border border-[#2a2a35] bg-[#18181f] outline-none"
                  style={{ color: STATUS_COLORS[a.status] }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => removeAssignment(a.id)} className="text-[#6b6b80] hover:text-[#ff6a5e] transition-colors">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
