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

const HUB_TABLES = {
  scientificItems: "tblnCbBSmwDWwO5SJ",
  specialists: "tblnmcLd5M3U6sErl",
  abcData: "tblJ580ptTVkv07hD",
  safeMedia: "tbljdOSE8CozrzBZN",
  melodyLab: "tblMddsXqCz91hfoU",
  communityResources: "tblV28iWarzve32pP",
  accessControl: "tblfBvd5WI7alVCFU",
  learningDifficulties: "tblcNXSmU90TomEHH",
  emotionalMonitoring: "tblokLHmSHss3FQft",
};

const SECTIONS = [
  { id: "live", label: "Live Registry", tableId: STUDENTS_TABLE },
  { id: "registry", label: "Session Registry", tableId: STUDENTS_TABLE },
  { id: "diagnostics", label: "Diagnostics", tableId: STUDENTS_TABLE },
  { id: "classrooms", label: "Classrooms", tableId: STUDENTS_TABLE },
  { id: "community", label: "Aunak Community", tableId: STUDENTS_TABLE },
  { id: "behavior", label: "Behavior Mod (ABC)", tableId: HUB_TABLES.abcData },
  { id: "scientific", label: "Scientific Lib", tableId: HUB_TABLES.scientificItems },
  { id: "specialists", label: "Specialists", tableId: HUB_TABLES.specialists },
  { id: "media", label: "Safe Media", tableId: HUB_TABLES.safeMedia },
  { id: "emotion", label: "Melodies Lab", tableId: HUB_TABLES.melodyLab },
  { id: "resources", label: "Resources", tableId: HUB_TABLES.communityResources },
  { id: "access", label: "Access Control", tableId: HUB_TABLES.accessControl },
  { id: "learning", label: "Learning Center", tableId: HUB_TABLES.learningDifficulties },
  { id: "crisis", label: "Smart Shield / Emotion", tableId: HUB_TABLES.emotionalMonitoring },
  { id: "biometrics", label: "Biometrics ID", tableId: STUDENTS_TABLE },
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
console.log("--- 15 Hub Sections (all wired to Airtable) ---");
let failCount = 0;
for (const s of SECTIONS) {
  const r = await fetchJson(
    `https://api.airtable.com/v0/${BASE_ID}/${s.tableId}?maxRecords=1`
  );
  if (!r.ok) failCount++;
  const count = r.ok ? (r.body.records || []).length : 0;
  console.log(
    `${r.ok ? "OK  " : "FAIL"} ${r.status} | ${s.id.padEnd(12)} | ${s.label} -> ${s.tableId} (${count} sample)`
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
console.log(`Hub tables configured: ${Object.keys(HUB_TABLES).length} (+ students table)`);
console.log(`Hook: useAirtableData / useAirtableSection in src/hooks/useAirtableData.js`);

console.log("");
console.log("--- Summary ---");
const dataApiOk = withView.ok;
console.log(`Data API (records): ${dataApiOk ? "stable (200)" : "failed"}`);
console.log(`Meta API (schema): ${meta.ok ? "ok" : "403 — token lacks schema.bases:read scope (non-blocking)"}`);
console.log(`Tables enumerated: ${tables.length || "n/a (meta blocked)"}`);
console.log(`Sections wired to Airtable: ${SECTIONS.length}/15`);
console.log(`Failed section fetches: ${failCount}`);
console.log(`Platform status: ${failCount === 0 && dataApiOk ? "15/15 LIVE" : "NEEDS ATTENTION"}`);
process.exit(failCount > 0 || !dataApiOk ? 1 : 0);
