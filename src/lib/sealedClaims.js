/**
 * Sealed-claim formula builders — pure helpers for Daily Sessions queries.
 * Used by airtable.js fetchSealedClaimsForStudent and Vitest coverage.
 */

import { DAILY_SESSION as DS } from './airtableFields.js';

export const CLAIM_STATUS_SEALED = 'Sealed';

/** Escape single quotes for Airtable filterByFormula string literals. */
export function escapeFormulaString(value) {
  return String(value ?? '').replace(/'/g, "\\'");
}

/** AND filter: student name + Sealed status + date range (inclusive). */
export function buildSealedClaimsByStudentFormula(studentName, startDate, endDate) {
  const name = escapeFormulaString(studentName);
  const start = String(startDate ?? '').slice(0, 10);
  const end = String(endDate ?? '').slice(0, 10);
  return (
    `AND({${DS.studentName}}='${name}', {${DS.claimStatus}}='${CLAIM_STATUS_SEALED}', ` +
    `{${DS.sessionDate}}>='${start}', {${DS.sessionDate}}<='${end}')`
  );
}

/** Single-day sealed claims for one student. */
export function buildSealedClaimsForDayFormula(studentName, day) {
  const name = escapeFormulaString(studentName);
  const isoDay = String(day ?? '').slice(0, 10);
  return (
    `AND({${DS.studentName}}='${name}', {${DS.claimStatus}}='${CLAIM_STATUS_SEALED}', ` +
    `{${DS.sessionDate}}='${isoDay}')`
  );
}

/** True when a mapped sealed claim has required audit fields. */
export function isValidSealedClaim(claim) {
  if (!claim || typeof claim !== 'object') return false;
  const status = String(claim.claimStatus ?? '').trim();
  const date = String(claim.sessionDate ?? '').trim();
  const student = String(claim.studentName ?? '').trim();
  return status === CLAIM_STATUS_SEALED && date.length >= 8 && student.length > 0;
}

/** Block PATCH on sealed Daily Session rows — append-only accounting rule. */
export function assertClaimNotSealed(fields, claimStatusKey = DS.claimStatus) {
  const status = String(fields?.[claimStatusKey] ?? fields?.claim_status ?? '').trim();
  if (status === CLAIM_STATUS_SEALED) {
    throw new Error('CLAIM_SEALED_IMMUTABLE');
  }
}
