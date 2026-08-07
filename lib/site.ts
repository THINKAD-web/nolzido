// 절대 URL 생성용 사이트 베이스. OG 이미지 url, JSON-LD url, 공유 링크가
// 전부 이 함수를 통한다. NEXT_PUBLIC_SITE_URL이 없으면 로컬 개발용으로
// 폴백하고, 프로덕션에서는 반드시 env를 설정해야 한다(.env.example 참고).

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
