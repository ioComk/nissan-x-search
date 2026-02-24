interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const html = markdownToHtml(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const LINK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;margin-left:3px;vertical-align:middle;opacity:0.7"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

function processLinks(text: string): string {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const matches = [...text.matchAll(pattern)];
  if (matches.length === 0) return text;

  let idx = 0;
  return text.replace(pattern, (_, _label, url) => {
    idx++;
    const num = matches.length > 1
      ? `<sup style="font-size:0.65em;margin-right:1px;opacity:0.75">${idx}</sup>`
      : '';
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${num}${LINK_ICON}</a>`;
  });
}

function markdownToHtml(md: string): string {
  // コードブロックを保護してからリンク処理
  const codeBlocks: string[] = [];
  const withoutCode = md.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  // 行ごとにリンクを処理（複数リンクにナンバリング付与）
  const linkedMd = withoutCode.split('\n').map(processLinks).join('\n');

  // コードブロックを戻す
  const restored = linkedMd.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);

  let html = restored
    // コードブロック
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
    .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // 段落化
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(?:h[1-6]|ul|pre|hr)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}
