"use client";

export interface WeekStripDay {
  date: string; // "YYYY-MM-DD"
  weekdayLabel: string; // "금"
  dayLabel: string; // "7"
  isToday: boolean;
  hasEvents: boolean;
}

interface WeekStripProps {
  days: WeekStripDay[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export function WeekStrip({ days, selectedDate, onSelectDate }: WeekStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate?.(day.date)}
            className={[
              "flex min-w-14 flex-col items-center gap-1 rounded-card border px-3 py-2 text-sm transition-colors",
              isSelected
                ? "border-red bg-red text-paper"
                : day.isToday
                  ? "border-red text-red"
                  : "border-line bg-card text-ink hover:border-ink/40",
            ].join(" ")}
          >
            <span className="text-xs opacity-80">{day.weekdayLabel}</span>
            <span className="font-semibold">{day.dayLabel}</span>
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                day.hasEvents ? (isSelected ? "bg-paper" : "bg-red") : "bg-transparent",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
