import { supabase } from "./supabase";
import type { TopicBookmark } from "./bookmarks";

const SYNC_ID_KEY = "nissan-x-search:sync-id";
const LAST_SYNC_KEY = "nissan-x-search:last-sync";

function generateUUID(): string {
  return crypto.randomUUID();
}

export function getSyncId(): string {
  let id = localStorage.getItem(SYNC_ID_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(SYNC_ID_KEY, id);
  }
  return id;
}

export function setSyncId(id: string): void {
  localStorage.setItem(SYNC_ID_KEY, id);
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

function setLastSyncTime(): void {
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}

export async function uploadBookmarks(bookmarks: TopicBookmark[]): Promise<void> {
  if (!supabase) return;
  const syncId = getSyncId();
  await supabase.from("bookmarks").upsert({
    sync_id: syncId,
    bookmarks: bookmarks,
    updated_at: new Date().toISOString(),
  });
  setLastSyncTime();
}

export async function downloadBookmarks(): Promise<TopicBookmark[] | null> {
  if (!supabase) return null;
  const syncId = getSyncId();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("bookmarks, updated_at")
    .eq("sync_id", syncId)
    .single();
  if (error || !data) return null;
  setLastSyncTime();
  return data.bookmarks as TopicBookmark[];
}
