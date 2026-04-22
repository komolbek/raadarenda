import ru from './locales/ru';
import en from './locales/en';
import uz from './locales/uz';
import type { AdminTranslationKey } from './locales/ru';

export type AdminLocale = 'ru' | 'uz' | 'en';

const translations: Record<AdminLocale, Record<string, string>> = {
  ru,
  uz,
  en,
};

export function t(
  key: string,
  params?: Record<string, string | number>,
  locale: AdminLocale = 'ru',
): string {
  let value = translations[locale]?.[key] || translations.ru[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return value;
}

export type { AdminTranslationKey };
export { translations };
