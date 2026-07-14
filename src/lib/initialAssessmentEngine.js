/**
 * Sovereign screening engine — 12 items × 4 relative-weight dimensions.
 * Dimensions: linguistic · behavioral · cognitive · motor
 * Output drives Dynamic Branching into adaptive comprehensive assessment.
 */

export const SCREENING_DIMENSIONS = ['linguistic', 'behavioral', 'cognitive', 'motor'];

export const ASSESSMENT_DOMAINS = SCREENING_DIMENSIONS;

const DIMENSION_LABELS = {
  ar: {
    linguistic: 'لغوي',
    behavioral: 'سلوكي',
    cognitive: 'معرفي',
    motor: 'حركي',
  },
  en: {
    linguistic: 'Linguistic',
    behavioral: 'Behavioral',
    cognitive: 'Cognitive',
    motor: 'Motor',
  },
};

/** Shared Likert options (0–3). Higher = more concern / need. */
export function getScoringOptions(lang = 'ar') {
  if (lang === 'en') {
    return [
      { value: 0, label: 'Rarely', desc: 'Never or almost never appears' },
      { value: 1, label: 'Sometimes', desc: 'Appears intermittently or in certain situations' },
      { value: 2, label: 'Often', desc: 'Clearly and repeatedly present' },
      { value: 3, label: 'Always', desc: 'Persistent and a fixed challenge' },
    ];
  }
  return [
    { value: 0, label: 'نادراً', desc: 'لا يظهر هذا السلوك أبداً أو نادراً جداً' },
    { value: 1, label: 'أحياناً', desc: 'يظهر السلوك بشكل متقطع أو في ظروف معينة' },
    { value: 2, label: 'غالباً', desc: 'يظهر السلوك بوضوح وتكرار مألوف' },
    { value: 3, label: 'دائماً', desc: 'يظهر السلوك بشكل مستمر ويمثل تحدياً ثابتاً' },
  ];
}

/** Clinical domain definitions — 3 questions each (12 total). */
export function getClinicalDomains(lang = 'ar') {
  const labels = DIMENSION_LABELS[lang] ?? DIMENSION_LABELS.ar;
  const arQs = {
    linguistic: [
      {
        id: 'q1',
        text: 'هل يواجه المستفيد صعوبة في التعبير عن احتياجاته بكلمات أو جمل مفهومة؟',
      },
      {
        id: 'q2',
        text: 'هل يجد المستفيد صعوبة في فهم التعليمات اللفظية البسيطة واتباعها باستقلالية؟',
      },
      {
        id: 'q3',
        text: 'هل يظهر تأخراً واضحاً في تبادل الحوار أو المبادرة بالتواصل اللفظي؟',
      },
    ],
    behavioral: [
      {
        id: 'q4',
        text: 'هل يتجنب المستفيد التواصل البصري أو ينسحب عند محاولة التفاعل الاجتماعي؟',
      },
      {
        id: 'q5',
        text: 'هل يكرر حركات نمطية ملحوظة (رفرفة، هز، دوران) في المواقف اليومية؟',
      },
      {
        id: 'q6',
        text: 'هل يبدي مقاومة شديدة أو غضباً عند تغيير الروتين المعتاد؟',
      },
    ],
    cognitive: [
      {
        id: 'q7',
        text: 'هل يسهل تشتيت انتباه المستفيد ويبدو شارداً أمام المثيرات البصرية؟',
      },
      {
        id: 'q8',
        text: 'هل يواجه صعوبة في تمييز الأرقام أو الحروف أو الألوان مقارنة بأقرانه؟',
      },
      {
        id: 'q9',
        text: 'هل يصعب عليه إتمام مهام متعددة الخطوات تتطلب تسلسلاً منطقياً؟',
      },
    ],
    motor: [
      {
        id: 'q10',
        text: 'هل يظهر حساسية مفرطة تجاه المثيرات الحسية (ضوضاء، إضاءة، ملمس)؟',
      },
      {
        id: 'q11',
        text: 'هل يواجه صعوبات في التآزر الحركي البسيط (تلوين، تتبع، إمساك)؟',
      },
      {
        id: 'q12',
        text: 'هل يجد صعوبة في الاستقرار الحركي والتركيز على نشاط هادف لأكثر من دقيقتين؟',
      },
    ],
  };

  const enQs = {
    linguistic: [
      {
        id: 'q1',
        text: 'Does the beneficiary struggle to express needs with clear words or sentences?',
      },
      {
        id: 'q2',
        text: 'Does the beneficiary struggle to understand and independently follow simple verbal instructions?',
      },
      {
        id: 'q3',
        text: 'Is there a clear delay in conversational turn-taking or initiating verbal contact?',
      },
    ],
    behavioral: [
      {
        id: 'q4',
        text: 'Does the beneficiary avoid eye contact or withdraw when social interaction is attempted?',
      },
      {
        id: 'q5',
        text: 'Does the beneficiary repeat noticeable stereotyped movements (flapping, rocking, spinning)?',
      },
      {
        id: 'q6',
        text: 'Does the beneficiary show strong resistance or anger when routines change?',
      },
    ],
    cognitive: [
      {
        id: 'q7',
        text: 'Is attention easily distracted, appearing distant to visual cues?',
      },
      {
        id: 'q8',
        text: 'Does the beneficiary struggle with basic numbers, letters, or colors versus peers?',
      },
      {
        id: 'q9',
        text: 'Is it hard to complete multi-step tasks that need a logical sequence?',
      },
    ],
    motor: [
      {
        id: 'q10',
        text: 'Does the beneficiary show strong sensory over-reactivity (noise, light, textures)?',
      },
      {
        id: 'q11',
        text: 'Is there clear difficulty with simple motor coordination (coloring, tracing, grasping)?',
      },
      {
        id: 'q12',
        text: 'Is it hard to stay motorically settled on one purposeful activity for more than two minutes?',
      },
    ],
  };

  const bank = lang === 'en' ? enQs : arQs;

  return SCREENING_DIMENSIONS.map((id) => ({
    id,
    name: labels[id],
    questions: bank[id],
  }));
}

/** Flat question list for the quiz UI. */
export function getAssessmentQuestions(lang = 'ar') {
  const options = getScoringOptions(lang);
  return getClinicalDomains(lang).flatMap((domain) =>
    domain.questions.map((q) => ({
      ...q,
      domain: domain.id,
      domainId: domain.id,
      domainName: domain.name,
      options,
    }))
  );
}

/**
 * Relative weights across the four dimensions (sum = 1).
 * Higher raw concern → higher weight → Dynamic Branching target.
 */
export function computeDimensionWeights(answers) {
  const domains = getClinicalDomains('ar');
  const raw = {};
  let total = 0;

  for (const domain of domains) {
    let domainRaw = 0;
    for (const q of domain.questions) {
      const s = Number(answers[q.id]);
      domainRaw += Number.isFinite(s) ? Math.min(3, Math.max(0, s)) : 0;
    }
    raw[domain.id] = domainRaw;
    total += domainRaw;
  }

  const weights = {};
  if (total <= 0) {
    const even = 1 / SCREENING_DIMENSIONS.length;
    for (const id of SCREENING_DIMENSIONS) weights[id] = even;
  } else {
    for (const id of SCREENING_DIMENSIONS) {
      weights[id] = Number((raw[id] / total).toFixed(4));
    }
  }

  const ranked = [...SCREENING_DIMENSIONS].sort((a, b) => weights[b] - weights[a]);
  return {
    raw,
    weights,
    primaryDimension: ranked[0],
    secondaryDimension: ranked[1],
    ranked,
  };
}

/** Dynamic Branching — specialized comprehensive path from relative weights. */
export function resolveDynamicBranch(weightResult) {
  const primary = weightResult?.primaryDimension ?? 'behavioral';
  const secondary = weightResult?.secondaryDimension ?? 'linguistic';
  const pathMap = {
    linguistic: 'vb_mapp_language',
    behavioral: 'gars_behavior',
    cognitive: 'cars_cognition',
    motor: 'cars_motor_sensory',
  };
  return {
    primaryDimension: primary,
    secondaryDimension: secondary,
    clinicalPath: pathMap[primary] ?? 'gars_behavior',
    secondaryPath: pathMap[secondary] ?? 'vb_mapp_language',
    weights: weightResult?.weights ?? {},
  };
}

/** Compute score 0–100, relative weights, and Dynamic Branching target. */
export function computeInitialAssessment(answers, lang = 'ar') {
  const domains = getClinicalDomains(lang);
  const questions = getAssessmentQuestions(lang);
  const weightResult = computeDimensionWeights(answers);
  const branch = resolveDynamicBranch(weightResult);

  let rawTotal = 0;
  const domainScores = {};
  const domainDetails = {};

  for (const domain of domains) {
    let domainRaw = 0;
    for (const q of domain.questions) {
      const s = Number(answers[q.id]);
      const score = Number.isFinite(s) ? Math.min(3, Math.max(0, s)) : 0;
      domainRaw += score;
      rawTotal += score;
    }
    const maxDomain = domain.questions.length * 3;
    const percentage = Math.round((domainRaw / maxDomain) * 100);
    domainScores[domain.id] = percentage;
    domainDetails[domain.id] = {
      name: domain.name,
      percentage,
      rawScore: domainRaw,
      weight: weightResult.weights[domain.id],
    };
  }

  const maxRaw = questions.length * 3;
  const scorePercent = Math.round((rawTotal / maxRaw) * 100);

  let band = 'balanced';
  if (scorePercent >= 66) band = 'elevated';
  else if (scorePercent >= 36) band = 'moderate';

  const strengths = [];
  const focusAreas = [];
  for (const [id, detail] of Object.entries(domainDetails)) {
    if (detail.percentage <= 34) strengths.push(detail.name);
    if (detail.percentage >= 65) focusAreas.push(detail.name);
  }

  const profile = buildProfile({
    band,
    scorePercent,
    strengths,
    focusAreas,
    primaryDimension: branch.primaryDimension,
    lang,
  });

  return {
    scorePercent,
    rawTotal,
    band,
    domainScores,
    domainDetails,
    strengths,
    focusAreas,
    dimensionWeights: weightResult.weights,
    primaryDimension: branch.primaryDimension,
    secondaryDimension: branch.secondaryDimension,
    clinicalPath: branch.clinicalPath,
    dynamicBranch: branch,
    ...profile,
  };
}

function buildProfile({ band, scorePercent, strengths, focusAreas, primaryDimension, lang }) {
  const dimLabel =
    (DIMENSION_LABELS[lang] ?? DIMENSION_LABELS.ar)[primaryDimension] ?? primaryDimension;

  const ar = {
    balanced: {
      title: 'ملف متوازن مع فرص نمو واضحة',
      summary:
        'إجاباتك تشير إلى مهارات أساسية جيدة مع مجالات يمكن تعزيزها مبكراً. الأوزان النسبية ستوجّه التقييم الشامل التكيفي.',
      recommendation: `المسار التخصصي المقترح: البعد ${dimLabel} — تقييم تكيفي بعتبة كمون 280ms وثبات نظرة ≥5ث.`,
    },
    moderate: {
      title: 'إشارات تستحق متابعة مركّزة',
      summary:
        'الأوزان النسبية للأبعاد الأربعة تُظهر أنماطاً تحتاج دعماً منهجياً. التفرع الديناميكي يحدد أولوية CARS/GARS.',
      recommendation: `التوجيه التكيفي: ${dimLabel} أولاً — ثم تعبئة الـ 66 حقلاً العيادياً.`,
    },
    elevated: {
      title: 'أولوية عالية — خطوة فورية مطلوبة',
      summary:
        'الإجابات تعكس احتياجاً واضحاً لتدخل مبكر. لا تشخيص من الأهل — الأعراض والعمر فقط يغذّيان المسار السريري.',
      recommendation: `فعّل الرخصة ثم ادخل المثيرات التكيفية لمسار ${dimLabel} فوراً.`,
    },
  };

  const en = {
    balanced: {
      title: 'Balanced profile with clear growth opportunities',
      summary:
        'Solid foundations with early-strength areas. Relative weights will drive adaptive comprehensive assessment.',
      recommendation: `Specialized path: ${dimLabel} — adaptive stimuli at ≤280ms latency and T-Static ≥5s.`,
    },
    moderate: {
      title: 'Patterns worth focused follow-up',
      summary:
        'Four-dimension relative weights show multi-domain needs. Dynamic branching sets CARS/GARS priority.',
      recommendation: `Adaptive routing: ${dimLabel} first — then fill all 66 clinical fields.`,
    },
    elevated: {
      title: 'High priority — act now',
      summary:
        'Clear early-intervention need. Parents enter symptoms and age only — no parent-selected diagnosis.',
      recommendation: `Activate license then enter adaptive stimuli on the ${dimLabel} track immediately.`,
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
        ? 'Complete all screening items for strength mapping'
        : 'أكمل جميع بنود المسح لرسم نقاط القوة',
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

  const profile = buildProfile({
    band,
    scorePercent: score,
    strengths: [],
    focusAreas: [],
    primaryDimension: 'behavioral',
    lang,
  });

  return {
    scorePercent: score,
    band,
    domainScores: {},
    domainDetails: {},
    strengths: [],
    focusAreas: [],
    dimensionWeights: {},
    primaryDimension: 'behavioral',
    clinicalPath: 'gars_behavior',
    ...profile,
    strengthsText:
      lang === 'en'
        ? 'Complete the four-dimension screening for detailed weight mapping'
        : 'أكمل مسح الأبعاد الأربعة لرسم الأوزان النسبية',
    focusText:
      lang === 'en'
        ? 'Stored screening index — domain weights available after full scan'
        : 'مؤشر المسح المحفوظ — أوزان المجالات متاحة بعد المسح الكامل',
  };
}

/** JSON snapshot for Airtable (score + band + weights + branch). */
export function assessmentScorePayload(result) {
  return JSON.stringify({
    score: result.scorePercent,
    band: result.band,
    domains: result.domainScores,
    weights: result.dimensionWeights,
    primaryDimension: result.primaryDimension,
    clinicalPath: result.clinicalPath,
    dynamicBranch: result.dynamicBranch,
    at: new Date().toISOString(),
  });
}
