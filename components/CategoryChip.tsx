"use client";

import type { EventCategory } from "@/lib/types";
import { getEventCategoryLabel } from "@/lib/event-display";

interface CategoryChipProps {
  category: EventCategory;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ category, active = false, onClick }: CategoryChipProps) {
  const label = getEventCategoryLabel(category);
  const className = [
    "rounded-pill px-2.5 py-1 text-xs font-medium",
    active ? "bg-ink text-paper" : "bg-ink/5 text-ink",
  ].join(" ");

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {label}
      </button>
    );
  }

  return <span className={className}>{label}</span>;
}
