// Asia/Seoul 캘린더 날짜 계산을 위한 공용 저수준 유틸. lib/event-display.ts와
// lib/queries.ts가 둘 다 이 모듈을 통해서만 "오늘/이 날짜가 KST로 며칠인가"를
// 계산한다 — 같은 로직을 두 곳에서 따로 구현하면 그 자체가 SSOT 위반이 된다.
//
// 로컬 타임존에 의존하는 Date.getMonth()/getDate() 같은 게터는 쓰지 않는다.
// 서버가 UTC로 떠도, 방문자가 어느 타임존에 있어도 항상 같은 결과가 나오게
// 하기 위함이다.

export const KST_TIME_ZONE = "Asia/Seoul";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 주어진 Date가 KST로 며칠인지 "YYYY-MM-DD" 형태로 반환한다. */
export function toKstDateKey(date: Date): string {
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

/** to - from 의 날짜 차이(일). 둘 다 "YYYY-MM-DD" 형태여야 한다. */
export function diffDaysKst(fromKey: string, toKey: string): number {
  return Math.round((kstDateKeyToUtcMs(toKey) - kstDateKeyToUtcMs(fromKey)) / MS_PER_DAY);
}

/** key로부터 days일 뒤(음수면 이전)의 날짜 키를 반환한다. */
export function addDaysToDateKey(key: string, days: number): string {
  const ms = kstDateKeyToUtcMs(key) + days * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
}
