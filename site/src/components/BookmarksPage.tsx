import type { TopicBookmark } from "@/lib/bookmarks";
import { sectionColor } from "@/lib/markdown";
import { Button } from "./ui/button";
import { ArrowLeft, Bookmark, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarksPageProps {
  bookmarks: TopicBookmark[];
  onRemove: (id: string) => void;
  onBack: () => void;
}

export function BookmarksPage({ bookmarks, onRemove, onBack }: BookmarksPageProps) {
  // 日付ごとにグループ化（新しい順）
  const grouped = bookmarks.reduce<Record<string, TopicBookmark[]>>((acc, b) => {
    (acc[b.date] ??= []).push(b);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen hud-grid flex flex-col">
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/60 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm font-bold tracking-widest uppercase text-foreground">
              BOOKMARKS
            </h1>
            {bookmarks.length > 0 && (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                {bookmarks.length}
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 via-amber-400/10 to-transparent" />
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
            ブックマーク済みトピック
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-amber-400/30 via-amber-400/10 to-transparent" />
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Bookmark className="w-10 h-10 text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">
              ブックマークがありません
            </p>
            <p className="text-[11px] text-muted-foreground/50">
              レポートを開いてトピックの★をクリックしてください
            </p>
          </div>
        )}

        <div className="space-y-8">
          {sortedDates.map((date) => (
            <section key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold font-mono tracking-widest text-foreground">
                  {date}
                </h2>
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground font-mono">
                  {grouped[date].length} topics
                </span>
              </div>

              {/* Topics */}
              <ul className="space-y-2">
                {grouped[date].map((bookmark) => {
                  const { badge, dot } = sectionColor(bookmark.section);
                  return (
                    <li
                      key={bookmark.id}
                      className="group flex items-start gap-3 p-3 rounded border border-border bg-card/40 hover:bg-card/70 transition-colors"
                    >
                      {/* Section badge */}
                      <span
                        className={cn(
                          "mt-0.5 flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide whitespace-nowrap",
                          badge
                        )}
                      >
                        <span className={cn("w-1 h-1 rounded-full", dot)} />
                        {bookmark.section}
                      </span>

                      {/* Topic content */}
                      <span
                        className="flex-1 text-sm text-[hsl(210_20%_70%)] leading-relaxed [&_a]:text-primary [&_a]:no-underline [&_a:hover]:opacity-80"
                        dangerouslySetInnerHTML={{ __html: bookmark.html }}
                      />

                      {/* Remove button */}
                      <button
                        onClick={() => onRemove(bookmark.id)}
                        className="flex-shrink-0 mt-0.5 text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="ブックマーク解除"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
