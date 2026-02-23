/**
 * xAI Grok API を使用して X (Twitter) を検索するモジュール
 * Responses API + x_search ツールを使用
 */

const XAI_API_URL = "https://api.x.ai/v1/responses";
const MODEL = "grok-4-1-fast";

export interface XSearchOptions {
  keywords: string[];
  fromDate?: string;
  toDate?: string;
}

export interface XSearchResult {
  query: string;
  content: string;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function searchX(
  apiKey: string,
  options: XSearchOptions
): Promise<XSearchResult[]> {
  const results: XSearchResult[] = [];

  for (const keyword of options.keywords) {
    const query = `Xで「${keyword}」に関する最新の注目ポストを検索し、以下のフォーマットで整形して出力してください。

## 出力フォーマット (厳守):

各ポストを以下の形式で出力:

**@ユーザー名**
投稿内容の要約 (1〜2文に簡潔にまとめる)
---

## ルール:
- 最大10件まで
- 注目度の高い順に並べる
- 投稿内容は日本語で要約する (元が英語でも日本語に翻訳)
- いいね数・リポスト数・エンゲージメント数は一切含めない
- ポストのURLやリンクは一切含めない
- ポストIDは含めない
- 最後に「---」の区切りは不要`;

    const body: Record<string, unknown> = {
      model: MODEL,
      input: [
        {
          role: "user",
          content: query,
        },
      ],
      tools: [
        {
          type: "x_search" as const,
          ...(options.fromDate && { from_date: options.fromDate }),
          ...(options.toDate && { to_date: options.toDate }),
        },
      ],
    };

    console.log(`[xSearch] 検索中: "${keyword}" ...`);

    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[xSearch] API エラー (${response.status}): ${errorText}`
      );
      continue;
    }

    const data = await response.json();
    const content = extractContent(data);

    if (content) {
      results.push({ query: keyword, content });
      console.log(`[xSearch] "${keyword}" の結果を取得しました`);
    } else {
      console.warn(`[xSearch] "${keyword}" の結果が空でした`);
    }
  }

  return results;
}

/**
 * 複数キーワードの検索結果を統合し、1つのMarkdown要約を生成する
 */
export async function summarizeResults(
  apiKey: string,
  results: XSearchResult[],
  dateRange: string
): Promise<string> {
  const combinedContent = results
    .map((r) => `### キーワード: ${r.query}\n${r.content}`)
    .join("\n\n");

  const query = `以下は複数のキーワードでXを検索した結果です。これらを統合して、1つのMarkdown形式の要約レポートにまとめてください。

## ルール:
- キーワードごとに分けず、トピックやテーマごとにセクションを分けて1つのレポートにまとめる
- 重複するポストは1つにまとめる
- 各ポストの要約は1〜2文に簡潔にまとめる
- 日本語で出力する
- ユーザー名（@xxx）は含める
- いいね数・リポスト数・エンゲージメント数は一切含めない（❤️🔁などの絵文字も不要）
- ポストのURLやリンクは一切含めない
- ポストIDは含めない
- Markdown形式で見やすく整形する
- 冒頭に全体の概要を2〜3文で書く

## 検索期間: ${dateRange}

## 検索結果:
${combinedContent}`;

  console.log("[xSearch] 全体の統合要約を生成中...");

  const response = await fetch(XAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [{ role: "user", content: query }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`xAI API エラー (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = extractContent(data);

  if (!content) {
    throw new Error("統合要約の生成に失敗しました");
  }

  console.log("[xSearch] 統合要約を生成しました");
  return content;
}

function extractContent(responseData: Record<string, unknown>): string | null {
  const output = responseData.output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (
      item &&
      typeof item === "object" &&
      item.type === "message" &&
      Array.isArray(item.content)
    ) {
      for (const block of item.content) {
        if (
          block &&
          typeof block === "object" &&
          block.type === "output_text" &&
          typeof block.text === "string"
        ) {
          return block.text;
        }
      }
    }
  }

  return null;
}
