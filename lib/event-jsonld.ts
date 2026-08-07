import { getEventPriceDisplay } from "./event-display";
import { absoluteUrl } from "./site";
import type { Event } from "./types";

// schema.org Event 구조화 데이터 생성. 구글 이벤트 리치 결과 노출용이라
// 절대 생략하지 않는다(스펙 4장 PR #7 참고). 페이지에서 <script
// type="application/ld+json">로 삽입하며, title/description이 외부
// 콘텐츠라 삽입 시 '<'를 이스케이프한다(serializeJsonLd 참고).

interface JsonLdPlace {
  "@type": "Place";
  name?: string;
  address?: string;
  geo?: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
}

interface JsonLdOffer {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
  availability: string;
  url: string;
}

export interface EventJsonLd {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  startDate: string;
  endDate: string;
  eventAttendanceMode: string;
  // TODO(PR#7): ENDED 행사 noindex + sitemap 제외. eventStatus는
  // EventScheduled 고정으로 두되, 종료된 행사가 리치 결과에 계속 뜨지 않도록
  // 색인 처리는 PR #7에서 별도로 다룬다.
  eventStatus: string;
  url: string;
  description?: string;
  image?: string;
  location?: JsonLdPlace;
  offers?: JsonLdOffer;
}

// 마크다운/자유 텍스트에서 구조화 데이터용 순수 텍스트를 뽑는다.
function toPlainText(input: string, maxLength = 300): string {
  const stripped = input
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 링크 → 텍스트만
    .replace(/[#*_`>~-]/g, "") // 마크다운 기호
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxLength ? `${stripped.slice(0, maxLength - 1)}…` : stripped;
}

export function buildEventJsonLd(event: Event): EventJsonLd {
  const jsonLd: EventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: absoluteUrl(`/e/${event.slug}`),
  };

  const descriptionSource = event.summary ?? event.description;
  if (descriptionSource) {
    jsonLd.description = toPlainText(descriptionSource);
  }

  if (event.thumbnailUrl) {
    jsonLd.image = event.thumbnailUrl;
  }

  // venueName/address 둘 다 없으면 location 자체를 생략(빈 Place 억지로 안 채움).
  if (event.venueName || event.address) {
    const place: JsonLdPlace = { "@type": "Place" };
    if (event.venueName) place.name = event.venueName;
    if (event.address) place.address = event.address;
    if (event.lat !== null && event.lng !== null) {
      place.geo = {
        "@type": "GeoCoordinates",
        latitude: event.lat,
        longitude: event.lng,
      };
    }
    jsonLd.location = place;
  }

  // 가격 톤이 invite/free일 때만 offers(무료). paid/unknown은 priceNote가
  // 자유 텍스트라 숫자를 억지로 뽑지 않고 offers를 생략한다(부정확한 구조화
  // 데이터보다 생략이 낫다).
  const priceTone = getEventPriceDisplay(event).tone;
  if (priceTone === "invite" || priceTone === "free") {
    jsonLd.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/e/${event.slug}`),
    };
  }

  return jsonLd;
}

// <script>에 안전하게 삽입하기 위한 직렬화. title/description이 외부
// 콘텐츠라 '</script'가 섞여도 태그가 깨지지 않도록 '<'를 이스케이프한다.
export function serializeJsonLd(jsonLd: EventJsonLd): string {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}
