"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { generateId } from "@/lib/utils";

const STEPS = ["Welcome", "Courses", "Goals", "Schedule"];

export function OnboardingWizard() {
  const { setProfile, courses, addCourse, setGoal } = useAppStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", school: "", semesterStart: "", semesterEnd: "" });
  const [newCourse, setNewCourse] = useState("");
  const [goals, setGoals] = useState<Record<string, string>>({});

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    Object.entries(goals).forEach(([id, g]) => {
      if (g) setGoal(id, parseFloat(g));
    });
    setProfile({ ...form, onboarded: true });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-[#7c6aff]" : i < step ? "w-4 bg-[#7c6aff]/50" : "w-4 bg-[#2a2a35]"
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-6 space-y-5"
          >
            {step === 0 && (
              <>
                <h1 className="text-2xl font-bold font-syne">Welcome to ScholarOS 🎓</h1>
                <p className="text-[#6b6b80] text-sm">Let's get you set up in under a minute.</p>
                <input className="input-field" placeholder="Your name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && next()} />
                <input className="input-field" placeholder="Your school" value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && next()} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#6b6b80] mb-1 block">Semester Start</label>
                    <input type="date" className="input-field" value={form.semesterStart}
                      onChange={(e) => setForm({ ...form, semesterStart: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6b6b80] mb-1 block">Semester End</label>
                    <input type="date" className="input-field" value={form.semesterEnd}
                      onChange={(e) => setForm({ ...form, semesterEnd: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-xl font-bold font-syne">Your Courses</h2>
                <p className="text-[#6b6b80] text-sm">Default courses are added. Add more if needed.</p>
                <div className="space-y-2">
                  {courses.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 px-3 py-2 bg-[#18181f] rounded-lg">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-sm">{c.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input-field flex-1" placeholder="Add a course..." value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCourse.trim()) {
                        addCourse(newCourse.trim(), "#60a5fa");
                        setNewCourse("");
                      }
                    }} />
                  <button className="btn-primary px-4" onClick={() => {
                    if (newCourse.trim()) { addCourse(newCourse.trim(), "#60a5fa"); setNewCourse(""); }
                  }}>Add</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-bold font-syne">Grade Goals</h2>
                <p className="text-[#6b6b80] text-sm">Set a target % for each course (optional).</p>
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-sm flex-1">{c.name}</span>
                    <input type="number" min={0} max={100} className="input-field w-20 text-center"
                      placeholder="e.g. 85"
                      value={goals[c.id] ?? ""}
                      onChange={(e) => setGoals({ ...goals, [c.id]: e.target.value })} />
                    <span className="text-[#6b6b80] text-sm">%</span>
                  </div>
                ))}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-bold font-syne">You're all set, {form.name || "Scholar"}!</h2>
                <p className="text-[#6b6b80] text-sm">
                  Head to the Calendar to add your first time blocks, or jump straight to the Dashboard.
                </p>
                <div className="bg-[#18181f] rounded-xl p-4 text-sm space-y-1 text-[#6b6b80]">
                  <p>📚 {courses.length} courses loaded</p>
                  <p>🗓️ Semester: {form.semesterStart || "—"} → {form.semesterEnd || "—"}</p>
                  <p>🏫 {form.school || "Your school"}</p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-4">
          <button onClick={prev} disabled={step === 0}
            className="px-4 py-2 text-sm text-[#6b6b80] hover:text-white disabled:opacity-30 transition-colors">
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary px-6 py-2 text-sm">Continue →</button>
          ) : (
            <button onClick={finish} className="btn-primary px-6 py-2 text-sm">Launch ScholarOS 🚀</button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: #18181f;
          border: 1px solid #2a2a35;
          border-radius: 8px;
          padding: 8px 12px;
          color: #f0f0f5;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus { border-color: #7c6aff; }
        .btn-primary {
          background: #7c6aff;
          color: white;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          transition: opacity 0.15s;
          cursor: pointer;
        }
        .btn-primary:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
