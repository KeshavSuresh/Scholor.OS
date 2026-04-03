"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Plus, Trash2, Target, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Course, CourseCategory } from "@/lib/types";
import {
  currentGrade, highestPossibleGrade, letterGrade, gradeColor,
  categoryAverage, scoreNeededForGoal,
} from "@/lib/gradeUtils";

export function CourseCard({ course }: { course: Course }) {
  const { addGradeItem, removeGradeItem, removeCourse, setGoal } = useAppStore();
  const [open, setOpen] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null); // categoryId
  const [form, setForm] = useState({ name: "", earned: "", possible: "" });
  const [goalInput, setGoalInput] = useState(course.goalGrade?.toString() ?? "");

  const grade = currentGrade(course);
  const highest = highestPossibleGrade(course);
  const needed = course.goalGrade != null ? scoreNeededForGoal(course, course.goalGrade) : null;
  const totalWeight = (course.categories ?? []).reduce((s, c) => s + c.weight, 0) || 100;

  const submitItem = (categoryId: string) => {
    if (!form.name.trim() || !form.earned || !form.possible) return;
    addGradeItem(course.id, {
      name: form.name,
      earned: parseFloat(form.earned),
      possible: parseFloat(form.possible),
      categoryId,
    });
    setForm({ name: "", earned: "", possible: "" });
    setAddingTo(null);
  };

  return (
    <div
      className="bg-[#111118] border border-[#2a2a35] rounded-2xl overflow-hidden"
      style={{ boxShadow: `0 0 20px ${course.color}18` }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: course.color }} />
        <h3 className="font-semibold font-syne flex-1">{course.name}</h3>
        <div className="flex items-center gap-3 text-sm font-mono">
          {grade !== null ? (
            <>
              <span className={`font-bold ${gradeColor(grade)}`}>{grade.toFixed(1)}%</span>
              <span className="text-[#6b6b80]">{letterGrade(grade)}</span>
            </>
          ) : (
            <span className="text-[#6b6b80]">No data</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); removeCourse(course.id); }}
          className="text-[#6b6b80] hover:text-[#ff6a5e] ml-2 transition-colors"
        >
          <Trash2 size={14} />
        </button>
        {open ? (
          <ChevronUp size={16} className="text-[#6b6b80]" />
        ) : (
          <ChevronDown size={16} className="text-[#6b6b80]" />
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-[#2a2a35] pt-4">
              {/* Grade summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <GradeCard label="Current Grade" value={grade} color={course.color} />
                <GradeCard label="Highest Possible" value={highest} color={course.color} dim />
              </div>

              {/* Progress bar */}
              {grade !== null && (
                <div className="h-1.5 bg-[#18181f] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: course.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(grade, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              )}

              {/* Goal */}
              <div className="flex items-center gap-2">
                <Target size={14} className="text-[#6b6b80]" />
                <span className="text-xs text-[#6b6b80]">Goal:</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-field w-16 text-center text-xs py-1"
                  placeholder="%"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onBlur={() => goalInput && setGoal(course.id, parseFloat(goalInput))}
                />
                {needed !== null && (
                  <span className="text-xs text-[#6b6b80]">
                    Need{" "}
                    <span className="text-white font-mono">{Math.max(0, needed).toFixed(1)}%</span>{" "}
                    on remaining
                  </span>
                )}
              </div>

              {/* Dynamic categories */}
              <div className="space-y-4">
                {(course.categories ?? []).map((cat) => (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    totalWeight={totalWeight}
                    course={course}
                    addingTo={addingTo}
                    setAddingTo={setAddingTo}
                    form={form}
                    setForm={setForm}
                    submitItem={submitItem}
                    removeItem={(id) => removeGradeItem(course.id, id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GradeCard({
  label, value, color, dim,
}: {
  label: string; value: number | null; color: string; dim?: boolean;
}) {
  return (
    <div className="bg-[#18181f] rounded-xl p-3 space-y-1">
      <p className="text-xs text-[#6b6b80]">{label}</p>
      {value !== null ? (
        <p className={`text-xl font-bold font-mono ${dim ? "text-[#6b6b80]" : gradeColor(value)}`}>
          {value.toFixed(1)}%
        </p>
      ) : (
        <p className="text-xl font-bold font-mono text-[#2a2a35]">—</p>
      )}
      {value !== null && !dim && (
        <p className="text-xs" style={{ color }}>{letterGrade(value)}</p>
      )}
    </div>
  );
}

function CategorySection({
  category, totalWeight, course, addingTo, setAddingTo, form, setForm, submitItem, removeItem,
}: {
  category: CourseCategory;
  totalWeight: number;
  course: Course;
  addingTo: string | null;
  setAddingTo: (id: string | null) => void;
  form: { name: string; earned: string; possible: string };
  setForm: (f: { name: string; earned: string; possible: string }) => void;
  submitItem: (categoryId: string) => void;
  removeItem: (itemId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const items = course.items.filter((i) => i.categoryId === category.id);
  const avg = categoryAverage(course.items, category.id);
  const pct = ((category.weight / totalWeight) * 100).toFixed(0);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-xs font-medium text-[#6b6b80] hover:text-white transition-colors w-full text-left"
      >
        {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        <span className="flex-1">{category.name}</span>
        <span className="text-[#2a2a35]">{category.weight}%</span>
        {avg !== null && (
          <span className={`font-mono ml-2 ${gradeColor(avg)}`}>{avg.toFixed(1)}%</span>
        )}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pl-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-xs bg-[#0a0a0f] rounded-lg px-3 py-1.5"
                >
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="font-mono text-[#6b6b80]">
                    {item.earned}/{item.possible}
                  </span>
                  <span className={`font-mono ${gradeColor((item.earned / item.possible) * 100)}`}>
                    {((item.earned / item.possible) * 100).toFixed(0)}%
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#2a2a35] hover:text-[#ff6a5e] transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {addingTo === category.id ? (
                <div className="flex gap-1.5">
                  <input
                    className="input-field flex-1 text-xs py-1"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && submitItem(category.id)}
                    autoFocus
                  />
                  <input
                    className="input-field w-14 text-xs py-1 text-center"
                    placeholder="Got"
                    type="number"
                    value={form.earned}
                    onChange={(e) => setForm({ ...form, earned: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && submitItem(category.id)}
                  />
                  <input
                    className="input-field w-14 text-xs py-1 text-center"
                    placeholder="Of"
                    type="number"
                    value={form.possible}
                    onChange={(e) => setForm({ ...form, possible: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && submitItem(category.id)}
                  />
                  <button
                    onClick={() => setAddingTo(null)}
                    className="text-[#6b6b80] hover:text-white px-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(category.id)}
                  className="flex items-center gap-1 text-xs text-[#6b6b80] hover:text-white transition-colors"
                >
                  <Plus size={12} /> Add item
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
