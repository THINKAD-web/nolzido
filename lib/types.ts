// prisma/schema.prisma (NOLZIDO_BUILD_SPEC.md 3장)와 동일한 타입 구조.
// PR #1은 DB 없이 lib/mock-data.ts로 이 타입들을 채우고,
// PR #2 이후 @prisma/client가 생성하는 타입으로 대체한다.

export type EventCategory =
  | "POPUP"
  | "SHOW"
  | "FESTIVAL"
  | "EXHIBITION"
  | "FLEA"
  | "ETC";

export type EventStatus = "DRAFT" | "PUBLISHED" | "ENDED" | "REJECTED";

export type SourceType = "PUBLIC_API" | "CRAWL" | "PARTNER" | "MANUAL";

export type ReservationStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "ATTENDED"
  | "NO_SHOW";

export type PartnerType = "PERFORMER" | "BRAND" | "ORGANIZER";

export type PartnerStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface Zone {
  id: string;
  slug: string;
  name: string;
  city: string;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  order: number;
  isActive: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  status: EventStatus;

  summary: string | null;
  description: string | null;

  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  timeNote: string | null;
  isAlwaysOpen: boolean;

  // 위치
  zoneId: string | null;
  venueName: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;

  // 가격
  isFree: boolean;
  priceNote: string | null;
  hasInvite: boolean;

  // 미디어
  thumbnailUrl: string | null;
  images: string[];

  // 출처
  source: SourceType;
  sourceUrl: string | null;
  externalId: string | null;

  // 운영
  isSponsored: boolean;
  priority: number;
  viewCount: number;
  likeCount: number;

  partnerId: string | null;

  // EventTag 조인을 mock 단계에서는 태그명 배열로 단순화
  tags: string[];

  createdAt: string;
  updatedAt: string;
}

export interface Show {
  id: string;
  eventId: string;
  showAt: string; // ISO 8601
  totalSeats: number;
  heldSeats: number;
  isClosed: boolean;
  note: string | null;
}

// PR #1 범위 밖 (타입만 정의, mock 인스턴스는 없음)

export interface Reservation {
  id: string;
  ticketNo: string;
  showId: string;
  name: string;
  phoneHash: string;
  phoneEnc: string;
  seats: number;
  status: ReservationStatus;
  cancelledAt: string | null;
  attendedAt: string | null;
  reviewId: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  images: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface Partner {
  id: string;
  clerkUserId: string | null;
  type: PartnerType;
  status: PartnerStatus;
  companyName: string;
  contactName: string;
  contactInfo: string;
  memo: string | null;
  createdAt: string;
}

export interface IngestLog {
  id: string;
  source: SourceType;
  target: string;
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  errorText: string | null;
  ranAt: string;
}
