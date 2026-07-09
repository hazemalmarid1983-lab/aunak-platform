# PROJECT MASTER DOCUMENT — منصة عونك (Aunak)

> الوثيقة المرجعية الموحّدة الكاملة للمشروع. ملف واحد يغني عن أي ملفات متفرّقة.
> الإنتاج: https://aunak.vercel.app · قاعدة الإنتاج: `appaGfKj4vYhMw0cb` · قاعدة تواصل: `app3vCT2j2JepNVZa`
> المستودع: `github.com/hazemalmarid1983-lab/aunak-platform` · آخر تحديث للوثيقة: يوليو 2026
>
> **النطاق:** عونك الرئيسية السريرية + مسار تواصل (Tawasul) + الأكاديمية الصيفية + واجهة الطفل + لوحة ولي الأمر + التسجيل/الدفع/البصمة.

---

## جدول المحتويات
1. نظرة عامة والغرض
2. حزمة التقنيات (Tech Stack)
3. الهيكل الكامل للمشروع
4. كيف يبدأ التطبيق (Bootstrap)
5. جميع الصفحات والمسارات (Pages / Routes)
6. جميع الخدمات (Services / lib)
7. قاعدة البيانات (Database)
8. جميع النماذج (Models)
9. جميع الـ APIs
10. مسار انتقال البيانات (Data Flow)
11. أين تنتهي كل عملية (Operation Lifecycles)
12. المصادقة والصلاحيات
13. الذكاء والمعالجة (AI Modules)
14. الأشياء غير المكتملة والمخاطر
15. متغيّرات البيئة
16. فهرس الملفات السريع

---

## 1) نظرة عامة والغرض

**عونك** منصّة سيادية لدعم الأطفال ذوي **اضطراب طيف التوحّد** و**صعوبات التعلّم** (عربية RTL أولاً + إنجليزي). تجمع:
- بوابة سريرية للأخصائي/الإدارة (تشخيص، سلوك ABC، فصول، صعوبات تعلّم، رصد عاطفي، أزمات، تقارير…).
- **واجهة الطفل التفاعلية** (`/child`) — عالم حسّي يُدار عن بُعد عبر «المرآة الشبحية».
- **نظام تواصل (Tawasul)** — تواصل أخصائي↔طفل عن بُعد.
- **الأكاديمية الصيفية** — تعلّم مُلعّب.
- **لوحة ولي الأمر** + بوابات تفعيل/دفع + بصمة وجه بيومترية.

**الأهداف:** تشخيص مبكّر → تحويل → تأهيل مُدار سريرياً → إشراك الطفل حسّياً → محاسبة جلسات غير قابلة للتعديل → سيادة بيانات ووصول ثلاثي.

---

## 2) حزمة التقنيات (Tech Stack)

| الطبقة | التقنية |
|--------|---------|
| الواجهة | React 19 + Vite 8 (SPA، بلا SSR) |
| التنسيق | Tailwind CSS 3 + PostCSS + Autoprefixer + `luxTheme` |
| الحركة | framer-motion 12 + CSS keyframes |
| الأيقونات | lucide-react |
| البيومترية | @vladmandic/face-api (نماذج من jsDelivr CDN) |
| الخلفية | Vercel Serverless Functions (Node، ESM) في `api/` |
| قاعدة البيانات | Airtable REST v0 (fetch أصلي، بلا حزمة `airtable`) |
| الدفع | Tap Payments (+ Mock للمعاينة) |
| الصوت/النطق | Web Audio API · Web Speech API · ElevenLabs TTS (اختياري) |
| التشفير | Web Crypto API (AES-256-GCM) |
| الجودة | ESLint 10 (react-hooks + react-refresh) |
| الاستضافة | Vercel (فرع الإنتاج `main`)؛ SPA rewrite عدا `/api` |

لا TypeScript · لا Redux/Zustand (الحالة عبر Context + Hooks) · لا react-router (توجيه يدوي بالمسار).

---

## 3) الهيكل الكامل للمشروع

```
aunak/
├── index.html                  # قالب SPA (lang="ar")
├── package.json                # الاعتماديات والسكربتات
├── vite.config.js · eslint.config.js · tailwind.config.js · postcss.config.js
├── vercel.json                 # rewrites: كل شيء → index.html عدا /api
│
├── api/                        # Vercel Serverless (الخلفية)
│   ├── airtable.js             # بروكسي Airtable (يخفي التوكن)
│   ├── academy/tts.js          # بروكسي TTS (ElevenLabs)
│   ├── activation/redeem.js    # تفعيل كود → اشتراك + ثلاثية توكنات
│   ├── parent/sessions.js      # جلسات الطفل لولي الأمر
│   ├── session/child-seal.js   # ختم جلسة لعب الطفل
│   ├── settlement/seal.js      # ختم التسوية المالية
│   ├── payment/[action].js     # موجّه الدفع (status,create-checkout,verify-return,webhook,mock-*)
│   ├── tawasul/[action].js     # موجّه تواصل (verify-token,caseload,mirror,student-goal,assessment-sync)
│   └── _handlers/
│       ├── dispatch.js         # createActionRouter المشترك
│       ├── payment/*           # معالجات الدفع
│       └── tawasul/*           # معالجات تواصل
│
├── src/
│   ├── main.jsx                # الإقلاع
│   ├── App.jsx                 # الموجّه الأعلى
│   ├── index.css / App.css     # أنماط + keyframes حسّية
│   ├── components/             # مكوّنات الواجهة
│   │   ├── AunakEcosystemHub.jsx   # الحاوية السريرية
│   │   ├── Aunak*.jsx              # الأقسام السريرية
│   │   ├── child/                 # واجهة الطفل (Shell,Avatar,GoalSpeaker,Celebration,CalmOverlay…)
│   │   ├── parent/                # لوحة ولي الأمر
│   │   ├── tawasul/               # تواصل (Gate,Hub,MirrorPanel)
│   │   ├── summer-academy/        # الأكاديمية الصيفية
│   │   └── assessment/            # التقييم المجاني
│   ├── hooks/                  # خطافات (سلوك/تأثيرات)
│   └── lib/                    # المنطق الأساسي
│
├── docs/                       # وثائق سابقة (عربية + بروتوكولات)
├── scripts/                    # أدوات Node (تشخيص/بذر/اختبار/إصدار أكواد)
└── PROJECT_HANDOVER/           # تقرير تسليم مفصّل (12 ملفاً) — هذه الوثيقة تلخّصه في ملف واحد
```

---

## 4) كيف يبدأ التطبيق (Bootstrap)

```
index.html  →  <div id="root">  →  /src/main.jsx
   main.jsx:
     1. bootstrapMasterBypassFromUrl()   # يقرأ ?master= ويُفعّل تجاوز QA إن صحّ
     2. createRoot(root).render(<StrictMode><App/></StrictMode>)
   App.jsx (ErrorBoundary → AuthProvider → توجيه حسب window.location.pathname):
     - AuthProvider يقرأ الجلسة من sessionStorage (aunak.session.v1)
     - يختار الواجهة حسب المسار (انظر §5)
```

**تسلسل قرار الواجهة في `App.jsx`:**
```
if /payment/return        → <PaymentReturn/>
else if /child            → <ChildInteractiveShell/>
else if Tawasul shell      → <TawasulPlatform/>   (Gate → Hub)
else if /parent           → <ParentShell/>
else if /summer-academy   → <SummerAcademyShell/> (يتطلب user)
else                      → <GatedPlatform/>      (Gate → ActivationGate → BiometricGate → EcosystemHub)
```

---

## 5) جميع الصفحات والمسارات (Pages / Routes)

| المسار | المكوّن | من يدخله | الوصف |
|--------|---------|----------|-------|
| `/` (الجذر) | `AunakEcosystemHub` عبر `GatedPlatform` | أخصائي/إدارة | البوابة السريرية الكاملة |
| `/` (بوابة) | `AunakGate` | غير مسجّل | تسجيل الدخول (توكن/بيومتري) |
| `/` (بوابة تفعيل) | `AunakActivationGate` | ولي أمر بلا اشتراك | دفع/كود تفعيل |
| `/` (بوابة بصمة) | `PostActivationBiometric` | بعد التفعيل | التقاط بصمة الطفل |
| `/child` | `ChildInteractiveShell` | الطفل (توكن `AUN-CHD-`) | عالم الطفل الحسّي + المرآة |
| Tawasul | `TawasulGate` → `TawasulHub` | أخصائي تواصل (`AUN-SPC-`) | حالات + هدف + مرآة + زر «المنصة السيادية الكاملة» |
| `/parent` | `ParentShell` → `ParentDashboard` | ولي أمر (`AUN-PRT-`) | متابعة الطفل والجلسات والتقارير |
| `/summer-academy` | `AunakSummerAcademy` | مسجّل | مسارات تعلّم مُلعّبة |
| `/payment/return` | `PaymentReturn` | عائد من الدفع | تأكيد نتيجة الدفع |

**أقسام البوابة السريرية داخل `AunakEcosystemHub`** (مُفلترة بالصلاحية):
`enrollment, registry, diagnostics, media, behavior, classrooms, scientific, specialists, resources, research, reports, access` + `live, crisis, learning, emotion, biometrics, community`.

---

## 6) جميع الخدمات (Services — `src/lib/`)

### قاعدة البيانات والوصول
- `airtable.js` — عميل REST + CRUD (طلاب، جلسات يومية، محاولات أهداف) + `getField` (مطابقة مرنة) + بروكسي/مباشر مع سقوط تلقائي.
- `airtableFields.js` — أسماء الأعمدة القانونية (snake_case) + checklist لخيارات select.
- `airtableTables.js` — معرّفات الجداول (tbl…).
- `airtableMappers.js` — `mapStudent(record)` → كائن طالب موحّد.

### المصادقة والصلاحيات
- `auth.jsx` — `AuthProvider`, `verifyAccessToken`, الأدوار، `canAccessSection`, حالة الاشتراك.
- `plans.js` — أكواد الباقات + `planAllows` + `landingForPlan`.
- `sovereignProtocol.js` — ثوابت البروتوكول (عتبات).
- `sovereignLogin.js` — الدخول البيومتري السيادي.
- `sovereignMasterBypass.js` — مفتاح تجاوز QA (`AUNAK-MASTER-2026`).
- `childAccess.js` / `parentAccess.js` — دخول الطفل/ولي الأمر.
- `tawasulAuth.js` / `tawasulConfig.js` / `tawasulFetch.js` — مصادقة/إعداد/جلب تواصل.

### الذكاء والمعالجة
- `biometricMatch.js` — مطابقة الوجه (face-api) + منع التكرار (Anti-spoof ≥94.7%).
- `harmonyEngine.js` — مؤشر الانسجام (عقوبة الفجوة 20%).
- `goalEngine.js` — محرك الأهداف AUN-4611 + إثبات الحضور المالي.
- `initialAssessmentEngine.js` — التقييم المجاني (6 مجالات، 0–100).
- `sovereignCrypto.js` — AES-256-GCM.
- `sovereignAudio.js` — توليف Web Audio (نبضات/مكافأة Ta-da/درون هدوء).
- `sovereignVoice.js` + `academyVoice.js` — نطق وأوامر صوتية.
- `tawasulMirror.js` — منطق المرآة الشبحية.

### الدفع والاشتراك
- `tapPayments.js` — شحنة Tap + تحقّق hashstring.
- `paymentPlans.js` — التسعير (SAR): tutor=299، medical=499، assessment_only=199، institution=يدوي.
- `mockPayments.js` · `paymentClient.js` · `paymentActivation.js` · `paymentWebhookProcessor.js`.
- `activationCodes.js` — توليد/تحقّق `AUN-{PLAN}-XXXX-YYYY`.
- `subscriptionEngine.js` — redeem + بوابة التفعيل (Value Lock).
- `tripleAccessProtocol.js` — ثلاثية التوكنات + روابط البوابات.

### الجلسات والتقارير والعزل
- `childSessionSeal.js` · `tawasulSessionSeal.js` · `childSessionBridge.js`.
- `settlementEngine.js` · `specialistAttestation.js` · `specialistIsolation.js`.
- `reportEngine.js` · `parentDashboardEngine.js`.
- `summerAcademyEngine.js` · `summerAcademyAirtable.js`.

### مساعدات
- `enrollmentValidation.js` · `enrollmentLink.js` · `diagnosisOptions.js` · `countryDialCodes.js` · `luxTheme.js` · `childTheme.js` · `research.js` · `studentPrivacy.js`.

---

## 7) قاعدة البيانات (Airtable)

**القواعد:** الإنتاج `appaGfKj4vYhMw0cb` · تواصل `app3vCT2j2JepNVZa` (يُختار عند `VITE_TAWASUL_MVP=true`).

**الجداول:**
| المفتاح | Table ID | الوصف |
|---------|----------|-------|
| students | `tblzYmBGmCxx2vdcr` | الجدول المحوري |
| dailySessions | `tbl3mlewMLvqp6AXB` | سجل جلسات غير قابل للتعديل |
| specialists | `tblnmcLd5M3U6sErl` | الأخصائيون + الحالات |
| accessControl | `tblfBvd5WI7alVCFU` | صلاحيات/توكنات |
| abcData | `tblJ580ptTVkv07hD` | تعديل السلوك |
| learningDifficulties | `tblcNXSmU90TomEHH` | صعوبات التعلّم |
| emotionalMonitoring | `tblokLHmSHss3FQft` | رصد عاطفي/أزمات |
| scientificItems | `tblnCbBSmwDWwO5SJ` | مكتبة البنود |
| safeMedia | `tbljdOSE8CozrzBZN` | وسائط آمنة |
| melodyLab | `tblMddsXqCz91hfoU` | مختبر الألحان |
| communityResources | `tblV28iWarzve32pP` | موارد المجتمع |
| goalAttempts | *(env، وإلا localStorage)* | محاولات الأهداف |
| summerAcademy | *(env، وإلا localStorage)* | الأكاديمية |

**أهم حقول Students:**
- هوية: `student_name, student_id, age, diagnosis, parent_phone, parent_country_code, preferred_destination`.
- اشتراك: `subscription_status(pending→active), plan_code, subscription_expires_at, last_payment_at, payment_method, activation_code_used`.
- بيومترية: `face_biometric(128 float), biometric_status, camera_access, biometric_attendance_verified/at`.
- تقييم: `initial_assessment_score, comprehensive_assessment_status`.
- ثلاثية الوصول: `parent_access_token, child_interactive_token, specialist_tutor_token`.
- مؤشرات: `harmony_score, academic_progress, behavior_intensity, focus_level, improvement_index, t_static, programmed_goal, ai_session_report`.
- تواصل: `assigned_specialist(link)`, المرآة: `mirror_command, mirror_payload`.

**قيم select حرجة:** `mirror_command: echo_goal,drop_star,drop_reward,calm_pulse,clear` · `plan_code: free,tutor,medical,institution,assessment_only` — يجب إنشاؤها مسبقاً في Airtable وإلا يفشل الكتابة.

---

## 8) جميع النماذج (Models)

المشروع بلا ORM؛ «النماذج» = مخطط جداول Airtable (§7) + الكائنات المشتقّة في JS:

**Student (بعد `mapStudent`):**
```
{ id, name, studentCode, age, diagnosis, status, subscriptionRaw, plan,
  faceBiometric, harmonyScore, academicProgress, behaviorIntensity, focusLevel,
  programmedGoal, preferredDestination, cameraAccessIds, assignedSpecialistIds,
  parentAccessToken, childInteractiveToken, specialistTutorToken, fields{...} }
```
**Session (جلسة):** `{ role, plan, name, email, recordId, dynamicSessionId, landingSection, biometricSovereign, sovereignFullView, tawasulMvp, subscriptionActivated, ... }`
**GoalAttempt:** `{ student, sessionId, sessionDate, goalLabel, goalSource(IEP/ABC/Learning), successPercent, attemptNumber, specialistEmail }`
**DailySession (مختومة):** `{ sessionDate, specialistName, studentName, notes, claimStatus:"Sealed", sealedAt, immutableHash, sessionSequence, specialistSignature, pinVerified }`
**TripleTokens:** `{ parent:AUN-PRT-32hex, child:AUN-CHD-32hex, specialist:AUN-SPC-32hex }`
**AssessmentResult:** `{ scorePercent, band(balanced/moderate/elevated), domainScores, strengths, focusAreas, title, summary, recommendation }`.

---

## 9) جميع الـ APIs

كل الموجّهات الديناميكية تستخدم `createActionRouter` (يقرأ `?action=` + الميثود).

| المسار | الميثود | الوظيفة | ينتهي عند |
|--------|---------|---------|-----------|
| `/api/airtable` | GET/POST/PATCH | بروكسي Airtable | استجابة JSON من Airtable |
| `/api/academy/tts` | POST | بروكسي ElevenLabs | صوت mpeg أو 503 |
| `/api/activation/redeem` | POST | تفعيل كود | اشتراك active + ثلاثية توكنات + روابط |
| `/api/payment?action=status` | GET | حالة الدفع | JSON حالة |
| `/api/payment?action=create-checkout` | POST | إنشاء Tap/Mock | رابط checkout |
| `/api/payment?action=verify-return` | GET | تأكيد العودة | JSON |
| `/api/payment?action=webhook` | POST | استقبال شحنة | تحقّق → تفعيل الطالب |
| `/api/payment?action=mock-complete/mock-fire` | GET/POST | محاكاة | تفعيل وهمي |
| `/api/tawasul?action=verify-token` | POST | تحقّق توكن | جلسة (specialist/child) |
| `/api/tawasul?action=caseload` | POST | حالات الأخصائي | قائمة الطلاب المعزولة |
| `/api/tawasul?action=mirror` | POST | كتابة أمر المرآة | تحديث سجل الطالب |
| `/api/tawasul?action=student-goal` | POST | حفظ الهدف | `programmed_goal` محدّث |
| `/api/tawasul?action=assessment-sync` | POST | مزامنة تقييم | تحديث سجل |
| `/api/session/child-seal` | POST | ختم جلسة لعب | سجل يومي مختوم |
| `/api/settlement/seal` | POST | ختم تسوية | تسوية مختومة |
| `/api/parent/sessions` | — | جلسات الطفل | قائمة جلسات |

---

## 10) مسار انتقال البيانات (Data Flow)

**قراءة عامة:**
```
مكوّن/خطاف → src/lib/airtable.js
   ├─ إن VITE_USE_AIRTABLE_PROXY=true → /api/airtable (توكن خادمي) → Airtable
   └─ غير ذلك → مباشر api.airtable.com (توكن عميل ⚠️)
   ← ترقيم صفحات (offset) ← mapStudent ← عرض
```

**التسجيل (Enrollment):**
```
AunakEnrollment → enrollmentValidation (اسم/عمر/هاتف) → buildStudentEnrollmentFields
   → createStudentRecord (status=new, subscription=pending) → promoteStudentStatus(active)
```

**الدفع/التفعيل:**
```
PaymentCheckoutButton → /api/payment?create-checkout (السعر من الخادم) → Tap checkout
   → المستخدم يدفع → Tap webhook → /api/payment?webhook → تحقّق hashstring
   → processCapturedPaymentCharge → subscription=active + توليد ثلاثية التوكنات
أو: AunakActivationGate → /api/activation/redeem (كود) → نفس النتيجة
```

**المرآة الشبحية (تواصل):**
```
TawasulHub/MirrorPanel → /api/tawasul?mirror → يكتب mirror_command + mirror_payload على سجل الطالب
   → ChildInteractiveShell يستطلع Airtable كل ~3.5s
   → ينفّذ: echo_goal(نطق) | drop_star/drop_reward(احتفال) | calm_pulse(هدوء) | clear
```

**الجلسة والمحاسبة:**
```
لعب الطفل → /api/session/child-seal (عتبة تفاعل) → DailySession claimStatus=Sealed (غير قابل للتعديل)
   → reportEngine يقرأ الجلسات المختومة → تقارير ولي الأمر/الإدارة
```

---

## 11) أين تنتهي كل عملية (Operation Lifecycles)

| العملية | البداية | النهاية |
|---------|---------|---------|
| الدخول | إدخال توكن/بصمة | جلسة في `sessionStorage` + توجيه للواجهة |
| التسجيل | نموذج التسجيل | سجل طالب `status=active`, `subscription=pending` |
| التقييم المجاني | 6 أسئلة | `initial_assessment_score` + ملف تحويلي + دعوة للتفعيل |
| التفعيل | كود/دفع | `subscription=active` + `plan_code` + ثلاثية توكنات + انتهاء بعد شهر |
| البصمة | بعد الاشتراك | `face_biometric` + `biometric_status=approved` (مع منع التكرار) |
| أمر المرآة | ضغط الأخصائي | تنفيذ فوري بواجهة الطفل ثم `clear` |
| جلسة اللعب | تفاعل الطفل ≥ العتبة | سجل يومي `Sealed` (نهائي) |
| الدفع | create-checkout | webhook → تفعيل، أو انتهاء صلاحية الشحنة |
| التسوية المالية | مطابقة السجل بالدفتر | تسوية مختومة (`sovereignApproved`) |

---

## 12) المصادقة والصلاحيات

- **الأدوار:** `admin`, `specialist`, `parent` + المالك السيادي (`hazem@aunak-center.com`) = تجاوز كامل.
- **التوكنات:** `AUN-PRT-`(ولي أمر) · `AUN-CHD-`(طفل) · `AUN-SPC-`(أخصائي) — نصوص في Airtable.
- **الباقات:** free/tutor/medical/institution/assessment_only (تواصل يرفع الأخصائي إلى institution + manualOverride).
- **البوابات:** بوابة القيمة (اشتراك قبل المتابعة) → بوابة البصمة (بعد الاشتراك فقط) → الحاوية.
- **عتبات:** دخول بيومتري سيادي 94.7% · تحقّق تسجيل 82% · منع تكرار 94.7%.
- **الجلسة:** `sessionStorage: aunak.session.v1` (غير موقّعة).
- **Master Bypass:** `AUNAK-MASTER-2026` عبر `?master=` يتجاوز فحص الوجه المكرر (QA فقط).

---

## 13) الذكاء والمعالجة (AI Modules)

كلها **حتمية (rule-based) وقابلة للتفسير** عدا face-api (رؤية):
- **بصمة الوجه** (face-api، متجه 128) — دخول/منع تكرار.
- **كاشف الانهيار Meltdown** — زمن استجابة ≤280ms × 3 → خطر (يُدمج بمعادلة خطورة ABC).
- **حياد النظرة Gaze** — focus<64 أو t_static≥5s لمدة 5s → تنبيه.
- **الانسجام Harmony** — فجوة أكاديمي/سلوك ≥20 → خصم 20%.
- **محرك الأهداف AUN-4611** — دمج أهداف + إثبات حضور بيومتري للفوترة.
- **التقييم المجاني** — 6 مجالات → نطاق + توصية.
- **الصوت/النطق** — توليف Web Audio + Web Speech + ElevenLabs (اختياري).
- **التشفير** — AES-256-GCM لحمولات الجلسة/التصدير.

> التكامل الخارجي الوحيد للذكاء = ElevenLabs (اختياري مع سقوط آمن). لا نماذج LLM مستضافة.

---

## 14) الأشياء غير المكتملة والمخاطر (Incomplete / Risks)

**أمن (حرج):**
- ⚠️ **H1**: في المسار المباشر يُحقن توكن Airtable في حزمة العميل → افرض البروكسي في الإنتاج.
- ⚠️ **H2**: الجلسة والصلاحيات على العميل غير موقّعة → تحقّق خادمي للعمليات الحسّاسة.
- ⚠️ **H3**: Master Bypass بقيمة معروفة → حيّده عن الإنتاج.
- ⚠️ لا rate limiting · لا رؤوس أمان (CSP/HSTS) · بيانات بيومترية لقُصّر تحتاج مراجعة امتثال.

**دين تقني:**
- لا اختبارات آلية ولا CI.
- حزمة JS > 2MB (لا code-splitting؛ face-api ثقيل).
- ازدواج منطق التفعيل (عميل `subscriptionEngine` مقابل خادم `redeem`).
- Airtable كقاعدة تطبيقية (لا معاملات/فهرسة؛ جلب كل السجلات ثم ترشيح على العميل).
- `goalAttempts`/`summerAcademy` تسقط لـ localStorage بلا إعداد بيئة (بيانات لا تصل للسحابة).
- توجيه يدوي بلا راوتر · README قالب Vite افتراضي · لا `.env.example`.
- كود ميّت: `ChildAwniCompanion` غير مستخدم، دوال `@deprecated`.

**أولويات مقترحة:** P0: تأمين التوكن + اختبارات/CI · P1: code-splitting + توحيد التفعيل · P2: تنظيف الكود + راوتر + مراقبة أخطاء · P3: توثيق + TypeScript تدريجي.

---

## 15) متغيّرات البيئة

**خادمية (Vercel، بلا VITE_):** `AIRTABLE_API_KEY` · `AIRTABLE_BASE_ID` · `TAP_SECRET_KEY` · `ELEVENLABS_API_KEY` · `ELEVENLABS_VOICE_ID` · `MOCK_PAYMENTS`.
**عميلية (VITE_، تُحقن في الحزمة):** `VITE_AIRTABLE_API_KEY`/`VITE_AIRTABLE_PAT` (⚠️) · `VITE_AIRTABLE_BASE_ID` · `VITE_USE_AIRTABLE_PROXY` · `VITE_TAWASUL_MVP` · `VITE_AIRTABLE_*_TABLE_ID` · `VITE_AUNAK_MASTER_KEY`.

---

## 16) فهرس الملفات السريع (Top للفهم)

1. `src/App.jsx` — التوجيه.
2. `src/lib/auth.jsx` — المصادقة/الصلاحيات.
3. `src/lib/airtableFields.js` — مخطط البيانات.
4. `src/lib/airtable.js` — الوصول للبيانات.
5. `src/lib/plans.js` — الباقات.
6. `src/lib/biometricMatch.js` — البيومترية.
7. `src/lib/tripleAccessProtocol.js` — ثلاثية الوصول.
8. `api/_handlers/dispatch.js` + `api/*/[action].js` — الخلفية.
9. `src/components/AunakEcosystemHub.jsx` — الواجهة السريرية.
10. `src/components/child/ChildInteractiveShell.jsx` — واجهة الطفل + المرآة.

---

*نهاية الوثيقة — ملف واحد شامل يغطّي الهيكل، الصفحات، الخدمات، قاعدة البيانات، الـ APIs، النماذج، مسار البيانات، بدء التطبيق، نهاية كل عملية، وغير المكتمل. (النطاق: عونك الرئيسية + تواصل، بدون أي مسار آخر.)*
