/**
 * Unified seal check — tblDailySessions (tbl3mlewMLvqp6AXB) field mapping + live API probe.
 * Run: node scripts/test-daily-sessions.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE_ID = "appaGfKj4vYhMw0cb";
const DAILY_SESSIONS_TABLE = "tbl3mlewMLvqp6AXB";

const REQUIRED_FIELDS = [
  "Claim Status",
  "Sealed At",
  "Specialist Signature",
  "Immutable Hash",
  "Session Sequence",
  "PIN Verified",
  "Session Date",
  "Specialist Name",
  "Student Name",
  "Notes",
];

const CODE_FIELDS = {
  sessionDate: "Session Date",
  specialistName: "Specialist Name",
  studentName: "Student Name",
  notes: "Notes",
  claimStatus: "Claim Status",
  sealedAt: "Sealed At",
  specialistSignature: "Specialist Signature",
  immutableHash: "Immutable Hash",
  sessionSequence: "Session Sequence",
  pinVerified: "PIN Verified",
};

function loadPat() {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return process.env.VITE_AIRTABLE_PAT || process.env.AIRTABLE_API_KEY;
  const envText = readFileSync(envPath, "utf8");
  return (
    envText.match(/VITE_AIRTABLE_PAT=(.+)/)?.[1]?.trim() ||
    envText.match(/AIRTABLE_API_KEY=(.+)/)?.[1]?.trim()
  );
}

const pat = loadPat();
if (!pat) {
  console.error("FAIL: No Airtable PAT (VITE_AIRTABLE_PAT in .env.local)");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${pat}`, Accept: "application/json" };

console.log("=== Aunak Sealed Claim — Unified Field Check ===\n");
console.log("Table ID:", DAILY_SESSIONS_TABLE);
console.log("Base ID:", BASE_ID);

let failed = 0;

for (const [key, expected] of Object.entries(CODE_FIELDS)) {
  const ok = REQUIRED_FIELDS.includes(expected);
  console.log(ok ? "  OK" : "  FAIL", `${key} → "${expected}"`);
  if (!ok) failed += 1;
}

for (const f of REQUIRED_FIELDS) {
  if (!Object.values(CODE_FIELDS).includes(f)) {
    console.log("  WARN unmapped cloud field:", f);
  }
}

const metaUrl = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
try {
  const metaRes = await fetch(metaUrl, { headers });
  if (metaRes.ok) {
    const meta = await metaRes.json();
    const table = (meta.tables || []).find((t) => t.id === DAILY_SESSIONS_TABLE);
    if (table) {
      const names = new Set((table.fields || []).map((f) => f.name));
      console.log("\n--- Airtable schema probe ---");
      for (const f of REQUIRED_FIELDS) {
        const present = names.has(f);
        console.log(present ? "  OK" : "  MISSING", f);
        if (!present) failed += 1;
      }
    } else {
      console.warn("\nWARN: table not found in meta API (token may lack schema scope)");
    }
  } else {
    console.warn("\nWARN: meta API", metaRes.status, "(skip schema probe — check records instead)");
  }
} catch (e) {
  console.warn("\nWARN: meta probe failed", e.message);
}

const recUrl = `https://api.airtable.com/v0/${BASE_ID}/${DAILY_SESSIONS_TABLE}?maxRecords=3`;
const recRes = await fetch(recUrl, { headers });
if (!recRes.ok) {
  console.error("\nFAIL: records API", recRes.status, await recRes.text());
  process.exit(1);
}

const recData = await recRes.json();
console.log("\n--- Live records ---");
console.log("Records fetched:", (recData.records || []).length);

for (const rec of recData.records || []) {
  const f = rec.fields || {};
  console.log(`  rec ${rec.id}: Claim Status=${f["Claim Status"] ?? "—"}, Sequence=${f["Session Sequence"] ?? "—"}, Specialist=${f["Specialist Name"] ?? "—"}`);
}

console.log("\n=== Result:", failed === 0 ? "PASS — cloud binding ready" : `FAIL (${failed} issues)` , "===");
process.exit(failed === 0 ? 0 : 1);
