"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Plus, X, Trash2, CheckSquare, Square, ExternalLink } from "lucide-react";
import type { Project, ProjectStatus, ProjectTag, Milestone } from "@/lib/types";
import { generateId } from "@/lib/utils";

const COLUMNS: ProjectStatus[] = ["To Do", "In Progress", "Done"];
const TAG_COLORS: Record<ProjectTag, string> = {
  creative: "#f472b6",
  technical: "#7c6aff",
  career: "#00e5a0",
  hobby: "#ffd166",
};

export function ProjectsPage() {
  const { projects, addProject, updateProject, removeProject, toggleMilestone } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", tags: [] as ProjectTag[], resource: "" });
  const [dragging, setDragging] = useState<string | null>(null);

  const submit = () => {
    if (!form.title.trim()) return;
    addProject({ title: form.title, description: form.description, deadline: form.deadline, tags: form.tags, milestones: [], resources: [], status: "To Do" });
    setForm({ title: "", description: "", deadline: "", tags: [], resource: "" });
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-syne">Projects</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#ffd166] hover:opacity-85 text-black px-4 py-2 rounded-xl text-sm font-medium transition-opacity">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colProjects = projects.filter((p) => p.status === col);
          return (
            <div key={col}
              className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-3 min-h-[300px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragging) updateProject(dragging, { status: col }); setDragging(null); }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-medium text-[#6b6b80]">{col}</h3>
                <span className="text-xs bg-[#18181f] px-2 py-0.5 rounded-full text-[#6b6b80]">{colProjects.length}</span>
              </div>
              <div className="space-y-2">
                {colProjects.map((p) => (
                  <ProjectCard key={p.id} project={p}
                    onDragStart={() => setDragging(p.id)}
                    onToggleMilestone={(mid) => toggleMilestone(p.id, mid)}
                    onRemove={() => removeProject(p.id)}
                    onUpdate={(patch) => updateProject(p.id, patch)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold font-syne">New Project</h2>
              <button onClick={() => setShowForm(false)} className="text-[#6b6b80] hover:text-white"><X size={18} /></button>
            </div>
            <input className="input-field" placeholder="Project title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            <textarea className="input-field resize-none" rows={2} placeholder="Description"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="date" className="input-field" value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <div>
              <label className="text-xs text-[#6b6b80] mb-2 block">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {(["creative", "technical", "career", "hobby"] as ProjectTag[]).map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, tags: form.tags.includes(t) ? form.tags.filter((x) => x !== t) : [...form.tags, t] })}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.tags.includes(t) ? "border-transparent text-black" : "border-[#2a2a35] text-[#6b6b80]"}`}
                    style={form.tags.includes(t) ? { background: TAG_COLORS[t] } : {}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary w-full py-2" onClick={submit}>Create Project</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onDragStart, onToggleMilestone, onRemove, onUpdate }: {
  project: Project;
  onDragStart: () => void;
  onToggleMilestone: (id: string) => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Project>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");
  const done = project.milestones.filter((m) => m.done).length;
  const pct = project.milestones.length ? Math.round((done / project.milestones.length) * 100) : 0;

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    onUpdate({ milestones: [...project.milestones, { id: generateId(), text: newMilestone, done: false }] });
    setNewMilestone("");
  };

  return (
    <motion.div layout draggable onDragStart={onDragStart}
      className="bg-[#18181f] border border-[#2a2a35] rounded-xl p-3 cursor-grab active:cursor-grabbing space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>{project.title}</p>
        <button onClick={onRemove} className="text-[#6b6b80] hover:text-[#ff6a5e] shrink-0 transition-colors"><Trash2 size={12} /></button>
      </div>

      {project.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {project.tags.map((t) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: TAG_COLORS[t] + "33", color: TAG_COLORS[t] }}>{t}</span>
          ))}
        </div>
      )}

      {project.milestones.length > 0 && (
        <div className="space-y-1">
          <div className="h-1 bg-[#2a2a35] rounded-full overflow-hidden">
            <div className="h-full bg-[#7c6aff] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-[#6b6b80]">{done}/{project.milestones.length} milestones</p>
        </div>
      )}

      {expanded && (
        <div className="space-y-1.5 pt-1 border-t border-[#2a2a35]">
          {project.description && <p className="text-xs text-[#6b6b80]">{project.description}</p>}
          {project.milestones.map((m) => (
            <button key={m.id} onClick={() => onToggleMilestone(m.id)}
              className="flex items-center gap-2 text-xs w-full text-left hover:text-white transition-colors">
              {m.done ? <CheckSquare size={12} className="text-[#00e5a0]" /> : <Square size={12} className="text-[#6b6b80]" />}
              <span className={m.done ? "line-through text-[#6b6b80]" : ""}>{m.text}</span>
            </button>
          ))}
          <div className="flex gap-1">
            <input className="input-field text-xs py-1 flex-1" placeholder="Add milestone..."
              value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMilestone()} />
            <button className="btn-primary px-2 py-1 text-xs" onClick={addMilestone}>+</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
