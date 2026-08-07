import type { EventCategory } from "@/lib/types";

// 홈 화면(둘러보기) URL 쿼리 계약. 서버(page.tsx의 파싱)와 클라이언트
// (ExploreFilters의 링크 생성)가 같은 규칙을 쓰도록 한 파일에 모아둔다.
//
//   cat  — popup|show|festival|exhibition|flea|etc. 없거나 모르는 값 → 전체(필터 없음)
//   date — YYYY-MM-DD(Asia/Seoul). 없거나 형식이 틀리거나 WeekStrip이 보여주는
//          -2~+6일 범위 밖이면 → 필터 없음(전체 기간)
//   page — 1 이상 정수. 없거나 잘못됐으면 1 (총 페이지 초과분은 getEventsPage가 clamp)

export const CATEGORY_SLUG: Record<EventCategory, string> = {
  POPUP: "popup",
  SHOW: "show",
  FESTIVAL: "festival",
  EXHIBITION: "exhibition",
  FLEA: "flea",
  ETC: "etc",
};

const SLUG_TO_CATEGORY: Record<string, EventCategory> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG).map(([category, slug]) => [slug, category as EventCategory]),
);

export function parseCategoryParam(value: string | undefined): EventCategory | undefined {
  if (!value) return undefined;
  return SLUG_TO_CATEGORY[value];
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateParam(
  value: string | undefined,
  visibleRange: { from: string; to: string },
): string | undefined {
  if (!value || !DATE_KEY_RE.test(value)) return undefined;
  if (value < visibleRange.from || value > visibleRange.to) return undefined;
  return value;
}

export function parsePageParam(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function buildExploreQueryString(params: {
  category?: EventCategory;
  dateKey?: string;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("cat", CATEGORY_SLUG[params.category]);
  if (params.dateKey) sp.set("date", params.dateKey);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
