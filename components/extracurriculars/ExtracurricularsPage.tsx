"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, Star } from "lucide-react";
import type { Activity } from "@/lib/types";

const EMPTY: Omit<Activity, "id"> = {
  name: "", role: "", schedule: "", hoursPerMonth: 0,
  goals: "", notes: "", contact: "", isLeadership: false,
};

export function ExtracurricularsPage() {
  const { activities, addActivity, updateActivity, removeActivity } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [expanded, setExpanded] = useState<string | null>(null);

  const submit = () => {
    if (!form.name.trim()) return;
    addActivity(form);
    setForm(EMPTY);
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-syne">Extracurriculars</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#00e5a0] hover:opacity-85 text-black px-4 py-2 rounded-xl text-sm font-medium transition-opacity">
          <Plus size={16} /> Add Activity
        </button>
      </div>

      {activities.length === 0 && !showForm ? (
        <div className="text-center py-20 text-[#6b6b80]">
          <p className="text-4xl mb-3">🏆</p>
          <p>No activities yet. Add clubs, sports, volunteer work, and more.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <motion.div key={a.id} layout
              className="bg-[#111118] border border-[#2a2a35] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                {a.isLeadership && <Star size={14} className="text-[#ffd166] shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-[#6b6b80]">{a.role} · {a.hoursPerMonth}h/month</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeActivity(a.id); }}
                  className="text-[#6b6b80] hover:text-[#ff6a5e] transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <AnimatePresence>
                {expanded === a.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5 border-t border-[#2a2a35] pt-4 grid grid-cols-2 gap-3 text-sm">
                      <Field label="Schedule" value={a.schedule} onChange={(v) => updateActivity(a.id, { schedule: v })} />
                      <Field label="Contact" value={a.contact} onChange={(v) => updateActivity(a.id, { contact: v })} />
                      <Field label="Goals" value={a.goals} onChange={(v) => updateActivity(a.id, { goals: v })} className="col-span-2" />
                      <Field label="Notes" value={a.notes} onChange={(v) => updateActivity(a.id, { notes: v })} className="col-span-2" />
                      <label className="flex items-center gap-2 col-span-2 cursor-pointer">
                        <input type="checkbox" checked={a.isLeadership}
                          onChange={(e) => updateActivity(a.id, { isLeadership: e.target.checked })}
                          className="accent-[#ffd166]" />
                        <span className="text-sm text-[#6b6b80]">Leadership role</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-5 w-full max-w-md space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold font-syne">New Activity</h2>
                <button onClick={() => setShowForm(false)} className="text-[#6b6b80] hover:text-white"><X size={18} /></button>
              </div>
              <input className="input-field" placeholder="Activity name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              <div className="grid grid-cols-2 gap-2">
                <input className="input-field" placeholder="Your role" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })} />
                <input type="number" className="input-field" placeholder="Hours/month" value={form.hoursPerMonth || ""}
                  onChange={(e) => setForm({ ...form, hoursPerMonth: parseFloat(e.target.value) || 0 })} />
              </div>
              <input className="input-field" placeholder="Schedule (e.g. Mon/Wed 4–6pm)" value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
              <input className="input-field" placeholder="Contact info" value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isLeadership}
                  onChange={(e) => setForm({ ...form, isLeadership: e.target.checked })}
                  className="accent-[#ffd166]" />
                <span className="text-sm text-[#6b6b80]">Leadership role</span>
              </label>
              <button className="btn-primary w-full py-2" onClick={submit}>Add Activity</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs text-[#6b6b80] mb-1 block">{label}</label>
      <input className="input-field text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} />
    </div>
  );
}
