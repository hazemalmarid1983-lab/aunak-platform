/**
 * Smart monthly scheduler — recurring Sun–Thu weekly template.
 * Morning: 06:00–13:00 · 40min · breakfast break after slot 3 (08:00–08:30).
 * Evening: 16:00–20:00 · 40min continuous.
 */

import { DUTY_SHIFT, SPECIALTY } from './airtableFields.js';

export const SCHEDULER_WEEKDAYS = [
  { key: 0, ar: 'الأحد', en: 'Sunday' },
  { key: 1, ar: 'الإثنين', en: 'Monday' },
  { key: 2, ar: 'الثلاثاء', en: 'Tuesday' },
  { key: 3, ar: 'الأربعاء', en: 'Wednesday' },
  { key: 4, ar: 'الخميس', en: 'Thursday' },
];

export const SPECIALTY_OPTIONS = [
  { value: SPECIALTY.special_education, ar: 'تربية خاصة', en: 'Special Education' },
  { value: SPECIALTY.speech_language, ar: 'نطق ولغة', en: 'Speech & Language' },
  { value: SPECIALTY.occupational_therapy, ar: 'علاج وظيفي', en: 'Occupational Therapy' },
  { value: SPECIALTY.physiotherapy, ar: 'علاج طبيعي', en: 'Physiotherapy' },
  { value: SPECIALTY.psychology, ar: 'نفسي', en: 'Psychology' },
  { value: SPECIALTY.social_work, ar: 'خدمة اجتماعية', en: 'Social Work' },
  { value: SPECIALTY.early_intervention, ar: 'تدخل مبكر', en: 'Early Intervention' },
];

const LS_KEY = 'aunak.smartScheduler.weekly.v1';

function toMinutes(h, m = 0) {
  return h * 60 + m;
}

function formatClock(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Build ordered slots for a duty shift (includes break marker).
 */
export function buildShiftSlots(dutyShift) {
  const shift = String(dutyShift || DUTY_SHIFT.morning).toLowerCase();
  if (shift === DUTY_SHIFT.evening) {
    const slots = [];
    let t = toMinutes(16, 0);
    const end = toMinutes(20, 0);
    let n = 1;
    while (t + 40 <= end) {
      slots.push({
        kind: 'session',
        periodNumber: n,
        startMin: t,
        endMin: t + 40,
        start: formatClock(t),
        end: formatClock(t + 40),
        label: `${formatClock(t)} – ${formatClock(t + 40)}`,
      });
      t += 40;
      n += 1;
    }
    return slots;
  }

  /** Morning: 06:00–13:00, break after 3rd session (ends 08:00). */
  const slots = [];
  let t = toMinutes(6, 0);
  const end = toMinutes(13, 0);
  let n = 1;
  while (t + 40 <= end) {
    slots.push({
      kind: 'session',
      periodNumber: n,
      startMin: t,
      endMin: t + 40,
      start: formatClock(t),
      end: formatClock(t + 40),
      label: `${formatClock(t)} – ${formatClock(t + 40)}`,
    });
    t += 40;
    n += 1;
    if (n === 4) {
      /** After session 3 ends at 08:00 → breakfast 30 min */
      slots.push({
        kind: 'break',
        periodNumber: null,
        startMin: t,
        endMin: t + 30,
        start: formatClock(t),
        end: formatClock(t + 30),
        label: `بريك فطور ${formatClock(t)} – ${formatClock(t + 30)}`,
      });
      t += 30;
    }
  }
  return slots;
}

export function cellKey({ weekday, dutyShift, periodNumber, specialistId }) {
  return `${weekday}|${dutyShift}|${periodNumber}|${specialistId}`;
}

export function readWeeklyTemplate() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : { cells: {} };
    return {
      cells: parsed?.cells && typeof parsed.cells === 'object' ? parsed.cells : {},
      updatedAt: parsed?.updatedAt || null,
    };
  } catch {
    return { cells: {}, updatedAt: null };
  }
}

export function writeWeeklyTemplate(cells) {
  const payload = { cells: cells || {}, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
  return payload;
}

export function assignCell(cells, key, assignment) {
  const next = { ...cells };
  if (!assignment?.studentId) {
    delete next[key];
  } else {
    next[key] = {
      studentId: assignment.studentId,
      studentName: assignment.studentName || '',
    };
  }
  return next;
}

/** Can edit assignments: center admin (ROLES.ADMIN), ministry supervisor, sovereign. */
export function canEditSmartSchedule(user, role) {
  if (!user) return false;
  if (user.isSovereignOwner) return true;
  const r = role || user.role;
  return r === 'admin' || r === 'ministry_supervisor';
}

export function specialtyLabel(value, lang = 'ar') {
  const opt = SPECIALTY_OPTIONS.find((o) => o.value === value);
  if (!opt) return value || '—';
  return lang === 'en' ? opt.en : opt.ar;
}

export function normalizeSpecialty(raw) {
  const v = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (SPECIALTY_OPTIONS.some((o) => o.value === v)) return v;
  if (/special|تربية/.test(v)) return SPECIALTY.special_education;
  if (/speech|نطق/.test(v)) return SPECIALTY.speech_language;
  if (/occup|وظيف/.test(v)) return SPECIALTY.occupational_therapy;
  if (/physio|طبيع/.test(v)) return SPECIALTY.physiotherapy;
  if (/psych|نفس/.test(v)) return SPECIALTY.psychology;
  if (/social|اجتماع/.test(v)) return SPECIALTY.social_work;
  if (/early|مبكر/.test(v)) return SPECIALTY.early_intervention;
  return v;
}
