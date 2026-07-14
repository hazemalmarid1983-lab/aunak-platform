/**
 * Aunak AI Report Engine — sealed-claim aggregation + professional report composition.
 * Data source: tblDailySessions (tbl3mlewMLvqp6AXB) — read-only Sealed claims.
 */

import { fetchSealedClaimsForStudent, DAILY_SESSION_FIELDS } from './airtable';

export const REPORT_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

export const KNOWN_SPECIALISTS = ['هاجر', 'ساجدة', 'محمد', 'Hajar', 'Sagida', 'Muhammad', 'Sajida'];

const DS = DAILY_SESSION_FIELDS;

const ACADEMIC_RE =
  /هدف|تعل[مم]|قراء|كتاب|مهار|أكاد|درس|نشاط|تمارين|إدراك|فهم|حساب|لغة|skill|goal|learn|read|write|academic|task|lesson|progress|تحصيل|إنجاز/i;

const BEHAVIOR_RE =
  /سلوك|انفع|نزو|هدو|تواصل|انتباه|اجتماع|نفس|مزاج|تعاون|اندماج|behavior|emotion|social|attention|calm|tantrum|meltdown|استقرار|تنظيم/i;

const RECOMMENDATION_RE =
  /يوص|ينصح|متابع|منزل|ولي|تكرار|تدريب|recommend|home|follow|practice|parent|daily|routine/i;

export function computeDateRange(period = REPORT_PERIODS.WEEKLY, referenceDate = new Date()) {
  const end = new Date(referenceDate);
  const start = new Date(referenceDate);
  const days = period === REPORT_PERIODS.MONTHLY ? 30 : 7;
  start.setDate(start.getDate() - days + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    days,
  };
}

export function mapSealedClaim(record) {
  const f = record?.fields ?? {};
  return {
    id: record?.id ?? null,
    sessionDate: f[DS.sessionDate] ?? '',
    specialistName: String(f[DS.specialistName] ?? '').trim(),
    studentName: String(f[DS.studentName] ?? '').trim(),
    notes: String(f[DS.notes] ?? '').trim(),
    sealedAt: f[DS.sealedAt] ?? null,
    sessionSequence: f[DS.sessionSequence] ?? null,
    claimStatus: f[DS.claimStatus] ?? 'Sealed',
    pinVerified: Boolean(f[DS.pinVerified]),
  };
}

function sortSessions(sessions) {
  return [...sessions].sort((a, b) => {
    const da = String(a.sessionDate ?? '');
    const db = String(b.sessionDate ?? '');
    if (da !== db) return da.localeCompare(db);
    return (a.sessionSequence ?? 0) - (b.sessionSequence ?? 0);
  });
}

function classifyNote(notes) {
  const text = String(notes ?? '').trim();
  if (!text) return { academic: false, behavioral: false, recommendation: false };
  return {
    academic: ACADEMIC_RE.test(text),
    behavioral: BEHAVIOR_RE.test(text),
    recommendation: RECOMMENDATION_RE.test(text),
  };
}

function groupBySpecialist(sessions) {
  const map = new Map();
  for (const s of sessions) {
    const key = s.specialistName || '—';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.entries()].map(([name, items]) => ({ specialistName: name, sessions: items }));
}

function periodLabel(period, lang) {
  if (lang === 'en') return period === REPORT_PERIODS.MONTHLY ? 'Monthly' : 'Weekly';
  return period === REPORT_PERIODS.MONTHLY ? 'شهري' : 'أسبوعي';
}

function buildAcademicSection(sessions, lang) {
  const academicSessions = sessions.filter((s) => {
    const c = classifyNote(s.notes);
    return c.academic || (!c.behavioral && s.notes);
  });

  const highlights = academicSessions
    .filter((s) => s.notes)
    .map((s) => ({
      date: s.sessionDate,
      specialist: s.specialistName,
      text: s.notes,
    }));

  const bySpecialist = groupBySpecialist(academicSessions).map(({ specialistName, sessions: items }) => ({
    specialistName,
    sessionCount: items.length,
    notes: items.filter((i) => i.notes).map((i) => ({ date: i.sessionDate, text: i.notes })),
  }));

  let summary;
  if (highlights.length === 0) {
    summary =
      lang === 'en'
        ? 'No explicit academic goal notes were recorded in sealed sessions during this period.'
        : 'لم تُسجَّل ملاحظات أكاديمية صريحة في الجلسات المختومة خلال هذه الفترة.';
  } else if (highlights.length === 1) {
    summary =
      lang === 'en'
        ? `One sealed session captured educational progress observations for this period.`
        : `جلسة مختومة واحدة رصدت تقدماً تعليمياً خلال هذه الفترة.`;
  } else {
    summary =
      lang === 'en'
        ? `${highlights.length} sealed sessions documented educational and skill-building progress across ${groupBySpecialist(academicSessions).length} behavior therapist(s).`
        : `${highlights.length} جلسة مختومة وثّقت التقدم الأكاديمي والمهاري عبر ${groupBySpecialist(academicSessions).length} معالج سلوكي.`;
  }

  return { summary, highlights, bySpecialist, sessionCount: academicSessions.length };
}

function buildBehavioralSection(sessions, lang) {
  const behavioralSessions = sessions.filter((s) => {
    const c = classifyNote(s.notes);
    return c.behavioral || (!c.academic && s.notes);
  });

  const observations = behavioralSessions
    .filter((s) => s.notes)
    .map((s) => ({
      date: s.sessionDate,
      specialist: s.specialistName,
      text: s.notes,
    }));

  const bySpecialist = groupBySpecialist(behavioralSessions).map(({ specialistName, sessions: items }) => ({
    specialistName,
    sessionCount: items.length,
    notes: items.filter((i) => i.notes).map((i) => ({ date: i.sessionDate, text: i.notes })),
  }));

  let summary;
  if (observations.length === 0) {
    summary =
      lang === 'en'
        ? 'No behavioral or emotional observations were captured in sealed claims for this period.'
        : 'لم تُسجَّل ملاحظات سلوكية أو انفعالية في المطالبات المختومة خلال هذه الفترة.';
  } else {
    const stableHint = observations.some((o) => /هدو|استقر|تحس|calm|stable|improv/i.test(o.text));
    summary =
      lang === 'en'
        ? stableHint
          ? `Behavioral monitoring across ${observations.length} session note(s) indicates periods of regulation and observable emotional patterns.`
          : `Behavioral and emotional patterns were documented across ${observations.length} sealed session note(s).`
        : stableHint
          ? `رصد سلوكي عبر ${observations.length} ملاحظة جلسة يُظهر فترات من التنظيم وأنماطاً انفعالية قابلة للملاحظة.`
          : `وُثّقت أنماط سلوكية وانفعالية عبر ${observations.length} ملاحظة في جلسات مختومة.`;
  }

  return { summary, observations, bySpecialist, sessionCount: behavioralSessions.length };
}

function buildRecommendations(sessions, period, lang) {
  const explicit = sessions
    .filter((s) => classifyNote(s.notes).recommendation && s.notes)
    .map((s) => ({
      date: s.sessionDate,
      specialist: s.specialistName,
      text: s.notes,
    }));

  const items = [];
  const count = sessions.length;

  if (explicit.length > 0) {
    for (const e of explicit) {
      items.push({
        source: 'specialist',
        specialist: e.specialist,
        text:
          lang === 'en'
            ? `[${e.specialist}, ${e.date}] ${e.text}`
            : `[${e.specialist} — ${e.date}] ${e.text}`,
      });
    }
  }

  if (count >= 3) {
    items.push({
      source: 'engine',
      text:
        lang === 'en'
          ? 'Maintain a consistent home behavior-shaping protocol aligned with session days to reinforce skills transferred from the center.'
          : 'حافظوا على بروتوكول تشكيل السلوك المنزلي والتعميم المشترك المتوافق مع أيام الجلسات لتعزيز المهارات المنقولة من المركز.',
    });
  } else if (count > 0) {
    items.push({
      source: 'engine',
      text:
        lang === 'en'
          ? 'Increase ABC session frequency if possible — regular contact supports skill consolidation and behavioral stability.'
          : 'يُفضَّل زيادة انتظام توثيق مصفوفة ABC إن أمكن — التواصل المنتظم يدعم ترسيخ المهارات والاستقرار السلوكي.',
    });
  }

  items.push({
    source: 'engine',
    text:
      lang === 'en'
        ? 'Share daily observations with the assigned behavior therapist before the next sealed ABC session for continuity of care.'
        : 'شاركوا ملاحظاتكم اليومية مع المعالج السلوكي المعيّن قبل جلسة ABC المختومة التالية لضمان استمرارية الرعاية.',
  });

  if (period === REPORT_PERIODS.MONTHLY) {
    items.push({
      source: 'engine',
      text:
        lang === 'en'
          ? 'Review monthly progress with the center coordinator and adjust Active IEP home goals based on sealed session trends.'
          : 'راجعوا التقدم الشهري مع منسق المركز وعدّلوا أهداف IEP المنزلية وفق اتجاهات الجلسات المختومة.',
    });
  }

  const summary =
    lang === 'en'
      ? `${items.length} guidance item(s) for home behavior-shaping follow-up during this ${period} reporting window.`
      : `${items.length} توصية/إرشاد لبروتوكول تشكيل السلوك المنزلي خلال نافذة التقرير ${period === REPORT_PERIODS.MONTHLY ? 'الشهرية' : 'الأسبوعية'}.`;

  return { summary, items, explicitCount: explicit.length };
}

/**
 * Compose a professional performance report from raw sealed session records.
 */
export function composePerformanceReport({
  studentName,
  period = REPORT_PERIODS.WEEKLY,
  startDate,
  endDate,
  sessions = [],
  lang = 'ar',
}) {
  const sorted = sortSessions(sessions);
  const range = startDate && endDate ? { startDate, endDate } : computeDateRange(period);

  return {
    meta: {
      studentName,
      period,
      periodLabel: periodLabel(period, lang),
      startDate: range.startDate,
      endDate: range.endDate,
      generatedAt: new Date().toISOString(),
      sessionCount: sorted.length,
      specialists: [...new Set(sorted.map((s) => s.specialistName).filter(Boolean))],
      dataSource: 'tblDailySessions (Sealed Claims)',
      lang,
    },
    academicProgress: buildAcademicSection(sorted, lang),
    behavioralStability: buildBehavioralSection(sorted, lang),
    recommendations: buildRecommendations(sorted, period, lang),
    sessions: sorted,
  };
}

/** Fetch sealed claims and compose full report. */
export async function generateStudentPerformanceReport({
  studentName,
  period = REPORT_PERIODS.WEEKLY,
  lang = 'ar',
  referenceDate,
}) {
  const range = computeDateRange(period, referenceDate ? new Date(referenceDate) : new Date());
  const records = await fetchSealedClaimsForStudent({
    studentName,
    startDate: range.startDate,
    endDate: range.endDate,
  });
  const sessions = (Array.isArray(records) ? records : []).map(mapSealedClaim);
  return composePerformanceReport({
    studentName,
    period,
    startDate: range.startDate,
    endDate: range.endDate,
    sessions,
    lang,
  });
}

/** Flat text export for print / clipboard. */
export function formatReportAsText(report, lang = 'ar') {
  if (!report) return '';
  const { meta, academicProgress, behavioralStability, recommendations } = report;
  const isAr = lang === 'ar';
  const lines = [];

  lines.push(isAr ? '═══════════════════════════════════════' : '═══════════════════════════════════════');
  lines.push(isAr ? '   تقرير الأداء — منصة عونك السيادية' : '   Performance Report — Aunak Sovereign Platform');
  lines.push(isAr ? '═══════════════════════════════════════' : '═══════════════════════════════════════');
  lines.push('');
  lines.push(isAr ? `المستفيد: ${meta.studentName}` : `Beneficiary: ${meta.studentName}`);
  lines.push(
    isAr
      ? `الفترة: ${meta.periodLabel} (${meta.startDate} → ${meta.endDate})`
      : `Period: ${meta.periodLabel} (${meta.startDate} → ${meta.endDate})`
  );
  lines.push(isAr ? `عدد الجلسات المختومة: ${meta.sessionCount}` : `Sealed sessions: ${meta.sessionCount}`);
  lines.push('');

  lines.push(isAr ? '── التقدم الأكاديمي والمهاري ──' : '── Academic & Skill Progress ──');
  lines.push(academicProgress.summary);
  for (const h of academicProgress.highlights) {
    lines.push(`  • [${h.date}] ${h.specialist}: ${h.text}`);
  }
  lines.push('');

  lines.push(isAr ? '── الاستقرار السلوكي والانفعالي ──' : '── Behavioral & Emotional Stability ──');
  lines.push(behavioralStability.summary);
  for (const o of behavioralStability.observations) {
    lines.push(`  • [${o.date}] ${o.specialist}: ${o.text}`);
  }
  lines.push('');

  lines.push(isAr ? '── التوصيات المستقبلية ──' : '── Future Recommendations ──');
  lines.push(recommendations.summary);
  for (const item of recommendations.items) {
    lines.push(`  • ${item.text}`);
  }
  lines.push('');
  lines.push(isAr ? '— مصدر البيانات: جلسات مختومة (Sealed Claims) —' : '— Data source: Sealed Claims —');

  return lines.join('\n');
}
