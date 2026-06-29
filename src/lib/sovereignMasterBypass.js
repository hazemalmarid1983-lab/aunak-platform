/**
 * Sovereign dev master bypass — skips anti-spoof duplicate face block (94.7%).
 * For authorized team testing only (parent UI, enrollment QA).
 *
 * Activate via:
 *   - URL: ?master=AUNAK-MASTER-2026
 *   - sessionStorage after validateMasterKey()
 * Optional override: VITE_AUNAK_MASTER_KEY in .env.local
 */

export const SOVEREIGN_MASTER_KEY_DEFAULT = 'AUNAK-MASTER-2026';
const BYPASS_LS = 'aunak.sovereignMasterBypass.v1';

function expectedMasterKey() {
  const fromEnv = import.meta.env.VITE_AUNAK_MASTER_KEY;
  const key = fromEnv != null && String(fromEnv).trim() !== '' ? fromEnv : SOVEREIGN_MASTER_KEY_DEFAULT;
  return normalizeMasterKey(key);
}

export function normalizeMasterKey(raw) {
  return String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

export function validateMasterKey(key) {
  return normalizeMasterKey(key) === expectedMasterKey();
}

export function activateMasterBypass(key) {
  if (!validateMasterKey(key)) return false;
  try {
    sessionStorage.setItem(BYPASS_LS, expectedMasterKey());
  } catch {
    /* ignore */
  }
  return true;
}

export function clearMasterBypass() {
  try {
    sessionStorage.removeItem(BYPASS_LS);
  } catch {
    /* ignore */
  }
}

export function isMasterBypassActive() {
  try {
    const stored = sessionStorage.getItem(BYPASS_LS);
    if (stored && stored === expectedMasterKey()) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Call once on app boot — reads ?master= from URL and activates if valid. */
export function bootstrapMasterBypassFromUrl() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('master') ?? params.get('sovereign_master');
  if (!raw) return false;
  const ok = activateMasterBypass(raw);
  if (ok) {
    params.delete('master');
    params.delete('sovereign_master');
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', next);
  }
  return ok;
}

export function masterBypassLabel() {
  return expectedMasterKey();
}
