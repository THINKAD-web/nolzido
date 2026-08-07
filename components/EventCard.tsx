"use client";

import Link from "next/link";
import type { Event } from "@/lib/types";
import {
  formatEventDateRange,
  getEventDday,
  getEventPriceDisplay,
  type EventDdayTone,
  type EventPriceTone,
} from "@/lib/event-display";
import { CategoryChip } from "./CategoryChip";

const DDAY_TONE_CLASS: Record<EventDdayTone, string> = {
  urgent: "bg-red text-paper",
  normal: "bg-ink/5 text-ink",
  ongoing: "bg-ink/5 text-ink",
  ended: "bg-line text-muted",
};

const PRICE_TONE_CLASS: Record<EventPriceTone, string> = {
  invite: "bg-cobalt text-paper",
  free: "bg-ink/5 text-ink",
  paid: "bg-ink/5 text-ink",
  unknown: "bg-transparent text-muted",
};

interface EventCardProps {
  event: Event;
  zoneName?: string | null;
  href?: string;
  onClick?: () => void;
}

export function EventCard({ event, zoneName, href, onClick }: EventCardProps) {
  const dateDisplay = formatEventDateRange(event);
  const ddayDisplay = getEventDday(event);
  const priceDisplay = getEventPriceDisplay(event);

  const body = (
    <>
      <div
        className="aspect-[4/3] bg-line bg-cover bg-center"
        style={event.thumbnailUrl ? { backgroundImage: `url(${event.thumbnailUrl})` } : undefined}
      />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <CategoryChip category={event.category} />
          {ddayDisplay && (
            <span className={`rounded-pill px-2 py-1 font-medium ${DDAY_TONE_CLASS[ddayDisplay.tone]}`}>
              {ddayDisplay.label}
            </span>
          )}
          {priceDisplay.tone !== "unknown" && (
            <span className={`rounded-pill px-2 py-1 font-medium ${PRICE_TONE_CLASS[priceDisplay.tone]}`}>
              {priceDisplay.label}
            </span>
          )}
          {event.isSponsored && (
            <span className="rounded-pill bg-line px-2 py-1 font-medium text-muted">광고</span>
          )}
          {(event.lat === null || event.lng === null) && (
            <span className="rounded-pill bg-transparent px-2 py-1 font-medium text-muted">
              위치 미정
            </span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 font-semibold text-ink group-hover:text-red">{event.title}</h3>

        <p className="mt-1 text-sm text-muted">
          {dateDisplay.short}
          {zoneName ? ` · ${zoneName}` : ""}
        </p>
        {dateDisplay.timeNote && (
          <p className="mt-0.5 text-xs text-muted">{dateDisplay.timeNote}</p>
        )}
      </div>
    </>
  );

  const className =
    "group block w-full overflow-hidden rounded-card border border-line bg-card text-left transition-shadow hover:shadow-md";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }

  return (
    <Link href={href ?? `/e/${event.slug}`} className={className}>
      {body}
    </Link>
  );
}
