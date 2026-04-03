"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CourseCard } from "./CourseCard";
import { AssignmentManager } from "./AssignmentManager";
import { GPACalculator } from "./GPACalculator";
import { Plus, X, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const COURSE_COLORS = ["#00e5a0", "#7c6aff", "#ff6a5e", "#ffd166", "#60a5fa", "#f472b6", "#34d399"];

type Tab = "grades" | "assignments" | "gpa";

interface CategoryDraft {
  name: string;
  weight: string;
}

const DEFAULT_CATEGORIES: CategoryDraft[] = [
  { name: "", weight: "" },
];

export function SchoolPage() {
  const { courses, addCourse } = useAppStore();
  const [tab, setTab] = useState<Tab>("grades");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COURSE_COLORS[0]);
  const [categories, setCategories] = useState<CategoryDraft[]>(DEFAULT_CATEGORIES);

  const totalWeight = categories.reduce((s, c) => s + (parseFloat(c.weight) || 0), 0);
  const weightOk = Math.abs(totalWeight - 100) < 0.01;

  const updateCategory = (i: number, field: keyof CategoryDraft, value: string) => {
    setCategories((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const addCategory = () => setCategories((prev) => [...prev, { name: "", weight: "" }]);

  const removeCategory = (i: number) =>
    setCategories((prev) => prev.filter((_, idx) => idx !== i));

  const handleAdd = () => {
    if (!newName.trim() || !weightOk) return;
    const validCats = categories.filter((c) => c.name.trim() && parseFloat(c.weight) > 0);
    if (!validCats.length) return;
    addCourse(
      newName.trim(),
      newColor,
      validCats.map((c) => ({ name: c.name.trim(), weight: parseFloat(c.weight) }))
    );
    setNewName("");
    setNewColor(COURSE_COLORS[0]);
    setCategories(DEFAULT_CATEGORIES);
    setShowAdd(false);
  };

  const closeModal = () => {
    setShowAdd(false);
    setNewName("");
    setNewColor(COURSE_COLORS[0]);
    setCategories(DEFAULT_CATEGORIES);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-syne">School</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#7c6aff] hover:opacity-85 text-white px-4 py-2 rounded-xl text-sm font-medium transition-opacity"
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#111118] border border-[#2a2a35] rounded-xl p-1 gap-1 w-fit">
        {(["grades", "assignments", "gpa"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              tab === t ? "bg-[#18181f] text-white font-medium" : "text-[#6b6b80] hover:text-white"
            }`}
          >
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
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold font-syne">New Course</h2>
              <button onClick={closeModal} className="text-[#6b6b80] hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Course name */}
            <input
              className="input-field"
              placeholder="Course name (e.g. Chemistry)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />

            {/* Color picker */}
            <div>
              <label className="text-xs text-[#6b6b80] mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COURSE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      newColor === c ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            {/* Mark breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#6b6b80]">Mark Breakdown</label>
                <span
                  className={`text-xs font-mono ${
                    weightOk
                      ? "text-emerald-400"
                      : totalWeight > 100
                      ? "text-red-400"
                      : "text-[#6b6b80]"
                  }`}
                >
                  {totalWeight.toFixed(0)}% / 100%
                </span>
              </div>

              <div className="space-y-2">
                {categories.map((cat, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="input-field flex-1 text-sm"
                      placeholder="Category name (e.g. Tests)"
                      value={cat.name}
                      onChange={(e) => updateCategory(i, "name", e.target.value)}
                    />
                    <div className="relative w-20 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="input-field text-sm text-center pr-5"
                        placeholder="0"
                        value={cat.weight}
                        onChange={(e) => updateCategory(i, "weight", e.target.value)}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b6b80]">%</span>
                    </div>
                    <button
                      onClick={() => removeCategory(i)}
                      disabled={categories.length === 1}
                      className="text-[#6b6b80] hover:text-[#ff6a5e] disabled:opacity-20 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addCategory}
                className="flex items-center gap-1 text-xs text-[#6b6b80] hover:text-white transition-colors"
              >
                <Plus size={12} /> Add category
              </button>

              {!weightOk && totalWeight > 0 && (
                <p className="text-xs text-[#ff6a5e]">
                  Weights must add up to exactly 100%.{" "}
                  {totalWeight < 100
                    ? `${(100 - totalWeight).toFixed(0)}% remaining.`
                    : `${(totalWeight - 100).toFixed(0)}% over.`}
                </p>
              )}
            </div>

            <button
              className="btn-primary w-full py-2 disabled:opacity-40"
              onClick={handleAdd}
              disabled={!newName.trim() || !weightOk}
            >
              Add Course
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
