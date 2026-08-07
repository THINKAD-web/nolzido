"use client";

import { useCallback, useEffect, useState } from "react";

// 무가입 찜: localStorage에 slug 배열을 저장한다. 서버 상태가 없으므로
// 마운트 후에만 실제 값을 읽어(하이드레이션 불일치 방지) hydrated 플래그로
// 초기 렌더를 중립 상태로 둔다.

const STORAGE_KEY = "nolzido:likes";
// 같은 탭 내 여러 컴포넌트가 동기화되도록 커스텀 이벤트를 쓴다(storage
// 이벤트는 다른 탭에만 발생하기 때문).
const LIKES_CHANGED_EVENT = "nolzido:likes-changed";

function readLikes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeLikes(slugs: string[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(LIKES_CHANGED_EVENT));
}

export function useLike(slug: string) {
  const [hydrated, setHydrated] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const sync = () => setLiked(readLikes().includes(slug));
    sync();
    setHydrated(true);
    window.addEventListener(LIKES_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LIKES_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);

  const toggle = useCallback(() => {
    const current = readLikes();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    writeLikes(next);
    setLiked(next.includes(slug));
  }, [slug]);

  return { liked, toggle, hydrated };
}
