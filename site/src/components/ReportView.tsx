import type { DailyReport } from "@/lib/types";
import { Markdown } from "./Markdown";
import { Button } from "./ui/button";
import { X, Calendar, Loader2, Bookmark, BookmarkCheck } from "lucide-react";

interface ReportViewProps {
  date: string;
  report: DailyReport | null;
  loading: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export function ReportView({ date, report, loading, onClose, isBookmarked, onToggleBookmark }: ReportViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Panel header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-7 h-7 rounded border border-primary/30 flex items-center justify-center bg-primary/5 flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono tracking-widest text-foreground">
                {date}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-primary" />
                REPORT
              </span>
            </div>
            {report && (
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {report.dateRange}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleBookmark}
            className={
              isBookmarked
                ? "h-7 w-7 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 flex-shrink-0"
                : "h-7 w-7 text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 flex-shrink-0"
            }
            title={isBookmarked ? "ブックマーク解除" : "ブックマーク"}
          >
            {isBookmarked
              ? <BookmarkCheck className="h-3.5 w-3.5" />
              : <Bookmark className="h-3.5 w-3.5" />
            }
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="h-px bg-border" />
        <div className="absolute left-0 top-0 h-px w-16 bg-primary/50" />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">
            Loading data...
          </span>
        </div>
      )}

      {!loading && !report && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="text-2xl text-muted-foreground/20 font-mono">404</div>
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">
            No data found
          </span>
        </div>
      )}

      {!loading && report && (
        <article className="prose-notion">
          <Markdown content={report.summary} />
        </article>
      )}
    </div>
  );
}
