// ── Grade Tracker ──────────────────────────────────────────────
export interface CourseCategory {
  id: string;
  name: string;   // e.g. "Tests & Quizzes"
  weight: number; // 0–100 (percentage)
}

export interface GradeItem {
  id: string;
  name: string;
  earned: number;
  possible: number;
  categoryId: string; // references CourseCategory.id
  date?: string;
}

export interface Course {
  id: string;
  name: string;
  color: string;
  goalGrade?: number;
  categories: CourseCategory[];
  items: GradeItem[];
}

// ── Assignments ────────────────────────────────────────────────
export type AssignmentStatus = "Not Started" | "In Progress" | "Submitted" | "Graded";
export type Priority = "High" | "Medium" | "Low";

export interface Assignment {
  id: string;
  name: string;
  courseId: string;
  dueDate: string;
  priority: Priority;
  estimatedHours: number;
  status: AssignmentStatus;
}

// ── Calendar ───────────────────────────────────────────────────
export type BlockType = "Study" | "Class" | "Work" | "Gym" | "Break" | "Sleep" | "Personal";

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0–23
  endHour: number;
  type: BlockType;
  label: string;
  courseId?: string;
  assignmentId?: string;
  recurring?: "daily" | "weekly";
}

// ── Extracurriculars ───────────────────────────────────────────
export interface Activity {
  id: string;
  name: string;
  role: string;
  schedule: string;
  hoursPerMonth: number;
  goals: string;
  notes: string;
  contact: string;
  isLeadership: boolean;
}

// ── Projects ───────────────────────────────────────────────────
export type ProjectStatus = "To Do" | "In Progress" | "Done";
export type ProjectTag = "creative" | "technical" | "career" | "hobby";

export interface Milestone {
  id: string;
  text: string;
  done: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  milestones: Milestone[];
  tags: ProjectTag[];
  resources: string[];
  status: ProjectStatus;
}

// ── AI Chat ────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ── User / Onboarding ──────────────────────────────────────────
export interface UserProfile {
  name: string;
  school: string;
  semesterStart: string;
  semesterEnd: string;
  onboarded: boolean;
}
