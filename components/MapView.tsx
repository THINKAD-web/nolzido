"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildMapQueryString } from "@/app/map/_lib/map-search-params";
import type { Event, Zone } from "@/lib/types";
import { EventCard } from "./EventCard";
import type { MapMarkerData } from "./MapViewInner";
import { Skeleton } from "./Skeleton";

// 지도 컴포넌트 전체(react-leaflet)는 window에 의존하므로 ssr:false로 로드한다.
// 클러스터링(react-leaflet-cluster 등)은 이번 PR에서 붙이지 않는다 — 존당
// 마커가 5~20개 수준이라 지금 단계에서 필수가 아니고, leaflet.markercluster는
// React 19 Strict Mode 이중 마운트에서 마커 중복/클러스터 미갱신 사례가 보고된
// 오래된 플러그인이라 붙잡고 있지 않기로 했다(PR 설명 참고). 마커 렌더 코드가
// MapViewInner에 격리돼 있어 데이터가 늘어나면 그 안에서만 재도입하면 된다.
const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface MapViewProps {
  zones: Zone[];
  activeZone: Zone;
  events: Event[]; // 활성 존의 PUBLISHED 이벤트(좌표 없는 것도 포함 — 리스트용)
  initialFocusId?: string;
}

export function MapView({ zones, activeZone, events, initialFocusId }: MapViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [highlightedId, setHighlightedId] = useState<string | null>(initialFocusId ?? null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // 브라우저 뒤로가기 등으로 서버가 다른 초기 focus를 내려주면 다시 동기화한다.
  useEffect(() => {
    setHighlightedId(initialFocusId ?? null);
  }, [initialFocusId]);

  const markers: MapMarkerData[] = useMemo(
    () =>
      events
        .filter((event): event is Event & { lat: number; lng: number } => event.lat !== null && event.lng !== null)
        .map((event) => ({
          id: event.id,
          title: event.title,
          category: event.category,
          hasInvite: event.hasInvite,
          lat: event.lat,
          lng: event.lng,
        })),
    [events],
  );

  const zoneCenter = { lat: activeZone.centerLat, lng: activeZone.centerLng, zoom: activeZone.zoomLevel };
  const initialHighlighted = markers.find((marker) => marker.id === initialFocusId);
  const initialCenter = initialHighlighted
    ? { lat: initialHighlighted.lat, lng: initialHighlighted.lng, zoom: 16 }
    : zoneCenter;

  function handleSelectZone(slug: string) {
    setHighlightedId(null);
    router.replace(`${pathname}${buildMapQueryString({ zoneSlug: slug })}`, { scroll: false });
  }

  function handleSelectEvent(id: string) {
    setHighlightedId(id);
    setSheetExpanded(false); // 모바일에서 항목을 고르면 지도가 보이도록 시트를 접는다
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-line bg-card px-4 py-3">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => handleSelectZone(zone.slug)}
            className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-sm font-medium ${
              zone.id === activeZone.id ? "bg-ink text-paper" : "bg-ink/5 text-ink"
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <MapViewInner
            initialCenter={initialCenter}
            markers={markers}
            highlightedId={highlightedId}
            zoneCenter={zoneCenter}
            onMarkerClick={handleSelectEvent}
          />
        </div>

        {/* 모바일: 하단 바텀시트(탭으로 펼치기/접기). 데스크톱(sm 이상): 우측 고정 사이드바. */}
        <div
          className={`fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-line bg-paper shadow-lg transition-[height] duration-300 sm:static sm:h-full sm:w-96 sm:rounded-none sm:border-l sm:border-t-0 sm:shadow-none ${
            sheetExpanded ? "h-[70vh]" : "h-40"
          }`}
        >
          <button
            type="button"
            onClick={() => setSheetExpanded((v) => !v)}
            className="shrink-0 py-2 sm:hidden"
          >
            <span className="mx-auto block h-1.5 w-10 rounded-full bg-line" />
            <span className="mt-1 block text-center text-xs text-muted">
              {events.length}건 · {sheetExpanded ? "접기" : "펼치기"}
            </span>
          </button>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {events.length === 0 && (
              <p className="text-sm text-muted">이 존에는 아직 공개된 행사가 없습니다.</p>
            )}
            {events.map((event) => {
              const hasCoords = event.lat !== null && event.lng !== null;
              const isHighlighted = event.id === highlightedId;
              return (
                <div key={event.id} className={isHighlighted ? "rounded-card ring-2 ring-cobalt" : ""}>
                  <EventCard event={event} onClick={hasCoords ? () => handleSelectEvent(event.id) : undefined} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
