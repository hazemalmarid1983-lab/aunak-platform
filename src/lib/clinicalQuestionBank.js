/**
 * Clinical questionnaire item bank — ported from منصة التقييم (36 items × 8 domains).
 * Sovereign operational screening — not a licensed diagnostic instrument.
 *
 * Domains align with assessment platform schema:
 * communication · social · behavior · sensory · cognitive · independence · motor · academic
 */

export const CLINICAL_DOMAINS = {
  communication: { ar: 'التواصل', en: 'Communication', order: 1 },
  social: { ar: 'التفاعل الاجتماعي', en: 'Social interaction', order: 2 },
  behavior: { ar: 'السلوك', en: 'Behavior', order: 3 },
  sensory: { ar: 'المعالجة الحسية', en: 'Sensory processing', order: 4 },
  cognitive: { ar: 'المجال المعرفي', en: 'Cognition', order: 5 },
  independence: { ar: 'الاستقلالية', en: 'Independence', order: 6 },
  motor: { ar: 'المهارات الحركية', en: 'Motor skills', order: 7 },
  academic: { ar: 'المهارات الأكاديمية', en: 'Academic skills', order: 8 },
};

export const ASSESSMENT_PATHWAYS = {
  asd: 'asd',
  learning_difficulties: 'learning_difficulties',
  both: 'both',
};

/** Frequency scale 0–4 (higher = more concern). */
export const FREQUENCY_SCALE = [
  { value: '0', score: 0, ar: '0 — أبداً', en: '0 — Never' },
  { value: '1', score: 1, ar: '1 — نادراً', en: '1 — Rarely' },
  { value: '2', score: 2, ar: '2 — أحياناً', en: '2 — Sometimes' },
  { value: '3', score: 3, ar: '3 — غالباً', en: '3 — Often' },
  { value: '4', score: 4, ar: '4 — دائماً', en: '4 — Always' },
];

const ASD_DOMAINS = ['communication', 'social', 'behavior', 'sensory'];
const LEARNING_DOMAINS = ['cognitive', 'independence', 'motor', 'academic'];

/** @typedef {{ id: string, domain: string, assessmentType: string, ageGroupMin: number, ageGroupMax: number, ar: string, en: string, hintAr?: string, hintEn?: string }} ClinicalQuestion */

/** @type {ClinicalQuestion[]} */
export const CLINICAL_QUESTIONS = [
  // Communication (5)
  { id: 'cq-com-01', domain: 'communication', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يستجيب للنداء بالاسم في بيئة هادئة؟', en: 'Does the child respond when called by name in a quiet setting?', hintAr: 'نادِ الاسم مرة أو مرتين', hintEn: 'Call the name once or twice' },
  { id: 'cq-com-02', domain: 'communication', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يطلب حاجاته بكلمات أو إيماءات مفهومة؟', en: 'Does the child request needs with understandable words or gestures?', hintAr: 'ضع شيئاً مفضلاً بعيداً قليلاً', hintEn: 'Place a preferred item slightly out of reach' },
  { id: 'cq-com-03', domain: 'communication', assessmentType: 'both', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يتبع تعليمات لفظية بسيطة (خطوة أو خطوتين)؟', en: 'Does the child follow simple verbal instructions (1–2 steps)?', hintAr: 'استخدم تعليماً مألوفاً', hintEn: 'Use a familiar instruction' },
  { id: 'cq-com-04', domain: 'communication', assessmentType: 'asd', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يبدي صعوبة في بدء أو استمرار حوار بسيط؟', en: 'Does the child struggle to initiate or sustain simple conversation?', hintAr: 'ابدأ تبادلاً قصيراً', hintEn: 'Start a short exchange' },
  { id: 'cq-com-05', domain: 'communication', assessmentType: 'both', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يستخدم جملاً مناسبة للعمر للتعبير عن أفكاره؟', en: 'Does the child use age-appropriate sentences to express ideas?', hintAr: 'اطرح سؤالاً مفتوحاً بسيطاً', hintEn: 'Ask a simple open question' },

  // Social (5)
  { id: 'cq-soc-01', domain: 'social', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يشارك في التواصل البصري أثناء التفاعل؟', en: 'Does the child share eye contact during interaction?', hintAr: 'لاحظ أثناء اللعب أو الحديث', hintEn: 'Observe during play or talk' },
  { id: 'cq-soc-02', domain: 'social', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يشارك الانتباه مع الآخرين (يشير أو ينظر لما يُشار إليه)؟', en: 'Does the child share attention with others (points or looks where directed)?', hintAr: 'أشر إلى شيء ولاحظ المتابعة', hintEn: 'Point to something and watch follow' },
  { id: 'cq-soc-03', domain: 'social', assessmentType: 'both', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يشارك في نشاط ثنائي قصير مع زميل أو معلم؟', en: 'Does the child join a short paired activity with a peer or teacher?', hintAr: 'نشاط تبادل أدوار بسيط', hintEn: 'Simple turn-taking activity' },
  { id: 'cq-soc-04', domain: 'social', assessmentType: 'asd', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يتجنب التواجد قرب الآخرين أو ينسحب عند الاقتراب؟', en: 'Does the child avoid proximity to others or withdraw when approached?', hintAr: 'لاحظ المسافة والانسحاب', hintEn: 'Note distance and withdrawal' },
  { id: 'cq-soc-05', domain: 'social', assessmentType: 'both', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يظهر اهتماماً باللعب أو التعاون مع أقرانه؟', en: 'Does the child show interest in play or cooperation with peers?', hintAr: 'لاحظ في وقت جماعي إن أمكن', hintEn: 'Observe during group time if possible' },

  // Behavior (5)
  { id: 'cq-beh-01', domain: 'behavior', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يكرر حركات أو أصوات نمطية بشكل ملحوظ؟', en: 'Does the child repeat stereotyped movements or sounds noticeably?', hintAr: 'لاحظ خلال دقائق من الملاحظة', hintEn: 'Observe for several minutes' },
  { id: 'cq-beh-02', domain: 'behavior', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يبدي مقاومة شديدة عند تغيير الروتين أو الانتقال؟', en: 'Does the child show strong resistance when routines or transitions change?', hintAr: 'من نشاط لآخر', hintEn: 'From one activity to another' },
  { id: 'cq-beh-03', domain: 'behavior', assessmentType: 'both', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يبقى في منطقة النشاط دون مغادرة متكررة؟', en: 'Does the child stay in the activity area without repeated leaving?', hintAr: 'لاحظ المغادرة المتكررة', hintEn: 'Note repeated leaving' },
  { id: 'cq-beh-04', domain: 'behavior', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يظهر تصعيداً سلوكياً عند الإحباط أو المطالب؟', en: 'Does the child show behavioral escalation when frustrated or challenged?', hintAr: 'عند مهمة صعبة أو إنهاء نشاط مفضل', hintEn: 'During a hard task or ending preferred activity' },
  { id: 'cq-beh-05', domain: 'behavior', assessmentType: 'both', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يستخدم استراتيجية تهدئة أو يطلب استراحة؟', en: 'Does the child use a calm-down strategy or request a break?', hintAr: 'إن ظهرت علامات إحباط', hintEn: 'If frustration signs appear' },

  // Sensory (4)
  { id: 'cq-sen-01', domain: 'sensory', assessmentType: 'asd', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يظهر حساسية مفرطة للضوضاء أو الإضاءة أو اللمس؟', en: 'Does the child show hypersensitivity to noise, light, or touch?', hintAr: 'لاحظ ردود الفعل للمثيرات', hintEn: 'Note reactions to stimuli' },
  { id: 'cq-sen-02', domain: 'sensory', assessmentType: 'asd', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يبحث عن مثيرات حسية بشكل مفرط (هز، دوران، لمس)؟', en: 'Does the child seek excessive sensory input (rocking, spinning, touching)?', hintAr: 'لاحظ السلوك الذاتي', hintEn: 'Observe self-stimulatory behavior' },
  { id: 'cq-sen-03', domain: 'sensory', assessmentType: 'both', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يتأثر تركيزه بشدة بمثيرات بيئية بسيطة؟', en: 'Is focus strongly affected by simple environmental stimuli?', hintAr: 'ضوضاء خفيفة أو حركة في الخلفية', hintEn: 'Mild noise or background movement' },
  { id: 'cq-sen-04', domain: 'sensory', assessmentType: 'asd', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يظهر تفضيلات غذائية أو حسية مقيدة جداً؟', en: 'Does the child show very restricted food or sensory preferences?', hintAr: 'اسأل ولي الأمر إن لزم', hintEn: 'Ask guardian if needed' },

  // Cognitive (5)
  { id: 'cq-cog-01', domain: 'cognitive', assessmentType: 'both', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يواجه صعوبة في الانتباه للمهمة لمدة مناسبة؟', en: 'Does the child struggle to attend to a task for an appropriate duration?', hintAr: 'سجّل تقريباً بالدقائق', hintEn: 'Note approximate minutes' },
  { id: 'cq-cog-02', domain: 'cognitive', assessmentType: 'learning_difficulties', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يجد صعوبة في تمييز الألوان أو الأشكال أو الأرقام مقارنة بأقرانه؟', en: 'Does the child struggle to distinguish colors, shapes, or numbers vs peers?', hintAr: 'نشاط مطابقة بسيط', hintEn: 'Simple matching activity' },
  { id: 'cq-cog-03', domain: 'cognitive', assessmentType: 'both', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يصعب عليه إتمام مهام متعددة الخطوات؟', en: 'Does the child struggle to complete multi-step tasks?', hintAr: 'قائمة مرئية إن لزم', hintEn: 'Visual list if needed' },
  { id: 'cq-cog-04', domain: 'cognitive', assessmentType: 'learning_difficulties', ageGroupMin: 60, ageGroupMax: 216, ar: 'هل يظهر بطئاً في فهم المفاهيم الجديدة رغم التكرار؟', en: 'Does the child show slow grasp of new concepts despite repetition?', hintAr: 'مفهوم واحد جديد', hintEn: 'One new concept' },
  { id: 'cq-cog-05', domain: 'cognitive', assessmentType: 'both', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يحل مشكلة بسيطة في موقف مألوف؟', en: 'Does the child solve a simple problem in a familiar situation?', hintAr: 'مثل الوصول لغرض خلف حاجز بسيط', hintEn: 'e.g. reaching an item behind a barrier' },

  // Independence (4)
  { id: 'cq-ind-01', domain: 'independence', assessmentType: 'learning_difficulties', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يعتمد على مساعدة كاملة في العناية بالذات (أكل، لبس)؟', en: 'Does the child rely on full help for self-care (eating, dressing)?', hintAr: 'لاحظ أثناء الوجبة أو الاستعداد', hintEn: 'Observe during snack or preparation' },
  { id: 'cq-ind-02', domain: 'independence', assessmentType: 'both', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يتبع روتيناً يومياً مألوفاً باستقلالية مناسبة؟', en: 'Does the child follow a familiar daily routine with appropriate independence?', hintAr: 'بداية أو نهاية الجلسة', hintEn: 'Session start or end' },
  { id: 'cq-ind-03', domain: 'independence', assessmentType: 'both', ageGroupMin: 60, ageGroupMax: 216, ar: 'هل يطلب المساعدة بأسلوب مناسب عند الحاجة؟', en: 'Does the child request help appropriately when needed?', hintAr: 'قدّم مهمة تحتاج مساعدة خفيفة', hintEn: 'Offer a task needing light help' },
  { id: 'cq-ind-04', domain: 'independence', assessmentType: 'learning_difficulties', ageGroupMin: 72, ageGroupMax: 216, ar: 'هل يظهر اعتماداً مفرط على التوجيه في المهام اليومية؟', en: 'Does the child show excessive reliance on prompting in daily tasks?', hintAr: 'لاحظ عدد التوجيهات اللازمة', hintEn: 'Count prompts needed' },

  // Motor (4)
  { id: 'cq-mot-01', domain: 'motor', assessmentType: 'both', ageGroupMin: 24, ageGroupMax: 216, ar: 'هل يظهر صعوبة في المهارات الحركية الكبرى (جلوس، وقوف، انتقال)؟', en: 'Does the child show difficulty with gross motor skills (sit, stand, move)?', hintAr: 'لاحظ الاستقرار والتنقل', hintEn: 'Note stability and movement' },
  { id: 'cq-mot-02', domain: 'motor', assessmentType: 'both', ageGroupMin: 36, ageGroupMax: 216, ar: 'هل يواجه صعوبة في المهارات الحركية الدقيقة (إمساك، تلوين)؟', en: 'Does the child struggle with fine motor skills (grasp, coloring)?', hintAr: 'قطع إدخال أو قلم', hintEn: 'Insert pieces or pencil' },
  { id: 'cq-mot-03', domain: 'motor', assessmentType: 'learning_difficulties', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يظهر تأخراً في التآزر البصري الحركي؟', en: 'Does the child show delay in visual-motor coordination?', hintAr: 'مطابقة أو تتبع خط', hintEn: 'Matching or line tracing' },
  { id: 'cq-mot-04', domain: 'motor', assessmentType: 'both', ageGroupMin: 48, ageGroupMax: 216, ar: 'هل يتعب بسرعة أثناء الأنشطة الحركية المنظمة؟', en: 'Does the child fatigue quickly during organized motor activities?', hintAr: 'لاحظ التعب خلال دقائق', hintEn: 'Note fatigue within minutes' },

  // Academic (4)
  { id: 'cq-acd-01', domain: 'academic', assessmentType: 'learning_difficulties', ageGroupMin: 60, ageGroupMax: 216, ar: 'هل يظهر صعوبة واضحة في التعرف على الحروف أو الأرقام؟', en: 'Does the child show clear difficulty recognizing letters or numbers?', hintAr: 'بطاقات بسيطة', hintEn: 'Simple flash cards' },
  { id: 'cq-acd-02', domain: 'academic', assessmentType: 'learning_difficulties', ageGroupMin: 72, ageGroupMax: 216, ar: 'هل يجد صعوبة في القراءة أو الكتابة مقارنة بمستوى عمره؟', en: 'Does the child struggle with reading or writing vs age level?', hintAr: 'راجع أي تقارير مدرسية', hintEn: 'Review school reports if any' },
  { id: 'cq-acd-03', domain: 'academic', assessmentType: 'learning_difficulties', ageGroupMin: 72, ageGroupMax: 216, ar: 'هل يواجه صعوبة في فهم المفاهيم الرياضية البسيطة؟', en: 'Does the child struggle with simple math concepts?', hintAr: 'عد أو جمع بسيط', hintEn: 'Counting or simple addition' },
  { id: 'cq-acd-04', domain: 'academic', assessmentType: 'both', ageGroupMin: 60, ageGroupMax: 216, ar: 'هل يحتاج دعماً إضافياً مستمراً في المهام الأكاديمية؟', en: 'Does the child need ongoing extra support in academic tasks?', hintAr: 'قارن مع أقرانه في نفس المستوى', hintEn: 'Compare with same-level peers' },
];

export function getRelevantDomains(assessmentType) {
  if (assessmentType === ASSESSMENT_PATHWAYS.asd) return ASD_DOMAINS;
  if (assessmentType === ASSESSMENT_PATHWAYS.learning_difficulties) return LEARNING_DOMAINS;
  return Object.keys(CLINICAL_DOMAINS);
}

export function matchesAssessmentType(questionType, requestedType) {
  if (requestedType === ASSESSMENT_PATHWAYS.both) {
    return questionType === 'both' || questionType === 'asd' || questionType === 'learning_difficulties';
  }
  return questionType === 'both' || questionType === requestedType;
}

export function filterQuestions({ assessmentType = 'both', ageInMonths = 72 } = {}) {
  const domains = new Set(getRelevantDomains(assessmentType));
  return CLINICAL_QUESTIONS.filter(
    (q) =>
      domains.has(q.domain) &&
      matchesAssessmentType(q.assessmentType, assessmentType) &&
      ageInMonths >= q.ageGroupMin &&
      ageInMonths <= q.ageGroupMax
  ).sort((a, b) => {
    const orderA = CLINICAL_DOMAINS[a.domain]?.order ?? 99;
    const orderB = CLINICAL_DOMAINS[b.domain]?.order ?? 99;
    return orderA - orderB || a.id.localeCompare(b.id);
  });
}

export function listClinicalDomains() {
  return Object.entries(CLINICAL_DOMAINS)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([id, meta]) => ({ id, ...meta }));
}
