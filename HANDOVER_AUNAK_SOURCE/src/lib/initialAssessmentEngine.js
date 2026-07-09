/**
 * Initial free assessment — parent-facing quick screen (6 domains, ~3 min).
 * Not a clinical diagnosis — actionable preliminary profile for conversion.
 */

export const ASSESSMENT_DOMAINS = [
  'communication',
  'social',
  'behavior',
  'sensory',
  'language',
  'flexibility',
];

export function getAssessmentQuestions(lang = 'ar') {
  const ar = [
    {
      id: 'communication',
      domain: 'communication',
      text: 'هل يتواصل طفلك بالنظرات أو الإشارة لطلب شيء يريده؟',
      options: [
        { label: 'نعم بانتظام وبوضوح', score: 0 },
        { label: 'أحياناً', score: 1 },
        { label: 'نادراً', score: 2 },
        { label: 'لا تقريباً', score: 3 },
      ],
    },
    {
      id: 'social',
      domain: 'social',
      text: 'هل يشارك طفلك الفرح أو يهتم بمشاركة اللعب مع أقرانه؟',
      options: [
        { label: 'نعم بشكل طبيعي', score: 0 },
        { label: 'أحياناً مع التشجيع', score: 1 },
        { label: 'يفضل اللعب وحده غالباً', score: 2 },
        { label: 'يتجنب التفاعل الاجتماعي', score: 3 },
      ],
    },
    {
      id: 'behavior',
      domain: 'behavior',
      text: 'هل لدى طفلك حركات أو أصوات متكررة (رفرفة، دوران، ترتيب الأشياء)؟',
      options: [
        { label: 'لا أو نادراً جداً', score: 0 },
        { label: 'أحياناً تحت التوتر', score: 1 },
        { label: 'متكررة يومياً', score: 2 },
        { label: 'شديدة وتؤثر على يومه', score: 3 },
      ],
    },
    {
      id: 'sensory',
      domain: 'sensory',
      text: 'هل يتأثر طفلك بشدة بالأصوات العالية أو الملمس أو الإضاءة؟',
      options: [
        { label: 'لا يتأثر بشكل ملحوظ', score: 0 },
        { label: 'حساسية خفيفة', score: 1 },
        { label: 'حساسية واضحة', score: 2 },
        { label: 'حساسية شديدة تعطل نشاطه', score: 3 },
      ],
    },
    {
      id: 'language',
      domain: 'language',
      text: 'كيف يعبّر طفلك عن احتياجاته (كلمات، جمل، إيماءات)؟',
      options: [
        { label: 'جمل واضحة لعمره', score: 0 },
        { label: 'كلمات مفردة كافية', score: 1 },
        { label: 'كلمات قليلة أو تأخر', score: 2 },
        { label: 'تواصل غير لفظي فقط', score: 3 },
      ],
    },
    {
      id: 'flexibility',
      domain: 'flexibility',
      text: 'كيف يتعامل طفلك مع تغيير الروتين أو الانتقال بين الأنشطة؟',
      options: [
        { label: 'يتكيف بسهولة', score: 0 },
        { label: 'يحتاج تذكيراً بسيطاً', score: 1 },
        { label: 'يضطرب أو يبكي', score: 2 },
        { label: 'أزمة شديدة عند أي تغيير', score: 3 },
      ],
    },
  ];

  const en = [
    {
      id: 'communication',
      domain: 'communication',
      text: 'Does your child use eye contact or pointing to request what they want?',
      options: [
        { label: 'Yes, regularly and clearly', score: 0 },
        { label: 'Sometimes', score: 1 },
        { label: 'Rarely', score: 2 },
        { label: 'Almost never', score: 3 },
      ],
    },
    {
      id: 'social',
      domain: 'social',
      text: 'Does your child share joy or join peers in play?',
      options: [
        { label: 'Yes, naturally', score: 0 },
        { label: 'Sometimes with encouragement', score: 1 },
        { label: 'Prefers solo play', score: 2 },
        { label: 'Avoids social interaction', score: 3 },
      ],
    },
    {
      id: 'behavior',
      domain: 'behavior',
      text: 'Repetitive movements or sounds (flapping, spinning, lining up items)?',
      options: [
        { label: 'No or very rare', score: 0 },
        { label: 'Sometimes under stress', score: 1 },
        { label: 'Daily repetition', score: 2 },
        { label: 'Severe — affects daily life', score: 3 },
      ],
    },
    {
      id: 'sensory',
      domain: 'sensory',
      text: 'Strong reaction to loud sounds, touch, or light?',
      options: [
        { label: 'Not noticeably', score: 0 },
        { label: 'Mild sensitivity', score: 1 },
        { label: 'Clear sensitivity', score: 2 },
        { label: 'Severe — disrupts activity', score: 3 },
      ],
    },
    {
      id: 'language',
      domain: 'language',
      text: 'How does your child express needs (words, sentences, gestures)?',
      options: [
        { label: 'Clear sentences for age', score: 0 },
        { label: 'Enough single words', score: 1 },
        { label: 'Few words or delay', score: 2 },
        { label: 'Non-verbal only', score: 3 },
      ],
    },
    {
      id: 'flexibility',
      domain: 'flexibility',
      text: 'How does your child handle routine changes or transitions?',
      options: [
        { label: 'Adapts easily', score: 0 },
        { label: 'Needs a simple reminder', score: 1 },
        { label: 'Upset or crying', score: 2 },
        { label: 'Severe meltdown on change', score: 3 },
      ],
    },
  ];

  return lang === 'en' ? en : ar;
}

const DOMAIN_LABELS = {
  ar: {
    communication: 'التواصل',
    social: 'الاجتماعي',
    behavior: 'السلوك',
    sensory: 'الحسي',
    language: 'اللغة',
    flexibility: 'المرونة',
  },
  en: {
    communication: 'Communication',
    social: 'Social',
    behavior: 'Behavior',
    sensory: 'Sensory',
    language: 'Language',
    flexibility: 'Flexibility',
  },
};

/** Compute score 0–100 and profile from answers { questionId: optionScore }. */
export function computeInitialAssessment(answers, lang = 'ar') {
  const questions = getAssessmentQuestions(lang);
  let rawTotal = 0;
  const domainScores = {};

  for (const q of questions) {
    const s = Number(answers[q.id]);
    const score = Number.isFinite(s) ? Math.min(3, Math.max(0, s)) : 0;
    rawTotal += score;
    domainScores[q.domain] = score;
  }

  const maxRaw = questions.length * 3;
  const scorePercent = Math.round((rawTotal / maxRaw) * 100);

  let band = 'balanced';
  if (scorePercent >= 66) band = 'elevated';
  else if (scorePercent >= 36) band = 'moderate';

  const labels = DOMAIN_LABELS[lang] ?? DOMAIN_LABELS.ar;
  const strengths = [];
  const focusAreas = [];

  for (const [domain, s] of Object.entries(domainScores)) {
    if (s <= 1) strengths.push(labels[domain]);
    if (s >= 2) focusAreas.push(labels[domain]);
  }

  const profile = buildProfile({ band, scorePercent, strengths, focusAreas, lang });

  return {
    scorePercent,
    rawTotal,
    band,
    domainScores,
    strengths,
    focusAreas,
    ...profile,
  };
}

function buildProfile({ band, scorePercent, strengths, focusAreas, lang }) {
  const ar = {
    balanced: {
      title: 'ملف متوازن مع فرص نمو واضحة',
      summary:
        'إجاباتك تشير إلى مهارات أساسية جيدة مع مجالات يمكن تعزيزها مبكراً. التدخل الموجّه الآن يختصر شهوراً من التأخير.',
      recommendation: 'نوصي بالتقييم الشامل لرسم خطة تأهيل دقيقة خلال 48 ساعة.',
    },
    moderate: {
      title: 'إشارات تستحق متابعة مركّزة',
      summary:
        'النتيجة المبدئية تُظهر أنماطاً تحتاج دعماً منهجياً في أكثر من مجال. كل أسبوع تأخير يقلّل فرص التقدم السريع.',
      recommendation: 'التقييم الشامل الكامل ضروري — يكشف نقاط القوة المخفية ويحدد أولويات الجلسات.',
    },
    elevated: {
      title: 'أولوية عالية — خطوة فورية مطلوبة',
      summary:
        'الإجابات تعكس احتياجاً واضحاً لتدخل مبكر مكثّف. البيانات السيادية لعونك تُظهر أن التأهيل المبكر يُضاعف فرص الاستقلالية.',
      recommendation: 'لا تؤجل — فعّل الباقة الشاملة اليوم وابدأ التقييم السريري المعتمد فوراً.',
    },
  };

  const en = {
    balanced: {
      title: 'Balanced profile with clear growth opportunities',
      summary:
        'Your answers show solid foundations with areas to strengthen early. Guided intervention now saves months of delay.',
      recommendation: 'We recommend the full assessment to build a precise 48-hour action plan.',
    },
    moderate: {
      title: 'Patterns worth focused follow-up',
      summary:
        'This preliminary result shows multi-domain support needs. Each week of delay reduces rapid progress chances.',
      recommendation: 'Full comprehensive assessment is essential — it reveals hidden strengths and session priorities.',
    },
    elevated: {
      title: 'High priority — act now',
      summary:
        'Answers indicate clear need for intensive early intervention. Aunak sovereign data shows early rehab doubles independence odds.',
      recommendation: 'Do not wait — activate the full plan today and start certified clinical assessment immediately.',
    },
  };

  const profiles = lang === 'en' ? en : ar;
  const p = profiles[band] ?? profiles.moderate;

  return {
    title: p.title,
    summary: p.summary,
    recommendation: p.recommendation,
    strengthsText: strengths.length
      ? (lang === 'en' ? 'Strengths: ' : 'نقاط قوة: ') + strengths.join(lang === 'en' ? ', ' : ' · ')
      : lang === 'en'
        ? 'Complete all questions for strength mapping'
        : 'أكمل جميع الأسئلة لرسم نقاط القوة',
    focusText: focusAreas.length
      ? (lang === 'en' ? 'Focus areas: ' : 'مجالات تركيز: ') + focusAreas.join(lang === 'en' ? ', ' : ' · ')
      : lang === 'en'
        ? 'No major focus flags in this pass'
        : 'لا توجد إشارات تركيز بارزة في هذه الجولة',
  };
}

/** Parse stored initial_assessment_score (number or JSON snapshot). */
export function parseStoredAssessmentScore(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.round(raw);
  const direct = Number(raw);
  if (Number.isFinite(direct)) return Math.round(direct);
  try {
    const parsed = JSON.parse(String(raw));
    if (parsed?.score != null && Number.isFinite(Number(parsed.score))) {
      return Math.round(Number(parsed.score));
    }
  } catch {
    /* not JSON */
  }
  return null;
}

/** Rebuild parent-facing profile when only the numeric score is stored. */
export function buildAssessmentProfileFromScore(scorePercent, lang = 'ar') {
  const score = parseStoredAssessmentScore(scorePercent);
  if (score == null) return null;

  let band = 'balanced';
  if (score >= 66) band = 'elevated';
  else if (score >= 36) band = 'moderate';

  const profile = buildProfile({ band, scorePercent: score, strengths: [], focusAreas: [], lang });

  return {
    scorePercent: score,
    band,
    domainScores: {},
    strengths: [],
    focusAreas: [],
    ...profile,
    strengthsText:
      lang === 'en'
        ? 'Complete the free assessment for detailed domain mapping'
        : 'أكمل التقييم المجاني لرسم خريطة المجالات التفصيلية',
    focusText:
      lang === 'en'
        ? 'Stored score — domain breakdown available after full assessment'
        : 'النتيجة المحفوظة — تفصيل المجالات متاح بعد التقييم الشامل',
  };
}

/** JSON snapshot for Airtable (score + band + domains). */
export function assessmentScorePayload(result) {
  return JSON.stringify({
    score: result.scorePercent,
    band: result.band,
    domains: result.domainScores,
    at: new Date().toISOString(),
  });
}
