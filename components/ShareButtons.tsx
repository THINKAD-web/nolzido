"use client";

import Script from "next/script";
import { useState } from "react";

// 최소한의 Kakao SDK 타입. 전역 window.Kakao는 SDK 스크립트가 로드된 뒤에만
// 존재한다.
interface KakaoLinkContent {
  title: string;
  description?: string;
  imageUrl?: string;
  link: { mobileWebUrl: string; webUrl: string };
}

interface KakaoSdk {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share?: {
    sendDefault: (settings: {
      objectType: "feed";
      content: KakaoLinkContent;
    }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
// SRI integrity는 Kakao가 공식 문서에 게시하는 해시로 채워야 한다. 검증되지
// 않은 값을 넣으면 SDK 로드가 조용히 실패하므로, 여기서 임의 값을 만들지 않고
// 실제 배포 시 확인된 해시를 추가한다.

export function ShareButtons({ url, title, description, imageUrl }: ShareButtonsProps) {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API가 막힌 환경(비-https 등) 폴백
      window.prompt("아래 링크를 복사하세요", url);
    }
  }

  function handleKakaoShare() {
    const kakao = window.Kakao;
    if (!kakao?.Share) return;
    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl,
        link: { mobileWebUrl: url, webUrl: url },
      },
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* 카카오 키가 있을 때만 SDK를 로드하고 초기화한다. */}
      {kakaoKey && (
        <Script
          src={KAKAO_SDK_SRC}
          crossOrigin="anonymous"
          onLoad={() => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
              window.Kakao.init(kakaoKey);
            }
            setKakaoReady(true);
          }}
        />
      )}

      {kakaoKey && (
        <button
          type="button"
          onClick={handleKakaoShare}
          disabled={!kakaoReady}
          className="rounded-pill border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/40 disabled:opacity-50"
        >
          카카오 공유
        </button>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="rounded-pill border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/40"
      >
        {copied ? "복사됨" : "링크 복사"}
      </button>
    </div>
  );
}
