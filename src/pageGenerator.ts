/**
 * GitHub Pages 用のデータファイル (JSON) を生成するモジュール
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "docs", "data");

interface DailyData {
  date: string;
  dateRange: string;
  summary: string;
}

/**
 * 日次レポートを docs/data/YYYY-MM-DD.json に書き出す
 */
export function writeDailyData(
  summary: string,
  dateRange: string,
  date: string
): string {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  const data: DailyData = { date, dateRange, summary };
  const filePath = join(DATA_DIR, `${date}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`[Pages] ${filePath} を生成しました`);
  return filePath;
}

/**
 * docs/data/ 配下の日付 JSON を走査してインデックスを更新する
 */
export function updateIndex(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  const dates = readdirSync(DATA_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();

  const indexPath = join(DATA_DIR, "index.json");
  writeFileSync(indexPath, JSON.stringify({ dates }, null, 2), "utf-8");
  console.log(`[Pages] ${indexPath} を更新しました`);
}
