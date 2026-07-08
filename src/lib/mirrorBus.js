/**
 * Ghost Mirror — Ably Realtime client bus (primary) + Airtable poll fallback.
 */

let ablyModulePromise = null;

export function mirrorChannelName(studentId) {
  return `mirror:${String(studentId ?? '').trim()}`;
}

function loadAbly() {
  if (!ablyModulePromise) {
    ablyModulePromise = import('ably').catch(() => null);
  }
  return ablyModulePromise;
}

async function fetchAblyTokenRequest(studentId, mode = 'subscribe') {
  const res = await fetch('/api/mirror/ably-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ studentId, mode }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `ABLY_AUTH_${res.status}`);
  return data;
}

/**
 * Subscribe to live mirror commands for a student record.
 * @returns {Promise<{ stop: Function, connected: boolean }>}
 */
export async function subscribeMirrorChannel(studentId, onMirrorMessage) {
  if (!studentId || typeof onMirrorMessage !== 'function') {
    return { stop: () => {}, connected: false };
  }

  const AblyMod = await loadAbly();
  const Realtime = AblyMod?.Realtime ?? AblyMod?.default?.Realtime;
  if (!Realtime) {
    return { stop: () => {}, connected: false };
  }

  let client = null;
  let channel = null;
  let stopped = false;

  try {
    const auth = await fetchAblyTokenRequest(studentId, 'subscribe');
    const tokenRequest = auth.tokenRequest ?? auth.token;
    if (!tokenRequest) return { stop: () => {}, connected: false };

    client = new Realtime({
      authCallback: (_params, callback) => callback(null, tokenRequest),
      echoMessages: false,
    });

    channel = client.channels.get(auth.channel || mirrorChannelName(studentId));

    channel.subscribe('mirror', (msg) => {
      if (stopped) return;
      const data = msg?.data ?? {};
      onMirrorMessage({
        command: data.command,
        payload: data.payload,
        goalEcho: data.goalEcho,
        ts: data.ts ?? Date.now(),
        source: 'ably',
      });
    });

    await new Promise((resolve, reject) => {
      client.connection.once('connected', resolve);
      client.connection.once('failed', reject);
      setTimeout(() => reject(new Error('ABLY_CONNECT_TIMEOUT')), 8000);
    });

    return {
      connected: true,
      stop: () => {
        stopped = true;
        try {
          channel?.unsubscribe?.();
        } catch {
          /* ignore */
        }
        try {
          client?.close?.();
        } catch {
          /* ignore */
        }
      },
    };
  } catch (err) {
    if (import.meta.env?.DEV) console.warn('[mirrorBus] subscribe failed:', err?.message);
    try {
      client?.close?.();
    } catch {
      /* ignore */
    }
    return { stop: () => {}, connected: false };
  }
}
