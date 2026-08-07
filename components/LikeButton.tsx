"use client";

import { useLike } from "@/lib/use-likes";

interface LikeButtonProps {
  slug: string;
}

export function LikeButton({ slug }: LikeButtonProps) {
  const { liked, toggle, hydrated } = useLike(slug);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={hydrated ? liked : undefined}
      className={`flex items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-medium transition-colors ${
        liked ? "border-red bg-red text-paper" : "border-line bg-card text-ink hover:border-ink/40"
      }`}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      {liked ? "찜함" : "찜하기"}
    </button>
  );
}
