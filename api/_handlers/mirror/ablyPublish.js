/**
 * Ghost Mirror — Ably Realtime publish (server-side only).
 * Channel: mirror:{studentRecordId}
 */

function mirrorChannelName(studentId) {
  return `mirror:${String(studentId ?? '').trim()}`;
}

function ablyApiKey() {
  return (
    process.env.ABLY_API_KEY ||
    process.env.VITE_ABLY_API_KEY ||
    ''
  ).trim();
}

/** Publish mirror command to child subscribers via Ably REST. */
export async function publishMirrorEvent(studentId, payload) {
  const key = ablyApiKey();
  if (!key || !studentId) return { ok: false, skipped: true, reason: 'ABLY_OR_STUDENT_MISSING' };

  const channel = encodeURIComponent(mirrorChannelName(studentId));
  const url = `https://rest.ably.io/channels/${channel}/messages`;
  const auth = Buffer.from(key).toString('base64');

  const body = {
    name: 'mirror',
    data: {
      ...payload,
      ts: Date.now(),
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ABLY_PUBLISH_${res.status}:${text.slice(0, 120)}`);
  }
  return { ok: true, channel: mirrorChannelName(studentId) };
}

export { mirrorChannelName, ablyApiKey };
