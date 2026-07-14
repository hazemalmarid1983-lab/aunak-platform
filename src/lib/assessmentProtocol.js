/**
 * Independent Operational Assessment Protocol — MoSD / center gap-filler.
 *
 * NOT a licensed clinical instrument (not CARS/GARS/ADOS).
 * Purpose: unified procedural screening for special-education centers in Oman:
 *  guide → structured observation choices → aggregate → draft report → assessor seal.
 */

import { GOAL_DOMAINS, suggestGoalsForStudent, normalizeSeverity } from './goalBank';

/** Observation scale — easy tap for assessor */
export const OBSERVATION_SCALE = {
  not_observed: {
    id: 'not_observed',
    score: 0,
    ar: 'لم يُلاحَظ',
    en: 'Not observed',
  },
  with_full_prompt: {
    id: 'with_full_prompt',
    score: 1,
    ar: 'يظهر بمساعدة كاملة',
    en: 'Appears with full prompt',
  },
  with_partial_prompt: {
    id: 'with_partial_prompt',
    score: 2,
    ar: 'يظهر بمساعدة جزئية',
    en: 'Appears with partial prompt',
  },
  emerging: {
    id: 'emerging',
    score: 3,
    ar: 'ناشئ / غير ثابت',
    en: 'Emerging / inconsistent',
  },
  independent: {
    id: 'independent',
    score: 4,
    ar: 'باستقلالية مناسبة',
    en: 'Appropriately independent',
  },
};

export const PROTOCOL_PHASES = {
  guide: 'guide',
  assess: 'assess',
  report: 'report',
  sealed: 'sealed',
};

export const PROTOCOL_STATUS = {
  not_started: 'not_started',
  in_progress: 'in_progress',
  draft_report: 'draft_report',
  sealed: 'sealed',
};

/** Procedural guide steps for the assessor */
export const PROTOCOL_GUIDE_STEPS = [
  {
    id: 'prep',
    ar: 'التحضير',
    en: 'Preparation',
    bodyAr:
      'راجع ملف المستفيد (العمر، ملاحظات ولي الأمر، أي تقارير سابقة). حضّر مكاناً هادئاً وأدوات ملاحظة بسيطة (بطاقات، أشياء مفضلة، جدول مصوّر).',
    bodyEn:
      'Review the beneficiary file (age, guardian notes, prior reports). Prepare a calm space and simple observation tools (cards, preferred items, picture schedule).',
  },
  {
    id: 'consent',
    ar: 'التوضيح والموافقة',
    en: 'Briefing & consent',
    bodyAr:
      'وضّح لولي الأمر أن هذا تقييم إجرائي موحّد للمركز وليس تشخيصاً طبياً مرخّصاً. سجّل موافقة الملاحظة إن لزم.',
    bodyEn:
      'Explain to the guardian this is a unified operational center assessment, not a licensed medical diagnosis. Record observation consent if required.',
  },
  {
    id: 'observe',
    ar: 'الملاحظة المنظمة',
    en: 'Structured observation',
    bodyAr:
      'مرّ على بنود المجالات بالترتيب. اختر مستوى الظهور لكل بند، وحدّد نقاط الضعف الظاهرة. لا تترك بنداً فارغاً إلا إذا تعذّرت الملاحظة — عندها اختر «لم يُلاحَظ».',
    bodyEn:
      'Move through domain items in order. Choose the appearance level for each item and mark observed weaknesses. Leave nothing blank unless observation was impossible — then select “Not observed”.',
  },
  {
    id: 'aggregate',
    ar: 'التجميع والتقرير',
    en: 'Aggregation & report',
    bodyAr:
      'بعد اكتمال البنود يجمّع المساعد الإجرائي الإجابات ويُخرج مسودة تقرير. راجعها وعدّل الملاحظات ثم اعتمد التقرير.',
    bodyEn:
      'When items are complete, the procedural assistant aggregates answers into a draft report. Review, edit notes, then seal the report.',
  },
  {
    id: 'plan',
    ar: 'الربط بالخطة الفردية',
    en: 'Link to IEP',
    bodyAr:
      'استخدم المجالات ذات الأولوية لاقتراح أهداف من بنك الأهداف، ثم وثّق الحضور وأدلة التحقق أثناء التنفيذ.',
    bodyEn:
      'Use priority domains to suggest goals from the goal bank, then certify attendance and verification evidence during implementation.',
  },
];

/**
 * Weakness chips — quick tags assessor can multi-select per item
 */
export const WEAKNESS_TAGS = [
  { id: 'attention', ar: 'تشتت انتباه', en: 'Attention drift' },
  { id: 'prompt_dependence', ar: 'اعتماد على المساعدة', en: 'Prompt dependence' },
  { id: 'avoidance', ar: 'تجنب المهمة', en: 'Task avoidance' },
  { id: 'communication_delay', ar: 'تأخر تواصل', en: 'Communication delay' },
  { id: 'social_withdrawal', ar: 'انسحاب اجتماعي', en: 'Social withdrawal' },
  { id: 'motor_difficulty', ar: 'صعوبة حركية', en: 'Motor difficulty' },
  { id: 'sensory', ar: 'حساسية حسية', en: 'Sensory sensitivity' },
  { id: 'transition', ar: 'صعوبة انتقال', en: 'Transition difficulty' },
  { id: 'self_care_gap', ar: 'فجوة عناية بالذات', en: 'Self-care gap' },
  { id: 'behavior_escalation', ar: 'تصعيد سلوكي', en: 'Behavior escalation' },
];

/** @typedef {{ id: string, domain: string, ar: string, en: string, hintAr?: string, hintEn?: string }} ProtocolItem */

/** Comprehensive observation items — 6 domains × 6 items */
/** @type {ProtocolItem[]} */
export const PROTOCOL_ITEMS = [
  // Communication
  { id: 'com-01', domain: 'communication', ar: 'الاستجابة للاسم عند النداء', en: 'Responds to name when called', hintAr: 'نادِ الاسم مرة أو مرتين بمسافة مناسبة', hintEn: 'Call the name once or twice at a suitable distance' },
  { id: 'com-02', domain: 'communication', ar: 'طلب حاجة مفضلة (إشارة / كلمة / جملة)', en: 'Requests a preferred need (gesture / word / phrase)', hintAr: 'ضع شيئاً مفضلاً بعيداً قليلاً ولاحظ طريقة الطلب', hintEn: 'Place a preferred item slightly out of reach' },
  { id: 'com-03', domain: 'communication', ar: 'اتباع تعليمات لفظية بسيطة', en: 'Follows simple verbal instructions', hintAr: 'أعطِ تعليماً من خطوة أو خطوتين مألوفاً', hintEn: 'Give a familiar one- or two-step instruction' },
  { id: 'com-04', domain: 'communication', ar: 'التعليق أو تسمية شيء مألوف', en: 'Comments on or names a familiar item', hintAr: 'اعرض صورة أو غرضاً مألوفاً', hintEn: 'Present a familiar picture or object' },
  { id: 'com-05', domain: 'communication', ar: 'التبادل التواصلي (أخذ ودور في الحوار البسيط)', en: 'Communicative turn-taking in simple exchange', hintAr: 'ابدأ جملة وانتظر رداً', hintEn: 'Start a phrase and wait for a response' },
  { id: 'com-06', domain: 'communication', ar: 'طلب المساعدة بأسلوب مناسب', en: 'Requests help appropriately', hintAr: 'قدّم مهمة تحتاج مساعدة خفيفة', hintEn: 'Offer a task that needs light help' },

  // Social
  { id: 'soc-01', domain: 'social', ar: 'التواصل البصري المناسب أثناء التفاعل', en: 'Appropriate eye contact during interaction', hintAr: 'لاحظ النظر أثناء اللعب أو الحديث', hintEn: 'Observe gaze during play or talk' },
  { id: 'soc-02', domain: 'social', ar: 'الانتباه المشترك مع المعلم أو الزميل', en: 'Joint attention with teacher or peer', hintAr: 'أشر إلى شيء ولاحظ المتابعة', hintEn: 'Point to something and watch follow' },
  { id: 'soc-03', domain: 'social', ar: 'مشاركة نشاط قصير مع آخرين', en: 'Shares a short activity with others', hintAr: 'نشاط ثنائي بسيط لمدة دقائق', hintEn: 'Simple paired activity for a few minutes' },
  { id: 'soc-04', domain: 'social', ar: 'التحية أو الرد الاجتماعي البسيط', en: 'Greeting or simple social response', hintAr: 'عند الدخول أو اللقاء', hintEn: 'At entry or greeting moment' },
  { id: 'soc-05', domain: 'social', ar: 'تقبّل التواجد قرب الآخرين دون انسحاب فوري', en: 'Tolerates proximity of others without immediate withdrawal', hintAr: 'لاحظ المسافة والانسحاب', hintEn: 'Note distance and withdrawal' },
  { id: 'soc-06', domain: 'social', ar: 'أخذ الدور في لعبة أو مهمة', en: 'Takes turns in a game or task', hintAr: 'لعبة تبادل أدوار قصيرة', hintEn: 'Short turn-taking game' },

  // Self-care
  { id: 'sc-01', domain: 'self_care', ar: 'غسل اليدين / النظافة الأساسية', en: 'Hand washing / basic hygiene', hintAr: 'بعد النشاط أو قبل الأكل', hintEn: 'After activity or before eating' },
  { id: 'sc-02', domain: 'self_care', ar: 'الأكل أو الشرب باستقلالية مناسبة للعمر', en: 'Eating or drinking with age-appropriate independence', hintAr: 'لاحظ أثناء الوجبة الخفيفة إن أمكن', hintEn: 'Observe during snack if possible' },
  { id: 'sc-03', domain: 'self_care', ar: 'ارتداء / خلع قطعة ملابس بسيطة', en: 'Putting on / taking off a simple clothing item', hintAr: 'معطف أو حذاء أو قبعة', hintEn: 'Coat, shoes, or hat' },
  { id: 'sc-04', domain: 'self_care', ar: 'ترتيب الأدوات بعد النشاط', en: 'Tidying materials after activity', hintAr: 'اطلب إعادة الأشياء لمكانها', hintEn: 'Ask to return items to place' },
  { id: 'sc-05', domain: 'self_care', ar: 'الانتقال لروتين يومي مألوف (دخول/خروج)', en: 'Follows a familiar daily routine (entry/exit)', hintAr: 'لاحظ بداية أو نهاية الجلسة', hintEn: 'Observe session start or end' },
  { id: 'sc-06', domain: 'self_care', ar: 'الوعي بالسلامة الأساسية (لا يقترب من خطر واضح)', en: 'Basic safety awareness (avoids clear hazards)', hintAr: 'ملاحظة عامة في الغرفة', hintEn: 'General room observation' },

  // Motor
  { id: 'mot-01', domain: 'motor', ar: 'المهارات الحركية الكبرى (جلوس / وقوف / انتقال)', en: 'Gross motor (sit / stand / move)', hintAr: 'لاحظ الاستقرار والتنقل', hintEn: 'Note stability and movement' },
  { id: 'mot-02', domain: 'motor', ar: 'المهارات الحركية الدقيقة (إمساك / تركيب)', en: 'Fine motor (grasp / assemble)', hintAr: 'قطع إدخال أو قلم', hintEn: 'Insert pieces or pencil' },
  { id: 'mot-03', domain: 'motor', ar: 'التآزر البصري الحركي', en: 'Visual-motor coordination', hintAr: 'مطابقة أو تتبع خط', hintEn: 'Matching or line tracing' },
  { id: 'mot-04', domain: 'motor', ar: 'استخدام أدوات بسيطة بأمان', en: 'Uses simple tools safely', hintAr: 'ملعقة، مقص آمن، فأرة…', hintEn: 'Spoon, safe scissors, mouse…' },
  { id: 'mot-05', domain: 'motor', ar: 'التوازن في نشاط قصير', en: 'Balance in a short activity', hintAr: 'وقوف أو مشي على خط', hintEn: 'Stand or walk a line' },
  { id: 'mot-06', domain: 'motor', ar: 'القوة المناسبة للمهمة دون إرهاق سريع', en: 'Adequate task strength without quick fatigue', hintAr: 'لاحظ التعب خلال دقائق', hintEn: 'Note fatigue within minutes' },

  // Cognitive
  { id: 'cog-01', domain: 'cognitive', ar: 'المطابقة (صورة/لون/شكل)', en: 'Matching (picture/color/shape)', hintAr: 'بطاقتان متطابقتان على الأقل', hintEn: 'At least two matching cards' },
  { id: 'cog-02', domain: 'cognitive', ar: 'التصنيف البسيط', en: 'Simple sorting/classification', hintAr: 'مجموعتان واضحتان', hintEn: 'Two clear groups' },
  { id: 'cog-03', domain: 'cognitive', ar: 'اتباع تسلسل من خطوتين أو ثلاث', en: 'Follows a 2–3 step sequence', hintAr: 'قائمة مرئية إن لزم', hintEn: 'Visual list if needed' },
  { id: 'cog-04', domain: 'cognitive', ar: 'الانتباه للمهمة لمدة مناسبة', en: 'Attends to task for an appropriate duration', hintAr: 'سجّل تقريباً بالثواني/الدقائق', hintEn: 'Note approximate seconds/minutes' },
  { id: 'cog-05', domain: 'cognitive', ar: 'حل مشكلة بسيطة ضمن موقف مألوف', en: 'Solves a simple problem in a familiar situation', hintAr: 'مثل الوصول لغرض خلف حاجز بسيط', hintEn: 'e.g. reaching an item behind a simple barrier' },
  { id: 'cog-06', domain: 'cognitive', ar: 'فهم التعليمات المرئية (جدول/بطاقة)', en: 'Understands visual instructions (schedule/card)', hintAr: 'اعرض جدولاً مصوّراً قصيراً', hintEn: 'Show a short picture schedule' },

  // Behavior
  { id: 'beh-01', domain: 'behavior', ar: 'البقاء في منطقة النشاط', en: 'Stays in the activity area', hintAr: 'لاحظ المغادرة المتكررة', hintEn: 'Note repeated leaving' },
  { id: 'beh-02', domain: 'behavior', ar: 'تقبّل إنهاء نشاط مفضّل', en: 'Accepts ending a preferred activity', hintAr: 'استخدم إشارة واضحة أو عدّاً تنازلياً', hintEn: 'Use a clear cue or countdown' },
  { id: 'beh-03', domain: 'behavior', ar: 'الانتقال بين الأنشطة دون تصعيد كبير', en: 'Transitions between activities without major escalation', hintAr: 'من نشاط لآخر', hintEn: 'From one activity to another' },
  { id: 'beh-04', domain: 'behavior', ar: 'استخدام استراتيجية تهدئة أو طلب استراحة', en: 'Uses calm-down strategy or requests a break', hintAr: 'إن ظهرت علامات إحباط', hintEn: 'If frustration signs appear' },
  { id: 'beh-05', domain: 'behavior', ar: 'الاستجابة لحدود الصف/القاعة', en: 'Responds to room/class limits', hintAr: 'قواعد بسيطة واضحة', hintEn: 'Clear simple rules' },
  { id: 'beh-06', domain: 'behavior', ar: 'استقرار السلوك العام أثناء الجلسة', en: 'Overall behavioral stability during the session', hintAr: 'تقدير شامل لنهاية الملاحظة', hintEn: 'Overall estimate at end of observation' },
];

export function getItemsByDomain(domainId) {
  return PROTOCOL_ITEMS.filter((i) => i.domain === domainId);
}

export function listProtocolDomains() {
  const order = Object.keys(GOAL_DOMAINS).sort(
    (a, b) => (GOAL_DOMAINS[a].order ?? 99) - (GOAL_DOMAINS[b].order ?? 99)
  );
  return order.map((id) => ({
    id,
    ...GOAL_DOMAINS[id],
    itemCount: getItemsByDomain(id).length,
  }));
}

export function emptyAnswers() {
  const out = {};
  for (const item of PROTOCOL_ITEMS) {
    out[item.id] = { scale: null, weaknesses: [], note: '' };
  }
  return out;
}

export function countAnswered(answers = {}) {
  return PROTOCOL_ITEMS.filter((i) => answers[i.id]?.scale).length;
}

export function isProtocolComplete(answers = {}) {
  return countAnswered(answers) >= PROTOCOL_ITEMS.length;
}

function scaleMeta(scaleId) {
  return OBSERVATION_SCALE[scaleId] || null;
}

/**
 * Aggregate domain scores 0–100 and priority list.
 */
export function aggregateProtocol(answers = {}) {
  const domains = listProtocolDomains().map((d) => {
    const items = getItemsByDomain(d.id);
    let sum = 0;
    let n = 0;
    const weakTags = {};
    const lowItems = [];

    for (const item of items) {
      const a = answers[item.id];
      const meta = scaleMeta(a?.scale);
      if (!meta) continue;
      sum += meta.score;
      n += 1;
      for (const w of a?.weaknesses || []) {
        weakTags[w] = (weakTags[w] || 0) + 1;
      }
      if (meta.score <= 1) {
        lowItems.push({ id: item.id, ar: item.ar, en: item.en, score: meta.score });
      }
    }

    const max = items.length * 4;
    const pct = n === 0 ? null : Math.round((sum / max) * 100);
    return {
      domainId: d.id,
      labelAr: d.ar,
      labelEn: d.en,
      answered: n,
      total: items.length,
      percent: pct,
      weakTags,
      lowItems,
    };
  });

  const scored = domains.filter((d) => d.percent != null);
  const avg =
    scored.length === 0
      ? null
      : Math.round(scored.reduce((s, d) => s + d.percent, 0) / scored.length);

  const priorities = [...scored].sort((a, b) => a.percent - b.percent).slice(0, 3);

  const allWeak = {};
  for (const d of domains) {
    for (const [k, v] of Object.entries(d.weakTags || {})) {
      allWeak[k] = (allWeak[k] || 0) + v;
    }
  }
  const topWeaknesses = Object.entries(allWeak)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const tag = WEAKNESS_TAGS.find((t) => t.id === id);
      return { id, count, ar: tag?.ar || id, en: tag?.en || id };
    });

  /** Map overall % to support-need hint for goal bank */
  let supportNeedHint = 'moderate';
  if (avg != null) {
    if (avg >= 75) supportNeedHint = 'mild';
    else if (avg < 45) supportNeedHint = 'severe';
  }

  return {
    domains,
    overallPercent: avg,
    priorities,
    topWeaknesses,
    supportNeedHint,
    answeredCount: countAnswered(answers),
    totalItems: PROTOCOL_ITEMS.length,
    complete: isProtocolComplete(answers),
  };
}

/**
 * Compose bilingual draft report (deterministic “AI aggregation” — assessor must seal).
 */
export function composeProtocolReport({
  lang = 'ar',
  studentName = '',
  age = null,
  assessorName = '',
  answers = {},
  assessorNotes = '',
} = {}) {
  const agg = aggregateProtocol(answers);
  const ar = lang !== 'en';
  const name = studentName || (ar ? 'المستفيد' : 'the beneficiary');

  const domainLinesAr = agg.domains
    .filter((d) => d.percent != null)
    .map((d) => `• ${d.labelAr}: ${d.percent}% (${d.answered}/${d.total} بنود)`)
    .join('\n');
  const domainLinesEn = agg.domains
    .filter((d) => d.percent != null)
    .map((d) => `• ${d.labelEn}: ${d.percent}% (${d.answered}/${d.total} items)`)
    .join('\n');

  const priorityLinesAr = agg.priorities
    .map(
      (d, i) =>
        `${i + 1}) ${d.labelAr} (${d.percent}%) — يحتاج تركيزاً في الخطة الفردية`
    )
    .join('\n');
  const priorityLinesEn = agg.priorities
    .map((d, i) => `${i + 1}) ${d.labelEn} (${d.percent}%) — prioritize in the IEP`)
    .join('\n');

  const weakLinesAr =
    agg.topWeaknesses.length === 0
      ? '• لم تُحدَّد وسوم ضعف متكررة'
      : agg.topWeaknesses.map((w) => `• ${w.ar} (×${w.count})`).join('\n');
  const weakLinesEn =
    agg.topWeaknesses.length === 0
      ? '• No recurring weakness tags selected'
      : agg.topWeaknesses.map((w) => `• ${w.en} (×${w.count})`).join('\n');

  const disclaimerAr =
    'تنويه: هذا تقرير تقييم إجرائي موحّد للمراكز — ليس تشخيصاً طبياً ولا بديلاً عن مقاييس مرخّصة (مثل CARS/GARS). القرار النهائي للمقيم المعتمد.';
  const disclaimerEn =
    'Disclaimer: This is a unified operational center assessment report — not a medical diagnosis and not a substitute for licensed instruments (e.g. CARS/GARS). Final judgment rests with the sealed assessor.';

  const supportAr =
    agg.supportNeedHint === 'mild'
      ? 'احتياج بسيط'
      : agg.supportNeedHint === 'severe'
        ? 'احتياج شديد'
        : 'احتياج متوسط';

  const bodyAr = [
    `تقرير التقييم الإجرائي الموحّد — عونك`,
    `المستفيد: ${name}${age != null ? ` · العمر: ${age}` : ''}`,
    `المقيم: ${assessorName || '—'}`,
    `تاريخ المسودة: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
    `الملخص العام: ${agg.overallPercent != null ? `${agg.overallPercent}%` : 'غير مكتمل'} · البنود المكتملة: ${agg.answeredCount}/${agg.totalItems}`,
    `مؤشر مستوى الاحتياج المقترح للخطة: ${supportAr}`,
    '',
    'نتائج المجالات:',
    domainLinesAr || '—',
    '',
    'أولويات التدخل (الأضعف أولاً):',
    priorityLinesAr || '—',
    '',
    'أبرز ملحوظات الضعف المتكررة:',
    weakLinesAr,
    '',
    assessorNotes?.trim() ? `ملاحظات المقيم:\n${assessorNotes.trim()}` : 'ملاحظات المقيم: —',
    '',
    disclaimerAr,
  ].join('\n');

  const bodyEn = [
    `Unified Operational Assessment Report — Aunak`,
    `Beneficiary: ${name}${age != null ? ` · Age: ${age}` : ''}`,
    `Assessor: ${assessorName || '—'}`,
    `Draft date: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
    `Overall summary: ${agg.overallPercent != null ? `${agg.overallPercent}%` : 'incomplete'} · Items completed: ${agg.answeredCount}/${agg.totalItems}`,
    `Suggested IEP support-need band: ${agg.supportNeedHint}`,
    '',
    'Domain results:',
    domainLinesEn || '—',
    '',
    'Intervention priorities (weakest first):',
    priorityLinesEn || '—',
    '',
    'Recurring weakness tags:',
    weakLinesEn,
    '',
    assessorNotes?.trim() ? `Assessor notes:\n${assessorNotes.trim()}` : 'Assessor notes: —',
    '',
    disclaimerEn,
  ].join('\n');

  return {
    lang,
    bodyAr,
    bodyEn,
    body: ar ? bodyAr : bodyEn,
    aggregation: agg,
    generatedAt: new Date().toISOString(),
  };
}

/** Suggest goal IDs from bank using protocol priorities */
export function suggestGoalsFromProtocol({ age, aggregation, limit = 6 } = {}) {
  const severity = normalizeSeverity(aggregation?.supportNeedHint || 'moderate');
  const base = suggestGoalsForStudent({ age, severity, limit: limit * 2 });
  const priorityDomains = new Set((aggregation?.priorities || []).map((p) => p.domainId));
  const preferred = base.filter((g) => priorityDomains.has(g.domain));
  const rest = base.filter((g) => !priorityDomains.has(g.domain));
  return [...preferred, ...rest].slice(0, limit);
}

export function createProtocolSession({
  studentId,
  studentName = '',
  age = null,
  assessorName = '',
  assessorId = '',
} = {}) {
  return {
    version: 1,
    protocolId: 'aunak-operational-assessment-v1',
    studentId,
    studentName,
    age,
    assessorName,
    assessorId,
    status: PROTOCOL_STATUS.not_started,
    phase: PROTOCOL_PHASES.guide,
    answers: emptyAnswers(),
    assessorNotes: '',
    report: null,
    sealedAt: null,
    immutableHash: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
