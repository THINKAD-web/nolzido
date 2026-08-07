import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { getEvents, getFreeShowEvents, getZones } from "@/lib/queries";

export default async function HomePage() {
  const [events, zones, freeShowEvents] = await Promise.all([
    getEvents(),
    getZones(),
    getFreeShowEvents(),
  ]);

  const zoneNameById = new Map(zones.map((zone) => [zone.id, zone.name]));
  const previewEvents = events.slice(0, 8);

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
          <span className="text-sm text-muted">{events.length}건 공개됨</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              zoneName={event.zoneId ? zoneNameById.get(event.zoneId) : null}
            />
          ))}
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
