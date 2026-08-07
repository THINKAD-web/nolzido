import type { Event, EventCategory } from "./types";

// 행사 표기(날짜/D-day/가격)를 위한 단일 소스. 카드·상세·지도·OG 이미지는
// 전부 이 파일의 함수만 통해 문자열을 만든다 — 표기 로직이 여러 곳에 흩어지면
// 나중에 반드시 불일치가 생기기 때문.
//
// 색상/톤은 여기서 Tailwind 클래스로 매핑하지 않는다. 각 함수는 tone 유니온
// 값만 반환하고, 실제 클래스 매핑은 이걸 쓰는 컴포넌트(EventCard 등)가 갖는다.
//
// 날짜 계산은 전부 Asia/Seoul 캘린더 날짜(YYYY-MM-DD) 기준으로 한다. 서버는
// UTC로 뜰 수 있고 방문자는 어느 타임존에 있을지 모르므로, 로컬 타임존에
// 의존하는 Date.getMonth()/getDate() 같은 게터는 이 파일에서 쓰지 않는다.
// 이 함수들은 서버 컴포넌트에서만 호출하고, 클라이언트 컴포넌트에는 이미
// 계산된 값만 props로 내려준다 — 그래야 서버 렌더 시각과 클라이언트 hydration
// 시각이 자정 경계를 넘나들며 달라지는 경우를 빼면 안전하다.

const KST_TIME_ZONE = "Asia/Seoul";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toKstDateKey(date: Date): string {
  // en-CA 로케일은 YYYY-MM-DD를 그대로 뱉어줘서 문자열 비교로 날짜 대소를 알 수 있다.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function kstDateKeyToUtcMs(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function diffDaysKst(fromKey: string, toKey: string): number {
  return Math.round((kstDateKeyToUtcMs(toKey) - kstDateKeyToUtcMs(fromKey)) / MS_PER_DAY);
}

const KST_SHORT_MONTH_DAY = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  month: "numeric",
  day: "numeric",
});

function toKstYmd(date: Date): { y: string; m: string; d: string } {
  const key = toKstDateKey(date);
  const [y, m, d] = key.split("-");
  return { y, m, d };
}

// ---------- 카테고리 표기 ----------

export const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  POPUP: "팝업",
  SHOW: "공연",
  FESTIVAL: "축제",
  EXHIBITION: "전시",
  FLEA: "플리마켓",
  ETC: "기타",
};

export function getEventCategoryLabel(category: EventCategory): string {
  return EVENT_CATEGORY_LABEL[category];
}

// ---------- 날짜 표기 ----------

export interface EventDateRangeDisplay {
  short: string;
  full: string;
  timeNote: string | null;
  isOngoing: boolean;
  isEndingSoon: boolean;
}

export function formatEventDateRange(
  event: Pick<Event, "startDate" | "endDate" | "isAlwaysOpen" | "timeNote">,
  now: Date = new Date(),
): EventDateRangeDisplay {
  const timeNote = event.timeNote ?? null;

  if (event.isAlwaysOpen) {
    return {
      short: "상시",
      full: "상시 운영",
      timeNote,
      isOngoing: true,
      isEndingSoon: false,
    };
  }

  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  const todayKey = toKstDateKey(now);
  const startKey = toKstDateKey(start);
  const endKey = toKstDateKey(end);
  const sameDay = startKey === endKey;

  const state: "upcoming" | "ongoing" | "ended" =
    todayKey > endKey ? "ended" : todayKey < startKey ? "upcoming" : "ongoing";

  const shortStart = KST_SHORT_MONTH_DAY.format(start);
  const shortEnd = KST_SHORT_MONTH_DAY.format(end);

  const fs = toKstYmd(start);
  const fe = toKstYmd(end);
  const full = sameDay
    ? `${fs.y}.${fs.m}.${fs.d}`
    : `${fs.y}.${fs.m}.${fs.d} – ${fe.y === fs.y ? "" : `${fe.y}.`}${fe.m}.${fe.d}`;

  let short: string;
  if (state === "ended") {
    short = "종료";
  } else if (sameDay) {
    short = shortStart;
  } else if (state === "upcoming") {
    short = `${shortStart}~`;
  } else {
    short = `~${shortEnd}`;
  }

  const isOngoing = state === "ongoing";
  const isEndingSoon = isOngoing && diffDaysKst(todayKey, endKey) <= 3;

  return { short, full, timeNote, isOngoing, isEndingSoon };
}

// ---------- D-day ----------

export type EventDdayTone = "urgent" | "normal" | "ongoing" | "ended";

export interface EventDdayDisplay {
  label: string;
  tone: EventDdayTone;
}

export function getEventDday(
  event: Pick<Event, "startDate" | "endDate" | "isAlwaysOpen">,
  now: Date = new Date(),
): EventDdayDisplay | null {
  if (event.isAlwaysOpen) return null;

  const todayKey = toKstDateKey(now);
  const startKey = toKstDateKey(new Date(event.startDate));
  const endKey = toKstDateKey(new Date(event.endDate));

  if (todayKey > endKey) {
    return { label: "종료", tone: "ended" };
  }
  if (todayKey === startKey) {
    return { label: "D-DAY", tone: "urgent" };
  }
  if (todayKey > startKey) {
    return { label: "진행중", tone: "ongoing" };
  }

  const daysUntil = diffDaysKst(todayKey, startKey);
  return {
    label: `D-${daysUntil}`,
    tone: daysUntil <= 3 ? "urgent" : "normal",
  };
}

// ---------- 가격 표기 ----------

export type EventPriceTone = "invite" | "free" | "paid" | "unknown";

export interface EventPriceDisplay {
  label: string;
  labelLong: string;
  tone: EventPriceTone;
}

export function getEventPriceDisplay(
  event: Pick<Event, "hasInvite" | "isFree" | "priceNote">,
): EventPriceDisplay {
  if (event.hasInvite) {
    return { label: "무료초대", labelLong: "놀지도 초대석 무료", tone: "invite" };
  }
  if (event.isFree) {
    return { label: "무료", labelLong: "무료", tone: "free" };
  }
  if (event.priceNote) {
    return { label: event.priceNote, labelLong: event.priceNote, tone: "paid" };
  }
  return { label: "가격 미정", labelLong: "가격 미정", tone: "unknown" };
}
