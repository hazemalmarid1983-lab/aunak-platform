/**
 * Standalone routing runtime test — writes debug-775441.log
 */
import { appendFileSync } from "fs";

const LOG = "debug-775441.log";
function log(message, data, hypothesisId) {
  appendFileSync(
    LOG,
    JSON.stringify({
      sessionId: "775441",
      runId: "post-fix",
      hypothesisId,
      location: "scripts/test-routing.mjs",
      message,
      data,
      timestamp: Date.now(),
    }) + "\n"
  );
}

const VALID = new Set(["live", "media", "registry", "diagnostics"]);

function readPreferred(student) {
  const mapped = student?.preferredLanding;
  if (mapped != null && mapped !== "") {
    if (Array.isArray(mapped)) {
      const first = mapped.find((v) => v != null && String(v).trim() !== "");
      if (first != null) return String(first).trim();
    } else return String(mapped).trim();
  }
  const raw = student?.fields?.["الوجهة المفضلة"];
  if (raw == null) return "";
  if (Array.isArray(raw)) return String(raw[0] ?? "").trim();
  return String(raw).trim();
}

function statusOf(student) {
  const mapped = student?.status;
  if (mapped != null && String(mapped).trim() !== "") return String(mapped).trim();
  return String(student?.fields?.Status ?? "").trim();
}

function resolve(student) {
  const statusRaw = statusOf(student);
  const preferredRaw = readPreferred(student);
  const s = statusRaw.toLowerCase();
  if (s === "new" || s === "جديد") return { section: "diagnostics", preferredRaw, statusRaw };
  if (s === "active" || s === "نشط") {
    const key = preferredRaw.toLowerCase();
    return { section: VALID.has(key) ? key : "live", preferredRaw, statusRaw };
  }
  return { section: "diagnostics", preferredRaw, statusRaw };
}

const cases = [
  [{ status: "New", preferredLanding: "media", fields: { Status: "New", "الوجهة المفضلة": "media" } }, "diagnostics"],
  [{ status: "Active", preferredLanding: "media", fields: { Status: "Active", "الوجهة المفضلة": "media" } }, "media"],
  [{ fields: { Status: "Active", "الوجهة المفضلة": "live" } }, "live"],
  [{ status: "Active", preferredLanding: "registry", fields: { Status: "Active", "الوجهة المفضلة": "registry" } }, "registry"],
  [{ fields: { Status: "جديد", "الوجهة المفضلة": "live" } }, "diagnostics"],
];

let failed = 0;
for (const [student, expect] of cases) {
  const result = resolve(student);
  const ok = result.section === expect;
  if (!ok) failed += 1;
  log("routing_case", { ...result, expect, ok }, ok ? "PASS" : "FAIL");
}

console.log(failed === 0 ? "ALL PASS" : `${failed} FAILED`);
process.exit(failed > 0 ? 1 : 0);
