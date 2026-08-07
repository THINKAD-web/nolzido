"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

// Leaflet은 window에 의존하므로 반드시 ssr:false로 로드한다(스펙 4장 PR #5/#6).
const EventMiniMapInner = dynamic(() => import("./EventMiniMapInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-line" />,
});

interface EventMiniMapProps {
  lat: number | null;
  lng: number | null;
  address: string | null;
  venueName: string | null;
  focusId: string;
}

export function EventMiniMap({ lat, lng, address, venueName, focusId }: EventMiniMapProps) {
  // 좌표가 없으면 미니맵 대신 주소 텍스트만 노출한다.
  if (lat === null || lng === null) {
    return (
      <div className="rounded-card border border-line bg-card p-4 text-sm">
        {venueName && <p className="font-semibold text-ink">{venueName}</p>}
        <p className="mt-0.5 text-muted">{address ?? "위치 정보가 없습니다."}</p>
      </div>
    );
  }

  return (
    <Link
      href={`/map?focus=${focusId}`}
      className="block overflow-hidden rounded-card border border-line"
      aria-label="지도에서 보기"
    >
      <div className="h-56 w-full">
        <EventMiniMapInner lat={lat} lng={lng} />
      </div>
      {(venueName || address) && (
        <div className="bg-card p-4 text-sm">
          {venueName && <p className="font-semibold text-ink">{venueName}</p>}
          {address && <p className="mt-0.5 text-muted">{address}</p>}
        </div>
      )}
    </Link>
  );
}
