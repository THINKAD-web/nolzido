"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet 기본 마커 아이콘은 번들러 환경에서 이미지 경로가 깨진다. 마커를
// 간단한 divIcon(코발트 핀)으로 대체해 외부 이미지 의존을 없앤다.
const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#2438E8;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface EventMiniMapInnerProps {
  lat: number;
  lng: number;
}

export default function EventMiniMapInner({ lat, lng }: EventMiniMapInnerProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      {/* CARTO Positron 무료 타일(스펙 6장 가드레일). */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
