import localFont from "next/font/local";

// Pretendard Variable을 자체 호스팅한다. 브랜드 디스플레이 서체(GmarketSans 등)는
// 로고 확정 후 별도 PR에서 다루고, 그때까지 디스플레이 타이포는 Pretendard의
// 800/900 웨이트로 대체한다 (app/globals.css의 --font-display 참고).
export const pretendard = localFont({
  src: [
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});
