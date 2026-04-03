import type { Course, GradeItem } from "./types";

/** Average for a specific category (null if no items) */
export function categoryAverage(items: GradeItem[], categoryId: string): number | null {
  const filtered = items.filter((i) => i.categoryId === categoryId);
  if (!filtered.length) return null;
  const earned = filtered.reduce((s, i) => s + i.earned, 0);
  const possible = filtered.reduce((s, i) => s + i.possible, 0);
  return possible === 0 ? 0 : (earned / possible) * 100;
}

/** Weighted current grade — only counts categories that have items */
export function currentGrade(course: Course): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const cat of course.categories) {
    const avg = categoryAverage(course.items, cat.id);
    if (avg !== null) {
      weightedSum += avg * cat.weight;
      totalWeight += cat.weight;
    }
  }
  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

/** Highest possible grade — assumes 100% on unentered categories */
export function highestPossibleGrade(course: Course): number {
  const totalWeight = course.categories.reduce((s, c) => s + c.weight, 0) || 100;
  let weightedSum = 0;
  for (const cat of course.categories) {
    const avg = categoryAverage(course.items, cat.id);
    weightedSum += (avg ?? 100) * cat.weight;
  }
  return weightedSum / totalWeight;
}

/** Score needed on remaining categories to hit goal */
export function scoreNeededForGoal(course: Course, goal: number): number | null {
  const totalWeight = course.categories.reduce((s, c) => s + c.weight, 0) || 100;
  let earnedWeighted = 0;
  let remainingWeight = 0;
  for (const cat of course.categories) {
    const avg = categoryAverage(course.items, cat.id);
    if (avg !== null) {
      earnedWeighted += avg * (cat.weight / totalWeight);
    } else {
      remainingWeight += cat.weight / totalWeight;
    }
  }
  if (remainingWeight === 0) return null;
  return (goal / 100 - earnedWeighted / 100) / remainingWeight * 100;
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
