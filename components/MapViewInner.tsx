"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { EventCategory } from "@/lib/types";

// 카테고리별 마커 색(스펙 5장 토큰 밖 영역이라 이 컴포넌트에 로컬로 둔다).
// 무료초대(hasInvite)는 카테고리와 무관하게 항상 코발트로 덮어써 구분한다.
const CATEGORY_MARKER_COLOR: Record<EventCategory, string> = {
  POPUP: "#E8442E",
  SHOW: "#7C3AED",
  FESTIVAL: "#F59E0B",
  EXHIBITION: "#0D9488",
  FLEA: "#B45309",
  ETC: "#8A887E",
};
const INVITE_MARKER_COLOR = "#2438E8";

function markerIcon(color: string, active: boolean) {
  const size = active ? 26 : 18;
  const border = active ? 4 : 3;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${border}px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export interface MapMarkerData {
  id: string;
  title: string;
  category: EventCategory;
  hasInvite: boolean;
  lat: number;
  lng: number;
}

interface FlyTarget {
  lat: number;
  lng: number;
  zoom: number;
}

function FlyToController({ target }: { target: FlyTarget }) {
  const map = useMap();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      // 초기 뷰는 MapContainer의 center/zoom이 이미 target과 일치하도록
      // 설정돼 있으므로, 첫 렌더에서 또 flyTo 애니메이션을 태우지 않는다.
      isFirstRun.current = false;
      return;
    }
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 0.6 });
    // target 객체 참조가 아니라 값 변화에만 반응한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.lat, target.lng, target.zoom]);

  return null;
}

interface MapViewInnerProps {
  initialCenter: FlyTarget;
  markers: MapMarkerData[];
  highlightedId: string | null;
  zoneCenter: FlyTarget;
  onMarkerClick: (id: string) => void;
}

export default function MapViewInner({
  initialCenter,
  markers,
  highlightedId,
  zoneCenter,
  onMarkerClick,
}: MapViewInnerProps) {
  const highlighted = markers.find((marker) => marker.id === highlightedId);
  const flyTarget: FlyTarget = highlighted
    ? { lat: highlighted.lat, lng: highlighted.lng, zoom: 16 }
    : zoneCenter;

  return (
    <MapContainer
      center={[initialCenter.lat, initialCenter.lng]}
      zoom={initialCenter.zoom}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      {/* CARTO Positron 무료 타일(스펙 6장 가드레일). */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <FlyToController target={flyTarget} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={markerIcon(
            marker.hasInvite ? INVITE_MARKER_COLOR : CATEGORY_MARKER_COLOR[marker.category],
            marker.id === highlightedId,
          )}
          eventHandlers={{ click: () => onMarkerClick(marker.id) }}
        />
      ))}
    </MapContainer>
  );
}
