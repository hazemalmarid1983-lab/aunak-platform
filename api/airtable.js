/**
 * Vercel serverless proxy for Airtable (keeps PAT off the client when VITE_USE_AIRTABLE_PROXY=true).
 * GET|POST|PATCH /api/airtable?table=tblXXX&recordId=recXXX (optional)
 *
 * B2G: ministry_auditor role → PII stripped via api/_handlers/b2g/anonymize.js
 */

import {
  filterAirtableResponseForB2G,
  isB2GRole,
} from './_handlers/b2g/anonymize.js';

function sanitizeAscii(value) {
  if (value == null) return "";
  return String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\u200B/g, "")
    .replace(/[\r\n\t]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function sanitizeHeaders(headers) {
  const out = {};
  for (const [name, value] of Object.entries(headers || {})) {
    const key = sanitizeAscii(name);
    const val = sanitizeAscii(value);
    if (key && val) out[key] = val;
  }
  return out;
}

function resolveStudentsTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
    'tblzYmBGmCxx2vdcr'
  );
}

function applyB2GFilter(body, { role, tableId, method }) {
  if (!isB2GRole(role) || method !== 'GET') return body;
  const studentsTable = resolveStudentsTableId();
  const isStudents =
    tableId === studentsTable ||
    /student/i.test(String(tableId));
  if (!isStudents) return body;
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    const filtered = filterAirtableResponseForB2G(parsed, { studentsTableHint: true });
    return JSON.stringify(filtered);
  } catch {
    return body;
  }
}

export default async function handler(req, res) {
  const method = req.method?.toUpperCase?.() || "GET";
  if (!["GET", "POST", "PATCH"].includes(method)) {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tableId = req.query?.table;
  if (!tableId || typeof tableId !== "string") {
    res.status(400).json({ error: "Missing ?table= query parameter" });
    return;
  }

  const b2gRole = sanitizeAscii(req.headers?.['x-aunak-role'] ?? req.headers?.['X-Aunak-Role'] ?? '');

  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const sovereignBase = 'appaGfKj4vYhMw0cb';
  const tawasulBase = 'app3vCT2j2JepNVZa';
  const resolved =
    sanitizeAscii(process.env.AIRTABLE_BASE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_BASE_ID) ||
    '';
  const baseId = (
    resolved ||
    (process.env.VITE_TAWASUL_MVP === 'true' ? tawasulBase : sovereignBase)
  ).split('/')[0];
  // Never route sovereign production to Tawasul sandbox when base is explicitly sovereign.
  const baseIdFinal =
    resolved === sovereignBase && process.env.VITE_TAWASUL_MVP === 'true'
      ? sovereignBase
      : baseId;

  if (!apiKey) {
    res.status(500).json({ error: "AIRTABLE_API_KEY not configured on server" });
    return;
  }

  if (isB2GRole(b2gRole) && method !== 'GET') {
    res.status(403).json({ error: 'B2G_READ_ONLY', hint: 'Ministry auditors may not write student records' });
    return;
  }

  const recordId = req.query?.recordId;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === "table" || key === "recordId") continue;
    if (value != null && value !== "") params.set(key, String(value));
  }

  const qs = params.toString();
  const recordSuffix =
    recordId && typeof recordId === "string" ? `/${encodeURIComponent(recordId)}` : "";
  const url = `https://api.airtable.com/v0/${baseIdFinal}/${encodeURIComponent(tableId)}${recordSuffix}${qs ? `?${qs}` : ""}`;

  const headers = sanitizeHeaders({
    Authorization: `Bearer ${sanitizeAscii(apiKey)}`,
    Accept: "application/json",
    ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
  });

  try {
    const init = { method, headers };
    if (method !== "GET" && req.body != null) {
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }
    const response = await fetch(url, init);
    let body = await response.text();
    body = applyB2GFilter(body, { role: b2gRole, tableId, method });
    res.status(response.status).setHeader("Content-Type", "application/json");
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: err?.message ?? "Proxy fetch failed" });
  }
}
