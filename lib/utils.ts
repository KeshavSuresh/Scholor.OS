import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  // minimal clsx-like merge without the dependency
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ");
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const BLOCK_COLORS: Record<string, string> = {
  Study: "#7c6aff",
  Class: "#00e5a0",
  Work: "#ffd166",
  Gym: "#ff6a5e",
  Break: "#6b6b80",
  Sleep: "#2a2a35",
  Personal: "#60a5fa",
};
