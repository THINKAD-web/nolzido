import type { Zone } from "@/lib/types";

// /map URL 쿼리 계약. app/_lib/explore-search-params.ts(PR #4)와 같은 패턴 —
// 서버 파서와 클라이언트 링크 빌더가 이 한 파일만 보고 URL을 읽고 만든다.
//
//   zone  — Zone.slug. 없거나 모르는 값 → 기본 존(첫 번째 존)으로 폴백
//   focus — Event.id. 딥링크 진입점. 존재하지 않거나 좌표가 없거나 소속 존을
//           찾을 수 없으면 조용히 무시하고 기본/지정 존으로 폴백. 있으면
//           zone보다 우선(특정 행사를 보러 온 진입이므로) — 실제 우선순위
//           적용은 app/map/page.tsx에서 이벤트를 조회한 뒤 처리한다(이
//           파일은 값 파싱/URL 생성만 담당).

export function parseZoneParam(value: string | undefined, zones: Zone[]): Zone | undefined {
  if (!value) return undefined;
  return zones.find((zone) => zone.slug === value);
}

export function buildMapQueryString(params: { zoneSlug?: string; focusId?: string }): string {
  const sp = new URLSearchParams();
  if (params.zoneSlug) sp.set("zone", params.zoneSlug);
  if (params.focusId) sp.set("focus", params.focusId);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
