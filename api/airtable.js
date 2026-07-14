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

/** Strip wrapping quotes / Bearer prefix that break Airtable PAT auth on Vercel. */
function sanitizeAirtablePat(value) {
  let key = sanitizeAscii(value);
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  if (/^bearer\s+/i.test(key)) {
    key = key.replace(/^bearer\s+/i, "").trim();
  }
  return key;
}

function resolveAirtableApiKey() {
  return (
    sanitizeAirtablePat(process.env.AIRTABLE_API_KEY) ||
    sanitizeAirtablePat(process.env.VITE_AIRTABLE_PAT) ||
    sanitizeAirtablePat(process.env.VITE_AIRTABLE_API_KEY) ||
    ""
  );
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
    'tblTidBPaVM4cf3O9'
  );
}

function resolveDailySessionsTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    'tblnNGiaKccMSpizT'
  );
}

function resolveAttendanceTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_ATTENDANCE_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_ATTENDANCE_TABLE_ID) ||
    ''
  );
}

function resolveGoalEvidenceTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_GOAL_EVIDENCE_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID) ||
    ''
  );
}

function stripGovernancePii(body) {
  const records = body?.records;
  if (!Array.isArray(records)) return body;
  return {
    ...body,
    records: records.map((r) => {
      const fields = { ...(r.fields || {}) };
      delete fields.student_name;
      delete fields.recorded_by;
      delete fields.teacher_id;
      delete fields.requested_by;
      delete fields.note;
      return { ...r, fields };
    }),
  };
}

function applyB2GFilter(body, { role, tableId, method }) {
  if (!isB2GRole(role) || method !== 'GET') return body;
  const studentsTable = resolveStudentsTableId();
  const sessionsTable = resolveDailySessionsTableId();
  const attendanceTable = resolveAttendanceTableId();
  const evidenceTable = resolveGoalEvidenceTableId();
  const isStudents =
    tableId === studentsTable ||
    /student/i.test(String(tableId));
  const isSessions =
    tableId === sessionsTable ||
    /session/i.test(String(tableId));
  const isGovernance =
    (attendanceTable && tableId === attendanceTable) ||
    (evidenceTable && tableId === evidenceTable) ||
    /attendance|evidence|correction/i.test(String(tableId));
  if (!isStudents && !isSessions && !isGovernance) return body;
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    if (isGovernance) {
      return JSON.stringify(stripGovernancePii(parsed));
    }
    const filtered = filterAirtableResponseForB2G(parsed, {
      studentsTableHint: isStudents,
      sessionsTableHint: isSessions,
    });
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

  const tableIdRaw = req.query?.table;
  if (!tableIdRaw || typeof tableIdRaw !== "string") {
    res.status(400).json({ error: "Missing ?table= query parameter" });
    return;
  }
  const tableMatch = String(tableIdRaw).match(/tbl[a-zA-Z0-9]{10,}/);
  const tableId = tableMatch ? tableMatch[0] : "";
  if (!tableId) {
    res.status(400).json({
      error: "INVALID_TABLE_ID",
      hint: "Use a clean tbl… id only — do not paste Airtable view URLs into env vars.",
      received: String(tableIdRaw).slice(0, 80),
    });
    return;
  }

  const b2gRole = sanitizeAscii(req.headers?.['x-aunak-role'] ?? req.headers?.['X-Aunak-Role'] ?? '');

  const apiKey = resolveAirtableApiKey();
  /** Central multi-center base (Jul 2026). Legacy archive: appaGfKj4vYhMw0cb */
  const sovereignBase = 'appcjitgWsbvIebwf';
  const legacyArchiveBase = 'appaGfKj4vYhMw0cb';
  const tawasulBase = 'app3vCT2j2JepNVZa';
  const resolved =
    sanitizeAscii(process.env.AIRTABLE_BASE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_BASE_ID) ||
    '';
  const baseId = (
    resolved ||
    (process.env.VITE_TAWASUL_MVP === 'true' ? tawasulBase : sovereignBase)
  ).split('/')[0];
  // Never route production central base to Tawasul sandbox when base is explicitly set.
  const baseIdFinal =
    (resolved === sovereignBase || resolved === legacyArchiveBase) &&
    process.env.VITE_TAWASUL_MVP === 'true'
      ? resolved
      : baseId;

  if (!apiKey) {
    res.status(500).json({
      error: "AIRTABLE_API_KEY not configured on server",
      hint: "Set AIRTABLE_API_KEY (pat…) on Vercel for Preview + Production, then redeploy.",
    });
    return;
  }

  if (!apiKey.startsWith("pat") && !apiKey.startsWith("key")) {
    res.status(500).json({
      error: "AIRTABLE_API_KEY_INVALID_FORMAT",
      hint: "Server key must be an Airtable Personal Access Token (pat…), not a portal login token.",
    });
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
    Authorization: `Bearer ${apiKey}`,
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

    if (response.status === 401) {
      res.status(401).setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify({
          error: {
            type: "UNAUTHORIZED",
            message: "Invalid authentication token",
            hint:
              "Vercel AIRTABLE_API_KEY is rejected by Airtable. Update the server PAT (pat…) for Preview+Production and redeploy. This is not your Private Access Token.",
          },
        })
      );
      return;
    }

    if (response.status === 403 || response.status === 404) {
      res.status(response.status).setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify({
          error: {
            type: "INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND",
            message:
              "Invalid permissions, or the requested model was not found. Check that both your user and your token have the required permissions, and that the model names and/or ids are correct.",
            hint:
              "Vercel AIRTABLE_BASE_ID / table IDs must match the central base, and AIRTABLE_API_KEY must include that base. Redeploy after env change.",
            debug: {
              baseId: baseIdFinal,
              tableId,
              method,
            },
          },
        })
      );
      return;
    }

    body = applyB2GFilter(body, { role: b2gRole, tableId, method });
    if (isB2GRole(b2gRole)) {
      res.setHeader('X-Aunak-B2G-Readonly', 'true');
      res.setHeader('X-Aunak-Reveal-Names', 'denied');
    }
    res.status(response.status).setHeader("Content-Type", "application/json");
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: err?.message ?? "Proxy fetch failed" });
  }
}
