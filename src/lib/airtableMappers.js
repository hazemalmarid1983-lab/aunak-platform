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
    name: pick(f, SF.name) || firstTitle(f) || (lang === "en" ? "Unknown student" : "اسم غير معروف"),
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
