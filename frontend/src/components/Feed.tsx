"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Item } from "@/lib/api";
import { getFeed } from "@/lib/api";
import ItemCard from "./ItemCard";

interface FeedProps {
  onOpenItem: (item: Item) => void;
}

export default function Feed({ onOpenItem }: FeedProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!loading && cursor !== null) return;
    try {
      const data = await getFeed(
        cursor,
        12,
        undefined,
        undefined
      );
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.next_cursor);
    } catch (e) {
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && cursor) {
          setLoading(true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, cursor]);

  useEffect(() => {
    if (loading && cursor !== null) {
      loadMore();
    }
  }, [loading]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-4xl">:(</div>
        <p className="text-muted">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            loadMore();
          }}
          className="mt-4 rounded-full bg-accent px-6 py-2 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onOpen={onOpenItem} />
        ))}
      </div>
      <div ref={loaderRef} className="flex justify-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
            Loading more...
          </div>
        )}
        {!cursor && items.length > 0 && (
          <p className="text-sm text-muted">You've caught up. Come back later for new finds.</p>
        )}
      </div>
    </div>
  );
}
