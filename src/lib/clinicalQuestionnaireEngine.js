/**
 * Clinical questionnaire engine — session lifecycle, scoring, risk bands.
 * Adapted from منصة التقييم server/questionnaire.ts + reportGeneration.ts (deterministic layer).
 */

import {
  ASSESSMENT_PATHWAYS,
  CLINICAL_DOMAINS,
  FREQUENCY_SCALE,
  filterQuestions,
  getRelevantDomains,
} from './clinicalQuestionBank';

export const SESSION_STATUS = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
};

export const RISK_BANDS = {
  low: { id: 'low', ar: 'منخفض', en: 'Low', min: 0, max: 25 },
  moderate: { id: 'moderate', ar: 'متوسط', en: 'Moderate', min: 26, max: 50 },
  elevated: { id: 'elevated', ar: 'مرتفع', en: 'Elevated', min: 51, max: 75 },
  critical: { id: 'critical', ar: 'حرج', en: 'Critical', min: 76, max: 100 },
};

const MIN_COMPLETION_PCT = 80;

export function calculateAgeInMonths({ dateOfBirth, ageYears } = {}) {
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (!Number.isNaN(dob.getTime())) {
      const today = new Date();
      let months = (today.getFullYear() - dob.getFullYear()) * 12;
      months += today.getMonth() - dob.getMonth();
      return Math.max(0, months);
    }
  }
  if (ageYears != null && !Number.isNaN(Number(ageYears))) {
    return Math.round(Number(ageYears) * 12);
  }
  return 72;
}

export function createClinicalSession({
  studentId,
  studentName = '',
  age = null,
  dateOfBirth = null,
  assessmentType = ASSESSMENT_PATHWAYS.both,
  language = 'ar',
  assessorName = '',
  assessorId = '',
} = {}) {
  const ageInMonths = calculateAgeInMonths({ dateOfBirth, ageYears: age });
  const questions = filterQuestions({ assessmentType, ageInMonths });
  const now = new Date().toISOString();
  return {
    id: `cqs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studentId,
    studentName,
    age,
    ageInMonths,
    assessmentType,
    language,
    assessorName,
    assessorId,
    status: SESSION_STATUS.in_progress,
    questionIds: questions.map((q) => q.id),
    answers: {},
    notes: {},
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export function saveClinicalAnswer(session, { questionId, value, note = '' } = {}) {
  if (!session?.questionIds?.includes(questionId)) {
    return { ok: false, error: 'QUESTION_NOT_IN_SESSION' };
  }
  const answers = { ...session.answers, [questionId]: String(value) };
  const notes = { ...session.notes };
  if (note) notes[questionId] = note;
  const answered = Object.keys(answers).length;
  const total = session.questionIds.length;
  const pct = total ? (answered / total) * 100 : 0;
  const status =
    pct >= MIN_COMPLETION_PCT ? SESSION_STATUS.completed : SESSION_STATUS.in_progress;
  return {
    ok: true,
    session: {
      ...session,
      answers,
      notes,
      status,
      updatedAt: new Date().toISOString(),
      completedAt: status === SESSION_STATUS.completed ? new Date().toISOString() : session.completedAt,
    },
  };
}

export function scoreValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function calculateDomainScores(session, questions) {
  const domains = getRelevantDomains(session.assessmentType);
  const byDomain = {};
  for (const domain of domains) {
    byDomain[domain] = { sum: 0, count: 0, max: 0 };
  }
  for (const q of questions) {
    const val = session.answers[q.id];
    if (val == null) continue;
    const s = scoreValue(val);
    if (!byDomain[q.domain]) byDomain[q.domain] = { sum: 0, count: 0, max: 0 };
    byDomain[q.domain].sum += s;
    byDomain[q.domain].count += 1;
    byDomain[q.domain].max += 4;
  }
  const scores = {};
  for (const [domain, agg] of Object.entries(byDomain)) {
    scores[domain] =
      agg.max === 0 ? null : Math.round((agg.sum / agg.max) * 100);
  }
  return scores;
}

export function overallRiskPercent(session, questions) {
  const scores = calculateDomainScores(session, questions);
  const values = Object.values(scores).filter((v) => v != null);
  if (!values.length) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function resolveRiskBand(percent) {
  if (percent == null) return null;
  for (const band of Object.values(RISK_BANDS)) {
    if (percent >= band.min && percent <= band.max) return band;
  }
  return RISK_BANDS.critical;
}

export function sessionProgress(session) {
  const total = session?.questionIds?.length ?? 0;
  const answered = Object.keys(session?.answers ?? {}).length;
  const pct = total ? Math.min(100, (answered / total) * 100) : 0;
  return { total, answered, pct, complete: pct >= MIN_COMPLETION_PCT };
}

export function composeClinicalReport({
  session,
  questions,
  lang = 'ar',
  parentInterview = '',
  clinicalNotes = '',
} = {}) {
  const ar = lang !== 'en';
  const scores = calculateDomainScores(session, questions);
  const overall = overallRiskPercent(session, questions);
  const risk = resolveRiskBand(overall);
  const progress = sessionProgress(session);

  const domainLines = Object.entries(scores)
    .filter(([, v]) => v != null)
    .map(([domain, pct]) => {
      const label = CLINICAL_DOMAINS[domain];
      return ar
        ? `• ${label?.ar ?? domain}: ${pct}%`
        : `• ${label?.en ?? domain}: ${pct}%`;
    })
    .join('\n');

  const priorities = Object.entries(scores)
    .filter(([, v]) => v != null)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([domain, pct], i) => {
      const label = CLINICAL_DOMAINS[domain];
      return ar
        ? `${i + 1}) ${label?.ar ?? domain} (${pct}%) — أولوية للخطة`
        : `${i + 1}) ${label?.en ?? domain} (${pct}%) — plan priority`;
    })
    .join('\n');

  const smartGoals = buildSmartGoals({ scores, lang, studentName: session?.studentName });

  const disclaimerAr =
    'تنويه: هذا تقرير تقييم سريري تشغيلي — ليس تشخيصاً طبياً مرخّصاً. القرار النهائي للمقيم المعتمد.';
  const disclaimerEn =
    'Disclaimer: Operational clinical assessment — not a licensed medical diagnosis. Final judgment rests with the sealed assessor.';

  const bodyAr = [
    'تقرير الاستبيان السريري — عونك',
    `المستفيد: ${session?.studentName || '—'}`,
    `المسار: ${pathwayLabel(session?.assessmentType, 'ar')}`,
    `المقيم: ${session?.assessorName || '—'}`,
    `التقدم: ${progress.answered}/${progress.total} (${Math.round(progress.pct)}%)`,
    overall != null ? `مؤشر الخطر الإجمالي: ${overall}% (${risk?.ar ?? '—'})` : '',
    '',
    'درجات المجالات:',
    domainLines || '—',
    '',
    'أولويات التدخل:',
    priorities || '—',
    clinicalNotes ? `\nملاحظات سريرية:\n${clinicalNotes}` : '',
    parentInterview ? `\nملخص مقابلة ولي الأمر:\n${parentInterview}` : '',
    '',
    'أهداف SMART مقترحة:',
    smartGoals.map((g, i) => `${i + 1}. ${g.goal}`).join('\n') || '—',
    '',
    disclaimerAr,
  ]
    .filter(Boolean)
    .join('\n');

  const bodyEn = [
    'Clinical Questionnaire Report — Aunak',
    `Beneficiary: ${session?.studentName || '—'}`,
    `Pathway: ${pathwayLabel(session?.assessmentType, 'en')}`,
    `Assessor: ${session?.assessorName || '—'}`,
    `Progress: ${progress.answered}/${progress.total} (${Math.round(progress.pct)}%)`,
    overall != null ? `Overall risk index: ${overall}% (${risk?.en ?? '—'})` : '',
    '',
    'Domain scores:',
    domainLines || '—',
    '',
    'Intervention priorities:',
    priorities || '—',
    clinicalNotes ? `\nClinical notes:\n${clinicalNotes}` : '',
    parentInterview ? `\nParent interview summary:\n${parentInterview}` : '',
    '',
    'Suggested SMART goals:',
    smartGoals.map((g, i) => `${i + 1}. ${g.goalEn || g.goal}`).join('\n') || '—',
    '',
    disclaimerEn,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    scores,
    overall,
    risk,
    progress,
    smartGoals,
    bodyAr,
    bodyEn,
    disclaimerAr,
    disclaimerEn,
  };
}

function pathwayLabel(type, lang) {
  const map = {
    asd: { ar: 'مسار طيف التوحد', en: 'Autism pathway' },
    learning_difficulties: { ar: 'مسار صعوبات التعلم', en: 'Learning difficulties pathway' },
    both: { ar: 'تقييم شامل', en: 'Comprehensive assessment' },
  };
  return map[type]?.[lang] ?? type;
}

function buildSmartGoals({ scores, lang, studentName = '' }) {
  const ar = lang !== 'en';
  const name = studentName || (ar ? 'المستفيد' : 'the beneficiary');
  const top = Object.entries(scores || {})
    .filter(([, v]) => v != null)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return top.map(([domain, pct]) => {
    const label = CLINICAL_DOMAINS[domain];
    return {
      domain,
      goal: ar
        ? `خلال 8 أسابيع، ${name} يُظهر تحسناً قابلاً للقياس في ${label?.ar ?? domain} (خط أساس ${pct}%)`
        : `Within 8 weeks, ${name} shows measurable improvement in ${label?.en ?? domain} (baseline ${pct}%)`,
      goalEn: `Within 8 weeks, ${name} shows measurable improvement in ${label?.en ?? domain} (baseline ${pct}%)`,
      specific: ar ? `مهارة واحدة محددة في ${label?.ar}` : `One specific skill in ${label?.en}`,
      measurable: ar ? 'قياس أسبوعي 0–4' : 'Weekly 0–4 scale measure',
      achievable: ar ? '3 جلسات أسبوعياً × 20 دقيقة' : '3 sessions/week × 20 min',
      relevant: ar ? 'مرتبط بالخطة الفردية' : 'Linked to IEP',
      timebound: ar ? '8 أسابيع' : '8 weeks',
    };
  });
}

export function getFrequencyOptions(lang = 'ar') {
  return FREQUENCY_SCALE.map((o) => ({
    value: o.value,
    score: o.score,
    label: lang === 'en' ? o.en : o.ar,
  }));
}
