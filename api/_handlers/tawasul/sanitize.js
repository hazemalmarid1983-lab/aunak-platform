/**
 * Tawasul API input sanitization — strings only, no objects/timestamps-as-objects.
 */

const MIRROR_COMMANDS = new Set(['echo_goal', 'drop_star', 'drop_reward', 'calm_pulse', 'clear']);

export function sanitizeRecordId(value) {
  const id = String(value ?? '').trim();
  return /^rec[a-zA-Z0-9]{10,}$/.test(id) ? id : '';
}

export function sanitizeMirrorCommand(value) {
  const cmd = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return MIRROR_COMMANDS.has(cmd) ? cmd : '';
}

export function sanitizeMirrorPayload(value, fallback = '') {
  if (value == null) return String(fallback);
  if (typeof value === 'object') return String(fallback);
  const text = String(value).trim();
  if (!text || text === '[object Object]') return String(fallback);
  return text.slice(0, 500);
}

/** Goal / programmed_goal — preserve Arabic Unicode. */
export function sanitizeGoalText(value) {
  if (value == null) return '';
  if (typeof value === 'object') return '';
  const text = String(value).trim();
  if (!text || text === '[object Object]') return '';
  return text.slice(0, 5000);
}

export function sanitizeAsciiToken(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}
