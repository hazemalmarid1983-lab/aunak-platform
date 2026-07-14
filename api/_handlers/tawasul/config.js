import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { CENTRAL_BASE_ID, CENTRAL_TABLES } from '../../../src/lib/centralAirtable.js';

export const TAWASUL_BASE_ID = 'app3vCT2j2JepNVZa';
export const SOVEREIGN_BASE_ID = CENTRAL_BASE_ID;
const TAWASUL_SPECIALISTS_TABLE = 'tblhVAdIeUmqDQTmi';
const TAWASUL_STUDENTS_TABLE = 'tbliBfCKXNyVtWJiO';
const SOVEREIGN_STUDENTS_TABLE = CENTRAL_TABLES.students;
const SOVEREIGN_SPECIALISTS_TABLE = CENTRAL_TABLES.specialists;

function resolveTawasulTable(envId, fallback) {
  const id = sanitizeAscii(envId);
  if (id === fallback) return id;
  if (!id) return fallback;
  // Ignore sovereign table IDs baked into env when verifying Tawasul sandbox tokens.
  return fallback;
}

export function resolveServerBaseId() {
  const raw =
    process.env.AIRTABLE_BASE_ID ||
    process.env.VITE_AIRTABLE_BASE_ID ||
    (process.env.VITE_TAWASUL_MVP === 'true' ? TAWASUL_BASE_ID : SOVEREIGN_BASE_ID);
  return sanitizeAscii(raw).split('/')[0] || SOVEREIGN_BASE_ID;
}

/** True only when build/env explicitly targets Tawasul sandbox. */
export function isTawasulSandboxEnv(baseId = resolveServerBaseId()) {
  return process.env.VITE_TAWASUL_MVP === 'true' || baseId === TAWASUL_BASE_ID;
}

/**
 * Token verify config — central multi-center production by default (appcjitgWsbvIebwf).
 * Only forces Tawasul sandbox tables when VITE_TAWASUL_MVP or sandbox base is set.
 */
export function tawasulVerifyConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const envBase = resolveServerBaseId();
  const sandbox = isTawasulSandboxEnv(envBase);

  if (sandbox) {
    const envSpecialistsTable =
      sanitizeAscii(process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID) ||
      sanitizeAscii(process.env.AIRTABLE_SPECIALISTS_TABLE_ID);
    const envStudentsTable =
      sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
      sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID);
    return {
      apiKey,
      baseId: TAWASUL_BASE_ID,
      specialistsTable: resolveTawasulTable(envSpecialistsTable, TAWASUL_SPECIALISTS_TABLE),
      studentsTable: resolveTawasulTable(envStudentsTable, TAWASUL_STUDENTS_TABLE),
    };
  }

  return {
    apiKey,
    baseId: envBase || SOVEREIGN_BASE_ID,
    specialistsTable:
      sanitizeAscii(process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID) ||
      sanitizeAscii(process.env.AIRTABLE_SPECIALISTS_TABLE_ID) ||
      SOVEREIGN_SPECIALISTS_TABLE,
    studentsTable:
      sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
      sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID) ||
      SOVEREIGN_STUDENTS_TABLE,
  };
}

export function tawasulServerConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = resolveServerBaseId();
  const sandbox = isTawasulSandboxEnv(baseId);
  const specialistsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_SPECIALISTS_TABLE_ID) ||
    (sandbox ? TAWASUL_SPECIALISTS_TABLE : SOVEREIGN_SPECIALISTS_TABLE);
  const studentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID) ||
    (sandbox ? TAWASUL_STUDENTS_TABLE : SOVEREIGN_STUDENTS_TABLE);
  return { apiKey, baseId, specialistsTable, studentsTable };
}

export function airtableHeaders(apiKey, { write = false } = {}) {
  const headers = {
    Authorization: `Bearer ${sanitizeAscii(apiKey)}`,
    Accept: 'application/json',
  };
  if (write) headers['Content-Type'] = 'application/json';
  return headers;
}
