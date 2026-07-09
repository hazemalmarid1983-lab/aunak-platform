# 06 · الواجهة الأمامية (Frontend)

> React 19 SPA مبنية بـ Vite، عربية RTL أولاً، تنسيق Tailwind + ثيم فخامة (`luxTheme.js`).

---

## نقطة الدخول والتوجيه

- `index.html` (`lang="ar"`) → `src/main.jsx` → `bootstrapMasterBypassFromUrl()` ثم `<App/>` داخل `<StrictMode>`.
- **لا يوجد react-router** — التوجيه يدوي عبر `window.location.pathname` في `App.jsx`.
- التغليف: `ErrorBoundary` → `AuthProvider` → اختيار الواجهة حسب المسار.

### شجرة الواجهات العليا
```
App
├─ PaymentReturn            (/payment/return)
├─ ChildInteractiveShell    (/child)
├─ TawasulPlatform          (Tawasul shell)  → TawasulGate | TawasulHub
├─ ParentShell              (/parent)
├─ SummerAcademyShell       (/summer-academy)
└─ GatedPlatform            (الافتراضي)
   ├─ AunakGate             (تسجيل الدخول)
   ├─ AunakActivationGate   (بوابة التفعيل/الدفع)
   ├─ PostActivationBiometric (بوابة البصمة بعد الاشتراك)
   └─ AunakEcosystemHub     (الحاوية السريرية)
```

---

## الحاوية السريرية — `AunakEcosystemHub.jsx`

تنقّل قائم على قائمتين مُفلترتين بالصلاحية (`sectionCanAccess`):

- **MAIN_NAV_ITEMS**: enrollment, registry, diagnostics, media, behavior, classrooms, scientific, specialists, resources, research, reports, access.
- **NAV_ITEMS**: live, crisis, learning, emotion, biometrics, community.

كل قسم يُعرض عبر مكوّن `Aunak*.jsx` مخصّص (مثل `AunakDiagnostics`, `AunakBehaviorMod`, `AunakCrisisManagement`, `AunakLearningCenter`, `AunakEmotion`, `AunakBiometrics`, `AunakLiveDashboard`, `AunakSessionRegistry`, `AunakReportsDashboard`, `AunakResearchHub`, `AunakSpecialists`, `AunakAccessControl`, `AunakSafeMedia`, `AunakScientificItems`, `AunakClassrooms`, `AunakCommunityChat`, `AunakResources`).

عناصر سيادية إضافية: `SovereignCommandBar` (أوامر صوتية)، `SovereignMasterBypassPanel`.

---

## واجهة الطفل — `src/components/child/` (مصنع الدوبامين الحسّي)

| المكوّن | الدور |
|---------|------|
| `ChildInteractiveShell.jsx` | الحاوية الرئيسية + استطلاع المرآة الشبحية + تنسيق المكافأة/الهدوء |
| `ChildAvatar.jsx` | أفاتار روبوت حيّ (تنفّس، غمز، تتبّع المؤشر، مزاج happy/calm/celebrate) |
| `ChildGoalSpeaker.jsx` | زر نطق الهدف بلا نص (TTS + معادل بصري) |
| `ChildCelebration.jsx` | احتفال ملء الشاشة (ألعاب نارية، بالونات، قصاصات، Ta-da) — **مكافأة مشروطة** |
| `ChildCalmOverlay.jsx` | تدرّج مائع أزرق/بنفسجي مهدّئ + كرة تنفّس |
| `ChildHomePanel.jsx` | الشاشة الرئيسية (تعرض GoalSpeaker في الوضع السيادي) |
| `ChildPlayZone / ChildStarsPanel / ChildCalmZone / ChildAssessmentPanel / ChildBottomNav` | مناطق اللعب/النجوم/الهدوء/التقييم/التنقّل السفلي |
| `ChildAwniCompanion.jsx` | (رفيق قديم — **لم يعد مُستخدماً** بعد إعادة التصميم) |

**تدفّق الأوامر الحيّة**: الأخصائي → Airtable (`mirror_command`) → استطلاع كل ~3.5s → تنفيذ:
`echo_goal` (نطق الهدف) · `drop_star`/`drop_reward` (`fireReward` → احتفال) · `calm_pulse` (`enterCalm` → تدرّج + درون).

---

## نظام تواصل — `src/components/tawasul/`
- `TawasulGate.jsx` — دخول الأخصائي بالتوكن.
- `TawasulHub.jsx` — لوحة الأخصائي: الحالات، حفظ الهدف، لوحة المرآة، وزر **«المنصة السيادية الكاملة»** (`onOpenSovereign` → `patchSession({sovereignFullView:true})`).
- `TawasulMirrorPanel.jsx` — إرسال أوامر المرآة الحيّة للطفل.

---

## لوحة ولي الأمر — `src/components/parent/`
`ParentShell` → `ParentBiometricGate` (بيومترية بعد التفعيل) → `ParentDashboard` (متابعة الطفل، الجلسات، التقارير عبر `useParentDashboard`/`parentDashboardEngine`).

## الأكاديمية الصيفية — `src/components/summer-academy/`
`AcademyShell`, `AcademyTrackHub`, `AcademyBrainWheel`, `AcademyMascot`, `AcademyLeaderboard`, `AcademyWelcomeMission`, `AcademyLiveBackground`, `AcademyParentZone`, `AcademyAnimatedIcon` — تجربة تعلّم مُلعّبة (`useSummerAcademy`, `useAcademyMood`).

## التقييم والدفع
`assessment/` (`FreeAssessmentFlow`, `AssessmentPromoModal`, `AssessmentResultScreen`) · `PaymentCheckoutButton`, `PaymentReturn`, `AunakPaywall`, `TriplePortalCards`, `SettlementConfirmModal`.

---

## إدارة الحالة (State Management)
- **لا Redux/Zustand**. الاعتماد على:
  - `AuthContext` (الجلسة العالمية).
  - خطافات مخصّصة تجلب/تشتق البيانات: `useStudents`, `useAirtableData`, `useActiveStudentMetrics`, `useRoadmapStats`, `useHarmonyEngine`, `useGoalEngine`, `useCrisisAlerts`, `useParentDashboard`, `useSummerAcademy`.
  - حالة محلية (`useState`/`useRef`) داخل المكوّنات.
- التخزين المستمر: `sessionStorage` (الجلسة) + `localStorage` (نُسخ احتياطية/أكواد).

---

## التنسيق والثيم
- **Tailwind CSS 3** (config افتراضي تقريباً) + `postcss` + `autoprefixer`.
- `luxTheme.js` — أصناف/ألوان الفخامة (ذهبي/داكن) وحالات التنقّل النشطة.
- `index.css` — keyframes حسّية: `tawasul-fluid/aurora/breathe`, `tawasul-avatar-*`, `tawasul-ring/eq-bar`, `tawasul-firework/balloon-rise/confetti/tada`, و`lux-gaze-dim`.
- ثيمات طفل: `childTheme.js`, `tawasulChildTheme.js`, `academyTheme.js`.

## الحركة والوسائط
- **framer-motion** للحركات التصريحية + CSS keyframes للتأثيرات الثقيلة.
- **lucide-react** للأيقونات.
- Web Audio / Web Speech للصوت والنطق داخل المتصفح.

---

## ملاحظات واجهة
- SPA كامل، لا SSR.
- كل المنطق يعمل في المتصفح (بما فيه استدعاءات Airtable في المسار المباشر).
- RTL أساسي؛ نصوص ثنائية اللغة (ar/en) عبر كائنات `copy` داخل المكوّنات.
- لا code-splitting → حزمة JS كبيرة (>2MB). انظر `10_TECHNICAL_DEBT.md`.
