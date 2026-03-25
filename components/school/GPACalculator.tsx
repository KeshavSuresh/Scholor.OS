"use client";
import { useAppStore } from "@/store/useAppStore";
import { currentGrade, letterGrade, gradeColor } from "@/lib/gradeUtils";

function gradePoints(pct: number): number {
  if (pct >= 90) return 4.0;
  if (pct >= 85) return 3.9;
  if (pct >= 80) return 3.7;
  if (pct >= 77) return 3.3;
  if (pct >= 73) return 3.0;
  if (pct >= 70) return 2.7;
  if (pct >= 67) return 2.3;
  if (pct >= 63) return 2.0;
  if (pct >= 60) return 1.7;
  if (pct >= 57) return 1.3;
  if (pct >= 53) return 1.0;
  if (pct >= 50) return 0.7;
  return 0.0;
}

export function GPACalculator() {
  const { courses } = useAppStore();
  const graded = courses.map((c) => ({ course: c, grade: currentGrade(c) })).filter((x) => x.grade !== null);
  const gpa = graded.length
    ? graded.reduce((sum, x) => sum + gradePoints(x.grade!), 0) / graded.length
    : null;

  return (
    <div className="space-y-4">
      <h2 className="font-semibold font-syne">GPA Calculator</h2>
      {graded.length === 0 ? (
        <div className="text-center py-12 text-[#6b6b80]">
          <p className="text-3xl mb-2">🎓</p>
          <p>Add grade items to your courses to calculate GPA.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 text-center">
            <p className="text-xs text-[#6b6b80] mb-1">Cumulative GPA</p>
            <p className="text-5xl font-bold font-mono text-[#7c6aff]">{gpa?.toFixed(2) ?? "—"}</p>
            <p className="text-sm text-[#6b6b80] mt-1">Based on {graded.length} course{graded.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="space-y-2">
            {graded.map(({ course, grade }) => (
              <div key={course.id} className="flex items-center gap-3 bg-[#111118] border border-[#2a2a35] rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full" style={{ background: course.color }} />
                <span className="flex-1 text-sm">{course.name}</span>
                <span className={`text-sm font-mono ${gradeColor(grade!)}`}>{grade!.toFixed(1)}%</span>
                <span className="text-sm text-[#6b6b80] w-8 text-right">{letterGrade(grade!)}</span>
                <span className="text-sm font-mono text-[#7c6aff] w-10 text-right">{gradePoints(grade!).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
