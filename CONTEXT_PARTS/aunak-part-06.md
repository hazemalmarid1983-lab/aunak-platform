<!-- AUNAK CONTEXT — Part 6 | lines 25001-28509 of 28509 | main + Tawasul (English Island excluded) -->


function writeLedgerOverride(day, email, count) {
  try {
    const all = readLedgerOverrides();
    all[`${day}|${normalizeEmail(email)}`] = count;
    localStorage.setItem(LEDGER_OVERRIDE_LS, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function readLedgerOverride(day, email) {
  const all = readLedgerOverrides();
  const v = all[`${day}|${normalizeEmail(email)}`];
  return v != null ? Number(v) : null;
}

async function resolveSpecialistDisplayName(specialistEmail, specialistName) {
  if (specialistName?.trim()) return specialistName.trim();
  if (!specialistEmail) return "";
  const ac = await fetchAccessControlByEmail(specialistEmail);
  const name = getField(ac?.fields ?? {}, AF.user_name);
  return name?.trim() || specialistEmail;
}

function filterBackupClaims(date, specialistName) {
  const day = normalizeSessionDate(date);
  const name = String(specialistName ?? "").trim().toLowerCase();
  return readDailySessionsBackup().filter((rec) => {
    const f = rec.fields ?? {};
    const recDay = normalizeSessionDate(f[DS.sessionDate]);
    const recName = String(f[DS.specialistName] ?? "").trim().toLowerCase();
    const st = String(f[DS.claimStatus] ?? "").trim();
    return recDay === day && recName === name && (st === CLAIM_STATUS_SEALED || st === "");
  });
}

function dailyClaimsFormula(date, specialistName) {
  const day = normalizeSessionDate(date);
  const name = String(specialistName).replace(/'/g, "\\'");
  return (
    "AND({" +
    DS.sessionDate +
    "}='" +
    day +
    "', {" +
    DS.claimStatus +
    "}='" +
    CLAIM_STATUS_SEALED +
    "', {" +
    DS.specialistName +
    "}='" +
    name +
    "')"
  );
}

export async function fetchDailyClaimsForDate(date, specialistEmail, specialistName) {
  const tableId = AIRTABLE_TABLES.dailySessions;
  const name = await resolveSpecialistDisplayName(specialistEmail, specialistName);
  if (!tableId) {
    return filterBackupClaims(date, name);
  }
  try {
    const formula = dailyClaimsFormula(date, name);
    return await fetchAllRecords(tableId, { filterByFormula: formula });
  } catch (err) {
    if (isCloudDailySessionsTable()) throw err;
    return filterBackupClaims(date, name);
  }
}

function filterBackupClaimsByStudent(studentName, startDate, endDate) {
  const name = String(studentName ?? "").trim().toLowerCase();
  const start = normalizeSessionDate(startDate);
  const end = normalizeSessionDate(endDate);
  return readDailySessionsBackup().filter((rec) => {
    const f = rec.fields ?? {};
    const recName = String(f[DS.studentName] ?? "").trim().toLowerCase();
    const recDay = normalizeSessionDate(f[DS.sessionDate]);
    const st = String(f[DS.claimStatus] ?? "").trim();
    return (
      recName === name &&
      recDay >= start &&
      recDay <= end &&
      (st === CLAIM_STATUS_SEALED || st === "")
    );
  });
}

function sealedClaimsByStudentFormula(studentName, startDate, endDate) {
  const name = String(studentName).replace(/'/g, "\\'");
  const start = normalizeSessionDate(startDate);
  const end = normalizeSessionDate(endDate);
  return (
    "AND({" +
    DS.studentName +
    "}='" +
    name +
    "', {" +
    DS.claimStatus +
    "}='" +
    CLAIM_STATUS_SEALED +
    "', {" +
    DS.sessionDate +
    "}>='" +
    start +
    "', {" +
    DS.sessionDate +
    "}<='" +
    end +
    "')"
  );
}

/** Sealed claims for a student within a date range — report engine source. */
export async function fetchSealedClaimsForStudent({ studentName, startDate, endDate }) {
  const tableId = AIRTABLE_TABLES.dailySessions;
  const name = String(studentName ?? "").trim();
  if (!name) return [];
  const start = normalizeSessionDate(startDate);
  const end = normalizeSessionDate(endDate);
  if (!tableId) {
    return filterBackupClaimsByStudent(name, start, end);
  }
  try {
    const formula = sealedClaimsByStudentFormula(name, start, end);
    return await fetchAllRecords(tableId, { filterByFormula: formula });
  } catch (err) {
    if (isCloudDailySessionsTable()) throw err;
    return filterBackupClaimsByStudent(name, start, end);
  }
}

export async function fetchCenterLedgerForDate(date, specialistEmail) {
  void date;
  void specialistEmail;
  return null;
}

export async function createDailySessionClaim({
  specialistEmail,
  specialistName,
  studentId,
  studentName,
  sessionFee,
  notes,
  sessionDate,
  aunAttestation,
  aunAttestationAt,
}) {
  return createSealedSessionClaim({
    specialistEmail,
    specialistName,
    studentId,
    studentName,
    sessionFee,
    notes,
    sessionDate,
    aunAttestation,
    aunAttestationAt,
    sealed: false,
  });
}

export async function createSealedSessionClaim({
  specialistEmail,
  specialistName,
  studentId,
  studentName,
  sessionFee,
  notes,
  sessionDate,
  aunAttestation,
  aunAttestationAt,
  sequence,
  signature,
  immutableHash,
  pinVerified,
  sealed = true,
}) {
  void specialistEmail;
  void studentId;
  void sessionFee;
  void aunAttestation;
  void aunAttestationAt;

  const day = normalizeSessionDate(sessionDate);
  const displayName = specialistName?.trim() || (await resolveSpecialistDisplayName(specialistEmail, null));

  const fields = scrubFields({
    [DS.sessionDate]: day,
    [DS.specialistName]: displayName,
    [DS.studentName]: studentName,
    [DS.notes]: notes ?? "",
    ...(sealed
      ? {
          [DS.claimStatus]: CLAIM_STATUS_SEALED,
          [DS.sealedAt]: new Date().toISOString(),
          [DS.sessionSequence]: sequence,
          [DS.immutableHash]: immutableHash,
          [DS.pinVerified]: Boolean(pinVerified),
          [DS.specialistSignature]: signature ? JSON.stringify(signature) : "",
        }
      : {}),
  });

  const tableId = AIRTABLE_TABLES.dailySessions;
  if (!tableId) {
    appendDailySessionBackup(fields);
    return { id: "local-claim-" + Date.now(), fields };
  }

  const data = await airtableWrite(tableId, "POST", { fields });
  return data;
}

/** Cloud tblDailySessions: ledger count = sealed claim count (100% sync). */
export async function syncLedgerToClaimCount(date, specialistEmail, specialistName) {
  const day = normalizeSessionDate(date);
  const name = await resolveSpecialistDisplayName(specialistEmail, specialistName);
  const claims = await fetchDailyClaimsForDate(day, specialistEmail, name);
  const sealedCount = (claims || []).length;
  if (isCloudDailySessionsTable()) {
    writeLedgerOverride(day, specialistEmail, sealedCount);
    return { synced: true, count: sealedCount, cloud: true };
  }
  writeLedgerOverride(day, specialistEmail, sealedCount);
  return { synced: true, count: sealedCount };
}

export function assertClaimNotSealed(fields) {
  if (String(fields?.[DS.claimStatus] ?? "").trim() === CLAIM_STATUS_SEALED) {
    throw new Error("CLAIM_SEALED_IMMUTABLE");
  }
}

/** Fetch access control record by specialist email (for PIN verification). */
export async function fetchAccessControlByEmail(email) {
  const target = normalizeEmail(email);
  if (!target) return null;
  const records = await fetchAirtableRecords(AIRTABLE_TABLES.accessControl);
  return (
    records.find((r) => {
      const em = getField(r.fields, AF.user_email);
      return em != null && normalizeEmail(em) === target;
    }) ?? null
  );
}

export async function setCenterLedgerCount(date, specialistEmail, count, specialistName) {
  const day = normalizeSessionDate(date);
  const n = Number(count);
  const sessionCount = Number.isFinite(n) ? n : 0;
  writeLedgerOverride(day, specialistEmail, sessionCount);
  return { id: `ledger-override-${day}`, fields: { sessionCount } };
}

export async function approveDailyReconciliation(date, specialistEmail, specialistName) {
  const day = normalizeSessionDate(date);
  const claims = await fetchDailyClaimsForDate(day, specialistEmail, specialistName);
  const sealedCount = (claims || []).length;
  writeLedgerOverride(day, specialistEmail, sealedCount);
  return { approved: true, count: sealedCount };
}

export async function getDailyReconciliation(date, specialistEmail, specialistName) {
  const day = normalizeSessionDate(date);
  const name = await resolveSpecialistDisplayName(specialistEmail, specialistName);
  const claims = await fetchDailyClaimsForDate(day, specialistEmail, name);

  const claimCount = (Array.isArray(claims) ? claims : []).filter((c) => {
    const st = String(c?.fields?.[DS.claimStatus] ?? "").trim();
    return st === CLAIM_STATUS_SEALED || st === "";
  }).length;

  const override = readLedgerOverride(day, specialistEmail);
  const ledgerCountSafe =
    override != null && Number.isFinite(override) ? override : claimCount;
  const difference = ledgerCountSafe - claimCount;
  const sovereignApproved = difference === 0 && claimCount > 0;
  const hasMismatch = difference !== 0;

  return {
    claimCount,
    ledgerCount: ledgerCountSafe,
    difference,
    sovereignApproved,
    hasMismatch,
    ledgerRecordId: null,
    cloudTableId: AIRTABLE_TABLES.dailySessions,
  };
}

export const GOAL_ATTEMPT_FIELDS = {
  student: GA_FIELDS.student,
  sessionId: GA_FIELDS.session_id,
  sessionDate: GA_FIELDS.session_date,
  goalLabel: GA_FIELDS.goal_label,
  goalSource: GA_FIELDS.goal_source,
  successPercent: GA_FIELDS.success_percent,
  attemptNumber: GA_FIELDS.attempt_number,
  specialistEmail: GA_FIELDS.specialist_email,
  attemptNotes: GA_FIELDS.attempt_notes,
  recordedAt: GA_FIELDS.recorded_at,
};

const GOAL_ATTEMPTS_LS = "aunak.goalAttempts.v1";
const GA = GOAL_ATTEMPT_FIELDS;

function readGoalAttemptsBackup() {
  try {
    const raw = localStorage.getItem(GOAL_ATTEMPTS_LS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGoalAttemptsBackup(records) {
  try {
    localStorage.setItem(GOAL_ATTEMPTS_LS, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

function appendGoalAttemptBackup(fields) {
  const list = readGoalAttemptsBackup();
  list.push({
    id: "local-attempt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    fields: { ...fields },
  });
  writeGoalAttemptsBackup(list);
}

function goalAttemptsTableId() {
  const id = AIRTABLE_TABLES.goalAttempts;
  return id && String(id).trim() ? String(id).trim() : null;
}

function goalAttemptFromBackup(rec) {
  return {
    id: rec.id,
    fields: rec.fields ?? rec,
  };
}

function filterGoalAttemptsBackup({ sessionId, studentId, weekStart, weekEnd }) {
  return readGoalAttemptsBackup().filter((rec) => {
    const f = rec.fields ?? {};
    if (sessionId && String(f[GA.sessionId] ?? "") !== String(sessionId)) return false;
    if (studentId) {
      const linked = f[GA.student];
      const ids = Array.isArray(linked) ? linked : linked ? [linked] : [];
      if (ids.length && !ids.includes(studentId)) return false;
    }
    if (weekStart || weekEnd) {
      const day = normalizeSessionDate(f[GA.sessionDate]);
      if (weekStart && day < weekStart) return false;
      if (weekEnd && day > weekEnd) return false;
    }
    return true;
  });
}

export async function createGoalAttempt({
  studentId,
  sessionId,
  sessionDate,
  goalLabel,
  goalSource,
  successPercent,
  attemptNumber,
  specialistEmail,
  attemptNotes,
}) {
  const day = normalizeSessionDate(sessionDate);
  const recordedAt = new Date().toISOString();
  const fields = scrubFields({
    [GA.sessionId]: sessionId,
    [GA.sessionDate]: day,
    [GA.goalLabel]: goalLabel,
    [GA.goalSource]: goalSource,
    [GA.successPercent]: successPercent,
    [GA.attemptNumber]: attemptNumber,
    [GA.specialistEmail]: normalizeEmail(specialistEmail) || specialistEmail,
    [GA.attemptNotes]: attemptNotes,
    [GA.recordedAt]: recordedAt,
  });
  if (studentId) fields[GA.student] = [studentId];

  const tableId = goalAttemptsTableId();
  if (!tableId) {
    appendGoalAttemptBackup(fields);
    return { id: "local-attempt-" + Date.now(), fields };
  }

  try {
    const data = await airtableWrite(tableId, "POST", { fields });
    appendGoalAttemptBackup(data.fields ?? fields);
    return data;
  } catch (err) {
    console.warn("[airtable] createGoalAttempt backup:", err.message);
    appendGoalAttemptBackup(fields);
    return { id: "local-attempt-" + Date.now(), fields };
  }
}

export async function fetchSessionGoalAttempts(sessionId) {
  if (!sessionId) return [];
  const tableId = goalAttemptsTableId();
  const sid = String(sessionId).replace(/'/g, "\\'");
  if (tableId) {
    try {
      const formula = `{${GA.sessionId}}='${sid}'`;
      return await fetchAllRecords(tableId, { filterByFormula: formula });
    } catch (err) {
      console.warn("[airtable] fetchSessionGoalAttempts failed, using backup:", err.message);
    }
  }
  return filterGoalAttemptsBackup({ sessionId }).map(goalAttemptFromBackup);
}

export async function fetchWeeklyGoalAttempts({ studentId, weekStart, weekEnd }) {
  const start = normalizeSessionDate(weekStart);
  const end = normalizeSessionDate(weekEnd);
  const tableId = goalAttemptsTableId();

  if (tableId) {
    try {
      const formula =
        "AND(IS_AFTER({" +
        GA.sessionDate +
        "}, DATEADD('" +
        start +
        "', -1, 'days')), IS_BEFORE({" +
        GA.sessionDate +
        "}, DATEADD('" +
        end +
        "', 1, 'days')))";
      const records = await fetchAllRecords(tableId, { filterByFormula: formula });
      if (!studentId) return records;
      return records.filter((rec) => {
        const linked = rec?.fields?.[GA.student];
        const ids = Array.isArray(linked) ? linked : linked ? [linked] : [];
        return ids.includes(studentId);
      });
    } catch (err) {
      console.warn("[airtable] fetchWeeklyGoalAttempts failed, using backup:", err.message);
    }
  }

  return filterGoalAttemptsBackup({ studentId, weekStart: start, weekEnd: end }).map(
    goalAttemptFromBackup
  );
}
````

## File: src/lib/airtableTables.js
````javascript
/** Canonical Airtable table IDs for all hub sections. */
const DEFAULT_STUDENTS_TABLE_ID = "tblzYmBGmCxx2vdcr";

function resolveTableId(envKey, fallback = DEFAULT_STUDENTS_TABLE_ID) {
  const raw = import.meta.env[envKey];
  const cleaned = raw != null ? String(raw).trim() : "";
  return cleaned || fallback;
}

/** tblDailySessions — سجل الجلسات (cloud, isolated from Students). */
export const DEFAULT_DAILY_SESSIONS_TABLE_ID = "tbl3mlewMLvqp6AXB";

function resolveDailySessionsTableId() {
  const raw = import.meta.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID;
  const cleaned = raw != null ? String(raw).trim() : "";
  if (/^tbl[a-zA-Z0-9]{10,}$/i.test(cleaned)) return cleaned;
  if (cleaned) {
    console.warn(
      "[airtable] Invalid VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID (must start with tbl):",
      cleaned
    );
  }
  return DEFAULT_DAILY_SESSIONS_TABLE_ID;
}

export const AIRTABLE_TABLES = {
  students: resolveTableId("VITE_AIRTABLE_STUDENTS_TABLE_ID", DEFAULT_STUDENTS_TABLE_ID),
  dailySessions: resolveDailySessionsTableId(),
  scientificItems: "tblnCbBSmwDWwO5SJ",
  specialists: resolveTableId("VITE_AIRTABLE_SPECIALISTS_TABLE_ID", "tblnmcLd5M3U6sErl"),
  abcData: "tblJ580ptTVkv07hD",
  safeMedia: "tbljdOSE8CozrzBZN",
  melodyLab: "tblMddsXqCz91hfoU",
  communityResources: "tblV28iWarzve32pP",
  accessControl: "tblfBvd5WI7alVCFU",
  learningDifficulties: "tblcNXSmU90TomEHH",
  emotionalMonitoring: "tblokLHmSHss3FQft",
  /** Set VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID after creating «محاولات الأهداف | Goal Attempts» in base appaGfKj4vYhMw0cb */
  goalAttempts: resolveTableId("VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID", ""),
  /** Set VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID after creating «الأكاديمية الصيفية | Summer Academy» */
  summerAcademy: resolveTableId("VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID", ""),
};

export const SECTION_TABLE_MAP = [
  { section: "السجل الحي / Live Dashboard", tableId: AIRTABLE_TABLES.students },
  { section: "سجل الجلسات / Session Registry", tableId: AIRTABLE_TABLES.students },
  { section: "مقاييس التشخيص / Diagnostics", tableId: AIRTABLE_TABLES.students },
  { section: "الفصول الدراسية / Classrooms", tableId: AIRTABLE_TABLES.students },
  { section: "مجتمع عونك / Community", tableId: AIRTABLE_TABLES.students },
  { section: "تعديل السلوك (ABC) / Behavior Mod", tableId: AIRTABLE_TABLES.abcData },
  { section: "مكتبة البنود / Scientific Items", tableId: AIRTABLE_TABLES.scientificItems },
  { section: "الأخصائيين / Specialists", tableId: AIRTABLE_TABLES.specialists },
  { section: "مكتبة الوسائط / Safe Media", tableId: AIRTABLE_TABLES.safeMedia },
  { section: "مختبر الألحان / Melody Lab", tableId: AIRTABLE_TABLES.melodyLab },
  { section: "موارد المجتمع / Resources", tableId: AIRTABLE_TABLES.communityResources },
  { section: "التحكم في الوصول / Access Control", tableId: AIRTABLE_TABLES.accessControl },
  { section: "صعوبات التعلم / Learning Center", tableId: AIRTABLE_TABLES.learningDifficulties },
  { section: "الرصد العاطفي / Emotional Monitoring", tableId: AIRTABLE_TABLES.emotionalMonitoring },
  { section: "الدرع الذكي / Smart Shield (Crisis)", tableId: AIRTABLE_TABLES.emotionalMonitoring },
  { section: "البصمة الحيوية / Biometrics", tableId: AIRTABLE_TABLES.students },
  { section: "Daily Sessions / Reconciliation", tableId: AIRTABLE_TABLES.dailySessions },
  { section: "محاولات الأهداف / Goal Attempts", tableId: AIRTABLE_TABLES.goalAttempts },
  { section: "الأكاديمية الصيفية / Summer Academy", tableId: AIRTABLE_TABLES.summerAcademy },
];
````

## File: src/lib/sovereignAudio.js
````javascript
/**
 * Sovereign Audio Layer — synthesized intelligence/spy-aesthetic feedback.
 *
 * No audio assets: every cue is generated with the Web Audio API and
 * scheduled on the AudioContext clock, so cues keep firing precisely even
 * when the tab is throttled in the background (alerting busy specialists).
 */

const STORAGE_KEY = 'aunak.audio.enabled';
const STEALTH_KEY = 'aunak.stealth.enabled';

let ctx = null;
let noiseBuffer = null;
const activeHums = new Set();

export function isAudioEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setAudioEnabled(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
  if (!on) {
    for (const stop of [...activeHums]) stop();
  }
}
export function isStealthMode() {
  try {
    return localStorage.getItem(STEALTH_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setStealthMode(on) {
  try {
    localStorage.setItem(STEALTH_KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
}

export function canPlaySovereignAudio() {
  return isAudioEnabled() && !isStealthMode();
}

function getCtx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    // Autoplay policy: resume on the first user gesture anywhere.
    const unlock = () => {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function getNoiseBuffer(ac) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** Schedule one enveloped oscillator tone on the audio clock. */
function tone(ac, { freq, endFreq, type = 'sine', start, dur, gain = 0.08 }) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/* ------------------------------------------------------------------ */
/* Cues                                                                 */
/* ------------------------------------------------------------------ */

/** Success Chime — ascending crystalline triad (biometric face match). */
export function playSuccessChime() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  const notes = [659.25, 987.77, 1318.51]; // E5 → B5 → E6
  notes.forEach((freq, i) => {
    tone(ac, { freq, type: 'sine', start: t + i * 0.09, dur: 0.55, gain: 0.07 });
    tone(ac, { freq: freq * 2, type: 'triangle', start: t + i * 0.09, dur: 0.3, gain: 0.015 });
  });
}

/**
 * Data Processing Hum — faint server-room drone for the AI terminal.
 * Returns a handle: call .stop() on unmount.
 */
export function startProcessingHum() {
  if (!canPlaySovereignAudio()) return { stop() {} };
  const ac = getCtx();
  if (!ac) return { stop() {} };

  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);

  const oscA = ac.createOscillator();
  oscA.type = 'sine';
  oscA.frequency.value = 48;
  const oscB = ac.createOscillator();
  oscB.type = 'sine';
  oscB.frequency.value = 96.5;
  const gB = ac.createGain();
  gB.gain.value = 0.35;

  const noise = ac.createBufferSource();
  noise.buffer = getNoiseBuffer(ac);
  noise.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 240;
  const gN = ac.createGain();
  gN.gain.value = 0.18;

  // Slow LFO so the hum subtly "breathes" instead of droning flat.
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.12;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.004;
  lfo.connect(lfoGain).connect(master.gain);

  oscA.connect(master);
  oscB.connect(gB).connect(master);
  noise.connect(lp).connect(gN).connect(master);

  const t = ac.currentTime;
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.013, t + 1.2);

  oscA.start(t);
  oscB.start(t);
  noise.start(t);
  lfo.start(t);

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    activeHums.delete(stop);
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value || 0.013, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    [oscA, oscB, noise, lfo].forEach((n) => n.stop(now + 0.7));
  };
  activeHums.add(stop);
  return { stop };
}

/** Warning Pulse — descending tactical alarm tied to the ABC risk equation. */
export function playWarningPulse() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  for (let i = 0; i < 4; i += 1) {
    const start = t + i * 0.24;
    tone(ac, { freq: 233, endFreq: 155, type: 'triangle', start, dur: 0.16, gain: 0.09 });
    tone(ac, { freq: 58, type: 'sine', start, dur: 0.16, gain: 0.06 });
  }
}

/** Star drop — crystalline ping when mirror or play awards a star (capped at 5). */
export function playStarDrop() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  tone(ac, { freq: 880, endFreq: 1174.66, type: 'sine', start: t, dur: 0.35, gain: 0.08 });
  tone(ac, { freq: 1760, type: 'triangle', start: t + 0.06, dur: 0.2, gain: 0.02 });
}

/** Calm pulse — soft descending breath cue (mirror CALM_PULSE). */
export function playCalmPulse() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  tone(ac, { freq: 392, endFreq: 261.63, type: 'sine', start: t, dur: 1.8, gain: 0.06 });
  tone(ac, { freq: 196, type: 'sine', start: t + 0.4, dur: 1.4, gain: 0.04 });
}

/** Goal echo — resonant triad when specialist mirrors programmed goal. */
export function playGoalEcho() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    tone(ac, { freq, type: 'sine', start: t + i * 0.12, dur: 0.7, gain: 0.06 });
  });
}

/**
 * Ta-da Fanfare — joyful celebratory burst for a specialist reward.
 * Rising major arpeggio + shimmer sparkle so the child gets instant dopamine.
 */
export function playTaDaFanfare() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;

  // "Ta-" quick lift then "-da!" bright landing.
  tone(ac, { freq: 523.25, endFreq: 659.25, type: 'triangle', start: t, dur: 0.18, gain: 0.09 });
  const chord = [659.25, 830.61, 987.77, 1318.51]; // E5 · G#5 · B5 · E6 (E major)
  chord.forEach((freq, i) => {
    tone(ac, { freq, type: 'triangle', start: t + 0.2 + i * 0.015, dur: 0.9, gain: 0.07 });
    tone(ac, { freq: freq * 2, type: 'sine', start: t + 0.2, dur: 0.5, gain: 0.012 });
  });

  // Shimmer sparkle tail.
  for (let i = 0; i < 8; i += 1) {
    tone(ac, {
      freq: 1500 + Math.random() * 1800,
      type: 'sine',
      start: t + 0.35 + i * 0.055,
      dur: 0.18,
      gain: 0.02,
    });
  }
}

/**
 * Calm Sensory Drone — warm sustained pad that soothes on calm_pulse.
 * Returns a handle: call .stop() to fade out.
 */
export function startCalmDrone() {
  if (!canPlaySovereignAudio()) return { stop() {} };
  const ac = getCtx();
  if (!ac) return { stop() {} };

  const master = ac.createGain();
  master.gain.value = 0;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  master.connect(lp).connect(ac.destination);

  // Soft consonant chord (A2 · E3 · A3 · C#4) — gentle, non-alerting.
  const freqs = [110, 164.81, 220, 277.18];
  const oscs = freqs.map((f, i) => {
    const osc = ac.createOscillator();
    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.value = f;
    const g = ac.createGain();
    g.gain.value = i === 0 ? 0.5 : 0.22;
    osc.connect(g).connect(master);
    return osc;
  });

  // Slow shimmer LFO on the filter for a breathing, watery texture.
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.14;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 320;
  lfo.connect(lfoGain).connect(lp.frequency);

  const t = ac.currentTime;
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.05, t + 1.5);

  oscs.forEach((o) => o.start(t));
  lfo.start(t);

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    activeHums.delete(stop);
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value || 0.05, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    [...oscs, lfo].forEach((n) => n.stop(now + 1.6));
  };
  activeHums.add(stop);
  return { stop };
}

/** Typewriter Effect — rapid intel-teletype ticks (gaze-neutrality alert). */
export function playTypewriterEffect(ticks = 16) {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  let t = ac.currentTime + 0.02;
  for (let i = 0; i < ticks; i += 1) {
    const src = ac.createBufferSource();
    src.buffer = getNoiseBuffer(ac);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2100 + Math.random() * 900;
    bp.Q.value = 8;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(t, Math.random() * 0.5, 0.03);
    t += 0.045 + Math.random() * 0.05;
  }
}
````

## File: src/lib/specialistIsolation.js
````javascript
import { getField } from './airtable';
import { SPECIALIST as SP, STUDENT as SF } from './airtableFields';
import { TAWASUL_MAX_CASES_PER_SPECIALIST } from './tawasulConfig';

function toIdList(raw) {
  if (raw == null || raw === '') return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((v) => (typeof v === 'string' ? v : v?.id))
    .filter((id) => id && /^rec[a-zA-Z0-9]{10,}$/.test(String(id)));
}

function linkedSpecialistIds(student) {
  const f = student?.fields ?? {};
  const raw = student?.assignedSpecialistIds ?? getField(f, SF.assigned_specialist);
  return toIdList(raw);
}

/** Student record IDs linked on the Specialists.Students field (live Tawasul base). */
export function linkedStudentIdsFromSpecialistRecord(specialistRecord) {
  const f = specialistRecord?.fields;
  if (!f || typeof f !== 'object') return [];
  const raw = f?.Students ?? f?.students ?? f?.[SP.students] ?? f?.assigned_specialist ?? null;
  return toIdList(raw);
}

/** Permy-filter: specialist sees only students linked to their Airtable record ID. */
export function filterStudentsBySpecialist(students, specialistRecordId, { maxCases = TAWASUL_MAX_CASES_PER_SPECIALIST } = {}) {
  if (!specialistRecordId) return [];
  const list = Array.isArray(students) ? students : [];
  return list
    .filter((s) => linkedSpecialistIds(s).includes(specialistRecordId))
    .slice(0, maxCases);
}

export function filterStudentsByLinkedIds(students, studentIds, { maxCases = TAWASUL_MAX_CASES_PER_SPECIALIST } = {}) {
  const ids = toIdList(studentIds);
  if (!ids.length) return [];
  const idSet = new Set(ids);
  return (Array.isArray(students) ? students : [])
    .filter((s) => idSet.has(s.id))
    .slice(0, maxCases);
}

/** Fallback token match when link field not yet populated (seed / migration). */
export function filterStudentsBySpecialistToken(students, specialistToken, { maxCases = TAWASUL_MAX_CASES_PER_SPECIALIST } = {}) {
  const key = String(specialistToken ?? '').trim().toUpperCase();
  if (!key) return [];
  return (Array.isArray(students) ? students : [])
    .filter((s) => {
      const f = s?.fields ?? {};
      const tok = String(getField(f, SF.specialist_tutor_token) ?? s.specialistTutorToken ?? '').trim().toUpperCase();
      return tok === key;
    })
    .slice(0, maxCases);
}

export function resolveSpecialistCaseload(students, session, specialistRecord) {
  const bySpecialistStudents = filterStudentsByLinkedIds(
    students,
    linkedStudentIdsFromSpecialistRecord(specialistRecord)
  );
  if (bySpecialistStudents.length > 0) return bySpecialistStudents;

  const byAssigned = filterStudentsBySpecialist(students, session?.specialistRecordId);
  if (byAssigned.length > 0) return byAssigned;

  return filterStudentsBySpecialistToken(students, session?.specialistToken);
}
````

## File: src/lib/tawasulMirror.js
````javascript
/**
 * Ghost Mirror — Airtable-backed live commands (specialist → child).
 * Students: mirror_command, mirror_payload, programmed_goal (snake_case).
 */

import { STUDENT as SF } from './airtableFields.js';
import { normalizeMirrorCommand, readTawasulMirrorCommand, readTawasulMirrorPayload } from './tawasulStudentFields.js';

export const MIRROR_COMMANDS = {
  ECHO_GOAL: 'echo_goal',
  DROP_STAR: 'drop_star',
  DROP_REWARD: 'drop_reward',
  CALM_PULSE: 'calm_pulse',
  CLEAR: 'clear',
};

export function parseMirrorState(fields = {}) {
  const cmd =
    readTawasulMirrorCommand(fields) ||
    normalizeMirrorCommand(fields[SF.mirror_command] ?? fields.mirror_command ?? '');
  const payload =
    readTawasulMirrorPayload(fields) ||
    String(fields[SF.mirror_payload] ?? fields.mirror_payload ?? '').trim();
  return { command: cmd, payload, ts: Date.now() };
}

export function buildMirrorPatch(command, payload = '') {
  return {
    [SF.mirror_command]: normalizeMirrorCommand(command),
    [SF.mirror_payload]: String(payload ?? ''),
  };
}

/** Child-side: react once per unique command+payload pair. */
export function mirrorFingerprint(state) {
  return `${state.command}::${state.payload}`;
}
````

## File: api/_handlers/tawasul/verify-token.js
````javascript
/**
 * POST /api/tawasul/verify-token
 * Server-side token verify — runtime env (base + table + PAT), not client build IDs.
 * AUN-SPC-* → Specialists.specialist_tutor_token
 * AUN-CHD-* → Students.child_interactive_token
 * AUN-ENG-* → Students.student_english_token (English Talk Island)
 */

import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { SPECIALIST as SP, STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

function pickField(fields, ...keys) {
  if (!fields) return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return null;
}

async function airtableGet(url, apiKey) {
  const res = await fetch(url, { headers: airtableHeaders(apiKey) });
  const text = await res.text();
  if (!res.ok) throw new Error(`AIRTABLE_${res.status}:${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function findRecordByTokenField(apiKey, baseId, tableId, fieldName, token) {
  const key = normalizeToken(token);
  const esc = key.replace(/'/g, "\\'");
  const formula = encodeURIComponent(`{${fieldName}}='${esc}'`);
  const filteredUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}&maxRecords=1`;

  try {
    const data = await airtableGet(filteredUrl, apiKey);
    if (data.records?.[0]) return data.records[0];
  } catch (err) {
    if (!String(err?.message ?? '').includes('422')) throw err;
  }

  const listUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?maxRecords=100`;
  const data = await airtableGet(listUrl, apiKey);
  return (
    (data.records ?? []).find(
      (r) => normalizeToken(pickField(r.fields, fieldName)) === key
    ) ?? null
  );
}

function buildSpecialistSession(record, token) {
  const f = record.fields ?? {};
  const status = String(pickField(f, SP.status, 'status') ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  return {
    role: 'specialist',
    // Tawasul merges all sovereign packages — top tier + manual override unlock everything.
    plan: 'institution',
    manualOverride: true,
    accessLevel: 'sovereign',
    name: pickField(f, SP.name, 'Name', 'specialist_name') || 'أخصائي',
    email: pickField(f, SP.email, 'Email', 'professional_email') || '',
    specialistRecordId: record.id,
    specialistToken: normalizeToken(token),
    tawasulMvp: true,
    landingSection: 'registry',
    dynamicSessionId: `TWS-${Date.now().toString(36)}`,
  };
}

function buildChildPayload(record, token) {
  const f = record.fields ?? {};
  const status = String(pickField(f, SF.status, 'status') ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  return {
    id: record.id,
    fields: f,
    childInteractiveToken: normalizeToken(
      pickField(f, SF.child_interactive_token, 'child_interactive_token') || token
    ),
  };
}

function buildEnglishPayload(record, token) {
  const f = record.fields ?? {};
  const status = String(pickField(f, SF.status, 'status') ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  return {
    id: record.id,
    fields: f,
    studentEnglishToken: normalizeToken(
      pickField(f, SF.student_english_token, 'student_english_token') || token
    ),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = sanitizeAscii(
    req.body?.token ?? req.body?.specialist_tutor_token ?? req.body?.child_interactive_token
  );
  if (!token) {
    res.status(400).json({ error: 'TOKEN_REQUIRED' });
    return;
  }

  const isSpecialist = /^AUN-SPC-/i.test(token);
  const isChild = /^AUN-CHD-/i.test(token);
  const isEnglish = /^AUN-ENG-/i.test(token);
  if (!isSpecialist && !isChild && !isEnglish) {
    res.status(400).json({ error: 'INVALID_TOKEN_FORMAT' });
    return;
  }

  const { apiKey, baseId, specialistsTable, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  try {
    if (isSpecialist) {
      const record = await findRecordByTokenField(
        apiKey,
        baseId,
        specialistsTable,
        SP.specialist_tutor_token,
        token
      );
      if (!record) {
        res.status(401).json({
          error: 'TOKEN_NOT_FOUND',
          hint: 'Check Specialists.specialist_tutor_token',
          baseId,
          table: specialistsTable,
        });
        return;
      }

      const session = buildSpecialistSession(record, token);
      if (!session) {
        res.status(403).json({ error: 'SPECIALIST_INACTIVE' });
        return;
      }

      res.status(200).json({ ok: true, kind: 'specialist', session });
      return;
    }

    if (isEnglish) {
      const record = await findRecordByTokenField(
        apiKey,
        baseId,
        studentsTable,
        SF.student_english_token,
        token
      );
      if (!record) {
        res.status(401).json({
          error: 'TOKEN_NOT_FOUND',
          hint: 'Check Students.student_english_token',
          baseId,
          table: studentsTable,
        });
        return;
      }

      const englishStudent = buildEnglishPayload(record, token);
      if (!englishStudent) {
        res.status(403).json({ error: 'STUDENT_INACTIVE' });
        return;
      }

      res.status(200).json({ ok: true, kind: 'english', record: englishStudent });
      return;
    }

    const record = await findRecordByTokenField(
      apiKey,
      baseId,
      studentsTable,
      SF.child_interactive_token,
      token
    );
    if (!record) {
      res.status(401).json({
        error: 'TOKEN_NOT_FOUND',
        hint: 'Check Students.child_interactive_token',
        baseId,
        table: studentsTable,
      });
      return;
    }

    const student = buildChildPayload(record, token);
    if (!student) {
      res.status(403).json({ error: 'STUDENT_INACTIVE' });
      return;
    }

    res.status(200).json({ ok: true, kind: 'child', record: student });
  } catch (err) {
    console.error('[tawasul/verify-token]', err?.message);
    res.status(502).json({ error: err?.message ?? 'VERIFY_FAILED' });
  }
}
````

## File: api/tawasul/[action].js
````javascript
/**
 * /api/tawasul/* — consolidated router (single Serverless Function on Hobby plan).
 * Handlers live in api/_handlers/tawasul/ (self-contained, no sovereign import chain).
 */

import { createActionRouter } from '../_handlers/dispatch.js';
import verifyToken from '../_handlers/tawasul/verify-token.js';
import caseload from '../_handlers/tawasul/caseload.js';
import mirror from '../_handlers/tawasul/mirror.js';
import studentGoal from '../_handlers/tawasul/student-goal.js';
import assessmentSync from '../_handlers/tawasul/assessment-sync.js';

export default createActionRouter({
  'verify-token': { POST: verifyToken },
  caseload: { POST: caseload },
  mirror: { POST: mirror },
  'student-goal': { POST: studentGoal },
  'assessment-sync': { POST: assessmentSync },
});
````

## File: src/lib/airtableFields.js
````javascript
/**
 * Canonical Airtable column names — snake_case English only (fixed, no env overrides).
 * Table/base IDs remain configurable via VITE_AIRTABLE_* in airtableTables.js / airtable.js.
 *
 * Wave 3 — July 2026 Constitution: identity vault + triple access + assessment funnel.
 * Live ops: docs/SOVEREIGN_OPERATIONS_LOG.md · aunak.vercel.app
 */

/** Wave 3 — digital identity vault (Students table) */
export const STUDENT_IDENTITY_VAULT = {
  /** Free quick-assessment score (Number 0–100) */
  initial_assessment_score: 'initial_assessment_score',
  /** Comprehensive assessment lifecycle — defaults not_started */
  comprehensive_assessment_status: 'comprehensive_assessment_status',
};

/** Wave 3 — triple sovereign device tokens (one activation → three portals) */
export const TRIPLE_ACCESS = {
  parent: 'parent_access_token',
  child: 'child_interactive_token',
  specialist: 'specialist_tutor_token',
};

/**
 * Wave 4 — English Talk Island (isolated pronunciation track, snake_case).
 * Mirrors the Tawasul isolated architecture: one encrypted token unlocks the
 * live speaking games interface, live speech is captured, accuracy is scored.
 */
export const ENGLISH_ISLAND = {
  /** Encrypted sub-token — direct entry to the games interface (AUN-ENG-{32hex}) */
  student_english_token: 'student_english_token',
  /** Latest phrase the student spoke aloud (Long Text) */
  last_spoken_text: 'last_spoken_text',
  /** Pronunciation accuracy 0–100, refreshed live each attempt (Number) */
  pronunciation_accuracy: 'pronunciation_accuracy',
};

/** Students table */
export const STUDENT = {
  name: "student_name",
  id: "student_id",
  age: "age",
  diagnosis: "diagnosis",
  parent_phone: "parent_phone",
  parent_country_code: "parent_country_code",
  preferred_destination: "preferred_destination",
  subscription_status: "subscription_status",
  face_biometric: "face_biometric",
  biometric_status: "biometric_status",
  status: "status",
  harmony_score: "harmony_score",
  camera_access: "camera_access",
  assigned_class: "assigned_class",
  plan_code: "plan_code",
  subscription_expires_at: "subscription_expires_at",
  last_payment_at: "last_payment_at",
  payment_method: "payment_method",
  activation_code_used: "activation_code_used",
  session_start_time: "session_start_time",
  clinical_session_status: "clinical_session_status",
  smart_session_fields: "smart_session_fields",
  clinical_session_notes: "clinical_session_notes",
  biometric_attendance_verified: "biometric_attendance_verified",
  biometric_attendance_at: "biometric_attendance_at",
  academic_progress: "academic_progress",
  behavior_intensity: "behavior_intensity",
  focus_level: "focus_level",
  t_static: "t_static",
  eye_movement_map: "eye_movement_map",
  programmed_goal: "programmed_goal",
  ai_session_report: "ai_session_report",
  payment_status: "payment_status",
  session_fee: "session_fee",
  zero_point_report: "zero_point_report",
  improvement_index: "improvement_index",
  operating_efficiency: "operating_efficiency",
  initial_assessment_score: STUDENT_IDENTITY_VAULT.initial_assessment_score,
  comprehensive_assessment_status: STUDENT_IDENTITY_VAULT.comprehensive_assessment_status,
  parent_access_token: TRIPLE_ACCESS.parent,
  child_interactive_token: TRIPLE_ACCESS.child,
  specialist_tutor_token: TRIPLE_ACCESS.specialist,
  /** Wave 4 — English Talk Island isolated track */
  student_english_token: ENGLISH_ISLAND.student_english_token,
  last_spoken_text: ENGLISH_ISLAND.last_spoken_text,
  pronunciation_accuracy: ENGLISH_ISLAND.pronunciation_accuracy,
  /** Link → Specialists (Tawasul MVP per-specialist caseload isolation) */
  assigned_specialist: "assigned_specialist",
  /** Ghost Mirror — specialist → child live commands */
  mirror_command: "mirror_command",
  mirror_payload: "mirror_payload",
};

/** Required Single-select options for Access Control table */
export const ACCESS_SELECT = {
  status: { active: "active" },
  access_level: { parent: "parent", admin: "admin", specialist: "specialist" },
};

export const STUDENT_SELECT = {
  status: { new: "new", active: "active" },
  subscription_status: { pending: "pending", active: "active" },
  preferred_destination: {
    media: "media",
    registry: "registry",
    community: "community",
    diagnostics: "diagnostics",
  },
  biometric_status: { approved: "approved" },
  comprehensive_assessment_status: {
    not_started: "not_started",
    in_progress: "in_progress",
    completed: "completed",
  },
};

/** Human checklist for Airtable Single-select setup */
export const STUDENT_SELECT_CHECKLIST = [
  "status: new, active",
  "subscription_status: pending, active",
  "preferred_destination: media, registry, community, diagnostics",
  "biometric_status: approved",
  "plan_code: free, tutor, medical, institution, assessment_only",
  "comprehensive_assessment_status: not_started, in_progress, completed",
  "mirror_command: echo_goal, drop_star, drop_reward, calm_pulse, clear",
  "mirror_payload: text",
  "initial_assessment_score: number (free quick scan 0–100)",
  "parent_access_token / child_interactive_token / specialist_tutor_token: AUN-{PRT|CHD|SPC}-{32hex}",
  "diagnosis: autism_spectrum, adhd, learning_difficulty, language_delay, under_assessment",
  "parent_country_code: text (dial digits, e.g. 966)",
  "student_english_token: text (AUN-ENG-{32hex}) — English Talk Island direct entry",
  "last_spoken_text: long text (latest spoken phrase captured live)",
  "pronunciation_accuracy: number (0–100 pronunciation accuracy, live)",
];

/** Daily Sessions table */
export const DAILY_SESSION = {
  session_date: "session_date",
  specialist_name: "specialist_name",
  student_name: "student_name",
  notes: "notes",
  claim_status: "claim_status",
  sealed_at: "sealed_at",
  specialist_signature: "specialist_signature",
  immutable_hash: "immutable_hash",
  session_sequence: "session_sequence",
  pin_verified: "pin_verified",
};

/** Access Control table */
export const ACCESS = {
  user_email: "user_email",
  user_name: "user_name",
  status: "status",
  permissions: "permissions",
  access_level: "access_level",
  access_areas: "access_areas",
  access_token: "access_token",
  last_login: "last_login",
};

/** Specialists table */
export const SPECIALIST = {
  name: "specialist_name",
  specialty: "specialty",
  email: "professional_email",
  phone: "contact_phone",
  admin_notes: "admin_notes",
  status: "status",
  cases: "active_cases",
  rating: "rating",
  specialist_tutor_token: TRIPLE_ACCESS.specialist,
  /** Link → Students (Tawasul MVP caseload — populated on Specialists row) */
  students: "Students",
};

/** Goal Attempts table */
export const GOAL_ATTEMPT = {
  student: "student",
  session_id: "session_id",
  session_date: "session_date",
  goal_label: "goal_label",
  goal_source: "goal_source",
  success_percent: "success_percent",
  attempt_number: "attempt_number",
  specialist_email: "specialist_email",
  attempt_notes: "attempt_notes",
  recorded_at: "recorded_at",
};

/** Summer Academy table */
export const SUMMER_ACADEMY = {
  student: "student",
  student_name: "student_name",
  event_type: "event_type",
  track: "track",
  silent_level: "silent_level",
  baseline_level: "baseline_level",
  current_level: "current_level",
  weak_points: "weak_points_json",
  daily_xp: "daily_xp",
  tasks_completed: "tasks_completed",
  total_xp: "total_xp",
  progress_json: "progress_json",
  recorded_at: "recorded_at",
  session_date: "session_date",
};

/** Scientific Items */
export const SCIENTIFIC_ITEM = {
  title: "title",
  category: "category",
  weight: "weight",
  usage: "usage_count",
};

/** ABC / Behavior Mod */
export const ABC = {
  case_id: "case_id",
  goal: "programmed_goal",
  behavior: "behavior",
  status: "status",
  intensity: "intensity",
  crisis_score: "crisis_score",
  risk_label: "risk_label",
};

/** Safe Media */
export const MEDIA = {
  title: "title",
  category: "category",
  duration: "duration",
  encrypted: "encrypted",
};

/** Melody Lab */
export const MELODY = {
  pattern_id: "pattern_id",
  name: "pattern_name",
  description: "description",
  score: "score",
  face_au: "face_au",
  emotional_link: "emotional_monitoring",
};

/** Community Resources */
export const RESOURCE = {
  title: "title",
  type: "resource_type",
  audience: "audience",
  downloads: "downloads",
  rating: "rating",
  summary: "summary",
};

/** Learning Difficulties */
export const LEARNING = {
  student: "student",
  goal: "programmed_goal",
  t_static: "t_static",
  focus_level: "focus_level",
  academic_progress: "academic_progress",
  notes: "intervention_notes",
  milestone: "weekly_milestone",
};

/** Emotional Monitoring */
export const EMOTION = {
  label: "mood_label",
  score: "score",
  insight: "intelligence_insight",
  preferred_pattern: "preferred_pattern",
  melody_link: "melody_pattern",
};
````

## File: src/lib/tawasulAuth.js
````javascript
import { fetchAirtableRecords, getField } from './airtable';
import { AIRTABLE_TABLES } from './airtableTables';
import { SPECIALIST as SP, STUDENT as SF } from './airtableFields';
import { ROLES } from './auth';
import { PLAN_CODES } from './plans';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

function buildSessionFromRecord(record, inputToken) {
  const f = record.fields ?? {};
  const status = String(getField(f, SP.status) ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  const name = getField(f, SP.name) || getField(f, 'Name') || 'أخصائي';
  const email = getField(f, SP.email) || getField(f, 'Email') || '';

  return {
    role: ROLES.SPECIALIST,
    // Tawasul merges all sovereign packages — top tier + manual override unlock everything.
    plan: PLAN_CODES.INSTITUTION,
    manualOverride: true,
    accessLevel: 'sovereign',
    name,
    email,
    specialistRecordId: record.id,
    specialistToken: normalizeToken(inputToken),
    tawasulMvp: true,
    landingSection: 'registry',
    dynamicSessionId: `TWS-${Date.now().toString(36)}`,
  };
}

/** Resolve specialist row by specialist_tutor_token (AUN-SPC-...) — local/dev fallback. */
export async function findSpecialistByToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-SPC-')) return null;

  const rows = await fetchAirtableRecords(AIRTABLE_TABLES.specialists);
  return (
    rows.find((r) => normalizeToken(getField(r.fields, SP.specialist_tutor_token)) === key) ||
    rows.find((r) => normalizeToken(getField(r.fields, SF.specialist_tutor_token)) === key) ||
    null
  );
}

async function verifyViaServer(inputToken) {
  const res = await fetch('/api/tawasul/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token: inputToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data?.session) return data.session;
  if (res.ok && data?.kind === 'specialist' && data?.session) return data.session;
  if (res.status === 401 || res.status === 403) return null;
  throw new Error(data?.error || `VERIFY_${res.status}`);
}

/** Build auth session for Tawasul MVP specialist gate. */
export async function verifyTawasulSpecialistToken(inputToken) {
  const key = normalizeToken(inputToken);
  if (!key.startsWith('AUN-SPC-')) return null;

  try {
    return await verifyViaServer(inputToken);
  } catch (serverErr) {
    if (import.meta.env.PROD) {
      console.error('[tawasulAuth] server verify failed:', serverErr?.message);
      return null;
    }
    const record = await findSpecialistByToken(inputToken);
    if (!record) return null;
    return buildSessionFromRecord(record, inputToken);
  }
}
````

## File: src/lib/tawasulConfig.js
````javascript
/**
 * Tawasul sovereign lab — neural empire sandbox (base app3vCT2j2JepNVZa).
 * Enable with VITE_TAWASUL_MVP=true or VITE_AIRTABLE_BASE_ID=app3vCT2j2JepNVZa at build time.
 */

export const TAWASUL_BRANCH = 'Tawasul_MVP';

/** Live Tawasul sandbox base (separate from sovereign production appaGfKj4vYhMw0cb). */
export const TAWASUL_BASE_ID = 'app3vCT2j2JepNVZa';

export function isTawasulSpecialistToken(token) {
  return /^AUN-SPC-/i.test(String(token ?? '').trim());
}

export function isTawasulMvp() {
  if (import.meta.env.VITE_TAWASUL_MVP === 'true') return true;
  const base = String(import.meta.env.VITE_AIRTABLE_BASE_ID ?? '').trim();
  return base === TAWASUL_BASE_ID;
}

/** Runtime path — always available even when sovereign build flag is off. */
export function isTawasulRoute() {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
  return path === '/tawasul' || path.startsWith('/tawasul/');
}

/** Child interactive route (/child?token=AUN-CHD-…) — the student interface surface. */
export function isTawasulChildRoute() {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
  return path === '/child' || path.startsWith('/child/');
}

/**
 * Full sovereign experience unlock — build flag, /tawasul route, or /child route.
 * Runtime-driven so every Aunak sovereign feature (Ghost Mirror, sovereign island,
 * audio, assessment) is open inside Tawasul even when the build-time flag is off.
 */
export function isTawasulExperience() {
  return isTawasulMvp() || isTawasulRoute() || isTawasulChildRoute();
}

/** Specialist shell: build-time Tawasul MVP or explicit /tawasul URL. */
export function shouldShowTawasulShell() {
  return isTawasulMvp() || isTawasulRoute();
}

/** Max caseload per specialist in sovereign sandbox. */
export const TAWASUL_MAX_CASES_PER_SPECIALIST = 5;

/** Total student slots in sovereign lab base. */
export const TAWASUL_MAX_STUDENTS = 10;

export const TAWASUL_COPY = {
  ar: {
    platform: 'عونك · تواصل',
    tagline: 'إمبراطورية عصبية — سيادة كاملة',
    specialistGate: 'دخول الأخصائي',
    tokenHint: 'أدخل رمز الأخصائي (specialist_tutor_token)',
    tokenInvalid: 'رمز غير صالح — تحقق من جدول الأخصائيين',
    myCases: 'حالاتي',
    dailyGoal: 'الهدف اليومي',
    saveGoal: 'حفظ الهدف',
    sessionsToday: 'جلسات مقفلة اليوم',
    childLink: 'رابط الطفل',
    logout: 'خروج',
  },
  en: {
    platform: 'Aunak · Tawasul',
    tagline: 'Neural empire — full sovereignty',
    specialistGate: 'Specialist login',
    tokenHint: 'Enter specialist_tutor_token',
    tokenInvalid: 'Invalid token — check Specialists table',
    myCases: 'My cases',
    dailyGoal: 'Daily goal',
    saveGoal: 'Save goal',
    sessionsToday: 'Sealed sessions today',
    childLink: 'Child link',
    logout: 'Logout',
  },
};
````

## File: api/_handlers/tawasul/assessment-sync.js
````javascript
/**
 * POST /api/tawasul/assessment-sync — self-contained (no broken ESM import chain).
 */

import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';
import { sanitizeRecordId } from './sanitize.js';

async function patchStudent(apiKey, baseId, tableId, recordId, fields) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: airtableHeaders(apiKey, { write: true }),
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(formatAirtableApiError(res.status, text));
  return JSON.parse(text);
}

function pickField(fields, ...keys) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return v;
  }
  return null;
}

function parseScore(raw) {
  if (raw == null || raw === '') return null;
  const n = Number(String(raw).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function goalFromScore(name, score, lang = 'ar') {
  const n = parseScore(score);
  if (n == null) return null;
  const band = n >= 70 ? 'balanced' : n >= 45 ? 'moderate' : 'elevated';
  const templates = {
    ar: {
      balanced: (who) => `🎯 ${who}: هدف اليوم — تعزيز التواصل البصري عبر لعبة الجزر (3 جولات هادئة).`,
      moderate: (who) => `🎯 ${who}: هدف إجرائي — تنظيم الانتباه · 5 تفاعلات في عالم الجزر + مكافأة نجمة.`,
      elevated: (who) => `🎯 ${who}: هدف عاجل — تهدئة ثم جذب انتباه · ابدأ بتبويب «هدوء» ثم «تفاعل» (5 نجوم).`,
    },
    en: {
      balanced: (who) => `🎯 ${who}: Daily goal — strengthen eye contact via island play (3 calm rounds).`,
      moderate: (who) => `🎯 ${who}: Programmed goal — attention regulation · 5 island interactions + star reward.`,
      elevated: (who) => `🎯 ${who}: Urgent goal — calm then engage · start Calm tab then Engage (5 stars).`,
    },
  };
  const who = String(name ?? 'الطفل').trim() || 'الطفل';
  const tpl = templates[lang]?.[band] ?? templates.ar[band];
  return tpl(who);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const recordId = sanitizeRecordId(req.body?.recordId);
  const fieldsIn = req.body?.fields && typeof req.body.fields === 'object' ? req.body.fields : {};

  if (!recordId) {
    res.status(400).json({ error: 'RECORD_ID_REQUIRED' });
    return;
  }

  try {
    const getUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${recordId}`;
    const getRes = await fetch(getUrl, { headers: airtableHeaders(apiKey) });
    const getText = await getRes.text();
    if (!getRes.ok) throw new Error(formatAirtableApiError(getRes.status, getText));
    const record = JSON.parse(getText);

    const merged = { ...(record.fields ?? {}), ...fieldsIn };
    const name = pickField(merged, 'Name', 'student_name') ?? 'الطفل';

    const patch = {};
    if (fieldsIn.initial_assessment_score != null) {
      patch[SF.initial_assessment_score] = parseScore(fieldsIn.initial_assessment_score);
    }
    if (fieldsIn.comprehensive_assessment_status != null) {
      patch[SF.comprehensive_assessment_status] = String(fieldsIn.comprehensive_assessment_status).trim();
    }

    const score = parseScore(fieldsIn.initial_assessment_score ?? merged[SF.initial_assessment_score]);
    const status = String(
      fieldsIn.comprehensive_assessment_status ??
        merged[SF.comprehensive_assessment_status] ??
        merged.comprehensive_assessment ??
        ''
    ).toLowerCase();
    const existingGoal = pickField(merged, SF.programmed_goal);
    const completed = /completed|complete|done|مكتمل/.test(status);

    if (score != null && completed && (!existingGoal || String(existingGoal).trim().length < 8)) {
      const autoGoal = goalFromScore(name, score, 'ar');
      if (autoGoal) {
        patch[SF.programmed_goal] = autoGoal;
        patch[SF.comprehensive_assessment_status] = 'completed';
      }
    }

    const updated = await patchStudent(apiKey, baseId, studentsTable, recordId, patch);
    res.status(200).json({
      ok: true,
      recordId: updated.id,
      programmed_goal: updated.fields?.[SF.programmed_goal] ?? null,
      autoGoal: Boolean(patch[SF.programmed_goal]),
    });
  } catch (err) {
    const message = err?.message ?? 'ASSESSMENT_SYNC_FAILED';
    console.error('[tawasul/assessment-sync]', message);
    res.status(500).json({ error: message });
  }
}
````

## File: api/_handlers/tawasul/caseload.js
````javascript
/**
 * POST /api/tawasul/caseload
 * Specialist dashboard — self-contained server handler (no src/lib/airtable import).
 */

import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { SPECIALIST as SP } from '../../../src/lib/airtableFields.js';
import { TAWASUL_MAX_CASES_PER_SPECIALIST } from '../../../src/lib/tawasulConfig.js';
import { readTawasulProgrammedGoal } from '../../../src/lib/tawasulStudentFields.js';
import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';

const MAX_CASES = TAWASUL_MAX_CASES_PER_SPECIALIST ?? 5;

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

function pickField(fields, ...keys) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return null;
}

function toIdList(raw) {
  if (raw == null || raw === '') return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((v) => (typeof v === 'string' ? v : v?.id))
    .filter((id) => id && /^rec[a-zA-Z0-9]{10,}$/.test(String(id)));
}

/** Safe read of Specialists → Students link (any casing / empty). */
function linkedStudentIdsFromSpecialist(specialistRecord) {
  const fields = specialistRecord?.fields;
  if (!fields || typeof fields !== 'object') return [];
  const raw =
    fields?.Students ??
    fields?.students ??
    fields?.[SP.students] ??
    fields?.assigned_specialist ??
    null;
  return toIdList(raw);
}

function mapStudentLite(record) {
  const f = record?.fields ?? {};
  return {
    id: record?.id ?? null,
    name: pickField(f, 'Name', SF.name, 'student_name', 'name') || 'طالب',
    childInteractiveToken: pickField(f, SF.child_interactive_token) || null,
    programmedGoal: readTawasulProgrammedGoal(f) || '',
    assignedSpecialistIds: toIdList(f?.[SF.assigned_specialist]),
    fields: f,
  };
}

function resolveCaseloadRows(allRecords, specialistRecord, specialistRecordId) {
  const mapped = (Array.isArray(allRecords) ? allRecords : [])
    .filter((r) => r?.id)
    .map(mapStudentLite);

  const linkedIds = linkedStudentIdsFromSpecialist(specialistRecord);
  if (linkedIds.length > 0) {
    const idSet = new Set(linkedIds);
    return mapped.filter((s) => s.id && idSet.has(s.id)).slice(0, MAX_CASES);
  }

  if (specialistRecordId) {
    const byAssigned = mapped
      .filter((s) => toIdList(s?.fields?.assigned_specialist ?? s?.assignedSpecialistIds).includes(specialistRecordId))
      .slice(0, MAX_CASES);
    if (byAssigned.length > 0) return byAssigned;
  }

  return [];
}

async function airtableGet(url, apiKey) {
  const res = await fetch(url, { headers: airtableHeaders(apiKey) });
  const text = await res.text();
  if (!res.ok) throw new Error(`AIRTABLE_${res.status}:${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function fetchSpecialistById(apiKey, baseId, tableId, recordId) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${recordId}`;
    return await airtableGet(url, apiKey);
  } catch (err) {
    if (String(err?.message ?? '').includes('AIRTABLE_404')) return null;
    throw err;
  }
}

async function findSpecialistByToken(apiKey, baseId, tableId, token) {
  const key = normalizeToken(token);
  const esc = key.replace(/'/g, "\\'");
  const formula = encodeURIComponent(`{${SP.specialist_tutor_token}}='${esc}'`);
  const filteredUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}&maxRecords=1`;

  try {
    const data = await airtableGet(filteredUrl, apiKey);
    if (data.records?.[0]) return data.records[0];
  } catch (err) {
    if (!String(err?.message ?? '').includes('422')) throw err;
  }

  const listUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?maxRecords=100`;
  const data = await airtableGet(listUrl, apiKey);
  return (
    (data.records ?? []).find(
      (r) =>
        normalizeToken(pickField(r?.fields, SP.specialist_tutor_token, 'specialist_tutor_token')) === key
    ) ?? null
  );
}

async function fetchStudentRecords(apiKey, baseId, tableId) {
  const records = [];
  let offset;
  do {
    const offsetQs = offset ? `&offset=${encodeURIComponent(offset)}` : '';
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?pageSize=100${offsetQs}`;
    const data = await airtableGet(url, apiKey);
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);
  return records;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const specialistToken = sanitizeAscii(
    req.body?.specialistToken ?? req.body?.specialist_tutor_token ?? req.body?.token
  );
  let specialistRecordId = sanitizeAscii(req.body?.specialistRecordId);

  if (!specialistRecordId && !specialistToken) {
    res.status(400).json({ ok: false, error: 'SPECIALIST_ID_OR_TOKEN_REQUIRED', students: [] });
    return;
  }

  const { apiKey, baseId, specialistsTable, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ ok: false, error: 'AIRTABLE_NOT_CONFIGURED', students: [] });
    return;
  }

  try {
    let specialistRecord = null;

    if (!specialistRecordId && specialistToken) {
      if (!/^AUN-SPC-/i.test(specialistToken)) {
        res.status(400).json({ ok: false, error: 'INVALID_SPECIALIST_TOKEN_FORMAT', students: [] });
        return;
      }
      specialistRecord = await findSpecialistByToken(
        apiKey,
        baseId,
        specialistsTable,
        specialistToken
      );
      if (!specialistRecord) {
        res.status(401).json({
          ok: false,
          error: 'SPECIALIST_NOT_FOUND',
          hint: 'Check Specialists.specialist_tutor_token',
          baseId,
          table: specialistsTable,
          students: [],
        });
        return;
      }
      specialistRecordId = specialistRecord.id;
    } else if (specialistRecordId) {
      specialistRecord = await fetchSpecialistById(
        apiKey,
        baseId,
        specialistsTable,
        specialistRecordId
      );
    }

    const records = await fetchStudentRecords(apiKey, baseId, studentsTable);
    const students = resolveCaseloadRows(records, specialistRecord, specialistRecordId);
    const linkedStudentIds = linkedStudentIdsFromSpecialist(specialistRecord);

    res.status(200).json({
      ok: true,
      specialistRecordId: specialistRecordId ?? null,
      linkedStudentIds,
      count: students.length,
      students,
    });
  } catch (err) {
    console.error('[tawasul/caseload]', err?.message ?? err);
    res.status(502).json({
      ok: false,
      error: err?.message ?? 'CASELOAD_FAILED',
      students: [],
    });
  }
}
````

## File: api/_handlers/tawasul/mirror.js
````javascript
/**
 * POST /api/tawasul/mirror — Ghost Mirror (self-contained server handler).
 */

import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';
import {
  sanitizeGoalText,
  sanitizeMirrorCommand,
  sanitizeMirrorPayload,
  sanitizeRecordId,
} from './sanitize.js';

const DEFAULT_PAYLOAD = {
  echo_goal: 'live',
  drop_star: 'star',
  drop_reward: 'reward',
  calm_pulse: '1',
  clear: 'clear',
};

function buildMirrorFields(command, payload, goalEcho) {
  const fields = {
    [SF.mirror_command]: command,
    [SF.mirror_payload]: payload,
  };
  if (command === 'echo_goal' && goalEcho) {
    fields[SF.programmed_goal] = goalEcho;
  }
  return fields;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentId = sanitizeRecordId(req.body?.studentId);
  const command = sanitizeMirrorCommand(req.body?.command);
  const payload = sanitizeMirrorPayload(req.body?.payload, DEFAULT_PAYLOAD[command] ?? '1');
  const goalEcho =
    command === 'echo_goal'
      ? sanitizeGoalText(req.body?.goalEcho ?? req.body?.goal ?? req.body?.programmed_goal)
      : '';

  if (!studentId || !command) {
    res.status(400).json({ error: 'STUDENT_ID_AND_COMMAND_REQUIRED' });
    return;
  }

  if (command === 'echo_goal' && !goalEcho) {
    res.status(400).json({ error: 'GOAL_TEXT_REQUIRED' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const fields = buildMirrorFields(command, payload, goalEcho);
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${studentId}`;

  try {
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: airtableHeaders(apiKey, { write: true }),
      body: JSON.stringify({ fields, typecast: true }),
    });
    const text = await patchRes.text();
    if (!patchRes.ok) throw new Error(formatAirtableApiError(patchRes.status, text));
    res.status(200).json({ ok: true, command, payload, table: studentsTable });
  } catch (err) {
    const message = err?.message ?? 'MIRROR_FAILED';
    console.error('[tawasul/mirror]', message);
    const status = /403|422|404/.test(message) ? 422 : 500;
    res.status(status).json({ error: message });
  }
}
````

## File: src/components/child/ChildInteractiveShell.jsx
````javascript
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { findStudentByChildToken, parseChildRouteToken } from '../../lib/childAccess';
import { isTawasulExperience } from '../../lib/tawasulConfig';
import { CHILD } from '../../lib/childTheme';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';
import { MIRROR_COMMANDS, mirrorFingerprint, parseMirrorState } from '../../lib/tawasulMirror';
import {
  clampSovereignStars,
  SOVEREIGN_CHILD_MAX_STARS,
} from '../../lib/childSessionBridge';
import {
  playCalmPulse,
  playGoalEcho,
  playStarDrop,
  playSuccessChime,
  playTaDaFanfare,
  playTypewriterEffect,
  startCalmDrone,
  startProcessingHum,
} from '../../lib/sovereignAudio';
import {
  enqueueAcademySpeech,
  scriptEncouragement,
  scriptWelcome,
  unlockAcademyVoice,
} from '../../lib/academyVoice';
import { useTawasulIdleGaze } from '../../hooks/useTawasulIdleGaze';
import ChildPlayZone from './ChildPlayZone';
import ChildBottomNav from './ChildBottomNav';
import ChildHomePanel from './ChildHomePanel';
import ChildCalmZone from './ChildCalmZone';
import ChildStarsPanel from './ChildStarsPanel';
import ChildAssessmentPanel from './ChildAssessmentPanel';
import ChildAvatar from './ChildAvatar';
import ChildCelebration from './ChildCelebration';
import ChildCalmOverlay from './ChildCalmOverlay';
import PlatformLogo from '../PlatformLogo';

export default function ChildInteractiveShell({ lang: langProp = 'ar' }) {
  const tawasul = isTawasulExperience();
  const theme = tawasul ? TAWASUL_CHILD : CHILD;
  const [lang, setLang] = useState(langProp);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [tab, setTab] = useState('home');
  const [starCount, setStarCount] = useState(0);
  const [gazeAlert, setGazeAlert] = useState('');
  const [rewardBurst, setRewardBurst] = useState(false);
  const [calmActive, setCalmActive] = useState(false);
  const mirrorSeenRef = useRef('');
  const welcomeSpokenRef = useRef(false);
  const humRef = useRef(null);
  const rewardTimerRef = useRef(null);
  const calmTimerRef = useRef(null);
  const calmDroneRef = useRef(null);

  const reloadStudent = useCallback(async () => {
    const token = parseChildRouteToken();
    if (!token) return null;
    const row = await findStudentByChildToken(token);
    if (row) setStudent(row);
    return row;
  }, []);

  const addStar = useCallback(() => {
    setStarCount((n) => {
      const next = clampSovereignStars(n + 1);
      if (next > n) {
        if (tawasul) playStarDrop();
        else playSuccessChime();
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 600);
      }
      return next;
    });
  }, [tawasul]);

  // Locked reward burst — only the specialist's success command unleashes it.
  const fireReward = useCallback(() => {
    setRewardBurst(true);
    playTaDaFanfare();
    if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
    rewardTimerRef.current = setTimeout(() => setRewardBurst(false), 4200);
  }, []);

  // Calming sensory pulse — fluid gradient takeover + soothing drone.
  const enterCalm = useCallback(() => {
    setTab('calm');
    setCalmActive(true);
    calmDroneRef.current?.stop?.();
    calmDroneRef.current = startCalmDrone();
    playCalmPulse();
    if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
    calmTimerRef.current = setTimeout(() => {
      setCalmActive(false);
      calmDroneRef.current?.stop?.();
      calmDroneRef.current = null;
    }, 30000);
  }, []);

  useEffect(
    () => () => {
      if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
      if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
      calmDroneRef.current?.stop?.();
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = parseChildRouteToken();
      if (!token) {
        setError(
          lang === 'en'
            ? 'Missing child token in URL (?token=AUN-CHD-...)'
            : 'رمز الطفل مفقود في الرابط (?token=AUN-CHD-...)'
        );
        setLoading(false);
        return;
      }
      try {
        const row = await findStudentByChildToken(token);
        if (cancelled) return;
        if (!row) {
          setError(lang === 'en' ? 'Invalid or inactive child token' : 'رمز الطفل غير صالح أو غير مفعّل');
        } else {
          setStudent(row);
        }
      } catch {
        if (!cancelled) setError(lang === 'en' ? 'Connection error' : 'خطأ في الاتصال');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    if (!tawasul || !student) return undefined;
    humRef.current = startProcessingHum();
    const unlock = () => unlockAcademyVoice();
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    return () => {
      humRef.current?.stop?.();
      document.removeEventListener('pointerdown', unlock);
    };
  }, [tawasul, student]);

  useEffect(() => {
    if (!tawasul || !student || welcomeSpokenRef.current) return;
    welcomeSpokenRef.current = true;
    const firstName = student.name?.split(' ')?.[0] ?? student.name ?? '';
    unlockAcademyVoice();
    enqueueAcademySpeech(scriptWelcome(firstName, lang), { lang, preferCloud: true });
  }, [tawasul, student, lang]);

  useEffect(() => {
    if (!tawasul || !student) return undefined;
    let stopped = false;
    const applyMirror = (row) => {
      if (stopped || !row?.fields) return;
      const mirror = parseMirrorState(row.fields);
      const fp = mirrorFingerprint(mirror);
      if (!mirror.command || fp === mirrorSeenRef.current) return;
      mirrorSeenRef.current = fp;

      if (mirror.command === MIRROR_COMMANDS.DROP_STAR || mirror.command === MIRROR_COMMANDS.DROP_REWARD) {
        addStar();
        fireReward();
      }
      if (mirror.command === MIRROR_COMMANDS.ECHO_GOAL) {
        setTab('home');
        playGoalEcho();
        // payload is a sentinel ('live'); the real goal is echoed into programmed_goal.
        const payloadGoal = mirror.payload?.trim();
        const spokenGoal =
          (payloadGoal && payloadGoal !== 'live' ? payloadGoal : '') ||
          row.programmedGoal?.trim() ||
          (lang === 'en' ? 'Your specialist set a new goal.' : 'هدف جديد من الأخصائي.');
        unlockAcademyVoice();
        enqueueAcademySpeech(spokenGoal, { lang, preferCloud: true });
      }
      if (mirror.command === MIRROR_COMMANDS.CALM_PULSE) {
        enterCalm();
      }
    };
    const t = setInterval(() => {
      reloadStudent()
        .then(applyMirror)
        .catch((err) => {
          if (import.meta.env?.DEV) console.warn('[child mirror] poll failed:', err?.message);
        });
    }, 3500);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [tawasul, student, reloadStudent, addStar, fireReward, enterCalm, lang]);

  useTawasulIdleGaze({
    active: tawasul && tab === 'play',
    onTrigger: () => {
      playTypewriterEffect(18);
      setGazeAlert(
        lang === 'en'
          ? '>> Gaze drift — typewriter cue activated…'
          : '>> شرد بصري — تفعيل صوت الآلة الكاتبة…'
      );
      setTimeout(() => setGazeAlert(''), 6000);
    },
  });

  const copy =
    lang === 'en'
      ? {
          title: tawasul ? 'Aunak Neural Empire' : 'Awni Play World',
          subtitle: tawasul ? 'Gold · Emerald · Sovereign flow' : 'Play · Learn · Smile',
          loading: 'Initializing neural island…',
        }
      : {
          title: tawasul ? 'عونك · الإمبراطورية العصبية' : 'عالم عوني',
          subtitle: tawasul ? 'ذهب · زمرد · نهر سيادي' : 'لعب · تعلّم · ابتسام',
          loading: 'تهيئة الجزيرة العصبية…',
        };

  const onStarEarned = () => {
    addStar();
    if (tawasul) {
      unlockAcademyVoice();
      enqueueAcademySpeech(scriptEncouragement(lang), { lang, preferCloud: false });
    }
  };

  const handleAssessmentComplete = () => {
    reloadStudent().then(() => setTab('home'));
  };

  if (loading) {
    return (
      <div className={theme.root}>
        {tawasul && <div className={TAWASUL_CHILD.sky} />}
        {!tawasul && <div className={CHILD.sky} />}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className={`w-12 h-12 animate-spin ${tawasul ? 'text-emerald-400' : 'text-orange-400'}`} />
          <p className={`font-bold ${tawasul ? 'text-[#e8c872]' : 'text-orange-600'}`}>{copy.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className={theme.root}>
        {tawasul ? <div className={TAWASUL_CHILD.sky} /> : <div className={CHILD.sky} />}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <span className="text-6xl mb-4">{tawasul ? '⚡' : '🧸'}</span>
          <p className={`text-lg font-bold ${tawasul ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  const firstName = student.name?.split(' ')?.[0] ?? student.name;

  return (
    <div className={theme.root} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {tawasul ? (
        <>
          <div className={TAWASUL_CHILD.sky} />
          <div className={TAWASUL_CHILD.grid} />
        </>
      ) : (
        <>
          <div className={CHILD.sky} />
          <div className={CHILD.bubbles} />
        </>
      )}
      {celebrate && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <Star className={`w-24 h-24 animate-ping opacity-80 ${tawasul ? 'text-[#e8c872]' : 'text-yellow-400'}`} />
        </div>
      )}
      {tawasul && <ChildCalmOverlay show={calmActive} lang={lang} />}
      {tawasul && <ChildCelebration show={rewardBurst} lang={lang} />}
      {gazeAlert && (
        <div className="fixed top-20 inset-x-4 z-40 mx-auto max-w-md rounded-xl border border-emerald-400/40 bg-[#0d0d10]/95 px-4 py-3 text-xs font-mono text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.2)]">
          {gazeAlert}
        </div>
      )}

      <header className={theme.header}>
        <PlatformLogo lang={lang} className="h-8 w-auto" iconClassName="w-8 h-8" />
        <div className="text-center">
          <h1 className={theme.title}>{copy.title}</h1>
          <p className={`text-xs font-bold ${tawasul ? 'text-emerald-400/90' : 'text-pink-500'}`}>{copy.subtitle}</p>
          {tawasul && (
            <p className="text-[10px] font-mono text-[#c9a962]/70 mt-0.5">
              {lang === 'en' ? `Stars ${starCount}/${SOVEREIGN_CHILD_MAX_STARS}` : `نجوم ${starCount}/${SOVEREIGN_CHILD_MAX_STARS}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
          className={`px-3 py-1 rounded-full font-bold text-sm ${
            tawasul ? 'bg-[#12121a]/80 border border-[#c9a962]/30 text-[#e8c872]' : 'bg-white/80 text-orange-500'
          }`}
        >
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
      </header>

      <main className={theme.main}>
        {tab === 'home' && (
          <div className={tawasul ? TAWASUL_CHILD.card : CHILD.card}>
            {tawasul ? (
              <div className="flex flex-col items-center gap-6">
                <ChildAvatar
                  mood={calmActive ? 'calm' : rewardBurst ? 'celebrate' : 'happy'}
                  onTap={() => {
                    unlockAcademyVoice();
                    enqueueAcademySpeech(scriptEncouragement(lang), { lang, preferCloud: false });
                  }}
                />
                <ChildHomePanel
                  lang={lang}
                  studentName={firstName}
                  programmedGoal={student.programmedGoal}
                  sovereign={tawasul}
                />
              </div>
            ) : (
              <ChildHomePanel
                lang={lang}
                studentName={firstName}
                programmedGoal={student.programmedGoal}
                sovereign={tawasul}
              />
            )}
          </div>
        )}
        {tab === 'play' && (
          <ChildPlayZone
            lang={lang}
            studentName={firstName}
            studentId={student.id}
            onCelebrate={onStarEarned}
            sovereignIsland={tawasul}
            starCap={tawasul ? SOVEREIGN_CHILD_MAX_STARS : null}
            globalStarCount={starCount}
          />
        )}
        {tab === 'assessment' && tawasul && (
          <ChildAssessmentPanel
            lang={lang}
            studentName={firstName}
            recordId={student.id}
            onComplete={handleAssessmentComplete}
            onGoalSynced={reloadStudent}
          />
        )}
        {tab === 'calm' && <ChildCalmZone lang={lang} sovereign={tawasul} />}
        {tab === 'stars' && (
          <ChildStarsPanel lang={lang} starCount={starCount} sovereign={tawasul} maxStars={SOVEREIGN_CHILD_MAX_STARS} />
        )}
      </main>

      <ChildBottomNav lang={lang} active={tab} onChange={setTab} sovereign={tawasul} />
    </div>
  );
}
````

## File: src/App.jsx
````javascript
import { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import AunakEcosystemHub from './components/AunakEcosystemHub';
import AunakGate from './components/AunakGate';
import AunakActivationGate from './components/AunakActivationGate';
import AunakSummerAcademy from './components/AunakSummerAcademy';
import ChildInteractiveShell from './components/child/ChildInteractiveShell';
import EnglishTalkIsland from './components/EnglishTalkIsland';
import ParentShell from './components/parent/ParentShell';
import PostActivationBiometric from './components/PostActivationBiometric';
import { AuthProvider, useAuth, isSubscriptionActive } from './lib/auth';
import { fetchStudents } from './lib/airtable';
import { needsActivationGate, activationGateReason } from './lib/subscriptionEngine';
import { landingForPlan, PLAN_CODES } from './lib/plans';
import { studentHasFaceBiometric } from './lib/biometricMatch';
import { Loader2 } from 'lucide-react';
import PaymentReturn from './components/PaymentReturn';
import { shouldShowTawasulShell } from './lib/tawasulConfig';
import TawasulGate from './components/tawasul/TawasulGate';
import TawasulHub from './components/tawasul/TawasulHub';

function isSummerAcademyRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/summer-academy' || path.startsWith('/summer-academy/');
}

function isChildPlayRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/child' || path.startsWith('/child/');
}

function isEnglishIslandRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/english' || path.startsWith('/english/');
}

function isParentDashboardRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/parent' || path.startsWith('/parent/');
}

function isPaymentReturnRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/payment/return' || path.startsWith('/payment/return');
}

function SummerAcademyShell() {
  const { user } = useAuth();
  if (!user) return <AunakGate />;
  return <AunakSummerAcademy />;
}

function GatedPlatform() {
  const { user, patchSession } = useAuth();
  const [biometricGate, setBiometricGate] = useState(null);

  useEffect(() => {
    if (!user?.childId) {
      setBiometricGate('skip');
      return;
    }
    if (!isSubscriptionActive(user.subscriptionRaw) && !user.subscriptionActivated) {
      setBiometricGate('skip');
      return;
    }
    let cancelled = false;
    fetchStudents()
      .then((students) => {
        if (cancelled) return;
        const row = students.find((s) => s.id === user.childId);
        setBiometricGate(studentHasFaceBiometric(row) ? 'done' : 'required');
      })
      .catch(() => {
        if (!cancelled) setBiometricGate('skip');
      });
    return () => {
      cancelled = true;
    };
  }, [user?.childId, user?.subscriptionRaw, user?.subscriptionActivated]);

  if (user?.tawasulMvp) {
    if (user?.sovereignFullView) {
      return (
        <>
          <AunakEcosystemHub />
          <button
            type="button"
            onClick={() => patchSession({ sovereignFullView: false })}
            className="fixed bottom-4 inset-x-0 mx-auto z-[60] w-fit flex items-center gap-2 px-4 py-2 rounded-full bg-[#12121a]/90 border border-cyan-500/40 text-cyan-200 text-xs font-bold backdrop-blur-md shadow-[0_0_24px_rgba(34,211,238,0.25)] hover:bg-[#12121a]"
          >
            ↩ العودة إلى تواصل
          </button>
        </>
      );
    }
    return (
      <TawasulHub
        lang="ar"
        onOpenSovereign={() => patchSession({ sovereignFullView: true })}
      />
    );
  }

  if (!user) return <AunakGate />;

  if (needsActivationGate(user)) {
    return (
      <>
        <div className="fixed inset-0 z-0 bg-[#0a0a0c]" aria-hidden>
          <div className="absolute inset-0 opacity-30 blur-xl bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.12)_0%,transparent_55%),radial-gradient(ellipse_at_70%_80%,rgba(201,169,98,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-4 rounded-3xl border border-white/[0.04] bg-[#12121a]/40" />
        </div>
        <AunakActivationGate
          studentId={user.childId ?? user.activeStudentId}
          childName={user.childName}
          reason={activationGateReason(user)}
          onActivated={(data) => {
            patchSession({
              subscriptionActivated: true,
              subscriptionRaw: 'Active',
              plan: data?.plan ?? user.plan,
              landingSection: data?.landing ?? landingForPlan(data?.plan),
              assessmentOnlyMode: data?.plan === PLAN_CODES.ASSESSMENT_ONLY,
            });
            setBiometricGate('required');
          }}
          onSkip={(data) => {
            patchSession({
              subscriptionActivated: true,
              subscriptionRaw: 'Active',
              plan: data?.plan ?? user.plan,
              landingSection: data?.landing ?? landingForPlan(data?.plan),
              assessmentOnlyMode: data?.plan === PLAN_CODES.ASSESSMENT_ONLY,
            });
            setBiometricGate('required');
          }}
        />
      </>
    );
  }

  if (biometricGate === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (biometricGate === 'required') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] p-6 flex flex-col items-center justify-center">
        <PostActivationBiometric
          lang="ar"
          recordId={user.childId ?? user.activeStudentId}
          studentName={user.childName}
          onComplete={() => setBiometricGate('done')}
        />
      </div>
    );
  }

  return <AunakEcosystemHub />;
}

function TawasulPlatform() {
  const { user } = useAuth();
  if (!user) return <TawasulGate lang="ar" />;
  return <TawasulHub lang="ar" />;
}

export default function App() {
  const tawasul = shouldShowTawasulShell();
  const summerRoute = isSummerAcademyRoute();
  const childRoute = isChildPlayRoute();
  const englishRoute = isEnglishIslandRoute();
  const parentRoute = isParentDashboardRoute();
  const paymentReturnRoute = isPaymentReturnRoute();

  return (
    <ErrorBoundary>
      <AuthProvider>
        {paymentReturnRoute ? (
          <PaymentReturn lang="ar" />
        ) : englishRoute ? (
          <EnglishTalkIsland />
        ) : childRoute ? (
          <ChildInteractiveShell />
        ) : tawasul ? (
          <TawasulPlatform />
        ) : parentRoute ? (
          <ParentShell />
        ) : summerRoute ? (
          <SummerAcademyShell />
        ) : (
          <GatedPlatform />
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}
````

## File: src/components/tawasul/TawasulMirrorPanel.jsx
````javascript
import { useCallback, useEffect, useRef, useState } from 'react';
import { Ghost, Loader2, Sparkles, Target, Volume2 } from 'lucide-react';
import { MIRROR_COMMANDS } from '../../lib/tawasulMirror';
import { STUDENT as SF } from '../../lib/airtableFields';
import { readTawasulApiError, tawasulFetchJson } from '../../lib/tawasulFetch';

async function sendMirror({ studentId, command, payload = '' }) {
  const { res, data } = await tawasulFetchJson('/api/tawasul/mirror', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: String(studentId ?? ''),
      command: String(command ?? ''),
      payload: String(payload ?? ''),
    }),
  });
  if (!res.ok) throw new Error(readTawasulApiError(data, res.status));
  return data;
}

async function sendEchoGoal({ studentId, goalText }) {
  const goalEcho = String(goalText ?? '').trim();
  if (!goalEcho) throw new Error('GOAL_TEXT_REQUIRED');

  const { res, data } = await tawasulFetchJson('/api/tawasul/mirror', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: String(studentId ?? ''),
      command: MIRROR_COMMANDS.ECHO_GOAL,
      payload: 'live',
      goalEcho,
    }),
  });
  if (!res.ok) throw new Error(readTawasulApiError(data, res.status));
  return data;
}

const IDLE_LOADING = {
  [MIRROR_COMMANDS.ECHO_GOAL]: false,
  [MIRROR_COMMANDS.DROP_STAR]: false,
  [MIRROR_COMMANDS.CALM_PULSE]: false,
};

export default function TawasulMirrorPanel({ lang = 'ar', student, goalDraft, onGoalSynced }) {
  const [loading, setLoading] = useState(IDLE_LOADING);
  const [error, setError] = useState('');
  const inFlightRef = useRef(null);

  useEffect(() => {
    setError('');
    inFlightRef.current = null;
    setLoading(IDLE_LOADING);
  }, [student?.id]);

  const copy =
    lang === 'en'
      ? {
          title: 'Ghost Mirror',
          echo: 'Echo goal on child screen',
          star: 'Drop star reward',
          calm: 'Calm pulse',
        }
      : {
          title: 'المرآة الشبحية',
          echo: 'تكرار الهدف على شاشة الطفل',
          star: 'إسقاط مكافأة نجمة',
          calm: 'نبضة هدوء',
        };

  const clearCommandLoading = useCallback((command) => {
    setLoading((prev) => ({ ...prev, [command]: false }));
  }, []);

  const releaseCommand = useCallback((command) => {
    inFlightRef.current = null;
    clearCommandLoading(command);
  }, [clearCommandLoading]);

  const runCommand = useCallback(
    async (command, apiCall, afterSuccess) => {
      if (!student?.id || inFlightRef.current) return;

      inFlightRef.current = command;
      setLoading((prev) => ({ ...prev, [command]: true }));
      setError('');

      try {
        await apiCall();
        clearCommandLoading(command);
        afterSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : readTawasulApiError(e, 'ERR'));
      } finally {
        releaseCommand(command);
      }
    },
    [clearCommandLoading, releaseCommand, student?.id]
  );

  useEffect(() => {
    return () => {
      inFlightRef.current = null;
    };
  }, []);

  const onEchoGoal = () => {
    const goalText = String(goalDraft ?? student?.programmedGoal ?? '').trim();
    runCommand(
      MIRROR_COMMANDS.ECHO_GOAL,
      () => sendEchoGoal({ studentId: student.id, goalText }),
      () => onGoalSynced?.(goalText)
    );
  };

  const onDropStar = () => {
    runCommand(MIRROR_COMMANDS.DROP_STAR, () =>
      sendMirror({
        studentId: student.id,
        command: MIRROR_COMMANDS.DROP_STAR,
        payload: 'star',
      })
    );
  };

  const onCalmPulse = () => {
    runCommand(MIRROR_COMMANDS.CALM_PULSE, () =>
      sendMirror({
        studentId: student.id,
        command: MIRROR_COMMANDS.CALM_PULSE,
        payload: '1',
      })
    );
  };

  const anyLoading = Object.values(loading).some(Boolean);

  const mergeBtn = (isLoading, activeCls, idleCls) =>
    `flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
      isLoading ? activeCls : idleCls
    }`;

  return (
    <div className="rounded-xl border border-[#c9a962]/25 bg-[#0d0d10]/60 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-[#e8c872]">
        <Ghost className="w-4 h-4" />
        {copy.title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          disabled={loading[MIRROR_COMMANDS.ECHO_GOAL] || (anyLoading && !loading[MIRROR_COMMANDS.ECHO_GOAL])}
          onClick={onEchoGoal}
          aria-busy={loading[MIRROR_COMMANDS.ECHO_GOAL]}
          className={mergeBtn(
            loading[MIRROR_COMMANDS.ECHO_GOAL],
            'bg-[#c9a962]/25 border-2 border-[#c9a962]/60 text-[#e8c872] ring-2 ring-[#c9a962]/20',
            'bg-[#c9a962]/10 border border-[#c9a962]/30 text-[#e8c872] hover:bg-[#c9a962]/15'
          )}
        >
          {loading[MIRROR_COMMANDS.ECHO_GOAL] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
          {copy.echo}
        </button>
        <button
          type="button"
          disabled={loading[MIRROR_COMMANDS.DROP_STAR] || (anyLoading && !loading[MIRROR_COMMANDS.DROP_STAR])}
          onClick={onDropStar}
          aria-busy={loading[MIRROR_COMMANDS.DROP_STAR]}
          className={mergeBtn(
            loading[MIRROR_COMMANDS.DROP_STAR],
            'bg-emerald-500/25 border-2 border-emerald-400/60 text-emerald-200 ring-2 ring-emerald-400/20',
            'bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/15'
          )}
        >
          {loading[MIRROR_COMMANDS.DROP_STAR] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {copy.star}
        </button>
        <button
          type="button"
          disabled={loading[MIRROR_COMMANDS.CALM_PULSE] || (anyLoading && !loading[MIRROR_COMMANDS.CALM_PULSE])}
          onClick={onCalmPulse}
          aria-busy={loading[MIRROR_COMMANDS.CALM_PULSE]}
          className={mergeBtn(
            loading[MIRROR_COMMANDS.CALM_PULSE],
            'bg-cyan-500/25 border-2 border-cyan-400/60 text-cyan-100 ring-2 ring-cyan-400/20',
            'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/15'
          )}
        >
          {loading[MIRROR_COMMANDS.CALM_PULSE] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Target className="w-3 h-3" />
          )}
          {copy.calm}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <p className="text-[10px] text-slate-500 font-mono">
        mirror → {SF.programmed_goal} + {SF.mirror_command}
      </p>
    </div>
  );
}
````

## File: src/lib/airtableMappers.js
````javascript
import { getField, parseHarmonyScore } from "./airtable";
import { STUDENT as SF, ABC, MEDIA, MELODY, RESOURCE, LEARNING, EMOTION, SCIENTIFIC_ITEM, SPECIALIST, ACCESS, GOAL_ATTEMPT as GA } from "./airtableFields";

function pick(fields, key) {
  if (!fields || !key) return null;
  const v = getField(fields, key);
  if (v != null && v !== "") return v;
  return null;
}

function pickNumber(fields, key) {
  const raw = pick(fields, key);
  if (raw == null) return null;
  const n = Number(String(raw).replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function firstTitle(fields) {
  const skip = new Set(["id", "created", "modified"]);
  for (const [k, v] of Object.entries(fields || {})) {
    if (skip.has(k.toLowerCase())) continue;
    if (typeof v === "string" && v.trim().length > 2) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function isRecordId(value) {
  if (value == null) return false;
  return String(value)
    .split(",")
    .every((part) => /^rec[a-zA-Z0-9]{10,}$/.test(part.trim()));
}

function pickDisplay(fields, key) {
  const value = pick(fields, key);
  if (value == null || value === "" || isRecordId(value)) return null;
  return value;
}

function pickLinkedIds(fields, key) {
  const raw = pick(fields, key);
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === "string" ? v : v?.id))
      .filter((id) => id && /^rec[a-zA-Z0-9]{10,}$/.test(String(id)));
  }
  return String(raw)
    .split(",")
    .map((part) => part.trim())
    .filter((id) => /^rec[a-zA-Z0-9]{10,}$/.test(id));
}

function pickLinkedId(fields, key) {
  const raw = pick(fields, key);
  if (raw == null || raw === "") return null;
  const first = String(raw).split(",")[0]?.trim();
  return first && /^rec[a-zA-Z0-9]{10,}$/.test(first) ? first : null;
}

function pickBoolean(fields, key) {
  const raw = pick(fields, key);
  if (raw == null) return false;
  return String(raw).toLowerCase() === "true" || raw === "1";
}

export const EYE_MAP_COLS = 7;
export const EYE_MAP_ROWS = 4;
export const EYE_MAP_CELL_COUNT = EYE_MAP_COLS * EYE_MAP_ROWS;

/** Parse eye-tracking heatmap from Airtable (JSON array, CSV, or number list). */
export function parseEyeMapData(raw) {
  if (raw == null || raw === "") return null;

  const normalize = (nums) => {
    if (!nums.length) return null;
    return Array.from({ length: EYE_MAP_CELL_COUNT }, (_, i) => {
      const v = nums[i % nums.length];
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.min(1, Math.max(0, n > 1 ? n / 100 : n));
    });
  };

  if (Array.isArray(raw)) {
    return normalize(raw.map((v) => Number(v)).filter((n) => Number.isFinite(n)));
  }

  const str = String(raw).trim();
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parseEyeMapData(parsed);
  } catch {
    /* fall through */
  }

  const parts = str
    .split(/[,;|\s]+/)
    .map((p) => Number(String(p).replace(/%/g, "").trim()))
    .filter((n) => Number.isFinite(n));
  return parts.length >= 4 ? normalize(parts) : null;
}

export function mapScientificItem(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    title: pick(f, SCIENTIFIC_ITEM.title) || firstTitle(f) || (lang === "en" ? "Untitled item" : "بند بدون عنوان"),
    category: pick(f, SCIENTIFIC_ITEM.category) || (lang === "en" ? "Uncategorized" : "غير مصنف"),
    weight: pickNumber(f, SCIENTIFIC_ITEM.weight),
    usage: pickNumber(f, SCIENTIFIC_ITEM.usage) ?? 0,
    fields: f,
  };
}

export function mapSpecialist(record, lang = "ar") {
  const f = record?.fields ?? {};
  const specialty = pick(f, SPECIALIST.specialty) || "—";
  const name = pick(f, SPECIALIST.name) || firstTitle(f) || null;
  return {
    id: record.id,
    name: name || (lang === "en" ? "Specialist" : "أخصائي"),
    specialty,
    email: pick(f, SPECIALIST.email) || "",
    phone: pick(f, SPECIALIST.phone) || "",
    adminNotes: pick(f, SPECIALIST.admin_notes) || "",
    status: pick(f, SPECIALIST.status) || (lang === "en" ? "Unspecified" : "غير محدد"),
    cases: pickNumber(f, SPECIALIST.cases) ?? null,
    rating: pickNumber(f, SPECIALIST.rating) ?? null,
    fields: f,
  };
}

export function mapStudent(record, lang = "ar") {
  const f = record?.fields ?? {};
  const harmonyRaw = pick(f, SF.harmony_score);
  const cameraAccessIds = pickLinkedIds(f, SF.camera_access);
  const preferredRaw = pick(f, SF.preferred_destination);
  return {
    id: record.id,
    name: pick(f, SF.name) || pick(f, 'Name') || firstTitle(f) || (lang === "en" ? "Unknown student" : "اسم غير معروف"),
    studentCode: pick(f, SF.id) || null,
    parentPhone: pick(f, SF.parent_phone) || null,
    parentCountryCode: pick(f, SF.parent_country_code) || null,
    status: pick(f, SF.status) || null,
    preferredLanding: preferredRaw != null ? String(preferredRaw).trim() : null,
    faceBiometric: pick(f, SF.face_biometric) || null,
    biometricCaptureStatus: pick(f, SF.biometric_status) || null,
    diagnosis: pick(f, SF.diagnosis) || null,
    age: pickNumber(f, SF.age) ?? null,
    assignedClass: pick(f, SF.assigned_class) || null,
    harmonyScore: parseHarmonyScore(harmonyRaw),
    eyeMapData: parseEyeMapData(pick(f, SF.eye_movement_map)) ?? null,
    cameraAccessIds,
    programmedGoal: pick(f, SF.programmed_goal) || null,
    improvementIndex: pickNumber(f, SF.improvement_index) ?? null,
    academicProgress: pickNumber(f, SF.academic_progress) ?? null,
    behaviorIntensity: pickNumber(f, SF.behavior_intensity) ?? null,
    focusLevel: pickNumber(f, SF.focus_level) ?? null,
    tStatic: pickNumber(f, SF.t_static) ?? null,
    operatingEfficiency: pickNumber(f, SF.operating_efficiency) ?? null,
    initialAssessmentScore: pickNumber(f, SF.initial_assessment_score) ?? pick(f, SF.initial_assessment_score),
    comprehensiveAssessmentStatus: pick(f, SF.comprehensive_assessment_status) || null,
    parentAccessToken: pick(f, SF.parent_access_token) || null,
    childInteractiveToken: pick(f, SF.child_interactive_token) || null,
    specialistTutorToken: pick(f, SF.specialist_tutor_token) || null,
    studentEnglishToken: pick(f, SF.student_english_token) || null,
    lastSpokenText: pick(f, SF.last_spoken_text) || null,
    pronunciationAccuracy: pickNumber(f, SF.pronunciation_accuracy) ?? null,
    assignedSpecialistIds: (() => {
      const raw = pick(f, SF.assigned_specialist);
      if (raw == null || raw === "") return [];
      return Array.isArray(raw) ? raw : [raw];
    })(),
    fields: f,
  };
}

export function mapAbcPlan(record, lang = "ar") {
  const f = record?.fields ?? {};
  const caseId = pickNumber(f, ABC.case_id);
  const crisisScore = pickNumber(f, ABC.crisis_score);
  const riskLabel = pick(f, ABC.risk_label);
  return {
    id: record.id,
    title:
      pick(f, ABC.goal) ||
      (caseId != null ? (lang === "en" ? `Case #${caseId}` : `حالة #${caseId}`) : null) ||
      firstTitle(f) ||
      (lang === "en" ? "Intervention plan" : "خطة تدخل"),
    behavior:
      pick(f, ABC.behavior) ||
      (crisisScore != null
        ? lang === "en"
          ? `Crisis score: ${crisisScore}`
          : `درجة الأزمة: ${crisisScore}`
        : "—"),
    status: pick(f, ABC.status) || (riskLabel != null && riskLabel !== "" ? String(riskLabel) : lang === "en" ? "Unspecified" : "غير محدد"),
    intensity: pick(f, ABC.intensity) || (crisisScore != null ? String(crisisScore) : "—"),
    fields: f,
  };
}

export function mapMedia(record, lang = "ar") {
  const f = record?.fields ?? {};
  const category = pick(f, MEDIA.category) || (lang === "en" ? "General" : "عام");
  const enc = pick(f, MEDIA.encrypted);
  return {
    id: record.id,
    title: pick(f, MEDIA.title) || (category !== "—" && category !== "General" && category !== "عام" ? category : null) || firstTitle(f) || (lang === "en" ? "Clip" : "مقطع"),
    category,
    duration: pick(f, MEDIA.duration) || "—",
    encrypted: enc == null ? true : String(enc).toLowerCase() !== "false" && enc !== "0",
    fields: f,
  };
}

export function mapMelodyPattern(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    patternId: pick(f, MELODY.pattern_id) || record.id,
    name: pick(f, MELODY.name) || firstTitle(f) || (lang === "en" ? "Audio pattern" : "نمط صوتي"),
    desc: pick(f, MELODY.description) || "",
    score: pickNumber(f, MELODY.score) ?? 0,
    au: pickDisplay(f, MELODY.face_au) || "—",
    linkedEmotionId: pickLinkedId(f, MELODY.emotional_link),
    fields: f,
  };
}

export function mapResource(record, lang = "ar") {
  const f = record?.fields ?? {};
  const type = pick(f, RESOURCE.type) || (lang === "en" ? "General" : "عام");
  return {
    id: record.id,
    title:
      pick(f, RESOURCE.title) ||
      (type !== "—" && type !== "General" && type !== "عام"
        ? lang === "en"
          ? `${type} resource`
          : `مورد ${type}`
        : null) ||
      firstTitle(f) ||
      (lang === "en" ? "Resource" : "مورد"),
    type,
    audience: pick(f, RESOURCE.audience) || "—",
    downloads: pickNumber(f, RESOURCE.downloads) ?? 0,
    rating: pickNumber(f, RESOURCE.rating) ?? null,
    summary: pick(f, RESOURCE.summary) || "",
    fields: f,
  };
}

export function mapAccessUser(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    name: pick(f, ACCESS.user_name) || firstTitle(f) || (lang === "en" ? "User" : "مستخدم"),
    role: pick(f, ACCESS.access_level) || "—",
    email: pick(f, ACCESS.user_email) || "",
    access: pick(f, ACCESS.permissions) || pick(f, ACCESS.access_areas) || "—",
    lastLogin: pick(f, ACCESS.last_login) || "—",
    fields: f,
  };
}

export function mapLearningRecord(record, lang = "ar") {
  const f = record?.fields ?? {};
  const goalLabel = pick(f, LEARNING.goal) || null;
  const studentLinkedId = pickLinkedId(f, LEARNING.student);
  return {
    id: record.id,
    studentLinkedId,
    goalLabel,
    label: goalLabel || (lang === "en" ? "Learning session" : "جلسة تعليمية"),
    tStatic: pickNumber(f, LEARNING.t_static) ?? null,
    focusLevel: pickNumber(f, LEARNING.focus_level) ?? null,
    academicProgress: pickNumber(f, LEARNING.academic_progress) ?? null,
    notes: pick(f, LEARNING.notes) || "",
    milestone: pick(f, LEARNING.milestone) || null,
    fields: f,
  };
}

export function mapGoalAttempt(record, _lang = "ar") {
  const f = record?.fields ?? {};
  const goalLabel = pick(f, GA.goal_label);
  const goalSource = pick(f, GA.goal_source);
  return {
    id: record.id,
    studentLinkedId: pickLinkedId(f, GA.student),
    sessionId: pick(f, GA.session_id),
    sessionDate: pick(f, GA.session_date),
    goalLabel,
    goalSource,
    goalKey: goalSource && goalLabel ? `${goalSource}:${goalLabel}` : goalLabel,
    successPercent: pickNumber(f, GA.success_percent) ?? null,
    attemptNumber: pickNumber(f, GA.attempt_number) ?? null,
    specialistEmail: pick(f, GA.specialist_email) || null,
    attemptNotes: pick(f, GA.attempt_notes) || null,
    recordedAt: pick(f, GA.recorded_at) || null,
    fields: f,
  };
}

export function mapEmotionSignal(record, lang = "ar") {
  const f = record?.fields ?? {};
  const linkedPatternId = pickLinkedId(f, EMOTION.melody_link);
  const preferredPattern = pickBoolean(f, EMOTION.preferred_pattern);
  const label = pickDisplay(f, EMOTION.label) || null;
  const id = label ? String(label).toLowerCase().replace(/\s+/g, "_").slice(0, 32) : record.id;
  return {
    id: record.id,
    emotionId: id,
    label,
    linkedPatternId,
    preferredPattern,
    score: pickNumber(f, EMOTION.score),
    note: pickDisplay(f, EMOTION.insight) || "",
    fields: f,
  };
}

export { parseHarmonyScore };
````

## File: src/components/tawasul/TawasulHub.jsx
````javascript
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Crown, ExternalLink, Loader2, LogOut, Save, Target, Users } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { TAWASUL_COPY } from '../../lib/tawasulConfig';
import { readTawasulApiError, tawasulFetchJson } from '../../lib/tawasulFetch';
import PlatformLogo from '../PlatformLogo';
import TawasulMirrorPanel from './TawasulMirrorPanel';

function childUrl(token) {
  if (typeof window === 'undefined' || !token) return '';
  const base = window.location.origin.replace(/\/$/, '');
  return `${base}/child?token=${encodeURIComponent(token)}`;
}

/** Normalize caseload rows from /api/tawasul/caseload (mapped or raw Airtable fields). */
function normalizeCaseloadStudent(row) {
  if (!row || typeof row !== 'object') return null;
  const fields = row.fields && typeof row.fields === 'object' ? row.fields : {};
  const name =
    (typeof row.name === 'string' ? row.name : null) ||
    fields.Name ||
    fields.student_name ||
    fields.name ||
    'طالب';
  const childInteractiveToken =
    row.childInteractiveToken ||
    fields.child_interactive_token ||
    null;
  const programmedGoal =
    row.programmedGoal ||
    fields.programmed_goal ||
    '';
  return {
    ...row,
    id: row.id,
    name: String(name).trim() || 'طالب',
    childInteractiveToken: childInteractiveToken ? String(childInteractiveToken).trim() : null,
    programmedGoal: String(programmedGoal),
    fields,
  };
}

function extractCaseloadList(data) {
  const raw = data?.students ?? data?.records;
  if (Array.isArray(raw)) return raw.map(normalizeCaseloadStudent).filter(Boolean);
  if (raw && typeof raw === 'object' && raw.id) return [normalizeCaseloadStudent(raw)].filter(Boolean);
  return [];
}

function studentLabel(student) {
  return student?.name || student?.fields?.Name || student?.fields?.student_name || '—';
}

function studentChildToken(student) {
  return (
    student?.childInteractiveToken ||
    student?.fields?.child_interactive_token ||
    null
  );
}

async function saveStudentGoal(recordId, programmedGoal) {
  const { res, data } = await tawasulFetchJson('/api/tawasul/student-goal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recordId, programmed_goal: String(programmedGoal ?? '').trim() }),
  });
  if (!res.ok) throw new Error(readTawasulApiError(data, res.status));
  return data;
}

export default function TawasulHub({ lang = 'ar', onOpenSovereign }) {
  const { user, logout } = useAuth();
  const copy = TAWASUL_COPY[lang] ?? TAWASUL_COPY.ar;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [goalDraft, setGoalDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const saveInFlightRef = useRef(false);

  const stopSaving = useCallback(() => {
    saveInFlightRef.current = false;
    setSaving(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { res, data } = await tawasulFetchJson('/api/tawasul/caseload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistRecordId: user?.specialistRecordId,
          specialistToken: user?.specialistToken,
        }),
      });
      if (!res.ok) throw new Error(readTawasulApiError(data, res.status));
      const caseload = extractCaseloadList(data);
      setStudents(caseload);
      setSelectedId((prev) => prev ?? caseload[0]?.id ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : readTawasulApiError(e, 'ERR');
      setLoadError(msg || 'Failed to load caseload');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [user?.specialistRecordId, user?.specialistToken]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) ?? students[0] ?? null,
    [students, selectedId]
  );

  useEffect(() => {
    if (selected) setGoalDraft(selected.programmedGoal ?? '');
  }, [selected?.id, selected?.programmedGoal]);

  const saveGoal = useCallback(async () => {
    const recordId = selected?.id;
    const goal = goalDraft.trim();
    if (!recordId || saveInFlightRef.current) return;

    saveInFlightRef.current = true;
    setSaving(true);
    setSaveError('');

    try {
      await saveStudentGoal(recordId, goal);
      stopSaving();
      setStudents((prev) =>
        prev.map((s) => (s.id === recordId ? { ...s, programmedGoal: goal } : s))
      );
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : readTawasulApiError(e, 'SAVE'));
    } finally {
      stopSaving();
    }
  }, [goalDraft, selected?.id, stopSaving]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-cyan-500/15 bg-[#12121a]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlatformLogo lang={lang} className="h-8 w-auto" />
          <div>
            <h1 className="text-lg font-black text-cyan-300">{copy.platform}</h1>
            <p className="text-xs text-slate-500">{user?.name ?? copy.myCases}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenSovereign && (
            <button
              type="button"
              onClick={onOpenSovereign}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-400/40 bg-gradient-to-l from-amber-500/20 to-[#c9a962]/15 text-xs font-bold text-amber-200 hover:from-amber-500/30 hover:to-[#c9a962]/25 transition-colors shadow-[0_0_18px_rgba(201,169,98,0.15)]"
              title={lang === 'en' ? 'Open the full sovereign platform' : 'الدخول إلى المنصة السيادية الكاملة'}
            >
              <Crown className="w-4 h-4" />
              {lang === 'en' ? 'Full Sovereign Platform' : 'المنصة السيادية الكاملة'}
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            {copy.logout}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid gap-4 md:grid-cols-[280px_1fr]">
        <section className="rounded-2xl border border-white/10 bg-[#12121a]/60 p-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-300">
            <Users className="w-4 h-4 text-cyan-400" />
            {copy.myCases} ({students.length}/5)
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-xs text-rose-400 text-center py-6">{loadError || '—'}</p>
          ) : (
            <ul className="space-y-2">
              {students.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-start px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      selected?.id === s.id
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                        : 'bg-white/5 border border-transparent text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {studentLabel(s)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#12121a]/60 p-5 space-y-4">
          {!selected ? (
            <p className="text-sm text-slate-500 text-center py-12">—</p>
          ) : (
            <>
              <h2 className="text-xl font-black text-white">{studentLabel(selected)}</h2>

              {studentChildToken(selected) && (
                <div className="rounded-xl bg-black/30 border border-white/10 p-3 space-y-2">
                  <p className="text-xs font-bold text-slate-400">{copy.childLink}</p>
                  <code className="block text-xs text-emerald-400 break-all">{studentChildToken(selected)}</code>
                  <a
                    href={childUrl(studentChildToken(selected))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    /child?token=…
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                  <Target className="w-4 h-4 text-amber-400" />
                  {copy.dailyGoal}
                </label>
                <textarea
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white focus:border-cyan-500/40 focus:outline-none resize-none"
                  placeholder={lang === 'en' ? 'Programmed goal for child home screen…' : 'الهدف الإجرائي اليومي يظهر في واجهة الطفل…'}
                />
                <button
                  type="button"
                  onClick={saveGoal}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {copy.saveGoal}
                </button>
                {saveError && <p className="text-xs text-rose-400">{saveError}</p>}
              </div>

              <TawasulMirrorPanel
                lang={lang}
                student={selected}
                goalDraft={goalDraft}
                onGoalSynced={(goal) => {
                  setStudents((prev) =>
                    prev.map((s) => (s.id === selected.id ? { ...s, programmedGoal: goal } : s))
                  );
                  setGoalDraft(goal);
                }}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
````
