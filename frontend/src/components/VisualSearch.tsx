"use client";

import { useRef, useState } from "react";
import { visualSearch } from "@/lib/api";
import type { Item } from "@/lib/api";

interface VisualSearchProps {
  onSelectItem: (item: Item) => void;
}

export default function VisualSearch({ onSelectItem }: VisualSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Item[] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setSearching(true);
    setResults(null);

    try {
      const data = await visualSearch(file);
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResults(null);
    setSearching(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <span className="text-sm font-semibold">Visual Search</span>
        </div>
        {preview && (
          <button onClick={reset} className="text-xs text-muted hover:text-foreground transition-colors">
            Clear
          </button>
        )}
      </div>

      <div className="mt-3">
        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-6 transition-colors hover:border-accent hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-sm text-muted">Upload a photo to find similar items</span>
            <span className="text-[10px] text-muted">JPG, PNG, WEBP</span>
          </button>
        ) : (
          <div>
            <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:w-48">
              <img src={preview} alt="Search query" className="h-full w-full object-cover" />
              {searching && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow-lg">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Searching...
                  </div>
                </div>
              )}
            </div>

            {results && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Results</p>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {results.length === 0 ? (
                    <p className="text-sm text-muted">No matches found</p>
                  ) : (
                    results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        className="w-24 shrink-0 text-left"
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="mt-1 truncate text-xs font-medium">{item.title}</p>
                        <p className="text-xs font-bold text-accent">{item.price}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
