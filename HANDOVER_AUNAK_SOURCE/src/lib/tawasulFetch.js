/**
 * Safe JSON fetch for Tawasul hub — never surfaces raw Vercel HTML as silent failure.
 */
export async function tawasulFetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    const snippet = raw.includes('server error')
      ? 'A server error has occurred (Vercel function crash — check deployment logs)'
      : raw.slice(0, 240);
    throw new Error(snippet || `HTTP_${res.status}`);
  }
  return { res, data };
}

export function readTawasulApiError(data, status) {
  const err = data?.error ?? data?.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    return err.message || err.error || err.hint || JSON.stringify(err);
  }
  return `REQUEST_${status}`;
}
