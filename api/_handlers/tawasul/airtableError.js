/** Parse Airtable REST error body into a short human-readable string. */
export function formatAirtableApiError(status, rawText) {
  const text = String(rawText ?? '').trim();
  if (!text) return `Airtable ${status}`;
  try {
    const parsed = JSON.parse(text);
    const inner = parsed?.error;
    if (typeof inner === 'string') return `Airtable ${status}: ${inner}`;
    if (inner && typeof inner === 'object') {
      const type = inner.type ? `[${inner.type}] ` : '';
      const msg = inner.message || inner.error || JSON.stringify(inner);
      return `Airtable ${status}: ${type}${msg}`;
    }
    if (parsed?.message) return `Airtable ${status}: ${parsed.message}`;
  } catch {
    /* not JSON */
  }
  return `Airtable ${status}: ${text.slice(0, 280)}`;
}
