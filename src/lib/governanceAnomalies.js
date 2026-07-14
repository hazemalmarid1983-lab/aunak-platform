/**
 * Ministry inspector anomaly signals — honest rule-based alerts (not ML diagnosis).
 * Targets: end-of-month attendance fabrication, perfect attendance spikes, goals without evidence.
 */

import { ATTENDANCE_STATUS, listAllSealedAttendance } from './attendanceLedger';
import { listAllGoalEvidence, getStudentGoalPlan } from './iepGoalAssignment';

function dayOfMonth(isoDate) {
  return Number(String(isoDate).slice(8, 10)) || 0;
}

function yearMonth(isoDate) {
  return String(isoDate).slice(0, 7);
}

/**
 * @typedef {{ id: string, severity: 'high'|'medium'|'low', code: string, ar: string, en: string, meta?: object }} Anomaly
 */

/**
 * Detect attendance anomalies across sealed ledger rows.
 * @param {Array} [attendanceRows]
 * @returns {Anomaly[]}
 */
export function detectAttendanceAnomalies(attendanceRows = listAllSealedAttendance()) {
  /** @type {Anomaly[]} */
  const out = [];
  const byStudentMonth = new Map();

  for (const r of attendanceRows) {
    if (!r?.sealed || !r.studentId || !r.date) continue;
    const k = `${r.studentId}::${yearMonth(r.date)}`;
    if (!byStudentMonth.has(k)) byStudentMonth.set(k, []);
    byStudentMonth.get(k).push(r);
  }

  for (const [k, rows] of byStudentMonth) {
    const [studentId, ym] = k.split('::');
    const present = rows.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT);
    const sealedLate = rows.filter((r) => {
      const sealedDay = dayOfMonth(String(r.sealedAt || '').slice(0, 10));
      const attendDay = dayOfMonth(r.date);
      // Sealed on day 28–31 for many earlier dates → classic month-end rewrite pattern
      return sealedDay >= 28 && attendDay <= 20;
    });

    if (sealedLate.length >= 5) {
      out.push({
        id: `att-eom-${studentId}-${ym}`,
        severity: 'high',
        code: 'END_OF_MONTH_BULK_SEAL',
        ar: `توثيق جماعي متأخر لأيام حضور مبكرة في الشهر (${sealedLate.length} يوم) — نمط يشبه تعديل سجل آخر الشهر`,
        en: `Late bulk certification for early-month days (${sealedLate.length}) — resembles end-of-month register rewrite`,
        meta: { studentId, yearMonth: ym, count: sealedLate.length },
      });
    }

    if (present.length >= 18 && rows.every((r) => r.status === ATTENDANCE_STATUS.PRESENT)) {
      out.push({
        id: `att-perfect-${studentId}-${ym}`,
        severity: 'medium',
        code: 'PERFECT_MONTH_PRESENT',
        ar: `حضور 100% لـ ${present.length} يوماً موثّقاً في ${ym} — يستحق مراجعة ميدانية من اللجنة`,
        en: `100% present across ${present.length} certified days in ${ym} — field review by committee advised`,
        meta: { studentId, yearMonth: ym, count: present.length },
      });
    }

    const biometricGaps = present.filter((r) => r.biometricVerified !== true);
    if (present.length >= 8 && biometricGaps.length === present.length) {
      out.push({
        id: `att-nobiometric-${studentId}-${ym}`,
        severity: 'low',
        code: 'NO_BIOMETRIC_ON_PRESENT',
        ar: `حضور موثّق بلا تحقق بالبصمة طوال الشهر (${ym})`,
        en: `Certified present days with no biometric verify all month (${ym})`,
        meta: { studentId, yearMonth: ym },
      });
    }
  }

  return out;
}

/**
 * Goals assigned with high claimed success but zero sealed evidence notes.
 */
export function detectGoalEvidenceAnomalies({
  studentIds = [],
  evidenceRows = listAllGoalEvidence(),
  plansByStudent = null,
} = {}) {
  /** @type {Anomaly[]} */
  const out = [];
  const planIds = new Set(studentIds);

  if (plansByStudent && typeof plansByStudent === 'object') {
    for (const sid of Object.keys(plansByStudent)) planIds.add(sid);
  } else if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('aunak.iepAssignments.v1');
      const plans = raw ? JSON.parse(raw) : [];
      for (const p of Array.isArray(plans) ? plans : []) {
        if (p?.studentId) planIds.add(p.studentId);
      }
    } catch {
      /* ignore */
    }
  }

  for (const studentId of planIds) {
    const plan =
      plansByStudent?.[studentId] ?? getStudentGoalPlan(studentId);
    if (!plan.goals?.length) continue;
    const ev = evidenceRows.filter((e) => e.studentId === studentId);
    const bare = plan.goals.filter((g) => !ev.some((e) => e.goalId === g.goalId));
    if (bare.length >= 2) {
      out.push({
        id: `goal-bare-${studentId}`,
        severity: 'high',
        code: 'GOALS_WITHOUT_EVIDENCE',
        ar: `${bare.length} أهداف في الخطة الفردية بلا دليل تحقق موثّق (ملاحظة صفية/مرفق)`,
        en: `${bare.length} IEP goals with no certified verification evidence (note/attachment)`,
        meta: { studentId, goalIds: bare.map((g) => g.goalId) },
      });
    }

    const highPctNoNote = ev.filter(
      (e) => Number(e.successPercent) >= 90 && String(e.note || '').trim().length < 12
    );
    if (highPctNoNote.length) {
      out.push({
        id: `goal-pct-${studentId}`,
        severity: 'medium',
        code: 'HIGH_PERCENT_WEAK_NOTE',
        ar: `نسب إنجاز مرتفعة (≥90%) مع ملاحظات صفية ضعيفة — ${highPctNoNote.length} سجل`,
        en: `High mastery % (≥90%) with weak classroom notes — ${highPctNoNote.length} records`,
        meta: { studentId, count: highPctNoNote.length },
      });
    }
  }

  return out;
}

/** Combined feed for ministry dashboard */
export function buildGovernanceAlertFeed(opts = {}) {
  const attendance = detectAttendanceAnomalies(opts.attendanceRows);
  const goals = detectGoalEvidenceAnomalies(opts);
  return [...attendance, ...goals].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return (rank[a.severity] ?? 3) - (rank[b.severity] ?? 3);
  });
}
