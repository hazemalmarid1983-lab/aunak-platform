<!-- AUNAK CONTEXT — Part 4 | lines 15001-20000 of 28509 | main + Tawasul (English Island excluded) -->

export function isSpeechRecognitionSupported() {
  return Boolean(SpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function createSpeechRecognition({ lang = "ar-SA", continuous = false, interimResults = false } = {}) {
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.lang = lang;
  rec.continuous = continuous;
  rec.interimResults = interimResults;
  return rec;
}

export function speakText(text, { lang = "ar-SA", rate = 1 } = {}) {
  if (!isSpeechSynthesisSupported() || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.lang = lang;
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

const NAV_COMMANDS = {
  ar: [
    { patterns: [/السجل|سجل حي|live/i], section: "live" },
    { patterns: [/تقييم|تشخيص|diagnostic/i], section: "diagnostics" },
    { patterns: [/جزر|وسائط|media/i], section: "media" },
    { patterns: [/جلسات|registry/i], section: "registry" },
    { patterns: [/تحكم|override|يدوي/i], action: "manualOverride" },
    { patterns: [/سجل ملاحظة[:：]?\s*(.+)/i], action: "dictateNote", capture: 1 },
  ],
  en: [
    { patterns: [/live registry|go live/i], section: "live" },
    { patterns: [/assessment|diagnostic/i], section: "diagnostics" },
    { patterns: [/island|media/i], section: "media" },
    { patterns: [/session registry|registry/i], section: "registry" },
    { patterns: [/manual override|override/i], action: "manualOverride" },
    { patterns: [/note[:：]?\s*(.+)/i], action: "dictateNote", capture: 1 },
  ],
};

/** Parse sovereign voice command from transcript. */
export function parseSovereignCommand(transcript, lang = "ar") {
  const text = String(transcript ?? "").trim();
  if (!text) return null;

  const rules = NAV_COMMANDS[lang] ?? NAV_COMMANDS.ar;
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (!match) continue;
      if (rule.section) return { type: "navigate", section: rule.section, raw: text };
      if (rule.action === "manualOverride") return { type: "manualOverride", raw: text };
      if (rule.action === "dictateNote") {
        return { type: "dictateNote", text: match[rule.capture] ?? text, raw: text };
      }
    }
  }
  return { type: "unknown", raw: text };
}
````

## File: src/lib/specialistAttestation.js
````javascript
function bufToBase64(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function hmacKey(user) {
  const seed = String(user?.email ?? '') + '|' + String(user?.dynamicSessionId ?? 'aunak-settle');
  const data = new TextEncoder().encode(seed.padEnd(32, '0').slice(0, 32));
  return crypto.subtle.importKey('raw', data, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

/** Build canonical payload for session settlement seal. */
export function buildSessionSealPayload(user, claim) {
  return {
    specialistEmail: String(user?.email ?? '').trim().toLowerCase(),
    specialistName: user?.name ?? '',
    sessionDate: claim.sessionDate,
    studentId: claim.studentId,
    studentName: claim.studentName,
    sessionFee: claim.sessionFee,
    sequence: claim.sequence,
    dynamicSessionId: user?.dynamicSessionId ?? null,
    sealedAt: new Date().toISOString(),
  };
}

/** HMAC-SHA256 signature for settlement attestation. */
export async function signSessionSettlement(user, claim) {
  const payload = buildSessionSealPayload(user, claim);
  const body = JSON.stringify(payload);
  const key = await hmacKey(user);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return {
    payload,
    signature: bufToBase64(sig),
    method: 'HMAC-SHA256',
    pinVerified: Boolean(claim.pinVerified),
  };
}

/** SHA-256 hex hash of sealed claim for immutability check. */
export async function hashSessionClaim(sealedPayload, signature) {
  const body = JSON.stringify({ sealedPayload, signature });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
````

## File: src/lib/subscriptionEngine.js
````javascript
import { getField, updateStudentRecord, STUDENT as SF } from './airtable';
import { isSubscriptionActive, isSubscriptionPending, isSubscriptionExpired } from './auth';
import { landingForPlan, PLAN_CODES, resolvePlanCode } from './plans';
import {
  findLocalActivationCode,
  markLocalCodeRedeemed,
  normalizeActivationCode,
  planFromCodePrefix,
  validateCodeFormat,
} from './activationCodes';
import {
  generateTripleDeviceTokens,
  buildActivationRedeemFields,
  buildTriplePortalLinks,
} from './tripleAccessProtocol';

export const SUBSCRIPTION_FIELD = SF.subscription_status;
export const PENDING_STATUS = 'pending';
export const ACTIVE_STATUS = 'active';

export function resolveSubscriptionGate(fields) {
  const raw = getField(fields, SF.subscription_status) ?? '';
  const v = String(raw).trim().toLowerCase();
  if (v === 'pending' || v === 'معلق' || v === 'بانتظار') {
    return { active: false, pending: true, reason: 'pending' };
  }
  const expires = getField(fields, SF.subscription_expires_at);
  if (expires) {
    const exp = new Date(expires).getTime();
    if (Number.isFinite(exp) && exp < Date.now()) {
      return { active: false, pending: false, reason: 'expired' };
    }
  }
  return {
    active: isSubscriptionActive(raw),
    pending: false,
    reason: raw || 'none',
  };
}

export function subscriptionFieldsForPending() {
  return {
    [SF.subscription_status]: PENDING_STATUS,
  };
}

export function subscriptionFieldsForActivation(plan, { landing } = {}) {
  const p = resolvePlanCode(plan) ?? plan ?? PLAN_CODES.TUTOR;
  const fields = {
    [SF.subscription_status]: ACTIVE_STATUS,
    [SF.plan_code]: p,
    [SF.last_payment_at]: new Date().toISOString(),
    [SF.payment_method]: 'manual_code',
  };
  const land = landing ?? landingForPlan(p);
  if (land) fields[SF.preferred_destination] = land;
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  fields[SF.subscription_expires_at] = expires.toISOString().slice(0, 10);
  return fields;
}

/** Redeem activation code — local store + Airtable PATCH. */
export async function redeemActivationCode({ code, studentId, parentPhone }) {
  const normalized = normalizeActivationCode(code);
  if (!validateCodeFormat(normalized)) {
    throw new Error('INVALID_CODE_FORMAT');
  }

  let plan = planFromCodePrefix(normalized);
  const local = findLocalActivationCode(normalized);
  if (local?.plan) plan = resolvePlanCode(local.plan) ?? local.plan;
  if (!plan) throw new Error('UNKNOWN_PLAN');

  if (local) {
    markLocalCodeRedeemed(normalized, { studentId, parentPhone });
  }

  if (!studentId) throw new Error('STUDENT_ID_REQUIRED');

  const deviceTokens = generateTripleDeviceTokens();
  const subscriptionFields = subscriptionFieldsForActivation(plan);
  subscriptionFields[SF.activation_code_used] = normalized;
  const fields = buildActivationRedeemFields(subscriptionFields, { tokens: deviceTokens });
  await updateStudentRecord(studentId, fields);

  return {
    plan,
    landing: landingForPlan(plan),
    subscriptionRaw: ACTIVE_STATUS,
    active: true,
    deviceTokens,
    portalLinks: buildTriplePortalLinks(
      typeof window !== 'undefined' ? window.location.origin : 'https://aunak.vercel.app',
      deviceTokens
    ),
  };
}

/** Whether parent session must pass the activation gate (Value Lock). */
export function needsActivationGate(user) {
  if (!user || user.role !== 'parent' || !user.childId) return false;
  if (user.subscriptionActivated) return false;
  if (isSubscriptionActive(user.subscriptionRaw) && !isSubscriptionExpired(user)) return false;
  return (
    isSubscriptionPending(user.subscriptionRaw) ||
    user.subscriptionRaw == null ||
    user.subscriptionRaw === '' ||
    isSubscriptionExpired(user)
  );
}

export function activationGateReason(user) {
  if (isSubscriptionExpired(user)) return 'expired';
  return 'pending';
}

/** Try server redeem first, fall back to client. */
export async function redeemActivationCodeWithApi({ code, studentId, parentPhone }) {
  try {
    const res = await fetch('/api/activation/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ code, studentId, parentPhone }),
    });
    if (res.ok) return res.json();
  } catch {
    /* fall through */
  }
  return redeemActivationCode({ code, studentId, parentPhone });
}
````

## File: src/lib/summerAcademyAirtable.js
````javascript
/**
 * Summer Academy — silent cloud persistence (Airtable + localStorage backup)
 */

import { fetchAllRecords } from './airtable';
import { AIRTABLE_TABLES } from './airtableTables';
import { SUMMER_ACADEMY as SA } from './airtableFields';

const LS_KEY = 'aunak.summerAcademy.v1';
const USE_PROXY = import.meta.env.VITE_USE_AIRTABLE_PROXY === 'true';

function summerTableId() {
  const id = AIRTABLE_TABLES.summerAcademy;
  return id && String(id).trim() ? String(id).trim() : '';
}

function scrubFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

async function cloudWrite(fields) {
  const tableId = summerTableId();
  if (!tableId) return null;

  const body = { fields: scrubFields(fields) };
  const token = import.meta.env.VITE_AIRTABLE_API_KEY || import.meta.env.VITE_AIRTABLE_PAT;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;

  if (USE_PROXY) {
    const res = await fetch(`/api/airtable?table=${encodeURIComponent(tableId)}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  if (!token || !baseId) return null;
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function readBackup() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeBackup(all) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function backupKey(studentId) {
  return String(studentId ?? 'anonymous');
}

export function loadLocalProgress(studentId) {
  const all = readBackup();
  return all[backupKey(studentId)] ?? null;
}

export function saveLocalProgress(studentId, progress) {
  const all = readBackup();
  all[backupKey(studentId)] = { ...progress, updatedAt: new Date().toISOString() };
  writeBackup(all);
  return all[backupKey(studentId)];
}

async function saveSilentEvent(fields) {
  const record = {
    [SA.student_name]: fields.studentName,
    [SA.event_type]: fields.eventType,
    [SA.track]: fields.track ?? '',
    [SA.silent_level]: fields.silentLevel ?? null,
    [SA.baseline_level]: fields.baselineLevel ?? null,
    [SA.current_level]: fields.currentLevel ?? null,
    [SA.weak_points]: fields.weakPoints ?? '',
    [SA.daily_xp]: fields.dailyXp ?? null,
    [SA.tasks_completed]: fields.tasksCompleted ?? null,
    [SA.total_xp]: fields.totalXp ?? null,
    [SA.progress_json]: fields.progressJson ?? '',
    [SA.recorded_at]: fields.recordedAt ?? new Date().toISOString(),
    [SA.session_date]: fields.sessionDate ?? new Date().toISOString().slice(0, 10),
  };
  if (fields.studentId) record[SA.student] = [fields.studentId];

  if (!summerTableId()) return;

  try {
    await cloudWrite(record);
  } catch (err) {
    console.warn('[summerAcademy] silent event:', err.message);
  }
}

/** Silent save — assessment results, never shown to child. */
export async function saveSilentAssessment({ studentId, studentName, assessment }) {
  const recordedAt = new Date().toISOString();
  const sessionDate = recordedAt.slice(0, 10);

  for (const [track, level] of Object.entries(assessment.levels ?? {})) {
    await saveSilentEvent({
      studentId,
      studentName,
      eventType: 'track_baseline',
      track,
      silentLevel: level,
      baselineLevel: level,
      currentLevel: level,
      weakPoints: assessment.weakPoints?.[track] ?? '',
      recordedAt,
      sessionDate,
    });
  }

  await saveSilentEvent({
    studentId,
    studentName,
    eventType: 'silent_assessment',
    weakPoints: JSON.stringify(assessment.weakPoints ?? {}),
    progressJson: JSON.stringify({
      levels: assessment.levels,
      rawScores: assessment.rawScores,
    }),
    recordedAt,
    sessionDate,
  });
}

export async function saveProgressSnapshot({ studentId, studentName, progress }) {
  saveLocalProgress(studentId, progress);

  await saveSilentEvent({
    studentId,
    studentName,
    eventType: 'progress_snapshot',
    dailyXp: progress.dailyXp,
    tasksCompleted: progress.totalTasksCompleted,
    totalXp: progress.totalXp,
    progressJson: JSON.stringify({
      currentLevels: progress.currentLevels,
      baselineLevels: progress.baselineLevels,
      streak: progress.streak,
    }),
  });
}

export async function fetchLeaderboardEntries() {
  const localAll = readBackup();
  const localEntries = Object.values(localAll).map((p) => ({
    studentId: p.studentId,
    displayName: p.studentName,
    tasksCompleted: p.totalTasksCompleted ?? 0,
    dailyXp: p.dailyXp ?? 0,
    totalXp: p.totalXp ?? 0,
    streak: p.streak ?? 0,
  }));

  const tableId = summerTableId();
  if (!tableId) return localEntries;

  try {
    const records = await fetchAllRecords(tableId, {
      filterByFormula: `{${SA.event_type}}='progress_snapshot'`,
      maxRecords: 100,
    });
    const cloud = (records ?? []).map((r) => {
      const f = r.fields ?? {};
      let extra = {};
      try {
        extra = JSON.parse(f[SA.progress_json] ?? '{}');
      } catch {
        /* ignore */
      }
      return {
        studentId: Array.isArray(f[SA.student]) ? f[SA.student][0] : null,
        displayName: f[SA.student_name] ?? 'مغامر',
        tasksCompleted: f[SA.tasks_completed] ?? 0,
        dailyXp: f[SA.daily_xp] ?? 0,
        totalXp: f[SA.total_xp] ?? 0,
        streak: extra.streak ?? 0,
      };
    });
    const merged = new Map();
    for (const e of [...localEntries, ...cloud]) {
      const key = e.studentId ?? e.displayName;
      const prev = merged.get(key);
      if (!prev || e.totalXp > prev.totalXp) merged.set(key, e);
    }
    return [...merged.values()];
  } catch (err) {
    console.warn('[summerAcademy] leaderboard fetch:', err.message);
    return localEntries;
  }
}

export async function loadStudentProgress(studentId) {
  const local = loadLocalProgress(studentId);
  if (local) return local;
  return null;
}

export { SA as SA_FIELDS };
````

## File: src/lib/summerAcademyEngine.js
````javascript
/**
 * Summer Academy — Silent Assessment & Positive Pedagogy Engine
 * الأكاديمية الصيفية: تقييم صامت · 4 مسارات · لوحة إيجابية · تقارير الأهل
 */

export const ACADEMY_DURATION_DAYS = 60;

export const TRACKS = {
  arabic: {
    id: 'arabic',
    labelAr: 'اللغة العربية',
    labelEn: 'Arabic',
    icon: '📖',
    color: 'emerald',
  },
  math: {
    id: 'math',
    labelAr: 'الرياضيات',
    labelEn: 'Mathematics',
    icon: '🔢',
    color: 'amber',
  },
  english: {
    id: 'english',
    labelAr: 'اللغة الإنجليزية',
    labelEn: 'English',
    icon: '🌍',
    color: 'sky',
  },
  brain: {
    id: 'brain',
    labelAr: 'تفكّر وتنشّط',
    labelEn: 'Think & Activate',
    icon: '🧠',
    color: 'violet',
    feedsFromSafeMedia: true,
  },
};

export const TRACK_IDS = Object.keys(TRACKS);

/** Encouragement only — never expose numeric weakness to the child. */
export const SILENT_ENCOURAGEMENT = {
  ar: [
    'أنت جاهز لبدء المغامرة! 🚀',
    'مغامر حقيقي — لننطلق! ⭐',
    'عقلك يتألق — استمر! ✨',
    'أبطال المغامرة يبدأون هكذا! 🏆',
    'كل خطوة تقربك من الكنز! 🗺️',
    'روحك الفضولية رائعة! 🔭',
    'المغامرة تنتظرك — هيا! 🎯',
  ],
  en: [
    'You are ready for the adventure! 🚀',
    'True explorer — let us go! ⭐',
    'Your mind shines — keep going! ✨',
    'Adventure heroes start like this! 🏆',
    'Every step brings you closer to the treasure! 🗺️',
    'Your curiosity is amazing! 🔭',
    'The adventure awaits — let us go! 🎯',
  ],
};

export const WELCOME_MISSION = {
  ar: {
    title: 'مهمة الترحيب — مغامرة الاستكشاف',
    subtitle: 'لعبة ممتعة لاكتشاف عالمك الأكاديمي',
    start: 'ابدأ المغامرة',
    next: 'التالي',
    finish: 'انطلق للمسارات!',
    questions: [
      {
        track: 'arabic',
        prompt: 'أي كلمة تصف هذا؟ 🍎',
        options: ['تفاحة', 'سيارة', 'شمس'],
        answer: 0,
      },
      {
        track: 'arabic',
        prompt: 'اختر الحرف الأول في «بحر»',
        options: ['ب', 'ح', 'ر'],
        answer: 0,
      },
      {
        track: 'math',
        prompt: 'كم عدد النجوم؟ ⭐⭐⭐',
        options: ['2', '3', '4'],
        answer: 1,
      },
      {
        track: 'math',
        prompt: '3 + 2 = ؟',
        options: ['4', '5', '6'],
        answer: 1,
      },
      {
        track: 'english',
        prompt: 'What color is the sky? ☁️',
        options: ['Blue', 'Red', 'Green'],
        answer: 0,
      },
      {
        track: 'english',
        prompt: 'Cat means…',
        options: ['قطة', 'كلب', 'طائر'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'إذا كان أحمد أكبر من سارة، وسارة أكبر من علي — من الأصغر؟',
        options: ['علي', 'أحمد', 'سارة'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'أي شكل مختلف؟ 🔺 🔺 🔴',
        options: ['الأول', 'الثاني', 'الثالث'],
        answer: 2,
      },
    ],
  },
  en: {
    title: 'Welcome Mission — Exploration Game',
    subtitle: 'A fun game to discover your academic world',
    start: 'Start Adventure',
    next: 'Next',
    finish: 'Go to Tracks!',
    questions: [
      {
        track: 'arabic',
        prompt: 'Which word describes this? 🍎',
        options: ['Apple', 'Car', 'Sun'],
        answer: 0,
      },
      {
        track: 'arabic',
        prompt: 'First letter of «sea» in Arabic (بحر)',
        options: ['ب', 'ح', 'ر'],
        answer: 0,
      },
      {
        track: 'math',
        prompt: 'How many stars? ⭐⭐⭐',
        options: ['2', '3', '4'],
        answer: 1,
      },
      {
        track: 'math',
        prompt: '3 + 2 = ?',
        options: ['4', '5', '6'],
        answer: 1,
      },
      {
        track: 'english',
        prompt: 'What color is the sky? ☁️',
        options: ['Blue', 'Red', 'Green'],
        answer: 0,
      },
      {
        track: 'english',
        prompt: 'Cat means…',
        options: ['قطة', 'Dog', 'Bird'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'If Ahmed is older than Sara, and Sara is older than Ali — who is youngest?',
        options: ['Ali', 'Ahmed', 'Sara'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'Which shape is different? 🔺 🔺 🔴',
        options: ['First', 'Second', 'Third'],
        answer: 2,
      },
    ],
  },
};

export const DAILY_TASKS = {
  arabic: {
    ar: ['اقرأ جملة بصوت عالٍ', 'اكتب حرفاً جميلاً', 'اختر كلمة من الصورة'],
    en: ['Read a sentence aloud', 'Write a beautiful letter', 'Pick a word from the picture'],
  },
  math: {
    ar: ['عدّ الأشياء حولك', 'حل لغز أرقام', 'ارسم أشكالاً'],
    en: ['Count objects around you', 'Solve a number puzzle', 'Draw shapes'],
  },
  english: {
    ar: ['Repeat 3 English words', 'Match word to picture', 'Sing an English song'],
    en: ['Repeat 3 English words', 'Match word to picture', 'Sing an English song'],
  },
  brain: {
    ar: ['شاهد فيديو تفكير', 'حل لغز يومي', 'فكّر في موقف حقيقي'],
    en: ['Watch a thinking video', 'Solve daily riddle', 'Reflect on a real situation'],
  },
};

export const XP_PER_TASK = 25;
export const XP_DAILY_BONUS = 50;

function pickEncouragement(lang) {
  const list = SILENT_ENCOURAGEMENT[lang] ?? SILENT_ENCOURAGEMENT.ar;
  return list[Math.floor(Math.random() * list.length)];
}

/** Compute internal silent levels per track — NEVER show to child. */
export function computeSilentAssessment(answers = [], questions = []) {
  const byTrack = {};
  for (const id of TRACK_IDS) {
    byTrack[id] = { correct: 0, total: 0 };
  }

  questions.forEach((q, i) => {
    const track = q.track;
    if (!byTrack[track]) return;
    byTrack[track].total += 1;
    if (answers[i] === q.answer) byTrack[track].correct += 1;
  });

  const levels = {};
  const weakPoints = {};

  for (const id of TRACK_IDS) {
    const { correct, total } = byTrack[id];
    const pct = total > 0 ? Math.round((correct / total) * 100) : 50;
    levels[id] = Math.max(1, Math.min(5, Math.ceil(pct / 20)));
    if (pct < 60) {
      weakPoints[id] = DAILY_TASKS[id]?.ar?.[0] ?? 'تمرين يومي';
    }
  }

  return {
    levels,
    weakPoints,
    rawScores: Object.fromEntries(
      TRACK_IDS.map((id) => [id, byTrack[id].total ? Math.round((byTrack[id].correct / byTrack[id].total) * 100) : 50])
    ),
    encouragement: pickEncouragement('ar'),
  };
}

export function getEncouragement(lang = 'ar') {
  return pickEncouragement(lang);
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function daysSinceEnrollment(enrolledAt) {
  if (!enrolledAt) return 0;
  const start = new Date(enrolledAt);
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function isProgramComplete(enrolledAt) {
  return daysSinceEnrollment(enrolledAt) >= ACADEMY_DURATION_DAYS;
}

/** Positive leaderboard — effort (tasks + XP), never academic deficit. */
export function buildPositiveLeaderboard(entries = [], lang = 'ar') {
  return [...entries]
    .map((e) => ({
      studentId: e.studentId,
      displayName: e.displayName ?? (lang === 'en' ? 'Explorer' : 'مغامر'),
      tasksCompleted: e.tasksCompleted ?? 0,
      dailyXp: e.dailyXp ?? 0,
      totalXp: (e.totalXp ?? 0) + (e.dailyXp ?? 0),
      streak: e.streak ?? 0,
      effortScore: (e.tasksCompleted ?? 0) * XP_PER_TASK + (e.dailyXp ?? 0),
    }))
    .sort((a, b) => b.effortScore - a.effortScore)
    .map((row, idx) => ({
      ...row,
      rank: idx + 1,
      badge:
        idx === 0
          ? lang === 'en'
            ? '🏆 Top Explorer'
            : '🏆 بطل المغامرة'
          : idx < 3
            ? lang === 'en'
              ? '⭐ Star Effort'
              : '⭐ نجم الجهد'
            : lang === 'en'
              ? '🎯 On Track'
              : '🎯 في المسار',
    }));
}

/** Weekly parent report — knowledge stability/improvement, no shame language. */
export function composeWeeklyParentReport(progress, lang = 'ar') {
  const isAr = lang === 'ar';
  const baseline = progress?.baselineLevels ?? {};
  const current = progress?.currentLevels ?? {};
  const tasksWeek = progress?.tasksThisWeek ?? 0;
  const xpWeek = progress?.xpThisWeek ?? 0;

  const trackInsights = TRACK_IDS.map((id) => {
    const b = baseline[id] ?? 1;
    const c = current[id] ?? b;
    const delta = c - b;
    let trend;
    if (delta > 0) {
      trend = isAr ? 'تحسّن ملحوظ' : 'Noticeable improvement';
    } else if (delta === 0 && tasksWeek > 0) {
      trend = isAr ? 'ثبات إيجابي' : 'Positive stability';
    } else if (tasksWeek === 0) {
      trend = isAr ? 'يُنصح بتنشيط المسار' : 'Track activation recommended';
    } else {
      trend = isAr ? 'استمرار في البناء' : 'Continued building';
    }
    return {
      track: TRACKS[id],
      baseline: b,
      current: c,
      trend,
    };
  });

  const summary =
    tasksWeek >= 5
      ? isAr
        ? `أسبوع نشط: ${tasksWeek} مهمة و ${xpWeek} نقطة جهد. المعرفة العلمية تظهر ${trackInsights.some((t) => t.current > t.baseline) ? 'تحسناً' : 'ثباتاً'} عبر المسارات.`
        : `Active week: ${tasksWeek} tasks and ${xpWeek} effort XP. Scientific knowledge shows ${trackInsights.some((t) => t.current > t.baseline) ? 'improvement' : 'stability'} across tracks.`
      : isAr
        ? `أسبوع هادئ — ${tasksWeek} مهمة. التقرير يشجّع على مغامرة يومية خفيفة.`
        : `Quiet week — ${tasksWeek} tasks. Report encourages light daily adventures.`;

  return {
    generatedAt: new Date().toISOString(),
    studentName: progress?.studentName ?? '',
    periodLabel: isAr ? 'أسبوعي' : 'Weekly',
    summary,
    trackInsights,
    effort: { tasksWeek, xpWeek },
    silentNote: isAr
      ? 'هذا التقرير للأهل فقط — لا يُعرض على الطفل.'
      : 'This report is for parents only — not shown to the child.',
  };
}

/** Leap Adventure Certificate — entry vs current comparison at program end. */
export function composeLeapCertificate(progress, lang = 'ar') {
  const isAr = lang === 'ar';
  const baseline = progress?.baselineLevels ?? {};
  const current = progress?.currentLevels ?? {};
  const totalTasks = progress?.totalTasksCompleted ?? 0;
  const totalXp = progress?.totalXp ?? 0;

  const comparisons = TRACK_IDS.map((id) => {
    const b = baseline[id] ?? 1;
    const c = current[id] ?? b;
    const growth = Math.max(0, c - b);
    return {
      track: TRACKS[id],
      entryStars: '⭐'.repeat(b),
      currentStars: '⭐'.repeat(Math.max(b, c)),
      growth,
      message:
        growth > 0
          ? isAr
            ? `قفزة رائعة في ${TRACKS[id].labelAr}!`
            : `Amazing leap in ${TRACKS[id].labelEn}!`
          : isAr
            ? `ثبات قوي في ${TRACKS[id].labelAr}!`
            : `Strong stability in ${TRACKS[id].labelEn}!`,
    };
  });

  const totalGrowth = comparisons.reduce((s, c) => s + c.growth, 0);

  return {
    title: isAr ? 'شهادة قفزة المغامر 🏅' : 'Adventure Leap Certificate 🏅',
    subtitle: isAr ? 'رحلتك من البداية إلى اليوم' : 'Your journey from start to today',
    studentName: progress?.studentName ?? '',
    enrolledAt: progress?.enrolledAt ?? null,
    totalTasks,
    totalXp,
    comparisons,
    heroMessage:
      totalGrowth > 0
        ? isAr
          ? `أنجزت ${totalTasks} مغامرة و ${totalXp} نقطة جهد — وها أنت تتألق!`
          : `You completed ${totalTasks} adventures and ${totalXp} effort XP — you shine!`
        : isAr
          ? `أكملت ${totalTasks} مغامرة — بطل حقيقي!`
          : `You completed ${totalTasks} adventures — a true hero!`,
    unlocked: isProgramComplete(progress?.enrolledAt) || totalTasks >= 20,
  };
}

/** Filter safe media for brain activation track. */
export function filterBrainMedia(mediaItems = []) {
  const brainRe =
    /تفك|دماغ|ذك|فكر|لغز|منطق|brain|think|logic|riddle|puzzle|iq|smart|حياة|واقع|موقف/i;
  return mediaItems.filter((m) => {
    const text = `${m?.title ?? ''} ${m?.category ?? ''} ${m?.summary ?? ''} ${m?.tags ?? ''}`;
    return brainRe.test(text);
  });
}

export function spinBrainWheel(tracks = TRACK_IDS) {
  const idx = Math.floor(Math.random() * tracks.length);
  return tracks[idx];
}

export function defaultProgress(studentId, studentName) {
  const now = new Date().toISOString();
  return {
    studentId,
    studentName,
    enrolledAt: now,
    welcomeComplete: false,
    baselineLevels: Object.fromEntries(TRACK_IDS.map((id) => [id, 1])),
    currentLevels: Object.fromEntries(TRACK_IDS.map((id) => [id, 1])),
    weakPoints: {},
    dailyLog: {},
    tasksCompleted: 0,
    totalTasksCompleted: 0,
    dailyXp: 0,
    totalXp: 0,
    streak: 0,
    lastActiveDate: null,
  };
}

export function completeDailyTask(progress, trackId, lang = 'ar') {
  const day = todayKey();
  const log = { ...(progress.dailyLog ?? {}) };
  if (!log[day]) log[day] = { tasks: [], xp: 0 };

  const taskList = DAILY_TASKS[trackId]?.[lang] ?? DAILY_TASKS[trackId]?.ar ?? ['مهمة'];
  const taskLabel = taskList[log[day].tasks.length % taskList.length];

  if (log[day].tasks.includes(trackId)) {
    return { progress, alreadyDone: true, encouragement: getEncouragement(lang) };
  }

  log[day].tasks.push(trackId);
  const xpGain = XP_PER_TASK + (log[day].tasks.length >= TRACK_IDS.length ? XP_DAILY_BONUS : 0);
  log[day].xp += xpGain;

  const lastDate = progress.lastActiveDate;
  let streak = progress.streak ?? 0;
  if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = todayKey(yesterday);
    if (lastDate === yKey) streak += 1;
    else if (lastDate !== day) streak = 1;
  } else {
    streak = 1;
  }

  const currentLevels = { ...progress.currentLevels };
  currentLevels[trackId] = Math.min(5, (currentLevels[trackId] ?? 1) + (Math.random() > 0.6 ? 1 : 0));

  const updated = {
    ...progress,
    dailyLog: log,
    dailyXp: log[day].xp,
    totalXp: (progress.totalXp ?? 0) + xpGain,
    tasksCompleted: log[day].tasks.length,
    totalTasksCompleted: (progress.totalTasksCompleted ?? 0) + 1,
    currentLevels,
    streak,
    lastActiveDate: day,
  };

  return {
    progress: updated,
    alreadyDone: false,
    xpGain,
    taskLabel,
    encouragement: getEncouragement(lang),
  };
}
````

## File: src/lib/tapPayments.js
````javascript
/**
 * Tap Payments — server-side charge creation + webhook hashstring verification.
 * Docs: https://developers.tap.company/docs/webhook
 */

import { formatTapAmount } from './paymentPlans.js';

const TAP_API_BASE = 'https://api.tap.company/v2';

export function getTapSecretKey() {
  return process.env.TAP_SECRET_KEY || process.env.TAP_SECRET || '';
}

export function isTapConfigured() {
  return Boolean(getTapSecretKey());
}

export function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

/** Build hashstring payload per Tap charge/authorize spec. */
export function buildTapHashString(charge) {
  const id = charge?.id ?? '';
  const amount = formatTapAmount(charge?.amount ?? 0, charge?.currency ?? 'SAR');
  const currency = charge?.currency ?? '';
  const gatewayRef = charge?.reference?.gateway ?? '';
  const paymentRef = charge?.reference?.payment ?? '';
  const status = charge?.status ?? '';
  const created = charge?.transaction?.created ?? charge?.created ?? '';
  return `x_id${id}x_amount${amount}x_currency${currency}x_gateway_reference${gatewayRef}x_payment_reference${paymentRef}x_status${status}x_created${created}`;
}

/** Verify Tap webhook `hashstring` header (HMAC-SHA256 with secret key). */
export async function verifyTapWebhookHash(charge, hashstringHeader) {
  const secret = getTapSecretKey();
  if (!secret || !hashstringHeader) return false;

  const payload = buildTapHashString(charge);
  const crypto = await import('crypto');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === String(hashstringHeader).trim();
}

/** Create a hosted checkout charge — returns Tap charge object. */
export async function createTapCharge({
  amount,
  currency,
  customer,
  redirectUrl,
  webhookUrl,
  metadata,
  description,
  orderRef,
}) {
  const secret = getTapSecretKey();
  if (!secret) throw new Error('TAP_NOT_CONFIGURED');

  const body = {
    amount: Number(formatTapAmount(amount, currency)),
    currency: String(currency).toUpperCase(),
    customer: {
      first_name: sanitizeAscii(customer?.firstName || customer?.name || 'Parent'),
      last_name: sanitizeAscii(customer?.lastName || 'Aunak'),
      email: sanitizeAscii(customer?.email || 'parent@aunak.app'),
      phone: {
        country_code: sanitizeAscii(customer?.phoneCountryCode || '966'),
        number: sanitizeAscii(customer?.phoneNumber || '500000000'),
      },
    },
    source: { id: 'src_all' },
    redirect: { url: redirectUrl },
    post: { url: webhookUrl },
    metadata: metadata ?? {},
    description: sanitizeAscii(description || 'Aunak subscription'),
    reference: { order: sanitizeAscii(orderRef || `AUN-${Date.now()}`) },
    receipt: { email: false, sms: false },
  };

  const res = await fetch(`${TAP_API_BASE}/charges`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`TAP_CHARGE_PARSE_ERROR: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = data?.errors?.[0]?.description || data?.message || text.slice(0, 200);
    throw new Error(`TAP_CHARGE_FAILED: ${msg}`);
  }

  return data;
}

/** Fetch charge by ID (return-url verification). */
export async function fetchTapCharge(chargeId) {
  const secret = getTapSecretKey();
  if (!secret) throw new Error('TAP_NOT_CONFIGURED');

  const id = sanitizeAscii(chargeId);
  const res = await fetch(`${TAP_API_BASE}/charges/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('TAP_FETCH_PARSE_ERROR');
  }

  if (!res.ok) {
    throw new Error(data?.message || 'TAP_FETCH_FAILED');
  }

  return data;
}

export function tapCheckoutUrl(charge) {
  return charge?.transaction?.url || charge?.redirect?.url || null;
}

export function isTapChargeCaptured(charge) {
  return String(charge?.status ?? '').toUpperCase() === 'CAPTURED';
}
````

## File: src/lib/tawasulChildTheme.js
````javascript
/** Tawasul Sovereign Island — matte black · gold · emerald neon (child shell). */

export const TAWASUL_CHILD = {
  root: 'tawasul-child-root min-h-screen text-slate-200 font-sans overflow-hidden select-none bg-[#0a0a0c]',
  sky:
    'pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,169,98,0.12)_0%,transparent_45%),radial-gradient(ellipse_at_80%_90%,rgba(52,211,153,0.1)_0%,transparent_50%),linear-gradient(180deg,#0a0a0c 0%,#12121a 50%,#0a0a0c 100%)]',
  grid:
    'pointer-events-none fixed inset-0 opacity-[0.07] bg-[linear-gradient(rgba(201,169,98,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.4)_1px,transparent_1px)] bg-[size:48px_48px]',
  header:
    'relative z-20 px-4 py-3 flex items-center justify-between bg-[#12121a]/80 backdrop-blur-xl border-b border-[#c9a962]/20',
  main: 'relative z-10 max-w-lg mx-auto p-4 pb-28',
  card:
    'rounded-[2rem] p-6 bg-[#12121a]/90 backdrop-blur-xl border border-[#c9a962]/25 shadow-[0_0_48px_rgba(201,169,98,0.12),inset_0_0_32px_rgba(52,211,153,0.04)]',
  title:
    'text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-emerald-400',
  subtitle: 'text-sm font-bold text-emerald-400/90',
  btnPlay:
    'w-full py-5 rounded-[1.5rem] text-xl font-black text-[#0a0a0c] bg-gradient-to-r from-[#c9a962] to-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.25)] active:scale-[0.98] transition-transform',
  btnBubble:
    'absolute rounded-full font-black text-[#0a0a0c] shadow-[0_0_16px_rgba(201,169,98,0.35)] active:scale-90 transition-transform cursor-pointer border-2 border-[#e8c872]/60',
  mascotWrap: 'flex flex-col items-center gap-3',
  mascotFace:
    'w-28 h-28 rounded-full bg-gradient-to-br from-[#c9a962] to-emerald-500 border-4 border-[#e8c872]/40 shadow-[0_0_32px_rgba(52,211,153,0.3)] flex items-center justify-center text-5xl',
  speech:
    'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/90 border border-emerald-400/30 text-emerald-100 text-lg font-bold shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  speechSilent:
    'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/60 border border-[#c9a962]/20 text-[#c9a962]/80 text-sm font-bold',
  islandArena:
    'relative h-64 rounded-3xl bg-gradient-to-b from-[#0d0d10] to-[#12121a] overflow-hidden border border-emerald-400/20 shadow-[inset_0_0_40px_rgba(52,211,153,0.08)]',
};

export const TAWASUL_BUBBLE_COLORS = [
  'from-[#c9a962] to-[#d4af37]',
  'from-emerald-400 to-teal-500',
  'from-[#e8c872] to-amber-500',
  'from-teal-400 to-emerald-600',
  'from-amber-400 to-[#c9a962]',
];
````

## File: src/lib/tawasulFetch.js
````javascript
/**
 * Safe JSON fetch for Tawasul hub — never surfaces raw Vercel HTML as silent failure.
 */
export async function tawasulFetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    const snippet = raw.includes('server error')
      ? 'A server error has occurred (Vercel function crash — check deployment logs)'
      : raw.slice(0, 240);
    throw new Error(snippet || `HTTP_${res.status}`);
  }
  return { res, data };
}

export function readTawasulApiError(data, status) {
  const err = data?.error ?? data?.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    return err.message || err.error || err.hint || JSON.stringify(err);
  }
  return `REQUEST_${status}`;
}
````

## File: src/lib/tawasulSessionSeal.js
````javascript
/**
 * Tawasul Daily Sessions seal — maps island bridge to live schema (Session Date, Session Notes, student link).
 */

import { createHash } from 'crypto';
import { airtableConfigFromEnv, sanitizeAscii } from './paymentActivation.js';
import { ISLAND_SEAL_MARKER, CHILD_ISLAND_SEAL_THRESHOLD } from './childSessionSeal.js';

export { CHILD_ISLAND_SEAL_THRESHOLD, ISLAND_SEAL_MARKER };

function sessionsTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    'tbl8su5soBPDeGb6Z'
  );
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function hashPayload(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function headers(apiKey) {
  return { Authorization: `Bearer ${sanitizeAscii(apiKey)}`, Accept: 'application/json' };
}

async function fetchTodaySessions(apiKey, baseId, studentRecordId, day) {
  const tableId = sessionsTableId();
  const formula = encodeURIComponent(
    `AND(FIND('${ISLAND_SEAL_MARKER}', {Session Notes}), {Session Date}='${day}')`
  );
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}`;
  const res = await fetch(url, { headers: headers(apiKey) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.records ?? []).filter((r) => {
    const links = r.fields?.student ?? [];
    const ids = Array.isArray(links) ? links : [links];
    return !studentRecordId || ids.includes(studentRecordId);
  });
}

export async function sealTawasulIslandSession({
  studentId,
  studentName,
  interactionCount = CHILD_ISLAND_SEAL_THRESHOLD,
  source = 'island_world',
  interactionType = 'play_engagement',
  config = airtableConfigFromEnv(),
}) {
  const name = String(studentName ?? '').trim();
  const { apiKey, baseId } = config;
  if (!apiKey) throw new Error('AIRTABLE_NOT_CONFIGURED');
  if (!name && !studentId) throw new Error('STUDENT_REQUIRED');

  const day = todayIsoDate();
  const existing = await fetchTodaySessions(apiKey, baseId, studentId, day);
  if (existing.some((r) => String(r.fields?.['Session Notes'] ?? '').includes(ISLAND_SEAL_MARKER))) {
    return { ok: true, alreadySealed: true, sessionDate: day };
  }

  const notes = `${ISLAND_SEAL_MARKER} · Sealed · ${source} · ${interactionType} · ${interactionCount} interactions · ${name}`;
  const fields = {
    'Session Date': day,
    'Session Notes': notes,
    'Daily Goal Achieved': true,
    'Session Duration (min)': Math.max(1, Math.round(interactionCount * 0.5)),
  };
  if (studentId) fields.student = [studentId];

  const attestation = { studentId, studentName: name, day, interactionCount, hash: hashPayload(fields) };
  fields['Session Notes'] = `${notes} · ${attestation.hash.slice(0, 16)}`;

  const tableId = sessionsTableId();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers(apiKey), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 400) || 'TAWASUL_SEAL_FAILED');
  const row = JSON.parse(text);

  return {
    ok: true,
    alreadySealed: false,
    sealed: true,
    sessionDate: day,
    claimId: row?.id ?? null,
  };
}
````

## File: src/routes/.gitkeep
````

````

## File: tailwind.config.js
````javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
````

## File: vite.config.js
````javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
````

## File: api/parent/sessions.js
````javascript
/**
 * GET /api/parent/sessions?studentName=...&days=90
 * Server-side Daily Sessions fetch — uses AIRTABLE_API_KEY (not browser PAT).
 */

import { DAILY_SESSION as DS, STUDENT as SF } from '../../src/lib/airtableFields.js';

const DEFAULT_BASE_ID = 'appaGfKj4vYhMw0cb';
const DEFAULT_DAILY_SESSIONS_TABLE_ID = 'tbl3mlewMLvqp6AXB';
const CLAIM_STATUS_SEALED = 'Sealed';

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

function resolveTableId() {
  for (const key of ['AIRTABLE_DAILY_SESSIONS_TABLE_ID', 'VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID']) {
    const raw = process.env[key];
    const cleaned = sanitizeAscii(raw);
    if (/^tbl[a-zA-Z0-9]{10,}$/i.test(cleaned)) return cleaned;
  }
  return DEFAULT_DAILY_SESSIONS_TABLE_ID;
}

function resolveBaseId() {
  const raw = process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || DEFAULT_BASE_ID;
  return sanitizeAscii(raw).split('/')[0] || DEFAULT_BASE_ID;
}

function resolveApiKey() {
  return sanitizeAscii(process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT);
}

function normalizeDate(date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const s = String(date).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function mapRecord(record) {
  const f = record?.fields ?? {};
  return {
    id: record?.id ?? null,
    sessionDate: f[DS.session_date] ?? '',
    specialistName: String(f[DS.specialist_name] ?? '').trim(),
    studentName: String(f[DS.student_name] ?? '').trim(),
    notes: String(f[DS.notes] ?? '').trim(),
    sealedAt: f[DS.sealed_at] ?? null,
    sessionSequence: f[DS.session_sequence] ?? null,
    claimStatus: f[DS.claim_status] ?? CLAIM_STATUS_SEALED,
    pinVerified: Boolean(f[DS.pin_verified]),
    source: 'daily_sessions',
  };
}

function sealedFormula(studentName, startDate, endDate) {
  const name = String(studentName).replace(/'/g, "\\'");
  return (
    'AND({' +
    DS.student_name +
    "}='" +
    name +
    "', {" +
    DS.claim_status +
    "}='" +
    CLAIM_STATUS_SEALED +
    "', {" +
    DS.session_date +
    "}>='" +
    startDate +
    "', {" +
    DS.session_date +
    "}<='" +
    endDate +
    "'})"
  );
}

async function fetchAllPages(baseId, tableId, apiKey, params) {
  const all = [];
  let offset;
  do {
    const qs = new URLSearchParams(params);
    if (offset) qs.set('offset', offset);
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?${qs.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const err = new Error(`Airtable ${res.status}${detail ? `: ${detail}` : ''}`);
      err.status = res.status;
      throw err;
    }
    const page = await res.json();
    if (Array.isArray(page.records)) all.push(...page.records);
    offset = page.offset;
  } while (offset);
  return all;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentName = String(req.query?.studentName ?? '').trim();
  const days = Math.min(365, Math.max(1, Number(req.query?.days) || 90));

  if (!studentName) {
    res.status(400).json({ error: 'Missing studentName query parameter' });
    return;
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    res.status(200).json({ sessions: [], source: 'none', reason: 'AIRTABLE_API_KEY not configured' });
    return;
  }

  const baseId = resolveBaseId();
  const tableId = resolveTableId();
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  const startDate = normalizeDate(start.toISOString());
  const endDate = normalizeDate(end.toISOString());

  try {
    const formula = sealedFormula(studentName, startDate, endDate);
    const records = await fetchAllPages(baseId, tableId, apiKey, {
      filterByFormula: formula,
      pageSize: '100',
    });

    const sessions = records
      .map(mapRecord)
      .sort((a, b) => {
        const da = String(a.sessionDate ?? '');
        const db = String(b.sessionDate ?? '');
        if (da !== db) return db.localeCompare(da);
        return (b.sessionSequence ?? 0) - (a.sessionSequence ?? 0);
      });

    res.status(200).json({
      sessions,
      source: 'daily_sessions',
      tableId,
      count: sessions.length,
    });
  } catch (err) {
    const status = err?.status ?? 502;
    res.status(200).json({
      sessions: [],
      source: 'unavailable',
      tableId,
      reason: status === 403 ? 'table_not_found_or_forbidden' : 'fetch_failed',
      detail: String(err?.message ?? err).slice(0, 240),
    });
  }
}
````

## File: api/session/child-seal.js
````javascript
/**
 * POST /api/session/child-seal
 * Child Island World interaction → Sealed claim in tblDailySessions (AUN-4611).
 */

import { sealSessionFromChildIsland, CHILD_ISLAND_SEAL_THRESHOLD } from '../../src/lib/childSessionSeal.js';
import { sealTawasulIslandSession } from '../../src/lib/tawasulSessionSeal.js';

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

function isTawasulSealRoute() {
  const base =
    sanitizeAscii(process.env.AIRTABLE_BASE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_BASE_ID) ||
    '';
  return process.env.VITE_TAWASUL_MVP === 'true' || base === 'app3vCT2j2JepNVZa';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentId = sanitizeAscii(req.body?.studentId);
  const studentName = sanitizeAscii(req.body?.studentName);
  const interactionCount = Number(req.body?.interactionCount) || CHILD_ISLAND_SEAL_THRESHOLD;
  const source = sanitizeAscii(req.body?.source) || 'island_world';
  const interactionType = sanitizeAscii(req.body?.interactionType) || 'play_engagement';

  if (!studentName && !studentId) {
    res.status(400).json({ error: 'STUDENT_REQUIRED' });
    return;
  }

  if (interactionCount < CHILD_ISLAND_SEAL_THRESHOLD) {
    res.status(400).json({
      error: 'THRESHOLD_NOT_MET',
      required: CHILD_ISLAND_SEAL_THRESHOLD,
      received: interactionCount,
    });
    return;
  }

  try {
    const sealFn = isTawasulSealRoute() ? sealTawasulIslandSession : sealSessionFromChildIsland;
    const result = await sealFn({
      studentId,
      studentName,
      interactionCount,
      source,
      interactionType,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'CHILD_SEAL_FAILED' });
  }
}
````

## File: package.json
````json
{
  "name": "aunak",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:public": "vite --host",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vladmandic/face-api": "^1.7.15",
    "framer-motion": "^12.42.0",
    "lucide-react": "^1.16.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.5.0",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "postcss": "^8.5.15",
    "tailwindcss": "^3.4.19",
    "vite": "^8.0.12"
  }
}
````

## File: scripts/tawasul-extend-schema.mjs
````javascript
/**
 * Extend Tawasul Students table with sovereignty fields (mirror + assessment).
 * Requires PAT with schema.bases:write on base app3vCT2j2JepNVZa.
 *
 * Usage: node scripts/tawasul-extend-schema.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local');
    process.exit(1);
  }
  const text = readFileSync(path, 'utf8');
  const get = (key) => text.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();
  return {
    pat: get('VITE_AIRTABLE_PAT') || get('AIRTABLE_API_KEY'),
    baseId: get('VITE_AIRTABLE_BASE_ID') || get('AIRTABLE_BASE_ID') || 'app3vCT2j2JepNVZa',
    students: get('VITE_AIRTABLE_STUDENTS_TABLE_ID') || 'tbliBfCKXNyVtWJiO',
  };
}

const env = loadEnv();
if (!env.pat) {
  console.error('Missing VITE_AIRTABLE_PAT');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${env.pat}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

async function ensureField(tableId, fieldDef) {
  const schema = await api(`https://api.airtable.com/v0/meta/bases/${env.baseId}/tables/${tableId}`);
  const exists = (schema.fields ?? []).some((f) => f.name === fieldDef.name);
  if (exists) {
    console.log(`  ✓ ${fieldDef.name} (exists)`);
    return;
  }
  await api(`https://api.airtable.com/v0/meta/bases/${env.baseId}/tables/${tableId}/fields`, {
    method: 'POST',
    body: JSON.stringify(fieldDef),
  });
  console.log(`  + ${fieldDef.name} (created)`);
}

console.log('Extending Students table', env.students, 'in base', env.baseId);

const fields = [
  { name: 'mirror_command', type: 'singleLineText' },
  { name: 'mirror_payload', type: 'singleLineText' },
  { name: 'programmed_goal', type: 'multilineText' },
  { name: 'initial_assessment_score', type: 'number', options: { precision: 0 } },
  {
    name: 'comprehensive_assessment_status',
    type: 'singleSelect',
    options: {
      choices: [{ name: 'not_started' }, { name: 'in_progress' }, { name: 'completed' }],
    },
  },
  { name: 'parent_access_token', type: 'singleLineText' },
  { name: 'child_interactive_token', type: 'singleLineText' },
  { name: 'specialist_tutor_token', type: 'singleLineText' },
];

async function main() {
  for (const field of fields) {
    await ensureField(env.students, field);
  }
  console.log('\nDone. Mirror + assessment + triple tokens ready on Students.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
````

## File: scripts/tawasul-seed.mjs
````javascript
/**
 * Seed Tawasul MVP Airtable base — 2 specialists, 10 students (5 each).
 *
 * Prerequisites:
 *   - New Airtable base with Specialists, Students, Daily Sessions tables (see docs/TAWASUL_MVP.md)
 *   - .env.local: VITE_AIRTABLE_PAT, VITE_AIRTABLE_BASE_ID, table IDs
 *
 * Usage: node scripts/tawasul-seed.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local — copy from .env.example and set Tawasul base IDs');
    process.exit(1);
  }
  const text = readFileSync(path, 'utf8');
  const get = (key) => text.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();
  return {
    pat: get('VITE_AIRTABLE_PAT') || get('AIRTABLE_API_KEY'),
    baseId: get('VITE_AIRTABLE_BASE_ID') || get('AIRTABLE_BASE_ID'),
    specialists: get('VITE_AIRTABLE_SPECIALISTS_TABLE_ID'),
    students: get('VITE_AIRTABLE_STUDENTS_TABLE_ID'),
  };
}

function token(prefix) {
  return `AUN-${prefix}-${randomBytes(16).toString('hex').toUpperCase()}`;
}

async function airtablePost(baseId, tableId, pat, fields) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 400));
  return JSON.parse(text);
}

const env = loadEnv();
if (!env.pat || !env.baseId || !env.specialists || !env.students) {
  console.error('Required: VITE_AIRTABLE_PAT, VITE_AIRTABLE_BASE_ID, VITE_AIRTABLE_SPECIALISTS_TABLE_ID, VITE_AIRTABLE_STUDENTS_TABLE_ID');
  process.exit(1);
}

const specialists = [
  { Name: 'حازم' },
  { Name: 'الأخصائي 2' },
];

console.log('Seeding Tawasul MVP base', env.baseId);

const specialistRecords = [];
for (const row of specialists) {
  const specialist_tutor_token = token('SPC');
  const rec = await airtablePost(env.baseId, env.specialists, env.pat, {
    ...row,
    specialist_tutor_token,
  });
  specialistRecords.push({ ...rec, token: specialist_tutor_token });
  console.log(`  Specialist: ${row.Name} → ${specialist_tutor_token} (${rec.id})`);
}

let studentIndex = 1;
for (const spec of specialistRecords) {
  for (let i = 0; i < 5; i++) {
    const child_interactive_token = token('CHD');
    const name = `حالة تواصل ${studentIndex}`;
    const rec = await airtablePost(env.baseId, env.students, env.pat, {
      Name: name,
      assigned_specialist: [spec.id],
      child_interactive_token,
      programmed_goal: `هدف يومي للحالة ${studentIndex} — من ${spec.fields?.Name ?? spec.fields?.specialist_name ?? 'أخصائي'}`,
    });
    console.log(`  Student: ${name} → ${child_interactive_token} (${rec.id})`);
    studentIndex++;
  }
}

console.log('\nDone. Specialist login tokens:');
specialistRecords.forEach((s) => console.log(`  ${s.fields?.Name ?? s.fields?.specialist_name}: ${s.token}`));
````

## File: src/components/AirtableStatus.jsx
````javascript
import { Loader2 } from "lucide-react";
import { LUX } from '../lib/luxTheme.js';

const statusText = {
  ar: {
    loading: "جاري التحميل من Airtable...",
    empty: "لا توجد بيانات حالياً",
  },
  en: {
    loading: "Loading from Airtable...",
    empty: "No data available",
  },
};

export function AirtableLoading({ lang = "ar", message }) {
  const t = statusText[lang] ?? statusText.ar;
  return (
    <div className={`text-center py-8 text-slate-400 flex flex-col items-center gap-3 min-h-full bg-[#0a0a0c] text-slate-300`}>
      <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      <p className="text-sm font-mono">{message ?? t.loading}</p>
    </div>
  );
}

export function AirtableErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-500/30 text-amber-200 text-sm">
      {error}
    </div>
  );
}

export function AirtableEmpty({ lang = "ar", message }) {
  const t = statusText[lang] ?? statusText.ar;
  return <div className="text-center py-10 text-slate-500">{message ?? t.empty}</div>;
}
````

## File: src/components/assessment/FreeAssessmentFlow.jsx
````javascript
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, ClipboardList } from 'lucide-react';
import {
  getAssessmentQuestions,
  computeInitialAssessment,
  assessmentScorePayload,
} from '../../lib/initialAssessmentEngine';
import { saveInitialAssessmentScore } from '../../lib/airtable';
import AssessmentResultScreen from './AssessmentResultScreen';
import AssessmentPromoModal from './AssessmentPromoModal';
import { LUX } from '../../lib/luxTheme';

export default function FreeAssessmentFlow({
  lang = 'ar',
  studentName = '',
  recordId,
  customer,
  onComplete,
  onBack,
  persistResult,
  skipPromo = false,
  copyOverrides = null,
}) {
  const questions = getAssessmentQuestions(lang);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('quiz');
  const [result, setResult] = useState(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const copy =
    copyOverrides ??
    (lang === 'en'
      ? {
          title: 'Quick skills scan',
          subtitle: '6 clear questions — real preliminary insight in ~3 minutes',
          progress: 'Question',
          of: 'of',
          back: 'Back',
          next: 'Next',
          seeResult: 'See my result',
          saving: 'Saving result...',
        }
      : {
          title: 'مسح سريع للمهارات',
          subtitle: '6 أسئلة واضحة — نتيجة مبدئية حقيقية في ~3 دقائق',
          progress: 'سؤال',
          of: 'من',
          back: 'رجوع',
          next: 'التالي',
          seeResult: 'عرض نتيجتي',
          saving: 'جاري حفظ النتيجة...',
        });

  const q = questions[step];
  const selected = answers[q?.id];
  const allAnswered = questions.every((item) => answers[item.id] != null);

  useEffect(() => {
    if (phase !== 'result' || !result || skipPromo) return undefined;
    const t = setTimeout(() => setPromoOpen(true), 1800);
    return () => clearTimeout(t);
  }, [phase, result, skipPromo]);

  const pick = (score) => {
    setAnswers((prev) => ({ ...prev, [q.id]: score }));
  };

  const finish = async () => {
    const computed = computeInitialAssessment(answers, lang);
    setResult(computed);
    setPhase('result');
    setBusy(true);
    setError('');
    try {
      if (persistResult) {
        await persistResult(recordId, computed);
      } else if (recordId) {
        await saveInitialAssessmentScore(recordId, {
          score: computed.scorePercent,
          payload: assessmentScorePayload(computed),
        });
      }
    } catch (e) {
      console.warn('[assessment] save:', e?.message);
      setError(lang === 'en' ? 'Result shown — save to cloud pending' : 'النتيجة ظاهرة — الحفظ السحابي قيد الانتظار');
    } finally {
      setBusy(false);
    }
  };

  const handlePromoContinue = () => {
    setPromoOpen(false);
    onComplete?.(result);
  };

  if (phase === 'result' && result) {
    return (
      <>
        <AssessmentResultScreen
          lang={lang}
          result={result}
          studentName={studentName}
          onShowPromo={() => (skipPromo ? handlePromoContinue() : setPromoOpen(true))}
        />
        {error && <p className="text-center text-amber-400/90 text-xs mt-3">{error}</p>}
        <AssessmentPromoModal
          lang={lang}
          open={promoOpen && !skipPromo}
          studentId={recordId}
          customer={customer}
          flow="enrollment"
          onContinue={handlePromoContinue}
          onClose={handlePromoContinue}
        />
        {skipPromo && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handlePromoContinue}
              className="px-8 py-3 rounded-2xl font-black bg-gradient-to-l from-emerald-500 to-teal-500 text-[#0a0a0c]"
            >
              {lang === 'en' ? 'Continue to island' : 'العودة إلى الجزيرة'}
            </button>
          </div>
        )}
        {!promoOpen && !skipPromo && (
          <p className="text-center text-xs text-slate-500 mt-4 animate-pulse">
            {lang === 'en' ? 'Tap the button above to continue' : 'اضغط الزر أعلاه للمتابعة'}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="max-w-lg mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`${LUX.glassCard} mb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-10 h-10 text-emerald-400" />
          <div>
            <h2 className={LUX.headingGold}>{copy.title}</h2>
            <p className="text-xs text-slate-500">{copy.subtitle}</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-l from-emerald-400 to-teal-400"
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-xs font-mono text-slate-500">
          {copy.progress} {step + 1} {copy.of} {questions.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }}
          className={`${LUX.glassCard}`}
        >
          <p className="text-lg font-bold text-slate-200 mb-6 leading-relaxed">{q.text}</p>
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => pick(opt.score)}
                className={`w-full text-start py-4 px-5 rounded-2xl border-2 transition-all ${
                  selected === opt.score
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.2)]'
                    : 'border-white/[0.08] bg-[#0d0d10]/50 text-slate-300 hover:border-emerald-400/35'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={() => (step === 0 ? onBack?.() : setStep((s) => s - 1))}
          className={LUX.btnGhost}
        >
          {lang === 'ar' ? <ChevronRight className="w-4 h-4 inline" /> : <ChevronLeft className="w-4 h-4 inline" />}{' '}
          {copy.back}
        </button>
        {step < questions.length - 1 ? (
          <button
            type="button"
            disabled={selected == null}
            onClick={() => setStep((s) => s + 1)}
            className={`${LUX.btnEmerald} flex-1 flex items-center justify-center gap-2 disabled:opacity-40`}
          >
            {copy.next}
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <button
            type="button"
            disabled={!allAnswered || busy}
            onClick={finish}
            className={`${LUX.btnGold} flex-1 flex items-center justify-center gap-2 disabled:opacity-40`}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {busy ? copy.saving : copy.seeResult}
          </button>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/AunakAccessControl.jsx
````javascript
import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Key, Users, Lock, Server, BrainCircuit, EyeOff, Map, HandMetal, Loader2 } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapAccessUser } from '../lib/airtableMappers';
import { fetchStudents } from '../lib/airtable';
import { isStealthMode, setStealthMode } from '../lib/sovereignAudio';
import { useAuth, isSovereignOwner } from '../lib/auth';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

export default function AunakAccessControl({ lang = 'ar', defaultStealth = false }) {
  const { user, patchSession } = useAuth();
  const sovereign = isSovereignOwner(user);
  const manualOverride = Boolean(user?.manualOverride);

  const [stealthMode, setStealthModeLocal] = useState(() => isStealthMode() || Boolean(defaultStealth));
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapStudents, setRoadmapStudents] = useState([]);

  useEffect(() => {
    setStealthMode(stealthMode);
  }, [stealthMode]);

  useEffect(() => {
    if (!sovereign) return;
    let cancelled = false;
    setRoadmapLoading(true);
    fetchStudents()
      .then((rows) => {
        if (!cancelled) setRoadmapStudents(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setRoadmapStudents([]);
      })
      .finally(() => {
        if (!cancelled) setRoadmapLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sovereign]);

  const roadmapStats = useMemo(() => {
    const counts = { new: 0, active: 0, other: 0 };
    for (const s of roadmapStudents) {
      const raw = String(s?.status ?? s?.fields?.Status ?? "").trim().toLowerCase();
      if (raw === "new" || raw === "جديد") counts.new += 1;
      else if (raw === "active" || raw === "نشط") counts.active += 1;
      else counts.other += 1;
    }
    return counts;
  }, [roadmapStudents]);

  const toggleManualOverride = () => {
    patchSession({ manualOverride: !manualOverride });
  };
  const { records: users, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.accessControl, {
    mapRecord: mapAccessUser,
    lang,
  });

  const t = {
    ar: {
      title: 'التحكم في صلاحيات الوصول (السيادة)',
      subtitle: 'بيانات حية من Airtable',
      disableStealth: 'إيقاف وضع التخفي',
      enableStealth: 'تفعيل وضع التخفي',
      userManagement: 'إدارة المستخدمين والصلاحيات',
      lastLogin: (v) => `آخر دخول: ${v}`,
      aiTitle: 'مناطق الوصول الذكية ورابط الاختفاء الذاتي (AI)',
      aiBody: 'يتم تحليل سلوكيات الوصول برمجياً. في حال استشعار أي دخول غير مصرح به لبيانات مشفرة، يقوم الذكاء الاصطناعي بتوليد "رابط اختفاء ذاتي" ينهي الجلسة ويقفل السجل فوراً.',
      stealthOn: 'الوضع الحالي: التخفي مفعل، الحقول المالية والإدارية محجوبة عن الأخصائيين.',
      stealthOff: 'الوضع الحالي: شفافية كاملة للمصرح لهم.',
      serverProtocols: 'بروتوكولات الخوادم',
      militaryEncryption: 'التشفير العسكري',
      mirrorSync: 'النسخ المرآتي اللحظي',
      auditLogs: 'استخراج سجل التدقيق (Audit Logs)',
      roadmapTitle: 'خارطة الطريق — حالة الطلاب (Status)',
      roadmapNew: 'New — تقييم شامل',
      roadmapActive: 'Active — سجل حي / عالم الجزر',
      roadmapOther: 'أخرى / غير مصنف',
      manualOverride: 'التحكم اليدوي (Manual Override)',
      manualOn: 'مفعّل — تجاوز قفل الباقات والبوابات',
      manualOff: 'معطّل — السياسات الافتراضية نشطة',
      enableManual: 'تفعيل التحكم اليدوي',
      disableManual: 'إيقاف التحكم اليدوي',
    },
    en: {
      title: 'Access Control (Sovereign)',
      subtitle: 'Live data from Airtable',
      disableStealth: 'Disable Stealth Mode',
      enableStealth: 'Enable Stealth Mode',
      userManagement: 'User & Permission Management',
      lastLogin: (v) => `Last login: ${v}`,
      aiTitle: 'Smart Access Zones & Self-Destruct Link (AI)',
      aiBody: 'Access behavior is analyzed programmatically. If unauthorized access to encrypted data is detected, AI generates a self-destruct link that terminates the session and locks the record immediately.',
      stealthOn: 'Current mode: Stealth active — financial and admin fields hidden from specialists.',
      stealthOff: 'Current mode: Full transparency for authorized users.',
      serverProtocols: 'Server Protocols',
      militaryEncryption: 'Military-Grade Encryption',
      mirrorSync: 'Real-Time Mirror Sync',
      auditLogs: 'Export Audit Logs',
      roadmapTitle: 'Roadmap — student Status',
      roadmapNew: 'New — full assessment',
      roadmapActive: 'Active — live registry / island world',
      roadmapOther: 'Other / unclassified',
      manualOverride: 'Manual Override',
      manualOn: 'Active — bypass plan locks and gates',
      manualOff: 'Inactive — default policies enforced',
      enableManual: 'Enable Manual Override',
      disableManual: 'Disable Manual Override',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#d4af37] flex items-center gap-3">
            <ShieldCheck className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button 
          type="button"
          onClick={() => setStealthModeLocal((v) => !v)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${stealthMode ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'bg-[#12121a]/70 hover:bg-[#12121a]/90 text-slate-300'}`}
        >
          {stealthMode ? <EyeOff className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          {stealthMode ? copy.disableStealth : copy.enableStealth}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
                 <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2"><Users className="w-6 h-6 text-[#d4af37]" /> {copy.userManagement}</h3>
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : isEmpty ? (
                <AirtableEmpty lang={lang} />
              ) : (
              <div className="space-y-4">
                 {users.map(user => (
                    <div key={user.id} className="p-5 bg-[#0d0d10]/90 rounded-2xl border border-[#c9a962]/15 flex justify-between items-center hover:border-amber-500/30 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-500/30 flex items-center justify-center text-[#d4af37] font-bold text-xl">
                             {(user.name || '?').charAt(0)}
                          </div>
                          <div>
                             <h4 className="text-md font-bold text-slate-200">{user.name}</h4>
                             <p className="text-xs text-slate-500 mt-1 font-mono">{user.email} • {user.role}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-[#12121a]/70 text-slate-300 rounded-lg text-xs font-bold">{user.access}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{copy.lastLogin(user.lastLogin)}</span>
                       </div>
                    </div>
                 ))}
              </div>
              )}
           </div>

           <div className="bg-amber-900/10 p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <h3 className="text-xl font-bold text-[#e8c872] mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiTitle}</h3>
              <p className="text-md text-amber-200/80 leading-relaxed bg-amber-950/50 p-5 rounded-xl border border-amber-500/30">
                 {copy.aiBody}
                 <br/><br/>
                 <span className={`font-bold ${stealthMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {stealthMode ? copy.stealthOn : copy.stealthOff}
                 </span>
              </p>
           </div>
        </div>

        <div className="space-y-6">
           {sovereign && (
             <>
               <div className={`${LUX.glassCard} p-6`}>
                 <h3 className={`${LUX.headingGold} mb-4 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3`}>
                   <Map className="w-5 h-5 text-emerald-400" /> {copy.roadmapTitle}
                 </h3>
                 {roadmapLoading ? (
                   <div className={`flex items-center gap-2 text-sm ${LUX.muted}`}>
                     <Loader2 className="w-4 h-4 animate-spin" /> …
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-emerald-400/20">
                       <span className="text-sm text-slate-400">{copy.roadmapNew}</span>
                       <span className={`text-lg font-bold ${LUX.emeraldValue}`}>{roadmapStats.new}</span>
                     </div>
                     <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/20">
                       <span className="text-sm text-slate-400">{copy.roadmapActive}</span>
                       <span className={`text-lg font-bold ${LUX.goldText}`}>{roadmapStats.active}</span>
                     </div>
                     <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-white/[0.06]">
                       <span className="text-sm text-slate-400">{copy.roadmapOther}</span>
                       <span className="text-lg font-bold text-slate-400">{roadmapStats.other}</span>
                     </div>
                   </div>
                 )}
               </div>

               <div className={`${LUX.glassCard} p-6`}>
                 <h3 className={`${LUX.headingGold} mb-3 flex items-center gap-2`}>
                   <HandMetal className="w-5 h-5 text-amber-400" /> {copy.manualOverride}
                 </h3>
                 <p className={`text-xs mb-4 ${manualOverride ? "text-amber-300" : LUX.muted}`}>
                   {manualOverride ? copy.manualOn : copy.manualOff}
                 </p>
                 <button
                   type="button"
                   onClick={toggleManualOverride}
                   className={`w-full py-3 rounded-xl font-bold text-sm transition-all border flex justify-center items-center gap-2 ${
                     manualOverride
                       ? "bg-amber-600/90 hover:bg-amber-500 text-white border-amber-400/40 shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                       : `${LUX.btnGhost} w-full`
                   }`}
                 >
                   <HandMetal className="w-4 h-4" />
                   {manualOverride ? copy.disableManual : copy.enableManual}
                 </button>
               </div>
             </>
           )}

           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
              <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3"><Server className="w-5 h-5 text-emerald-400" /> {copy.serverProtocols}</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <span className="text-sm text-slate-400">{copy.militaryEncryption}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">AES-256</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <span className="text-sm text-slate-400">{copy.mirrorSync}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">ACTIVE</span>
                 </div>
              </div>
           </div>
           <button type="button" className="w-full py-4 bg-[#12121a]/70 hover:bg-[#12121a]/90 text-white rounded-2xl font-bold text-sm transition-all border border-white/[0.08] shadow-lg flex justify-center items-center gap-2">
              <Key className="w-4 h-4" /> {copy.auditLogs}
           </button>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakBiometrics.jsx
````javascript
import { useCallback, useEffect, useRef, useState } from "react";
import { ScanFace, ShieldCheck, AlertTriangle, Camera, RefreshCw, Fingerprint, Loader2 } from "lucide-react";
import PlatformLogo from "./PlatformLogo";
import { fetchStudents, STUDENTS_TABLE } from "../lib/airtable";
import { useBiometricScan } from "../hooks/useBiometricScan";
import { SOVEREIGN_MATCH_CONFIDENCE } from "../lib/biometricMatch";
import { useAuth, ROLES } from "../lib/auth";
import { PLAN_CODES } from "../lib/plans";
import { activateSovereignBiometricLogin } from "../lib/sovereignLogin";
import { subscribeEmergencyLogin } from "../lib/studentPrivacy";
import { LUX } from "../lib/luxTheme.js";

export default function AunakBiometrics({
  lang = "ar",
  gateMode = false,
  onBiometricSuccess,
  autoEnterOnMatch = false,
}) {
  const { login, setActiveStudent } = useAuth();
  const [registryCount, setRegistryCount] = useState(null);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const matchHandledRef = useRef(false);

  const t = {
    ar: {
      title: "نظام البصمة الحيوية",
      subtitle: "مطابقة سيادية ≥94.7% مع فحص صلاحية الكاميرا",
      gateSubtitle: "مسح الوجه البيومتري — لا تُعرض أي أسماء قبل التحقق",
      gatePrivacyHint: "خصوصية سيادية: التعرف بالوجه فقط — بدون قائمة أسماء عامة",
      startScan: "بدء المسح البيومتري",
      scanning: "جاري المسح...",
      matching: "مطابقة الهوية عبر قواعد البيانات المشفرة...",
      threshold: "عتبة الثقة السيادية",
      permission: "بوابة صلاحية الكاميرا",
      permissionBlocked: "صلاحية الكاميرا غير مفعلة في سجل الوصول",
      studentId: "إسم الطالب",
      selectStudent: "اختر الطالب (Student_ID)",
      selectPlaceholder: "— اختر من السجل الحي —",
      verifyHint: "المطابقة المزدوجة 1:1 — الوجه يجب أن يطابق الاسم المختار",
      harmonyIndex: "درجة التناغم",
      retry: "إعادة المحاولة",
      refreshRegistry: "تحديث السجل",
      liveRegistry: "السجل الحي",
      entering: "جاري تفعيل الجلسة السيادية...",
      scanSuccess: "تم التعرف بنجاح",
    },
    en: {
      title: "Biometric ID System",
      subtitle: "Sovereign match ≥94.7% with camera permission gate",
      gateSubtitle: "Biometric face scan — no names shown before verification",
      gatePrivacyHint: "Sovereign privacy: face-only match — no public name list",
      startScan: "Start Biometric Scan",
      scanning: "Scanning...",
      matching: "Matching identity across encrypted databases...",
      threshold: "Sovereign confidence",
      permission: "Camera permission gate",
      permissionBlocked: "Camera permission inactive in access registry",
      studentId: "Student name",
      selectStudent: "Select student (Student_ID)",
      selectPlaceholder: "— choose from live registry —",
      verifyHint: "1:1 dual verification — face must match selected name",
      harmonyIndex: "Harmony score",
      retry: "Retry",
      refreshRegistry: "Refresh registry",
      liveRegistry: "Live registry",
      entering: "Activating sovereign session...",
      scanSuccess: "Recognition successful",
    },
  };
  const copy = t[lang] ?? t.ar;

  const handleEmergencyLogin = useCallback(() => {
    login({
      role: ROLES.ADMIN,
      plan: PLAN_CODES.INSTITUTION,
      name: lang === "ar" ? "فحص ميداني" : "Field Inspection",
      fieldInspection: true,
      landingSection: "live",
    });
  }, [lang, login]);

  const handleSovereignMatch = useCallback(
    async (payload) => {
      setActiveStudent(payload.student?.id);
      if (matchHandledRef.current) return;
      matchHandledRef.current = true;

      if (onBiometricSuccess) {
        await onBiometricSuccess(payload);
        return;
      }

      if (autoEnterOnMatch || gateMode) {
        setEntering(true);
        try {
          await activateSovereignBiometricLogin(payload, login, lang);
        } finally {
          setEntering(false);
        }
      }
    },
    [autoEnterOnMatch, gateMode, lang, login, onBiometricSuccess, setActiveStudent]
  );

  useEffect(() => {
    if (!gateMode) return undefined;
    return subscribeEmergencyLogin(handleEmergencyLogin);
  }, [gateMode, handleEmergencyLogin]);

  const scan = useBiometricScan({
    lang,
    playChimeOnMatch: true,
    onSovereignMatch: handleSovereignMatch,
    selectedStudentId: null,
    requireStudentSelection: false,
  });

  const loadLiveRegistry = useCallback(async () => {
    if (gateMode) return;
    setRegistryLoading(true);
    try {
      const rows = await fetchStudents();
      const list = Array.isArray(rows) ? rows : [];
      setRegistryCount(list.length);
    } catch {
      setRegistryCount(0);
    } finally {
      setRegistryLoading(false);
    }
  }, [gateMode]);

  useEffect(() => {
    if (gateMode) return;
    loadLiveRegistry();
  }, [gateMode, loadLiveRegistry]);

  useEffect(() => {
    if (scan.scanState === "idle" || scan.scanState === "error") {
      matchHandledRef.current = false;
    }
  }, [scan.scanState]);

  const student = scan.matchedStudent?.student;
  const harmony = scan.matchedStudent?.harmonyScore;

  const rootClass = gateMode
    ? "w-full max-w-4xl mx-auto"
    : "min-h-screen bg-[#0a0a0c] text-slate-300 p-4 md:p-8 font-sans";

  const panelClass = gateMode
    ? `${LUX.panelGlass} border-emerald-400/20 shadow-[0_0_48px_rgba(52,211,153,0.08)] p-6`
    : "rounded-3xl border border-[#c9a962]/15 bg-[#12121a]/70 backdrop-blur-xl shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6";

  const videoFrameClass = gateMode
    ? `${LUX.videoFrame} ${scan.scanState === "scanning" ? "border-emerald-400/45 shadow-[0_0_24px_rgba(52,211,153,0.2)]" : ""}`
    : "aspect-video rounded-2xl bg-black border border-white/[0.08] overflow-hidden relative mb-4";

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className={rootClass}>
      {!gateMode && (
        <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#c9a962]/15">
          <div className="flex items-center gap-4">
            <PlatformLogo lang={lang} className="w-16 h-20 rounded-2xl" />
            <div>
              <h1 className={LUX.titleGradient}>{copy.title}</h1>
              <p className="text-sm text-slate-400 mt-1">{copy.subtitle}</p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-500">
            {copy.liveRegistry}: {STUDENTS_TABLE} — {registryLoading ? "..." : registryCount}
            <button type="button" onClick={loadLiveRegistry} className="ml-2 text-emerald-400 inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {copy.refreshRegistry}
            </button>
          </div>
        </header>
      )}

      <div className={gateMode ? "" : "max-w-4xl mx-auto grid md:grid-cols-2 gap-8"}>
        <div className={panelClass}>
          {gateMode && (
            <>
              <p className={`${LUX.muted} text-sm text-center mb-2 font-mono`}>{copy.gateSubtitle}</p>
              <p className={`text-[10px] text-center mb-4 font-mono ${LUX.emeraldAccent}`}>{copy.gatePrivacyHint}</p>
            </>
          )}

          <div className={videoFrameClass}>
            {(scan.scanState === "scanning" || scan.scanState === "loading" || scan.scanState === "success") && (
              <video
                ref={scan.videoRef}
                className={gateMode ? "absolute inset-0 w-full h-full object-cover" : "w-full h-full object-cover"}
                playsInline
                muted
              />
            )}
            {scan.scanState === "idle" && (
              <div className={`${gateMode ? "flex items-center justify-center h-full" : "h-full flex items-center justify-center"}`}>
                {gateMode ? (
                  <ScanFace className="w-20 h-20 text-slate-500" />
                ) : (
                  <Camera className="w-16 h-16 text-slate-600" />
                )}
              </div>
            )}
            {scan.scanState === "error" && gateMode && (
              <div className="flex items-center justify-center h-full">
                <AlertTriangle className="w-20 h-20 text-rose-400" />
              </div>
            )}
          </div>

          {scan.scanState === "idle" && (
            <button
              type="button"
              onClick={scan.startScan}
              className={gateMode ? `${LUX.scanBtnEmerald} w-full mt-4` : `${LUX.btnEmerald} w-full py-3 rounded-xl font-bold`.trim()}
            >
              {copy.startScan}
            </button>
          )}

          {(scan.scanState === "scanning" || scan.scanState === "loading") && (
            <p className={`text-center text-sm font-mono mt-4 ${gateMode ? LUX.scanProgress : "text-[#e8c872]"}`}>
              {scan.scanState === "loading" ? copy.matching : copy.scanning} — {scan.similarityPercent.toFixed(1)}% / {SOVEREIGN_MATCH_CONFIDENCE}%
            </p>
          )}

          {entering && (
            <div className={`flex items-center justify-center gap-2 mt-4 ${LUX.emeraldValue} text-sm`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              {copy.entering}
            </div>
          )}

          {scan.scanState === "success" && student && !entering && !gateMode && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mt-4">
              <ScanFace className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-500">{copy.studentId}</p>
              <p className="text-xl font-bold text-slate-300">{student.name}</p>
              <p className="text-xs text-slate-500 mt-3">{copy.harmonyIndex}</p>
              <p className="text-2xl font-black text-[#d4af37]">{harmony != null ? `${harmony}%` : "—"}</p>
              <p className="text-xs font-mono text-emerald-400 mt-2">{scan.similarityPercent.toFixed(1)}%</p>
            </div>
          )}

          {scan.scanState === "success" && student && gateMode && !entering && !autoEnterOnMatch && (
            <p className={`${LUX.emeraldValue} font-bold text-center mt-4`}>{copy.scanSuccess}</p>
          )}

          {scan.scanState === "error" && (
            <div className="text-center mt-4">
              <p className="text-rose-300 text-sm mb-3">{scan.errorMsg}</p>
              {scan.permissionDenied && (
                <p className="text-[#e8c872] text-xs mb-3 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> {copy.permissionBlocked}
                </p>
              )}
              <button
                type="button"
                onClick={scan.reset}
                className={gateMode ? LUX.backLink : "px-4 py-2 rounded-lg bg-[#12121a]/70 text-sm"}
              >
                {copy.retry}
              </button>
            </div>
          )}
        </div>

        {!gateMode && (
          <div className="rounded-3xl border border-[#c9a962]/15 bg-[#12121a]/70 backdrop-blur-xl shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#d4af37] text-sm font-mono">
              <Fingerprint className="w-4 h-4" /> {copy.threshold}: {SOVEREIGN_MATCH_CONFIDENCE}%
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <ShieldCheck className="w-4 h-4" /> {copy.permission}
            </div>

            {scan.scanState === "success" && student && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <ScanFace className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs text-slate-500">{copy.studentId}</p>
                <p className="text-xl font-bold text-slate-300">{student.name}</p>
                <p className="text-xs text-slate-500 mt-3">{copy.harmonyIndex}</p>
                <p className="text-2xl font-black text-[#d4af37]">{harmony != null ? `${harmony}%` : "—"}</p>
                <p className="text-xs font-mono text-emerald-400 mt-2">{scan.similarityPercent.toFixed(1)}%</p>
              </div>
            )}

            {scan.scanState !== "success" && (
              <div className="p-4 rounded-2xl bg-[#0d0d10]/90 border border-[#c9a962]/15 text-slate-500 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{copy.subtitle}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/AunakClassrooms.jsx
````javascript
import { useState, useEffect, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { STUDENT_CLASS_FIELD } from '../hooks/useStudents';
import { BookOpen, Users, BrainCircuit, School, Activity, Loader2 } from 'lucide-react';
import { AirtableEmpty, AirtableErrorBanner } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const UNASSIGNED_KEY = '__unassigned__';

export default function AunakClassrooms({ lang = 'ar' }) {
  const { students, loading, error } = useStudents(lang);
  const [activeClassKey, setActiveClassKey] = useState(null);

  const t = {
    ar: {
      title: 'إدارة الفصول الدراسية',
      subtitle: 'تصفية الطلاب حسب الفصل المُسند في Airtable',
      distributing: 'الطالب قيد التوزيع:',
      loading: 'جاري التحميل...',
      roomList: 'قائمة الفصول',
      addRoom: '+ إضافة فصل جديد',
      roomDetails: 'تفاصيل الفصل المحدد',
      schedule: 'الجدول: 08:00 ص - 01:00 م',
      specialist: 'الأخصائي المسؤول',
      capacity: 'طاقة الفصل الاستيعابية',
      enrolled: 'الطلاب المسجلين',
      unassignedRoom: 'غير مُسند لفصل',
      noDiagnosis: '—',
      noStudentsInClass: 'لا يوجد طلاب مسجلون في هذا الفصل.',
      noClassrooms: 'لا توجد فصول — عيّن حقل «الفصل الدراسي» للطلاب في Airtable.',
      aiTitle: 'توزيع الطلاب الذكي (AI Smart Distribution)',
      aiBody: (className, count) =>
        `يضم "${className}" ${count} طالب/ة حالياً وفق حقل «${STUDENT_CLASS_FIELD}» في جدول الطلاب. راجع التوافق الحسي والأكاديمي قبل إضافة طلاب جدد.`,
      fieldMapping: `حقل Airtable: ${STUDENT_CLASS_FIELD} (أو Assigned Class / Class / Classroom)`,
      active: 'نشط',
    },
    en: {
      title: 'Classroom Management',
      subtitle: 'Filter students by assigned class from Airtable',
      distributing: 'Student being placed:',
      loading: 'Loading...',
      roomList: 'Classroom List',
      addRoom: '+ Add New Classroom',
      roomDetails: 'Selected Classroom Details',
      schedule: 'Schedule: 08:00 AM - 01:00 PM',
      specialist: 'Assigned Specialist',
      capacity: 'Room Capacity',
      enrolled: 'Enrolled Students',
      unassignedRoom: 'Unassigned',
      noDiagnosis: '—',
      noStudentsInClass: 'No students enrolled in this classroom.',
      noClassrooms: 'No classrooms found — assign the class field for students in Airtable.',
      aiTitle: 'AI Smart Distribution',
      aiBody: (className, count) =>
        `"${className}" currently has ${count} student(s) based on the student table class field. Review sensory and academic fit before adding new students.`,
      fieldMapping: `Airtable field: Assigned Class (or ${STUDENT_CLASS_FIELD} / Class / Classroom)`,
      active: 'Active',
    },
  };

  const copy = t[lang] ?? t.ar;

  const classrooms = useMemo(() => {
    const grouped = new Map();

    for (const student of students) {
      const className = student.assignedClass?.trim() || copy.unassignedRoom;
      const key = student.assignedClass?.trim() ? student.assignedClass.trim() : UNASSIGNED_KEY;

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          name: className,
          students: [],
        });
      }
      grouped.get(key).students.push(student);
    }

    return [...grouped.values()].sort((a, b) => {
      if (a.key === UNASSIGNED_KEY) return 1;
      if (b.key === UNASSIGNED_KEY) return -1;
      return a.name.localeCompare(b.name, lang === 'ar' ? 'ar' : 'en');
    });
  }, [students, copy.unassignedRoom, lang]);

  useEffect(() => {
    if (classrooms.length === 0) {
      setActiveClassKey(null);
      return;
    }
    setActiveClassKey((prev) =>
      prev && classrooms.some((room) => room.key === prev) ? prev : classrooms[0].key
    );
  }, [classrooms]);

  const activeRoom = classrooms.find((room) => room.key === activeClassKey) ?? null;
  const enrolledStudents = activeRoom?.students ?? [];
  const capacityMax = 6;
  const capacityUsed = enrolledStudents.length;
  const capacityPercent = Math.min(100, Math.round((capacityUsed / capacityMax) * 100));

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-400 flex items-center gap-3">
            <School className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
          <p className="text-xs text-blue-400/70 font-mono mt-2">{copy.fieldMapping}</p>
        </div>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-5 rounded-2xl border border-[#c9a962]/15 mb-4">
            <h3 className="text-sm text-slate-500 mb-2 font-bold">{copy.distributing}</h3>
            <p className="text-xl font-bold text-slate-300 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> {copy.loading}
                </>
              ) : (
                students?.[0]?.name || copy.noDiagnosis
              )}
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.roomList}</h3>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> {copy.loading}
            </div>
          ) : classrooms.length === 0 ? (
            <AirtableEmpty lang={lang} message={copy.noClassrooms} />
          ) : (
            <div className="space-y-3">
              {classrooms.map((room) => (
                <button
                  key={room.key}
                  type="button"
                  onClick={() => setActiveClassKey(room.key)}
                  className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-4 rounded-xl border transition-all ${
                    activeClassKey === room.key
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-300 shadow-lg'
                      : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'
                  }`}
                >
                  <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 shrink-0" /> {room.name}
                  </h4>
                  <div className="flex justify-between items-center text-xs mt-2">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {room.students.length}
                    </span>
                    <span className="text-emerald-400">{copy.active}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="w-full py-3 mt-2 bg-[#12121a]/70 hover:bg-[#12121a]/90 text-white rounded-xl font-bold transition-all border border-slate-600 border-dashed"
          >
            {copy.addRoom}
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
              <h3 className="text-2xl font-bold text-slate-300 flex items-center gap-2">{copy.roomDetails}</h3>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-mono font-bold">
                {copy.schedule}
              </span>
            </div>

            {activeRoom ? (
              <>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <p className="text-sm text-slate-500 mb-2 font-bold">{copy.specialist}</p>
                    <p className="text-lg text-slate-200 font-semibold">{activeRoom.name}</p>
                  </div>
                  <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <p className="text-sm text-slate-500 mb-2 font-bold">{copy.capacity}</p>
                    <div className="w-full bg-[#12121a]/70 rounded-full h-2.5 mb-1 mt-3">
                      <div className="bg-blue-400 h-2.5 rounded-full transition-all" style={{ width: `${capacityPercent}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {capacityUsed}/{capacityMax}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                  <h4 className="text-slate-300 font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> {copy.enrolled}
                  </h4>
                  {enrolledStudents.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">{copy.noStudentsInClass}</p>
                  ) : (
                    <div className="space-y-2">
                      {enrolledStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-[#c9a962]/15 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)]"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white shrink-0">
                            {(student.name || '?').charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm text-slate-300 font-semibold block truncate">{student.name}</span>
                            {student.diagnosis && (
                              <span className="text-xs text-slate-500">{student.diagnosis}</span>
                            )}
                          </div>
                          {student.studentCode && (
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">{student.studentCode}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              !loading && <AirtableEmpty lang={lang} message={copy.noClassrooms} />
            )}
          </div>

          {activeRoom && (
            <div className="bg-blue-900/10 p-8 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
              <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-6 h-6" /> {copy.aiTitle}
              </h3>
              <p className="text-md text-blue-200/80 leading-relaxed bg-blue-950/50 p-5 rounded-xl border border-blue-500/30">
                {copy.aiBody(activeRoom.name, enrolledStudents.length)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakCommunityChat.jsx
````javascript
import { useState } from 'react';
import { ShieldAlert, Send, ShieldCheck, UserCircle2, UserCheck } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import Sidebar from './Sidebar';
import PlatformLogo from './PlatformLogo';
import { LUX } from '../lib/luxTheme.js';

export default function AunakCommunityChat({ lang = 'ar' }) {
  const { students, loading: studentsLoading, error: studentsError, refetch } = useStudents(lang);
  const studentList = Array.isArray(students) ? students : [];
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [message, setMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const t = {
    ar: {
      title: 'مجتمع عونك',
      subtitle: 'الصدقة الجارية - الدعم التكافلي',
      moderator: 'الرقيب الذكي نشط',
      privacyBanner: 'لحماية أطفالنا: يمنع الرقيب الآلي مشاركة الأسماء، التشخيصات الطبية، أو بيانات التواصل.',
      you: 'أنت',
      placeholder: 'اكتب رسالتك هنا...',
      securityAlert: 'تنبيه أمني: اكتشف الرقيب الذكي بيانات حساسة. يرجى مسحها.',
      emptyChat: 'لا توجد رسائل بعد — ابدأ المحادثة الأولى.',
    },
    en: {
      title: 'Aunak Community',
      subtitle: 'Ongoing charity — peer support network',
      moderator: 'Smart Moderator Active',
      privacyBanner: 'To protect our children: the AI moderator blocks names, medical diagnoses, and contact details.',
      you: 'You',
      placeholder: 'Type your message here...',
      securityAlert: 'Security alert: sensitive data detected. Please remove it.',
      emptyChat: 'No messages yet — start the conversation.',
    },
  };

  const copy = t[lang] ?? t.ar;
  const [chatLogs, setChatLogs] = useState([]);

  const SENSITIVE_PATTERNS = [
    /\b(اسم[ي ه]|اسم الطفل|طفل[ي ه]|ابن[ي ه]|بنت[ي ه])\b/i,
    /\b(تقرير|تشخيص|نتيجة فحص|خطة علاجية)\b/i,
    /\b(my child|my son|my daughter|[A-Z][a-z]+ is \d+ years)\b/i,
    /\b(diagnosis|assessment report|clinical data)\b/i,
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i,
    /\+?[\d\s\-\(\).]{9,}/g,
  ];

  const handleTextChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    const blocked = SENSITIVE_PATTERNS.some(p => p.test(text));
    setIsBlocked(blocked);
  };

  const handleSendMessage = () => {
    if (isBlocked || !message.trim()) return;
    setChatLogs([...chatLogs, { id: Date.now(), sender: copy.you, role: "parent", text: message, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setMessage("");
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0a0a0c] text-slate-300 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between border-b border-[#c9a962]/15 pb-6">
        <div className="flex items-center gap-4">
          <PlatformLogo lang={lang} className="w-16 h-20 rounded-2xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-l from-amber-300 to-cyan-300 bg-clip-text text-transparent">{copy.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{copy.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-bold">
          <ShieldCheck className="w-4 h-4" /> {copy.moderator}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex gap-4 h-[min(600px,calc(100vh-12rem))] min-h-0">
        <Sidebar
          lang={lang}
          students={studentList}
          loading={studentsLoading}
          error={studentsError}
          refetch={refetch}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          className="self-stretch"
        />

      <main className="flex-1 min-w-0 min-h-0 relative z-0 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[#12121a]/55 backdrop-blur-xl p-4 border-b border-[#c9a962]/15 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-[#d4af37]" />
          <p className="text-sm text-amber-200">{copy.privacyBanner}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatLogs.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-16">{copy.emptyChat}</p>
          ) : (
          chatLogs.map(log => (
            <div key={log.id} className={`flex gap-4 ${log.sender === copy.you ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-[#12121a]/70 flex items-center justify-center shrink-0 border border-white/[0.08]">
                {log.role === "specialist" ? <UserCheck className="w-5 h-5 text-emerald-400" /> : <UserCircle2 className="w-5 h-5 text-slate-400" />}
              </div>
              <div className={`max-w-[80%] ${log.sender === copy.you ? (lang === 'ar' ? 'text-left' : 'text-right') : (lang === 'ar' ? 'text-right' : 'text-left')}`}>
                <div className={`flex items-center gap-2 mb-1 ${lang === 'ar' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                  <span className="text-xs text-slate-500">{log.time}</span>
                  <span className={`text-sm font-bold ${log.role === "specialist" ? "text-emerald-400" : "text-[#d4af37]"}`}>{log.sender}</span>
                </div>
                <div className={`p-4 rounded-2xl ${log.sender === copy.you ? "bg-cyan-600/20 border border-emerald-400/30 text-cyan-50" : "bg-[#12121a]/70 border border-white/[0.08] text-slate-200"}`}>
                  {log.text}
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        <div className="p-4 border-t border-[#c9a962]/15 bg-[#0d0d10]/90">
          <div className="relative flex items-center gap-4">
            <input
              type="text"
              value={message}
              onChange={handleTextChange}
              placeholder={copy.placeholder}
              className={`flex-1 bg-slate-900 border ${isBlocked ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/[0.08] focus:ring-cyan-500/20'} rounded-xl px-4 py-3 text-slate-300 outline-none focus:ring-2 transition-all`}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isBlocked || !message.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${isBlocked || !message.trim() ? 'bg-[#12121a]/70 text-slate-600' : 'bg-emerald-500 text-slate-950 hover:bg-cyan-400'}`}
            >
              <Send className="w-5 h-5" />
            </button>
            {isBlocked && (
              <div className={`absolute -top-12 ${lang === 'ar' ? 'right-0' : 'left-0'} bg-rose-500/10 border border-rose-500/50 text-rose-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2 animate-bounce font-bold`}>
                <ShieldAlert className="w-4 h-4" /> {copy.securityAlert}
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
````

## File: src/components/AunakCrisisManagement.jsx
````javascript
import { useState, useEffect } from 'react';
import { useCrisisAlerts } from '../hooks/useCrisisAlerts';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapAbcPlan } from '../lib/airtableMappers';
import { ShieldAlert, Activity, AlertTriangle, BrainCircuit, ShieldCheck } from 'lucide-react';
import { LUX } from '../lib/luxTheme.js';

export default function AunakCrisisManagement({ lang = 'ar' }) {
  const { records: plans } = useAirtableData(AIRTABLE_TABLES.abcData, {
    mapRecord: mapAbcPlan,
    lang,
  });

  const livePlan = plans?.[0];
  const liveIntensity = Math.min(5, Math.max(1, Number(String(livePlan?.intensity ?? '1').replace(/\D/g, '')) || 1));
  const liveFrequency = Math.min(5, Math.max(1, Number(livePlan?.fields?.Frequency ?? livePlan?.fields?.['التكرار']) || 1));
  const liveDuration = Math.min(20, Math.max(1, Number(livePlan?.fields?.Duration ?? livePlan?.fields?.['المدة']) || 1));

  const [intensity, setIntensity] = useState(liveIntensity);
  const [frequency, setFrequency] = useState(liveFrequency);
  const [duration, setDuration] = useState(liveDuration);

  useEffect(() => {
    setIntensity(liveIntensity);
    setFrequency(liveFrequency);
    setDuration(liveDuration);
  }, [liveIntensity, liveFrequency, liveDuration]);

  const t = {
    ar: {
      title: 'الدرع الذكي وإدارة الأزمات',
      subtitle: 'نظام (ABC Data) وتقييم مستوى الخطر اللحظي المعتمد ببراءة اختراع',
      abcInputs: 'مدخلات السلوك (ABC)',
      intensity: 'الشدة (Intensity) - الوزن: x2',
      frequency: 'التكرار (Frequency) - الوزن: x1.5',
      duration: 'المدة بالدقائق (Duration) - الوزن: x1',
      riskIndex: 'مؤشر الخطر اللحظي',
      critical: 'تحذير: مستوى خطر حرج! تم تفعيل بروتوكول الدرع الذكي وإبلاغ الإدارة.',
      stable: 'الوضع مستقر - السلوك تحت السيطرة',
    },
    en: {
      title: 'Smart Shield & Crisis Management',
      subtitle: 'ABC Data system and patented real-time risk assessment',
      abcInputs: 'Behavior Inputs (ABC)',
      intensity: 'Intensity — weight: x2',
      frequency: 'Frequency — weight: x1.5',
      duration: 'Duration (minutes) — weight: x1',
      riskIndex: 'Real-Time Risk Index',
      critical: 'Warning: Critical risk level! Smart Shield protocol activated and management notified.',
      stable: 'Status stable — behavior under control',
    },
  };

  const copy = t[lang] ?? t.ar;

  const { riskScore, isCritical } = useCrisisAlerts(intensity, frequency, duration);

  return (
    <div className="p-6 md:p-10 bg-[#0a0a0c] min-h-screen text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <header className="mb-10 border-b border-[#c9a962]/15 pb-6">
         <h2 className="text-3xl md:text-4xl font-bold text-rose-400 flex items-center gap-3">
           <ShieldAlert className="w-10 h-10" /> {copy.title}
         </h2>
         <p className="text-slate-400 mt-2 text-lg">{copy.subtitle}</p>
       </header>

       <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
         <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] backdrop-blur p-8 rounded-3xl border border-[#c9a962]/15 shadow-2xl">
           <h3 className="text-2xl font-bold text-[#d4af37] mb-8 flex items-center gap-2"><Activity className="w-6 h-6" /> {copy.abcInputs}</h3>
           <div className="space-y-8">
             <div>
               <label className="flex justify-between text-lg mb-3 text-slate-300"><span>{copy.intensity}</span> <span className="font-bold text-[#d4af37] text-xl">{intensity}</span></label>
               <input type="range" min="1" max="5" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-[#12121a]/70 rounded-lg appearance-none cursor-pointer" />
             </div>
             <div>
               <label className="flex justify-between text-lg mb-3 text-slate-300"><span>{copy.frequency}</span> <span className="font-bold text-[#d4af37] text-xl">{frequency}</span></label>
               <input type="range" min="1" max="5" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-[#12121a]/70 rounded-lg appearance-none cursor-pointer" />
             </div>
             <div>
               <label className="flex justify-between text-lg mb-3 text-slate-300"><span>{copy.duration}</span> <span className="font-bold text-[#d4af37] text-xl">{duration}</span></label>
               <input type="range" min="1" max="20" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-[#12121a]/70 rounded-lg appearance-none cursor-pointer" />
             </div>
           </div>
         </div>

         <div className={`p-10 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${isCritical ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_70px_rgba(244,63,94,0.2)]' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-emerald-500/30'}`}>
           <BrainCircuit className={`w-24 h-24 mb-6 ${isCritical ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`} />
           <h3 className="text-2xl font-bold text-slate-300 mb-4">{copy.riskIndex}</h3>
           <div className={`text-8xl font-black font-mono mb-6 ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
             {riskScore.toFixed(1)}
           </div>
           {isCritical ? (
             <div className="bg-rose-500/20 text-rose-300 border border-rose-500/50 px-6 py-4 rounded-xl flex items-center gap-3 font-bold animate-bounce mt-4 text-lg text-center">
               <AlertTriangle className="w-8 h-8 shrink-0" /> {copy.critical}
             </div>
           ) : (
             <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-4 rounded-xl flex items-center gap-3 font-bold mt-4 text-lg">
               <ShieldCheck className="w-8 h-8" /> {copy.stable}
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
````

## File: src/components/AunakDiagnostics.jsx
````javascript
import { useState, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../lib/auth';
import { getField } from '../lib/airtable';
import { STUDENT as SF } from '../lib/airtableFields';
import { hasB2BPremiumTag, B2B_PREMIUM_TAG } from '../lib/plans';
import { ClipboardList, BrainCircuit, Activity, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { LUX } from '../lib/luxTheme.js';

export default function AunakDiagnostics({ lang = 'ar' }) {
  const { students } = useStudents(lang);
  const { user } = useAuth();
  const [activeScale, setActiveScale] = useState('CARS-2');
  const [reportRequested, setReportRequested] = useState(false);

  const activeStudent = useMemo(() => {
    const activeId = user?.activeStudentId ?? user?.childId ?? null;
    const list = Array.isArray(students) ? students : [];
    return list.find((s) => s.id === activeId) ?? list[0] ?? null;
  }, [students, user]);

  const premiumVerified = useMemo(() => {
    const fields = activeStudent?.fields ?? {};
    const raw = getField(fields, SF.subscription_status);
    return hasB2BPremiumTag(raw);
  }, [activeStudent]);

  const zeroReportFromAirtable = useMemo(() => {
    const fields = activeStudent?.fields ?? {};
    return (
      getField(fields, SF.zero_point_report) ||
      null
    );
  }, [activeStudent]);

  const t = {
    ar: {
      title: 'مقاييس التشخيص والتقييم',
      subtitle: 'إدارة مقاييس (CARS-2, GARS-3, VB-MAPP) وتقرير نقطة الصفر الذكي',
      selectedStudent: 'الطالب المحدد للتقييم:',
      loading: 'جاري التحميل...',
      scaleTitle: 'مقياس',
      inProgress: 'قيد التقييم',
      rawData: 'البيانات الخام (Raw Data)',
      rawPlaceholder: 'أدخل البيانات الأولية للمقياس هنا...',
      finalScore: 'النتيجة النهائية (Final Score)',
      points: 'درجة',
      saveScore: 'حفظ نتيجة المقياس',
      zeroReport: 'تقرير نقطة الصفر (AI Zero-Point Report)',
      generateReport: 'توليد التشخيص العام',
      reportLocked: `توليد التقرير يتطلب وسم ${B2B_PREMIUM_TAG} في حقل subscription_status بسجل الطالب`,
      zeroReportEmpty: 'لا يوجد تقرير نقطة صفر في Airtable — أدخل نتائج المقياس واحفظها أولاً.',
      noStudent: 'لم يُحدد طالب — اختر طالباً من البوابة أو سجل الطلاب.',
    },
    en: {
      title: 'Diagnostics & Assessment Scales',
      subtitle: 'Manage CARS-2, GARS-3, VB-MAPP scales and AI zero-point report',
      selectedStudent: 'Selected student for assessment:',
      loading: 'Loading...',
      scaleTitle: 'Scale',
      inProgress: 'In Progress',
      rawData: 'Raw Data',
      rawPlaceholder: 'Enter initial scale data here...',
      finalScore: 'Final Score',
      points: 'points',
      saveScore: 'Save Scale Result',
      zeroReport: 'AI Zero-Point Report',
      generateReport: 'Generate General Diagnosis',
      reportLocked: `Report generation requires the ${B2B_PREMIUM_TAG} tag in the student's subscription_status field`,
      zeroReportEmpty: 'No zero-point report in Airtable — enter scale results and save first.',
      noStudent: 'No student selected — choose a student from the gate or registry.',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-3">
            <ClipboardList className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-5 rounded-2xl border border-[#c9a962]/15">
            <h3 className="text-sm text-slate-500 mb-2 font-bold">{copy.selectedStudent}</h3>
            <p className="text-xl font-bold text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> {activeStudent?.name || copy.noStudent}
            </p>
          </div>
          
          <nav className="space-y-2">
            {['CARS-2', 'GARS-3', 'VB-MAPP'].map(scale => (
              <button 
                key={scale}
                type="button"
                onClick={() => setActiveScale(scale)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border font-bold transition-all ${activeScale === scale ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-[#e8c872] shadow-lg' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'}`}
              >
                {scale}
                {activeScale === scale && <Activity className="w-4 h-4" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
                 <h3 className="text-2xl font-bold text-slate-300">{copy.scaleTitle} {activeScale}</h3>
                 <span className="px-3 py-1 bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 text-[#d4af37] border border-amber-500/30 rounded-lg text-xs font-mono font-bold">{copy.inProgress}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.rawData}</label>
                    <textarea className="w-full h-32 bg-[#0d0d10]/90 border border-white/[0.08] rounded-xl p-4 text-slate-300 focus:border-fuchsia-500 outline-none font-mono text-sm" placeholder={copy.rawPlaceholder}></textarea>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-white/[0.08]">
                       <p className="text-xs text-slate-500 mb-1 font-mono">{copy.finalScore}</p>
                       <div className="flex items-center gap-3">
                         <input type="number" className="w-24 bg-slate-900 border border-slate-600 rounded-lg p-2 text-xl font-bold text-white text-center outline-none focus:border-fuchsia-500" placeholder="0" />
                         <span className="text-sm text-slate-400">{copy.points}</span>
                       </div>
                    </div>
                    <button type="button" className="w-full py-3 bg-[#12121a]/70 hover:bg-[#12121a]/90 text-white rounded-xl font-bold transition-all border border-slate-600">
                       {copy.saveScore}
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-fuchsia-900/10 p-8 rounded-3xl border border-fuchsia-500/20 shadow-[0_0_30px_rgba(217,70,239,0.05)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-xl font-bold text-[#e8c872] flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.zeroReport}</h3>
                <button
                  type="button"
                  disabled={!premiumVerified}
                  onClick={() => premiumVerified && setReportRequested(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${premiumVerified ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : 'bg-[#12121a]/70 text-slate-500 cursor-not-allowed border border-white/[0.08]'}`}
                >
                  {!premiumVerified && <Lock className="w-3.5 h-3.5" />} {copy.generateReport}
                </button>
              </div>

              {!premiumVerified && (
                <p className="mb-4 text-xs text-[#e8c872] bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" /> {copy.reportLocked}
                </p>
              )}

              <div className="relative">
                <p className={`text-md text-fuchsia-200/80 leading-relaxed bg-fuchsia-950/50 p-5 rounded-xl border border-fuchsia-500/30 flex gap-4 items-start ${premiumVerified && reportRequested ? '' : 'blur-[8px] select-none pointer-events-none'}`}>
                   <AlertTriangle className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                   {zeroReportFromAirtable || copy.zeroReportEmpty}
                </p>
                {!(premiumVerified && reportRequested) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full bg-[#0d0d10]/90/85 border border-fuchsia-500/40 text-[#e8c872] text-xs font-bold flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> {B2B_PREMIUM_TAG}
                    </span>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakEcosystemHub.jsx
````javascript
import { useState, useEffect, useRef, useMemo } from 'react';
import { UserPlus, ScanFace, MessageSquare, ShieldAlert, ShieldCheck, Globe, Music, Target, Activity, FileText, ClipboardList, Video, TrendingDown, BookOpen, Database, Stethoscope, FolderOpen, LogOut, UserCircle2, Lock, Volume2, VolumeX, FlaskConical, Eye, PanelLeftClose, PanelLeftOpen, HandMetal, EyeOff, Map, FileBarChart } from 'lucide-react';
import PlatformLogo, { HEADER_LOGO_CLASS } from './PlatformLogo';
import AunakPaywall from './AunakPaywall';
import { useAuth, ROLES, canAccessSection, isSovereignOwner, isSubscriptionActive } from '../lib/auth';
import { getField } from '../lib/airtable';
import { STUDENT as SF } from '../lib/airtableFields';
import { planAllows, PLAN_CODES, PLAN_LABELS } from '../lib/plans';
import { isAudioEnabled, setAudioEnabled } from '../lib/sovereignAudio';
import {
  isAppStealthActive,
  isSectionHiddenInStealth,
  subscribeStealthChanges,
  toggleAppStealth,
  handleSovereignKeyInput,
} from '../lib/studentPrivacy';
import AunakAccessControl from './AunakAccessControl';
import AunakResources from './AunakResources';
import AunakSpecialists from './AunakSpecialists';
import AunakScientificItems from './AunakScientificItems';
import AunakBehaviorMod from './AunakBehaviorMod';
import AunakClassrooms from './AunakClassrooms';
import AunakSafeMedia from './AunakSafeMedia';
import AunakDiagnostics from './AunakDiagnostics';
import AunakBiometrics from './AunakBiometrics';
import AunakCommunityChat from './AunakCommunityChat';
import AunakCrisisManagement from './AunakCrisisManagement';
import AunakEmotionalLab from './AunakEmotionalLab';
import AunakLearningCenter from './AunakLearningCenter';
import AunakLiveDashboard from './AunakLiveDashboard';
import AunakSessionRegistry from './AunakSessionRegistry';
import AunakResearchHub from './AunakResearchHub';
import AunakReportsDashboard from './AunakReportsDashboard';
import AunakEnrollment from './AunakEnrollment';
import SovereignCommandBar from './SovereignCommandBar';
import { useGazeNeutralityObserver } from '../hooks/useGazeNeutralityObserver';
import { useMeltdownPredictor } from '../hooks/useMeltdownPredictor';
import { useHarmonyEngine } from '../hooks/useHarmonyEngine';
import { useActiveStudentMetrics } from '../hooks/useActiveStudentMetrics';
import { useRoadmapStats } from '../hooks/useRoadmapStats';
import { isStealthMode, setStealthMode } from '../lib/sovereignAudio';
import { LUX } from '../lib/luxTheme.js';


const TABS = {
  live: { ar: 'السجل الحي', en: 'Live Registry' },
  crisis: { ar: 'الدرع الذكي', en: 'Smart Shield' },
  learning: { ar: 'صعوبات التعلم', en: 'Learning Center' },
  emotion: { ar: 'مختبر الألحان', en: 'Melodies Lab' },
  biometrics: { ar: 'البصمة الحيوية', en: 'Biometrics ID' },
  community: { ar: 'مجتمع عونك', en: 'Aunak Community' },
};

/** Extra English/Arabic labels that may appear as activeTab values. */
const TAB_ALIASES = {
  live: ['Live Registry', 'السجل الحي'],
  crisis: ['Smart Shield', 'الدرع الذكي'],
  learning: ['Learning Center', 'صعوبات التعلم'],
  emotion: ['Melodies Lab', 'مختبر الألحان'],
  biometrics: ['Biometrics ID', 'البصمة الحيوية'],
  community: ['Aunak Community', 'Community', 'مجتمع عونك'],
};

const MAIN_NAV_ITEMS = [
  { id: 'enrollment', icon: UserPlus, activeClass: LUX.navActiveGold },
  { id: 'registry', icon: FileText, activeClass: LUX.navActiveGold },
  { id: 'diagnostics', icon: ClipboardList, activeClass: LUX.navActiveGold },
  { id: 'media', icon: Video, activeClass: LUX.navActiveGold },
  { id: 'behavior', icon: TrendingDown, activeClass: LUX.navActiveGold },
  { id: 'classrooms', icon: BookOpen, activeClass: LUX.navActiveGold },
  { id: 'scientific', icon: Database, activeClass: LUX.navActiveGold },
  { id: 'specialists', icon: Stethoscope, activeClass: LUX.navActiveGold },
  { id: 'resources', icon: FolderOpen, activeClass: LUX.navActiveGold },
  { id: 'research', icon: FlaskConical, activeClass: LUX.navActiveGold },
  { id: 'reports', icon: FileBarChart, activeClass: LUX.navActiveGold },
  { id: 'access', icon: ShieldCheck, activeClass: LUX.navActiveGold },
];

const NAV_ITEMS = [
  { id: 'live', icon: Activity, activeClass: LUX.navActiveLive },
  { id: 'crisis', icon: ShieldAlert, activeClass: LUX.navActiveGold },
  { id: 'learning', icon: Target, activeClass: LUX.navActiveGold },
  { id: 'emotion', icon: Music, activeClass: LUX.navActiveGold },
  { id: 'biometrics', icon: ScanFace, activeClass: LUX.navActiveGold },
  { id: 'community', icon: MessageSquare, activeClass: LUX.navActiveGold },
];

const TAB_PANELS = {
  live: AunakLiveDashboard,
  crisis: AunakCrisisManagement,
  learning: AunakLearningCenter,
  emotion: AunakEmotionalLab,
  biometrics: AunakBiometrics,
  community: AunakCommunityChat,
};

const TAB_IDS = Object.keys(TABS);

const MAIN_SECTIONS = {
  enrollment: AunakEnrollment,
  registry: AunakSessionRegistry,
  diagnostics: AunakDiagnostics,
  media: AunakSafeMedia,
  behavior: AunakBehaviorMod,
  classrooms: AunakClassrooms,
  scientific: AunakScientificItems,
  specialists: AunakSpecialists,
  resources: AunakResources,
  research: AunakResearchHub,
  reports: AunakReportsDashboard,
  access: AunakAccessControl,
};


const PREMIUM_SECTIONS = new Set(['emotion', 'crisis']);

const DEFAULT_TAB_BY_ROLE = {
  [ROLES.ADMIN]: 'live',
  [ROLES.SPECIALIST]: 'live',
  [ROLES.PARENT]: 'media',
};

function sectionCanAccess(user, role, sectionId) {
  const plan = user?.plan ?? PLAN_CODES.FREE;
  if (plan === PLAN_CODES.ASSESSMENT_ONLY || user?.assessmentOnlyMode) {
    if (!['diagnostics', 'enrollment'].includes(sectionId)) return false;
  }
  return canAccessSection(user, role, sectionId) && !isSectionHiddenInStealth(sectionId);
}

function normalizeTab(value) {
  if (TAB_IDS.includes(value)) return value;

  for (const [id, labels] of Object.entries(TABS)) {
    if (value === labels.ar || value === labels.en) return id;
    if (TAB_ALIASES[id]?.includes(value)) return id;
  }

  return 'live';
}

export default function AunakEcosystemHub() {
  const { user, logout, subscriptionActive, patchSession } = useAuth();
  const role = user?.role ?? ROLES.PARENT;
  // كود الباقة المخزن في الجلسة منذ الدخول الأول من AunakGate (sessionStorage).
  const plan =
    user?.plan ??
    (role === ROLES.ADMIN ? PLAN_CODES.INSTITUTION : role === ROLES.SPECIALIST ? PLAN_CODES.INSTITUTION : PLAN_CODES.FREE);

  const [activeTab, setActiveTab] = useState(() => user?.landingSection ?? DEFAULT_TAB_BY_ROLE[role] ?? 'live');
  const [lang, setLang] = useState('ar');
  const [audioOn, setAudioOn] = useState(() => isAudioEnabled());
  const [stealthActive, setStealthActive] = useState(() => isAppStealthActive());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const landingAppliedRef = useRef(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  useEffect(() => {
    if (!user?.landingSection) return;

    if (user?.biometricSovereign) {
      setActiveTab(user.landingSection);
      landingAppliedRef.current = true;
      return;
    }

    if (landingAppliedRef.current) return;
    landingAppliedRef.current = true;
    setActiveTab(user.landingSection);
  }, [user?.landingSection, user?.biometricSovereign, user?.dynamicSessionId, user?.enrollmentStatus]);

  const isAssessmentOnly = plan === PLAN_CODES.ASSESSMENT_ONLY || Boolean(user?.assessmentOnlyMode);

  useEffect(() => {
    if (!isAssessmentOnly) return;
    setActiveTab('diagnostics');
    setAudioEnabled(false);
    setAudioOn(false);
    setStealthMode(true);
    setStealthActive(true);
  }, [isAssessmentOnly]);

  useEffect(() => subscribeStealthChanges(setStealthActive), []);

  useEffect(() => {
    const onKeyDown = (e) => handleSovereignKeyInput(e.key);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const sovereign = isSovereignOwner(user);
  const manualOverride = Boolean(user?.manualOverride);
  const { stats: roadmapStats } = useRoadmapStats({ enabled: sovereign });
  useHarmonyEngine();
  const { gazeTrigger, abcDefaults, student: activeStudent } = useActiveStudentMetrics(user);

  useEffect(() => {
    const sectionId = MAIN_SECTIONS[activeTab] ? activeTab : normalizeTab(activeTab);
    if (!isSectionHiddenInStealth(sectionId)) return;
    if (user?.biometricSovereign && user?.landingSection === sectionId) return;
    setActiveTab('learning');
  }, [stealthActive, activeTab, user?.biometricSovereign, user?.landingSection]);

  const onLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 800);
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
      toggleAppStealth();
    }
  };

  const toggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    setAudioEnabled(next);
  };

  const requestedAllowed = MAIN_SECTIONS[activeTab]
    ? sectionCanAccess(user, role, activeTab)
    : sectionCanAccess(user, role, normalizeTab(activeTab));
  const requestedTab = requestedAllowed ? activeTab : DEFAULT_TAB_BY_ROLE[role] ?? 'media';

  const tabId = normalizeTab(requestedTab);
  const ActivePanel = TAB_PANELS[tabId] || AunakLiveDashboard;
  const MainSection = MAIN_SECTIONS[requestedTab] ?? null;

  const sectionKey = MainSection ? requestedTab : tabId;

  const gaze = useGazeNeutralityObserver({
    active: Boolean(user?.gazeObserverActive),
    triggerCondition: gazeTrigger,
    lang,
  });

  const neuralLiveActive = Boolean(
    user?.neuralEngineActive ||
      user?.sessionRegistryOpen ||
      user?.gazeObserverActive ||
      user?.biometricSovereign
  );

  const meltdownLive = sectionKey === 'registry' || sectionKey === 'live' || sectionKey === 'crisis';

  const meltdown = useMeltdownPredictor({
    active: neuralLiveActive && meltdownLive,
    lang,
    abc: abcDefaults,
  });

  // Value Lock: اعتراض أي مسار أعلى من باقة المستخدم بجدار الدفع الزجاجي.
  const planLocked = user?.manualOverride ? false : !planAllows(plan, sectionKey);

  const studentSubscriptionActive = useMemo(() => {
    if (user?.subscriptionRaw != null) {
      return isSubscriptionActive(user.subscriptionRaw);
    }
    if (activeStudent?.fields) {
      const raw =
        getField(activeStudent.fields, SF.subscription_status);
      return isSubscriptionActive(raw);
    }
    return subscriptionActive;
  }, [user?.subscriptionRaw, activeStudent?.fields, subscriptionActive]);

  // Subscription paywall: مختبر الألحان والدرع الذكي للمشتركين فقط (المدير يتجاوز).
  const isPaywalled =
    planLocked ||
    (PREMIUM_SECTIONS.has(sectionKey) && role !== ROLES.ADMIN && studentSubscriptionActive === false);

  /** Live field session — collapse chrome for eye-tracking & goal engine */
  const isFieldSession = Boolean(
    user?.sessionRegistryOpen && (sectionKey === 'registry' || sectionKey === 'live')
  );

  useEffect(() => {
    if (isFieldSession) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isFieldSession]);

  const toggleManualOverride = () => {
    patchSession({ manualOverride: !manualOverride });
  };

  const toggleStealthHeader = () => {
    const next = !isStealthMode();
    setStealthMode(next);
    setStealthActive(next);
  };

  const handleVoiceNavigate = (section) => {
    if (section) setActiveTab(section);
  };

  const t = {
    ar: {
      title: 'بوابة عونك',
      subtitle: 'النسخة السيادية الموحدة',
      live: TABS.live.ar,
      crisis: TABS.crisis.ar,
      learning: TABS.learning.ar,
      emotion: TABS.emotion.ar,
      biometrics: TABS.biometrics.ar,
      community: TABS.community.ar,
      enrollment: 'تسجيل الطلاب',
      registry: 'سجل الجلسات',
      diagnostics: 'مقاييس التشخيص',
      media: 'مكتبة الوسائط',
      behavior: 'تعديل السلوك',
      classrooms: 'الفصول الدراسية',
      scientific: 'المكتبة العلمية',
      specialists: 'إدارة الأخصائيين',
      resources: 'موارد المجتمع',
      research: 'مركز الأبحاث',
      reports: 'تقارير الأداء',
      access: 'التحكم السيادي',
      secured: 'AES-256 SECURED',
      online: 'متصل',
      logout: 'تسجيل الخروج',
      roleLabels: { admin: 'مدير أعلى', specialist: 'أخصائي', parent: 'ولي أمر' },
      childLabel: 'الطفل:',
      fieldSession: 'جلسة ميدانية',
      showControls: 'أدوات التحكم',
      expandNav: 'فتح القائمة',
      collapseNav: 'طي القائمة',
      roadmapNew: 'New → تقييم',
      roadmapActive: 'Active → حي/جزر',
      manualOverride: 'تحكم يدوي',
      stealth: 'تخفي',
    },
    en: {
      title: 'Aunak Hub',
      subtitle: 'Sovereign Unified Edition',
      live: TABS.live.en,
      crisis: TABS.crisis.en,
      learning: TABS.learning.en,
      emotion: TABS.emotion.en,
      biometrics: TABS.biometrics.en,
      community: TABS.community.en,
      enrollment: 'Student Enrollment',
      registry: 'Session Registry',
      diagnostics: 'Diagnostics',
      media: 'Safe Media',
      behavior: 'Behavior Mod',
      classrooms: 'Classrooms',
      scientific: 'Scientific Lib',
      specialists: 'Specialists',
      resources: 'Resources',
      research: 'Research Center',
      reports: 'Performance Reports',
      access: 'Access Control',
      secured: 'AES-256 SECURED',
      online: 'ONLINE',
      logout: 'Logout',
      roleLabels: { admin: 'Super Admin', specialist: 'Specialist', parent: 'Parent' },
      childLabel: 'Child:',
      fieldSession: 'Field session',
      showControls: 'Controls',
      expandNav: 'Expand menu',
      collapseNav: 'Collapse menu',
      roadmapNew: 'New → assessment',
      roadmapActive: 'Active → live/media',
      manualOverride: 'Manual override',
      stealth: 'Stealth',
    },
  };

  const copy = t[lang] ?? t.ar;

  const selectTab = (id) => setActiveTab(id);

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const asideBorderClass = lang === 'ar' ? LUX.asideBorderAr : LUX.asideBorderEn;

  const navButtonClass = (active, locked) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
      active ? '' : locked ? LUX.navLocked : LUX.navIdle
    }`;

  const renderNavButton = ({ id, icon: Icon, activeClass, active, locked, onClick, label }) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      title={sidebarCollapsed ? label : undefined}
      className={`${navButtonClass(active, locked)} ${active ? activeClass : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!sidebarCollapsed && (
        <>
          <span className="flex-1 text-start truncate">{label}</span>
          {locked && <Lock className={`w-3.5 h-3.5 shrink-0 ${LUX.lockIcon}`} />}
        </>
      )}
    </button>
  );

  const sovereignControls = (
    <div className={LUX.sovereignControls}>
      {sovereign && (
        <span className={`hidden lg:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono border border-emerald-400/25 text-emerald-300 bg-emerald-950/30`}>
          <Map className="w-3 h-3" />
          New:{roadmapStats.new} · Active:{roadmapStats.active}
        </span>
      )}
      {sovereign && (
        <SovereignCommandBar
          lang={lang}
          enabled={Boolean(user?.biometricSovereign || user?.fieldInspection)}
          onNavigate={handleVoiceNavigate}
          onManualOverride={toggleManualOverride}
        />
      )}
      {sovereign && (
        <button
          type="button"
          onClick={toggleManualOverride}
          title={copy.manualOverride}
          className={`${LUX.sovereignIconBtn} ${manualOverride ? 'border-amber-400/50 text-amber-300 bg-amber-500/10' : ''}`}
        >
          <HandMetal className="w-4 h-4" />
        </button>
      )}
      {sovereign && (
        <button
          type="button"
          onClick={toggleStealthHeader}
          title={copy.stealth}
          className={`${LUX.sovereignIconBtn} ${stealthActive ? LUX.sovereignIconBtnActive : ''}`}
        >
          <EyeOff className="w-4 h-4" />
        </button>
      )}
      <span className={`hidden sm:inline-flex ${LUX.sovereignOnlineBadge}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {copy.online}
      </span>
      <button
        type="button"
        onClick={toggleLang}
        title={lang === 'ar' ? 'English' : 'العربية'}
        className={LUX.sovereignIconBtn}
        aria-label={lang === 'ar' ? 'English Version' : 'النسخة العربية'}
      >
        <Globe className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={toggleAudio}
        title={audioOn ? 'Sovereign Audio: ON' : 'Sovereign Audio: OFF'}
        className={`${LUX.sovereignIconBtn} ${audioOn ? LUX.sovereignIconBtnActive : ''}`}
        aria-label={audioOn ? 'Mute audio' : 'Enable audio'}
      >
        {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
      <button type="button" onClick={logout} className={LUX.sovereignLogoutBtn}>
        <LogOut className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{copy.logout}</span>
      </button>
    </div>
  );

  return (
    <div className={LUX.root} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={LUX.pageWrapGradient} aria-hidden />

      <aside
        className={`${LUX.asideShell} ${asideBorderClass} ${sidebarCollapsed ? LUX.asideShellCollapsed : ''} transition-[width] duration-300`}
      >
        <div className={sidebarCollapsed ? LUX.headerSectionCompact : LUX.headerSection}>
          <div className={`flex w-full items-center ${sidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className={LUX.sovereignIconBtn}
              title={sidebarCollapsed ? copy.expandNav : copy.collapseNav}
              aria-label={sidebarCollapsed ? copy.expandNav : copy.collapseNav}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          {!sidebarCollapsed && (
            <>
              <button type="button" onClick={onLogoTap} className={LUX.logoFocus} aria-label="Platform logo">
                <PlatformLogo lang={lang} className={HEADER_LOGO_CLASS} iconClassName="w-14 h-14" />
              </button>
              <div>
                <h1 className={`${LUX.hubTitleGradient} text-lg`}>{copy.title}</h1>
                <p className={`${LUX.subtitle} text-[10px]`}>{copy.subtitle}</p>
              </div>
            </>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className={LUX.userCardCompact}>
            <UserCircle2 className={`w-8 h-8 shrink-0 ${LUX.goldText}`} strokeWidth={1.4} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold truncate ${LUX.goldText}`}>{user?.name}</p>
              <p className={`text-[9px] font-mono ${LUX.goldMono}`}>
                {copy.roleLabels[role] ?? role} • {(PLAN_LABELS[lang] ?? PLAN_LABELS.ar)[plan]}
              </p>
              {isSovereignOwner(user) && (
                <span className={LUX.sovereignBadge}>{lang === 'ar' ? 'سيادي' : 'Sovereign'}</span>
              )}
              {role === ROLES.PARENT && user?.childCode && (
                <p className={`text-[9px] font-mono truncate ${LUX.muted}`}>
                  {copy.childLabel} {user.childName} • {user.childCode}
                </p>
              )}
            </div>
          </div>
        )}

        <nav className={`${LUX.navArea} ${LUX.navScroll}`} aria-label={lang === 'ar' ? 'قائمة المواضيع' : 'Topics menu'}>
          {MAIN_NAV_ITEMS.filter(({ id }) => sectionCanAccess(user, role, id)).map(({ id, icon, activeClass }) => {
            const locked = !planAllows(plan, id);
            return renderNavButton({
              id,
              icon,
              activeClass,
              active: requestedTab === id,
              locked,
              onClick: () => setActiveTab(id),
              label: copy[id],
            });
          })}
          {NAV_ITEMS.filter(({ id }) => sectionCanAccess(user, role, id)).map(({ id, icon, activeClass }) => {
            const locked = !planAllows(plan, id);
            return renderNavButton({
              id,
              icon,
              activeClass,
              active: !MainSection && tabId === id,
              locked,
              onClick: () => selectTab(id),
              label: copy[id],
            });
          })}
        </nav>
      </aside>

      <div className={LUX.contentColumn}>
        <header className={`${LUX.sovereignTopBar} ${isFieldSession ? LUX.sovereignTopBarCompact : ''}`}>
          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {isFieldSession && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-400/30 animate-pulse">
                  <Activity className="w-3 h-3" /> {copy.fieldSession}
                </span>
              )}
              <span className={`hidden md:inline text-[10px] font-mono ${LUX.muted}`}>{copy.secured}</span>
            </div>
            {sovereign && (
              <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <span className="text-emerald-400/90">{copy.roadmapNew}: {roadmapStats.new}</span>
                <span className="text-[#c9a962]/90">{copy.roadmapActive}: {roadmapStats.active}</span>
              </div>
            )}
          </div>
          {sovereignControls}
        </header>

        <main className={`${LUX.main} lux-main-scroll ${tabId === 'live' && !MainSection ? 'p-0' : 'p-6'}`}>
          {gaze.visible && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-100 text-sm font-mono flex items-start gap-2 relative z-10">
              <Eye className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-amber-300" />
              <div>
                <p className="font-bold text-amber-200 mb-1">{gaze.alertTitle}</p>
                <p>{gaze.typedAlert}</p>
              </div>
            </div>
          )}
          {meltdown.meltdownRisk && (
            <div className={`mb-4 p-4 rounded-2xl border text-sm font-mono flex items-start gap-2 relative z-10 ${meltdown.fusedCritical ? 'bg-rose-950/50 border-rose-500/45 text-rose-100' : 'bg-rose-950/40 border-rose-500/35 text-rose-100'}`}>
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-rose-300" />
              <div>
                <p className="font-bold text-rose-200 mb-1">{meltdown.alertTitle}</p>
                <p>{meltdown.alertBody}</p>
              </div>
            </div>
          )}
          {isPaywalled ? (
            <AunakPaywall
              lang={lang}
              featureName={copy[sectionKey] ?? sectionKey}
              currentPlan={plan}
              onActivate={() => patchSession({ subscriptionActivated: false })}
            />
          ) : MainSection ? (
            <MainSection lang={lang} role={role} defaultStealth={isSovereignOwner(user)} />
          ) : (
            <ActivePanel lang={lang} role={role} />
          )}
        </main>
      </div>
    </div>
  );
}
````

## File: src/components/AunakEmotion.jsx
````javascript
import { useMemo, useState, useEffect } from 'react';
import { BrainCircuit, ShieldAlert, ShieldCheck, Smile, Frown, Angry, Meh } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapEmotionSignal } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const ICON_BY_EMOTION = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
  angry: Angry,
  joy: Smile,
  calm: Meh,
};

function getShieldState(emotionId) {
  const id = String(emotionId).toLowerCase();
  if (id.includes('happy') || id.includes('joy')) {
    return {
      level: 'Stable',
      note: 'Child is regulated. Keep current activity pacing.',
      critical: false,
    };
  }
  if (id.includes('neutral') || id.includes('calm')) {
    return {
      level: 'Observing',
      note: 'Attention is acceptable. Use light engagement prompts.',
      critical: false,
    };
  }
  if (id.includes('sad')) {
    return {
      level: 'Caution',
      note: 'Possible emotional drop. Start calm support protocol.',
      critical: true,
    };
  }
  return {
    level: 'Critical',
    note: 'Escalation detected. Smart Shield crisis protocol engaged.',
    critical: true,
  };
}

function resolveIcon(emotionId) {
  const id = String(emotionId).toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_BY_EMOTION)) {
    if (id.includes(key)) return Icon;
  }
  return Meh;
}

function colorFor(emotionId) {
  const id = String(emotionId).toLowerCase();
  if (id.includes('happy') || id.includes('joy')) return 'text-emerald-400';
  if (id.includes('neutral') || id.includes('calm')) return 'text-emerald-400';
  if (id.includes('sad')) return 'text-[#d4af37]';
  if (id.includes('angry')) return 'text-rose-400';
  return 'text-slate-400';
}

export default function AunakEmotion() {
  const { records, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.emotionalMonitoring, {
    mapRecord: mapEmotionSignal,
  });

  const emotions = records.filter((r) => r?.label);
  const [activeEmotion, setActiveEmotion] = useState(null);

  useEffect(() => {
    if (emotions.length > 0) {
      const first = emotions[0].emotionId ?? emotions[0].id;
      setActiveEmotion((prev) =>
        prev && emotions.some((e) => (e.emotionId ?? e.id) === prev) ? prev : first
      );
    } else {
      setActiveEmotion(null);
    }
  }, [records, isEmpty]);

  const shield = useMemo(
    () => (activeEmotion ? getShieldState(activeEmotion) : null),
    [activeEmotion]
  );
  const activeRecord = emotions.find((e) => (e.emotionId ?? e.id) === activeEmotion);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 md:p-10" dir="ltr">
      <header className="max-w-6xl mx-auto mb-8 pb-6 border-b border-[#c9a962]/15">
        <h2 className={`${LUX.titleGradient} flex items-center gap-3`}>
          <BrainCircuit className="w-8 h-8" /> Aunak Emotion Detection
        </h2>
        <p className="text-slate-400 mt-2">Live emotional monitoring from Airtable — no demo data</p>
      </header>

      <AirtableErrorBanner error={error} />

      <main className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-slate-300 mb-5">Emotion Signals</h3>
          {loading ? (
            <AirtableLoading message="Loading emotional monitoring..." />
          ) : isEmpty || emotions.length === 0 ? (
            <AirtableEmpty lang="en" message="No emotional monitoring records in Airtable yet." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {emotions.map((item) => {
                const eid = item.emotionId ?? item.id;
                const Icon = resolveIcon(eid);
                const isActive = activeEmotion === eid;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveEmotion(eid)}
                    className={`rounded-2xl p-5 border transition-all text-left ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'border-white/[0.08] bg-slate-800/40 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 font-bold ${colorFor(eid)}`}>
                        <Icon className="w-5 h-5" /> {item.label}
                      </span>
                      <span className="text-sm font-mono text-slate-400">
                        {item.score != null ? `${item.score}%` : '—'}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-slate-400 mt-3 line-clamp-2">{item.note}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <aside
          className={`border rounded-3xl p-6 shadow-2xl transition-all ${
            !shield
              ? 'border-white/[0.08] bg-[#12121a]/50'
              : shield.critical
                ? 'border-rose-500/40 bg-rose-950/20'
                : 'border-emerald-500/30 bg-emerald-950/10'
          }`}
        >
          <h3 className="text-lg font-bold text-slate-300 mb-4">Smart Shield Status</h3>
          {!shield ? (
            <p className="text-sm text-slate-500">Select a live signal from Airtable to interpret.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                {shield.critical ? (
                  <ShieldAlert className="w-7 h-7 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                )}
                <span className={`font-black text-2xl ${shield.critical ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {shield.level}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeRecord?.note || shield.note}
              </p>
              <div className="mt-5 text-xs text-slate-500 font-mono">
                Active emotion: {String(activeEmotion).toUpperCase()}
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
````

## File: src/components/AunakGate.jsx
````javascript
import { useState, useRef } from "react";
import { KeyRound, ShieldCheck, Loader2, AlertTriangle, ArrowLeft, UserPlus } from "lucide-react";
import PlatformLogo, { GATE_LOGO_CLASS } from "./PlatformLogo";
import AunakBiometrics from "./AunakBiometrics";
import { toggleAppStealth } from "../lib/studentPrivacy";
import AunakEnrollment from "./AunakEnrollment";
import { useAuth, verifyAccessToken } from "../lib/auth";
import { verifyTawasulSpecialistToken } from "../lib/tawasulAuth";
import { isTawasulMvp, isTawasulSpecialistToken } from "../lib/tawasulConfig";
import { isEnrollmentDeepLink, buildEnrollmentUrl, setEnrollmentUrl } from "../lib/enrollmentLink";
import { LUX } from "../lib/luxTheme.js";

export default function AunakGate({ lang = "ar" }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(() => (isEnrollmentDeepLink() ? "enrollment" : "biometric"));
  const [token, setToken] = useState("");
  const [tokenState, setTokenState] = useState("idle");
  const [tokenError, setTokenError] = useState("");

  const t = {
    ar: {
      title: "بوابة عونك",
      subtitle: "النسخة السيادية الموحدة — دخول بيومتري مباشر",
      encrypted: "اتصال مشفر AES-256",
      enrollmentGate: "تسجيل طالب جديد",
      enrollmentDesc: "معالج التسجيل السيادي — بيانات وبصمة وجه في Airtable",
      specialistGate: "بوابة الأخصائيين والإدارة",
      specialistDesc: "أدخل رمز الوصول الخاص (Private Access Token) المسجل في سجل الصلاحيات",
      tokenPlaceholder: "رمز الوصول الخاص...",
      verify: "تحقق ودخول",
      verifying: "جاري التحقق من سجل الصلاحيات...",
      tokenInvalid: "رمز الوصول غير صحيح أو غير مسجل في AunakAccessControl",
      back: "رجوع",
      shareEnrollmentLink: "رابط التسجيل للمشاركة",
      specialistLink: "دخول الأخصائيين",
      enrollmentLink: "تسجيل طالب",
    },
    en: {
      title: "Aunak Gate",
      subtitle: "Sovereign Unified Edition — biometric-first access",
      encrypted: "AES-256 encrypted connection",
      enrollmentGate: "New student enrollment",
      enrollmentDesc: "Sovereign enrollment wizard — data and face biometric in Airtable",
      specialistGate: "Specialists & Admin Gate",
      specialistDesc: "Enter the Private Access Token registered in the access control registry",
      tokenPlaceholder: "Private Access Token...",
      verify: "Verify & Enter",
      verifying: "Verifying against access registry...",
      tokenInvalid: "Invalid token — not registered in AunakAccessControl",
      back: "Back",
      shareEnrollmentLink: "Shareable enrollment link",
      specialistLink: "Specialist login",
      enrollmentLink: "Enroll student",
    },
  };
  const copy = t[lang] ?? t.ar;

  const submitToken = async (e) => {
    e?.preventDefault();
    if (!token.trim() || tokenState === "verifying") return;
    setTokenState("verifying");
    setTokenError("");
    try {
      if (isTawasulMvp() || isTawasulSpecialistToken(token)) {
        const tawasulSession = await verifyTawasulSpecialistToken(token);
        if (tawasulSession) {
          login(tawasulSession);
          return;
        }
        if (isTawasulSpecialistToken(token)) {
          setTokenState("error");
          setTokenError(
            lang === "ar"
              ? "رمز غير صالح — تحقق من جدول الأخصائيين (AUN-SPC-…)"
              : "Invalid token — check Specialists table (AUN-SPC-…)"
          );
          return;
        }
      }

      const session = await verifyAccessToken(token);
      if (session) login(session);
      else {
        setTokenState("error");
        setTokenError(copy.tokenInvalid);
      }
    } catch (err) {
      setTokenState("error");
      setTokenError(err?.message ?? copy.tokenInvalid);
    }
  };

  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  const onLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => {
      logoTapCount.current = 0;
    }, 800);
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
      toggleAppStealth();
    }
  };

  const openEnrollment = () => {
    setMode("enrollment");
    setEnrollmentUrl(true);
  };

  const resetMode = () => {
    setEnrollmentUrl(false);
    setMode("biometric");
    setToken("");
    setTokenState("idle");
    setTokenError("");
  };

  if (mode === "enrollment") {
    const enrollmentUrl = buildEnrollmentUrl();
    return (
      <div dir={lang === "ar" ? "rtl" : "ltr"} className={LUX.pageWrap}>
        <div className={LUX.pageWrapGradient} aria-hidden />
        <div className={`relative z-10 ${LUX.page}`}>
          <div className={LUX.enrollmentBar}>
            <button type="button" onClick={resetMode} className={LUX.backMuted}>
              <ArrowLeft className="w-4 h-4" /> {copy.back}
            </button>
            <label className={`block text-xs ${LUX.muted}`}>{copy.shareEnrollmentLink}</label>
            <input
              type="text"
              readOnly
              dir="ltr"
              value={enrollmentUrl}
              onFocus={(e) => e.target.select()}
              className={LUX.enrollmentInput}
            />
          </div>
          <AunakEnrollment
            lang={lang}
            onEnrolled={() => {
              setEnrollmentUrl(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className={LUX.pageWrap}>
      <div className={LUX.pageWrapGradient} aria-hidden />
      <div className={`relative z-10 ${LUX.pageFlex}`}>
        <header className={LUX.header}>
          <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto w-full">
            <div className="flex flex-col items-center gap-3 text-center w-full">
              <button
                type="button"
                onClick={onLogoTap}
                className={LUX.logoFocus}
                aria-label={lang === "ar" ? "شعار عونك" : "Aunak logo"}
              >
                <PlatformLogo lang={lang} className={GATE_LOGO_CLASS} iconClassName="w-20 h-20 sm:w-28 sm:h-28" />
              </button>
              <div>
                <h1 className={LUX.titleGradient}>{copy.title}</h1>
                <p className={LUX.subtitle}>{copy.subtitle}</p>
              </div>
            </div>
            <div className={LUX.encryptedBadge}>
              <ShieldCheck className="w-4 h-4" /> {copy.encrypted}
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {mode === "biometric" && (
            <AunakBiometrics lang={lang} gateMode autoEnterOnMatch />
          )}

          {mode === "token" && (
            <form onSubmit={submitToken} className={LUX.formGlass}>
              <div className="text-center mb-6">
                <KeyRound className={`w-12 h-12 mx-auto mb-4 ${LUX.goldText}`} />
                <h2 className={LUX.formHeading}>{copy.specialistGate}</h2>
                <p className={`${LUX.muted} text-sm mt-2`}>{copy.specialistDesc}</p>
              </div>
              <input
                type="password"
                dir="ltr"
                value={token}
                disabled={tokenState === "verifying"}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (tokenState === "error") {
                    setTokenState("idle");
                    setTokenError("");
                  }
                }}
                placeholder={copy.tokenPlaceholder}
                className={LUX.inputGlass}
              />
              {tokenState === "error" && tokenError && (
                <div className="flex items-start gap-2 text-rose-300 text-sm mb-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{tokenError}</span>
                </div>
              )}
              {tokenState === "verifying" && (
                <div className={`flex items-center gap-2 ${LUX.goldMono} text-sm mb-4 justify-center`}>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{copy.verifying}</span>
                </div>
              )}
              <button type="submit" disabled={tokenState === "verifying"} className={LUX.submitGold}>
                {copy.verify}
              </button>
              <button type="button" onClick={resetMode} className={`${LUX.backLink} block mx-auto`}>
                {copy.back}
              </button>
            </form>
          )}

          {mode === "biometric" && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <button type="button" onClick={() => setMode("token")} className={LUX.backLink}>
                <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                {copy.specialistLink}
              </button>
              <button type="button" onClick={openEnrollment} className={LUX.backLink}>
                <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                {copy.enrollmentLink}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
````

## File: src/components/AunakLiveDashboard.jsx
````javascript
import { useEffect } from 'react';
import { useStudents } from '../hooks/useStudents';
import { parseHarmonyScore } from '../lib/airtable';
import { EYE_MAP_CELL_COUNT, EYE_MAP_COLS } from '../lib/airtableMappers';
import { Activity, RefreshCw, AlertCircle, UserCheck, Lock, Eye } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isActiveB2B } from '../lib/plans';
import { startProcessingHum } from '../lib/sovereignAudio';
import { LUX } from '../lib/luxTheme.js';

function hasEyeMapData(student) {
  const map = student?.eyeMapData;
  return Array.isArray(map) && map.length > 0 && map.some((v) => v > 0);
}

function EyeTrackingGrid({ student, emptyLabel }) {
  const hasSession = hasEyeMapData(student);
  const cells = hasSession ? student.eyeMapData.slice(0, EYE_MAP_CELL_COUNT) : null;

  return (
    <div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${EYE_MAP_COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: EYE_MAP_CELL_COUNT }, (_, i) => {
          const intensity = cells?.[i] ?? 0;
          if (!hasSession || !cells) {
            return <span key={i} className={`aspect-square ${LUX.eyeMapCellEmpty}`} />;
          }
          return (
            <span
              key={i}
              className={`aspect-square ${LUX.eyeMapCellActive}`}
              style={{ opacity: 0.25 + intensity * 0.75 }}
            />
          );
        })}
      </div>
      {!hasSession && (
        <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">{emptyLabel}</p>
      )}
    </div>
  );
}

export default function AunakLiveDashboard({ lang = 'ar' }) {
  const { students, loading, refetch, error } = useStudents(lang);
  const { user } = useAuth();
  // Value Lock: درجة التناغم وخرائط تتبع العين حصرية لباقة B2B النشطة فأعلى.
  const b2bUnlocked = isActiveB2B(user?.plan);
  const list = Array.isArray(students) ? students : [];

  // Data Processing Hum — يعمل طوال بقاء الـ AI Terminal مفتوحاً (حتى في الخلفية).
  useEffect(() => {
    const hum = startProcessingHum();
    return () => hum.stop();
  }, []);


  const t = {
    ar: {
      title: 'لوحة المتابعة التربوية والتأهيلية الحية',
      subtitle: 'بيانات حقيقية متزامنة لحظياً من Airtable',
      syncing: 'جاري المزامنة...',
      refresh: 'تحديث البيانات',
      loading: 'جاري سحب بيانات الأطفال من الخادم السيادي (Airtable)...',
      noStudents: 'لم يتم العثور على أطفال!',
      noStudentsHint: 'تأكد من إعداد VITE_AIRTABLE_PAT و VITE_AIRTABLE_BASE_ID في Vercel أو .env.local، وأن جدول الطلاب يحتوي على سجلات.',
      noName: 'بدون اسم',
      code: 'كود',
      diagnosis: 'التشخيص الطبي',
      unspecified: 'غير محدد',
      harmony: 'درجة التناغم (Harmony)',
      pending: 'قيد التقييم',
      eyeMap: 'خريطة تتبع العين',
      eyeMapEmpty: 'لم يُجرَ اختبار بصري بعد',
      exclusive: 'ميزة حصرية للمراكز المعتمدة',
    },
    en: {
      title: 'Live Educational & Rehabilitative Dashboard',
      subtitle: 'Real-time data synced from Airtable',
      syncing: 'Syncing...',
      refresh: 'Refresh Data',
      loading: 'Fetching student records from Airtable...',
      noStudents: 'No students found!',
      noStudentsHint: 'Set VITE_AIRTABLE_PAT and VITE_AIRTABLE_BASE_ID in Vercel or .env.local, and ensure the students table has records.',
      noName: 'Unnamed',
      code: 'Code',
      diagnosis: 'Medical Diagnosis',
      unspecified: 'Unspecified',
      harmony: 'Harmony Score',
      pending: 'Pending assessment',
      eyeMap: 'Eye-Tracking Map',
      eyeMapEmpty: 'No eye-tracking session yet',
      exclusive: 'Exclusive to certified centers',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen text-slate-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className={`${LUX.titleGradient} flex items-center gap-3`}>
            <Activity className="w-8 h-8" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 font-mono">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-5 py-2.5 rounded-xl font-bold transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? copy.syncing : copy.refresh}
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse text-lg font-mono">
          {copy.loading}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-rose-400 flex flex-col items-center gap-4 bg-rose-500/5 rounded-3xl border border-rose-500/20">
          <AlertCircle className="w-16 h-16 animate-bounce" />
          <p className="text-lg font-bold">{copy.noStudents}</p>
          <p className="text-sm text-rose-300 max-w-md">{copy.noStudentsHint}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((student) => {
            const harmony = parseHarmonyScore(student.harmonyScore);
            const harmonyClass =
              harmony == null || harmony === 0
                ? LUX.harmonyPending
                : harmony > 80
                  ? 'text-emerald-400'
                  : harmony > 50
                    ? 'text-[#d4af37]'
                    : 'text-rose-400';

            return (
              <div
                key={student.id}
                className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl hover:border-emerald-400/50 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#c9a962]/15">
                  <div className="w-12 h-12 rounded-full bg-[#12121a]/70 flex items-center justify-center border border-white/[0.08]">
                    <UserCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#e8c872]">{student.name || copy.noName}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {copy.code}: <span className="text-[#d4af37]">{student.studentCode || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{copy.diagnosis}:</span>
                    <span className="font-semibold">{student.diagnosis || copy.unspecified}</span>
                  </div>
                  <div className="relative bg-[#0d0d10]/90 p-3 rounded-xl border border-[#c9a962]/15">
                    <div className={`flex justify-between items-center ${b2bUnlocked ? '' : 'blur-[7px] select-none pointer-events-none'}`}>
                      <span className="text-slate-400">{copy.harmony}:</span>
                      <span className={`text-xl font-black ${harmonyClass}`}>
                        {harmony != null && harmony > 0
                          ? `${harmony}%`
                          : copy.pending}
                      </span>
                    </div>
                    {!b2bUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#0d0d10]/90/85 border border-amber-500/40 text-[#e8c872] text-[10px] font-bold flex items-center gap-1.5">
                          <Lock className="w-3 h-3" /> {copy.exclusive}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative bg-[#0d0d10]/90 p-3 rounded-xl border border-[#c9a962]/15">
                    <div className={b2bUnlocked ? '' : 'blur-[7px] select-none pointer-events-none'}>
                      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" /> {copy.eyeMap}
                      </p>
                      <EyeTrackingGrid
                        student={student}
                        emptyLabel={copy.eyeMapEmpty}
                      />
                    </div>
                    {!b2bUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#0d0d10]/90/85 border border-amber-500/40 text-[#e8c872] text-[10px] font-bold flex items-center gap-1.5">
                          <Lock className="w-3 h-3" /> {copy.exclusive}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
````

## File: src/components/AunakScientificItems.jsx
````javascript
import { useState, useEffect, useMemo } from 'react';
import { BookMarked, Layers, BrainCircuit, Database, PlusCircle, Activity } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapScientificItem } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

export default function AunakScientificItems({ lang = 'ar' }) {
  const { records, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.scientificItems, {
    mapRecord: mapScientificItem,
    lang,
  });

  const t = {
    ar: {
      title: 'مكتبة البنود العلمية',
      subtitle: 'بيانات حية من Airtable — المرجع السريري للبنود العلمية',
      addItem: 'إضافة بند جديد',
      totalItems: 'إجمالي البنود',
      itemsUnit: 'بنداً',
      categories: 'التصنيفات العلمية',
      domainItems: (cat) => `بنود مجال: ${cat}`,
      usage: (n) => `تم استخدامه في ${n} خطة علاجية (IEP)`,
      weight: 'الوزن النسبي (AI)',
      emptyLibrary: 'لا توجد بيانات حالياً في مكتبة البنود',
      emptyCategory: 'لا توجد بنود في هذا التصنيف حالياً.',
      aiTitle: 'تحليل الأوزان النسبية للذكاء الاصطناعي',
      aiBody: 'يقوم نظام الذكاء الاصطناعي بتحديث "الوزن النسبي" لكل بند تلقائياً بناءً على معدل نجاحه في جلسات (تعديل السلوك). البنود ذات الأوزان المرتفعة (أعلى من 0.8) سيتم اقتراحها أولاً عند بناء خطط (IEP) الجديدة لضمان أقصى درجات الاستجابة والتناغم.',
    },
    en: {
      title: 'Scientific Items Library',
      subtitle: 'Live Airtable data — clinical reference for scientific items',
      addItem: 'Add New Item',
      totalItems: 'Total Items',
      itemsUnit: 'items',
      categories: 'Scientific Categories',
      domainItems: (cat) => `Domain items: ${cat}`,
      usage: (n) => `Used in ${n} IEP plans`,
      weight: 'Relative Weight (AI)',
      emptyLibrary: 'No data in the scientific items library',
      emptyCategory: 'No items in this category yet.',
      aiTitle: 'AI Relative Weight Analysis',
      aiBody: 'The AI system updates each item\'s relative weight based on success rates in behavior modification sessions. Items above 0.8 are prioritized when building new IEP plans for maximum response and harmony.',
    },
  };

  const copy = t[lang] ?? t.ar;

  const categories = useMemo(() => {
    return [...new Set(records.map((r) => r.category).filter(Boolean))];
  }, [records]);

  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (categories.length && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
    if (!categories.length) {
      setActiveCategory(null);
    }
  }, [categories, activeCategory]);

  const filteredItems = activeCategory
    ? records.filter((item) => item.category === activeCategory)
    : [];
  const totalCount = records.length;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-violet-400 flex items-center gap-3">
            <Database className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <PlusCircle className="w-5 h-5" /> {copy.addItem}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-5 rounded-2xl border border-[#c9a962]/15 mb-4 flex items-center gap-3">
             <Layers className="w-8 h-8 text-violet-500" />
             <div>
                <h3 className="text-sm text-slate-400 font-bold">{copy.totalItems}</h3>
                <p className="text-2xl font-black text-slate-300">
                  {loading ? '…' : totalCount} <span className="text-sm font-normal text-slate-500">{copy.itemsUnit}</span>
                </p>
             </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.categories}</h3>
          {categories.length === 0 && !loading ? (
            <p className="text-sm text-slate-500">{copy.emptyLibrary}</p>
          ) : (
          <nav className="space-y-2">
            {categories.map(cat => (
              <button 
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold transition-all text-sm ${activeCategory === cat ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-lg' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'}`}
              >
                {cat}
                {activeCategory === cat && <Activity className="w-4 h-4" />}
              </button>
            ))}
          </nav>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
                 <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2"><BookMarked className="w-6 h-6 text-violet-400" /> {activeCategory ? copy.domainItems(activeCategory) : copy.emptyLibrary}</h3>
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : isEmpty ? (
                <AirtableEmpty lang={lang} message={copy.emptyLibrary} />
              ) : (
              <div className="space-y-4">
                 {filteredItems.length > 0 ? filteredItems.map(item => (
                    <div key={item.id} className="p-5 bg-[#0d0d10]/90 rounded-2xl border border-[#c9a962]/15 hover:border-violet-500/30 transition-colors flex justify-between items-center group">
                       <div>
                          <h4 className="text-md font-bold text-slate-200">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 font-mono">{copy.usage(item.usage)}</p>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-400 mb-1">{copy.weight}</span>
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold font-mono">{item.weight ?? '—'}</span>
                       </div>
                    </div>
                 )) : (
                    <AirtableEmpty lang={lang} message={copy.emptyCategory} />
                 )}
              </div>
              )}
           </div>

           <div className="bg-violet-900/10 p-8 rounded-3xl border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.05)]">
              <h3 className="text-xl font-bold text-violet-300 mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiTitle}</h3>
              <p className="text-md text-violet-200/80 leading-relaxed bg-violet-950/50 p-5 rounded-xl border border-violet-500/30">
                 {copy.aiBody}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakSessionRegistry.jsx
````javascript
import { useMemo, useState, useEffect, useCallback } from "react";
import { FileText, BrainCircuit, ShieldCheck, Lock, Loader2, AlertTriangle } from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { useAuth, isSovereignOwner } from "../lib/auth";
import GoalEngine from "./GoalEngine";
import { newDynamicSessionId, verifyAun4611SessionAttestation } from "../lib/goalEngine";
import {
  updateStudentRecord,
  getDailyReconciliation,
  approveDailyReconciliation,
  setCenterLedgerCount,
  getField,
} from "../lib/airtable";
import { STUDENT as SF } from "../lib/airtableFields";
import { sealSessionClaim } from "../lib/settlementEngine";
import SettlementConfirmModal from "./SettlementConfirmModal";
import { playWarningPulse } from "../lib/sovereignAudio";
import { isAppStealthActive } from "../lib/studentPrivacy";
import { encryptSessionPayload } from "../lib/sovereignCrypto";
import { LUX } from '../lib/luxTheme.js';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AunakSessionRegistry({ lang = "ar" }) {
  const { students } = useStudents(lang);
  const { user, patchSession } = useAuth();
  const sovereign = isSovereignOwner(user);
  const specialistEmail = user?.email ?? "";
  const sessionDate = todayIsoDate();

  const activeId = user?.activeStudentId ?? user?.childId ?? null;
  const activeStudent = useMemo(
    () => (students || []).find((s) => s.id === activeId) ?? students?.[0] ?? null,
    [students, activeId]
  );

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [sessionFee, setSessionFee] = useState("");
  const [reconciliation, setReconciliation] = useState(null);
  const [ledgerInput, setLedgerInput] = useState("");
  const [ledgerSaving, setLedgerSaving] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const reloadReconciliation = useCallback(async () => {
    if (!specialistEmail) {
      setReconciliation(null);
      return;
    }
    const data = await getDailyReconciliation(sessionDate, specialistEmail, user?.name);
    setReconciliation(data);
    setLedgerInput(String(data?.ledgerCount ?? 0));
  }, [sessionDate, specialistEmail]);

  useEffect(() => {
    reloadReconciliation().catch(() => setReconciliation(null));
  }, [reloadReconciliation]);

  const aiReportFromStudent = useMemo(() => {
    const f = activeStudent?.fields ?? {};
    return getField(f, SF.ai_session_report) || null;
  }, [activeStudent]);

  const paymentFromStudent = useMemo(() => {
    const f = activeStudent?.fields ?? {};
    return getField(f, SF.payment_status) || null;
  }, [activeStudent]);

  useEffect(() => {
    const f = activeStudent?.fields ?? {};
    const feeRaw = getField(f, SF.session_fee);
    if (feeRaw != null && feeRaw !== "") {
      const n = Number(feeRaw);
      setSessionFee(Number.isFinite(n) ? String(n) : "");
    } else {
      setSessionFee("");
    }
  }, [activeStudent?.id, activeStudent?.fields]);

  const t = {
    ar: {
      title: "سجل الجلسات الذكي",
      subtitle: "القلب النابض للمنصة - إدارة 66 حقل بيانات سريرية ومالية مع التشفير السيادي",
      liveSession: "الجلسة السريرية الحية",
      liveRec: "● LIVE REC",
      beneficiary: "الطالب المستفيد",
      connecting: "جاري الاتصال بـ Airtable...",
      startTime: "وقت البدء التلقائي",
      notesLabel: "ملاحظات الجلسة السريرية (نص حر)",
      notesPlaceholder: "قم بتوثيق أحداث الجلسة، الاستجابات، وأي تغيرات سلوكية هنا...",
      aiReport: "التقرير المختصر بالذكاء الاصطناعي",
      aiReportEmpty: "لا يوجد تقرير AI في سجل الطالب — يُولَّد بعد حفظ الجلسة في Airtable.",
      security: "بروتوكولات الأمان السيادية",
      attachmentEncryption: "تشفير المرفقات",
      hiddenFields: "الحقول المالية والمخفية",
      stealthMode: "تم تفعيل \"وضع التخفي\"\nالبيانات محجوبة عن الأخصائي",
      sessionFee: "مستحقات الجلسة",
      paymentStatus: "حالة الدفع",
      paid: "مكتمل",
      encryptButton: "حفظ الملاحظات",
      endSession: "إنهاء الجلسة وتسويتها",
      sealed: "تم ختم الجلسة Sealed — غير قابلة للتعديل",
      saved: "تم حفظ الملاحظات",
      saveErr: "تعذر حفظ الملاحظات",
      reconciliation: "التسوية اليومية",
      specialistClaims: "مطالبات الأخصائي",
      centerLedger: "دفتر المركز",
      difference: "الفرق",
      mismatch: "تنبيه: عدم تطابق بين المطالبات ودفتر المركز",
      sovereignApproved: "معتمد سيادياً",
      pendingApproval: "بانتظار الاعتماد السيادي",
      ledgerCount: "عدد جلسات المركز",
      saveLedger: "حفظ العدد",
      approveReconciliation: "اعتماد التسوية",
      mismatchBlock: "لا يمكن التشفير حتى اعتماد التسوية السيادية",
      biometricRequired: "اعتراض مالي: محرك AUN-4611 لم يثبت حضور الطفل بيومترية حية",
    },
    en: {
      title: "Smart Session Registry",
      subtitle: "Platform core — 66 clinical and financial fields with sovereign encryption",
      liveSession: "Live Clinical Session",
      liveRec: "● LIVE REC",
      beneficiary: "Beneficiary Student",
      connecting: "Connecting to Airtable...",
      startTime: "Auto Start Time",
      notesLabel: "Clinical Session Notes (free text)",
      notesPlaceholder: "Document session events, responses, and behavioral changes here...",
      aiReport: "AI Executive Summary",
      aiReportEmpty: "No AI report on the student record — generated after saving the session in Airtable.",
      security: "Sovereign Security Protocols",
      attachmentEncryption: "Attachment Encryption",
      hiddenFields: "Financial & Hidden Fields",
      stealthMode: "Stealth mode active\nData hidden from specialist",
      sessionFee: "Session Fee",
      paymentStatus: "Payment Status",
      paid: "Completed",
      encryptButton: "Save Notes",
      endSession: "End Session & Settle",
      sealed: "Session Sealed — immutable",
      saved: "Notes saved",
      saveErr: "Could not save session notes",
      reconciliation: "Daily Reconciliation",
      specialistClaims: "Specialist Claims",
      centerLedger: "Center Ledger",
      difference: "Difference",
      mismatch: "Alert: claims vs center ledger mismatch",
      sovereignApproved: "Sovereign approved",
      pendingApproval: "Pending sovereign approval",
      ledgerCount: "Center session count",
      saveLedger: "Save count",
      approveReconciliation: "Approve reconciliation",
      mismatchBlock: "Encryption blocked until sovereign reconciliation approval",
      biometricRequired: "Financial intercept: AUN-4611 engine did not verify live child biometric presence",
    },
  };

  const copy = t[lang] ?? t.ar;
  const hasMismatch = Boolean(reconciliation?.hasMismatch);
  const sovereignApproved = Boolean(reconciliation?.sovereignApproved);
  const attestation = useMemo(
    () => verifyAun4611SessionAttestation({ user, activeStudent }),
    [user, activeStudent]
  );
  const biometricBlocked = !attestation.verified && !sovereign;
  const stealthOn = isAppStealthActive();
  const hideFinancial = stealthOn && !sovereign;
  const encryptBlocked = (hasMismatch && !sovereignApproved) || biometricBlocked;
  const liveSessionActive = Boolean(user?.sessionRegistryOpen);

  useEffect(() => {
    if (!user || user.dynamicSessionId || !patchSession) return;
    patchSession({ dynamicSessionId: newDynamicSessionId() });
  }, [user, user?.dynamicSessionId, patchSession]);

  const dynamicSessionId = user?.dynamicSessionId ?? null;

  const sessionStartDisplay = useMemo(() => {
    if (!user?.sessionStartedAt) return null;
    try {
      return new Date(user.sessionStartedAt).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [user?.sessionStartedAt, lang]);

  const approveSession = async () => {
    if (!activeStudent?.id) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const encryptedNotes = notes ? await encryptSessionPayload(notes, user) : "";
      await updateStudentRecord(activeStudent.id, {
        [SF.clinical_session_notes]: encryptedNotes || notes,
      });
      setSaveMsg(copy.saved);
    } catch (e) {
      setSaveMsg(e?.message || copy.saveErr);
    } finally {
      setSaving(false);
    }
  };

  const openSettlement = () => {
    const liveAttestation = verifyAun4611SessionAttestation({ user, activeStudent });
    if (!liveAttestation.verified && !sovereign) {
      playWarningPulse();
      setSaveMsg(copy.biometricRequired);
      return;
    }
    if (hasMismatch && !sovereignApproved && !sovereign) {
      playWarningPulse();
      setSaveMsg(copy.mismatchBlock);
      return;
    }
    setSettleOpen(true);
  };

  const confirmSettlement = async ({ pinVerified }) => {
    if (!activeStudent?.id) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const encryptedNotes = notes ? await encryptSessionPayload(notes, user) : "";
      await updateStudentRecord(activeStudent.id, {
        [SF.biometric_attendance_verified]: true,
      });
      const next = await sealSessionClaim({
        user,
        activeStudent,
        specialistEmail,
        sessionDate,
        sessionFee,
        notes,
        pinVerified,
      });
      setReconciliation(next);
      setLedgerInput(String(next?.ledgerCount ?? 0));
      setSettleOpen(false);
      patchSession?.({ sessionRegistryOpen: false });
      setSaveMsg(copy.sealed);
      try {
        await fetch("/api/settlement/seal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sealed: true, claimStatus: "Sealed" }),
        });
      } catch {
        /* non-blocking */
      }
    } catch (e) {
      setSaveMsg(e?.message || copy.saveErr);
    } finally {
