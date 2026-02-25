import { useMemo } from "react";
import type { DailyReport } from "@/lib/types";
import type { TopicBookmark } from "@/lib/bookmarks";
import { parseReport, sectionColor } from "@/lib/markdown";
import { Button } from "./ui/button";
import { X, Calendar, Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportViewProps {
  date: string;
  report: DailyReport | null;
  loading: boolean;
  onClose: () => void;
  bookmarkedTopicIds: Set<string>;
  onToggleTopic: (bookmark: TopicBookmark) => void;
}

export function ReportView({
  date,
  report,
  loading,
  onClose,
  bookmarkedTopicIds,
  onToggleTopic,
}: ReportViewProps) {
  const sections = useMemo(
    () => (report ? parseReport(report.summary) : []),
    [report]
  );

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

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
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
        <div className="space-y-6">
          {sections.map((section) => {
            const { badge, dot } = sectionColor(section.heading);
            return (
              <div key={section.heading}>
                {/* Section heading */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-wider",
                      badge
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
                    {section.heading}
                  </span>
                </div>

                {/* Body text (e.g., 概要) */}
                {section.bodyHtml && (
                  <div
                    className="prose-notion mb-3"
                    dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
                  />
                )}

                {/* Topics with bookmark buttons */}
                {section.topics.length > 0 && (
                  <ul className="space-y-1.5">
                    {section.topics.map((topic) => {
                      const id = `${date}_${topic.index}`;
                      const bookmarked = bookmarkedTopicIds.has(id);
                      return (
                        <li
                          key={topic.index}
                          className="group flex items-start gap-2"
                        >
                          <button
                            onClick={() =>
                              onToggleTopic({
                                id,
                                date,
                                section: section.heading,
                                raw: topic.raw,
                                html: topic.html,
                                bookmarkedAt: Date.now(),
                              })
                            }
                            className={cn(
                              "mt-0.5 flex-shrink-0 transition-colors",
                              bookmarked
                                ? "text-amber-400 hover:text-amber-300"
                                : "text-muted-foreground/30 hover:text-amber-400 opacity-0 group-hover:opacity-100"
                            )}
                            title={bookmarked ? "ブックマーク解除" : "ブックマーク"}
                          >
                            {bookmarked ? (
                              <BookmarkCheck className="w-3.5 h-3.5 fill-amber-400" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span
                            className="text-sm text-[hsl(210_20%_70%)] leading-relaxed prose-notion [&_a]:text-primary [&_a]:no-underline [&_a:hover]:opacity-80"
                            dangerouslySetInnerHTML={{ __html: topic.html }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
