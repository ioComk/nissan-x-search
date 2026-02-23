interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const html = markdownToHtml(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function markdownToHtml(md: string): string {
  let html = md
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
