"use client";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Brain } from "lucide-react";
import { currentGrade, letterGrade } from "@/lib/gradeUtils";
import { todayStr } from "@/lib/utils";

const SUGGESTIONS = [
  "How are my grades?",
  "What should I focus on today?",
  "Am I over-scheduled this week?",
  "What's due this week?",
  "What's my current GPA?",
];

export function AIPage() {
  const { messages, addMessage, clearMessages, courses, assignments, blocks, activities, projects, profile } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildContext = () => {
    const today = todayStr();
    const in7 = new Date(); in7.setDate(in7.getDate() + 7);
    return {
      grades: courses.map((c) => ({
        course: c.name,
        currentGrade: currentGrade(c),
        letterGrade: currentGrade(c) !== null ? letterGrade(currentGrade(c)!) : null,
        items: c.items,
        goal: c.goalGrade,
      })),
      assignments: assignments.map((a) => ({
        name: a.name,
        course: courses.find((c) => c.id === a.courseId)?.name,
        dueDate: a.dueDate,
        status: a.status,
        priority: a.priority,
        overdue: a.dueDate < today,
      })),
      calendar: {
        today: blocks.filter((b) => b.date === today),
        next7Days: blocks.filter((b) => b.date >= today && b.date <= in7.toISOString().slice(0, 10)),
      },
      extracurriculars: activities,
      projects: projects.map((p) => ({
        title: p.title,
        status: p.status,
        deadline: p.deadline,
        milestonesDone: p.milestones.filter((m) => m.done).length,
        milestonesTotal: p.milestones.length,
      })),
    };
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    addMessage({ role: "user", content });
    setLoading(true);

    try {
      const history = [...messages, { role: "user", content }].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: buildContext() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      addMessage({ role: "assistant", content: data.text });
    } catch (err) {
      addMessage({
        role: "assistant",
        content: "Sorry, I ran into an error. Set `XAI_API_KEY` in `.env.local` (from the xAI Console) and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh)] max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a35] bg-[#111118] shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-[#7c6aff]" />
          <h1 className="font-bold font-syne">Scholar AI</h1>
          <span className="text-xs text-[#6b6b80] bg-[#18181f] px-2 py-0.5 rounded-full">Grok</span>
        </div>
        {messages.length > 0 && (
          <button onClick={clearMessages} className="text-[#6b6b80] hover:text-[#ff6a5e] transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#7c6aff]/20 flex items-center justify-center">
              <Brain size={28} className="text-[#7c6aff]" />
            </div>
            <div>
              <h2 className="font-bold font-syne text-lg">Hey {profile.name || "Scholar"} 👋</h2>
              <p className="text-[#6b6b80] text-sm mt-1">Ask me anything about your grades, schedule, or workload.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs px-3 py-2 bg-[#111118] border border-[#2a2a35] rounded-xl text-[#6b6b80] hover:text-white hover:border-[#7c6aff] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#7c6aff] text-white rounded-br-sm"
                    : "bg-[#111118] border border-[#2a2a35] text-[#f0f0f5] rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6b6b80]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#2a2a35] bg-[#111118] shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 bg-[#18181f] border border-[#2a2a35] rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:border-[#7c6aff] transition-colors max-h-32"
            placeholder="Ask Scholar AI..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="bg-[#7c6aff] hover:opacity-85 disabled:opacity-30 text-white p-2.5 rounded-xl transition-all shrink-0">
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-[#6b6b80] mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
