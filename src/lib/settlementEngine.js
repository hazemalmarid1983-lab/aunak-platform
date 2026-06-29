import {
  createSealedSessionClaim,
  getDailyReconciliation,
  syncLedgerToClaimCount,
  fetchDailyClaimsForDate,
  DAILY_SESSION_FIELDS as DS,
} from './airtable';
import { signSessionSettlement, hashSessionClaim } from './specialistAttestation';
import { verifyAun4611SessionAttestation } from './goalEngine';

export const CLAIM_STATUS = {
  DRAFT: 'Draft',
  SEALED: 'Sealed',
  DISPUTED: 'Disputed',
  REJECTED: 'Rejected',
};

/** Next session sequence number for specialist on a given date. */
export async function nextSessionSequence(sessionDate, specialistEmail, specialistName) {
  const claims = await fetchDailyClaimsForDate(sessionDate, specialistEmail, specialistName);
  const sealed = (claims || []).filter(
    (c) => String(c?.fields?.[DS.claimStatus] ?? '').trim() === CLAIM_STATUS.SEALED
  );
  return sealed.length + 1;
}

/** Verify specialist PIN against Access Control record (last 4 of token or Settlement PIN field). */
export function verifySpecialistPin(accessRecord, pin) {
  const p = String(pin ?? '').trim();
  if (!p || p.length < 4) return false;
  const f = accessRecord?.fields ?? accessRecord ?? {};
  const settlementPin =
    f['Settlement PIN'] ?? f['رمز التسوية'] ?? f['PIN'] ?? f['Specialist PIN'];
  if (settlementPin != null && String(settlementPin).trim() === p) return true;
  const token =
    f['Private Access Token'] ?? f['رمز الوصول الخاص'] ?? f['Access Token'] ?? '';
  const t = String(token).trim();
  if (t.length >= 4 && t.slice(-4) === p) return true;
  return false;
}

/**
 * Seal session: sign, hash, write claim to tblDailySessions, sync ledger.
 */
export async function sealSessionClaim({
  user,
  activeStudent,
  specialistEmail,
  sessionDate,
  sessionFee,
  notes,
  pinVerified,
}) {
  const attestation = verifyAun4611SessionAttestation({ user, activeStudent });
  const specialistName = user?.name ?? '';
  const sequence = await nextSessionSequence(sessionDate, specialistEmail, specialistName);

  const claimDraft = {
    sessionDate,
    studentId: activeStudent.id,
    studentName: activeStudent.name,
    sessionFee: Number(sessionFee) || 0,
    sequence,
    pinVerified,
  };

  const signature = await signSessionSettlement(user, claimDraft);
  const immutableHash = await hashSessionClaim(signature.payload, signature.signature);

  await createSealedSessionClaim({
    specialistEmail,
    specialistName,
    studentId: activeStudent.id,
    studentName: activeStudent.name,
    sessionFee: Number(sessionFee) || 0,
    notes,
    sessionDate,
    sequence,
    signature,
    immutableHash,
    aunAttestation: attestation.verified ? 'AUN-4611' : null,
    aunAttestationAt: attestation.attendanceAt ?? new Date().toISOString(),
    pinVerified,
  });

  await syncLedgerToClaimCount(sessionDate, specialistEmail, specialistName);
  return getDailyReconciliation(sessionDate, specialistEmail, specialistName);
}

/** True when claim record is sealed and must not be mutated. */
export function isClaimSealed(fields) {
  return String(fields?.[DS.claimStatus] ?? '').trim() === CLAIM_STATUS.SEALED;
}

/** Validate sealed row integrity against Immutable Hash field. */
export function verifySealedRow(fields) {
  if (!isClaimSealed(fields)) return { valid: false, reason: 'not_sealed' };
  const hash = fields?.[DS.immutableHash];
  const sig = fields?.[DS.specialistSignature];
  if (!hash || !sig) return { valid: false, reason: 'missing_hash_or_signature' };
  return { valid: true, hash, signature: sig };
}
