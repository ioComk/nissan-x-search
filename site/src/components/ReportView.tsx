import type { DailyReport } from "@/lib/types";
import { Markdown } from "./Markdown";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ReportViewProps {
  date: string;
  report: DailyReport | null;
  loading: boolean;
  onClose: () => void;
}

export function ReportView({ date, report, loading, onClose }: ReportViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{date}</h2>
          {report && (
            <p className="text-sm text-muted-foreground mt-1">
              {report.dateRange}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          読み込み中...
        </div>
      )}

      {!loading && !report && (
        <div className="text-center py-12 text-muted-foreground">
          データが見つかりませんでした
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
