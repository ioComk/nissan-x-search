const STORAGE_KEY = "nissan-x-search:bookmarks";

export function getBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    return new Set(dates);
  } catch {
    return new Set();
  }
}

export function toggleBookmark(date: string): Set<string> {
  const bookmarks = getBookmarks();
  if (bookmarks.has(date)) {
    bookmarks.delete(date);
  } else {
    bookmarks.add(date);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
  return new Set(bookmarks);
}
