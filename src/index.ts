import "dotenv/config";
import { searchX, summarizeResults } from "./xSearch.js";
import { buildSummaryEmbeds, sendToDiscord } from "./discord.js";

async function main() {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error("エラー: XAI_API_KEY が設定されていません");
    process.exit(1);
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("エラー: DISCORD_WEBHOOK_URL が設定されていません");
    process.exit(1);
  }

  const keywords = (process.env.SEARCH_KEYWORDS || "日産,Nissan")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const searchDays = parseInt(process.env.SEARCH_DAYS || "1", 10);

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - searchDays);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  console.log("=== Nissan X Search ===");
  console.log(`キーワード: ${keywords.join(", ")}`);
  console.log(`期間: ${formatDate(fromDate)} ～ ${formatDate(toDate)}`);
  console.log("");

  // X を検索
  const results = await searchX(apiKey, {
    keywords,
    fromDate: formatDate(fromDate),
    toDate: formatDate(toDate),
  });

  if (results.length === 0) {
    console.log("検索結果がありませんでした。");
    return;
  }

  // 全結果を統合して1つのMarkdown要約を生成
  const dateRange = `${formatDate(fromDate)} ～ ${formatDate(toDate)}`;
  const summary = await summarizeResults(apiKey, results, dateRange);

  // Discord embed を構築して送信
  const embeds = buildSummaryEmbeds(summary, dateRange);
  await sendToDiscord(webhookUrl, embeds);

  console.log("\n完了: 統合要約を Discord に送信しました。");
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
