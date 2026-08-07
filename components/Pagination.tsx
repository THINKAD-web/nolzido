import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-4" aria-label="페이지네이션">
      <PaginationLink href={buildHref(page - 1)} disabled={page <= 1}>
        이전
      </PaginationLink>
      <span className="text-sm text-muted">
        {page} / {totalPages}
      </span>
      <PaginationLink href={buildHref(page + 1)} disabled={page >= totalPages}>
        다음
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="rounded-pill px-3 py-1.5 text-sm text-muted/50">{children}</span>;
  }
  return (
    <Link
      href={href}
      scroll={false}
      className="rounded-pill px-3 py-1.5 text-sm text-ink hover:bg-ink/5"
    >
      {children}
    </Link>
  );
}
