/**
 * xAI Grok API を使用して X (Twitter) を検索するモジュール
 * Responses API + x_search ツールを使用
 */

const XAI_API_URL = "https://api.x.ai/v1/responses";
const MODEL = "grok-3-fast-latest";

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
❤️ いいね数 🔁 リポスト数
---

## ルール:
- 最大10件まで
- 注目度の高い順 (エンゲージメントが多い順) に並べる
- 投稿内容は日本語で要約する (元が英語でも日本語に翻訳)
- いいね数・リポスト数が不明な場合は省略してよい
- 最後に「---」の区切りは不要
- ポストのURLがわかる場合は投稿内容の後に記載する`;

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
