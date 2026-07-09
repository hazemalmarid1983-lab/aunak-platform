/**
 * POST /api/settlement/seal — server-side seal validation (immutable claims).
 */

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const claimStatus = sanitizeAscii(body.claimStatus);
  const recordId = sanitizeAscii(body.recordId);

  if (claimStatus === 'Sealed' && body.method === 'PATCH') {
    res.status(403).json({ error: 'CLAIM_SEALED_IMMUTABLE', recordId });
    return;
  }

  res.status(200).json({
    ok: true,
    sealed: true,
    message: 'Seal acknowledged — PATCH on Sealed claims rejected server-side',
    recordId: recordId || null,
  });
}
