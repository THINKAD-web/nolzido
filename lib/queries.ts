import { events, shows, zones } from "./mock-data";
import type { Event, EventCategory, Show, Zone } from "./types";

// 데이터 접근 계층. 지금은 lib/mock-data.ts를 읽지만, 함수 시그니처와
// async 반환 형태는 @prisma/client 호출로 그대로 교체할 수 있도록 맞춰둔다.
// 호출부(app/*, components/*)는 이 파일의 함수만 알면 되고, DB 연결 여부를
// 알 필요가 없다.

export interface EventFilter {
  category?: EventCategory;
  zoneId?: string;
  hasInvite?: boolean;
  isFree?: boolean;
}

export async function getEvents(filter: EventFilter = {}): Promise<Event[]> {
  return events.filter((event) => {
    if (event.status !== "PUBLISHED") return false;
    if (filter.category && event.category !== filter.category) return false;
    if (filter.zoneId && event.zoneId !== filter.zoneId) return false;
    if (filter.hasInvite !== undefined && event.hasInvite !== filter.hasInvite) return false;
    if (filter.isFree !== undefined && event.isFree !== filter.isFree) return false;
    return true;
  });
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  return events.find((event) => event.slug === slug) ?? null;
}

export async function getFreeShowEvents(): Promise<Event[]> {
  return getEvents({ hasInvite: true });
}

export async function getZones(): Promise<Zone[]> {
  return [...zones].sort((a, b) => a.order - b.order);
}

export async function getZoneBySlug(slug: string): Promise<Zone | null> {
  return zones.find((zone) => zone.slug === slug) ?? null;
}

export async function getShowsByEventId(eventId: string): Promise<Show[]> {
  return shows
    .filter((show) => show.eventId === eventId)
    .sort((a, b) => a.showAt.localeCompare(b.showAt));
}

export async function getShowById(id: string): Promise<Show | null> {
  return shows.find((show) => show.id === id) ?? null;
}

export function getRemainingSeats(show: Show): number {
  return Math.max(0, show.totalSeats - show.heldSeats);
}
