import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE_ID = "appaGfKj4vYhMw0cb";
const STUDENTS_TABLE = "tblzYmBGmCxx2vdcr";

const envText = readFileSync(resolve(ROOT, ".env.local"), "utf8");
const pat = envText.match(/VITE_AIRTABLE_PAT=(.+)/)?.[1]?.trim();
if (!pat) {
  console.error("No VITE_AIRTABLE_PAT in .env.local");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${pat}`, Accept: "application/json" };

const SECTIONS = [
  { id: "registry", label: "Session Registry", tableId: STUDENTS_TABLE, wired: true },
  { id: "diagnostics", label: "Diagnostics", tableId: STUDENTS_TABLE, wired: true },
  { id: "media", label: "Safe Media", tableId: null, wired: false },
  { id: "behavior", label: "Behavior Mod", tableId: STUDENTS_TABLE, wired: true },
  { id: "classrooms", label: "Classrooms", tableId: STUDENTS_TABLE, wired: true },
  { id: "scientific", label: "Scientific Lib", tableId: null, wired: false },
  { id: "specialists", label: "Specialists", tableId: null, wired: false },
  { id: "resources", label: "Resources", tableId: null, wired: false },
  { id: "access", label: "Access Control", tableId: null, wired: false },
  { id: "live", label: "Live Registry", tableId: STUDENTS_TABLE, wired: true },
  { id: "crisis", label: "Smart Shield", tableId: null, wired: false },
  { id: "learning", label: "Learning Center", tableId: null, wired: false },
  { id: "emotion", label: "Melodies Lab", tableId: null, wired: false },
  { id: "biometrics", label: "Biometrics ID", tableId: null, wired: false },
  { id: "community", label: "Aunak Community", tableId: STUDENTS_TABLE, wired: true },
];

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, ok: res.ok, body };
}

console.log("=== AUNAK AIRTABLE DIAGNOSTIC ===");
console.log(`Base: ${BASE_ID}`);
console.log(`Client: src/lib/airtable.js`);
console.log("");

const meta = await fetchJson(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`);
console.log("--- Base Meta (tables list) ---");
let tables = [];
if (meta.ok) {
  tables = meta.body.tables || [];
  console.log(`Status: OK (${meta.status})`);
  console.log(`Tables found: ${tables.length}`);
  for (const t of tables) console.log(`  - ${t.name} | ${t.id}`);
} else {
  console.log(`Status: FAIL (${meta.status})`);
  console.log(typeof meta.body === "object" ? JSON.stringify(meta.body, null, 2) : meta.body);
}

console.log("");
console.log("--- Students Table (as fetchStudents() does) ---");
const withView = await fetchJson(
  `https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?maxRecords=1&view=Grid%20view`
);
console.log(`Table: ${STUDENTS_TABLE}`);
console.log(`Grid view: ${withView.status} ${withView.ok ? "OK" : "FAIL"}`);
if (!withView.ok) {
  const noView = await fetchJson(
    `https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?maxRecords=1`
  );
  console.log(`Fallback (no view): ${noView.status} ${noView.ok ? "OK" : "FAIL"}`);
  if (noView.ok) console.log(`Records returned: ${(noView.body.records || []).length}`);
} else {
  console.log(`Records returned: ${(withView.body.records || []).length}`);
}

if (tables.length) {
  console.log("");
  console.log("--- All Base Tables Fetch Probe ---");
  for (const t of tables) {
    const r = await fetchJson(
      `https://api.airtable.com/v0/${BASE_ID}/${t.id}?maxRecords=1`
    );
    console.log(`${r.ok ? "OK  " : "FAIL"} ${r.status} | ${t.name} (${t.id})`);
  }
}

console.log("");
console.log("--- 15 Hub Sections ---");
let failCount = 0;
let staticCount = 0;
for (const s of SECTIONS) {
  if (!s.wired) {
    staticCount++;
    console.log(`STATIC | ${s.id.padEnd(12)} | ${s.label} (inline data, no Airtable call)`);
    continue;
  }
  const r = await fetchJson(
    `https://api.airtable.com/v0/${BASE_ID}/${s.tableId}?maxRecords=1`
  );
  if (!r.ok) failCount++;
  console.log(
    `${r.ok ? "OK  " : "FAIL"} ${r.status} | ${s.id.padEnd(12)} | ${s.label} -> ${s.tableId}`
  );
}

console.log("");
console.log("--- Pagination (fetchAllRecords simulation) ---");
{
  let offset;
  let total = 0;
  let pages = 0;
  do {
    const qs = new URLSearchParams({ pageSize: "100", view: "Grid view" });
    if (offset) qs.set("offset", offset);
    const r = await fetchJson(
      `https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?${qs}`
    );
    pages++;
    if (!r.ok) {
      console.log(`Page ${pages}: FAIL ${r.status}`);
      break;
    }
    total += (r.body.records || []).length;
    offset = r.body.offset;
  } while (offset);
  console.log(`Pages: ${pages}, Total student records: ${total}`);
}

const src = readFileSync(resolve(ROOT, "src/lib/airtable.js"), "utf8");
const hardcodedMatch = src.match(/HARDCODED_API_KEY = "([^"]+)"/);
const hardcoded = hardcodedMatch?.[1] ?? "unknown";
console.log("");
console.log("--- Client config (src/lib/airtable.js) ---");
console.log(
  `HARDCODED_API_KEY: ${hardcoded === "put_your_token_here" ? "PLACEHOLDER (dev relies on .env.local)" : "SET"}`
);
console.log(`VITE_AIRTABLE_PAT: ${pat.startsWith("pat") ? "present" : "missing"}`);
console.log(`Exported fetch functions: fetchStudents only`);
console.log(`Configured table: ${STUDENTS_TABLE} (students)`);

console.log("");
console.log("--- Summary ---");
const dataApiOk = withView.ok;
console.log(`Data API (records): ${dataApiOk ? "stable (200)" : "failed"}`);
console.log(`Meta API (schema): ${meta.ok ? "ok" : "403 — token lacks schema.bases:read scope (non-blocking)"}`);
console.log(`Tables enumerated: ${tables.length || "n/a (meta blocked)"}`);
console.log(`Sections wired to Airtable: ${SECTIONS.filter((s) => s.wired).length}/15`);
console.log(`Sections using static data: ${staticCount}/15`);
console.log(`404/failed fetches (wired sections): ${failCount}`);
process.exit(failCount > 0 || !dataApiOk ? 1 : 0);
