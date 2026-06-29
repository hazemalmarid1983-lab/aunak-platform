/**
 * Parent dashboard — assessment profile, session ledger, treatment metrics.
 */

import { fetchSealedClaimsForStudent } from './airtable';
import { mapSealedClaim, computeDateRange, REPORT_PERIODS } from './reportEngine';
import { buildAssessmentProfileFromScore, parseStoredAssessmentScore } from './initialAssessmentEngine';
import { getField } from './airtable';
import { STUDENT as SF } from './airtableFields';

const METRIC_FIELDS = [
  { key: 'academicProgress', field: SF.academic_progress, labelAr: 'التقدم الأكاديمي', labelEn: 'Academic progress', color: 'emerald' },
  { key: 'focusLevel', field: SF.focus_level, labelAr: 'مستوى التركيز', labelEn: 'Focus level', color: 'cyan' },
  { key: 'improvementIndex', field: SF.improvement_index, labelAr: 'مؤشر التحسن', labelEn: 'Improvement index', color: 'amber' },
  { key: 'operatingEfficiency', field: SF.operating_efficiency, labelAr: 'كفاءة التشغيل', labelEn: 'Operating efficiency', color: 'violet' },
];

function clampPercent(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.min(100, Math.max(0, Math.round(v)));
}

export function buildParentAssessmentView(student, lang = 'ar') {
  const raw =
    student?.initialAssessmentScore ??
    getField(student?.fields, SF.initial_assessment_score);
  const score = parseStoredAssessmentScore(raw);
  if (score == null) {
    return {
      hasAssessment: false,
      score: null,
      result: null,
      comprehensiveStatus:
        student?.comprehensiveAssessmentStatus ??
        getField(student?.fields, SF.comprehensive_assessment_status) ??
        'not_started',
    };
  }

  return {
    hasAssessment: true,
    score,
    result: buildAssessmentProfileFromScore(score, lang),
    comprehensiveStatus:
      student?.comprehensiveAssessmentStatus ??
      getField(student?.fields, SF.comprehensive_assessment_status) ??
      'not_started',
  };
}

export function buildTreatmentMetrics(student, lang = 'ar') {
  const programmedGoal =
    student?.programmedGoal ?? getField(student?.fields, SF.programmed_goal) ?? null;
  const harmonyScore = student?.harmonyScore ?? null;
  const behaviorIntensity = clampPercent(
    student?.behaviorIntensity ?? getField(student?.fields, SF.behavior_intensity)
  );

  const metrics = METRIC_FIELDS.map(({ key, field, labelAr, labelEn, color }) => {
    const raw = student?.[key] ?? getField(student?.fields, field);
    const value = clampPercent(raw);
    return {
      key,
      label: lang === 'en' ? labelEn : labelAr,
      value,
      color,
    };
  }).filter((m) => m.value != null);

  const behaviorStability =
    behaviorIntensity != null ? clampPercent(100 - behaviorIntensity) : null;

  if (behaviorStability != null) {
    metrics.push({
      key: 'behaviorStability',
      label: lang === 'en' ? 'Behavior stability' : 'استقرار السلوك',
      value: behaviorStability,
      color: 'rose',
    });
  }

  const overall =
    metrics.length > 0
      ? Math.round(metrics.reduce((a, m) => a + (m.value ?? 0), 0) / metrics.length)
      : harmonyScore != null
        ? clampPercent(harmonyScore)
        : null;

  return {
    programmedGoal: programmedGoal ? String(programmedGoal).trim() : null,
    harmonyScore: harmonyScore != null ? clampPercent(harmonyScore) : null,
    metrics,
    overallProgress: overall,
  };
}

export async function fetchParentSessionLedger(student, { days = 90 } = {}) {
  const name = String(student?.name ?? '').trim();
  if (!name) return [];

  try {
    const apiResult = await fetchParentSessionsViaApi(name, days);
    if (apiResult?.sessions?.length) {
      return sortSessions(apiResult.sessions);
    }
  } catch {
    /* server route unavailable */
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);

  try {
    const records = await fetchSealedClaimsForStudent({
      studentName: name,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    });
    const mapped = sortSessions(records.map((r) => mapSealedClaim(r)));
    if (mapped.length) return mapped;
  } catch {
    /* direct client fetch blocked */
  }

  return buildStudentSessionFallback(student);
}

async function fetchParentSessionsViaApi(studentName, days = 90) {
  const params = new URLSearchParams({
    studentName: String(studentName).trim(),
    days: String(days),
  });
  const res = await fetch(`/api/parent/sessions?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data?.sessions)) return null;
  return { sessions: data.sessions, meta: data };
}

/** Fallback ledger from Students row when tblDailySessions is unreachable. */
export function buildStudentSessionFallback(student) {
  const f = student?.fields ?? {};
  const name = String(student?.name ?? getField(f, SF.name) ?? '').trim();
  const attendanceAt = getField(f, SF.biometric_attendance_at);
  const sessionTime = getField(f, SF.session_start_time);
  const notes =
    getField(f, SF.clinical_session_notes) ||
    getField(f, SF.ai_session_report) ||
    getField(f, SF.zero_point_report);
  const status = getField(f, SF.clinical_session_status);
  const verified = Boolean(getField(f, SF.biometric_attendance_verified));

  if (!attendanceAt && !notes && !sessionTime && !status) return [];

  let sessionDate = new Date().toISOString().slice(0, 10);
  if (attendanceAt) {
    const d = new Date(attendanceAt);
    if (!Number.isNaN(d.getTime())) sessionDate = d.toISOString().slice(0, 10);
  }

  const noteParts = [];
  if (status) noteParts.push(String(status));
  if (sessionTime) noteParts.push(String(sessionTime));
  if (notes) noteParts.push(String(notes));

  return [
    {
      id: `student-${student?.id ?? 'row'}-snapshot`,
      sessionDate,
      specialistName: '',
      studentName: name,
      notes: noteParts.join(' · '),
      sealedAt: attendanceAt ?? null,
      sessionSequence: 1,
      claimStatus: 'Sealed',
      pinVerified: verified,
      source: 'student_record',
    },
  ];
}

function sortSessions(sessions) {
  return [...sessions].sort((a, b) => {
    const da = String(a.sessionDate ?? '');
    const db = String(b.sessionDate ?? '');
    if (da !== db) return db.localeCompare(da);
    return (b.sessionSequence ?? 0) - (a.sessionSequence ?? 0);
  });
}

export function sessionAttendanceSummary(sessions, lang = 'ar') {
  const total = sessions.length;
  const specialists = [...new Set(sessions.map((s) => s.specialistName).filter(Boolean))];
  const last = sessions[0] ?? null;

  return {
    total,
    specialistCount: specialists.length,
    lastSessionDate: last?.sessionDate ?? null,
    lastSpecialist: last?.specialistName ?? null,
    label:
      lang === 'en'
        ? `${total} sealed session${total === 1 ? '' : 's'} on record`
        : `${total} جلسة موثّقة في السجل`,
  };
}

export { computeDateRange, REPORT_PERIODS };
