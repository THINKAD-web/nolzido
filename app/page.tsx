import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Pagination } from "@/components/Pagination";
import type { WeekStripDay } from "@/components/WeekStrip";
import { addDaysToDateKey, toKstDateKey } from "@/lib/kst-date";
import { getEventCoverageByDate, getEventsPage, getFreeShowEvents, getZones } from "@/lib/queries";
import { ExploreFilters } from "./_components/ExploreFilters";
import {
  buildExploreQueryString,
  parseCategoryParam,
  parseDateParam,
  parsePageParam,
} from "./_lib/explore-search-params";

// mock 데이터 단계에서는 사실상 no-op이지만, PR #2에서 실제 DB 호출로
// 바뀌었을 때 스펙 6장 가드레일(ISR revalidate 최소 3600초)이 바로 적용되도록
// 라우트 세그먼트에 미리 걸어둔다.
export const revalidate = 3600;

const WEEKDAY_FMT = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "short" });

function pick(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const rawParams = await searchParams;

  const todayKey = toKstDateKey(new Date());
  const fromKey = addDaysToDateKey(todayKey, -2);
  const toKeyEnd = addDaysToDateKey(todayKey, 6);
  const visibleRange = { from: fromKey, to: toKeyEnd };

  const category = parseCategoryParam(pick(rawParams.cat));
  const dateKey = parseDateParam(pick(rawParams.date), visibleRange);
  const requestedPage = parsePageParam(pick(rawParams.page));

  const [zones, coverage, listResult, freeShowEvents] = await Promise.all([
    getZones(),
    getEventCoverageByDate(visibleRange, category),
    getEventsPage({ category, dateKey, page: requestedPage }),
    getFreeShowEvents(),
  ]);

  const zoneNameById = new Map(zones.map((zone) => [zone.id, zone.name]));

  const weekDays: WeekStripDay[] = Array.from({ length: 9 }, (_, i) => {
    const key = addDaysToDateKey(fromKey, i);
    const noon = new Date(`${key}T12:00:00+09:00`);
    return {
      date: key,
      weekdayLabel: WEEKDAY_FMT.format(noon),
      dayLabel: String(Number(key.split("-")[2])),
      isToday: key === todayKey,
      hasEvents: (coverage[key] ?? 0) > 0,
    };
  });

  const buildHref = (page: number) => `/${buildExploreQueryString({ category, dateKey, page })}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-card border border-line bg-card px-6 py-10 sm:px-10 sm:py-14">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-red">
          놀지도 by THINKAD
        </p>
        <h1 className="mt-3 font-display text-3xl font-black leading-tight text-ink sm:text-4xl">
          놀 거리는 다, 지도 위에
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          팝업·축제·공연·전시·플리마켓을 지도와 캘린더로 한눈에 모아보고, 무료
          공연 초대권까지 챙겨가세요.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/map"
            className="rounded-pill bg-red px-5 py-2.5 text-sm font-semibold text-paper hover:opacity-90"
          >
            지도로 보기
          </Link>
          <Link
            href="/free"
            className="rounded-pill bg-cobalt px-5 py-2.5 text-sm font-semibold text-paper hover:opacity-90"
          >
            놀지도 초대석
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-black text-ink">지역</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {zones.map((zone) => (
            <span
              key={zone.id}
              className="rounded-pill border border-line bg-card px-4 py-2 text-sm text-ink"
            >
              {zone.name}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-ink">
            이번 주 놀 거리
          </h2>
          <span className="text-sm text-muted">{listResult.totalCount}건 공개됨</span>
        </div>

        <div className="mt-4">
          <ExploreFilters weekDays={weekDays} activeCategory={category} activeDate={dateKey}>
            {listResult.events.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {listResult.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    zoneName={event.zoneId ? zoneNameById.get(event.zoneId) : null}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted">조건에 맞는 행사가 없습니다.</p>
            )}

            <Pagination page={listResult.page} totalPages={listResult.totalPages} buildHref={buildHref} />
          </ExploreFilters>
        </div>
      </section>

      <section className="mt-12 pb-16">
        <h2 className="font-display text-xl font-black text-ink">
          놀지도 초대석
        </h2>
        <p className="mt-1 text-sm text-muted">
          무료 공연 초대권으로 0원 마무리.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freeShowEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              zoneName={event.zoneId ? zoneNameById.get(event.zoneId) : null}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
