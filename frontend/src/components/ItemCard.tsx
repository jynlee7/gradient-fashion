"use client";

import type { Item } from "@/lib/api";
import { likeItem } from "@/lib/api";
import { useState } from "react";

interface ItemCardProps {
  item: Item;
  onOpen: (item: Item) => void;
}

export default function ItemCard({ item, onOpen }: ItemCardProps) {
  const [likes, setLikes] = useState(item.likes);
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      onClick={() => onOpen(item)}
      className="group cursor-pointer rounded-xl border border-border bg-surface transition-all hover:shadow-lg hover:-translate-y-0.5 animate-fade-in"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-zinc-100 dark:bg-zinc-800">
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        )}
        <img
          src={item.image_url}
          alt={item.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {item.source}
        </div>
        <button
          onClick={handleLike}
          className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
            liked
              ? "bg-accent text-white shadow-lg"
              : "bg-black/30 text-white hover:bg-black/50"
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
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
          <span className="shrink-0 text-sm font-bold text-accent">{item.price}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span>@{item.curator}</span>
          <span>·</span>
          <span>{likes} likes</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
