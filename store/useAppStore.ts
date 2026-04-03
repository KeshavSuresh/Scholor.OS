"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Course, CourseCategory, GradeItem, Assignment, TimeBlock,
  Activity, Project, ChatMessage, UserProfile,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

interface AppState {
  // Profile
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;

  // Courses
  courses: Course[];
  addCourse: (name: string, color: string, categories: Omit<CourseCategory, "id">[]) => void;
  removeCourse: (id: string) => void;
  addGradeItem: (courseId: string, item: Omit<GradeItem, "id">) => void;
  removeGradeItem: (courseId: string, itemId: string) => void;
  setGoal: (courseId: string, goal: number) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (a: Omit<Assignment, "id">) => void;
  updateAssignment: (id: string, patch: Partial<Assignment>) => void;
  removeAssignment: (id: string) => void;

  // Calendar
  blocks: TimeBlock[];
  addBlock: (b: Omit<TimeBlock, "id">) => void;
  updateBlock: (id: string, patch: Partial<TimeBlock>) => void;
  removeBlock: (id: string) => void;

  // Extracurriculars
  activities: Activity[];
  addActivity: (a: Omit<Activity, "id">) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  removeActivity: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;

  // AI Chat
  messages: ChatMessage[];
  addMessage: (m: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;

  // Auth
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: { name: "", school: "", semesterStart: "", semesterEnd: "", onboarded: false },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      courses: [],
      addCourse: (name, color, categories) =>
        set((s) => ({
          courses: [
            ...s.courses,
            {
              id: generateId(),
              name,
              color,
              categories: categories.map((c) => ({ ...c, id: generateId() })),
              items: [],
            },
          ],
        })),
      removeCourse: (id) => set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),
      addGradeItem: (courseId, item) =>
        set((s) => ({
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, items: [...c.items, { ...item, id: generateId() }] } : c
          ),
        })),
      removeGradeItem: (courseId, itemId) =>
        set((s) => ({
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
          ),
        })),
      setGoal: (courseId, goal) =>
        set((s) => ({
          courses: s.courses.map((c) => (c.id === courseId ? { ...c, goalGrade: goal } : c)),
        })),

      assignments: [],
      addAssignment: (a) =>
        set((s) => ({ assignments: [...s.assignments, { ...a, id: generateId() }] })),
      updateAssignment: (id, patch) =>
        set((s) => ({ assignments: s.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      removeAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),

      blocks: [],
      addBlock: (b) => set((s) => ({ blocks: [...s.blocks, { ...b, id: generateId() }] })),
      updateBlock: (id, patch) =>
        set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      removeBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),

      activities: [],
      addActivity: (a) =>
        set((s) => ({ activities: [...s.activities, { ...a, id: generateId() }] })),
      updateActivity: (id, patch) =>
        set((s) => ({ activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      removeActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),

      projects: [],
      addProject: (p) =>
        set((s) => ({ projects: [...s.projects, { ...p, id: generateId() }] })),
      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      toggleMilestone: (projectId, milestoneId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  milestones: p.milestones.map((m) =>
                    m.id === milestoneId ? { ...m, done: !m.done } : m
                  ),
                }
              : p
          ),
        })),

      messages: [],
      addMessage: (m) =>
        set((s) => ({
          messages: [...s.messages, { ...m, id: generateId(), timestamp: Date.now() }],
        })),
      clearMessages: () => set({ messages: [] }),

      logout: () => {
        localStorage.removeItem("scholar-os-data");
        set({
          profile: { name: "", school: "", semesterStart: "", semesterEnd: "", onboarded: false },
          courses: [],
          assignments: [],
          blocks: [],
          activities: [],
          projects: [],
          messages: [],
        });
      },
    }),
    { name: "scholar-os-data" }
  )
);
