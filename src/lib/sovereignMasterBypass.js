/**
 * Sovereign dev master bypass — skips anti-spoof duplicate face block (94.7%).
 * For authorized team testing only (parent UI, enrollment QA).
 *
 * Activate via:
 *   - URL: ?master=AUNAK-MASTER-2026
 *   - sessionStorage after validateMasterKey()
 *   - Local DEV: shouldAutoApproveBiometric() skips camera entirely
 * Optional override: VITE_AUNAK_MASTER_KEY in .env.local
 */

export const SOVEREIGN_MASTER_KEY_DEFAULT = 'AUNAK-MASTER-2026';
const BYPASS_STORAGE = 'aunak.sovereignMasterBypass.v1';

/** Production builds never honor master bypass (P0 hardening). */
export function isMasterBypassAllowedInEnvironment() {
  return !import.meta.env.PROD;
}

/**
 * Local QA: auto-approve biometric without camera / timeout.
 * Always on in Vite DEV; never in production builds.
 */
export function shouldAutoApproveBiometric() {
  return isMasterBypassAllowedInEnvironment() && Boolean(import.meta.env.DEV);
}

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
  if (!isMasterBypassAllowedInEnvironment()) return false;
  if (!validateMasterKey(key)) return false;
  try {
    sessionStorage.setItem(BYPASS_STORAGE, expectedMasterKey());
  } catch {
    /* ignore */
  }
  return true;
}

export function clearMasterBypass() {
  try {
    sessionStorage.removeItem(BYPASS_STORAGE);
  } catch {
    /* ignore */
  }
}

export function isMasterBypassActive() {
  if (!isMasterBypassAllowedInEnvironment()) return false;
  if (shouldAutoApproveBiometric()) return true;
  try {
    const stored = sessionStorage.getItem(BYPASS_STORAGE);
    if (stored && stored === expectedMasterKey()) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Call once on app boot — reads ?master= from URL and activates if valid. */
export function bootstrapMasterBypassFromUrl() {
  if (!isMasterBypassAllowedInEnvironment()) return false;
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
