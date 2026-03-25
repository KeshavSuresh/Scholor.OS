"use client";
import { useAppStore } from "@/store/useAppStore";
import { currentGrade, letterGrade, gradeColor, highestPossibleGrade } from "@/lib/gradeUtils";
import { todayStr, formatDate, BLOCK_COLORS } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, AlertCircle, TrendingUp, Plus } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { QuickAddModal } from "./QuickAddModal";
import { useState } from "react";

export function Dashboard() {
  const { profile, courses, assignments, blocks } = useAppStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const today = todayStr();

  // Today's blocks sorted
  const todayBlocks = blocks
    .filter((b) => b.date === today)
    .sort((a, b) => a.startHour - b.startHour);

  // Upcoming deadlines (next 7 days)
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const upcoming = assignments
    .filter((a) => a.dueDate >= today && a.dueDate <= in7Days.toISOString().slice(0, 10))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Progress ring data
  const totalAssignments = assignments.length;
  const doneAssignments = assignments.filter((a) => a.status === "Graded" || a.status === "Submitted").length;
  const schoolPct = totalAssignments ? Math.round((doneAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-syne">
            Good {getGreeting()}, {profile.name || "Scholar"} 👋
          </h1>
          <p className="text-[#6b6b80] text-sm mt-0.5">
            {new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-2 bg-[#7c6aff] hover:opacity-85 text-white px-4 py-2 rounded-xl text-sm font-medium transition-opacity"
        >
          <Plus size={16} /> Quick Add
        </button>
      </div>

      {/* Progress Rings */}
      <div className="grid grid-cols-3 gap-3">
        <RingCard label="School Tasks" pct={schoolPct} color="#7c6aff" />
        <RingCard label="Extracurriculars" pct={0} color="#00e5a0" />
        <RingCard label="Projects" pct={0} color="#ffd166" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <section className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock size={15} className="text-[#7c6aff]" />
            Today's Schedule
          </div>
          {todayBlocks.length === 0 ? (
            <EmptyState text="No blocks scheduled today. Add some in Calendar." />
          ) : (
            <div className="space-y-2">
              {todayBlocks.map((b) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-3 py-2 bg-[#18181f] rounded-lg"
                >
                  <div className="w-1.5 h-8 rounded-full" style={{ background: BLOCK_COLORS[b.type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.label}</p>
                    <p className="text-xs text-[#6b6b80]">{b.startHour}:00 – {b.endHour}:00</p>
                  </div>
                  <span className="text-xs text-[#6b6b80] shrink-0">{b.type}</span>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Deadlines */}
        <section className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={15} className="text-[#ff6a5e]" />
            Due This Week
          </div>
          {upcoming.length === 0 ? (
            <EmptyState text="Nothing due in the next 7 days. Nice!" />
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => {
                const course = useAppStore.getState().courses.find((c) => c.id === a.courseId);
                const isOverdue = a.dueDate < today;
                return (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2 bg-[#18181f] rounded-lg">
                    <div className="w-1.5 h-8 rounded-full" style={{ background: course?.color ?? "#6b6b80" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className={`text-xs ${isOverdue ? "text-[#ff6a5e]" : "text-[#6b6b80]"}`}>
                        {isOverdue ? "Overdue · " : ""}{formatDate(a.dueDate)}
                      </p>
                    </div>
                    <PriorityBadge priority={a.priority} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Grade Overview */}
      <section className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <TrendingUp size={15} className="text-[#00e5a0]" />
          Grade Overview
        </div>
        {courses.length === 0 ? (
          <EmptyState text="No courses yet. Add them in School." />
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const grade = currentGrade(course);
              const highest = highestPossibleGrade(course);
              const pct = grade ?? 0;
              return (
                <div key={course.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: course.color }} />
                      <span>{course.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      {grade !== null ? (
                        <>
                          <span className={gradeColor(pct)}>{pct.toFixed(1)}%</span>
                          <span className="text-[#6b6b80]">{letterGrade(pct)}</span>
                        </>
                      ) : (
                        <span className="text-[#6b6b80]">No data</span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#18181f] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: course.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
}

function RingCard({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-4 flex flex-col items-center gap-2">
      <ProgressRing pct={pct} color={color} size={56} stroke={5} />
      <span className="text-xs text-[#6b6b80] text-center">{label}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "text-[#ff6a5e] bg-[#ff6a5e]/10",
    Medium: "text-[#ffd166] bg-[#ffd166]/10",
    Low: "text-[#6b6b80] bg-[#2a2a35]",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[priority] ?? ""}`}>
      {priority}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-[#6b6b80] text-sm text-center py-4">{text}</p>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
