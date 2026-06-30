/**
 * Tawasul — Zero Entry: auto-generate programmed_goal from assessment data.
 */

import { buildAssessmentProfileFromScore, parseStoredAssessmentScore } from './initialAssessmentEngine.js';

const GOAL_TEMPLATES = {
  ar: {
    balanced: (name, focus) =>
      `🎯 ${name}: هدف اليوم — تعزيز ${focus || 'التواصل البصري'} عبر لعبة الجزر (3 جولات هادئة).`,
    moderate: (name, focus) =>
      `🎯 ${name}: هدف إجرائي — ${focus || 'تنظيم الانتباه'} · 5 تفاعلات في عالم الجزر + مكافأة نجمة.`,
    elevated: (name, focus) =>
      `🎯 ${name}: هدف عاجل — ${focus || 'تهدئة ثم جذب انتباه'} · ابدأ بتبويب «هدوء» ثم «العب» (5 نجوم).`,
  },
  en: {
    balanced: (name, focus) =>
      `🎯 ${name}: Daily goal — strengthen ${focus || 'eye contact'} via island play (3 calm rounds).`,
    moderate: (name, focus) =>
      `🎯 ${name}: Programmed goal — ${focus || 'attention regulation'} · 5 island interactions + star reward.`,
    elevated: (name, focus) =>
      `🎯 ${name}: Urgent goal — ${focus || 'calm then engage'} · start Calm tab then Play (5 stars).`,
  },
};

function pickFocus(profile, lang) {
  const areas = profile?.focusAreas ?? [];
  if (!areas.length) return null;
  const labels = {
    communication: lang === 'en' ? 'communication' : 'التواصل',
    social: lang === 'en' ? 'social play' : 'اللعب الاجتماعي',
    behavior: lang === 'en' ? 'behavior regulation' : 'تنظيم السلوك',
    sensory: lang === 'en' ? 'sensory calm' : 'التهدئة الحسية',
    language: lang === 'en' ? 'language expression' : 'التعبير اللغوي',
    flexibility: lang === 'en' ? 'flexibility' : 'المرونة',
  };
  return labels[areas[0]] ?? areas[0];
}

/** Build programmed_goal text from assessment score / comprehensive status. */
export function generateProgrammedGoalFromAssessment({
  studentName = 'الطفل',
  scoreRaw,
  comprehensiveStatus = 'completed',
  lang = 'ar',
} = {}) {
  const name = String(studentName ?? 'الطفل').trim() || 'الطفل';
  const status = String(comprehensiveStatus ?? '').toLowerCase();
  if (status && !/completed|complete|done|منته|مكتمل/.test(status)) {
    return null;
  }

  const score = parseStoredAssessmentScore(scoreRaw);
  if (score == null) return null;

  const profile = buildAssessmentProfileFromScore(score, lang);
  const band = profile?.band ?? 'moderate';
  const focus = pickFocus(profile, lang);
  const tpl = GOAL_TEMPLATES[lang]?.[band] ?? GOAL_TEMPLATES.ar[band];
  return tpl(name, focus);
}

export function shouldAutoInjectGoal(fields = {}) {
  const status = String(fields.comprehensive_assessment_status ?? fields.Comprehensive_Assessment_Status ?? '').toLowerCase();
  const score = fields.initial_assessment_score ?? fields.Initial_Assessment_Score ?? fields['Initial Assessment Score'];
  const hasScore = score != null && score !== '';
  const completed = /completed|complete|done|مكتمل/.test(status);
  const goal = fields.programmed_goal ?? fields.Programmed_Goal ?? fields['programmed_goal'];
  const goalEmpty = !goal || String(goal).trim().length < 8;
  return hasScore && completed && goalEmpty;
}
