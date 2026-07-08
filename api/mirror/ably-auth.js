/**
 * POST /api/mirror/ably-auth — Token request for Ghost Mirror Realtime subscribe.
 * Body: { studentId, mode: 'subscribe' | 'publish' }
 */

import { mirrorChannelName, ablyApiKey } from '../_handlers/mirror/ablyPublish.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = ablyApiKey();
  if (!key) {
    res.status(503).json({ error: 'ABLY_NOT_CONFIGURED' });
    return;
  }

  const studentId = String(req.body?.studentId ?? '').trim();
  const mode = String(req.body?.mode ?? 'subscribe').trim().toLowerCase();
  if (!studentId || !/^rec[a-zA-Z0-9]{10,}$/.test(studentId)) {
    res.status(400).json({ error: 'VALID_STUDENT_ID_REQUIRED' });
    return;
  }

  const channel = mirrorChannelName(studentId);
  const capability =
    mode === 'publish'
      ? { [channel]: ['publish', 'subscribe'] }
      : { [channel]: ['subscribe'] };

  const tokenReqBody = {
    keyName: key.split(':')[0],
    ttl: 60 * 60 * 1000,
    capability: JSON.stringify(capability),
    clientId: mode === 'publish' ? `specialist-${studentId}` : `child-${studentId}`,
  };

  try {
    const auth = Buffer.from(key).toString('base64');
    const tokenUrl = 'https://rest.ably.io/keys/' + encodeURIComponent(key.split(':')[0]) + '/requestToken';
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        capability: capability,
        clientId: tokenReqBody.clientId,
        ttl: tokenReqBody.ttl,
      }),
    });
    const text = await tokenRes.text();
    if (!tokenRes.ok) {
      res.status(502).json({ error: 'ABLY_TOKEN_FAILED', detail: text.slice(0, 200) });
      return;
    }
    const token = JSON.parse(text);
    res.status(200).json({ ok: true, tokenRequest: token, channel });
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'ABLY_TOKEN_ERROR' });
  }
}
