/**
 * Discord Webhook にメッセージを送信するモジュール
 */

const MAX_EMBED_DESCRIPTION = 4096;
const MAX_CONTENT_LENGTH = 2000;

export interface DiscordEmbed {
  title: string;
  description: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string };
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
 */
export function buildEmbeds(
  keyword: string,
  content: string
): DiscordEmbed[] {
  const now = new Date().toISOString();

  // description が 4096 文字を超える場合は分割
  if (content.length <= MAX_EMBED_DESCRIPTION) {
    return [
      {
        title: `🔍 X検索: "${keyword}"`,
        description: content,
        color: 0x1da1f2, // X (Twitter) ブルー
        timestamp: now,
        footer: { text: "Powered by Grok (xAI)" },
      },
    ];
  }

  const parts = splitText(content, MAX_EMBED_DESCRIPTION);
  return parts.map((part, i) => ({
    title: `🔍 X検索: "${keyword}" (${i + 1}/${parts.length})`,
    description: part,
    color: 0x1da1f2,
    timestamp: now,
    footer: { text: "Powered by Grok (xAI)" },
  }));
}

function splitText(text: string, maxLength: number): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }

    // 改行で区切れる箇所を探す
    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = maxLength;
    }

    parts.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
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
