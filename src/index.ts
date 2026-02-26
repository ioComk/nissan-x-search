import "dotenv/config";
import { searchX, summarizeResults } from "./xSearch.js";
import { writeDailyData, updateIndex } from "./pageGenerator.js";

async function main() {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error("エラー: XAI_API_KEY が設定されていません");
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

  const formatDate = (d: Date) =>
    d.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const todayStr = formatDate(toDate);

  console.log("=== Nissan X Search ===");
  console.log(`キーワード: ${keywords.join(", ")}`);
  console.log(`期間: ${formatDate(fromDate)} ～ ${todayStr}`);
  console.log("");

  // X を検索
  const results = await searchX(apiKey, {
    keywords,
    fromDate: formatDate(fromDate),
    toDate: todayStr,
  });

  if (results.length === 0) {
    console.log("検索結果がありませんでした。");
    return;
  }

  // 全結果を統合して1つのMarkdown要約を生成
  const dateRange = `${formatDate(fromDate)} ～ ${todayStr}`;
  const summary = await summarizeResults(apiKey, results, dateRange);

  // JSON データを生成
  writeDailyData(summary, dateRange, todayStr);
  updateIndex();

  console.log("\n完了: GitHub Pages 用のデータを生成しました。");
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
