/**
 * App locale — Arabic-first for Oman MoSD / special education centers.
 * English remains available via UI toggle; default and document lang are Arabic.
 */

export const DEFAULT_LANG = 'ar';
export const LANG_STORAGE_KEY = 'aunak_lang';

export function getStoredLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    if (v === 'ar' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

export function setStoredLang(lang) {
  const next = lang === 'en' ? 'en' : 'ar';
  try {
    localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  applyDocumentLang(next);
  return next;
}

export function applyDocumentLang(lang = DEFAULT_LANG) {
  if (typeof document === 'undefined') return;
  const isAr = lang !== 'en';
  document.documentElement.lang = isAr ? 'ar' : 'en';
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
}

/** Prefer Arabic label; fall back to English only when lang === 'en'. */
export function pickCopy(lang, ar, en) {
  return lang === 'en' ? en : ar;
}
