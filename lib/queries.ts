import { formatEventDateRange } from "./event-display";
import { addDaysToDateKey, diffDaysKst, toKstDateKey } from "./kst-date";
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

// 이벤트가 KST 캘린더 날짜 dateKey에 "열려있는지" — 그날 시작하는 것만이
// 아니라 startDate ≤ dateKey ≤ endDate 기간에 걸치면 전부 포함한다.
// isAlwaysOpen은 항상 포함.
function isEventOpenOn(event: Pick<Event, "startDate" | "endDate" | "isAlwaysOpen">, dateKey: string): boolean {
  if (event.isAlwaysOpen) return true;
  const startKey = toKstDateKey(new Date(event.startDate));
  const endKey = toKstDateKey(new Date(event.endDate));
  return dateKey >= startKey && dateKey <= endKey;
}

/**
 * [range.from, range.to] 구간(KST, 양끝 포함)의 날짜별로, 그날 열려있는
 * PUBLISHED 행사 수를 한 번에 집계해서 반환한다. 호출부가 날짜마다 따로
 * 쿼리를 보내는 구조가 되면 안 되므로 — 지금은 mock 배열을 한 번 순회하지만,
 * PR #2에서는 이 함수 내부만 날짜 범위 집계 SQL 한 방으로 바뀌고 시그니처는
 * 그대로 유지된다.
 */
export async function getEventCoverageByDate(
  range: { from: string; to: string },
  category?: EventCategory,
): Promise<Record<string, number>> {
  const dayCount = diffDaysKst(range.from, range.to) + 1;
  const dateKeys = Array.from({ length: Math.max(dayCount, 0) }, (_, i) =>
    addDaysToDateKey(range.from, i),
  );

  const coverage: Record<string, number> = Object.fromEntries(dateKeys.map((key) => [key, 0]));

  for (const event of events) {
    if (event.status !== "PUBLISHED") continue;
    if (category && event.category !== category) continue;

    for (const key of dateKeys) {
      if (isEventOpenOn(event, key)) {
        coverage[key] += 1;
      }
    }
  }

  return coverage;
}

export interface EventListFilter {
  category?: EventCategory;
  /** KST 캘린더 날짜(YYYY-MM-DD). 그날 열려있는(기간 겹침) 행사만 포함. */
  dateKey?: string;
  page?: number;
  pageSize?: number;
}

export interface EventListResult {
  events: Event[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 12;

export async function getEventsPage(filter: EventListFilter = {}): Promise<EventListResult> {
  const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;

  let filtered = events.filter((event) => event.status === "PUBLISHED");
  if (filter.category) {
    filtered = filtered.filter((event) => event.category === filter.category);
  }
  if (filter.dateKey) {
    const dateKey = filter.dateKey;
    filtered = filtered.filter((event) => isEventOpenOn(event, dateKey));
  }

  // 정렬: 진행중(isOngoing) 우선 → 다가오는 순(startDate). isAlwaysOpen은
  // 항상 포함하되 최하단으로 — 상시 운영 항목이 매번 그리드 맨 위를
  // 차지하지 않도록.
  const withOngoing = filtered.map((event) => ({
    event,
    isOngoing: formatEventDateRange(event).isOngoing,
  }));

  withOngoing.sort((a, b) => {
    if (a.event.isAlwaysOpen !== b.event.isAlwaysOpen) {
      return a.event.isAlwaysOpen ? 1 : -1;
    }
    if (a.isOngoing !== b.isOngoing) {
      return a.isOngoing ? -1 : 1;
    }
    return a.event.startDate.localeCompare(b.event.startDate);
  });

  const sorted = withOngoing.map((entry) => entry.event);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(filter.page ?? 1, 1), totalPages);

  const start = (page - 1) * pageSize;
  const pageEvents = sorted.slice(start, start + pageSize);

  return { events: pageEvents, page, pageSize, totalCount, totalPages };
}
