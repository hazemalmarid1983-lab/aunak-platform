/**
 * Optional cloud TTS proxy for Summer Academy.
 * Set ELEVENLABS_API_KEY on Vercel for premium voice; otherwise returns 503 and client falls back to Web Speech.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.AIRTABLE_TTS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Cloud TTS not configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }

  const text = String(body?.text ?? '').trim();
  const lang = body?.lang === 'en' ? 'en' : 'ar';
  if (!text || text.length > 500) {
    res.status(400).json({ error: 'Text required (max 500 chars)' });
    return;
  }

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID ||
    (lang === 'en' ? 'EXAVITQu4vr4xnSDxMaL' : 'pNInz6obpgDQGcFmaJgB');

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: errText || 'TTS failed' });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'TTS proxy error' });
  }
}
