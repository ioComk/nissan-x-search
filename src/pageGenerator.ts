/**
 * GitHub Pages 用の HTML ページを生成するモジュール
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(process.cwd(), "docs");

/**
 * Markdown テキストを簡易的に HTML に変換する
 */
function markdownToHtml(md: string): string {
  let html = md
    // コードブロック（先に処理）
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    // 見出し
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // 太字・イタリック
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // 水平線
    .replace(/^---$/gm, "<hr>")
    // リスト
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // 連続する <li> を <ul> で囲む
    .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // 段落化（空行で区切られたテキストブロック）
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<hr")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}

/**
 * 日次レポートの HTML ページを生成する
 */
export function generateDailyPage(
  summary: string,
  dateRange: string,
  date: string
): string {
  const contentHtml = markdownToHtml(summary);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>日産 X まとめ - ${date}</title>
  <style>
    :root {
      --nissan-red: #c3002f;
      --bg: #0f1117;
      --surface: #1a1d27;
      --text: #e4e4e7;
      --text-muted: #9ca3af;
      --border: #2d3040;
      --positive: #22c55e;
      --negative: #ef4444;
      --neutral: #3b82f6;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
    }
    header {
      background: linear-gradient(135deg, var(--nissan-red), #8b0020);
      padding: 2rem;
      text-align: center;
    }
    header h1 { font-size: 1.5rem; font-weight: 700; }
    header p { color: rgba(255,255,255,0.8); margin-top: 0.5rem; font-size: 0.9rem; }
    nav {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 2rem;
      font-size: 0.85rem;
    }
    nav a { color: var(--nissan-red); text-decoration: none; }
    nav a:hover { text-decoration: underline; }
    main {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    article {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
    }
    article h1, article h2, article h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; }
    article h1 { font-size: 1.4rem; color: var(--nissan-red); }
    article h2 { font-size: 1.2rem; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    article h3 { font-size: 1rem; color: var(--text-muted); }
    article p { margin-bottom: 1rem; color: var(--text-muted); }
    article ul { padding-left: 1.5rem; margin-bottom: 1rem; }
    article li { margin-bottom: 0.5rem; color: var(--text-muted); }
    article li::marker { color: var(--nissan-red); }
    article hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
    article strong { color: var(--text); }
    footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>日産関連 X ポストまとめ</h1>
    <p>${dateRange}</p>
  </header>
  <nav><a href="../index.html">&larr; 一覧に戻る</a></nav>
  <main>
    <article>
      ${contentHtml}
    </article>
  </main>
  <footer>Powered by Grok (xAI) | Nissan X Search</footer>
</body>
</html>`;
}

/**
 * 日次ページを docs/YYYY-MM-DD/index.html に書き出す
 */
export function writeDailyPage(
  summary: string,
  dateRange: string,
  date: string
): string {
  const pageDir = join(DOCS_DIR, date);
  if (!existsSync(pageDir)) {
    mkdirSync(pageDir, { recursive: true });
  }

  const html = generateDailyPage(summary, dateRange, date);
  const filePath = join(pageDir, "index.html");
  writeFileSync(filePath, html, "utf-8");

  console.log(`[Pages] ${filePath} を生成しました`);
  return filePath;
}

/**
 * docs/ 配下の日付ディレクトリを走査してインデックスページを更新する
 */
export function updateIndexPage(): void {
  if (!existsSync(DOCS_DIR)) {
    mkdirSync(DOCS_DIR, { recursive: true });
  }

  // 日付ディレクトリを検出（YYYY-MM-DD 形式）
  const entries = readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse();

  const listItems = entries
    .map((date) => `        <li><a href="./${date}/index.html">${date}</a></li>`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>日産 X まとめ</title>
  <style>
    :root {
      --nissan-red: #c3002f;
      --bg: #0f1117;
      --surface: #1a1d27;
      --text: #e4e4e7;
      --text-muted: #9ca3af;
      --border: #2d3040;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
    }
    header {
      background: linear-gradient(135deg, var(--nissan-red), #8b0020);
      padding: 3rem 2rem;
      text-align: center;
    }
    header h1 { font-size: 1.8rem; font-weight: 700; }
    header p { color: rgba(255,255,255,0.8); margin-top: 0.5rem; }
    main {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem 2rem;
    }
    .card h2 {
      font-size: 1rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    ul { list-style: none; }
    li { padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
    li:last-child { border-bottom: none; }
    a {
      color: var(--text);
      text-decoration: none;
      font-size: 1.05rem;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    a:hover { color: var(--nissan-red); }
    .empty { color: var(--text-muted); text-align: center; padding: 2rem; }
    footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>日産関連 X ポストまとめ</h1>
    <p>毎日の X (Twitter) ポストをセンチメント分析してお届け</p>
  </header>
  <main>
    <div class="card">
      <h2>レポート一覧</h2>
${entries.length > 0 ? `      <ul>\n${listItems}\n      </ul>` : '      <p class="empty">まだレポートがありません</p>'}
    </div>
  </main>
  <footer>Powered by Grok (xAI) | Nissan X Search</footer>
</body>
</html>`;

  const indexPath = join(DOCS_DIR, "index.html");
  writeFileSync(indexPath, html, "utf-8");
  console.log(`[Pages] ${indexPath} を更新しました`);
}
