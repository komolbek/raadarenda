'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { Search, ChevronDown } from 'lucide-react';
import { DateRangePicker } from '@/components/ui';
import { useRentalPeriodStore, getStoredPeriod } from '@/stores/rental-period-store';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface HeroSearchOption {
  id: string;
  name: string;
}

interface HeroSearchProps {
  categories: HeroSearchOption[];
}

/**
 * The home-page search bar: what to rent, from which category, for which dates.
 *
 * Query and category are real catalog filters. The date range is *not* an
 * availability filter — the products endpoint has no date parameters — it is
 * remembered in the rental-period store so the catalog can show it back and
 * every product page opens on the period the visitor already chose.
 */
export function HeroSearch({ categories }: HeroSearchProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const setPeriod = useRentalPeriodStore((s) => s.setPeriod);

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  // The persisted store is empty during SSR, so restore the previously chosen
  // period after mount rather than in the initial state — reading it while
  // rendering would make the server and client markup disagree.
  useEffect(() => {
    const stored = getStoredPeriod();
    if (stored.from) setRange({ from: stored.from, to: stored.to });
  }, []);

  const handleRangeChange = (next: DateRange | undefined) => {
    setRange(next);
    setPeriod(next?.from, next?.to);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPeriod(range?.from, range?.to);

    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (categoryId) params.set('category', categoryId);

    const search = params.toString();
    router.push(search ? `/catalog?${search}` : '/catalog');
  };

  const divider = <span className="hidden h-8 w-px shrink-0 bg-border lg:block" aria-hidden="true" />;

  return (
    <form
      onSubmit={handleSubmit}
      className="elev-2 flex flex-col gap-1 rounded-2xl border border-border bg-card p-2 lg:flex-row lg:items-center lg:gap-0"
    >
      {/* What to rent */}
      <label className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 lg:min-w-0 lg:flex-1">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="sr-only">{t('home.search_what_label')}</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('home.search_what_placeholder')}
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      {divider}

      {/* Below `sm` these get a row each — side by side they are too narrow for
          "Все категории" and a full date range. They pair up from `sm`, and
          join the single row from `lg`. */}
      <div className="flex flex-col gap-1 sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:gap-0">
        <div className="relative flex items-center lg:w-44">
          <label className="sr-only" htmlFor="hero-category">
            {t('home.search_category_label')}
          </label>
          <select
            id="hero-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full appearance-none truncate rounded-xl bg-transparent px-3 py-2.5 pr-9 text-sm outline-none transition-colors hover:bg-muted/60"
          >
            <option value="">{t('home.search_category_all')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        {divider}

        <DateRangePicker
          variant="bare"
          value={range}
          onChange={handleRangeChange}
          className="lg:w-72"
        />
      </div>

      <button
        type="submit"
        className="mt-1 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600 lg:ml-2 lg:mt-0"
      >
        <Search className="h-4 w-4 lg:hidden" />
        {t('home.search_submit')}
      </button>
    </form>
  );
}
