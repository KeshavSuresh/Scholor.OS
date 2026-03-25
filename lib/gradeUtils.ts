import type { Course, GradeItem, SubcategoryKey } from "./types";

// Weights per subcategory (as % of total course grade)
export const WEIGHTS: Record<SubcategoryKey, number> = {
  testsQuizzes: 0.4,
  assignmentsLabs: 0.3,
  labExam: 0.1,
  writtenExam: 0.2,
};

export const SUBCATEGORY_LABELS: Record<SubcategoryKey, string> = {
  testsQuizzes: "Tests & Quizzes",
  assignmentsLabs: "Assignments & Labs",
  labExam: "Lab Exam",
  writtenExam: "Written Exam",
};

export const TERM_WORK_KEYS: SubcategoryKey[] = ["testsQuizzes", "assignmentsLabs"];
export const SUMMATIVE_KEYS: SubcategoryKey[] = ["labExam", "writtenExam"];

/** Raw average for a subcategory (null if no items) */
export function subcategoryAverage(items: GradeItem[], key: SubcategoryKey): number | null {
  const filtered = items.filter((i) => i.subcategory === key);
  if (!filtered.length) return null;
  const earned = filtered.reduce((s, i) => s + i.earned, 0);
  const possible = filtered.reduce((s, i) => s + i.possible, 0);
  return possible === 0 ? 0 : (earned / possible) * 100;
}

/** Weighted current grade — only counts subcategories that have items */
export function currentGrade(course: Course): number | null {
  const keys = Object.keys(WEIGHTS) as SubcategoryKey[];
  let weightedSum = 0;
  let totalWeight = 0;
  for (const key of keys) {
    const avg = subcategoryAverage(course.items, key);
    if (avg !== null) {
      weightedSum += avg * WEIGHTS[key];
      totalWeight += WEIGHTS[key];
    }
  }
  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

/** Highest possible grade — assumes 100% on unentered subcategories */
export function highestPossibleGrade(course: Course): number {
  const keys = Object.keys(WEIGHTS) as SubcategoryKey[];
  let weightedSum = 0;
  for (const key of keys) {
    const avg = subcategoryAverage(course.items, key);
    weightedSum += (avg ?? 100) * WEIGHTS[key];
  }
  return weightedSum;
}

/** Letter grade from percentage */
export function letterGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 80) return "A−";
  if (pct >= 77) return "B+";
  if (pct >= 73) return "B";
  if (pct >= 70) return "B−";
  if (pct >= 67) return "C+";
  if (pct >= 63) return "C";
  if (pct >= 60) return "C−";
  if (pct >= 57) return "D+";
  if (pct >= 53) return "D";
  if (pct >= 50) return "D−";
  return "F";
}

/** Tailwind color class based on grade */
export function gradeColor(pct: number): string {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 70) return "text-violet-400";
  if (pct >= 60) return "text-yellow-400";
  if (pct >= 50) return "text-orange-400";
  return "text-red-400";
}

/** Score needed on remaining weight to hit goal */
export function scoreNeededForGoal(course: Course, goal: number): number | null {
  const keys = Object.keys(WEIGHTS) as SubcategoryKey[];
  let earnedWeighted = 0;
  let remainingWeight = 0;
  for (const key of keys) {
    const avg = subcategoryAverage(course.items, key);
    if (avg !== null) {
      earnedWeighted += avg * WEIGHTS[key];
    } else {
      remainingWeight += WEIGHTS[key];
    }
  }
  if (remainingWeight === 0) return null;
  return (goal - earnedWeighted) / remainingWeight;
}
