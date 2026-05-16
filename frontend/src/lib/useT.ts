import { useLangStore } from '../store/langStore';
import { translations, type TranslationKey } from './i18n';

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key: TranslationKey): string => translations[lang][key];
}
