"use client";
import { useAppStore } from "@/store/useAppStore";
import { BLOCK_COLORS, todayStr } from "@/lib/utils";

export function MonthView({ date, onDayClick }: { date: Date; onDayClick: (d: Date) => void }) {
  const { blocks, assignments } = useAppStore();
  const today = todayStr();

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pad to Monday start
  const startPad = (firstDay.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];
  // Pad to complete grid
  while (cells.length % 7 !== 0) cells.push(null);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7">
        {DAYS.map((d) => (
          <div key={d} className="border-b border-[#2a2a35] py-2 text-center text-xs text-[#6b6b80] font-medium">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="border-b border-r border-[#2a2a35] min-h-[80px]" />;
          const ds = d.toISOString().slice(0, 10);
          const isToday = ds === today;
          const dayBlocks = blocks.filter((b) => b.date === ds).slice(0, 2);
          const dayAssignments = assignments.filter((a) => a.dueDate === ds).slice(0, 1);

          return (
            <div key={ds} onClick={() => onDayClick(d)}
              className={`border-b border-r border-[#2a2a35] min-h-[80px] p-1.5 cursor-pointer hover:bg-[#18181f] transition-colors ${isToday ? "bg-[#7c6aff]/10" : ""}`}>
              <span className={`text-xs font-medium inline-block w-5 h-5 flex items-center justify-center rounded-full ${isToday ? "bg-[#7c6aff] text-white" : "text-[#6b6b80]"}`}>
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayBlocks.map((b) => (
                  <div key={b.id} className="text-[9px] truncate rounded px-1"
                    style={{ background: BLOCK_COLORS[b.type] + "33", color: BLOCK_COLORS[b.type] }}>
                    {b.label}
                  </div>
                ))}
                {dayAssignments.map((a) => (
                  <div key={a.id} className="text-[9px] truncate rounded px-1 bg-[#ff6a5e]/20 text-[#ff6a5e]">
                    📌 {a.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
