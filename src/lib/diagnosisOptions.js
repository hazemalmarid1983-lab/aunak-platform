/**
 * Approved diagnosis catalog — enrollment dropdown reads from here only.
 * `airtableValue` must match Students.diagnosis Single select in Airtable.
 */

export const DIAGNOSIS_OPTIONS = [
  { id: 'autism_spectrum', airtableValue: 'autism_spectrum', ar: 'طيف التوحد', en: 'Autism spectrum' },
  { id: 'adhd', airtableValue: 'adhd', ar: 'تشتت انتباه وفرط حركة', en: 'ADHD' },
  { id: 'learning_difficulty', airtableValue: 'learning_difficulty', ar: 'صعوبات تعلم', en: 'Learning difficulties' },
  { id: 'language_delay', airtableValue: 'language_delay', ar: 'تأخر لغوي', en: 'Language delay' },
  { id: 'under_assessment', airtableValue: 'under_assessment', ar: 'قيد التقييم', en: 'Under assessment' },
];

export function getDiagnosisOptions(lang = 'ar') {
  return DIAGNOSIS_OPTIONS.map((o) => ({
    ...o,
    label: lang === 'en' ? o.en : o.ar,
  }));
}

export function diagnosisLabel(value, lang = 'ar') {
  const hit = DIAGNOSIS_OPTIONS.find((o) => o.airtableValue === String(value ?? '').trim());
  if (!hit) return String(value ?? '').trim() || '—';
  return lang === 'en' ? hit.en : hit.ar;
}

/** Accept airtableValue, id, or Arabic/English label → canonical airtableValue. */
export function normalizeDiagnosisValue(raw) {
  const key = String(raw ?? '').trim();
  if (!key) return '';
  const hit = DIAGNOSIS_OPTIONS.find(
    (o) =>
      o.airtableValue === key ||
      o.id === key ||
      o.ar === key ||
      o.en === key ||
      o.ar.replace(/\s+/g, '') === key.replace(/\s+/g, '')
  );
  return hit?.airtableValue ?? '';
}

export function isValidDiagnosis(value) {
  return Boolean(normalizeDiagnosisValue(value));
}
