export interface DailyReport {
  date: string;
  dateRange: string;
  summary: string;
}

export interface DataIndex {
  dates: string[];
}

export interface XaiBalance {
  /** 残高（単位は API レスポンスに依存） */
  balance?: number;
  /** 通貨コード */
  currency?: string;
  /** GitHub Actions が取得した日時 (ISO 8601) */
  fetched_at?: string;
  /** その他 API が返すフィールドを許容 */
  [key: string]: unknown;
}
