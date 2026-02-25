import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getSyncId,
  setSyncId,
  downloadBookmarks,
  getLastSyncTime,
} from "@/lib/sync";
import type { TopicBookmark } from "@/lib/bookmarks";
import { Copy, Check, RefreshCw, AlertCircle } from "lucide-react";

interface SyncPanelProps {
  onSyncImport: (bookmarks: TopicBookmark[]) => void;
}

export function SyncPanel({ onSyncImport }: SyncPanelProps) {
  // Supabase 未設定時は非表示
  if (!supabase) return null;

  const [syncId] = useState(() => getSyncId());
  const [copied, setCopied] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const lastSync = getLastSyncTime();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(syncId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 失敗時は無視
    }
  };

  const handleImport = async () => {
    const trimmed = importInput.trim();
    if (!trimmed) return;

    // UUID 形式バリデーション
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmed)) {
      setImportError("無効な Sync ID 形式です");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportSuccess(false);

    setSyncId(trimmed);
    const bookmarks = await downloadBookmarks();

    setImporting(false);

    if (bookmarks === null) {
      setImportError("データが見つかりませんでした");
      return;
    }

    onSyncImport(bookmarks);
    setImportSuccess(true);
    setImportInput("");
    setTimeout(() => setImportSuccess(false), 3000);
  };

  const formattedLastSync = lastSync
    ? new Date(lastSync).toLocaleString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="border-b border-border bg-card/30 backdrop-blur-sm px-4 sm:px-6 py-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Sync ID 表示 */}
        <div>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1.5">
            Sync ID — このIDを別デバイスで入力してブックマークを同期
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded truncate">
              {syncId}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded border border-border hover:border-primary/30"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">コピー済み</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>コピー</span>
                </>
              )}
            </button>
          </div>
          {formattedLastSync && (
            <p className="mt-1 text-[10px] text-muted-foreground/50 font-mono">
              最終同期: {formattedLastSync}
            </p>
          )}
        </div>

        {/* 別デバイスから同期 */}
        <div>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1.5">
            別デバイスから同期
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={importInput}
              onChange={(e) => {
                setImportInput(e.target.value);
                setImportError(null);
              }}
              placeholder="別デバイスの Sync ID を入力..."
              className="flex-1 text-xs font-mono bg-background border border-border rounded px-3 py-1.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={handleImport}
              disabled={importing || !importInput.trim()}
              className="flex-shrink-0 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded border border-border hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${importing ? "animate-spin" : ""}`} />
              <span>{importing ? "同期中..." : "同期"}</span>
            </button>
          </div>

          {importError && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-red-400">
              <AlertCircle className="w-3 h-3" />
              {importError}
            </p>
          )}
          {importSuccess && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-green-400">
              <Check className="w-3 h-3" />
              ブックマークを同期しました
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
