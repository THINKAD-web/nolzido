import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted">
        <p className="font-display text-base font-black text-ink">놀지도</p>
        <p className="mt-1">놀 거리는 다, 지도 위에</p>

        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-ink">
            놀지도는 이렇게 굴러갑니다
          </Link>
          <Link href="/partners" className="hover:text-ink">
            파트너 소개
          </Link>
          <Link href="/reservation" className="hover:text-ink">
            예약 확인·취소
          </Link>
        </nav>

        <p className="mt-6">© {new Date().getFullYear()} 놀지도 by THINKAD. All rights reserved.</p>
      </div>
    </footer>
  );
}
