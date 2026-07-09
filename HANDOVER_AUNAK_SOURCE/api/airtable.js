/**
 * Vercel serverless proxy for Airtable (keeps PAT off the client when VITE_USE_AIRTABLE_PROXY=true).
 * GET|POST|PATCH /api/airtable?table=tblXXX&recordId=recXXX (optional)
 */

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

  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = sanitizeAscii(
    process.env.AIRTABLE_BASE_ID ||
      process.env.VITE_AIRTABLE_BASE_ID ||
      (process.env.VITE_TAWASUL_MVP === "true" ? "app3vCT2j2JepNVZa" : "appaGfKj4vYhMw0cb")
  ).split("/")[0];

  if (!apiKey) {
    res.status(500).json({ error: "AIRTABLE_API_KEY not configured on server" });
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
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}${recordSuffix}${qs ? `?${qs}` : ""}`;

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
    const body = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json");
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: err?.message ?? "Proxy fetch failed" });
  }
}