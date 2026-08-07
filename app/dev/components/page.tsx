import { notFound } from "next/navigation";
import { CategoryChip } from "@/components/CategoryChip";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/Skeleton";
import { WeekStrip, type WeekStripDay } from "@/components/WeekStrip";
import { getZones } from "@/lib/queries";
import type { Event, EventCategory } from "@/lib/types";
import { ClickableEventCardDemo } from "./ClickableEventCardDemo";

const ALL_CATEGORIES: EventCategory[] = [
  "POPUP",
  "SHOW",
  "FESTIVAL",
  "EXHIBITION",
  "FLEA",
  "ETC",
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(12, 0, 0, 0);
  return d.toISOString();
}

function sampleEvent(
  overrides: Partial<Event> & Pick<Event, "id" | "slug" | "title">,
): Event {
  return {
    category: "POPUP",
    status: "PUBLISHED",
    summary: null,
    description: null,
    startDate: daysFromNow(0),
    endDate: daysFromNow(0),
    timeNote: null,
    isAlwaysOpen: false,
    zoneId: null,
    venueName: "샘플 장소",
    address: null,
    lat: null,
    lng: null,
    isFree: false,
    priceNote: null,
    hasInvite: false,
    thumbnailUrl: null,
    images: [],
    source: "MANUAL",
    sourceUrl: null,
    externalId: null,
    isSponsored: false,
    priority: 0,
    viewCount: 0,
    likeCount: 0,
    partnerId: null,
    tags: [],
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-30),
    ...overrides,
  };
}

const sampleEvents: Event[] = [
  sampleEvent({
    id: "dev_upcoming_normal",
    slug: "dev-upcoming-normal",
    title: "예정 · D-7 (normal 톤)",
    category: "EXHIBITION",
    startDate: daysFromNow(7),
    endDate: daysFromNow(14),
    timeNote: "화~일 11:00–19:00",
    priceNote: "8,000원",
  }),
  sampleEvent({
    id: "dev_upcoming_urgent",
    slug: "dev-upcoming-urgent",
    title: "예정 · D-2 + 초대석 (urgent / invite)",
    category: "SHOW",
    startDate: daysFromNow(2),
    endDate: daysFromNow(2),
    timeNote: "금 19:30 공연 시작",
    hasInvite: true,
    priceNote: "정가 30,000원 · 초대석 무료",
  }),
  sampleEvent({
    id: "dev_ongoing",
    slug: "dev-ongoing",
    title: "진행중 · 종료 임박 아님",
    category: "POPUP",
    startDate: daysFromNow(-3),
    endDate: daysFromNow(10),
    timeNote: "매일 11:00–20:00",
    isFree: true,
  }),
  sampleEvent({
    id: "dev_ending_soon",
    slug: "dev-ending-soon",
    title: "진행중 · 종료 임박(D-2)",
    category: "FLEA",
    startDate: daysFromNow(-5),
    endDate: daysFromNow(2),
    timeNote: "토·일 12:00–18:00",
    isFree: true,
  }),
  sampleEvent({
    id: "dev_ended",
    slug: "dev-ended",
    title: "종료된 행사",
    category: "FESTIVAL",
    startDate: daysFromNow(-20),
    endDate: daysFromNow(-5),
    timeNote: "매일 10:00–18:00",
    isFree: true,
  }),
  sampleEvent({
    id: "dev_always_open",
    slug: "dev-always-open",
    title: "상시 운영 전시",
    category: "EXHIBITION",
    isAlwaysOpen: true,
    startDate: daysFromNow(-365),
    endDate: daysFromNow(365),
    timeNote: "연중 상시 운영",
    priceNote: "10,000원",
  }),
  sampleEvent({
    id: "dev_price_unknown",
    slug: "dev-price-unknown",
    title: "가격 정보 없음 (unknown 톤 · 뱃지 미노출)",
    category: "ETC",
    startDate: daysFromNow(5),
    endDate: daysFromNow(5),
  }),
  sampleEvent({
    id: "dev_sponsored",
    slug: "dev-sponsored",
    title: "광고 뱃지 노출",
    category: "POPUP",
    startDate: daysFromNow(1),
    endDate: daysFromNow(20),
    isFree: true,
    isSponsored: true,
  }),
];

const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

const weekDays: WeekStripDay[] = Array.from({ length: 9 }, (_, i) => {
  const offset = i - 2; // 오늘 -2일 ~ +6일
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return {
    date: d.toISOString().slice(0, 10),
    weekdayLabel: WEEKDAY_LABEL[d.getUTCDay()],
    dayLabel: String(d.getUTCDate()),
    isToday: offset === 0,
    hasEvents: [0, 2, 5].includes(offset),
  };
});

export default async function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const zones = await getZones();
  const zoneName = zones[0]?.name ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-14 px-4 py-10">
      <p className="rounded-card border border-line bg-card px-4 py-3 text-sm text-muted">
        내부 컴포넌트 쇼케이스입니다. 프로덕션 빌드에서는 404 처리됩니다.
      </p>

      <section>
        <h2 className="font-display text-lg font-black text-ink">CategoryChip</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((category) => (
            <CategoryChip key={category} category={category} />
          ))}
          <CategoryChip category="POPUP" active />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-black text-ink">WeekStrip</h2>
        <div className="mt-4">
          <WeekStrip days={weekDays} selectedDate={weekDays[2]?.date} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-black text-ink">Skeleton</h2>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="aspect-[4/3] w-64" />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-black text-ink">
          EventCard — 상태별 톤
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleEvents.map((event) => (
            <EventCard key={event.id} event={event} zoneName={zoneName} />
          ))}
        </div>

        <h3 className="mt-8 font-display text-base font-black text-ink">
          onClick 모드 (지도 리스트/모달용)
        </h3>
        <div className="mt-4 max-w-sm">
          <ClickableEventCardDemo event={sampleEvents[0]} zoneName={zoneName} />
        </div>
      </section>
    </div>
  );
}
