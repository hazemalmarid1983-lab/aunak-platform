/**
 * Vercel / serverless proxy for Airtable (keeps PAT off the client when VITE_USE_AIRTABLE_PROXY=true).
 * GET /api/airtable?table=tblXXXXXXXX
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tableId = req.query?.table;
  if (!tableId || typeof tableId !== "string") {
    res.status(400).json({ error: "Missing ?table= query parameter" });
    return;
  }

  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = (process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || "appaGfKj4vYhMw0cb").split("/")[0];

  if (!apiKey) {
    res.status(500).json({ error: "AIRTABLE_API_KEY not configured on server" });
    return;
  }

  const view = req.query?.view || "Grid view";
  const offset = req.query?.offset;
  const params = new URLSearchParams();
  if (view) params.set("view", view);
  if (offset) params.set("offset", offset);

  const qs = params.toString();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}${qs ? `?${qs}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
    const body = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json");
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: err?.message ?? "Proxy fetch failed" });
  }
}
