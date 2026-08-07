"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { CategoryChip } from "@/components/CategoryChip";
import { WeekStrip, type WeekStripDay } from "@/components/WeekStrip";
import type { EventCategory } from "@/lib/types";
import { buildExploreQueryString } from "../_lib/explore-search-params";

const ALL_CATEGORIES: EventCategory[] = ["POPUP", "SHOW", "FESTIVAL", "EXHIBITION", "FLEA", "ETC"];

interface ExploreFiltersProps {
  weekDays: WeekStripDay[];
  activeCategory?: EventCategory;
  activeDate?: string;
  children: React.ReactNode;
}

// 카테고리 칩 + 주간 스트립을 URL 쿼리(cat/date)와 동기화하는 유일한 클라이언트
// 경계. 필터가 바뀌면 page는 항상 버린다(=1로 리셋). 전환 중에는 useTransition의
// isPending으로 children(서버에서 렌더된 그리드+페이지네이션)에 dimming을 건다.
export function ExploreFilters({ weekDays, activeCategory, activeDate, children }: ExploreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigate(next: { category?: EventCategory; dateKey?: string }) {
    const qs = buildExploreQueryString({
      category: "category" in next ? next.category : activeCategory,
      dateKey: "dateKey" in next ? next.dateKey : activeDate,
    });
    startTransition(() => {
      router.replace(`${pathname}${qs}`, { scroll: false });
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate({ category: undefined })}
          className={`rounded-pill px-2.5 py-1 text-xs font-medium ${
            !activeCategory ? "bg-ink text-paper" : "bg-ink/5 text-ink"
          }`}
        >
          전체
        </button>
        {ALL_CATEGORIES.map((category) => (
          <CategoryChip
            key={category}
            category={category}
            active={activeCategory === category}
            onClick={() => navigate({ category: activeCategory === category ? undefined : category })}
          />
        ))}
      </div>

      <div className="mt-4">
        <WeekStrip
          days={weekDays}
          selectedDate={activeDate}
          onSelectDate={(date) => navigate({ dateKey: activeDate === date ? undefined : date })}
        />
      </div>

      <div
        aria-busy={isPending}
        className={isPending ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}
      >
        {children}
      </div>
    </div>
  );
}
