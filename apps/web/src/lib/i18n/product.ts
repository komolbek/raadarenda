import type { Locale } from './index';

interface Localizable {
  name: string;
  nameUz?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionUz?: string | null;
  descriptionEn?: string | null;
}

/**
 * Pick a product's name in the active locale, falling back to the default
 * (Russian) value when a translation is empty. Also works for categories.
 */
export function localizedName(item: Localizable | undefined | null, locale: Locale): string {
  if (!item) return '';
  if (locale === 'uz') return item.nameUz?.trim() || item.name;
  if (locale === 'en') return item.nameEn?.trim() || item.name;
  return item.name;
}

export function localizedDescription(
  item: Localizable | undefined | null,
  locale: Locale,
): string | null {
  if (!item) return null;
  if (locale === 'uz') return item.descriptionUz?.trim() || item.description || null;
  if (locale === 'en') return item.descriptionEn?.trim() || item.description || null;
  return item.description ?? null;
}
