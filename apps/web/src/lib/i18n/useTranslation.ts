import { useCallback } from 'react';
import { t as translate } from './index';
import { useLanguageStore } from '@/stores/language-store';

export function useTranslation() {
  const { locale } = useLanguageStore();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return translate(key, params, locale);
    },
    [locale]
  );

  return { t, locale };
}
