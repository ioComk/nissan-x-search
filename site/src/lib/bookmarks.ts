const STORAGE_KEY = "nissan-x-search:topic-bookmarks";

export interface TopicBookmark {
  id: string;           // `${date}_${topicIndex}`
  date: string;
  section: string;      // e.g. "ポジティブな話題"
  raw: string;          // raw text (markdown links stripped)
  html: string;         // rendered HTML with link icons
  bookmarkedAt: number;
}

export function getTopicBookmarks(): TopicBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isTopicBookmarked(id: string): boolean {
  return getTopicBookmarks().some((b) => b.id === id);
}

export function toggleTopicBookmark(bookmark: TopicBookmark): TopicBookmark[] {
  const current = getTopicBookmarks();
  const existingIdx = current.findIndex((b) => b.id === bookmark.id);
  const updated =
    existingIdx >= 0
      ? current.filter((_, i) => i !== existingIdx)
      : [...current, bookmark];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/** ブックマーク済み日付の Set を返す（カレンダーインジケーター用） */
export function getBookmarkedDates(): Set<string> {
  return new Set(getTopicBookmarks().map((b) => b.date));
}
