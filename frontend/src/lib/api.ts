const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Item {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: string;
  source: string;
  source_url: string;
  category: string;
  tags: string[];
  likes: number;
  curator: string;
}

export interface Board {
  id: string;
  name: string;
  curator: string;
  description: string;
  items: string[];
  item_count: number;
}

export interface FeedResponse {
  items: Item[];
  next_cursor: string | null;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function getFeed(
  cursor?: string | null,
  limit = 10,
  category?: string,
  curator?: string
): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  if (category) params.set("category", category);
  if (curator) params.set("curator", curator);
  return fetchJSON(`${API}/api/feed?${params}`);
}

export function getItem(id: string): Promise<Item> {
  return fetchJSON(`${API}/api/items/${id}`);
}

export function getSimilar(id: string, limit = 6): Promise<Item[]> {
  return fetchJSON(`${API}/api/items/${id}/similar?limit=${limit}`);
}

export function likeItem(id: string): Promise<{ likes: number }> {
  return fetchJSON(`${API}/api/items/${id}/like`, { method: "POST" });
}

export function visualSearch(file: File): Promise<{ query: string; results: Item[] }> {
  const form = new FormData();
  form.append("file", file);
  return fetch(`${API}/api/search/visual`, { method: "POST", body: form }).then(
    (r) => r.json()
  );
}

export function getBoards(): Promise<Board[]> {
  return fetchJSON(`${API}/api/boards`);
}

export function getBoard(id: string): Promise<{ board: Board; items: Item[] }> {
  return fetchJSON(`${API}/api/boards/${id}`);
}

export function addToBoard(boardId: string, itemId: string): Promise<{ status: string }> {
  return fetchJSON(`${API}/api/boards/${boardId}/items/${itemId}`, { method: "POST" });
}

export function getCurators(): Promise<string[]> {
  return fetchJSON(`${API}/api/curators`);
}
