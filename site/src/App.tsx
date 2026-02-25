import { useState, useEffect, useCallback } from "react";
import { fetchIndex, fetchReport } from "./lib/data";
import {
  getTopicBookmarks,
  getBookmarkedDates,
  toggleTopicBookmark,
  type TopicBookmark,
} from "./lib/bookmarks";
import type { DailyReport } from "./lib/types";
import { CalendarGrid } from "./components/CalendarGrid";
import { ReportView } from "./components/ReportView";
import { BookmarksPage } from "./components/BookmarksPage";
import { ChevronLeft, ChevronRight, Rss, Github, Bookmark } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  const [view, setView] = useState<"calendar" | "bookmarks">("calendar");
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [topicBookmarks, setTopicBookmarks] = useState<TopicBookmark[]>(() =>
    getTopicBookmarks()
  );

  const bookmarkedDates = getBookmarkedDates();
  const bookmarkedTopicIds = new Set(topicBookmarks.map((b) => b.id));

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

  const handleToggleTopic = useCallback((bookmark: TopicBookmark) => {
    setTopicBookmarks(toggleTopicBookmark(bookmark));
  }, []);

  const handleRemoveBookmark = useCallback((id: string) => {
    setTopicBookmarks(
      toggleTopicBookmark({
        id,
        date: "",
        section: "",
        raw: "",
        html: "",
        bookmarkedAt: 0,
      })
    );
  }, []);

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

  // ブックマークページ
  if (view === "bookmarks") {
    return (
      <BookmarksPage
        bookmarks={topicBookmarks}
        onRemove={handleRemoveBookmark}
        onBack={() => setView("calendar")}
      />
    );
  }

  return (
    <div className="min-h-screen hud-grid flex flex-col">
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/60 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo area */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border border-primary/40 flex items-center justify-center bg-primary/5">
                <Rss className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-widest uppercase text-foreground glow-text">
                  NISSAN <span className="text-primary">X-SEARCH</span>
                </h1>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                  Social Intelligence Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Right status indicators */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView("bookmarks")}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground tracking-wider uppercase hover:text-amber-400 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {topicBookmarks.length > 0 && (
                <span className="text-amber-400 font-mono">
                  {topicBookmarks.length}
                </span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground tracking-wider uppercase">
              <div className="flex items-center gap-1.5">
                <span className="status-dot" />
                <span>LIVE</span>
              </div>
              <a
                href="https://console.x.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 opacity-50 hover:opacity-100 hover:text-primary transition-opacity"
                title="xAI Console（残高確認・クレジット購入）"
              >
                <span>Powered by</span>
                <span className="text-primary font-mono">Grok / xAI</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sub header line */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
            毎日の X ポスト &mdash; センチメント分析レポート
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-primary/30 via-primary/10 to-transparent" />
        </div>
      </header>

      {/* Calendar Controls */}
      <div className="relative z-10 border-b border-border bg-card/40 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-[160px]">
          <span className="text-[10px] text-primary font-mono tracking-widest uppercase opacity-60">
            DATE
          </span>
          <h2 className="text-sm font-semibold text-foreground tracking-wide">
            {monthLabel}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-[11px] tracking-widest uppercase border-primary/30 text-primary hover:bg-primary/10 hover:text-primary h-7 px-3"
          >
            TODAY
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevMonth}
            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <span>{availableDates.size}</span>
          <span className="opacity-50">reports indexed</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative z-10 flex-1">
        <CalendarGrid
          year={currentMonth.year}
          month={currentMonth.month}
          availableDates={availableDates}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          bookmarkedDates={bookmarkedDates}
        />
      </div>

      {/* Report View */}
      {selectedDate && (
        <div className="relative z-10 border-t border-border bg-card/30 backdrop-blur-sm">
          <ReportView
            date={selectedDate}
            report={report}
            loading={loading}
            onClose={() => {
              setSelectedDate(null);
              setReport(null);
            }}
            bookmarkedTopicIds={bookmarkedTopicIds}
            onToggleTopic={handleToggleTopic}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/40 backdrop-blur-sm px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground tracking-wider uppercase">
          <span className="font-mono opacity-50">NISSAN X-SEARCH v2.0</span>
          <a
            href="https://console.x.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-40 hover:opacity-80 hover:text-primary transition-opacity tracking-wider"
            title="xAI Console（残高確認・クレジット購入）"
          >
            xAI Console
          </a>
          <div className="flex items-center gap-3">
            <span className="font-mono opacity-50">© {new Date().getFullYear()}</span>
            <a
              href="https://github.com/ioComk/nissan-x-search"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 hover:text-primary transition-opacity"
              aria-label="GitHub repository"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
