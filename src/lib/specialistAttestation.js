function bufToBase64(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function hmacKey(user) {
  const seed = String(user?.email ?? '') + '|' + String(user?.dynamicSessionId ?? 'aunak-settle');
  const data = new TextEncoder().encode(seed.padEnd(32, '0').slice(0, 32));
  return crypto.subtle.importKey('raw', data, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

/** Build canonical payload for session settlement seal. */
export function buildSessionSealPayload(user, claim) {
  return {
    specialistEmail: String(user?.email ?? '').trim().toLowerCase(),
    specialistName: user?.name ?? '',
    sessionDate: claim.sessionDate,
    studentId: claim.studentId,
    studentName: claim.studentName,
    sessionFee: claim.sessionFee,
    sequence: claim.sequence,
    dynamicSessionId: user?.dynamicSessionId ?? null,
    sealedAt: new Date().toISOString(),
  };
}

/** HMAC-SHA256 signature for settlement attestation. */
export async function signSessionSettlement(user, claim) {
  const payload = buildSessionSealPayload(user, claim);
  const body = JSON.stringify(payload);
  const key = await hmacKey(user);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return {
    payload,
    signature: bufToBase64(sig),
    method: 'HMAC-SHA256',
    pinVerified: Boolean(claim.pinVerified),
  };
}

/** SHA-256 hex hash of sealed claim for immutability check. */
export async function hashSessionClaim(sealedPayload, signature) {
  const body = JSON.stringify({ sealedPayload, signature });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
