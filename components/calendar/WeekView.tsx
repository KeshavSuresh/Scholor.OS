"use client";
import { useAppStore } from "@/store/useAppStore";
import { BLOCK_COLORS, todayStr } from "@/lib/utils";

export function WeekView({ date }: { date: Date }) {
  const { blocks } = useAppStore();
  const today = todayStr();

  // Get Monday of the week
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–midnight

  return (
    <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl overflow-auto">
      <div className="grid min-w-[600px]" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
        {/* Header */}
        <div className="border-b border-[#2a2a35]" />
        {days.map((d) => {
          const ds = d.toISOString().slice(0, 10);
          const isToday = ds === today;
          return (
            <div key={ds} className={`border-b border-l border-[#2a2a35] px-2 py-2 text-center ${isToday ? "bg-[#7c6aff]/10" : ""}`}>
              <p className="text-[10px] text-[#6b6b80]">{d.toLocaleDateString("en-CA", { weekday: "short" })}</p>
              <p className={`text-sm font-medium ${isToday ? "text-[#7c6aff]" : ""}`}>{d.getDate()}</p>
            </div>
          );
        })}

        {/* Hour rows */}
        {HOURS.map((hour) => (
          <>
            <div key={`h-${hour}`} className="border-b border-[#2a2a35] px-1 py-1 text-right">
              <span className="text-[9px] text-[#6b6b80] font-mono">{hour.toString().padStart(2, "0")}:00</span>
            </div>
            {days.map((d) => {
              const ds = d.toISOString().slice(0, 10);
              const block = blocks.find((b) => b.date === ds && b.startHour === hour);
              return (
                <div key={`${ds}-${hour}`} className="border-b border-l border-[#2a2a35] min-h-[32px] relative">
                  {block && (
                    <div className="absolute inset-x-0.5 top-0.5 rounded px-1 py-0.5 text-[9px] truncate"
                      style={{ background: BLOCK_COLORS[block.type] + "33", color: BLOCK_COLORS[block.type], borderLeft: `2px solid ${BLOCK_COLORS[block.type]}` }}>
                      {block.label}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
