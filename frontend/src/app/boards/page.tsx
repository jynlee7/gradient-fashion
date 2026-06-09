"use client";

import { useEffect, useState } from "react";
import type { Board, Item } from "@/lib/api";
import { getBoards, getBoard } from "@/lib/api";
import ItemModal from "@/components/ItemModal";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [boardItems, setBoardItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .finally(() => setLoading(false));
  }, []);

  const openBoard = async (id: string) => {
    setSelectedBoard(id);
    try {
      const data = await getBoard(id);
      setBoardItems(data.items);
    } catch {
      setBoardItems([]);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Boards</h1>
        <p className="mt-1 text-sm text-muted">
          Collections curated by the community.
        </p>
      </div>

      {selectedBoard ? (
        <div>
          <button
            onClick={() => {
              setSelectedBoard(null);
              setBoardItems([]);
            }}
            className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to boards
          </button>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {boardItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer rounded-xl border border-border bg-surface transition-all hover:shadow-lg"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-t-xl bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition-all group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="text-sm font-bold text-accent">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => openBoard(board.id)}
              className="group rounded-xl border border-border bg-surface p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <h3 className="text-lg font-semibold">{board.name}</h3>
              <p className="mt-1 text-sm text-muted line-clamp-2">{board.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <span>@{board.curator}</span>
                <span>·</span>
                <span>{board.item_count} items</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
