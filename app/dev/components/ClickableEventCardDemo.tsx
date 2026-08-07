"use client";

import { EventCard } from "@/components/EventCard";
import type { Event } from "@/lib/types";

interface ClickableEventCardDemoProps {
  event: Event;
  zoneName?: string | null;
}

// EventCard의 onClick 모드(지도 리스트/모달용) 시연. 클릭 핸들러는 클라이언트
// 컴포넌트에서만 만들 수 있어 이 작은 래퍼로 분리했다.
export function ClickableEventCardDemo({ event, zoneName }: ClickableEventCardDemoProps) {
  return (
    <EventCard
      event={event}
      zoneName={zoneName}
      onClick={() => alert(`클릭됨: ${event.title}`)}
    />
  );
}
