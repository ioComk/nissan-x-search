export interface ParsedTopic {
  index: number;  // global index within the report
  raw: string;    // original text (for storage / search)
  html: string;   // rendered HTML with link icons
}

export interface ParsedSection {
  heading: string;
  bodyHtml: string;   // non-list body text (e.g., 概要 paragraph)
  topics: ParsedTopic[];
}

const LINK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;margin-left:3px;vertical-align:middle;opacity:0.7"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

/**
 * "テキスト。[テキスト](URL)" のようにリンク前に重複するプレーンテキストがある場合、
 * リンク部分のみを残す（AIが誤ったフォーマットで出力した場合の防御的処理）
 */
function removeRedundantPrefix(text: string): string {
  // リンクが1つだけで、かつリンク前にプレーンテキストがある場合に適用
  const match = text.match(/^([^\[]+)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
  if (match) {
    const [, prefix, label, url] = match;
    if (prefix.trim()) {
      return `[${label}](${url})`;
    }
  }
  return text;
}

function processLinks(text: string): string {
  text = removeRedundantPrefix(text);
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const matches = [...text.matchAll(pattern)];
  if (matches.length === 0) return text;
  let idx = 0;
  return text.replace(pattern, (_, label, url) => {
    idx++;
    const num =
      matches.length > 1
        ? `<sup style="font-size:0.65em;margin-right:1px;opacity:0.75">${idx}</sup>`
        : "";
    return `${label}<a href="${url}" target="_blank" rel="noopener noreferrer">${num}${LINK_ICON}</a>`;
  });
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderBodyHtml(lines: string[]): string {
  const md = lines.join("\n").trim();
  if (!md) return "";
  return md
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      return `<p>${renderInline(processLinks(trimmed)).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

/** Markdown レポートをセクション単位に分解する */
export function parseReport(markdown: string): ParsedSection[] {
  // ## で区切る
  const chunks = markdown.split(/^(?=## )/m).filter((s) => s.trim());
  let topicIndex = 0;

  return chunks.map((chunk) => {
    const nl = chunk.indexOf("\n");
    const heading = chunk.slice(0, nl).replace(/^## /, "").trim();
    const body = nl >= 0 ? chunk.slice(nl + 1) : "";

    const bodyLines: string[] = [];
    const topics: ParsedTopic[] = [];

    for (const line of body.split("\n")) {
      if (/^- /.test(line)) {
        const raw = line.replace(/^- /, "").trim();
        if (raw) {
          topics.push({
            index: topicIndex++,
            raw,
            html: processLinks(renderInline(raw)),
          });
        }
      } else {
        bodyLines.push(line);
      }
    }

    return { heading, bodyHtml: renderBodyHtml(bodyLines), topics };
  });
}

/** セクション見出しに対応する色クラスを返す */
export function sectionColor(heading: string): {
  badge: string;
  dot: string;
} {
  if (heading.includes("ポジティブ"))
    return {
      badge: "bg-teal-500/15 text-teal-400 border border-teal-500/20",
      dot: "bg-teal-400",
    };
  if (heading.includes("ネガティブ"))
    return {
      badge: "bg-red-500/15 text-red-400 border border-red-500/20",
      dot: "bg-red-400",
    };
  if (heading.includes("中立"))
    return {
      badge: "bg-muted/60 text-muted-foreground border border-border",
      dot: "bg-muted-foreground",
    };
  return {
    badge: "bg-primary/10 text-primary border border-primary/20",
    dot: "bg-primary",
  };
}
