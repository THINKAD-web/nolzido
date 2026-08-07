import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventBody } from "@/components/EventBody";
import { EventMiniMap } from "@/components/EventMiniMap";
import { LikeButton } from "@/components/LikeButton";
import { ShareButtons } from "@/components/ShareButtons";
import {
  formatEventDateRange,
  getEventCategoryLabel,
  getEventDday,
  getEventPriceDisplay,
  type EventDdayTone,
  type EventPriceTone,
} from "@/lib/event-display";
import { buildEventJsonLd, serializeJsonLd } from "@/lib/event-jsonld";
import { getEventBySlug, getZones } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

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

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return { title: "행사를 찾을 수 없습니다 — 놀지도" };
  }

  const dateDisplay = formatEventDateRange(event);
  const description = event.summary ?? `${getEventCategoryLabel(event.category)} · ${dateDisplay.full}`;
  const canonical = absoluteUrl(`/e/${event.slug}`);

  return {
    title: `${event.title} — 놀지도`,
    description,
    alternates: { canonical },
    openGraph: {
      title: event.title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const [event, zones] = await Promise.all([getEventBySlug(slug), getZones()]);

  if (!event) {
    notFound();
  }

  const dateDisplay = formatEventDateRange(event);
  const ddayDisplay = getEventDday(event);
  const priceDisplay = getEventPriceDisplay(event);
  const zoneName = event.zoneId ? zones.find((z) => z.id === event.zoneId)?.name ?? null : null;
  const jsonLd = buildEventJsonLd(event);
  const shareUrl = absoluteUrl(`/e/${event.slug}`);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {/* JSON-LD: 구글 이벤트 리치 결과용(생략 금지). */}
      <script
        type="application/ld+json"
        // title/description이 외부 콘텐츠라 serializeJsonLd에서 '<'를 이스케이프함.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← 둘러보기로
      </Link>

      {/* 히어로 이미지 */}
      <div
        className="mt-4 aspect-[16/9] w-full overflow-hidden rounded-card bg-line bg-cover bg-center"
        style={event.thumbnailUrl ? { backgroundImage: `url(${event.thumbnailUrl})` } : undefined}
      />

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-pill bg-ink/5 px-2.5 py-1 font-medium text-ink">
            {getEventCategoryLabel(event.category)}
          </span>
          {ddayDisplay && (
            <span className={`rounded-pill px-2.5 py-1 font-medium ${DDAY_TONE_CLASS[ddayDisplay.tone]}`}>
              {ddayDisplay.label}
            </span>
          )}
          {/* isSponsored면 광고 뱃지 필수(표시광고법 의무). */}
          {event.isSponsored && (
            <span className="rounded-pill bg-line px-2.5 py-1 font-medium text-muted">광고</span>
          )}
        </div>

        <h1 className="mt-3 font-display text-3xl font-black leading-tight text-ink">{event.title}</h1>

        {event.summary && <p className="mt-3 text-muted">{event.summary}</p>}
      </div>

      {/* 메타 정보 */}
      <dl className="mt-6 grid grid-cols-1 gap-3 rounded-card border border-line bg-card p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">기간</dt>
          <dd className="mt-0.5 font-medium text-ink">{dateDisplay.full}</dd>
          {dateDisplay.timeNote && <dd className="mt-0.5 text-muted">{dateDisplay.timeNote}</dd>}
        </div>
        <div>
          <dt className="text-muted">장소</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {event.venueName ?? "장소 미정"}
            {zoneName ? ` · ${zoneName}` : ""}
          </dd>
          {event.address && <dd className="mt-0.5 text-muted">{event.address}</dd>}
        </div>
        <div>
          <dt className="text-muted">가격</dt>
          <dd className={`mt-0.5 font-medium ${priceDisplay.tone === "unknown" ? "text-muted" : "text-ink"}`}>
            <span
              className={`inline-block rounded-pill px-2 py-0.5 ${PRICE_TONE_CLASS[priceDisplay.tone]}`}
            >
              {priceDisplay.labelLong}
            </span>
          </dd>
        </div>
      </dl>

      {/* 찜 + 공유 */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LikeButton slug={event.slug} />
        <ShareButtons
          url={shareUrl}
          title={event.title}
          description={event.summary ?? undefined}
          imageUrl={event.thumbnailUrl ?? undefined}
        />
      </div>

      {/* 본문(마크다운) */}
      {event.description && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-black text-ink">상세 정보</h2>
          <div className="mt-4">
            <EventBody markdown={event.description} />
          </div>
        </section>
      )}

      {/* 태그 */}
      {event.tags.length > 0 && (
        <section className="mt-8">
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-pill border border-line bg-card px-3 py-1 text-sm text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 지도 미니맵 (좌표 없으면 주소 텍스트) */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-black text-ink">위치</h2>
        <div className="mt-4">
          <EventMiniMap
            lat={event.lat}
            lng={event.lng}
            address={event.address}
            venueName={event.venueName}
            focusId={event.id}
          />
        </div>
      </section>
    </article>
  );
}
