import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * The rental period the visitor picked on the home page, carried across the
 * session. It is deliberately *not* a catalog filter — the API has no
 * availability-aware product search yet (only `/products/:id/availability`).
 * What it does do is remember the dates once, so the catalog can show them and
 * every product page opens pre-filled with the period the visitor already
 * chose instead of defaulting to "tomorrow, one day".
 *
 * Dates are stored as ISO strings so they survive localStorage rehydration.
 */
interface RentalPeriodState {
  from: string | null;
  to: string | null;
  setPeriod: (from: Date | null | undefined, to: Date | null | undefined) => void;
  clearPeriod: () => void;
}

export const useRentalPeriodStore = create<RentalPeriodState>()(
  persist(
    (set) => ({
      from: null,
      to: null,
      setPeriod: (from, to) =>
        set({
          from: from ? from.toISOString() : null,
          to: to ? to.toISOString() : null,
        }),
      clearPeriod: () => set({ from: null, to: null }),
    }),
    { name: 'rental-period-storage' },
  ),
);

/** Read the stored period back as Dates, dropping anything unparseable. */
export function getStoredPeriod(): { from?: Date; to?: Date } {
  const { from, to } = useRentalPeriodStore.getState();
  const parse = (value: string | null) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };
  return { from: parse(from), to: parse(to) };
}
