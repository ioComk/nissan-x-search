import type { DailyReport, DataIndex } from "./types";

const BASE = import.meta.env.BASE_URL;

export async function fetchIndex(): Promise<DataIndex> {
  const res = await fetch(`${BASE}data/index.json`);
  if (!res.ok) return { dates: [] };
  return res.json();
}

export async function fetchReport(date: string): Promise<DailyReport | null> {
  const res = await fetch(`${BASE}data/${date}.json`);
  if (!res.ok) return null;
  return res.json();
}
