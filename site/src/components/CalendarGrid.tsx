import { cn } from "@/lib/utils";

interface CalendarGridProps {
  year: number;
  month: number;
  availableDates: Set<string>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarGrid({
  year,
  month,
  availableDates,
  selectedDate,
  onDateSelect,
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
    <div className="border-b">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={cn(
              "px-3 py-2 text-xs font-medium text-muted-foreground text-center",
              i < 6 && "border-r"
            )}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
          {week.map((day, di) => {
            if (day === null) {
              return (
                <div
                  key={di}
                  className={cn(
                    "h-16 sm:h-24 p-1.5 sm:p-2 bg-muted/30",
                    di < 6 && "border-r"
                  )}
                />
              );
            }

            const dateStr = formatDateStr(year, month, day);
            const hasData = availableDates.has(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={di}
                onClick={() => hasData && onDateSelect(dateStr)}
                className={cn(
                  "h-16 sm:h-24 p-1.5 sm:p-2 text-left transition-colors relative",
                  di < 6 && "border-r",
                  hasData && "cursor-pointer hover:bg-accent",
                  !hasData && "cursor-default",
                  isSelected && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full",
                    isToday &&
                      "bg-primary text-primary-foreground font-semibold",
                    !isToday && "text-foreground"
                  )}
                >
                  {day}
                </span>
                {hasData && (
                  <div className="mt-0.5 sm:mt-1">
                    <span className="inline-block px-1 sm:px-1.5 py-px sm:py-0.5 text-[9px] sm:text-[10px] font-medium rounded bg-primary/10 text-primary truncate">
                      まとめ
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
