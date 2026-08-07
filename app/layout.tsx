import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { pretendard } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "놀지도 — 놀 거리는 다, 지도 위에",
  description:
    "팝업·축제·공연·전시·플리마켓을 지도와 캘린더로 통합하고, 무료 공연 초대권으로 만나는 오프라인 놀 거리 플랫폼.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
