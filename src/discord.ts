/**
 * Discord Webhook にメッセージを送信するモジュール
 */

const MAX_EMBED_DESCRIPTION = 4096;

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  author?: { name: string; icon_url?: string };
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

/**
 * Discord webhook に embed 形式でメッセージを送信する
 */
export async function sendToDiscord(
  webhookUrl: string,
  embeds: DiscordEmbed[]
): Promise<void> {
  // Discord は1回のリクエストで最大10 embeds まで
  const chunks = chunkArray(embeds, 10);

  for (const chunk of chunks) {
    const payload: DiscordWebhookPayload = {
      username: "Nissan X Search",
      embeds: chunk,
    };

    console.log(`[Discord] ${chunk.length} 件の embed を送信中...`);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Discord webhook エラー (${response.status}): ${errorText}`
      );
    }

    // Rate limit 対策: 複数チャンク送信時は間隔を空ける
    if (chunks.length > 1) {
      await sleep(1000);
    }
  }

  console.log("[Discord] 送信完了");
}

/**
 * 検索結果テキストを Discord embed に変換する
 * ヘッダー embed + 本文 embed(s) の構成
 */
export function buildEmbeds(
  keyword: string,
  content: string,
  dateRange: string
): DiscordEmbed[] {
  const now = new Date().toISOString();
  const embeds: DiscordEmbed[] = [];

  // ヘッダー embed
  embeds.push({
    author: { name: "Nissan X Search" },
    title: `🔍 「${keyword}」の最新ポストまとめ`,
    description: `📅 ${dateRange}`,
    color: 0xc3002f, // Nissan レッド
    timestamp: now,
  });

  // 本文 embed(s)
  if (content.length <= MAX_EMBED_DESCRIPTION) {
    embeds.push({
      description: content,
      color: 0x1da1f2,
      footer: { text: "Powered by Grok (xAI) | X Search" },
    });
  } else {
    const parts = splitText(content, MAX_EMBED_DESCRIPTION);
    for (let i = 0; i < parts.length; i++) {
      embeds.push({
        description: parts[i],
        color: 0x1da1f2,
        ...(i === parts.length - 1 && {
          footer: { text: "Powered by Grok (xAI) | X Search" },
        }),
      });
    }
  }

  return embeds;
}

function splitText(text: string, maxLength: number): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }

    // "---" の区切り線で分割を試みる
    let splitIndex = remaining.lastIndexOf("\n---", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.3) {
      // 改行で区切る
      splitIndex = remaining.lastIndexOf("\n", maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.3) {
      splitIndex = maxLength;
    }

    parts.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).replace(/^\n?---\n?/, "\n").trimStart();
  }

  return parts;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
