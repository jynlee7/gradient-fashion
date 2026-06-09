"use client";

import { useState } from "react";
import type { Item } from "@/lib/api";
import Feed from "@/components/Feed";
import ItemModal from "@/components/ItemModal";
import VisualSearch from "@/components/VisualSearch";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Discover
        </h1>
        <p className="mt-1 text-sm text-muted">
          Curated secondhand fashion from people with taste, not algorithms.
        </p>
      </div>

      <div className="mb-8">
        <VisualSearch onSelectItem={setSelectedItem} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Style Feed</h2>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="flex h-2 w-2 rounded-full bg-green-500" />
          Curated picks
        </div>
      </div>

      <Feed onOpenItem={setSelectedItem} />
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
