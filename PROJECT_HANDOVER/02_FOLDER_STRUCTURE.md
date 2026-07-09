# 02 · بنية المجلدات (Folder Structure)

> شجرة الملفات الفعلية كما هي في المستودع (تحليل فقط).

```
aunak/
├── api/                         # دوال Vercel Serverless (Node) — الواجهة الخلفية
│   ├── airtable.js              # بروكسي Airtable (يخفي التوكن عن العميل)
│   ├── academy/tts.js           # بروكسي TTS (ElevenLabs) للأكاديمية/الطفل
│   ├── activation/redeem.js     # تفعيل كود الاشتراك + توليد ثلاثية التوكنات
│   ├── parent/sessions.js       # جلسات الطفل للوحة ولي الأمر
│   ├── session/child-seal.js    # ختم جلسة لعب الطفل (جلسة يومية)
│   ├── settlement/seal.js       # ختم التسوية المالية
│   ├── payment/[action].js      # موجّه ديناميكي للدفع (status, create-checkout, webhook…)
│   ├── tawasul/[action].js      # موجّه ديناميكي لتواصل (verify-token, caseload, mirror…)
│   └── _handlers/               # منطق المعالجات (لا تُعدّ دوال مستقلة على Vercel)
│       ├── dispatch.js          # createActionRouter — موزّع الأفعال المشترك
│       ├── payment/             # status · create-checkout · verify-return · webhook · mock-*
│       └── tawasul/             # verify-token · caseload · mirror · student-goal · assessment-sync · config · sanitize · airtableError
│
├── src/
│   ├── main.jsx                 # نقطة الإقلاع (bootstrap master bypass + render)
│   ├── App.jsx                  # الموجّه الأعلى (اختيار الواجهة حسب المسار/الجلسة)
│   ├── App.css / index.css      # الأنماط العامة + keyframes الحسّية
│   │
│   ├── components/              # مكوّنات الواجهة (React)
│   │   ├── AunakEcosystemHub.jsx   # الحاوية السريرية الرئيسية + التنقّل بين الأقسام
│   │   ├── AunakGate.jsx / TawasulGate / AunakActivationGate  # بوابات الدخول/التفعيل
│   │   ├── Aunak*.jsx              # أقسام سريرية (Diagnostics, BehaviorMod, Emotion, Crisis, LearningCenter, Specialists, Biometrics, Enrollment, Reports, SafeMedia, Classrooms, ScientificItems, LiveDashboard, ResearchHub, CommunityChat, AccessControl, Resources, Paywall…)
│   │   ├── child/                 # واجهة الطفل التفاعلية (Shell, Avatar, GoalSpeaker, Celebration, CalmOverlay, HomePanel, PlayZone, StarsPanel, AssessmentPanel, BottomNav…)
│   │   ├── parent/                # لوحة ولي الأمر (ParentShell, ParentDashboard, ParentBiometricGate)
│   │   ├── tawasul/               # نظام تواصل (TawasulHub, TawasulMirrorPanel, TawasulGate)
│   │   ├── summer-academy/        # الأكاديمية الصيفية (Shell, TrackHub, Mascot, Leaderboard…)
│   │   ├── assessment/            # التقييم المجاني (FreeAssessmentFlow, PromoModal, ResultScreen)
│   │   └── Payment*/Sovereign*/Triple*  # دفع + أدوات سيادية
│   │
│   ├── hooks/                   # خطافات React (سلوك/تأثيرات)
│   │   ├── useBiometricScan.js     # مسح/التقاط الوجه
│   │   ├── useMeltdownPredictor.js # كاشف الانهيار (280ms)
│   │   ├── useGazeNeutralityObserver.js # حياد النظرة (5s)
│   │   ├── useCrisisAlerts.js      # معادلة خطورة الأزمة
│   │   ├── useHarmonyEngine.js / useActiveStudentMetrics / useRoadmapStats
│   │   ├── useSovereignVoice / useAcademyVoice / usePromoVoice   # الصوت/النطق
│   │   ├── useStudents / useAirtableData / useParentDashboard / useSummerAcademy / useGoalEngine
│   │   └── useTawasulIdleGaze.js / useAcademyMood.js
│   │
│   └── lib/                     # المنطق الأساسي (بدون UI)
│       ├── airtable.js            # عميل Airtable REST + CRUD الطلاب/الجلسات/المحاولات
│       ├── airtableFields.js      # أسماء الأعمدة القانونية (snake_case)
│       ├── airtableTables.js      # معرّفات الجداول (tbl…)
│       ├── airtableMappers.js     # تحويل سجلّ Airtable → كائن طالب
│       ├── auth.jsx               # سياق المصادقة + الأدوار + الاشتراك
│       ├── plans.js               # أكواد الباقات + planAllows + landingForPlan
│       ├── sovereignProtocol.js   # ثوابت البروتوكول السريري (عتبات)
│       ├── sovereignLogin.js      # منطق الدخول البيومتري السيادي
│       ├── sovereignCrypto.js     # AES-256-GCM (تشفير الجلسات/التصدير)
│       ├── sovereignMasterBypass.js # مفتاح تجاوز QA
│       ├── biometricMatch.js      # مطابقة الوجه + منع التكرار (Anti-spoof)
│       ├── harmonyEngine.js       # حساب مؤشر الانسجام
│       ├── goalEngine.js          # محرك الأهداف (AUN-4611) + إثبات الحضور المالي
│       ├── initialAssessmentEngine.js # التقييم المجاني (6 مجالات)
│       ├── tripleAccessProtocol.js # ثلاثية التوكنات (parent/child/specialist)
│       ├── activationCodes.js / subscriptionEngine.js / paymentActivation.js
│       ├── tapPayments.js / paymentPlans.js / mockPayments.js / paymentClient.js / paymentWebhookProcessor.js
│       ├── settlementEngine.js / reportEngine.js / specialistAttestation.js / specialistIsolation.js
│       ├── childAccess.js / childSessionSeal.js / childSessionBridge.js / childTheme.js
│       ├── tawasul*.js            # (Auth, Config, Fetch, Mirror, StudentFields, SessionSeal, AssessmentEngine, ChildTheme)
│       ├── academyVoice.js / academyTheme.js / summerAcademyEngine.js / summerAcademyAirtable.js
│       ├── parentAccess.js / parentDashboardEngine.js
│       ├── sovereignAudio.js      # توليف Web Audio (نغمات، ألحان مكافأة/هدوء)
│       ├── sovereignVoice.js      # Web Speech (أوامر صوتية للمشرف)
│       ├── enrollmentValidation.js / enrollmentLink.js / diagnosisOptions.js / countryDialCodes.js
│       ├── luxTheme.js            # ثيم الفخامة (ألوان/أصناف)
│       ├── research.js / studentPrivacy.js
│
├── docs/                        # وثائق سابقة (عربية + بروتوكولات)
│   ├── AIRTABLE_SCHEMA_PROTOCOL.md
│   ├── SOVEREIGN_OPERATIONS_LOG.md
│   ├── TAWASUL_MVP.md
│   └── الملخص_التنفيذي_السيادي_لمنصة_عونك.md
│
├── scripts/                     # أدوات تشغيلية (Node) — تشخيص، بذر، اختبار
│   ├── issue.js                 # إصدار أكواد تفعيل
│   ├── airtable-diagnostic.mjs
│   ├── tawasul-setup-base.mjs / tawasul-seed.mjs / tawasul-extend-schema.mjs
│   └── test-*.mjs               # اختبارات يدوية (routing, mock-payment, daily-sessions)
│
├── PROJECT_HANDOVER/            # (هذا التقرير)
├── .cursor/rules/               # قواعد Cursor (ذاكرة المشروع السيادية)
├── package.json / package-lock.json
├── vite.config.js / eslint.config.js / tailwind.config.js / postcss.config.js
├── vercel.json                  # rewrites: كل شيء → index.html عدا /api
└── index.html                   # قالب SPA (lang="ar")
```

## ملاحظات على التنظيم

- **فصل واضح**: `components` (عرض) / `hooks` (سلوك) / `lib` (منطق نقي وقابل لإعادة الاستخدام على الخادم والعميل معاً).
- **مشاركة الشيفرة خادم↔عميل**: معالجات `api/` تستورد من `src/lib/` (مثل `tripleAccessProtocol`, `plans`, `tapPayments`) — منطق واحد للطرفين.
- **الموجّهات الديناميكية** (`[action].js`) توحّد عدة نقاط نهاية في دالة واحدة لتفادي حدّ Vercel Hobby لعدد الدوال.
- **لا يوجد مجلد `tests/`** — الاختبارات الموجودة سكربتات يدوية في `scripts/` فقط.
