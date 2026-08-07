import type { Metadata } from "next";
import { MapView } from "@/components/MapView";
import { getEventById, getEvents, getZones } from "@/lib/queries";
import { parseZoneParam } from "./_lib/map-search-params";

export const metadata: Metadata = {
  title: "지도 — 놀지도",
  description: "존별로 팝업·공연·전시·플리마켓을 지도에서 찾아보세요.",
};

// TODO: 전국 축제(zoneId 없는 이벤트) 전용 뷰는 스펙 2장의 "별도 뷰" 참고,
// 이번 PR(존 지도) 범위 밖이라 /map에서는 제외한다.

function pick(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface MapPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const rawParams = await searchParams;
  const zones = await getZones();

  const zoneParam = parseZoneParam(pick(rawParams.zone), zones);
  const focusId = pick(rawParams.focus);

  let activeZone = zoneParam ?? zones[0];
  let initialFocusId: string | undefined;

  if (focusId) {
    const candidate = await getEventById(focusId);
    // focus는 존재하고, 좌표가 있고, 소속 존을 알 수 있을 때만 유효 — 아니면
    // 조용히 무시하고 기본/지정 존으로 폴백한다. 유효하면 zone보다 우선한다
    // (특정 행사를 보러 온 진입이므로) — 지정된 zone과 달라도 focus 쪽 존으로
    // 전환한다.
    if (candidate && candidate.lat !== null && candidate.lng !== null && candidate.zoneId) {
      const focusZone = zones.find((zone) => zone.id === candidate.zoneId);
      if (focusZone) {
        activeZone = focusZone;
        initialFocusId = candidate.id;
      }
    }
  }

  const events = activeZone ? await getEvents({ zoneId: activeZone.id }) : [];

  if (!activeZone) {
    return <div className="p-8 text-sm text-muted">표시할 존이 없습니다.</div>;
  }

  return (
    <MapView zones={zones} activeZone={activeZone} events={events} initialFocusId={initialFocusId} />
  );
}
