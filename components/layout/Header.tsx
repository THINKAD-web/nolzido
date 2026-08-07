import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "둘러보기" },
  { href: "/map", label: "지도" },
  { href: "/free", label: "초대석" },
  { href: "/course", label: "AI 코스" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl font-black text-red">
          놀지도
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-red"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/partners"
          className="rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
        >
          파트너 신청
        </Link>
      </div>
    </header>
  );
}
