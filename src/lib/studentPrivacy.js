/**
 * Privacy helpers for masking student identifiers in the UI.
 */

export function getMaskedStudentLabel(index, lang = 'ar') {
  const num = String(index + 1).padStart(2, '0');
  return lang === 'ar' ? `طالب-${num}` : `Student-${num}`;
}

export function getStudentInitials(name) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getDisplayStudentName(student, index, revealNames, lang, noNameLabel) {
  if (revealNames) {
    return student.name || noNameLabel;
  }
  return getMaskedStudentLabel(index, lang);
}

export function getDisplayStudentCode(student, revealNames) {
  if (revealNames && student.studentCode) {
    return student.studentCode;
  }
  return null;
}
