import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  year: number;
  month: number;
  availableDates: Set<string>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  bookmarkedDates: Set<string>;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function CalendarGrid({
  year,
  month,
  availableDates,
  selectedDate,
  onDateSelect,
  bookmarkedDates,
}: CalendarGridProps) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const todayStr = formatDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="border-b border-border">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/20">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={cn(
              "px-2 py-2 text-[10px] font-medium tracking-widest text-center",
              i < 6 && "border-r border-border",
              i === 0 && "text-red-400/60",
              i === 6 && "text-blue-400/60",
              i > 0 && i < 6 && "text-muted-foreground"
            )}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
          {week.map((day, di) => {
            if (day === null) {
              return (
                <div
                  key={di}
                  className={cn(
                    "h-16 sm:h-24 p-1.5 sm:p-2",
                    di < 6 && "border-r border-border",
                    "bg-background/20"
                  )}
                />
              );
            }

            const dateStr = formatDateStr(year, month, day);
            const hasData = availableDates.has(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const isBookmarked = bookmarkedDates.has(dateStr);

            return (
              <button
                key={di}
                onClick={() => hasData && onDateSelect(dateStr)}
                className={cn(
                  "h-16 sm:h-24 p-1.5 sm:p-2 text-left transition-all relative group",
                  di < 6 && "border-r border-border",
                  hasData && "cursor-pointer hover:bg-primary/5",
                  !hasData && "cursor-default",
                  isSelected && "bg-primary/10 shadow-inner",
                  isSelected && "shadow-[inset_0_0_20px_hsl(193_100%_45%_/_0.06)]"
                )}
              >
                {/* Selected indicator line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/60" />
                )}

                {/* Bookmark indicator */}
                {isBookmarked && (
                  <div className="absolute top-1 right-1">
                    <Bookmark className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  </div>
                )}

                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm font-mono rounded",
                    isToday &&
                      "bg-primary text-primary-foreground font-bold glow-text",
                    !isToday && hasData && "text-foreground group-hover:text-primary",
                    !isToday && !hasData && "text-muted-foreground/40"
                  )}
                >
                  {day}
                </span>

                {hasData && (
                  <div className="mt-0.5 sm:mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-px text-[9px] sm:text-[10px] font-medium rounded tracking-widest uppercase",
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-primary/10 text-primary/70 group-hover:bg-primary/15 group-hover:text-primary"
                      )}
                    >
                      <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-current" />
                      DATA
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
