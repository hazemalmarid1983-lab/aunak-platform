import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';

export const TAWASUL_BASE_ID = 'app3vCT2j2JepNVZa';
const TAWASUL_SPECIALISTS_TABLE = 'tblhVAdIeUmqDQTmi';
const TAWASUL_STUDENTS_TABLE = 'tbliBfCKXNyVtWJiO';

export function resolveServerBaseId() {
  const raw =
    process.env.AIRTABLE_BASE_ID ||
    process.env.VITE_AIRTABLE_BASE_ID ||
    (process.env.VITE_TAWASUL_MVP === 'true' ? TAWASUL_BASE_ID : 'appaGfKj4vYhMw0cb');
  return sanitizeAscii(raw).split('/')[0];
}

export function tawasulVerifyConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const envBase = resolveServerBaseId();
  const envTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_SPECIALISTS_TABLE_ID);
  return {
    apiKey,
    // AUN-SPC-* tokens only exist in the Tawasul sandbox — never the sovereign base.
    baseId: envBase === TAWASUL_BASE_ID ? envBase : TAWASUL_BASE_ID,
    specialistsTable: envTable || TAWASUL_SPECIALISTS_TABLE,
  };
}

export function tawasulServerConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = resolveServerBaseId();
  const specialistsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_SPECIALISTS_TABLE_ID) ||
    (baseId === TAWASUL_BASE_ID ? TAWASUL_SPECIALISTS_TABLE : 'tblnmcLd5M3U6sErl');
  const studentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID) ||
    (baseId === TAWASUL_BASE_ID ? TAWASUL_STUDENTS_TABLE : 'tblzYmBGmCxx2vdcr');
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
