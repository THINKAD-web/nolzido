import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import {
  formatEventDateRange,
  getEventCategoryLabel,
  getEventPriceDisplay,
} from "@/lib/event-display";
import { getEventBySlug } from "@/lib/queries";

// 파일시스템에서 폰트 woff를 읽으므로 Edge 런타임 불가.
export const runtime = "nodejs";
export const revalidate = 3600;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 디자인 토큰(스펙 5장)
const PAPER = "#F7F6F1";
const INK = "#1A1A1F";
const RED = "#E8442E";
const COBALT = "#2438E8";
const MUTED = "#8A887E";
const LINE = "#DEDCD3";

async function loadFont(file: string): Promise<ArrayBuffer> {
  const fontPath = path.join(
    process.cwd(),
    "node_modules/pretendard/dist/web/static/woff",
    file,
  );
  const buf = await readFile(fontPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  // 페이지와 동일하게 없는 slug는 404(범용 플레이스홀더로 대체하지 않음).
  if (!event) {
    notFound();
  }

  const [regular, bold] = await Promise.all([
    loadFont("Pretendard-Regular.woff"),
    loadFont("Pretendard-Bold.woff"),
  ]);

  // 표기는 전부 event-display.ts를 통한다(OG 안에서 따로 조립하지 않음).
  const dateDisplay = formatEventDateRange(event);
  const priceDisplay = getEventPriceDisplay(event);
  const categoryLabel = getEventCategoryLabel(event.category);

  // Satori는 변수 폰트 굵기 인스턴싱을 지원하지 않으므로, 위계는 굵기보다
  // 크기+색(ink/red)으로 잡는다.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: RED }}>놀지도</div>
          <div style={{ fontSize: 26, color: MUTED }}>{categoryLabel}</div>
          {event.isSponsored && (
            <div
              style={{
                fontSize: 22,
                color: MUTED,
                border: `2px solid ${LINE}`,
                borderRadius: 999,
                padding: "2px 16px",
              }}
            >
              광고
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: INK,
              lineHeight: 1.15,
              // 2줄까지만
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.title}
          </div>
          <div style={{ marginTop: 24, fontSize: 34, color: MUTED }}>
            {event.venueName ? `${dateDisplay.full}  ·  ${event.venueName}` : dateDisplay.full}
          </div>
        </div>

        <div style={{ display: "flex" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: priceDisplay.tone === "invite" ? COBALT : INK,
            }}
          >
            {priceDisplay.labelLong}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
