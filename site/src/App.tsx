import { useState, useEffect, useCallback } from "react";
import { fetchIndex, fetchReport } from "./lib/data";
import type { DailyReport } from "./lib/types";
import { CalendarGrid } from "./components/CalendarGrid";
import { ReportView } from "./components/ReportView";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndex().then((data) => setAvailableDates(new Set(data.dates)));
  }, []);

  const handleDateSelect = useCallback(
    async (date: string) => {
      if (selectedDate === date) {
        setSelectedDate(null);
        setReport(null);
        return;
      }
      setSelectedDate(date);
      setLoading(true);
      const data = await fetchReport(date);
      setReport(data);
      setLoading(false);
    },
    [selectedDate]
  );

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month - 1;
      return m < 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: m };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month + 1;
      return m > 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: m };
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  const monthLabel = new Date(
    currentMonth.year,
    currentMonth.month
  ).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b px-4 sm:px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">
          日産関連 X ポストまとめ
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          毎日の X ポストをセンチメント分析してお届け
        </p>
      </header>

      {/* Calendar Controls */}
      <div className="border-b px-4 sm:px-6 py-3 flex items-center gap-3">
        <h2 className="text-base font-medium min-w-[140px]">{monthLabel}</h2>
        <Button variant="outline" size="sm" onClick={goToToday}>
          今日
        </Button>
        <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        year={currentMonth.year}
        month={currentMonth.month}
        availableDates={availableDates}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Report View */}
      {selectedDate && (
        <ReportView
          date={selectedDate}
          report={report}
          loading={loading}
          onClose={() => {
            setSelectedDate(null);
            setReport(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t px-4 sm:px-6 py-4 text-xs text-muted-foreground text-center">
        Powered by Grok (xAI) | Nissan X Search
      </footer>
    </div>
  );
}
