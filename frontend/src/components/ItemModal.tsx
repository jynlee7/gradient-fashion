"use client";

import { useEffect, useState } from "react";
import type { Item } from "@/lib/api";
import { getSimilar, likeItem } from "@/lib/api";

interface ItemModalProps {
  item: Item | null;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const [similar, setSimilar] = useState<Item[]>([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!item) return;
    setLikes(item.likes);
    setLiked(false);
    getSimilar(item.id).then(setSimilar).catch(() => {});
  }, [item]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!item) return null;

  const handleLike = async () => {
    if (!liked) {
      setLiked(true);
      setLikes((l) => l + 1);
      try {
        const res = await likeItem(item.id);
        setLikes(res.likes);
      } catch {
        setLikes((l) => l - 1);
        setLiked(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={item.image_url}
            alt={item.title}
            className="max-h-[50vh] w-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {item.category}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted">Curated by @{item.curator}</p>
            </div>
            <span className="shrink-0 text-2xl font-bold text-accent">{item.price}</span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                liked
                  ? "bg-accent text-white"
                  : "border border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likes}
            </button>
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View on {item.source}
            </a>
          </div>

          {similar.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <h3 className="mb-3 text-sm font-semibold text-muted">Similar Finds</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {similar.map((s) => (
                  <div key={s.id} className="w-28 shrink-0">
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-1 truncate text-xs font-medium">{s.title}</p>
                    <p className="text-xs font-bold text-accent">{s.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
