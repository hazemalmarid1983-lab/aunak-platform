export const ENROLL_QUERY = 'enroll';

const TRUTHY = new Set(['1', 'true', 'yes']);

function getSearchString(search) {
  if (search !== undefined) return search.startsWith('?') ? search : search ? `?${search}` : '';
  if (typeof window === 'undefined') return '';
  return window.location.search;
}

export function isEnrollmentDeepLink(search) {
  const raw = getSearchString(search);
  const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
  const value = params.get(ENROLL_QUERY);
  if (value == null) return false;
  return TRUTHY.has(String(value).trim().toLowerCase());
}

export function buildEnrollmentUrl(origin) {
  const base = (origin ?? (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
  return `${base}/?${ENROLL_QUERY}=1`;
}

export function setEnrollmentUrl(active) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (active) url.searchParams.set(ENROLL_QUERY, '1');
  else url.searchParams.delete(ENROLL_QUERY);
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, '', next);
}
