# 12 · فهرس الملفات (File Index)

> فهرس مرجعي لأهم ملفات المشروع مع وصف موجز لكل ملف. (~141 ملف مصدري + إعدادات ووثائق).

---

## الجذر (Root)
| الملف | الوصف |
|-------|-------|
| `index.html` | قالب SPA (`lang="ar"`) |
| `package.json` | الاعتماديات والسكربتات |
| `vite.config.js` | إعداد Vite (+ plugin-react) |
| `eslint.config.js` | قواعد ESLint (js + react-hooks + react-refresh) |
| `tailwind.config.js` / `postcss.config.js` | إعداد Tailwind/PostCSS |
| `vercel.json` | rewrites SPA (كل شيء → index.html عدا /api) |
| `README.md` | (قالب Vite افتراضي — يحتاج تحديث) |

## نقطة الدخول والتوجيه
| الملف | الوصف |
|-------|-------|
| `src/main.jsx` | إقلاع (master bypass + render) |
| `src/App.jsx` | الموجّه الأعلى (اختيار الواجهة بالمسار/الجلسة) |
| `src/index.css` / `src/App.css` | أنماط عامة + keyframes حسّية |

---

## الواجهة الخلفية — `api/`
| الملف | الوصف |
|-------|-------|
| `api/airtable.js` | بروكسي Airtable (يخفي التوكن) |
| `api/academy/tts.js` | بروكسي TTS (ElevenLabs) |
| `api/activation/redeem.js` | تفعيل كود → اشتراك + ثلاثية توكنات |
| `api/session/child-seal.js` | ختم جلسة لعب الطفل |
| `api/settlement/seal.js` | ختم التسوية المالية |
| `api/parent/sessions.js` | جلسات الطفل لولي الأمر |
| `api/payment/[action].js` | موجّه الدفع الديناميكي |
| `api/tawasul/[action].js` | موجّه تواصل الديناميكي |
| `api/_handlers/dispatch.js` | `createActionRouter` المشترك |
| `api/_handlers/payment/*` | status · create-checkout · verify-return · webhook · mock-complete · mock-fire |
| `api/_handlers/tawasul/*` | verify-token · caseload · mirror · student-goal · assessment-sync · config · sanitize · airtableError |

---

## المنطق الأساسي — `src/lib/`

### قاعدة البيانات
| الملف | الوصف |
|-------|-------|
| `airtable.js` | عميل REST + CRUD الطلاب/الجلسات/المحاولات + getField |
| `airtableFields.js` | أسماء الأعمدة القانونية (snake_case) + select checklist |
| `airtableTables.js` | معرّفات الجداول (tbl…) |
| `airtableMappers.js` | تحويل سجل → كائن طالب |

### المصادقة والصلاحيات
| الملف | الوصف |
|-------|-------|
| `auth.jsx` | AuthProvider + الأدوار + canAccessSection + الاشتراك |
| `plans.js` | أكواد الباقات + planAllows + landingForPlan |
| `sovereignProtocol.js` | ثوابت البروتوكول السريري (العتبات) |
| `sovereignLogin.js` | الدخول البيومتري السيادي |
| `sovereignMasterBypass.js` | مفتاح تجاوز QA |
| `childAccess.js` / `parentAccess.js` | دخول الطفل/ولي الأمر |
| `tawasulAuth.js` / `tawasulConfig.js` / `tawasulFetch.js` | مصادقة/إعداد/جلب تواصل |

### الذكاء والمعالجة
| الملف | الوصف |
|-------|-------|
| `biometricMatch.js` | مطابقة الوجه + منع التكرار (face-api) |
| `harmonyEngine.js` | مؤشر الانسجام (عقوبة الفجوة 20%) |
| `goalEngine.js` | محرك الأهداف AUN-4611 + إثبات الحضور |
| `initialAssessmentEngine.js` | التقييم المجاني (6 مجالات) |
| `sovereignCrypto.js` | AES-256-GCM |
| `sovereignAudio.js` | توليف Web Audio (نغمات/مكافأة/هدوء) |
| `sovereignVoice.js` | أوامر Web Speech للمشرف |
| `academyVoice.js` / `academyTheme.js` | نطق/ثيم الأكاديمية |
| `tawasulMirror.js` | منطق المرآة الشبحية |

### الدفع والاشتراك
| الملف | الوصف |
|-------|-------|
| `tapPayments.js` | تكامل Tap (شحنة + hashstring) |
| `paymentPlans.js` | التسعير (SAR) |
| `mockPayments.js` | وضع الدفع الوهمي |
| `paymentClient.js` / `paymentActivation.js` / `paymentWebhookProcessor.js` | عميل/تفعيل/معالجة webhook |
| `activationCodes.js` | توليد/تحقّق الأكواد |
| `subscriptionEngine.js` | redeem + بوابة التفعيل |
| `tripleAccessProtocol.js` | ثلاثية التوكنات + روابط البوابات |

### الجلسات والتقارير والعزل
| الملف | الوصف |
|-------|-------|
| `childSessionSeal.js` / `tawasulSessionSeal.js` / `childSessionBridge.js` | ختم/جسر جلسات الطفل |
| `settlementEngine.js` / `specialistAttestation.js` | التسوية المالية + الإقرار |
| `specialistIsolation.js` | عزل حالات الأخصائي |
| `reportEngine.js` / `parentDashboardEngine.js` | محركات التقارير/لوحة ولي الأمر |
| `summerAcademyEngine.js` / `summerAcademyAirtable.js` | محرك/تخزين الأكاديمية |

### مساعدات وثيمات
| الملف | الوصف |
|-------|-------|
| `enrollmentValidation.js` / `enrollmentLink.js` | تحقّق/روابط التسجيل |
| `diagnosisOptions.js` / `countryDialCodes.js` | خيارات التشخيص/الدول |
| `luxTheme.js` / `childTheme.js` / `tawasulChildTheme.js` | ثيمات |
| `research.js` / `studentPrivacy.js` / `tawasulStudentFields.js` / `tawasulAssessmentEngine.js` | بحث/خصوصية/حقول تواصل |

---

## الخطافات — `src/hooks/`
| الملف | الوصف |
|-------|-------|
| `useBiometricScan.js` | مسح/التقاط الوجه |
| `useMeltdownPredictor.js` | كاشف الانهيار (280ms) |
| `useGazeNeutralityObserver.js` | حياد النظرة (5s) |
| `useCrisisAlerts.js` | معادلة خطورة الأزمة |
| `useHarmonyEngine.js` / `useActiveStudentMetrics.js` / `useRoadmapStats.js` | مؤشرات الطالب |
| `useStudents.js` / `useAirtableData.js` | جلب البيانات |
| `useGoalEngine.js` / `useParentDashboard.js` / `useSummerAcademy.js` | محركات مرتبطة بالواجهة |
| `useSovereignVoice.js` / `useAcademyVoice.js` / `usePromoVoice.js` / `useAcademyMood.js` | صوت/مزاج |
| `useTawasulIdleGaze.js` | خمول نظرة تواصل |

---

## المكوّنات — `src/components/`

### الحاوية والبوابات
`AunakEcosystemHub.jsx` (الحاوية السريرية) · `AunakGate.jsx` · `AunakActivationGate.jsx` · `PostActivationBiometric.jsx` · `AunakPaywall.jsx` · `Sidebar.jsx` · `PlatformLogo.jsx` · `ErrorBoundary.jsx` · `AirtableStatus.jsx`

### الأقسام السريرية (`Aunak*.jsx`)
`AunakDiagnostics` · `AunakBehaviorMod` · `AunakCrisisManagement` · `AunakLearningCenter` · `AunakEmotion` · `AunakEmotionalLab` · `AunakBiometrics` · `AunakLiveDashboard` · `AunakSessionRegistry` · `AunakReportsDashboard` · `AunakResearchHub` · `AunakSpecialists` · `AunakAccessControl` · `AunakSafeMedia` · `AunakScientificItems` · `AunakClassrooms` · `AunakCommunityChat` · `AunakResources` · `AunakEnrollment`

### واجهة الطفل — `child/`
`ChildInteractiveShell` · `ChildAvatar` · `ChildGoalSpeaker` · `ChildCelebration` · `ChildCalmOverlay` · `ChildHomePanel` · `ChildPlayZone` · `ChildStarsPanel` · `ChildCalmZone` · `ChildAssessmentPanel` · `ChildBottomNav` · `ChildAwniCompanion` *(غير مستخدم)*

### تواصل — `tawasul/`
`TawasulGate` · `TawasulHub` · `TawasulMirrorPanel`

### ولي الأمر — `parent/`
`ParentShell` · `ParentDashboard` · `ParentBiometricGate`

### الأكاديمية الصيفية — `summer-academy/`
`AcademyShell` · `AcademyTrackHub` · `AcademyBrainWheel` · `AcademyMascot` · `AcademyLeaderboard` · `AcademyWelcomeMission` · `AcademyLiveBackground` · `AcademyParentZone` · `AcademyAnimatedIcon`

### التقييم والدفع والسيادة
`assessment/` (`FreeAssessmentFlow` · `AssessmentPromoModal` · `AssessmentResultScreen`) · `PaymentCheckoutButton` · `PaymentReturn` · `TriplePortalCards` · `SettlementConfirmModal` · `GoalEngine` · `SovereignCommandBar` · `SovereignMasterBypassPanel` · `AunakSummerAcademy`

---

## الوثائق والسكربتات
| الملف | الوصف |
|-------|-------|
| `docs/AIRTABLE_SCHEMA_PROTOCOL.md` | بروتوكول مخطط Airtable |
| `docs/SOVEREIGN_OPERATIONS_LOG.md` | سجل العمليات السيادية |
| `docs/TAWASUL_MVP.md` | توثيق نظام تواصل |
| `docs/الملخص_التنفيذي_السيادي_لمنصة_عونك.md` | ملخّص تنفيذي |
| `scripts/issue.js` | إصدار أكواد التفعيل |
| `scripts/airtable-diagnostic.mjs` | تشخيص Airtable |
| `scripts/tawasul-*.mjs` | إعداد/بذر/تمديد مخطط تواصل |
| `scripts/test-*.mjs` | اختبارات يدوية (routing · mock-payment · daily-sessions) |

---

## ملفات مرجعية سريعة (Top 10 للفهم)
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
