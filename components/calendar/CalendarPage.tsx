"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { todayStr } from "@/lib/utils";

type View = "day" | "week" | "month";

export function CalendarPage() {
  const [view, setView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const label = currentDate.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
    ...(view === "day" ? { day: "numeric", weekday: "long" } : {}),
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-[#111118] border border-[#2a2a35] hover:border-[#7c6aff] transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h1 className="text-lg font-bold font-syne capitalize">{label}</h1>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg bg-[#111118] border border-[#2a2a35] hover:border-[#7c6aff] transition-colors">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            className="text-xs text-[#6b6b80] hover:text-white px-2 py-1 rounded-lg border border-[#2a2a35] transition-colors">
            Today
          </button>
        </div>
        <div className="flex bg-[#111118] border border-[#2a2a35] rounded-xl p-1 gap-1">
          {(["day", "week", "month"] as View[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${view === v ? "bg-[#18181f] text-white font-medium" : "text-[#6b6b80] hover:text-white"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "day" && <DayView date={currentDate} />}
      {view === "week" && <WeekView date={currentDate} />}
      {view === "month" && <MonthView date={currentDate} onDayClick={(d) => { setCurrentDate(d); setView("day"); }} />}
    </div>
  );
}
