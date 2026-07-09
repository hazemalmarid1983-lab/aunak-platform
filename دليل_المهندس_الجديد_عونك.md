# الدليل الهندسي الشامل لمنصّة عونك (Aunak)

> **موجّه لـ:** مهندس برمجيات جديد ينضم إلى المشروع لأول مرة.
> **الهدف من الوثيقة:** أن تفهم المشروع بالكامل — رؤيته، بنيته، صفحاته، خدماته، بياناته، ومسار عمله — **دون الحاجة لسؤال المطوّر السابق**.
> **النطاق:** المشروع الرئيسي "عونك" فقط. وحدة **جزيرة اللغة الإنجليزية** (`/english` → `EnglishTalkIsland`) هي إضافة حديثة منفصلة **خارج نطاق هذه الوثيقة** (تُذكر عرَضاً فقط).
> **البيئة الإنتاجية:** https://aunak.vercel.app · **الفرع الإنتاجي:** `main`.

---

## فهرس المحتويات

1. [الهدف والرؤية](#1-الهدف-والرؤية)
2. [فلسفة المشروع](#2-فلسفة-المشروع)
3. [الهيكل العام (High-Level Architecture)](#3-الهيكل-العام)
4. [شجرة المشروع](#4-شجرة-المشروع)
5. [جميع الصفحات (Pages / Shells)](#5-جميع-الصفحات)
6. [جميع الخدمات (Services)](#6-جميع-الخدمات)
7. [قواعد البيانات (Databases)](#7-قواعد-البيانات)
8. [النماذج (Models)](#8-النماذج-models)
9. [مقدّمو السياق وإدارة الحالة (Providers / State Management)](#9-إدارة-الحالة)
10. [واجهات البرمجة (APIs)](#10-واجهات-البرمجة-apis)
11. [مسار انتقال البيانات (Data Flow)](#11-مسار-انتقال-البيانات)
12. [طريقة التنقّل (Navigation)](#12-طريقة-التنقل)
13. [كيفية تشغيل المشروع (Getting Started)](#13-كيفية-تشغيل-المشروع)
14. [أهم القرارات المعمارية](#14-أهم-القرارات-المعمارية)
15. [المشاكل الحالية](#15-المشاكل-الحالية)
16. [الأمور غير المكتملة](#16-الأمور-غير-المكتملة)
17. [الاقتراحات المستقبلية](#17-الاقتراحات-المستقبلية)
18. [ملحق: أهم 10 ملفات للبدء](#18-ملحق-أهم-10-ملفات-للبدء)

---

## 1. الهدف والرؤية

**عونك** منصّة رقمية سيادية متكاملة لدعم الأطفال ذوي **اضطراب طيف التوحّد** و**صعوبات التعلّم**، موجّهة للسوق العربي (واجهة عربية RTL أولاً مع دعم إنجليزي ثنائي). تجمع المنصّة في مكان واحد بين الجانب السريري، وولي الأمر، والطفل نفسه.

**الأهداف الجوهرية:**

1. **تشخيص مبكّر وتحويل:** تقييم مجاني سريع (6 مجالات) → ملف مبدئي → دفع/تفعيل → تقييم شامل.
2. **تأهيل مُدار سريرياً:** أدوات للأخصائي لإدارة الأهداف الإجرائية، السلوك، والانفعالات، وقياس مؤشرات (Harmony Score، التركيز، شدّة السلوك).
3. **إشراك الطفل حسّياً:** واجهة طفل تُغني عن يوتيوب عبر التلعيب، النطق الصوتي، والمكافآت اللحظية التي يتحكّم بها الأخصائي **عن بُعد**.
4. **سيادة البيانات والوصول:** هوية رقمية للطالب مع **ثلاثية الوصول** (ولي أمر / طفل / أخصائي) وتحقّق بيومتري صارم ومنع تحايل (Anti-spoof).
5. **محاسبة الجلسات:** ختم جلسات يومية **غير قابلة للتعديل** كمصدر حقيقة للفوترة.

**المكوّنات الوظيفية الكبرى:**

- بوابة سريرية للأخصائيين والإدارة (السجل الحي، التشخيص، تعديل السلوك ABC، الفصول، صعوبات التعلّم، الرصد العاطفي، إدارة الأزمات…).
- بوابة ولي الأمر (متابعة الطفل + بوابة تفعيل الاشتراك).
- واجهة الطفل التفاعلية (`/child`) — عالم لعب حسّي/بصري يُدار عن بُعد.
- نظام تواصل (Tawasul MVP) — تواصل عن بُعد بين الأخصائي والطفل مع "المرآة الشبحية" (Ghost Mirror).
- الأكاديمية الصيفية (Summer Academy) — مسارات تعلّم مُلعّبة.
- نظام تسجيل (Enrollment) + بصمة وجه بيومترية + بوابات تفعيل ودفع.

---

## 2. فلسفة المشروع

هذه المبادئ تفسّر "لماذا" الكود مكتوب بهذا الشكل، وهي أهم ما يجب استيعابه قبل التعديل:

| المبدأ | ماذا يعني عملياً |
|--------|-------------------|
| **السيادة (Sovereignty)** | المالك/الأخصائي يملك تحكّماً كاملاً وحيّاً في تجربة الطفل عن بُعد. مصطلح "Sovereign" يتكرّر في الأسماء (`sovereign*`) ويعني: صلاحيات عليا، تحكّم مباشر، ومصدر حقيقة واحد. |
| **العربية RTL أولاً** | كل الواجهات تُصمّم عربية أولاً، والنصوص ثنائية اللغة عبر كائنات `copy` داخل المكوّنات (لا مكتبة i18n). |
| **الذكاء الحتمي القابل للتفسير** | كل "الذكاء" السلوكي/السريري قائم على قواعد (rule-based) وليس نماذج توليدية — لا صناديق سوداء. الاستثناء الوحيد: نطق TTS الاختياري عبر ElevenLabs. |
| **نزاهة البيانات المالية** | سجلات الجلسات اليومية تُختم (Sealed) وتصبح **غير قابلة للتعديل** — مصدر الحقيقة للفوترة. |
| **بوّابة القيمة (Value Lock)** | الميزات الثمينة (البيومترية، الأقسام السريرية) لا تُفتح إلا بعد اشتراك نشط. |
| **نحافة الاعتماديات** | تجنّب الحزم الزائدة (لا axios، لا مكتبة airtable، لا راوتر، لا مدير حالة). الثمن: منطق يدوي أكثر في الشيفرة. |
| **مشاركة الكود خادم↔عميل** | منطق واحد يُستورد في الطرفين من `src/lib/` (مثل `plans`, `tripleAccessProtocol`, `tapPayments`). |

---

## 3. الهيكل العام

نمط معماري: **SPA (React) + دوال Serverless (Vercel) + Airtable كمخزن وحيد**. لا خادم دائم، ولا قاعدة SQL/NoSQL تقليدية.

```
┌─────────────────────────────────────────────────────────────┐
│                        المتصفح (Client)                        │
│  React 19 SPA (Vite) — عربية RTL                              │
│  ├─ توجيه يدوي عبر window.location.pathname (App.jsx)          │
│  ├─ الحالة: AuthContext + خطافات مخصّصة + sessionStorage       │
│  ├─ منطق مشترك مستورد من src/lib/                              │
│  └─ واجهات المتصفح: getUserMedia, WebGL/WASM (face-api),      │
│       Web Audio, Web Speech, Web Crypto                       │
└───────────────┬──────────────────────────┬──────────────────┘
                │ (المسار المباشر)          │ (المسار عبر البروكسي)
                │  fetch مباشر              │  /api/*
                ▼                          ▼
        ┌───────────────┐        ┌──────────────────────────┐
        │  Airtable API │◄───────┤  Vercel Serverless (api/) │
        │  (REST v0)    │        │  دوال Node ESM             │
        └───────────────┘        │  ├─ بروكسي Airtable/TTS    │
                                 │  ├─ تفعيل + ثلاثية توكنات  │
                                 │  ├─ دفع Tap + webhook      │
                                 │  ├─ تواصل (المرآة الشبحية) │
                                 │  └─ ختم الجلسات/التسوية    │
                                 └──────┬──────────┬──────────┘
                                        ▼          ▼
                                 ┌──────────┐ ┌──────────────┐
                                 │   Tap    │ │  ElevenLabs   │
                                 │ Payments │ │  TTS (اختياري)│
                                 └──────────┘ └──────────────┘
```

**الطبقات داخل `src/`:**

- `components/` — العرض (React) فقط.
- `hooks/` — السلوك والتأثيرات (خطافات React).
- `lib/` — المنطق النقي القابل لإعادة الاستخدام على الخادم والعميل معاً (هذا هو "دماغ" المشروع).

---

## 4. شجرة المشروع

```
aunak/
├── api/                         # دوال Vercel Serverless (Node ESM) — الواجهة الخلفية
│   ├── airtable.js              # بروكسي Airtable (يخفي التوكن عن العميل)
│   ├── academy/tts.js           # بروكسي TTS (ElevenLabs) للأكاديمية/الطفل
│   ├── activation/redeem.js     # تفعيل كود الاشتراك + توليد ثلاثية التوكنات
│   ├── parent/sessions.js       # جلسات الطفل للوحة ولي الأمر
│   ├── session/child-seal.js    # ختم جلسة لعب الطفل (جلسة يومية)
│   ├── settlement/seal.js       # ختم التسوية المالية
│   ├── payment/[action].js      # موجّه ديناميكي للدفع
│   ├── tawasul/[action].js      # موجّه ديناميكي لتواصل
│   └── _handlers/               # منطق المعالجات (لا تُعدّ دوالاً مستقلة على Vercel)
│       ├── dispatch.js          # createActionRouter — الموزّع المشترك
│       ├── payment/             # status · create-checkout · verify-return · webhook · mock-*
│       └── tawasul/             # verify-token · caseload · mirror · student-goal · assessment-sync · config · sanitize
│
├── src/
│   ├── main.jsx                 # نقطة الإقلاع (bootstrap master bypass + render)
│   ├── App.jsx                  # الموجّه الأعلى (اختيار الواجهة حسب المسار/الجلسة)
│   ├── App.css / index.css      # الأنماط العامة + keyframes الحسّية
│   │
│   ├── components/              # مكوّنات الواجهة (React)
│   │   ├── AunakEcosystemHub.jsx   # الحاوية السريرية الرئيسية + التنقّل بين الأقسام
│   │   ├── AunakGate / AunakActivationGate / PostActivationBiometric  # بوابات الدخول/التفعيل/البصمة
│   │   ├── Aunak*.jsx              # الأقسام السريرية (تفصيلها في §5)
│   │   ├── child/                 # واجهة الطفل التفاعلية
│   │   ├── parent/                # لوحة ولي الأمر
│   │   ├── tawasul/               # نظام تواصل
│   │   ├── summer-academy/        # الأكاديمية الصيفية
│   │   ├── assessment/            # التقييم المجاني
│   │   └── Payment*/Triple*/Sovereign*  # الدفع + أدوات سيادية
│   │
│   ├── hooks/                   # خطافات React (سلوك/تأثيرات) — تفصيلها في §6
│   │
│   └── lib/                     # المنطق الأساسي (بدون UI) — "الدماغ"
│       ├── airtable*.js           # الوصول للبيانات + الحقول + الجداول + المحوّلات
│       ├── auth.jsx               # سياق المصادقة + الأدوار + الاشتراك
│       ├── plans.js               # الباقات
│       ├── sovereign*.js          # البروتوكول السريري/الدخول/التشفير/الصوت/التجاوز
│       ├── biometricMatch.js      # مطابقة الوجه + منع التكرار
│       ├── harmonyEngine.js / goalEngine.js / initialAssessmentEngine.js
│       ├── tripleAccessProtocol.js # ثلاثية التوكنات
│       ├── tapPayments.js / paymentPlans.js / subscriptionEngine.js / ...
│       ├── tawasul*.js            # منطق تواصل والمرآة الشبحية
│       └── ... (تفصيل كامل في §6 و§18)
│
├── docs/                        # وثائق سابقة (عربية + بروتوكولات)
├── PROJECT_HANDOVER/            # وثائق التسليم التقنية التفصيلية (12 ملف)
├── scripts/                     # أدوات تشغيلية (Node): تشخيص، بذر، اختبار يدوي
├── .cursor/rules/               # قواعد Cursor (ذاكرة المشروع)
├── package.json / package-lock.json
├── vite.config.js / eslint.config.js / tailwind.config.js / postcss.config.js
├── vercel.json                  # rewrites: كل شيء → index.html عدا /api
└── index.html                   # قالب SPA (lang="ar")
```

**ملاحظات تنظيمية مهمة:**

- **فصل واضح:** عرض (`components`) / سلوك (`hooks`) / منطق نقي (`lib`).
- **الموجّهات الديناميكية** (`[action].js`) توحّد عدة نقاط نهاية في دالة واحدة لتفادي حدّ Vercel Hobby لعدد الدوال.
- **لا يوجد مجلد `tests/`** — الاختبارات الموجودة مجرّد سكربتات يدوية في `scripts/`.

---

## 5. جميع الصفحات

لا يوجد راوتر رسمي؛ التوجيه يدوي في `App.jsx` حسب `window.location.pathname` والجلسة. الواجهات العليا (Shells):

| المسار / الشرط | المكوّن الأعلى | الوصف |
|-----------------|----------------|-------|
| `/payment/return` | `PaymentReturn` | صفحة العودة من بوابة الدفع |
| `/child` | `ChildInteractiveShell` | واجهة الطفل التفاعلية (تُفحص أولاً) |
| `shouldShowTawasulShell()` | `TawasulPlatform` | نظام تواصل (Gate → Hub) |
| `/parent` | `ParentShell` | لوحة ولي الأمر |
| `/summer-academy` | `SummerAcademyShell` | الأكاديمية الصيفية (تتطلب جلسة) |
| `/english` | `EnglishTalkIsland` | **جزيرة اللغة الإنجليزية — خارج نطاق هذه الوثيقة** |
| غير ذلك (الافتراضي) | `GatedPlatform` | البوابة السريرية (Gate → ActivationGate → BiometricGate → EcosystemHub) |

### 5.1 البوابة السريرية — `GatedPlatform` → `AunakEcosystemHub`

الحاوية السريرية الرئيسية للأخصائي/الإدارة، بتنقّل مُفلتر بالصلاحية عبر قائمتين:

- **MAIN_NAV_ITEMS:** التسجيل، السجل الحي، التشخيص، الوسائط، السلوك، الفصول، العلمي، الأخصائيون، الموارد، البحث، التقارير، التحكم بالوصول.
- **NAV_ITEMS:** المباشر (Live)، الأزمات، التعلّم، الرصد العاطفي، البيومترية، المجتمع.

كل قسم مكوّن `Aunak*.jsx` مستقل:

| القسم | المكوّن |
|-------|---------|
| التشخيص | `AunakDiagnostics` |
| تعديل السلوك ABC | `AunakBehaviorMod` |
| إدارة الأزمات | `AunakCrisisManagement` |
| مركز التعلّم / صعوبات التعلّم | `AunakLearningCenter` |
| الرصد العاطفي | `AunakEmotion` / `AunakEmotionalLab` |
| البيومترية | `AunakBiometrics` |
| اللوحة المباشرة | `AunakLiveDashboard` |
| سجل الجلسات | `AunakSessionRegistry` |
| التقارير | `AunakReportsDashboard` |
| مركز البحث | `AunakResearchHub` |
| الأخصائيون | `AunakSpecialists` |
| التحكم بالوصول | `AunakAccessControl` |
| الوسائط الآمنة | `AunakSafeMedia` |
| العناصر العلمية | `AunakScientificItems` |
| الفصول | `AunakClassrooms` |
| مجتمع/محادثة | `AunakCommunityChat` |
| الموارد | `AunakResources` |
| التسجيل | `AunakEnrollment` |

عناصر سيادية إضافية: `SovereignCommandBar` (أوامر صوتية)، `SovereignMasterBypassPanel`.

### 5.2 واجهة الطفل — `src/components/child/`

| المكوّن | الدور |
|---------|------|
| `ChildInteractiveShell` | الحاوية + استطلاع المرآة الشبحية + تنسيق المكافأة/الهدوء |
| `ChildAvatar` | أفاتار روبوت حيّ (تنفّس، غمز، تتبّع المؤشر، مزاج) |
| `ChildGoalSpeaker` | زر نطق الهدف بلا نص (TTS + معادل بصري) |
| `ChildCelebration` | احتفال ملء الشاشة (ألعاب نارية، بالونات، Ta-da) — مكافأة مشروطة |
| `ChildCalmOverlay` | تدرّج مائع مهدّئ + كرة تنفّس |
| `ChildHomePanel` / `ChildPlayZone` / `ChildStarsPanel` / `ChildCalmZone` / `ChildAssessmentPanel` / `ChildBottomNav` | مناطق اللعب/النجوم/الهدوء/التقييم/التنقّل السفلي |
| `ChildAwniCompanion` | رفيق قديم **لم يعد مُستخدماً** (كود ميّت) |

### 5.3 نظام تواصل — `src/components/tawasul/`

- `TawasulGate` — دخول الأخصائي بالتوكن.
- `TawasulHub` — لوحة الأخصائي: الحالات، حفظ الهدف، لوحة المرآة، وزر «المنصة السيادية الكاملة».
- `TawasulMirrorPanel` — إرسال أوامر المرآة الحيّة للطفل.

### 5.4 لوحة ولي الأمر — `src/components/parent/`

`ParentShell` → `ParentBiometricGate` (بصمة بعد التفعيل) → `ParentDashboard` (متابعة الطفل، الجلسات، التقارير).

### 5.5 الأكاديمية الصيفية — `src/components/summer-academy/`

`AcademyShell`, `AcademyTrackHub`, `AcademyBrainWheel`, `AcademyMascot`, `AcademyLeaderboard`, `AcademyWelcomeMission`, `AcademyLiveBackground`, `AcademyParentZone`, `AcademyAnimatedIcon` — تجربة تعلّم مُلعّبة.

### 5.6 التقييم والدفع

`assessment/` (`FreeAssessmentFlow`, `AssessmentPromoModal`, `AssessmentResultScreen`) · `PaymentCheckoutButton`, `PaymentReturn`, `AunakPaywall`, `TriplePortalCards`, `SettlementConfirmModal`.

---

## 6. جميع الخدمات

"الخدمات" في المشروع نوعان: **محرّكات منطقية في `src/lib/`** (Domain Services) و**خطافات في `src/hooks/`** (تربط المنطق بالواجهة).

### 6.1 خدمات المنطق — `src/lib/`

**الوصول للبيانات:**
- `airtable.js` — عميل REST + CRUD الطلاب/الجلسات/المحاولات + `getField` (مطابقة مرنة للحقول).
- `airtableFields.js` — أسماء الأعمدة القانونية (snake_case) + `STUDENT_SELECT_CHECKLIST`.
- `airtableTables.js` — معرّفات الجداول (`tbl…`).
- `airtableMappers.js` — تحويل سجل Airtable → كائن طالب.

**المصادقة والصلاحيات:**
- `auth.jsx` — `AuthProvider` + الأدوار + `canAccessSection` + الاشتراك.
- `plans.js` — أكواد الباقات + `planAllows` + `landingForPlan`.
- `sovereignProtocol.js` — ثوابت البروتوكول السريري (العتبات).
- `sovereignLogin.js` — الدخول البيومتري السيادي.
- `sovereignMasterBypass.js` — مفتاح تجاوز QA.
- `childAccess.js` / `parentAccess.js` — دخول الطفل/ولي الأمر.
- `tawasulAuth.js` / `tawasulConfig.js` / `tawasulFetch.js` — مصادقة/إعداد/جلب تواصل.

**الذكاء والمعالجة (rule-based):**
- `biometricMatch.js` — مطابقة الوجه + منع التكرار (face-api).
- `harmonyEngine.js` — مؤشر الانسجام (عقوبة الفجوة 20%).
- `goalEngine.js` — محرك الأهداف (AUN-4611) + إثبات الحضور المالي.
- `initialAssessmentEngine.js` — التقييم المجاني (6 مجالات، 0–100).
- `sovereignCrypto.js` — تشفير AES-256-GCM.
- `sovereignAudio.js` — توليف Web Audio (نغمات/مكافأة/هدوء).
- `sovereignVoice.js` — أوامر Web Speech للمشرف.
- `tawasulMirror.js` — منطق المرآة الشبحية.

**الدفع والاشتراك:**
- `tapPayments.js` — تكامل Tap (شحنة + hashstring).
- `paymentPlans.js` — التسعير (SAR): tutor=299، medical=499، assessment_only=199، institution=يدوي/B2B.
- `mockPayments.js` — وضع الدفع الوهمي.
- `paymentClient.js` / `paymentActivation.js` / `paymentWebhookProcessor.js`.
- `activationCodes.js` — توليد/تحقّق الأكواد.
- `subscriptionEngine.js` — redeem + بوابة التفعيل.
- `tripleAccessProtocol.js` — ثلاثية التوكنات + روابط البوابات.

**الجلسات والتقارير والعزل:**
- `childSessionSeal.js` / `tawasulSessionSeal.js` / `childSessionBridge.js` — ختم/جسر جلسات الطفل.
- `settlementEngine.js` / `specialistAttestation.js` — التسوية المالية + الإقرار.
- `specialistIsolation.js` — عزل حالات كل أخصائي.
- `reportEngine.js` / `parentDashboardEngine.js` — محركات التقارير/لوحة ولي الأمر.
- `summerAcademyEngine.js` / `summerAcademyAirtable.js` — محرك/تخزين الأكاديمية.

**مساعدات وثيمات:**
- `enrollmentValidation.js` / `enrollmentLink.js` — تحقّق/روابط التسجيل.
- `diagnosisOptions.js` / `countryDialCodes.js` — خيارات التشخيص/الدول.
- `luxTheme.js` / `childTheme.js` / `tawasulChildTheme.js` / `academyTheme.js` — الثيمات.
- `research.js` / `studentPrivacy.js` — البحث/الخصوصية.

### 6.2 الخطافات — `src/hooks/`

| الخطاف | الدور |
|--------|------|
| `useBiometricScan` | مسح/التقاط الوجه (يدعم `enrollmentMode`) |
| `useMeltdownPredictor` | كاشف الانهيار (عتبة 280ms) |
| `useGazeNeutralityObserver` | حياد النظرة (تنبيه بعد 5s) |
| `useCrisisAlerts` | معادلة خطورة الأزمة (شدّة × تكرار × مدة) |
| `useHarmonyEngine` / `useActiveStudentMetrics` / `useRoadmapStats` | مؤشرات الطالب |
| `useStudents` / `useAirtableData` | جلب البيانات |
| `useGoalEngine` / `useParentDashboard` / `useSummerAcademy` | محركات مرتبطة بالواجهة |
| `useSovereignVoice` / `useAcademyVoice` / `usePromoVoice` / `useAcademyMood` | صوت/مزاج |
| `useTawasulIdleGaze` | خمول نظرة تواصل |

### 6.3 خدمات خارجية (Runtime Services)

| الخدمة | نوع الاعتماد | ملاحظة |
|--------|--------------|--------|
| **Airtable API** | حرج (المخزن الوحيد) | REST v0 عبر PAT |
| **Vercel** | حرج (استضافة + دوال) | خطة Hobby (قيود عدد الدوال) |
| **Tap Payments** | مهم (الدفع) | REST + hashstring |
| **ElevenLabs** | اختياري (TTS) | سقوط آمن لـ Web Speech |
| **jsDelivr CDN** | مهم | نماذج face-api تُحمّل وقت التشغيل |

---

## 7. قواعد البيانات

**المخزن الوحيد هو Airtable** (لا SQL/NoSQL تقليدي). الوصول عبر REST API بـ `fetch` أصلي. المصدر القانوني لأسماء الأعمدة: `src/lib/airtableFields.js` — **snake_case إنجليزي فقط**، وقيم `select` بحروف صغيرة.

### 7.1 القواعد (Bases)

| البيئة | Base ID | المصدر |
|--------|---------|--------|
| الإنتاج السيادي | `appaGfKj4vYhMw0cb` | افتراضي في `airtable.js` و`redeem.js` |
| تواصل (MVP/Sandbox) | `app3vCT2j2JepNVZa` | يُختار عند `VITE_TAWASUL_MVP=true` |

### 7.2 الجداول (`src/lib/airtableTables.js`)

| المفتاح المنطقي | Table ID | ملاحظة |
|-----------------|----------|--------|
| `students` | `tblzYmBGmCxx2vdcr` | الجدول المحوري |
| `dailySessions` | `tbl3mlewMLvqp6AXB` | سجل الفوترة غير القابل للتعديل |
| `scientificItems` | `tblnCbBSmwDWwO5SJ` | ثابت |
| `specialists` | `tblnmcLd5M3U6sErl` | قابل للتهيئة |
| `abcData` | `tblJ580ptTVkv07hD` | تعديل السلوك ABC |
| `safeMedia` | `tbljdOSE8CozrzBZN` | مكتبة الوسائط |
| `melodyLab` | `tblMddsXqCz91hfoU` | مختبر الألحان |
| `communityResources` | `tblV28iWarzve32pP` | موارد المجتمع |
| `accessControl` | `tblfBvd5WI7alVCFU` | صلاحيات/توكنات الأخصائي والإدارة |
| `learningDifficulties` | `tblcNXSmU90TomEHH` | صعوبات التعلّم |
| `emotionalMonitoring` | `tblokLHmSHss3FQft` | الرصد العاطفي + الأزمات |
| `goalAttempts` | *(فارغ افتراضياً)* | يتطلب متغيّر بيئة وإلا يسقط على localStorage |
| `summerAcademy` | *(فارغ افتراضياً)* | يتطلب متغيّر بيئة وإلا يسقط على localStorage |

### 7.3 العلاقات (Relationships)

```
Specialists (1) ──< assigned_specialist >── (N) Students     # عزل الحالات في تواصل
Students   (1) ──< student (link)        >── (N) Goal Attempts
Students   (1) ──< camera_access (link)  >── (N) Access Control
Students   (1) ──< student (link)        >── (N) Summer Academy
Daily Sessions / ABC / Learning ── ربط بالاسم/النص (وليس دائماً روابط رسمية)
```

> **تحذير مهم:** كثير من الربط منطقي بالاسم/الكود وليس علاقات Airtable رسمية (مثل Daily Sessions عبر `specialist_name`/`student_name`).

### 7.4 قيود select حرجة

يجب إنشاء خيارات `select` **مسبقاً** في Airtable (راجع `STUDENT_SELECT_CHECKLIST`)، وإلا يفشل الكتابة بـ `SELECT_OPTION_MISSING`. أمثلة:
`status: new,active` · `subscription_status: pending,active` · `plan_code: free,tutor,medical,institution,assessment_only` · `mirror_command: echo_goal,drop_star,drop_reward,calm_pulse,clear`.

---

## 8. النماذج (Models)

لا توجد فئات ORM (لأنه لا SQL). "النماذج" هنا هي **أشكال البيانات (schemas)** لجداول Airtable + كائن الطالب المُشتق. أهمها:

### 8.1 Student (الجدول المحوري)

| الفئة | الحقول |
|------|--------|
| هوية | `student_name`, `student_id`, `age`, `diagnosis`, `parent_phone`, `parent_country_code`, `preferred_destination` |
| اشتراك/دفع | `subscription_status` (pending→active), `plan_code`, `subscription_expires_at`, `last_payment_at`, `payment_method`, `activation_code_used`, `payment_status`, `session_fee` |
| بيومترية | `face_biometric` (128 float JSON), `biometric_status`, `camera_access` (link), `biometric_attendance_verified`, `biometric_attendance_at` |
| تقييم | `initial_assessment_score` (0–100), `comprehensive_assessment_status` |
| ثلاثية الوصول | `parent_access_token`, `child_interactive_token`, `specialist_tutor_token` |
| مؤشرات سريرية | `harmony_score`, `academic_progress`, `behavior_intensity`, `focus_level`, `improvement_index`, `operating_efficiency`, `t_static`, `eye_movement_map` |
| جلسة | `session_start_time`, `clinical_session_status`, `clinical_session_notes`, `ai_session_report`, `programmed_goal`, `status` |
| العزل | `assigned_specialist` (link → Specialists) |
| المرآة الشبحية | `mirror_command` (echo_goal/drop_star/drop_reward/calm_pulse/clear), `mirror_payload` |

### 8.2 نماذج أخرى

- **Access Control:** `user_email`, `user_name`, `status`, `permissions`, `access_level` (parent/admin/specialist), `access_areas`, `access_token`, `last_login`.
- **Specialists:** `specialist_name`, `specialty`, `professional_email`, `status`, `active_cases`, `rating`, `specialist_tutor_token`, `Students` (link).
- **Daily Sessions:** `session_date`, `specialist_name`, `student_name`, `notes`, `claim_status` (Sealed)، `sealed_at`, `specialist_signature`, `immutable_hash`, `session_sequence`, `pin_verified`. عند `Sealed` → غير قابل للتعديل (`assertClaimNotSealed`).
- **Goal Attempts:** `student`, `session_id`, `session_date`, `goal_label`, `goal_source` (IEP/ABC/Learning), `success_percent`, `attempt_number`, `specialist_email`, `recorded_at`.
- **ABC/Behavior · Learning Difficulties · Emotional Monitoring · Scientific Items · Safe Media · Melody Lab · Community Resources · Summer Academy** — راجع مخطط الحقول في `docs/AIRTABLE_SCHEMA_PROTOCOL.md`.

> **قاعدة ذهبية:** أي حقل جديد يجب تسجيله في `airtableFields.js` باسم snake_case، وأي `select` جديد يُنشأ في Airtable أولاً.

---

## 9. إدارة الحالة

**لا Redux ولا Zustand.** إدارة الحالة عبر:

### 9.1 السياق العالمي — `AuthProvider` (`src/lib/auth.jsx`)

```
AuthProvider
 ├─ user            # كائن الجلسة الحالي
 ├─ login(session)  # يكتب في sessionStorage
 ├─ logout()
 ├─ setActiveStudent(id)
 └─ patchSession(patch)   # تحديث جزئي للجلسة (بوابات/تبديل عرض)
```

### 9.2 الخطافات المخصّصة

تجلب/تشتق البيانات: `useStudents`, `useAirtableData`, `useActiveStudentMetrics`, `useRoadmapStats`, `useHarmonyEngine`, `useGoalEngine`, `useCrisisAlerts`, `useParentDashboard`, `useSummerAcademy`.

### 9.3 التخزين المستمر

| المفتاح | المخزن | المحتوى |
|--------|--------|---------|
| `aunak.session.v1` | sessionStorage | جلسة المستخدم |
| `aunak.sovereignMasterBypass.v1` | sessionStorage | تفعيل مفتاح QA |
| `aunak.activationCodes.v1` | localStorage | أكواد التفعيل المحلية |
| `aunak.dailySessions.v1` / `aunak.goalAttempts.v1` | localStorage | نُسخ احتياطية |

> **الأدوار (Roles):** `admin` (مدير أعلى) · `specialist` (أخصائي) · `parent` (ولي أمر). **المالك السيادي** (`hazem@aunak-center.com`) له تجاوز كامل عبر `isSovereignOwner()`.

---

## 10. واجهات البرمجة (APIs)

الخلفية = دوال Vercel Serverless في `api/`. نقاط النهاية المتقاربة تُجمَّع في دالة واحدة عبر `createActionRouter` (`api/_handlers/dispatch.js`) الذي يقرأ `req.query.action` ويوجّه حسب الفعل + الميثود.

### 10.1 الوكيل والبنية

| المسار | الميثود | الوظيفة |
|--------|---------|---------|
| `/api/airtable` | GET/POST/PATCH | بروكسي Airtable (يخفي المفتاح) |
| `/api/academy/tts` | POST | بروكسي TTS (503 عند غياب المفتاح → Web Speech) |

### 10.2 التفعيل والاشتراك

| المسار | الميثود | الوظيفة |
|--------|---------|---------|
| `/api/activation/redeem` | POST | تفعيل كود → `subscription_status=active` + باقة + **توليد ثلاثية التوكنات** + روابط البوابات |

### 10.3 الدفع — `/api/payment/[action]`

| الفعل | الميثود | الوظيفة |
|-------|---------|---------|
| `status` | GET | حالة/توفّر الدفع |
| `create-checkout` | POST | إنشاء عملية Tap/Mock (السعر من الخادم لا العميل) |
| `verify-return` | GET | تأكيد العودة من البوابة |
| `webhook` | POST | استقبال شحنة Tap → تحقّق hashstring → تفعيل |
| `mock-complete` / `mock-fire` | GET/POST | محاكاة الدفع (معاينة) |

### 10.4 تواصل — `/api/tawasul/[action]`

| الفعل | الميثود | الوظيفة |
|-------|---------|---------|
| `verify-token` | POST | تحقّق توكن الأخصائي → جلسة سيادية كاملة |
| `caseload` | POST | حالات الأخصائي (عزل حسب `assigned_specialist`) |
| `mirror` | POST | كتابة أمر المرآة الشبحية على سجل الطالب |
| `student-goal` | POST | حفظ/تحديث `programmed_goal` |
| `assessment-sync` | POST | مزامنة نتائج التقييم |

### 10.5 الجلسات والتسوية والوالدين

| المسار | الميثود | الوظيفة |
|--------|---------|---------|
| `/api/session/child-seal` | POST | ختم جلسة لعب الطفل → سجل يومي مختوم |
| `/api/settlement/seal` | POST | ختم التسوية المالية |
| `/api/parent/sessions` | GET | جلب جلسات الطفل لولي الأمر |

**أنماط مشتركة عبر المعالجات:** `sanitizeAscii()` على كل المدخلات (منع كسر Latin-1 بالعربية) · تحقّق الميثود (405) والحقول (400) · سقوط آمن (العميل يجرّب الخادم ثم fallback محلي) · الاستجابة دائماً JSON.

---

## 11. مسار انتقال البيانات

### 11.1 قناتان للوصول إلى Airtable

```
العميل ──> إمّا: مباشر (https://api.airtable.com) [VITE_AIRTABLE_* في الحزمة]
       └── أو: بروكسي (/api/airtable) [عند VITE_USE_AIRTABLE_PROXY=true — يخفي المفتاح]
```
مع سقوط تلقائي بين القناتين. القراءة عبر `fetchAirtableRecords` (ترقيم صفحات offset)، والكتابة عبر `airtableWrite` (POST/PATCH مع `typecast:true` وتنقية الحقول الفارغة).

### 11.2 تدفّق التسجيل والتفعيل (Enrollment → Activation)

```
تسجيل الطفل (AunakEnrollment) → تحقّق صارم + التقاط بصمة وجه + منع الوجه المكرر (≥94.7%)
   → سجل طالب في Airtable (subscription_status = pending)
   → دفع Tap أو كود تفعيل يدوي
   → /api/activation/redeem  →  subscription_status = active
        + توليد ثلاثية التوكنات (AUN-PRT / AUN-CHD / AUN-SPC)
        + بناء روابط البوابات الثلاث
```

### 11.3 تدفّق الدفع (Payment → Webhook)

```
العميل: create-checkout → الخادم يحسب السعر من paymentPlans.js (لا يثق بالعميل)
   → redirectUrl إلى Tap → دفع → العودة (/payment/return + verify-return)
   → Tap يرسل webhook (POST) → تحقّق hashstring → processCapturedPaymentCharge → تفعيل الاشتراك
```

### 11.4 المرآة الشبحية (Ghost Mirror — قلب تواصل)

```
الأخصائي (TawasulMirrorPanel) → /api/tawasul/mirror
   → يكتب mirror_command + mirror_payload على سجل الطالب في Airtable
        ▼
واجهة الطفل (ChildInteractiveShell) تستطلع Airtable كل ~3.5 ثانية
   → تنفّذ الأمر: echo_goal (نطق الهدف) · drop_star/drop_reward (احتفال) · calm_pulse (هدوء) · clear
```

### 11.5 ختم الجلسات (نزاهة الفوترة)

```
جلسة لعب الطفل → /api/session/child-seal (عتبة تفاعل دنيا)
   → سجل يومي في Daily Sessions (claim_status = Sealed + immutable_hash)
   → غير قابل للتعديل بعدها (assertClaimNotSealed يرمي CLAIM_SEALED_IMMUTABLE)
   → مصدر الحقيقة للتسوية المالية (/api/settlement/seal)
```

### 11.6 نسخ احتياطي محلي

الجلسات اليومية ومحاولات الأهداف تُخزَّن أيضاً في `localStorage` عند غياب الجداول السحابية (سقوط صامت — انظر §16).

---

## 12. طريقة التنقّل

- **لا `react-router`.** التوجيه يدوي في `App.jsx` عبر دوال تفحص `window.location.pathname` (`isChildPlayRoute`, `isParentDashboardRoute`, `isSummerAcademyRoute`, `isPaymentReturnRoute`, `shouldShowTawasulShell`).
- **التغليف الأعلى:** `ErrorBoundary` → `AuthProvider` → اختيار الواجهة حسب المسار.

**ترتيب فحص المسارات في `App.jsx`:**

```
/payment/return  → PaymentReturn
/english         → EnglishTalkIsland   (خارج النطاق)
/child           → ChildInteractiveShell
تواصل            → TawasulPlatform (Gate → Hub)
/parent          → ParentShell
/summer-academy  → SummerAcademyShell (يتطلب user)
غير ذلك          → GatedPlatform
```

**بوابات `GatedPlatform` بالتسلسل:**

```
AunakGate (دخول)
  → needsActivationGate?  → AunakActivationGate (تفعيل/دفع)
  → biometricGate=required? → PostActivationBiometric (بصمة بعد الاشتراك)
  → AunakEcosystemHub (المنصّة السريرية)
```

**التنقّل داخل الحاوية السريرية:** حالة محلية للقسم النشط + قوائم مُفلترة بالصلاحية عبر `canAccessSection(user, role, sectionId)`.

**تبديل عرض تواصل ↔ السيادي:** عبر `patchSession({ sovereignFullView: true/false })`.

---

## 13. كيفية تشغيل المشروع

### 13.1 المتطلبات

- **Node.js 18+** و **npm**.
- حساب **Airtable** مع قاعدة مطابقة للمخطط (§7) + Personal Access Token.
- (اختياري) مفاتيح **Tap Payments** و**ElevenLabs**.

### 13.2 خطوات التشغيل المحلي

```bash
# 1) تثبيت الاعتماديات
npm install

# 2) إعداد متغيّرات البيئة
#    انسخ .env.example إلى .env.local واملأ القيم
cp .env.example .env.local

# 3) تشغيل خادم التطوير
npm run dev            # خادم محلي
# أو
npm run dev:public     # مكشوف على الشبكة (--host)

# 4) فحص الجودة
npm run lint

# 5) بناء الإنتاج
npm run build          # يُخرج إلى dist/
npm run preview        # معاينة بناء الإنتاج
```

> **ملاحظة:** دوال `api/` تعمل على بيئة Vercel. للتجربة المحلية الكاملة للـ APIs استخدم `vercel dev` (Vercel CLI). خادم Vite وحده يخدم الواجهة فقط.

### 13.3 متغيّرات البيئة الأساسية

**خادمية (بدون `VITE_`، على Vercel):**

| المتغيّر | الغرض |
|---------|-------|
| `AIRTABLE_API_KEY` | توكن Airtable (يُفضّل خادمياً) |
| `AIRTABLE_BASE_ID` | معرّف القاعدة |
| `TAP_SECRET_KEY` | مفتاح Tap السري |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` | TTS سحابي (اختياري) |
| `MOCK_PAYMENTS` | تفعيل الدفع الوهمي في المعاينة |

**عميلية (`VITE_`، تُحقن في الحزمة):**

| المتغيّر | الغرض |
|---------|-------|
| `VITE_AIRTABLE_API_KEY` / `VITE_AIRTABLE_PAT` | توكن Airtable للمسار المباشر (⚠️ يظهر في العميل) |
| `VITE_AIRTABLE_BASE_ID` | القاعدة |
| `VITE_USE_AIRTABLE_PROXY` | `true` لاستخدام البروكسي بدل المباشر |
| `VITE_TAWASUL_MVP` | تفعيل قشرة تواصل + قاعدتها |
| `VITE_AIRTABLE_*_TABLE_ID` | معرّفات الجداول القابلة للتهيئة |
| `VITE_AUNAK_MASTER_KEY` | تجاوز مفتاح QA الافتراضي |

### 13.4 النشر

- Vercel مرتبط بمستودع GitHub؛ الدفع إلى `main` ينشر تلقائياً على `https://aunak.vercel.app`.
- `vercel.json`: إعادة كتابة كل المسارات → `index.html` عدا `/api/`.
- **لا CI/اختبارات آلية قبل النشر** (انظر §15).

---

## 14. أهم القرارات المعمارية

| القرار | المبرّر | المقايضة (Trade-off) |
|--------|---------|----------------------|
| **Airtable كمخزن وحيد** | سرعة إطلاق + واجهة إدارية جاهزة | ليس OLTP: حدود معدّل، لا معاملات، لا فهرسة حقيقية |
| **دوال Serverless + موجّهات ديناميكية** (`[action].js`) | تفادي حدّ Vercel Hobby لعدد الدوال | مسارات أقل وضوحاً، اختبار أصعب |
| **مشاركة `src/lib/` بين الخادم والعميل** | منطق واحد لا يتكرّر | خطر تسريب منطق حسّاس للعميل |
| **بلا راوتر رسمي** (توجيه يدوي) | تقليل الاعتماديات | لا روابط عميقة منظّمة ولا 404، هشاشة عند التوسّع |
| **بلا مدير حالة خارجي** (Context + Hooks) | بساطة | حالة موزّعة بلا مصدر حقيقة واحد |
| **ذكاء حتمي (rule-based)** | قابلية التفسير السريري | لا "ذكاء توليدي" |
| **توكنات نصية في Airtable + بصمة وجه** | لا حاجة لبنية OAuth | التحقّق على العميل في المسار المباشر، لا انتهاء صلاحية للتوكن |
| **ختم السجلات (Immutable)** | نزاهة الفوترة | تعقيد إضافي في منطق الكتابة |
| **بلا TypeScript** | سرعة | لا أمان أنواع في منطق مالي/سريري دقيق |

---

## 15. المشاكل الحالية

**مخاطر أمنية (الأهم أولاً):**

- **H1 — تسريب توكن Airtable إلى العميل:** في المسار المباشر يُضمَّن التوكن في حزمة الـ JS. أي مستخدم يستخرجه ويصل للقاعدة كاملة (بيانات أطفال حسّاسة). *التخفيف: فرض البروكسي وإزالة مفاتيح `VITE_AIRTABLE_*` من الإنتاج.*
- **H2 — الوثوق ببيانات حسّاسة على العميل:** المصادقة/الصلاحيات/الاشتراك تعمل في المتصفح، والجلسة في `sessionStorage` **غير موقّعة** (قابلة للتلاعب). *التخفيف: تحقّق صلاحيات خادمي للعمليات الحسّاسة.*
- **H3 — Master Bypass بقيمة معروفة:** `AUNAK-MASTER-2026` مضمّن في الكود ويتجاوز فحص الوجه المكرر. *التخفيف: نقله لمتغيّر بيئة إلزامي وتعطيله في الإنتاج.*
- **M1–M5:** لا rate limiting · تعداد/تخمين التوكنات · بصمات على العميل · نماذج face-api من CDN عام · CORS غير مقيّد.
- **L1–L4:** نص نائب للمفتاح، تسريب رسائل أخطاء Airtable، غياب رؤوس أمان (CSP/HSTS)، تسريب console في الإنتاج.

**ديون تقنية (أعلى أثراً):**

- لا اختبارات آلية ولا CI → خطر انحدار صامت (خصوصاً الدفع/التفعيل/المرآة).
- حجم الحزمة > 2MB وغياب code-splitting → تحميل أول بطيء (والجمهور المستهدف قد يكون على شبكات ضعيفة).
- الاعتماد على Airtable كقاعدة تطبيقية (لا معاملات، ربط بالاسم، استعلامات تجلب كل السجلات ثم تُرشّح على العميل).
- ازدواج منطق التفعيل بين العميل (`subscriptionEngine`) والخادم (`redeem`).
- كود ميّت (`ChildAwniCompanion`، دوال `@deprecated`).
- توجيه يدوي بلا راوتر، وحالة موزّعة بلا مصدر حقيقة واحد.
- غياب TypeScript، وغياب مراقبة أخطاء مركزية (Sentry).

**خصوصية القُصّر:** المنصّة تعالج بيانات صحّية/بيومترية لأطفال → تستوجب مراجعة امتثال شاملة (موافقة ولي الأمر، تقليل البيانات، الاحتفاظ/الحذف، التشفير أثناء التخزين).

---

## 16. الأمور غير المكتملة

- **جداول اختيارية غير مُعرّفة افتراضياً:** `goalAttempts` و`summerAcademy` تعتمد على متغيّرات بيئة؛ بدونها تسقط **بصمت** إلى `localStorage` (بيانات لا تصل للسحابة وتضيع بمسح المتصفح).
- **بروكسي Airtable غير مُفعّل افتراضياً:** يعمل فقط عند `VITE_USE_AIRTABLE_PROXY=true`، والوضع المباشر ما زال مساراً محتملاً.
- **تحقّق التوكنات كـ fallback على العميل** في وضع التطوير (childAccess/tawasulAuth) — يقرأ Airtable من المتصفح.
- **README افتراضي** (قالب Vite) لا يعبّر عن المشروع.
- **لا اختبارات آلية** (unit/e2e) ولا خط CI — فقط سكربتات يدوية في `scripts/`.
- **دوال placeholder** بمعاملات `void` في محاسبة الجلسات (`createSealedSessionClaim`).
- **كود ميّت** لم يُنظّف بعد (`ChildAwniCompanion`، حقول/دوال `@deprecated` في `airtable.js`).

---

## 17. الاقتراحات المستقبلية

مرتّبة بمراحل (مُلخّصة من خارطة التوصيات الكاملة في `PROJECT_HANDOVER/11_RECOMMENDATIONS.md`):

**المرحلة 0 — تأمين فوري (أيام):**
1. إجبار بروكسي Airtable في الإنتاج + إزالة مفاتيح `VITE_AIRTABLE_*`.
2. تحييد Master Bypass عن الإنتاج.
3. توكن Airtable بأقل صلاحيات + خطة تدوير.
4. إضافة رؤوس أمان (CSP/HSTS/X-Frame-Options) في `vercel.json`.
5. توثيق `.env.example` كاملاً.

**المرحلة 1 — شبكة أمان هندسية (أسبوع–أسبوعان):**
6. CI على GitHub Actions (`lint` + `build` على كل PR).
7. اختبارات وحدة للمنطق الحرج (Vitest): `plans`, `initialAssessmentEngine`, `harmonyEngine`, `goalEngine`, `activationCodes`, `tripleAccessProtocol`.
8. رصد أخطاء (Sentry) للعميل والدوال.
9. تحقّق صلاحيات خادمي للعمليات الحسّاسة.

**المرحلة 2 — الأداء (أسبوعان–3):**
10. Code-splitting (`React.lazy` لكل قشرة) + تحميل `face-api` عند الحاجة فقط.
11. استضافة نماذج face-api ذاتياً + SRI.
12. ميزانية أداء في CI.
13. Rate limiting على `redeem`/`verify-token`/`create-checkout`/`mirror`.

**المرحلة 3 — تقوية طبقة البيانات (3–6 أسابيع):**
14. طبقة وصول بيانات خادمية موحّدة (لا وصول مباشر من العميل).
15. تقييم قاعدة OLTP مناسبة (Postgres/Supabase) وترحيل تدريجي يبدأ بالجداول الأكثر كتابة.
16. استبدال الربط بالاسم/النص بعلاقات/مفاتيح حقيقية.
17. إزالة السقوط الصامت إلى localStorage للبيانات المحاسبية.

**المرحلة 4 — جودة الشيفرة (مستمر):**
18. توحيد منطق التفعيل في وحدة واحدة.
19. حذف الكود الميّت.
20. راوتر منظّم (react-router) مع معالجة 404.
21. تبنّي TypeScript تدريجياً بدءاً من `src/lib/`.
22. README حقيقي + مخطط تدفّقات.

**المرحلة 5 — الامتثال وخصوصية القُصّر:**
23. مراجعة امتثال لبيانات صحّية/بيومترية لقُصّر.
24. تشفير البيانات الحسّاسة الساكنة.
25. مسار حذف/تصدير بيانات الطفل (حق ولي الأمر).

---

## 18. ملحق: أهم 10 ملفات للبدء

اقرأها بهذا الترتيب لتكوّن صورة كاملة بأسرع وقت:

1. `src/App.jsx` — التوجيه واختيار الواجهات.
2. `src/lib/auth.jsx` — المصادقة/الصلاحيات/الجلسة.
3. `src/lib/airtableFields.js` — مخطط البيانات (المصدر القانوني للحقول).
4. `src/lib/airtable.js` — الوصول للبيانات (CRUD).
5. `src/lib/plans.js` — الباقات والصلاحيات حسب الاشتراك.
6. `src/lib/biometricMatch.js` — البيومترية ومنع التحايل.
7. `src/lib/tripleAccessProtocol.js` — ثلاثية الوصول (parent/child/specialist).
8. `api/_handlers/dispatch.js` + `api/*/[action].js` — بنية الخلفية.
9. `src/components/AunakEcosystemHub.jsx` — الواجهة السريرية.
10. `src/components/child/ChildInteractiveShell.jsx` — واجهة الطفل + المرآة الشبحية.

**وثائق مكمّلة:** مجلد `PROJECT_HANDOVER/` (12 وثيقة تقنية تفصيلية) · `docs/AIRTABLE_SCHEMA_PROTOCOL.md` (مخطط الحقول الكامل) · `docs/TAWASUL_MVP.md` (تفاصيل تواصل).

---

> **نصيحة أخيرة للمهندس الجديد:** قبل أي تعديل على منطق الدفع/التفعيل/المرآة، افهم أن **Airtable هو مصدر الحقيقة**، وأن **الحقول snake_case وخيارات select يجب أن توجد مسبقاً**، وأن **السجلات المختومة غير قابلة للتعديل**. ابدأ تعديلاتك في `src/lib/` (المنطق النقي) لأنه يُستخدم في الخادم والعميل معاً.
