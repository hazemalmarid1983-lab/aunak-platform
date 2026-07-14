/**
 * Digital IEP Goal Bank — Wajhatna-style age × support-need partitioning.
 *
 * Flow for teachers:
 *  1) Resolve age stage + support need → show CORE goals for that group
 *  2) If none fit → open extended BANK for same group / adjacent
 *  3) Still missing → submit custom goal for supervisor approval
 */

export const AGE_BANDS = {
  early: { id: 'early', min: 2, max: 5, ar: 'التدخل المبكر (2–5)', en: 'Early intervention (2–5)' },
  primary: { id: 'primary', min: 6, max: 9, ar: 'المرحلة الابتدائية (6–9)', en: 'Primary stage (6–9)' },
  preteen: { id: 'preteen', min: 10, max: 13, ar: 'المرحلة المتوسطة (10–13)', en: 'Intermediate stage (10–13)' },
  teen: { id: 'teen', min: 14, max: 18, ar: 'المرحلة الثانوية (14–18)', en: 'Secondary stage (14–18)' },
};

export const SEVERITY = {
  mild: { id: 'mild', ar: 'احتياج بسيط', en: 'Mild support need' },
  moderate: { id: 'moderate', ar: 'احتياج متوسط', en: 'Moderate support need' },
  severe: { id: 'severe', ar: 'احتياج شديد', en: 'Intensive support need' },
};

export const GOAL_DOMAINS = {
  communication: { ar: 'مهارات التواصل', en: 'Communication skills', order: 1 },
  social: { ar: 'مهارات اجتماعية', en: 'Social skills', order: 2 },
  self_care: { ar: 'العناية بالذات', en: 'Daily living / self-care', order: 3 },
  motor: { ar: 'مهارات حركية', en: 'Motor skills', order: 4 },
  cognitive: { ar: 'مهارات إدراكية', en: 'Cognitive skills', order: 5 },
  behavior: { ar: 'التكيف السلوكي', en: 'Behavioral adaptation', order: 6 },
};

export const GOAL_TIERS = {
  /** Primary set shown first for the age × support group */
  core: 'core',
  /** Extended bank when core goals are not suitable */
  bank: 'bank',
};

/** @typedef {{ id: string, domain: string, ageBands: string[], severities: string[], tier: 'core'|'bank', ar: string, en: string, source: string }} BankGoal */

function g(partial) {
  return { tier: GOAL_TIERS.core, source: 'ABA', ...partial };
}

/** @type {BankGoal[]} */
export const GOAL_BANK = [
  // ─── Early intervention (2–5) · Mild ───
  g({ id: 'e-m-com-1', domain: 'communication', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'ينادي المعلم باسمه أو إشارة واضحة عند الحاجة', en: 'Calls the teacher by name or clear signal when needing help', source: 'ABA' }),
  g({ id: 'e-m-com-2', domain: 'communication', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'يكوّن جملة من كلمتين للطلب', en: 'Produces a two-word request phrase', source: 'VB-MAPP' }),
  g({ id: 'e-m-soc-1', domain: 'social', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'يحيّي زميلًا أو معلمًا عند الدخول', en: 'Greets a peer or teacher when entering', source: 'ESDM' }),
  g({ id: 'e-m-soc-2', domain: 'social', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'يتبادل دوراً في نشاط قصير مع زميل', en: 'Takes turns in a short activity with a peer', source: 'ABA' }),
  g({ id: 'e-m-sc-1', domain: 'self_care', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'يغسل اليدين باستقلالية شبه كاملة بعد النشاط', en: 'Washes hands nearly independently after activity', source: 'ABA' }),
  g({ id: 'e-m-mot-1', domain: 'motor', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'يرمي كرة صغيرة نحو هدف قريب', en: 'Throws a small ball toward a near target', source: 'ABA' }),
  g({ id: 'e-m-cog-1', domain: 'cognitive', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'يطابق 4 صور متشابهة باستقلالية', en: 'Matches 4 similar pictures independently', source: 'ABA' }),
  g({ id: 'e-m-beh-1', domain: 'behavior', ageBands: ['early'], severities: ['mild'], tier: 'core', ar: 'يبقى جالساً أثناء النشاط القصير (3 دقائق) بمساعدة بصرية', en: 'Remains seated during a short activity (3 min) with visual support', source: 'ABA' }),
  g({ id: 'e-m-com-b1', domain: 'communication', ageBands: ['early'], severities: ['mild'], tier: 'bank', ar: 'يعلّق بجملة قصيرة على صورة أو حدث', en: 'Comments with a short phrase on a picture or event', source: 'VB-MAPP' }),
  g({ id: 'e-m-sc-b1', domain: 'self_care', ageBands: ['early'], severities: ['mild'], tier: 'bank', ar: 'يرتدي الجوارب بمساعدة لفظية فقط', en: 'Puts on socks with verbal prompt only', source: 'ABA' }),

  // ─── Early · Moderate ───
  g({ id: 'e-o-com-1', domain: 'communication', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يستجيب لاسمه خلال ثانيتين عند النداء', en: 'Responds to name within 2 seconds when called', source: 'ABA' }),
  g({ id: 'e-o-com-2', domain: 'communication', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يطلب حاجة مفضلة بإشارة أو كلمة واحدة', en: 'Requests a preferred item with gesture or one word', source: 'ABA' }),
  g({ id: 'e-o-soc-1', domain: 'social', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يشارك انتباهاً مشتركاً لـ 3 ثوانٍ مع المعلم', en: 'Shares joint attention for 3 seconds with teacher', source: 'ESDM' }),
  g({ id: 'e-o-soc-2', domain: 'social', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يقلّد حركة بسيطة لمرة واحدة عند الطلب', en: 'Imitates one simple action on request', source: 'ABA' }),
  g({ id: 'e-o-sc-1', domain: 'self_care', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يغسل اليدين بمساعدة جزئية بعد النشاط', en: 'Washes hands with partial prompt after activity', source: 'ABA' }),
  g({ id: 'e-o-mot-1', domain: 'motor', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يضع قطعة في مكانها ضمن لعبة إدخال بسيطة', en: 'Places a piece correctly in a simple insert puzzle', source: 'ABA' }),
  g({ id: 'e-o-cog-1', domain: 'cognitive', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يفرّق بين كبير/صغير بمساعدة بصرية', en: 'Discriminates big/small with visual support', source: 'ABA' }),
  g({ id: 'e-o-beh-1', domain: 'behavior', ageBands: ['early'], severities: ['moderate'], tier: 'core', ar: 'يبقى جالساً على الكرسي لمدة دقيقة بمساعدة بصرية', en: 'Remains seated for 1 minute with visual support', source: 'ABA' }),
  g({ id: 'e-o-com-b1', domain: 'communication', ageBands: ['early'], severities: ['moderate'], tier: 'bank', ar: 'يتابع نظرة العين نحو شيء يُشار إليه', en: 'Follows gaze/point to a referenced object', source: 'ESDM' }),
  g({ id: 'e-o-beh-b1', domain: 'behavior', ageBands: ['early'], severities: ['moderate'], tier: 'bank', ar: 'ينتقل بين ركنين بمساعدة جدول مصوّر', en: 'Transitions between two corners using a picture schedule', source: 'ABA' }),

  // ─── Early · Severe ───
  g({ id: 'e-s-com-1', domain: 'communication', ageBands: ['early'], severities: ['severe'], tier: 'core', ar: 'يثبّت النظر على وجه المعلم لثانيتين عند النداء', en: 'Holds gaze on teacher’s face for 2 seconds when called', source: 'ESDM' }),
  g({ id: 'e-s-com-2', domain: 'communication', ageBands: ['early'], severities: ['severe'], tier: 'core', ar: 'يمدّ يده نحو غرض مفضّل عند تقديمه', en: 'Reaches toward a preferred item when offered', source: 'ABA' }),
  g({ id: 'e-s-soc-1', domain: 'social', ageBands: ['early'], severities: ['severe'], tier: 'core', ar: 'يقبل التواجد بجانب المعلم دون ابتعاد فوري', en: 'Tolerates sitting beside the teacher without immediate withdrawal', source: 'ESDM' }),
  g({ id: 'e-s-sc-1', domain: 'self_care', ageBands: ['early'], severities: ['severe'], tier: 'core', ar: 'يتعاون في غسل اليدين بمساعدة جسدية جزئية', en: 'Cooperates with hand-washing using partial physical prompt', source: 'ABA' }),
  g({ id: 'e-s-mot-1', domain: 'motor', ageBands: ['early'], severities: ['severe'], tier: 'core', ar: 'يمسك ويدع شيئاً بسيطاً لمدة ثانيتين', en: 'Grasps and releases a simple object for 2 seconds', source: 'ABA' }),
  g({ id: 'e-s-beh-1', domain: 'behavior', ageBands: ['early'], severities: ['severe'], tier: 'core', ar: 'يبقى في منطقة النشاط لمدة 30 ثانية بمساعدة', en: 'Stays in the activity area for 30 seconds with support', source: 'ABA' }),
  g({ id: 'e-s-cog-1', domain: 'cognitive', ageBands: ['early'], severities: ['severe'], tier: 'core', ar: 'ينظر إلى بطاقة عند عرضها أمامه', en: 'Looks at a card when presented in front of him/her', source: 'ABA' }),
  g({ id: 'e-s-com-b1', domain: 'communication', ageBands: ['early'], severities: ['severe'], tier: 'bank', ar: 'يستخدم حركة رأس أو إيماءة لـ«نعم/لا» بمساعدة', en: 'Uses a head movement or gesture for yes/no with support', source: 'ABA' }),
  g({ id: 'e-s-beh-b1', domain: 'behavior', ageBands: ['early'], severities: ['severe'], tier: 'bank', ar: 'يقبل لمسة توجيهية خفيفة دون تصعيد', en: 'Accepts a light guiding touch without escalation', source: 'ABA' }),

  // ─── Primary (6–9) · Mild ───
  g({ id: 'p-m-com-1', domain: 'communication', ageBands: ['primary'], severities: ['mild'], tier: 'core', ar: 'يسأل سؤالاً بسيطاً للحصول على معلومة', en: 'Asks a simple question to obtain information', source: 'VB-MAPP' }),
  g({ id: 'p-m-com-2', domain: 'communication', ageBands: ['primary'], severities: ['mild'], tier: 'core', ar: 'يروي حدثاً قصيراً بجملتين مترابطتين', en: 'Retells a short event in two connected sentences', source: 'ABA' }),
  g({ id: 'p-m-soc-1', domain: 'social', ageBands: ['primary'], severities: ['mild'], tier: 'core', ar: 'يشارك زميلًا في مهمة صفية لمدة 5 دقائق', en: 'Shares a classroom task with a peer for 5 minutes', source: 'ABA' }),
  g({ id: 'p-m-cog-1', domain: 'cognitive', ageBands: ['primary'], severities: ['mild'], tier: 'core', ar: 'يكمل نمطًا من 3 عناصر باستقلالية', en: 'Completes a 3-item pattern independently', source: 'ABA' }),
  g({ id: 'p-m-sc-1', domain: 'self_care', ageBands: ['primary'], severities: ['mild'], tier: 'core', ar: 'يرتّب أدواته بعد النشاط دون تذكير متكرر', en: 'Tidies materials after activity without repeated reminders', source: 'ABA' }),
  g({ id: 'p-m-beh-1', domain: 'behavior', ageBands: ['primary'], severities: ['mild'], tier: 'core', ar: 'يتبع قاعدة الصف عند التذكير مرة واحدة', en: 'Follows a classroom rule after one reminder', source: 'ABA' }),
  g({ id: 'p-m-mot-1', domain: 'motor', ageBands: ['primary'], severities: ['mild'], tier: 'core', ar: 'يكتب أو يرسم خطاً مستقيماً ضمن حدود', en: 'Writes or draws a straight line within boundaries', source: 'ABA' }),
  g({ id: 'p-m-soc-b1', domain: 'social', ageBands: ['primary'], severities: ['mild'], tier: 'bank', ar: 'يعتذر أو يشكر في موقف مناسب', en: 'Apologizes or thanks in an appropriate situation', source: 'ABA' }),

  // ─── Primary · Moderate ───
  g({ id: 'p-o-com-1', domain: 'communication', ageBands: ['primary'], severities: ['moderate'], tier: 'core', ar: 'يكوّن جملة من كلمتين للطلب أو التعليق', en: 'Produces a two-word phrase to request or comment', source: 'ABA' }),
  g({ id: 'p-o-com-2', domain: 'communication', ageBands: ['primary'], severities: ['moderate'], tier: 'core', ar: 'يتبع تعليمات من خطوتين في الصف', en: 'Follows a two-step classroom instruction', source: 'VB-MAPP' }),
  g({ id: 'p-o-soc-1', domain: 'social', ageBands: ['primary'], severities: ['moderate'], tier: 'core', ar: 'يتبادل دوراً في لعبة بسيطة مع زميل', en: 'Takes turns in a simple game with a peer', source: 'ABA' }),
  g({ id: 'p-o-cog-1', domain: 'cognitive', ageBands: ['primary'], severities: ['moderate'], tier: 'core', ar: 'يطابق 5 بطاقات متشابهة باستقلالية', en: 'Matches 5 similar cards independently', source: 'ABA' }),
  g({ id: 'p-o-sc-1', domain: 'self_care', ageBands: ['primary'], severities: ['moderate'], tier: 'core', ar: 'يرتدي الحذاء بمساعدة لفظية فقط', en: 'Puts on shoes with verbal prompt only', source: 'ABA' }),
  g({ id: 'p-o-beh-1', domain: 'behavior', ageBands: ['primary'], severities: ['moderate'], tier: 'core', ar: 'يستخدم استراتيجية تهدئة عند الإحباط مرة يومياً على الأقل', en: 'Uses a calm-down strategy when frustrated at least once daily', source: 'ABA' }),
  g({ id: 'p-o-mot-1', domain: 'motor', ageBands: ['primary'], severities: ['moderate'], tier: 'core', ar: 'يقص على خط مستقيم بمساعدة جزئية', en: 'Cuts along a straight line with partial support', source: 'ABA' }),
  g({ id: 'p-o-cog-b1', domain: 'cognitive', ageBands: ['primary'], severities: ['moderate'], tier: 'bank', ar: 'يعدّ حتى 5 أشياء ملموسة', en: 'Counts up to 5 concrete objects', source: 'ABA' }),
  g({ id: 'p-o-com-b1', domain: 'communication', ageBands: ['primary'], severities: ['moderate'], tier: 'bank', ar: 'يسمّي 5 صور مألوفة عند الطلب', en: 'Names 5 familiar pictures on request', source: 'VB-MAPP' }),

  // ─── Primary · Severe ───
  g({ id: 'p-s-com-1', domain: 'communication', ageBands: ['primary'], severities: ['severe'], tier: 'core', ar: 'يشير إلى غرض مطلوب من بين خيارين', en: 'Points to a requested item from two choices', source: 'ABA' }),
  g({ id: 'p-s-com-2', domain: 'communication', ageBands: ['primary'], severities: ['severe'], tier: 'core', ar: 'يتبع تعليماً من خطوة واحدة بمساعدة بصرية', en: 'Follows a one-step instruction with visual support', source: 'VB-MAPP' }),
  g({ id: 'p-s-soc-1', domain: 'social', ageBands: ['primary'], severities: ['severe'], tier: 'core', ar: 'يتسامح مع جلوس زميل قريب دون ابتعاد', en: 'Tolerates a peer sitting nearby without leaving', source: 'ABA' }),
  g({ id: 'p-s-sc-1', domain: 'self_care', ageBands: ['primary'], severities: ['severe'], tier: 'core', ar: 'يشارك في ارتداء المعطف بمساعدة جسدية', en: 'Participates in putting on a coat with physical help', source: 'ABA' }),
  g({ id: 'p-s-mot-1', domain: 'motor', ageBands: ['primary'], severities: ['severe'], tier: 'core', ar: 'يضع قطعة كبيرة في فتحة مناسبة', en: 'Places a large piece into a matching opening', source: 'ABA' }),
  g({ id: 'p-s-beh-1', domain: 'behavior', ageBands: ['primary'], severities: ['severe'], tier: 'core', ar: 'يبقى في المقعد لمدة دقيقتين بمساعدة جدول مصوّر', en: 'Remains seated for 2 minutes with a picture schedule', source: 'ABA' }),
  g({ id: 'p-s-cog-1', domain: 'cognitive', ageBands: ['primary'], severities: ['severe'], tier: 'core', ar: 'يطابق صورة بصورة متطابقة من بين اثنتين', en: 'Matches identical picture from two options', source: 'ABA' }),
  g({ id: 'p-s-beh-b1', domain: 'behavior', ageBands: ['primary'], severities: ['severe'], tier: 'bank', ar: 'يقبل إنهاء نشاط مفضّل بعد إشارة العدّ التنازلي', en: 'Accepts ending a preferred activity after a countdown cue', source: 'ABA' }),

  // ─── Intermediate (10–13) · Mild ───
  g({ id: 't-m-com-1', domain: 'communication', ageBands: ['preteen'], severities: ['mild'], tier: 'core', ar: 'يقدّم رأيه بجملة واضحة في نقاش قصير', en: 'States an opinion clearly in a short discussion', source: 'ABA' }),
  g({ id: 't-m-soc-1', domain: 'social', ageBands: ['preteen'], severities: ['mild'], tier: 'core', ar: 'يتعاون مع مجموعة صغيرة لإكمال مهمة', en: 'Cooperates in a small group to finish a task', source: 'ABA' }),
  g({ id: 't-m-cog-1', domain: 'cognitive', ageBands: ['preteen'], severities: ['mild'], tier: 'core', ar: 'يحلّ مسألة بسيطة من خطوتين باستقلالية', en: 'Solves a simple two-step problem independently', source: 'ABA' }),
  g({ id: 't-m-sc-1', domain: 'self_care', ageBands: ['preteen'], severities: ['mild'], tier: 'core', ar: 'يحضّر حقيبته لليوم التالي بمراجعة قائمة', en: 'Prepares next-day bag using a checklist', source: 'ABA' }),
  g({ id: 't-m-beh-1', domain: 'behavior', ageBands: ['preteen'], severities: ['mild'], tier: 'core', ar: 'يطلب استراحة منظمة قبل تصعيد السلوك', en: 'Requests a structured break before behavior escalates', source: 'ABA' }),
  g({ id: 't-m-mot-1', domain: 'motor', ageBands: ['preteen'], severities: ['mild'], tier: 'core', ar: 'ينسخ فقرة قصيرة بخط مقروء', en: 'Copies a short paragraph in legible handwriting', source: 'ABA' }),
  g({ id: 't-m-com-b1', domain: 'communication', ageBands: ['preteen'], severities: ['mild'], tier: 'bank', ar: 'يلخّص تعليمات المعلم بكلماته', en: 'Summarizes teacher instructions in own words', source: 'ABA' }),

  // ─── Intermediate · Moderate ───
  g({ id: 't-o-com-1', domain: 'communication', ageBands: ['preteen'], severities: ['moderate'], tier: 'core', ar: 'يسأل سؤالاً واضحاً للحصول على مساعدة', en: 'Asks a clear question to request help', source: 'ABA' }),
  g({ id: 't-o-soc-1', domain: 'social', ageBands: ['preteen'], severities: ['moderate'], tier: 'core', ar: 'يشارك في نشاط جماعي لمدة 10 دقائق', en: 'Participates in a group activity for 10 minutes', source: 'ABA' }),
  g({ id: 't-o-cog-1', domain: 'cognitive', ageBands: ['preteen'], severities: ['moderate'], tier: 'core', ar: 'يكمل مهمة من 3 خطوات وفق قائمة مرئية', en: 'Completes a 3-step task using a visual checklist', source: 'ABA' }),
  g({ id: 't-o-sc-1', domain: 'self_care', ageBands: ['preteen'], severities: ['moderate'], tier: 'core', ar: 'ينظّم حقيبته المدرسية في نهاية اليوم بمساعدة بسيطة', en: 'Organizes school bag at end of day with minimal help', source: 'ABA' }),
  g({ id: 't-o-beh-1', domain: 'behavior', ageBands: ['preteen'], severities: ['moderate'], tier: 'core', ar: 'ينتقل بين الأنشطة خلال دقيقتين دون تصعيد', en: 'Transitions between activities within 2 minutes without escalation', source: 'ABA' }),
  g({ id: 't-o-mot-1', domain: 'motor', ageBands: ['preteen'], severities: ['moderate'], tier: 'core', ar: 'يستخدم فأرة الحاسوب أو القلم بثبات مقبول', en: 'Uses mouse or pencil with acceptable steadiness', source: 'ABA' }),
  g({ id: 't-o-com-b1', domain: 'communication', ageBands: ['preteen'], severities: ['moderate'], tier: 'bank', ar: 'يصف شعوره بكلمة أو جملة قصيرة', en: 'Describes a feeling with a word or short sentence', source: 'ABA' }),
  g({ id: 't-o-beh-b1', domain: 'behavior', ageBands: ['preteen'], severities: ['moderate'], tier: 'bank', ar: 'يتبع جدولاً مصوّراً لثلاث فترات في اليوم', en: 'Follows a picture schedule across three periods daily', source: 'ABA' }),

  // ─── Intermediate · Severe ───
  g({ id: 't-s-com-1', domain: 'communication', ageBands: ['preteen'], severities: ['severe'], tier: 'core', ar: 'يختار بطاقة تواصل للطلب من بين 3 بطاقات', en: 'Selects a communication card to request from 3 options', source: 'PECS' }),
  g({ id: 't-s-soc-1', domain: 'social', ageBands: ['preteen'], severities: ['severe'], tier: 'core', ar: 'يقبل مشاركة مساحة الطاولة مع زميل', en: 'Accepts sharing table space with a peer', source: 'ABA' }),
  g({ id: 't-s-sc-1', domain: 'self_care', ageBands: ['preteen'], severities: ['severe'], tier: 'core', ar: 'يشارك في ترتيب الطاولة بعد النشاط بمساعدة', en: 'Helps clear the table after activity with support', source: 'ABA' }),
  g({ id: 't-s-cog-1', domain: 'cognitive', ageBands: ['preteen'], severities: ['severe'], tier: 'core', ar: 'يتبع تسلسلاً من خطوتين بمساعدة بصرية', en: 'Follows a two-step sequence with visual support', source: 'ABA' }),
  g({ id: 't-s-beh-1', domain: 'behavior', ageBands: ['preteen'], severities: ['severe'], tier: 'core', ar: 'يستخدم إشارة متفق عليها بدل السلوك غير المرغوب', en: 'Uses an agreed signal instead of undesired behavior', source: 'ABA' }),
  g({ id: 't-s-mot-1', domain: 'motor', ageBands: ['preteen'], severities: ['severe'], tier: 'core', ar: 'يحمل وينقل غرضاً خفيفاً لمسافة قصيرة', en: 'Carries a light object a short distance', source: 'ABA' }),
  g({ id: 't-s-com-b1', domain: 'communication', ageBands: ['preteen'], severities: ['severe'], tier: 'bank', ar: 'يشير إلى «أريد استراحة» ببطاقة أو إيماءة', en: 'Indicates “I want a break” with a card or gesture', source: 'PECS' }),

  // ─── Secondary (14–18) · Mild ───
  g({ id: 'n-m-com-1', domain: 'communication', ageBands: ['teen'], severities: ['mild'], tier: 'core', ar: 'يقدّم نفسه بجملة كاملة في موقف اجتماعي بسيط', en: 'Introduces self in a full sentence in a simple social setting', source: 'ABA' }),
  g({ id: 'n-m-cog-1', domain: 'cognitive', ageBands: ['teen'], severities: ['mild'], tier: 'core', ar: 'يتبع جدول يومي مكتوب بنسبة التزام 80%', en: 'Follows a written daily schedule with 80% adherence', source: 'ABA' }),
  g({ id: 'n-m-sc-1', domain: 'self_care', ageBands: ['teen'], severities: ['mild'], tier: 'core', ar: 'يعدّ وجبة خفيفة بسيطة بسلامة وإشراف عن بُعد', en: 'Prepares a simple snack safely with remote supervision', source: 'ABA' }),
  g({ id: 'n-m-beh-1', domain: 'behavior', ageBands: ['teen'], severities: ['mild'], tier: 'core', ar: 'يحلّ خلافاً بسيطاً بكلمات مهذبة', en: 'Resolves a simple disagreement with polite words', source: 'ABA' }),
  g({ id: 'n-m-soc-1', domain: 'social', ageBands: ['teen'], severities: ['mild'], tier: 'core', ar: 'يحافظ على محادثة قصيرة (3 تبادل) مع زميل', en: 'Maintains a short conversation (3 exchanges) with a peer', source: 'ABA' }),
  g({ id: 'n-m-mot-1', domain: 'motor', ageBands: ['teen'], severities: ['mild'], tier: 'core', ar: 'يستخدم تطبيقات الهاتف الأساسية باستقلالية', en: 'Uses basic phone apps independently', source: 'ABA' }),
  g({ id: 'n-m-sc-b1', domain: 'self_care', ageBands: ['teen'], severities: ['mild'], tier: 'bank', ar: 'يدير مصروفاً صغيراً وفق ميزانية يومية مبسّطة', en: 'Manages a small allowance with a simple daily budget', source: 'ABA' }),

  // ─── Secondary · Moderate ───
  g({ id: 'n-o-com-1', domain: 'communication', ageBands: ['teen'], severities: ['moderate'], tier: 'core', ar: 'يطلب مساعدة بأسلوب مهذب في موقف حقيقي', en: 'Politely requests help in a real situation', source: 'ABA' }),
  g({ id: 'n-o-soc-1', domain: 'social', ageBands: ['teen'], severities: ['moderate'], tier: 'core', ar: 'يشارك في نشاط جماعي لمدة 15 دقيقة', en: 'Participates in a group activity for 15 minutes', source: 'ABA' }),
  g({ id: 'n-o-cog-1', domain: 'cognitive', ageBands: ['teen'], severities: ['moderate'], tier: 'core', ar: 'ينجز مهمة وظيفية من 3 خطوات بقائمة تحقق', en: 'Completes a 3-step functional task with a checklist', source: 'ABA' }),
  g({ id: 'n-o-sc-1', domain: 'self_care', ageBands: ['teen'], severities: ['moderate'], tier: 'core', ar: 'يحافظ على نظافة شخصية أساسية بمساعدة جدول', en: 'Maintains basic personal hygiene using a schedule', source: 'ABA' }),
  g({ id: 'n-o-beh-1', domain: 'behavior', ageBands: ['teen'], severities: ['moderate'], tier: 'core', ar: 'يطلب استراحة منظمة بدل السلوك غير المرغوب', en: 'Requests a structured break instead of undesired behavior', source: 'ABA' }),
  g({ id: 'n-o-mot-1', domain: 'motor', ageBands: ['teen'], severities: ['moderate'], tier: 'core', ar: 'ينقل مواد بسيطة بأمان داخل المركز', en: 'Carries simple materials safely within the center', source: 'ABA' }),
  g({ id: 'n-o-com-b1', domain: 'communication', ageBands: ['teen'], severities: ['moderate'], tier: 'bank', ar: 'يملأ نموذجاً بسيطاً ببياناته الشخصية بمساعدة', en: 'Fills a simple form with personal data with support', source: 'ABA' }),

  // ─── Secondary · Severe ───
  g({ id: 'n-s-com-1', domain: 'communication', ageBands: ['teen'], severities: ['severe'], tier: 'core', ar: 'يستخدم وسيلة تواصل بديلة للطلب اليومي', en: 'Uses an alternative communication means for daily requests', source: 'PECS' }),
  g({ id: 'n-s-soc-1', domain: 'social', ageBands: ['teen'], severities: ['severe'], tier: 'core', ar: 'يتسامح مع وجود الآخرين في نفس الغرفة أثناء النشاط', en: 'Tolerates others in the same room during activity', source: 'ABA' }),
  g({ id: 'n-s-sc-1', domain: 'self_care', ageBands: ['teen'], severities: ['severe'], tier: 'core', ar: 'يشارك في روتين نظافة بسيط بمساعدة جسدية جزئية', en: 'Participates in a simple hygiene routine with partial physical help', source: 'ABA' }),
  g({ id: 'n-s-cog-1', domain: 'cognitive', ageBands: ['teen'], severities: ['severe'], tier: 'core', ar: 'يميّز بين نشاطين على الجدول المصوّر', en: 'Discriminates between two activities on a picture schedule', source: 'ABA' }),
  g({ id: 'n-s-beh-1', domain: 'behavior', ageBands: ['teen'], severities: ['severe'], tier: 'core', ar: 'ينتقل بين مكانين بمساعدة دون تصعيد كبير', en: 'Transitions between two places with support without major escalation', source: 'ABA' }),
  g({ id: 'n-s-mot-1', domain: 'motor', ageBands: ['teen'], severities: ['severe'], tier: 'core', ar: 'يؤدي حركة يومية بسيطة (دفع/سحب) بأمان', en: 'Performs a simple daily movement (push/pull) safely', source: 'ABA' }),
  g({ id: 'n-s-beh-b1', domain: 'behavior', ageBands: ['teen'], severities: ['severe'], tier: 'bank', ar: 'يقبل إنهاء نشاط بعد إشارة بصرية واضحة', en: 'Accepts ending an activity after a clear visual cue', source: 'ABA' }),
];

export function resolveAgeBand(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return null;
  return Object.values(AGE_BANDS).find((b) => n >= b.min && n <= b.max) ?? null;
}

export function normalizeSeverity(raw) {
  const v = String(raw ?? '').trim().toLowerCase();
  if (/severe|شديد|intensive|مكثف|مكثّف/.test(v)) return SEVERITY.severe.id;
  if (/moderate|متوسط|mid/.test(v)) return SEVERITY.moderate.id;
  if (/mild|خفيف|بسيط|light|simple/.test(v)) return SEVERITY.mild.id;
  return SEVERITY.moderate.id;
}

/**
 * Filter bank for teacher selection (age + severity + optional domain/tier/search).
 */
export function filterGoalBank({ age, ageBandId, severity, domain, tier, search } = {}) {
  const band = ageBandId
    ? AGE_BANDS[ageBandId] || null
    : resolveAgeBand(age);
  const sev = severity ? normalizeSeverity(severity) : null;
  const q = String(search || '')
    .trim()
    .toLowerCase();

  return GOAL_BANK.filter((g) => {
    if (band && !g.ageBands.includes(band.id)) return false;
    if (sev && !g.severities.includes(sev)) return false;
    if (domain && domain !== 'all' && g.domain !== domain) return false;
    if (tier && g.tier !== tier) return false;
    if (q) {
      const hay = `${g.ar} ${g.en} ${g.source} ${g.domain}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Core goals for the student’s group (shown first). */
export function getCoreGoalsForGroup({ age, ageBandId, severity, domain, search } = {}) {
  return filterGoalBank({ age, ageBandId, severity, domain, search, tier: GOAL_TIERS.core });
}

/** Extended bank when core goals are not enough. */
export function getExtendedBankGoals({ age, ageBandId, severity, domain, search } = {}) {
  return filterGoalBank({ age, ageBandId, severity, domain, search, tier: GOAL_TIERS.bank });
}

/** Group goals by domain for UI sections. */
export function groupGoalsByDomain(goals = []) {
  const order = Object.keys(GOAL_DOMAINS).sort(
    (a, b) => (GOAL_DOMAINS[a].order ?? 99) - (GOAL_DOMAINS[b].order ?? 99)
  );
  const map = {};
  for (const id of order) map[id] = [];
  for (const g of goals) {
    if (!map[g.domain]) map[g.domain] = [];
    map[g.domain].push(g);
  }
  return order
    .filter((id) => map[id]?.length)
    .map((id) => ({
      domainId: id,
      meta: GOAL_DOMAINS[id],
      goals: map[id],
    }));
}

/**
 * Suggested starter set: one per domain from core, then fill.
 */
export function suggestGoalsForStudent({ age, ageBandId, severity, limit = 6 } = {}) {
  const core = getCoreGoalsForGroup({ age, ageBandId, severity });
  const domainsSeen = new Set();
  const picked = [];
  for (const goal of core) {
    if (picked.length >= limit) break;
    if (domainsSeen.has(goal.domain)) continue;
    domainsSeen.add(goal.domain);
    picked.push(goal);
  }
  for (const goal of core) {
    if (picked.length >= limit) break;
    if (!picked.find((p) => p.id === goal.id)) picked.push(goal);
  }
  return picked;
}

export function getGoalById(id) {
  return GOAL_BANK.find((g) => g.id === id) ?? null;
}

export function countGoalsForGroup({ age, ageBandId, severity } = {}) {
  const core = getCoreGoalsForGroup({ age, ageBandId, severity }).length;
  const bank = getExtendedBankGoals({ age, ageBandId, severity }).length;
  return { core, bank, total: core + bank };
}
