"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CourseCard } from "./CourseCard";
import { AssignmentManager } from "./AssignmentManager";
import { GPACalculator } from "./GPACalculator";
import { Plus, X } from "lucide-react";
import { generateId } from "@/lib/utils";
import { motion } from "framer-motion";

const COURSE_COLORS = ["#00e5a0", "#7c6aff", "#ff6a5e", "#ffd166", "#60a5fa", "#f472b6", "#34d399"];

type Tab = "grades" | "assignments" | "gpa";

export function SchoolPage() {
  const { courses, addCourse } = useAppStore();
  const [tab, setTab] = useState<Tab>("grades");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COURSE_COLORS[3]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCourse(newName.trim(), newColor);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-syne">School</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#7c6aff] hover:opacity-85 text-white px-4 py-2 rounded-xl text-sm font-medium transition-opacity">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#111118] border border-[#2a2a35] rounded-xl p-1 gap-1 w-fit">
        {(["grades", "assignments", "gpa"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${tab === t ? "bg-[#18181f] text-white font-medium" : "text-[#6b6b80] hover:text-white"}`}>
            {t === "gpa" ? "GPA" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "grades" && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-16 text-[#6b6b80]">
              <p className="text-4xl mb-3">📚</p>
              <p>No courses yet. Add one to get started.</p>
            </div>
          ) : (
            courses.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <CourseCard course={course} />
              </motion.div>
            ))
          )}
        </div>
      )}

      {tab === "assignments" && <AssignmentManager />}
      {tab === "gpa" && <GPACalculator />}

      {/* Add Course Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold font-syne">New Course</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#6b6b80] hover:text-white"><X size={18} /></button>
            </div>
            <input className="input-field" placeholder="Course name" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()} autoFocus />
            <div>
              <label className="text-xs text-[#6b6b80] mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COURSE_COLORS.map((c) => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <button className="btn-primary w-full py-2" onClick={handleAdd}>Add Course</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
