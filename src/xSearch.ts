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

投稿内容の要約 (1〜2文に簡潔にまとめる)
ポストURL: https://x.com/...
---

## ルール:
- 最大10件まで
- 注目度の高い順に並べる
- 投稿内容は日本語で要約する (元が英語でも日本語に翻訳)
- ユーザー名・ユーザーID（@xxx）は一切含めない
- いいね数・リポスト数・エンゲージメント数は一切含めない
- 各ポストの元のURL (https://x.com/... 形式) を必ず含める
- 最後に「---」の区切りは不要

## 除外ルール（必須）:
- 自動車・車に関するポストのみを対象とする
- 日産スタジアム（Nissan Stadium）でのライブ・コンサート・スポーツ観戦・イベントに関するポストは除外する
- ポスト本文に「日産」「Nissan」「車」「自動車」「EV」「クルマ」などの自動車関連ワードが含まれないポストは除外する（ユーザー名・アカウント名のみに「日産」「Nissan」が含まれる場合は対象外）`;

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

## 除外ルール（必須）:
- 自動車・車に関するポストのみを対象とする
- 日産スタジアム（Nissan Stadium）でのライブ・コンサート・スポーツ観戦・イベントに関するポストは除外する
- ポスト本文に自動車関連ワードが含まれないポストは除外する（ユーザー名のみに「日産」「Nissan」が含まれる場合は対象外）

## ルール:
- ポストをセンチメント（感情）で分類し、以下の3セクションに分けてまとめる:
  - 「ポジティブな話題」: 好意的・前向き・期待・称賛などのポスト
  - 「ネガティブな話題」: 批判的・懸念・不満・失望などのポスト
  - 「中立・その他」: 事実報告・ニュース速報・意見が明確でないポスト
- 各セクション内では、重複するポストは1つにまとめる
- 各ポストの要約は1〜2文に簡潔にまとめる
- 各ポストの要約テキストにはMarkdownリンク形式で元のXポストへのリンクを付ける。例: [要約テキスト](https://x.com/...)
- 日本語で出力する
- ユーザー名・ユーザーID（@xxx）は一切含めない
- いいね数・リポスト数・エンゲージメント数は一切含めない（❤️🔁などの絵文字も不要）
- ポストIDは含めない
- Markdown形式で見やすく整形する
- 冒頭に全体の概要を2〜3文で書き、ポジティブ/ネガティブの全体的な傾向にも触れる

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
