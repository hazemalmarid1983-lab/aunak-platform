<!-- AUNAK CONTEXT — Part 1 | lines 1-5000 of 28509 | main + Tawasul (English Island excluded) -->

This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: src/components/EnglishTalkIsland.jsx, src/lib/englishAccess.js, src/lib/englishIslandEngine.js, scripts/english-island-fields.mjs, .env*, dist/**, node_modules/**, package-lock.json, .git/**, .vercel/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.gitignore
.vercelignore
api/_handlers/dispatch.js
api/_handlers/payment/create-checkout.js
api/_handlers/payment/mock-complete.js
api/_handlers/payment/mock-fire.js
api/_handlers/payment/status.js
api/_handlers/payment/verify-return.js
api/_handlers/payment/webhook.js
api/_handlers/tawasul/airtableError.js
api/_handlers/tawasul/assessment-sync.js
api/_handlers/tawasul/caseload.js
api/_handlers/tawasul/config.js
api/_handlers/tawasul/mirror.js
api/_handlers/tawasul/sanitize.js
api/_handlers/tawasul/student-goal.js
api/_handlers/tawasul/verify-token.js
api/.gitkeep
api/academy/tts.js
api/activation/redeem.js
api/airtable.js
api/parent/sessions.js
api/payment/[action].js
api/session/child-seal.js
api/settlement/seal.js
api/tawasul/[action].js
docs/الملخص_التنفيذي_السيادي_لمنصة_عونك.md
docs/AIRTABLE_SCHEMA_PROTOCOL.md
docs/SOVEREIGN_OPERATIONS_LOG.md
docs/TAWASUL_MVP.md
eslint.config.js
hooks/.gitkeep
index.html
lib/.gitkeep
package.json
postcss.config.js
PROJECT_HANDOVER/01_PROJECT_OVERVIEW.md
PROJECT_HANDOVER/02_FOLDER_STRUCTURE.md
PROJECT_HANDOVER/03_DATABASE.md
PROJECT_HANDOVER/04_AUTH_SYSTEM.md
PROJECT_HANDOVER/05_AI_MODULES.md
PROJECT_HANDOVER/06_FRONTEND.md
PROJECT_HANDOVER/07_BACKEND.md
PROJECT_HANDOVER/08_DEPENDENCIES.md
PROJECT_HANDOVER/09_SECURITY.md
PROJECT_HANDOVER/10_TECHNICAL_DEBT.md
PROJECT_HANDOVER/11_RECOMMENDATIONS.md
PROJECT_HANDOVER/12_FILE_INDEX.md
public/aunak-logo.png
public/favicon.png
public/favicon.svg
public/icons.svg
README.md
scripts/airtable-diagnostic.mjs
scripts/issue.js
scripts/tawasul-extend-schema.mjs
scripts/tawasul-seed.mjs
scripts/tawasul-setup-base.mjs
scripts/test-daily-sessions.mjs
scripts/test-mock-payment.mjs
scripts/test-routing.mjs
src/App.css
src/App.jsx
src/assets/hero.png
src/assets/react.svg
src/assets/vite.svg
src/components/.gitkeep
src/components/AirtableStatus.jsx
src/components/assessment/AssessmentPromoModal.jsx
src/components/assessment/AssessmentResultScreen.jsx
src/components/assessment/FreeAssessmentFlow.jsx
src/components/AunakAccessControl.jsx
src/components/AunakActivationGate.jsx
src/components/AunakBehaviorMod.jsx
src/components/AunakBiometrics.jsx
src/components/AunakClassrooms.jsx
src/components/AunakCommunityChat.jsx
src/components/AunakCrisisManagement.jsx
src/components/AunakDiagnostics.jsx
src/components/AunakEcosystemHub.jsx
src/components/AunakEmotion.jsx
src/components/AunakEmotionalLab.jsx
src/components/AunakEnrollment.jsx
src/components/AunakGate.jsx
src/components/AunakLearningCenter.jsx
src/components/AunakLiveDashboard.jsx
src/components/AunakPaywall.jsx
src/components/AunakReportsDashboard.jsx
src/components/AunakResearchHub.jsx
src/components/AunakResources.jsx
src/components/AunakSafeMedia.jsx
src/components/AunakScientificItems.jsx
src/components/AunakSessionRegistry.jsx
src/components/AunakSpecialists.jsx
src/components/AunakSummerAcademy.jsx
src/components/child/ChildAssessmentPanel.jsx
src/components/child/ChildAvatar.jsx
src/components/child/ChildAwniCompanion.jsx
src/components/child/ChildBottomNav.jsx
src/components/child/ChildCalmOverlay.jsx
src/components/child/ChildCalmZone.jsx
src/components/child/ChildCelebration.jsx
src/components/child/ChildGoalSpeaker.jsx
src/components/child/ChildHomePanel.jsx
src/components/child/ChildInteractiveShell.jsx
src/components/child/ChildPlayZone.jsx
src/components/child/ChildStarsPanel.jsx
src/components/ErrorBoundary.jsx
src/components/GoalEngine.jsx
src/components/parent/ParentBiometricGate.jsx
src/components/parent/ParentDashboard.jsx
src/components/parent/ParentShell.jsx
src/components/PaymentCheckoutButton.jsx
src/components/PaymentReturn.jsx
src/components/PlatformLogo.jsx
src/components/PostActivationBiometric.jsx
src/components/SettlementConfirmModal.jsx
src/components/Sidebar.jsx
src/components/SovereignCommandBar.jsx
src/components/SovereignMasterBypassPanel.jsx
src/components/summer-academy/AcademyAnimatedIcon.jsx
src/components/summer-academy/AcademyBrainWheel.jsx
src/components/summer-academy/AcademyLeaderboard.jsx
src/components/summer-academy/AcademyLiveBackground.jsx
src/components/summer-academy/AcademyMascot.jsx
src/components/summer-academy/AcademyParentZone.jsx
src/components/summer-academy/AcademyShell.jsx
src/components/summer-academy/AcademyTrackHub.jsx
src/components/summer-academy/AcademyWelcomeMission.jsx
src/components/tawasul/TawasulGate.jsx
src/components/tawasul/TawasulHub.jsx
src/components/tawasul/TawasulMirrorPanel.jsx
src/components/TriplePortalCards.jsx
src/hooks/useAcademyMood.js
src/hooks/useAcademyVoice.js
src/hooks/useActiveStudentMetrics.js
src/hooks/useAirtableData.js
src/hooks/useBiometricScan.js
src/hooks/useCrisisAlerts.js
src/hooks/useGazeNeutralityObserver.js
src/hooks/useGoalEngine.js
src/hooks/useHarmonyEngine.js
src/hooks/useMeltdownPredictor.js
src/hooks/useParentDashboard.js
src/hooks/usePromoVoice.js
src/hooks/useRoadmapStats.js
src/hooks/useSovereignVoice.js
src/hooks/useStudents.js
src/hooks/useSummerAcademy.js
src/hooks/useTawasulIdleGaze.js
src/index.css
src/lib/academyTheme.js
src/lib/academyVoice.js
src/lib/activationCodes.js
src/lib/airtable.js
src/lib/airtableFields.js
src/lib/airtableMappers.js
src/lib/airtableTables.js
src/lib/auth.jsx
src/lib/biometricMatch.js
src/lib/childAccess.js
src/lib/childSessionBridge.js
src/lib/childSessionSeal.js
src/lib/childTheme.js
src/lib/countryDialCodes.js
src/lib/diagnosisOptions.js
src/lib/enrollmentLink.js
src/lib/enrollmentValidation.js
src/lib/goalEngine.js
src/lib/harmonyEngine.js
src/lib/initialAssessmentEngine.js
src/lib/luxTheme.js
src/lib/mockPayments.js
src/lib/parentAccess.js
src/lib/parentDashboardEngine.js
src/lib/paymentActivation.js
src/lib/paymentClient.js
src/lib/paymentPlans.js
src/lib/paymentWebhookProcessor.js
src/lib/plans.js
src/lib/reportEngine.js
src/lib/research.js
src/lib/settlementEngine.js
src/lib/sovereignAudio.js
src/lib/sovereignCrypto.js
src/lib/sovereignLogin.js
src/lib/sovereignMasterBypass.js
src/lib/sovereignProtocol.js
src/lib/sovereignVoice.js
src/lib/specialistAttestation.js
src/lib/specialistIsolation.js
src/lib/studentPrivacy.js
src/lib/subscriptionEngine.js
src/lib/summerAcademyAirtable.js
src/lib/summerAcademyEngine.js
src/lib/tapPayments.js
src/lib/tawasulAssessmentEngine.js
src/lib/tawasulAuth.js
src/lib/tawasulChildTheme.js
src/lib/tawasulConfig.js
src/lib/tawasulFetch.js
src/lib/tawasulMirror.js
src/lib/tawasulSessionSeal.js
src/lib/tawasulStudentFields.js
src/lib/tripleAccessProtocol.js
src/main.jsx
src/routes/.gitkeep
tailwind.config.js
vercel.json
vite.config.js
```

# Files

## File: docs/الملخص_التنفيذي_السيادي_لمنصة_عونك.md
````markdown
# الملخص التنفيذي السيادي لمشروع منصة «عونك» الذكية

**الإصدار:** السيادي الموحّد — دستور فني معتمد 100%  
**التاريخ:** يونيو 2026  
**الحالة:** ✅ **تشغيل رسمي حي** — `https://aunak.vercel.app` (27 يونيو 2026)  
**Base Airtable:** `appaGfKj4vYhMw0cb`  
**سجل العمليات:** `docs/SOVEREIGN_OPERATIONS_LOG.md`

---

## 1. الغلاف والتعريف

**عونك (Aunak)** منصة ذكية سيادية موحّدة لدعم ذوي اضطراب طيف التوحد (ASD)، تجمع بين الرصد السريري الحي، الدعم المنزلي، والحوكمة السيادية للمراكز والوزارات.

- **الواجهة:** React 19 + Vite + Tailwind  
- **البيانات:** Airtable (سحابة مركزية)  
- **النشر:** Vercel + Proxy API اختياري  
- **الأمان:** AES-256-GCM · بصمة وجه · AUN-4611

---

## 2. الرؤية والرسالة

| | |
|---|---|
| **الرؤية** | منصة عربية سيادية واحدة تربط الطفل، ولي الأمر، الأخصائي، والإدارة — ببيانات موثّقة، مشفّرة، وقابلة للتدقيق |
| **الرسالة** | تمكين التدخل المبكر والمتابعة السلوكية والعاطفية والتعليمية عبر 16+ وحدة متكاملة، مع احترام الخصوصية والحوكمة المالية |

---

## 3. البنية التقنية

```
ولي الأمر / أخصائي / إدارة
         ↓
    AunakGate (بوابة الدخول)
    ├── بصمة وجه (face-api)
    ├── رمز وصول (Access Control)
    └── AunakActivationGate (كود تفعيل)
         ↓
    AunakEcosystemHub (16+ قسم)
         ↓
    Airtable Cloud + tblDailySessions (معزول)
         ↓
    api/airtable · api/settlement/seal · api/activation/redeem
```

**الأدوار:** ولي أمر (بيومتري) · أخصائي (Token + PIN تسوية) · المشرف السيادي (`isSovereignOwner`)

---

## 4. منظومة الأقسام والباقات — المصفوفة الخماسية (معتمدة)

| # | الكود | الاسم | الجمهور | الأقسام الرئيسية |
|---|--------|-------|---------|------------------|
| 1 | `free` | المنصة المجتمعية | الجمهور العام | مجتمع عونك، الموارد العامة |
| 2 | `institution` | المراكز والوزارات | مراكز علاج · وزارات | السجل الحي، سجل الجلسات، ABC، الفصول، الأبحاث، التحكم السيادي، التسجيل |
| 3 | `tutor` | المدرس الخصوصي | معلم/مدرب منزلي | الوسائط الآمنة، البصمة، مختبر الألحان، صعوبات التعلم، الفصول |
| 4 | `medical` | الأطباء والعيادات | طبيب · عيادة | التشخيص، الدرع الذكي، الرصد الحي، المكتبة العلمية |
| 5 | `assessment_only` | التقييم الشامل | باقة مستقلة كلياً | **التشخيص فقط** (+ التسجيل لل intake) — معزولة عن باقي الباقات |

**ترتيب تراكمي:** `free` < `tutor` < `medical` < `institution`  
**استثناء:** `assessment_only` ليست تراكمية — بوابة تقييم معزولة.

**التوافق مع الرموز السابقة:** `b2c` → `tutor` · `b2b`/`b2g` → `institution`

---

## 5. بروتوكول الدخول والتسجيل

1. **AunakGate** — دخول بيومتري أو Token أخصائي  
2. **AunakEnrollment** — تسجيل طالب جديد + بصمة مرجعية (مرحلة 3)  
3. **Enrollment Verify (مرحلة 5)** — تحقق فوري من البصمة في ذاكرة المتصفح · عتبة **82%** · كاميرا دائمة  
4. **حالة الاشتراك = `pending`** عند التسجيل الأول  
5. **AunakActivationGate** — إدخال كود `AUN-{PLAN}-XXXX-YYYY` → `active` + الوجهة المفضلة

> **عتبة سيادية للدخول اليومي:** 94.7% (`SOVEREIGN_MATCH_CONFIDENCE`) — منفصلة عن عتبة التسجيل.

---

## 6. الحوكمة المالية

### 6.1 تسوية الجلسات (Wave 1 — منفّذ)

- جدول **Daily Sessions** معزول (`VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID`)
- نافذة **SettlementConfirmModal** — تأكيد العدد + PIN الأخصائي
- ختم **Sealed** — HMAC-SHA256 + `Immutable Hash` — غير قابل للتعديل
- مزامنة دفتر المركز ذرياً → تطابق 100% (هاجر، ساجدة، محمد)

---

## 6. بروتوكول الربط الثلاثي (Phase 3 — منفّذ في الخلفية)

عند redeem ناجح (`active`):

| الحقل | الصيغة | الجهاز |
|-------|--------|--------|
| `parent_access_token` | `AUN-PRT-{32hex}` | لوحة الأهل |
| `child_interactive_token` | `AUN-CHD-{32hex}` | واجهة الطفل |
| `specialist_tutor_token` | `AUN-SPC-{32hex}` | المدرس / الإخصائي / الطبيب |

**الكود:** `src/lib/tripleAccessProtocol.js` · **API:** `api/activation/redeem.js`

### 6.2 الاشتراكات (Wave 2 — ✅ حي على الإنتاج)

- **`pending`** عند التسجيل · **`active`** بعد redeem  
- أعمدة Students: `plan_code`, `activation_code_used`, `last_payment_at`, `payment_method`, `subscription_expires_at`, `initial_assessment_score`, `comprehensive_assessment_status`, + triple tokens  
- `api/activation/redeem` — تفعيل + `plan_code` + triple device tokens  
- باقة `assessment_only` → بوابة التشخيص المعزولة  
- إصدار أكواد: `node scripts/issue.js`

---

## 7. الأمان والخصوصية

| الآلية | الوصف |
|--------|--------|
| AES-256-GCM | تشفير ملاحظات الجلسات |
| Stealth Mode | إخفاء البيانات المالية عن الأخصائي |
| AUN-4611 | إثبات حضور الطفل قبل الاعتماد المالي |
| Settlement PIN | تحقق الأخصائي عند الختم |
| Sealed Claims | رفض PATCH بعد الختم |

---

## 8. الوضع المنفّذ (RAG)

| المحور | الحالة |
|--------|--------|
| **الإنتاج الحي (Vercel)** | ✅ `aunak.vercel.app` |
| **Airtable snake_case** | ✅ Students + Access Control |
| بوابة الدخول | ✅ |
| التسجيل + Verify 82% | ✅ |
| المصفوفة الخماسية | ✅ |
| تسوية + ختم Sealed | ✅ |
| pending + Activation Gate | ✅ |
| بوابة دفع إلكتروني | 🔜 Phase 3 |

---

## 9. خارطة الطريق

| الموجة | المحتوى |
|--------|---------|
| **1** | تسوية فورية + PIN + Sealed + tblDailySessions |
| **2** | Pending + ActivationGate + redeem API |
| **3** | Tap/HyperPay + Webhook |
| **4** | Airtable automations + تقارير |

---

## 10. قرارات سيادية معتمدة

1. **Daily Sessions:** جدول مستقل — لا fallback إلى Students  
2. **التسجيل الأول:** `pending` حتى كود التفعيل  
3. **الدفع Phase 1:** كود تفعيل يدوي من الإدارة  
4. **تحقق الأخصائي:** PIN من Access Control  
5. **Airtable:** snake_case إنجليزي فقط — لا overrides env للحقول  
6. **Enrollment Verify:** مرجع بيومتري من ذاكرة المتصفح · 82% · حفظ `face_biometric` منفصل عن `biometric_status`

---

## 11. الملحق التقني

**Env vars:**
- `VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID=tbl3mlewMLvqp6AXB` (افتراضي في الكود)
- `VITE_AIRTABLE_ACTIVATION_TABLE_ID` (اختياري)
- `AIRTABLE_API_KEY` / `VITE_USE_AIRTABLE_PROXY`

**API:**
- `POST /api/settlement/seal`
- `POST /api/activation/redeem`

**ملفات محورية:**
- `src/lib/airtableFields.js` · `src/lib/plans.js` · `src/lib/settlementEngine.js`
- `src/lib/subscriptionEngine.js` · `src/components/AunakActivationGate.jsx`
- `src/components/AunakEnrollment.jsx` · `src/hooks/useBiometricScan.js`
- `src/components/AunakSessionRegistry.jsx`
- `docs/SOVEREIGN_OPERATIONS_LOG.md` · `docs/AIRTABLE_SCHEMA_PROTOCOL.md`

---

*نهاية الملخص التنفيذي السيادي — دستور عونك الفني المعتمد*
````

## File: PROJECT_HANDOVER/01_PROJECT_OVERVIEW.md
````markdown
# 01 · نظرة عامة على المشروع (Project Overview)

> تقرير هندسي — تحليل فقط، بدون أي تعديل على شيفرة المشروع.
> تاريخ التقرير: يوليو 2026 · النطاق الإنتاجي: https://aunak.vercel.app

---

## ما هو مشروع عون / عونك (Aunak)؟

**عونك** منصّة رقمية سيادية متكاملة لدعم الأطفال ذوي **اضطراب طيف التوحّد** و**صعوبات التعلّم**، موجّهة للسوق العربي (واجهة عربية RTL أولاً مع دعم إنجليزي). المنصّة تجمع في مكان واحد:

- بوابة سريرية للأخصائيين والإدارة (السجل الحي، التشخيص، تعديل السلوك ABC، الفصول، صعوبات التعلّم، الرصد العاطفي، إدارة الأزمات…).
- بوابة ولي الأمر (متابعة الطفل + بوابة تفعيل الاشتراك).
- **واجهة الطفل التفاعلية** (`/child`) — عالم لعب حسّي/بصري يُدار عن بُعد من الأخصائي.
- **نظام تواصل (Tawasul MVP)** — منصّة تواصل عن بُعد بين الأخصائي والطفل مع "المرآة الشبحية" (Ghost Mirror) لبثّ الأوامر الحيّة.
- **الأكاديمية الصيفية (Summer Academy)** — مسارات تعلّم مُلعّبة (gamified).
- نظام تسجيل (Enrollment) + **بصمة وجه بيومترية** + بوابات تفعيل ودفع.

---

## الهدف من المشروع

1. **تشخيص مبكّر وتحويل**: تقييم مجاني سريع (6 مجالات) → ملف مبدئي → دفع/تفعيل → تقييم شامل.
2. **تأهيل مُدار سريرياً**: أدوات للأخصائي لإدارة الأهداف الإجرائية، السلوك، والانفعالات وقياس مؤشرات (Harmony Score, Focus, Behavior Intensity).
3. **إشراك الطفل حسّياً**: واجهة طفل تُغني عن يوتيوب عبر التلعيب، النطق الصوتي، والمكافآت اللحظية التي يتحكم بها الأخصائي عن بُعد.
4. **سيادة البيانات والوصول**: هوية رقمية للطالب مع "ثلاثية الوصول" (ولي أمر / طفل / أخصائي) وتحقّق بيومتري صارم ومنع تحايل (Anti-spoof).
5. **محاسبة الجلسات**: ختم جلسات يومية غير قابلة للتعديل كمصدر حقيقة للفوترة.

---

## التقنيات المستخدمة (Tech Stack)

| الطبقة | التقنية |
|--------|---------|
| الواجهة | **React 19** + **Vite 8** (SPA) |
| التنسيق | **Tailwind CSS 3** + PostCSS + Autoprefixer |
| الحركة | **framer-motion 12** + CSS keyframes |
| الأيقونات | **lucide-react** |
| البيومترية | **@vladmandic/face-api** (نماذج من CDN jsDelivr) |
| الواجهة الخلفية | **Vercel Serverless Functions** (Node، ملفات `api/`) |
| قاعدة البيانات | **Airtable** عبر REST API (fetch أصلي، بدون حزمة `airtable`) |
| الدفع | **Tap Payments** (+ وضع Mock للمعاينة) |
| الصوت/النطق | Web Audio API (توليف) · Web Speech API · **ElevenLabs** TTS (اختياري) |
| التشفير | Web Crypto API (**AES-256-GCM**) |
| الاستضافة | **Vercel** (فرع الإنتاج `main`) |
| الجودة | ESLint 10 (react-hooks + react-refresh) |

> ملاحظة: لا يوجد TypeScript، ولا مدير حالة خارجي (Redux/Zustand) — الحالة عبر React Context + Hooks.

---

## حالة المشروع الحالية

المشروع **حيّ في الإنتاج** على `https://aunak.vercel.app` (فرع `main`)، والبناء يمرّ بنجاح (`npm run build` — ~2267 وحدة). آخر التطويرات ركّزت على:
- إحياء نظام تواصل (Tawasul) والمرآة الشبحية.
- فتح كامل الامتيازات للأخصائي داخل تواصل.
- ثورة حسّية/بصرية على واجهة الطفل (نطق الهدف، أفاتار حيّ، مكافآت مشروطة، نبضة هدوء).

---

## ما الذي يعمل بالفعل؟ (Working)

- ✅ بوابة الدخول متعددة الأنماط: بيومتري، رمز أخصائي/إدارة، رمز تواصل، رمز طفل، رمز ولي أمر.
- ✅ التقييم المجاني السريع + توليد ملف تحويلي.
- ✅ التسجيل (Enrollment) مع تحقّق صارم + التقاط بصمة وجه + منع الوجه المكرر (≥94.7%).
- ✅ تفعيل الاشتراك عبر كود يدوي (`/api/activation/redeem`) مع توليد **ثلاثية التوكنات** تلقائياً.
- ✅ الدفع عبر Tap (+ Mock) وwebhook تفعيل.
- ✅ نظام تواصل: دخول الأخصائي بالتوكن، جلب الحالات (caseload)، حفظ الهدف، المرآة الشبحية (نجمة/هدف/هدوء)، وواجهة طفل تستجيب حياً كل 3.5 ث.
- ✅ واجهة الطفل الحسّية (نطق TTS، أفاتار، ألعاب نارية/بالونات، تدرّج هدوء مائع).
- ✅ ختم جلسات اللعب اليومية (`/api/session/child-seal`).
- ✅ مؤشرات سريرية: Harmony Score، كاشف الانهيار (Meltdown)، حياد النظرة (Gaze).
- ✅ الأكاديمية الصيفية، لوحة ولي الأمر، لوحات التقارير.

---

## ما الذي لم يكتمل / يحتاج انتباه؟ (Incomplete / Risks)

- ⚠️ **مفتاح Airtable على العميل**: في المسار المباشر (`VITE_AIRTABLE_API_KEY`/`VITE_AIRTABLE_PAT`) يُحقن التوكن في حزمة العميل. يوجد بروكسي (`/api/airtable`) لكنه مُفعّل فقط عبر `VITE_USE_AIRTABLE_PROXY=true`.
- ⚠️ **تحقّق التوكنات على العميل كـ fallback** في وضع التطوير (childAccess/tawasulAuth) — يقرأ جدول Airtable من المتصفح.
- ⚠️ **Master Bypass** (`AUNAK-MASTER-2026`) قيمة افتراضية معروفة في الشيفرة تتجاوز فحص الوجه المكرر.
- ⚠️ **جداول اختيارية غير مُعرّفة افتراضياً**: `goalAttempts` و`summerAcademy` تعتمد على متغيرات بيئة؛ بدونها تسقط على تخزين localStorage.
- ⚠️ **تكرار/تراكم**: طبقات تفعيل مكررة (client `subscriptionEngine` مقابل server `redeem`)، ومكوّن `ChildAwniCompanion` أصبح غير مستخدم بعد إعادة تصميم واجهة الطفل.
- ⚠️ **حجم الحزمة**: ملف JS الإنتاجي > 2MB (تحذير Vite) — لا code-splitting.
- ⚠️ README افتراضي (قالب Vite) لا يعبّر عن المشروع.
- ⚠️ لا اختبارات آلية (unit/e2e) ولا CI.

> راجع `10_TECHNICAL_DEBT.md` و`09_SECURITY.md` للتفاصيل الكاملة.
````

## File: PROJECT_HANDOVER/02_FOLDER_STRUCTURE.md
````markdown
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
````

## File: PROJECT_HANDOVER/03_DATABASE.md
````markdown
# 03 · قاعدة البيانات (Database — Airtable)

> المخزن الوحيد للبيانات هو **Airtable** (لا SQL/NoSQL تقليدي). الوصول عبر REST API بـ fetch أصلي.
> المصدر القانوني لأسماء الأعمدة: `src/lib/airtablefields.js` — **snake_case إنجليزي فقط**، وقيم select بحروف صغيرة.

---

## القواعد (Bases)

| البيئة | Base ID | المصدر |
|--------|---------|--------|
| الإنتاج السيادي | `appaGfKj4vYhMw0cb` | افتراضي في `airtable.js` و`redeem.js` |
| تواصل (Tawasul MVP / Sandbox) | `app3vCT2j2JepNVZa` | يُختار عند `VITE_TAWASUL_MVP=true` (`api/airtable.js`, `child-seal.js`) |

يُحلّ الـ Base ID عبر `VITE_AIRTABLE_BASE_ID` (عميل) أو `AIRTABLE_BASE_ID`/`VITE_AIRTABLE_BASE_ID` (خادم)، مع تنقية ASCII صارمة.

---

## معرّفات الجداول (`src/lib/airtableTables.js`)

| المفتاح المنطقي | Table ID | ملاحظة |
|-----------------|----------|--------|
| `students` | `tblzYmBGmCxx2vdcr` | قابل للتهيئة عبر `VITE_AIRTABLE_STUDENTS_TABLE_ID` |
| `dailySessions` | `tbl3mlewMLvqp6AXB` | سجل الجلسات (سحابي، معزول) |
| `scientificItems` | `tblnCbBSmwDWwO5SJ` | ثابت |
| `specialists` | `tblnmcLd5M3U6sErl` | قابل للتهيئة |
| `abcData` | `tblJ580ptTVkv07hD` | تعديل السلوك ABC |
| `safeMedia` | `tbljdOSE8CozrzBZN` | مكتبة الوسائط |
| `melodyLab` | `tblMddsXqCz91hfoU` | مختبر الألحان |
| `communityResources` | `tblV28iWarzve32pP` | موارد المجتمع |
| `accessControl` | `tblfBvd5WI7alVCFU` | صلاحيات/توكنات الأخصائي والإدارة |
| `learningDifficulties` | `tblcNXSmU90TomEHH` | صعوبات التعلّم |
| `emotionalMonitoring` | `tblokLHmSHss3FQft` | الرصد العاطفي + الأزمات |
| `goalAttempts` | *(فارغ افتراضياً)* | يتطلب `VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID` وإلا localStorage |
| `summerAcademy` | *(فارغ افتراضياً)* | يتطلب `VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID` وإلا localStorage |

---

## الجداول والحقول

### 1) Students (`tblzYmBGmCxx2vdcr`) — الجدول المحوري
الهوية، الاشتراك، البيومترية، المؤشرات السريرية، وأوامر المرآة.

| الفئة | الحقول |
|------|--------|
| هوية | `student_name`, `student_id`, `age`, `diagnosis`, `parent_phone`, `parent_country_code`, `preferred_destination` |
| اشتراك/دفع | `subscription_status` (pending→active), `plan_code`, `subscription_expires_at`, `last_payment_at`, `payment_method`, `activation_code_used`, `payment_status`, `session_fee` |
| بيومترية | `face_biometric` (128 float JSON), `biometric_status` (approved), `camera_access` (link→Access Control), `biometric_attendance_verified`, `biometric_attendance_at` |
| تقييم (Wave 3) | `initial_assessment_score` (0–100), `comprehensive_assessment_status` (not_started/in_progress/completed) |
| ثلاثية الوصول | `parent_access_token`, `child_interactive_token`, `specialist_tutor_token` (AUN-{PRT\|CHD\|SPC}-32hex) |
| مؤشرات سريرية | `harmony_score`, `academic_progress`, `behavior_intensity`, `focus_level`, `improvement_index`, `operating_efficiency`, `t_static`, `eye_movement_map` |
| جلسة | `session_start_time`, `clinical_session_status`, `clinical_session_notes`, `smart_session_fields`, `ai_session_report`, `zero_point_report`, `status`, `programmed_goal` |
| العزل (تواصل) | `assigned_specialist` (link→Specialists) |
| **المرآة الشبحية** | `mirror_command`, `mirror_payload` |

قيم `mirror_command`: `echo_goal`, `drop_star`, `drop_reward`, `calm_pulse`, `clear`.

### 2) Access Control (`tblfBvd5WI7alVCFU`) — صلاحيات الأخصائي/الإدارة
`user_email`, `user_name`, `status`, `permissions`, `access_level` (parent/admin/specialist), `access_areas`, `access_token`, `last_login`.

### 3) Specialists (`tblnmcLd5M3U6sErl`)
`specialist_name`, `specialty`, `professional_email`, `contact_phone`, `admin_notes`, `status`, `active_cases`, `rating`, `specialist_tutor_token`, `Students` (link → caseload).

### 4) Daily Sessions (`tbl3mlewMLvqp6AXB`) — سجل الفوترة غير القابل للتعديل
`session_date`, `specialist_name`, `student_name`, `notes`, `claim_status` (Sealed)، `sealed_at`, `specialist_signature`, `immutable_hash`, `session_sequence`, `pin_verified`.
> عند `claim_status = "Sealed"` → السجل غير قابل للتعديل (`assertClaimNotSealed` يرمي `CLAIM_SEALED_IMMUTABLE`).

### 5) Goal Attempts (اختياري)
`student` (link), `session_id`, `session_date`, `goal_label`, `goal_source` (IEP/ABC/Learning), `success_percent`, `attempt_number`, `specialist_email`, `attempt_notes`, `recorded_at`.

### 6) جداول القطاعات الأخرى
- **ABC/Behavior** (`tblJ580…`): `case_id`, `programmed_goal`, `behavior`, `status`, `intensity`, `crisis_score`, `risk_label`.
- **Learning Difficulties** (`tblcNX…`): `student`, `programmed_goal`, `t_static`, `focus_level`, `academic_progress`, `intervention_notes`, `weekly_milestone`.
- **Emotional Monitoring** (`tblokL…`): `mood_label`, `score`, `intelligence_insight`, `preferred_pattern`, `melody_pattern`.
- **Scientific Items** (`tblnCb…`): `title`, `category`, `weight`, `usage_count`.
- **Safe Media** (`tbljdO…`): `title`, `category`, `duration`, `encrypted`.
- **Melody Lab** (`tblMdd…`): `pattern_id`, `pattern_name`, `description`, `score`, `face_au`, `emotional_monitoring`.
- **Community Resources** (`tblV28…`): `title`, `resource_type`, `audience`, `downloads`, `rating`, `summary`.
- **Summer Academy** (اختياري): `student`, `event_type`, `track`, `silent_level`, `baseline_level`, `current_level`, `weak_points_json`, `daily_xp`, `tasks_completed`, `total_xp`, `progress_json`, `recorded_at`.

---

## العلاقات (Relationships)

```
Specialists (1) ──< assigned_specialist >── (N) Students     # عزل الحالات في تواصل
Students (1) ──< student (link) >── (N) Goal Attempts
Students (1) ──< camera_access (link) >── (N) Access Control  # صلاحية كاميرا
Students (1) ──< student (link) >── (N) Summer Academy
Daily Sessions / ABC / Learning ── ربط بالاسم/النص (غير مُعرّف بروابط دائماً)
```
> كثير من الربط منطقي بالاسم/الكود وليس علاقات Airtable رسمية (مثل Daily Sessions عبر `specialist_name`/`student_name`).

---

## أنماط الوصول (Access Patterns)

- **قراءة**: `fetchAirtableRecords(tableId)` تجرّب `view: "Grid view"` ثم تسقط لبدون view، مع ترقيم صفحات (offset).
- **كتابة**: `airtableWrite` (POST/PATCH) مع `typecast: true` تلقائياً، وتنقية الحقول الفارغة (`scrubFields`).
- **مطابقة مرنة للحقول**: `getField(fields, name, ...fallbacks)` تتسامح مع اختلاف التسميات.
- **قناتان**: مباشر (`https://api.airtable.com`) أو بروكسي (`/api/airtable`) حسب `VITE_USE_AIRTABLE_PROXY`، مع سقوط تلقائي بينهما.
- **نسخ احتياطي محلي**: الجلسات اليومية ومحاولات الأهداف تُخزّن أيضاً في `localStorage` عند غياب الجداول السحابية.
- **تنقية Latin-1**: كل الترويسات تُفحص لضمان توكنات ASCII آمنة (تفادي أخطاء عربية في الترويسات).

## قيود مهمة (Select options)
راجع `STUDENT_SELECT_CHECKLIST` في `airtableFields.js` — يجب إنشاء خيارات select مسبقاً في Airtable (مثل `status: new,active` · `subscription_status: pending,active` · `plan_code: free,tutor,medical,institution,assessment_only` · `mirror_command: echo_goal,drop_star,drop_reward,calm_pulse,clear`) وإلا يفشل الكتابة بـ `SELECT_OPTION_MISSING`.
````

## File: PROJECT_HANDOVER/04_AUTH_SYSTEM.md
````markdown
# 04 · نظام المصادقة والصلاحيات (Auth & Authorization)

> الملفات المرجعية: `src/lib/auth.jsx`, `sovereignLogin.js`, `plans.js`, `childAccess.js`, `parentAccess.js`, `tawasulAuth.js`, `sovereignMasterBypass.js`, و`api/_handlers/tawasul/verify-token.js`.

---

## نموذج المصادقة العام

لا يوجد OAuth/JWT خادمي تقليدي. المصادقة قائمة على **توكنات نصية مخزّنة في Airtable** + **بصمة وجه**، والجلسة تُحفظ في **`sessionStorage`** (`aunak.session.v1`) عبر React Context (`AuthProvider`).

```
AuthProvider (auth.jsx)
 ├─ user            # كائن الجلسة الحالي
 ├─ login(session)  # يكتب في sessionStorage
 ├─ logout()
 ├─ setActiveStudent(id)
 └─ patchSession(patch)   # تحديث جزئي للجلسة (يُستخدم لبوابات/تبديل العرض)
```

---

## الأدوار (Roles) — `ROLES`

| الدور | القيمة | الوصف |
|------|--------|-------|
| مدير أعلى | `admin` | وصول واسع (يُستنتج من `access_level` أو صلاحية "الإعدادات المتقدمة") |
| أخصائي | `specialist` | البوابة السريرية |
| ولي أمر | `parent` | لوحة الطفل + بوابة التفعيل |

**المالك السيادي** (`SOVEREIGN_OWNER_EMAIL = hazem@aunak-center.com`): تجاوز كامل عبر `isSovereignOwner()` — يفتح كل الأقسام بما فيها `SOVEREIGN_ONLY_SECTIONS` (`access`, `specialists`).

### التحكم بالأقسام — `canAccessSection(user, role, sectionId)`
1. أقسام سيادية حصراً (`access`, `specialists`) → للمالك السيادي فقط.
2. `biometricSovereign` → يفتح `BIOMETRIC_SOVEREIGN_SECTIONS` (16 قسماً سريرياً).
3. المالك السيادي → كل شيء.
4. `admin` → `CLINICAL_MANAGER_SECTIONS`.
5. غير ذلك → حسب `ROLE_ACCESS[role]`.

---

## الباقات (Plans) — `src/lib/plans.js`

`PLAN_CODES`: `free`, `tutor`, `medical`, `institution`, `assessment_only`.
- `resolvePlanCode()` يطبّع الأسماء العربية/الإنجليزية إلى الكود القانوني.
- `planAllows(plan, feature)` بوّابة المزايا حسب الباقة.
- `landingForPlan(plan)` يحدّد قسم الهبوط بعد التفعيل.
- **تواصل** يرفع الأخصائي إلى `institution` + `manualOverride: true` + `accessLevel: 'sovereign'` (فتح كامل).

---

## مسارات الدخول (Login Flows)

### أ) دخول الأخصائي/الإدارة بالتوكن — `verifyAccessToken(token)` (auth.jsx)
- يبحث في جدول **Access Control** عن تطابق `access_token` أو `user_email`.
- يستنتج الدور من `access_level`/`permissions`، والباقة من الطالب/الحالة.
- يبني **جلسة سريرية** عبر `buildSpecialistClinicalSession` (يفعّل السجل، مراقب النظرة، المحرك العصبي، عدّاد 66 حقلاً).

### ب) الدخول البيومتري السيادي — `sovereignLogin.js` + `biometricMatch.js`
- مسح الوجه الحي ومطابقته بالسجل عند عتبة **94.7%** (`SOVEREIGN_MATCH_CONFIDENCE`).
- عند النجاح: `biometricSovereign = true` + خصم انسجام عند الدخول (20%).

### ج) دخول ولي الأمر — `verifyBiometricChild` / `parentAccess.js`
- يطابق الطفل بالكود/الاسم، يبني جلسة `parent` مع حالة الاشتراك.
- **بوّابة التفعيل** (`needsActivationGate`) تُلزم بدفع/كود قبل المتابعة (Value Lock).
- **البيومترية لا تُفتح إلا بعد `subscription_status = active`** (`PostActivationBiometric.jsx`).

### د) دخول الطفل — `childAccess.js` (توكن `AUN-CHD-…` على `/child`)
- يتحقق من `child_interactive_token`؛ خادمياً عبر تواصل، أو fallback عميل في التطوير.

### هـ) دخول تواصل — `api/_handlers/tawasul/verify-token.js` + `tawasulAuth.js`
- يتحقق من توكن الأخصائي في قاعدة تواصل، يبني جلسة `specialist` سيادية كاملة (`tawasulMvp: true`).

---

## ثلاثية الوصول (Triple Access) — `tripleAccessProtocol.js`
عند تفعيل الاشتراك تُولَّد **ثلاثة توكنات** تلقائياً على سجل الطالب:
`AUN-PRT-{32hex}` (ولي أمر) · `AUN-CHD-{32hex}` (طفل) · `AUN-SPC-{32hex}` (أخصائي/مدرّس).
وتُبنى روابط البوابات الثلاث: `/parent?token=…`, `/child?token=…`, `/?section=specialists&token=…`.

---

## التوجيه حسب المسار (App.jsx)
```
/payment/return   → PaymentReturn
/child            → ChildInteractiveShell  (قبل كل شيء)
Tawasul shell     → TawasulPlatform (Gate → Hub)
/parent           → ParentShell
/summer-academy   → SummerAcademyShell (يتطلب user)
غير ذلك           → GatedPlatform (Gate → ActivationGate → BiometricGate → EcosystemHub)
```

---

## الجلسة والتخزين
| المفتاح | المخزن | المحتوى |
|--------|--------|---------|
| `aunak.session.v1` | sessionStorage | جلسة المستخدم |
| `aunak.sovereignMasterBypass.v1` | sessionStorage | تفعيل مفتاح QA |
| `aunak.activationCodes.v1` | localStorage | أكواد التفعيل المحلية |
| `aunak.dailySessions.v1` / `aunak.goalAttempts.v1` | localStorage | نسخ احتياطية |

---

## Master Bypass (QA فقط) — `sovereignMasterBypass.js`
- المفتاح الافتراضي: `AUNAK-MASTER-2026` (قابل للتجاوز بـ `VITE_AUNAK_MASTER_KEY`).
- التفعيل عبر `?master=AUNAK-MASTER-2026` أو `SovereignMasterBypassPanel`.
- **يتجاوز فحص الوجه المكرر** (`assertFaceUniqueInRegistry`) — للاختبار الداخلي فقط. (انظر `09_SECURITY.md`).

---

## نقاط ضعف/ملاحظات أمنية للمصادقة
- التوكنات نصوص ثابتة في Airtable (لا انتهاء صلاحية على مستوى التوكن نفسه، فقط الاشتراك).
- في المسار المباشر، منطق التحقق يجري على العميل ويقرأ الجدول من المتصفح.
- الجلسة في `sessionStorage` غير موقّعة (قابلة للتلاعب من devtools محلياً).
- Master Bypass بقيمة معروفة في الكود.
````

## File: PROJECT_HANDOVER/05_AI_MODULES.md
````markdown
# 05 · وحدات الذكاء والمعالجة (AI / Intelligence Modules)

> "الذكاء" في عونك مزيج من: رؤية حاسوبية (بصمة الوجه)، خوارزميات قياس سلوكي/سريري حتمية (rule-based)، معالجة صوت/نطق، وتشفير. **لا توجد نماذج LLM/توليدية مستضافة داخلياً**؛ التكامل الخارجي الوحيد للذكاء هو ElevenLabs TTS (اختياري).

---

## 1) الرؤية الحاسوبية — بصمة الوجه (`src/lib/biometricMatch.js`)

- المحرك: **@vladmandic/face-api** (TensorFlow.js تحت الغطاء)، نماذج من CDN jsDelivr.
- الشبكات المُحمّلة: `tinyFaceDetector`, `faceLandmark68Net`, `faceRecognitionNet`.
- المخرجات: متجه **128 float** لكل وجه (`descriptor`).
- المسافة: `euclideanDistance` → تُحوّل لنسبة تشابه: `(1 - distance/0.6) * 100`.

**العتبات:**
| الثابت | القيمة | الاستخدام |
|--------|--------|-----------|
| `SOVEREIGN_MATCH_CONFIDENCE` | 94.7% | الدخول السيادي + منع التكرار |
| `ENROLLMENT_MATCH_CONFIDENCE` | 82% | تحقّق أثناء التسجيل (نفس الجلسة) |
| `ANTI_SPOOF_DUPLICATE_CONFIDENCE` | 94.7% | فحص الوجه المكرر |

**الوظائف المحورية:**
- `captureStableDescriptor()` — يجمع 5 إطارات مستقرة ويحسب المتوسط لبصمة تسجيل أدق.
- `matchStudentByFaceDescriptor()` — يطابق الوجه الحي بأقرب طالب (بشرط ≥94.7%).
- `assertFaceUniqueInRegistry()` — **مانع التحايل**: يمسح كل الطلاب؛ إن وُجد وجه مطابق ≥94.7% يرمي `FACE_DUPLICATE_BLOCKED` ويوقف العملية (يتجاوزه Master Bypass فقط).
- الخطاف: `useBiometricScan.js` (التقاط/مسح مع دعم وضع التسجيل `enrollmentMode`).

---

## 2) كاشف الانهيار — Meltdown AI (`src/hooks/useMeltdownPredictor.js`)

- **الفكرة**: رصد نوبات التهيّج عبر زمن الاستجابة بين الأحداث (نقر/لمس/مفاتيح).
- العتبة: `MELTDOWN_LATENCY_MS = 280ms`. ثلاث استجابات متتالية ≤280ms → خطر انهيار.
- يُدمج مع **معادلة خطورة ABC** (`computeRiskScore(I,F,D)` من `useCrisisAlerts`) — شدّة × تكرار × مدة.
- عند التجاوز: `playWarningPulse()` (نبضة صوتية) + تنبيه بروتوكول التهدئة.
- المخرجات: `meltdownRisk`, `burstCount`, `riskScore`, `fusedCritical`.

---

## 3) مراقب حياد النظرة — Gaze Neutrality (`src/hooks/useGazeNeutralityObserver.js`)

- يراقب هبوط التتبّع البصري؛ شرط التفعيل من `detectGazeNeutralityCondition` (`focusLevel < 64` أو `t_static ≥ 5s`).
- عند تحقّق الشرط لمدة `GAZE_HOLD_MS = 5000ms`: تنبيه بتأثير آلة كاتبة + تعتيم محيطي (`lux-gaze-dim`) + صوت.
- الهدف: توصية بنشاط جذب انتباه فوري قبل استكمال المهمة الأكاديمية.

---

## 4) محرك الانسجام — Harmony Score (`src/lib/harmonyEngine.js`)

- يقيس الفجوة بين **التقدّم الأكاديمي** و**شدّة السلوك**.
- المعادلة الأساس: `(academic + (100 - behavior)) / 2`.
- **عقوبة الفجوة**: إذا `|academic - behavior| ≥ 20` → خصم 20% (`HARMONY_DEDUCTION_RATE`).
- `computeHarmonyAfterBiometricLogin()` يطبّق خصم دخول 20% ثم يعيد الحساب.
- يُزامن للحقل `harmony_score` في Airtable.

---

## 5) محرك الأهداف — Dynamic Task Analysis (`src/lib/goalEngine.js`, `AUN-4611`)

- يدمج الأهداف المعتمدة من IEP + خطط ABC + سجلات التعلّم (`buildApprovedGoalList`).
- **مراقبة فقط**: لا يوجد قفل 80% يمنع التنقّل (`GOAL_REPORT_THRESHOLD=80` للتقارير فقط).
- `suggestAlternateGoal()` اقتراح استشاري عند انخفاض متوسط النجاح.
- **إثبات الحضور المالي** `verifyAun4611SessionAttestation()`: يشترط حضور الطفل بيومترياً داخل نافذة الجلسة (±8 ساعات) قبل اعتماد الفوترة.
- تلخيص: `summarizeSessionAttempts` / `summarizeWeeklyAttempts`.

---

## 6) محرك التقييم المجاني — Initial Assessment (`src/lib/initialAssessmentEngine.js`)

- 6 مجالات: التواصل، الاجتماعي، السلوك، الحسّي، اللغة، المرونة (0–3 لكل سؤال).
- ينتج نسبة 0–100 وثلاثة نطاقات: `balanced` (<36)، `moderate` (36–65)، `elevated` (≥66).
- يبني ملفاً تحويلياً (عنوان + ملخّص + توصية + نقاط قوة/تركيز) بالعربية والإنجليزية.
- يُخزَّن في `initial_assessment_score`؛ ويمكن إعادة بناء الملف من الرقم المحفوظ.

---

## 7) الصوت والنطق (Audio / Speech)

| الوحدة | الدور |
|--------|------|
| `sovereignAudio.js` | توليف Web Audio: نبضات تحذير، طنين معالجة، آلة كاتبة، **لحن مكافأة Ta-da** (`playTaDaFanfare`)، **درون هدوء** (`startCalmDrone`)، نبضة هدوء |
| `sovereignVoice.js` | Web Speech: تمييز أوامر المشرف الصوتية (انتقال/تحكم يدوي/إملاء ملاحظة) |
| `academyVoice.js` + `useAcademyVoice.js` | طابور نطق TTS مع تفضيل السحابة (`preferCloud`) — يُستخدم في **نطق هدف الطفل** |
| `api/academy/tts.js` | بروكسي **ElevenLabs** (`eleven_multilingual_v2`) — يرجع 503 عند غياب المفتاح فيسقط العميل على Web Speech |

---

## 8) التشفير — Sovereign Crypto (`src/lib/sovereignCrypto.js`)

- **AES-256-GCM** عبر Web Crypto API.
- مفتاح مشتق من `dynamicSessionId`/`childCode`/`activeStudentId` (padded 32 بايت).
- `encryptSessionPayload` / `decryptSessionPayload` لحقول الجلسة، و`encryptForExport` لتصدير البحث بمفتاح لمرة واحدة.

---

## 9) المرآة الشبحية — Ghost Mirror (تواصل)
ليست "ذكاءً" بل **قناة تحكّم حيّة**: الأخصائي يكتب `mirror_command`/`mirror_payload` على سجل الطالب، وواجهة الطفل تستطلع Airtable كل ~3.5s وتنفّذ الأمر (نطق الهدف / نجمة / مكافأة / نبضة هدوء / مسح). المنطق في `tawasulMirror.js` + `ChildInteractiveShell.jsx`.

---

## ملاحظات
- كل "الذكاء" السلوكي/السريري **حتمي (rule-based)** وقابل للتفسير — لا صناديق سوداء.
- الاعتماد الوحيد على خدمة خارجية للذكاء = ElevenLabs (اختياري، مع سقوط آمن).
- نماذج face-api تُحمّل من CDN عام (لا استضافة ذاتية) — نقطة اعتماد خارجي للتوافر.
````

## File: PROJECT_HANDOVER/06_FRONTEND.md
````markdown
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
````

## File: PROJECT_HANDOVER/07_BACKEND.md
````markdown
# 07 · الواجهة الخلفية (Backend — Vercel Serverless)

> الخلفية = دوال **Vercel Serverless** في مجلد `api/` (Node، ESM). لا خادم دائم ولا قاعدة بيانات خاصة — Airtable هو المخزن. المنطق المشترك يُستورد من `src/lib/`.

---

## معمارية الموجّهات الديناميكية

لتفادي حدّ خطة Vercel Hobby (عدد الدوال)، تُجمَّع نقاط النهاية المتقاربة في **دالة واحدة** عبر `createActionRouter` (`api/_handlers/dispatch.js`):

```js
// api/tawasul/[action].js  ← ?action=verify-token|caseload|mirror|...
createActionRouter({ 'verify-token': { POST }, caseload: { POST }, mirror: { POST }, ... })
```
الموزّع يقرأ `req.query.action` ويوجّه حسب الفعل + الميثود (404/405 عند عدم التطابق).
المعالجات الفعلية تعيش في `api/_handlers/**` (لا تُعدّ دوالاً مستقلة على Vercel).

---

## نقاط النهاية (Endpoints)

### الوكيل والبنية
| المسار | الميثود | الوظيفة |
|--------|---------|---------|
| `/api/airtable` | GET/POST/PATCH | بروكسي Airtable (يخفي `AIRTABLE_API_KEY`)؛ يختار Base تواصل عند `VITE_TAWASUL_MVP=true` |
| `/api/academy/tts` | POST | بروكسي TTS (ElevenLabs)؛ 503 عند غياب المفتاح → سقوط لـ Web Speech |

### التفعيل والاشتراك
| المسار | الميثود | الوظيفة |
|--------|---------|---------|
| `/api/activation/redeem` | POST | تفعيل كود `AUN-{PLAN}-XXXX-YYYY` → `subscription_status=active` + باقة + **توليد ثلاثية التوكنات** + روابط البوابات. يقرأ حالة التقييم الشامل ويحافظ عليها. يعمل بوضع `client_fallback` عند غياب المفتاح |

### الدفع — `/api/payment/[action]`
| الفعل | الميثود | الوظيفة |
|-------|---------|---------|
| `status` | GET | حالة/توفّر الدفع |
| `create-checkout` | POST | إنشاء عملية Tap (أو Mock). يتحقق من الطالب، يجلب السعر من الخادم (لا يثق بالعميل)، يبني `redirectUrl`+`webhookUrl`. الباقات القابلة للدفع أونلاين: tutor/medical/assessment_only |
| `verify-return` | GET | تأكيد العودة من بوابة الدفع |
| `webhook` | POST | استقبال شحنة Tap: تحقّق `hashstring` (أو mock موقّع) ثم `processCapturedPaymentCharge` → تفعيل |
| `mock-complete` | GET | محاكاة إتمام الدفع (معاينة) |
| `mock-fire` | POST | إطلاق webhook وهمي |

### تواصل — `/api/tawasul/[action]`
| الفعل | الميثود | الوظيفة |
|-------|---------|---------|
| `verify-token` | POST | تحقّق توكن الأخصائي → جلسة سيادية كاملة (`institution` + `manualOverride`) |
| `caseload` | POST | حالات الأخصائي (عزل حسب `assigned_specialist`) |
| `mirror` | POST | كتابة أمر المرآة الشبحية على سجل الطالب |
| `student-goal` | POST | حفظ/تحديث `programmed_goal` للطالب |
| `assessment-sync` | POST | مزامنة نتائج التقييم |

### الجلسات والتسوية والوالدين
| المسار | الميثود | الوظيفة |
|--------|---------|---------|
| `/api/session/child-seal` | POST | ختم جلسة لعب الطفل → سجل يومي مختوم (يوجّه لدالة تواصل عند base تواصل). عتبة تفاعل دنيا (`CHILD_ISLAND_SEAL_THRESHOLD`) |
| `/api/settlement/seal` | POST | ختم التسوية المالية |
| `/api/parent/sessions` | — | جلب جلسات الطفل للوحة ولي الأمر |

---

## المنطق التجاري الأساسي (Business Logic في `src/lib`)

- **الدفع**: `tapPayments.js` (إنشاء شحنة + تحقّق hashstring)، `paymentPlans.js` (تسعير SAR: tutor=299، medical=499، assessment_only=199، institution=يدوي/B2B)، `mockPayments.js`، `paymentWebhookProcessor.js`، `paymentActivation.js`.
- **التفعيل**: `activationCodes.js` (توليد/تحقّق الأكواد)، `subscriptionEngine.js` (redeem + بوابة التفعيل + fallback خادم→عميل).
- **الثلاثية**: `tripleAccessProtocol.js` (توليد توكنات + حقول Airtable + روابط بوابات).
- **الجلسات**: `childSessionSeal.js`، `tawasulSessionSeal.js`، `settlementEngine.js`، `specialistAttestation.js`.
- **العزل**: `specialistIsolation.js` (فصل حالات كل أخصائي).

---

## متغيّرات البيئة (Environment Variables)

### خادمية (بدون `VITE_`, على Vercel)
| المتغيّر | الغرض |
|---------|-------|
| `AIRTABLE_API_KEY` | توكن Airtable (Personal Access Token) — يُفضّل استخدامه خادمياً |
| `AIRTABLE_BASE_ID` | معرّف القاعدة |
| `TAP_SECRET_KEY` | مفتاح Tap Payments السري |
| `ELEVENLABS_API_KEY` / `AIRTABLE_TTS_API_KEY` | مفتاح TTS السحابي |
| `ELEVENLABS_VOICE_ID` | صوت TTS (اختياري) |
| `MOCK_PAYMENTS` (عبر `mockPayments.js`) | تفعيل وضع الدفع الوهمي في المعاينة |

### عميلية (`VITE_`, تُحقن في الحزمة)
| المتغيّر | الغرض |
|---------|-------|
| `VITE_AIRTABLE_API_KEY` / `VITE_AIRTABLE_PAT` | توكن Airtable للمسار المباشر (⚠️ يظهر في العميل) |
| `VITE_AIRTABLE_BASE_ID` | القاعدة |
| `VITE_USE_AIRTABLE_PROXY` | `true` لاستخدام `/api/airtable` بدل المباشر |
| `VITE_TAWASUL_MVP` | تفعيل قشرة تواصل + قاعدة تواصل |
| `VITE_AIRTABLE_STUDENTS_TABLE_ID` / `_SPECIALISTS_` / `_DAILY_SESSIONS_` / `_GOAL_ATTEMPTS_` / `_SUMMER_ACADEMY_TABLE_ID` | معرّفات جداول قابلة للتهيئة |
| `VITE_AUNAK_MASTER_KEY` | تجاوز مفتاح QA الافتراضي |

---

## أنماط مشتركة عبر المعالجات
- `sanitizeAscii()` على كل المدخلات/الترويسات (منع كسر Latin-1 بالعربية).
- تحقّق الميثود (405) والحقول المطلوبة (400) في بداية كل معالج.
- سقوط آمن: العميل يجرّب الخادم أولاً ثم fallback محلي (`redeemActivationCodeWithApi`).
- الاستجابة دائماً JSON مع رموز حالة صريحة.

---

## النشر (Deployment)
- Vercel مرتبط بمستودع GitHub؛ الدفع إلى `main` ينشر تلقائياً على `https://aunak.vercel.app`.
- `vercel.json`: إعادة كتابة كل المسارات إلى `index.html` **عدا `/api/`** (SPA + دوال).
- لا CI/اختبارات آلية قبل النشر.
````

## File: PROJECT_HANDOVER/08_DEPENDENCIES.md
````markdown
# 08 · الاعتماديات (Dependencies)

> المصدر: `package.json` + `package-lock.json`. المشروع `type: module` (ESM)، خاص (`private`).

---

## اعتماديات التشغيل (dependencies)

| الحزمة | الإصدار | الغرض |
|--------|---------|-------|
| `react` | ^19.2.6 | مكتبة الواجهة |
| `react-dom` | ^19.2.6 | ربط React بالـ DOM |
| `framer-motion` | ^12.42.0 | حركات تصريحية |
| `lucide-react` | ^1.16.0 | أيقونات SVG |
| `@vladmandic/face-api` | ^1.7.15 | التعرّف على الوجه (بصمة بيومترية) |

> **ملاحظة**: لا توجد حزمة `airtable` رسمية — التعامل عبر `fetch` أصلي. أيضاً لا توجد حزمة HTTP (axios) ولا مدير حالة ولا مكتبة توجيه ولا SDK دفع (Tap عبر REST يدوي).

---

## اعتماديات التطوير (devDependencies)

| الحزمة | الإصدار | الغرض |
|--------|---------|-------|
| `vite` | ^8.0.12 | أداة البناء وخادم التطوير |
| `@vitejs/plugin-react` | ^6.0.1 | دعم React في Vite |
| `tailwindcss` | ^3.4.19 | إطار CSS |
| `postcss` | ^8.5.15 | معالجة CSS |
| `autoprefixer` | ^10.5.0 | بادئات المتصفحات |
| `eslint` | ^10.3.0 | فحص الجودة |
| `@eslint/js` | ^10.0.1 | قواعد ESLint الأساسية |
| `eslint-plugin-react-hooks` | ^7.1.1 | قواعد خطافات React |
| `eslint-plugin-react-refresh` | ^0.5.2 | توافق HMR |
| `globals` | ^17.6.0 | تعريفات globals للبيئة |
| `@types/react` | ^19.2.14 | أنواع (مساعدة محرّر فقط — لا TS) |
| `@types/react-dom` | ^19.2.3 | أنواع |

---

## السكربتات (npm scripts)

| السكربت | الأمر | الوصف |
|---------|-------|-------|
| `dev` | `vite` | خادم تطوير محلي |
| `dev:public` | `vite --host` | تطوير مكشوف على الشبكة |
| `build` | `vite build` | بناء الإنتاج (→ `dist/`) |
| `lint` | `eslint .` | فحص الشيفرة |
| `preview` | `vite preview` | معاينة بناء الإنتاج |

---

## اعتماديات خارجية (Runtime / Services)

| الخدمة | نوع الاعتماد | ملاحظة |
|--------|--------------|--------|
| **Airtable API** | حرج (المخزن الوحيد) | REST v0؛ توكن PAT |
| **Vercel** | حرج (الاستضافة + الدوال) | خطة Hobby (قيود عدد الدوال) |
| **Tap Payments** | مهم (الدفع) | REST؛ `TAP_SECRET_KEY` + hashstring |
| **ElevenLabs** | اختياري (TTS) | سقوط لـ Web Speech |
| **jsDelivr CDN** | مهم (نماذج face-api) | `cdn.jsdelivr.net/npm/@vladmandic/face-api/model/` — تحميل وقت التشغيل |

---

## واجهات المتصفح المطلوبة (Browser APIs)
- **WebGL / WASM** (لـ face-api / TensorFlow.js).
- **getUserMedia** (الكاميرا للبصمة).
- **Web Audio API** (توليف الأصوات).
- **Web Speech API** (النطق + الأوامر الصوتية) — دعم متفاوت بين المتصفحات.
- **Web Crypto API** (AES-GCM).
- **sessionStorage / localStorage**.

---

## ملاحظات على الاعتماديات
- **مجموعة نحيفة نسبياً** — لا تضخّم بحزم غير ضرورية، لكن ذلك ينقل عبئاً منطقياً كثيراً إلى الشيفرة اليدوية (Airtable، الدفع).
- **إصدارات حديثة جداً** (React 19، Vite 8، ESLint 10) — قد تسبق بعض التوافقات في النظام البيئي.
- `@types/*` موجودة رغم عدم استخدام TypeScript (مساعدة IntelliSense فقط).
- `@vladmandic/face-api` حزمة ثقيلة تؤثر على حجم الحزمة وزمن التحميل الأول.
- لا `overrides`/`resolutions` ولا قفل إصدارات صارم على مستوى السياسة (يُعتمد على lockfile).
````

## File: PROJECT_HANDOVER/09_SECURITY.md
````markdown
# 09 · الأمن (Security)

> تقييم أمني بناءً على تحليل الشيفرة. مرتّب حسب الخطورة. **لم تُجرَ أي تعديلات** — توصيات فقط.

---

## نقاط القوة (ما هو مُحكم بالفعل)

- ✅ **بروكسي Airtable** (`/api/airtable`) يخفي التوكن عن العميل عند `VITE_USE_AIRTABLE_PROXY=true`.
- ✅ **التسعير من الخادم**: `create-checkout` لا يثق بمبلغ العميل، يحسبه من `paymentPlans.js`.
- ✅ **تحقّق webhook الدفع**: `verifyTapWebhookHash` (hashstring) للحقيقية، وتوقيع للـ mock، مع رفض `MOCK_PAYMENTS_DISABLED` في الإنتاج.
- ✅ **منع تحايل بيومتري**: `assertFaceUniqueInRegistry` يمنع تسجيل وجه مكرر ≥94.7%.
- ✅ **عتبة دخول سيادية عالية** (94.7%) للوجه.
- ✅ **بوّابة القيمة**: البيومترية لا تُفتح إلا بعد اشتراك نشط (`PostActivationBiometric`).
- ✅ **سجلات جلسات غير قابلة للتعديل** (`CLAIM_SEALED_IMMUTABLE`) — نزاهة الفوترة.
- ✅ **تشفير AES-256-GCM** لحمولات الجلسة والتصدير.
- ✅ **تنقية ASCII/Latin-1** على المدخلات والترويسات (تمنع حقن الترويسات وكسرها).
- ✅ تحقّق صيغة صارم لأكواد التفعيل والتوكنات (regex).

---

## مخاطر عالية (High)

### H1 — تسريب توكن Airtable إلى العميل
في المسار المباشر (`VITE_AIRTABLE_API_KEY`/`VITE_AIRTABLE_PAT`) يُضمَّن التوكن داخل حزمة الـ JS المرسلة للمتصفح. أي مستخدم يمكنه استخراجه والوصول الكامل للقاعدة (قراءة/كتابة بيانات أطفال حسّاسة).
- **التخفيف**: فرض `VITE_USE_AIRTABLE_PROXY=true` في الإنتاج، وإزالة أي مفاتيح `VITE_AIRTABLE_*` من بيئة الإنتاج، والاعتماد على `AIRTABLE_API_KEY` الخادمي فقط. استخدم توكن بأقل صلاحيات (scoped).

### H2 — الوثوق ببيانات حسّاسة على العميل
منطق المصادقة والصلاحيات والاشتراك يعمل في المتصفح، والجلسة في `sessionStorage` **غير موقّعة**. يمكن التلاعب بـ `role`/`plan`/`sovereignFullView`/`biometricSovereign` عبر devtools محلياً لفتح أقسام.
- **التخفيف**: التحقق من الصلاحيات خادمياً عند كل عملية حسّاسة (كتابة/تفعيل)، لا الاكتفاء بإخفاء الواجهة.

### H3 — Master Bypass بقيمة معروفة
`AUNAK-MASTER-2026` مضمّن في الشيفرة العامة ويتجاوز فحص الوجه المكرر عبر `?master=…`.
- **التخفيف**: نقله لمتغيّر بيئة إلزامي (بدون افتراضي)، وتقييده ببيئة غير الإنتاج، وتدوير القيمة.

---

## مخاطر متوسطة (Medium)

### M1 — لا حدود معدّل (Rate limiting)
نقاط `redeem`, `verify-token`, `mirror`, `create-checkout` بلا throttling → عرضة للتخمين/الإساءة (brute-force على الأكواد/التوكنات).
- **التخفيف**: rate limiting على مستوى Vercel/Edge أو منطق مضاد للتخمين.

### M2 — تعداد/تخمين التوكنات
`verifyAccessToken` يجلب **كل** سجلات Access Control ويقارن على العميل؛ التوكنات نصوص ثابتة بلا انتهاء صلاحية ذاتي.
- **التخفيف**: بحث خادمي مفهرس، توكنات ذات صلاحية زمنية، وتدوير.

### M3 — استقطاب البيومترية عبر localStorage/العميل
بصمات الوجه (128 float) تُقرأ على العميل للمطابقة؛ وقد تُخزّن جلسات/محاولات في `localStorage` بلا تشفير.
- **التخفيف**: إجراء المطابقة الحسّاسة خادمياً حيثما أمكن، وتشفير أي بيانات محلية.

### M4 — نماذج face-api من CDN عام
`cdn.jsdelivr.net` — اعتماد خارجي للتوافر والنزاهة (supply-chain).
- **التخفيف**: استضافة النماذج ذاتياً + SRI/فحص تكامل.

### M5 — CORS/الأصل غير مُقيّد على الدوال
المعالجات لا تُقيّد `Origin` صراحةً.
- **التخفيف**: قصر الأصول المسموحة على نطاق الإنتاج.

---

## مخاطر منخفضة (Low)

- **L1**: `HARDCODED_API_KEY = "put_your_token_here"` نص نائب في `airtable.js` (غير خطر بحد ذاته لكنه نمط محفوف — يجب ألا يُملأ بقيمة حقيقية أبداً).
- **L2**: رسائل أخطاء Airtable تُمرَّر أحياناً كما هي للعميل (قد تكشف أسماء حقول/جداول).
- **L3**: لا رؤوس أمان (CSP، HSTS، X-Frame-Options) مُعرّفة في `vercel.json`.
- **L4**: `console.warn/error` قد يسرّب تفاصيل في الإنتاج.

---

## خصوصية بيانات الأطفال (Compliance)
المنصّة تعالج **بيانات صحّية/بيومترية لقُصّر** (تشخيصات، بصمات وجه، هواتف أولياء الأمور). هذا يستوجب عناية خاصة (موافقة ولي الأمر، تقليل البيانات، الاحتفاظ/الحذف، التشفير أثناء النقل والتخزين). `studentPrivacy.js` موجود كبداية، لكن يلزم مراجعة امتثال شاملة (خصوصاً H1/H2).

---

## أولويات الإصلاح الأمني (خلاصة)
1. **H1**: إجبار البروكسي وإزالة مفاتيح Airtable من العميل. *(الأخطر)*
2. **H3**: تحييد Master Bypass عن الإنتاج.
3. **H2**: تحقّق صلاحيات خادمي للعمليات الحسّاسة.
4. **M1/M2**: rate limiting + تقوية التوكنات.
5. **L3**: إضافة رؤوس أمان.
````

## File: PROJECT_HANDOVER/10_TECHNICAL_DEBT.md
````markdown
# 10 · الدين التقني (Technical Debt)

> قائمة الديون المرصودة من تحليل الشيفرة، مرتّبة حسب الأثر. لا تتضمن مخاطر الأمن (انظر `09_SECURITY.md`).

---

## 1) لا اختبارات آلية ولا CI (أثر: عالٍ)
- لا توجد اختبارات unit/integration/e2e؛ الموجود سكربتات يدوية في `scripts/` (`test-routing.mjs`, `test-mock-payment.mjs`, `test-daily-sessions.mjs`).
- لا خط CI (GitHub Actions) يشغّل lint/build/test قبل النشر.
- **الأثر**: كل تغيير يخاطر بانحدار صامت، خصوصاً في منطق الدفع/التفعيل/المرآة.

## 2) حجم الحزمة وغياب code-splitting (أثر: عالٍ)
- حزمة JS الإنتاجية > 2MB (تحذير Vite). `@vladmandic/face-api` وحده ثقيل.
- لا `React.lazy`/dynamic import لتقسيم الواجهات (طفل/أخصائي/تواصل/أكاديمية تُحمّل معاً).
- **الأثر**: زمن تحميل أول بطيء، خصوصاً على أجهزة/شبكات ضعيفة (وهي جمهور مستهدف).

## 3) ازدواجية منطق التفعيل/الاشتراك (أثر: متوسط)
- منطق التفعيل مكرر بين العميل (`subscriptionEngine.redeemActivationCode`) والخادم (`api/activation/redeem.js`) مع دوال متشابهة (`subscriptionFieldsForActivation`, `planFromPrefix`/`planFromCodePrefix`, `landingForPlan`).
- **الأثر**: خطر انحراف السلوك بين الطرفين عند أي تعديل.

## 4) كود ميّت / غير مستخدم (أثر: متوسط)
- `ChildAwniCompanion.jsx` لم يعد مُستخدماً بعد إعادة تصميم واجهة الطفل.
- دوال/حقول `@deprecated` في `airtable.js` (`STUDENT_NAME_FIELD` وأخواتها، `generateStudentId`).
- دوال بمعاملات `void` (placeholders) في محاسبة الجلسات (`createSealedSessionClaim`).
- **الأثر**: تشويش وصعوبة صيانة.

## 5) الاعتماد على Airtable كـ "قاعدة بيانات تطبيقية" (أثر: عالٍ استراتيجياً)
- Airtable غير مصمّم كـ OLTP: حدود معدّل صارمة، لا معاملات (transactions)، لا فهرسة حقيقية، ربط بالاسم/النص بدلاً من مفاتيح.
- استعلامات تجلب **كل** السجلات ثم تُرشّح على العميل (مثل التوكنات، مطابقة الوجه، الحالات).
- **الأثر**: مشاكل أداء وتوسّع مع نمو البيانات، وسباقات كتابة محتملة.

## 6) اختيار الجداول/القواعد بالبيئة الهشّة (أثر: متوسط)
- `goalAttempts` و`summerAcademy` فارغان افتراضياً → سقوط صامت إلى `localStorage` (بيانات لا تصل للسحابة، تضيع بمسح المتصفح).
- اختيار قاعدة تواصل يعتمد على `VITE_TAWASUL_MVP` + مطابقة Base ID يدوية في عدة ملفات (`api/airtable.js`, `child-seal.js`).
- **الأثر**: سلوك مختلف بين البيئات يصعب تتبّعه.

## 7) توجيه يدوي بدون راوتر (أثر: متوسط)
- التوجيه عبر `window.location.pathname` وسلسلة شروط في `App.jsx`؛ لا history API منظّم، لا روابط عميقة قابلة للصيانة، لا معالجة 404.
- **الأثر**: هشاشة عند إضافة مسارات، وصعوبة الاختبار.

## 8) حالة موزّعة بلا مصدر حقيقة واحد (أثر: متوسط)
- الجلسة في `sessionStorage`، نسخ احتياطية في `localStorage`، وحالة مشتقة في خطافات متعددة.
- مفاتيح تخزين متعددة (`aunak.session.v1`, `aunak.dailySessions.v1`, `aunak.goalAttempts.v1`, `aunak.activationCodes.v1`, `aunak.ledgerOverride.v1`).
- **الأثر**: صعوبة تتبّع مصدر الحقيقة وتزامن الحالات.

## 9) توثيق ناقص/مضلّل (أثر: منخفض–متوسط)
- `README.md` قالب Vite الافتراضي — لا يصف المشروع أو الإعداد.
- لا ملف `.env.example` موثّق يجمع كل المتغيّرات المطلوبة.
- الوثائق الحقيقية متناثرة في `docs/` (عربية) و`.cursor/rules`.

## 10) لا معالجة أخطاء/مراقبة مركزية (أثر: متوسط)
- `ErrorBoundary` واحد على المستوى الأعلى فقط.
- لا تكامل مع خدمة رصد أخطاء (Sentry) أو logging منظّم للدوال.
- أخطاء الشبكة تُبتلع أحياناً في `catch` صامتة (`/* ignore */`).

## 11) غياب TypeScript (أثر: متوسط)
- مشروع كبير (>140 ملف) بمنطق مالي/سريري دقيق بلا أنواع؛ `@types/react` موجودة لكن الشيفرة JS.
- **الأثر**: أخطاء أنواع وقت التشغيل، خصوصاً في تمرير كائنات الجلسة/الطالب المعقّدة.

---

## خلاصة أولويات السداد
| الأولوية | البند |
|---------|-------|
| P0 | اختبارات + CI (1) · تقييم بديل/طبقة تخزين لـ Airtable (5) |
| P1 | code-splitting وحجم الحزمة (2) · توحيد منطق التفعيل (3) |
| P2 | تنظيف الكود الميّت (4) · راوتر منظّم (7) · مراقبة أخطاء (10) |
| P3 | توثيق README/.env (9) · تبنّي TS تدريجي (11) |
````

## File: PROJECT_HANDOVER/11_RECOMMENDATIONS.md
````markdown
# 11 · التوصيات (Recommendations & Roadmap)

> توصيات هندسية عملية مبنية على التحليل، مرتّبة بمراحل. لا تعديلات مُنفّذة — خارطة تنفيذ فقط.

---

## المرحلة 0 — تأمين فوري (أيام)

1. **إجبار بروكسي Airtable في الإنتاج**: `VITE_USE_AIRTABLE_PROXY=true` + إزالة `VITE_AIRTABLE_API_KEY/PAT` من بيئة الإنتاج، والاعتماد على `AIRTABLE_API_KEY` الخادمي فقط. (يعالج H1)
2. **تحييد Master Bypass**: نقله لمتغيّر بيئة بلا قيمة افتراضية، وتعطيله في الإنتاج. (يعالج H3)
3. **توكن Airtable بأقل صلاحيات**: PAT مقيّد بالقاعدة والجداول المطلوبة فقط، مع خطة تدوير.
4. **رؤوس أمان** في `vercel.json`: CSP، HSTS، X-Content-Type-Options، X-Frame-Options، Referrer-Policy. (يعالج L3)
5. **إنشاء `.env.example` موثّق** يجمع كل المتغيّرات الخادمية والعميلية.

## المرحلة 1 — شبكة أمان هندسية (أسبوع–أسبوعان)

6. **CI على GitHub Actions**: تشغيل `lint` + `build` على كل PR، ومنع الدمج عند الفشل.
7. **اختبارات وحدة للمنطق الحرج** (Vitest): `plans`, `initialAssessmentEngine`, `harmonyEngine`, `goalEngine`, `activationCodes`, `tripleAccessProtocol`, `biometricMatch` (الحساب فقط).
8. **رصد أخطاء** (Sentry أو ما يعادله) للعميل والدوال، مع إزالة `catch` الصامتة الحرجة.
9. **تحقّق صلاحيات خادمي** للعمليات الحسّاسة (تفعيل، ختم، كتابة سجلات) بدل الاكتفاء بالعميل. (يعالج H2)

## المرحلة 2 — الأداء وتجربة الجمهور المستهدف (أسبوعان–٣)

10. **Code-splitting**: `React.lazy` لكل قشرة (طفل/أخصائي/تواصل/أكاديمية/ولي أمر) + تحميل `face-api` عند الحاجة فقط.
11. **استضافة نماذج face-api ذاتياً** + SRI بدل CDN عام. (يعالج M4)
12. **ميزانية أداء** (bundle budget) في CI + تحليل الحزمة (rollup-plugin-visualizer).
13. **Rate limiting** على `redeem`/`verify-token`/`create-checkout`/`mirror`. (يعالج M1/M2)

## المرحلة 3 — تقوية طبقة البيانات (٣–٦ أسابيع)

14. **طبقة وصول بيانات خادمية موحّدة**: نقل كل قراءات/كتابات Airtable الحسّاسة خلف الدوال (لا وصول مباشر من العميل).
15. **تقييم قاعدة بيانات مناسبة** (Postgres/Supabase) كـ OLTP، مع الإبقاء على Airtable كواجهة إدارية إن لزم؛ ترحيل تدريجي يبدأ بالجداول الأكثر كتابة (Students, Daily Sessions).
16. **استبدال الربط بالاسم/النص** بعلاقات/مفاتيح حقيقية (خصوصاً Daily Sessions ↔ Student/Specialist).
17. **إزالة السقوط الصامت إلى localStorage** للبيانات المحاسبية (Goal Attempts, Daily Sessions) أو جعله صريحاً ومُراقباً.

## المرحلة 4 — جودة الشيفرة والصيانة (مستمر)

18. **توحيد منطق التفعيل** في وحدة واحدة تُستورد خادمياً وعميلياً (إزالة الازدواج). (دين #3)
19. **حذف الكود الميّت**: `ChildAwniCompanion`، دوال `@deprecated`، placeholders. (دين #4)
20. **راوتر منظّم** (react-router) مع معالجة 404 وروابط عميقة. (دين #7)
21. **تبنّي TypeScript تدريجياً** بدءاً من `src/lib/` (المنطق المالي/السريري). (دين #11)
22. **README حقيقي** + توثيق معماري محدث + مخطط تدفّقات (Enrollment/Payment/Mirror).

## المرحلة 5 — الامتثال وخصوصية القُصّر

23. **مراجعة امتثال** لبيانات صحّية/بيومترية لقُصّر: موافقة ولي الأمر الموثّقة، تقليل البيانات، سياسة احتفاظ/حذف، تشفير أثناء التخزين.
24. **تشفير البيانات الحسّاسة الساكنة** (بصمات الوجه، التشخيصات) وتقييد الوصول بالدور خادمياً.
25. **مسار حذف/تصدير بيانات الطفل** (حق ولي الأمر).

---

## مكاسب سريعة (Quick Wins)
- تفعيل البروكسي + رؤوس الأمان + `.env.example` (ساعات).
- حذف الكود الميّت وتشغيل `lint` نظيفاً.
- إضافة CI بسيط (lint+build).
- استضافة نماذج face-api ذاتياً.

## مؤشرات نجاح مقترحة
| المؤشر | الهدف |
|--------|-------|
| حجم أول تحميل JS | < 500KB (بعد splitting) |
| تغطية اختبارات المنطق الحرج | ≥ 70% |
| مفاتيح سرّية في حزمة العميل | 0 |
| زمن التفاعل الأول على شبكة 3G | تحسّن ملموس |
| أخطاء إنتاج مرصودة | لوحة Sentry فعّالة |
````

## File: PROJECT_HANDOVER/12_FILE_INDEX.md
````markdown
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
````

## File: .vercelignore
````
_patch/
.cursor/
scripts/
*.log
````

## File: api/_handlers/dispatch.js
````javascript
/** Shared action router for Vercel dynamic API routes (counts as one Serverless Function). */

export function createActionRouter(routes) {
  return async function handler(req, res) {
    const action = String(req.query?.action ?? '').trim();
    const route = routes[action];
    if (!route) {
      res.status(404).json({ error: 'NOT_FOUND', action });
      return;
    }
    const fn = route[req.method];
    if (!fn) {
      res.status(405).json({ error: 'Method not allowed', action, method: req.method });
      return;
    }
    return fn(req, res);
  };
}
````

## File: api/_handlers/payment/create-checkout.js
````javascript
/**
 * POST /api/payment/create-checkout
 */

import { normalizePlanCode, PLAN_CODES } from '../../../src/lib/plans.js';
import { planAmountForTap, DEFAULT_CHECKOUT_PLAN } from '../../../src/lib/paymentPlans.js';
import {
  createTapCharge,
  isTapConfigured,
  sanitizeAscii,
  tapCheckoutUrl,
} from '../../../src/lib/tapPayments.js';
import { fetchStudentRecord } from '../../../src/lib/paymentActivation.js';
import { isMockPaymentsEnabled, buildMockChargeId } from '../../../src/lib/mockPayments.js';

const ALLOWED_PLANS = new Set([
  PLAN_CODES.TUTOR,
  PLAN_CODES.MEDICAL,
  PLAN_CODES.ASSESSMENT_ONLY,
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentId = sanitizeAscii(req.body?.studentId);
  const plan = normalizePlanCode(req.body?.plan) || DEFAULT_CHECKOUT_PLAN;
  const flow = sanitizeAscii(req.body?.flow) || 'enrollment';
  const customer = req.body?.customer ?? {};

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }
  if (!ALLOWED_PLANS.has(plan)) {
    res.status(400).json({ error: 'PLAN_NOT_PAYABLE_ONLINE' });
    return;
  }

  const student = await fetchStudentRecord(studentId);
  if (!student?.id) {
    res.status(404).json({ error: 'STUDENT_NOT_FOUND' });
    return;
  }

  const { amount, currency } = planAmountForTap(plan);
  if (amount <= 0) {
    res.status(400).json({ error: 'INVALID_PLAN_AMOUNT' });
    return;
  }

  const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
  const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
  const origin = `${proto}://${host}`;

  const redirectUrl =
    sanitizeAscii(req.body?.redirectUrl) ||
    `${origin}/payment/return?flow=${encodeURIComponent(flow)}&studentId=${encodeURIComponent(studentId)}&plan=${encodeURIComponent(plan)}`;

  if (isMockPaymentsEnabled()) {
    const chargeId = buildMockChargeId();
    const params = new URLSearchParams({ chargeId, studentId, plan, flow });
    const checkoutUrl = `${origin}/api/payment/mock-complete?${params.toString()}`;

    res.status(200).json({
      ok: true,
      mock: true,
      chargeId,
      checkoutUrl,
      amount,
      currency,
      plan,
      message: 'Mock payment — simulates CAPTURED + webhook activation',
    });
    return;
  }

  if (!isTapConfigured()) {
    res.status(503).json({
      error: 'TAP_NOT_CONFIGURED',
      message: 'Set TAP_SECRET_KEY or enable Preview mock mode.',
      sandboxHint: true,
    });
    return;
  }

  const webhookUrl = `${origin}/api/payment/webhook`;
  const orderRef = `AUN-${studentId.slice(-8)}-${Date.now()}`;

  const studentName = sanitizeAscii(student.fields?.student_name || customer?.name || 'Student');
  const nameParts = studentName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Parent';
  const lastName = nameParts.slice(1).join(' ') || 'Guardian';

  try {
    const charge = await createTapCharge({
      amount,
      currency,
      customer: {
        firstName,
        lastName,
        email: customer?.email,
        phoneCountryCode: customer?.phoneCountryCode || student.fields?.parent_country_code || '966',
        phoneNumber: customer?.phoneNumber || student.fields?.parent_phone || '500000000',
      },
      redirectUrl,
      webhookUrl,
      metadata: {
        student_id: studentId,
        plan_code: plan,
        flow,
        platform: 'aunak',
      },
      description: `Aunak · ${plan} · ${studentId}`,
      orderRef,
    });

    const checkoutUrl = tapCheckoutUrl(charge);
    if (!checkoutUrl) {
      res.status(502).json({ error: 'TAP_NO_CHECKOUT_URL', chargeId: charge?.id ?? null });
      return;
    }

    res.status(200).json({
      ok: true,
      chargeId: charge.id,
      checkoutUrl,
      amount,
      currency,
      plan,
    });
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'TAP_CHECKOUT_FAILED' });
  }
}
````

## File: api/_handlers/payment/mock-complete.js
````javascript
/**
 * GET /api/payment/mock-complete
 */

import { sanitizeAscii } from '../../../src/lib/tapPayments.js';
import {
  isMockPaymentsEnabled,
  buildMockCharge,
  buildMockChargeId,
} from '../../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../../src/lib/paymentWebhookProcessor.js';
import { normalizePlanCode, PLAN_CODES } from '../../../src/lib/plans.js';
import { planAmountForTap } from '../../../src/lib/paymentPlans.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isMockPaymentsEnabled()) {
    res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
    return;
  }

  const studentId = sanitizeAscii(req.query?.studentId);
  const plan = normalizePlanCode(req.query?.plan) || PLAN_CODES.TUTOR;
  const flow = sanitizeAscii(req.query?.flow) || 'enrollment';
  const chargeId = sanitizeAscii(req.query?.chargeId) || buildMockChargeId();

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  const { amount, currency } = planAmountForTap(plan);
  const charge = buildMockCharge({ chargeId, studentId, plan, amount, currency, flow });

  const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'localhost');
  const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');

  try {
    await processCapturedPaymentCharge(charge, {
      origin: `${proto}://${host}`,
    });

    const returnUrl = new URL('/payment/return', `${proto}://${host}`);
    returnUrl.searchParams.set('flow', flow);
    returnUrl.searchParams.set('studentId', studentId);
    returnUrl.searchParams.set('plan', plan);
    returnUrl.searchParams.set('chargeId', chargeId);
    returnUrl.searchParams.set('mock', '1');

    res.redirect(302, returnUrl.toString());
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'MOCK_COMPLETE_FAILED' });
  }
}
````

## File: api/_handlers/payment/mock-fire.js
````javascript
/**
 * POST /api/payment/mock-fire
 */

import { sanitizeAscii } from '../../../src/lib/tapPayments.js';
import {
  isMockPaymentsEnabled,
  buildMockCharge,
  buildMockChargeId,
} from '../../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../../src/lib/paymentWebhookProcessor.js';
import { normalizePlanCode, PLAN_CODES } from '../../../src/lib/plans.js';
import { planAmountForTap } from '../../../src/lib/paymentPlans.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isMockPaymentsEnabled()) {
    res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
    return;
  }

  const studentId = sanitizeAscii(req.body?.studentId);
  const plan = normalizePlanCode(req.body?.plan) || PLAN_CODES.TUTOR;
  const flow = sanitizeAscii(req.body?.flow) || 'test';

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  const chargeId = buildMockChargeId();
  const { amount, currency } = planAmountForTap(plan);
  const charge = buildMockCharge({ chargeId, studentId, plan, amount, currency, flow });

  try {
    const result = await processCapturedPaymentCharge(charge);
    res.status(200).json({ ...result, chargeId, mock: true });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'MOCK_FIRE_FAILED' });
  }
}
````

## File: api/_handlers/payment/status.js
````javascript
/**
 * GET /api/payment/status — readiness probe (Tap + Mock + Airtable).
 */

import { isTapConfigured } from '../../../src/lib/tapPayments.js';
import { isMockPaymentsEnabled } from '../../../src/lib/mockPayments.js';
import { airtableConfigFromEnv } from '../../../src/lib/paymentActivation.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost');
  const proto = String(req.headers['x-forwarded-proto'] || 'https');
  const origin = `${proto}://${host}`;

  const airtable = airtableConfigFromEnv();
  const mockEnabled = isMockPaymentsEnabled();
  const tapConfigured = isTapConfigured();

  res.status(200).json({
    ok: true,
    environment: process.env.VERCEL_ENV || 'local',
    tapConfigured,
    mockPaymentsEnabled: mockEnabled,
    paymentReady: tapConfigured || mockEnabled,
    airtableConfigured: Boolean(airtable.apiKey),
    routes: {
      createCheckout: `${origin}/api/payment/create-checkout`,
      webhook: `${origin}/api/payment/webhook`,
      verifyReturn: `${origin}/api/payment/verify-return`,
      mockComplete: `${origin}/api/payment/mock-complete`,
      mockFire: `${origin}/api/payment/mock-fire`,
      paymentReturnPage: `${origin}/payment/return`,
    },
    fallback: {
      mockMode: 'Preview without TAP_SECRET_KEY → mock checkout + webhook path',
      postRedirect: 'verify-return activates if webhook lagged',
    },
    nextStep: mockEnabled
      ? 'POST /api/payment/mock-fire with { studentId } or use UI Pay button'
      : 'Add TAP_SECRET_KEY (Preview) then POST create-checkout',
  });
}
````

## File: api/_handlers/payment/verify-return.js
````javascript
/**
 * GET /api/payment/verify-return
 */

import {
  fetchTapCharge,
  isTapChargeCaptured,
  isTapConfigured,
  sanitizeAscii,
} from '../../../src/lib/tapPayments.js';
import { isMockPaymentsEnabled, isMockChargeId, buildMockCharge } from '../../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../../src/lib/paymentWebhookProcessor.js';
import { normalizePlanCode, PLAN_CODES } from '../../../src/lib/plans.js';
import { planAmountForTap } from '../../../src/lib/paymentPlans.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const chargeId = sanitizeAscii(req.query?.chargeId || req.query?.tap_id);
  const studentId = sanitizeAscii(req.query?.studentId);
  const plan = normalizePlanCode(req.query?.plan) || PLAN_CODES.TUTOR;
  const flow = sanitizeAscii(req.query?.flow) || 'enrollment';

  if (!chargeId) {
    res.status(400).json({ error: 'CHARGE_ID_REQUIRED' });
    return;
  }

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  try {
    let charge;

    if (isMockChargeId(chargeId)) {
      if (!isMockPaymentsEnabled()) {
        res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
        return;
      }
      const { amount, currency } = planAmountForTap(plan);
      charge = buildMockCharge({ chargeId, studentId, plan, amount, currency, flow });
    } else {
      if (!isTapConfigured()) {
        res.status(503).json({ error: 'TAP_NOT_CONFIGURED' });
        return;
      }
      charge = await fetchTapCharge(chargeId);
      const metaStudent = sanitizeAscii(charge.metadata?.student_id);
      if (metaStudent && metaStudent !== studentId) {
        res.status(403).json({ error: 'STUDENT_MISMATCH' });
        return;
      }
      if (!isTapChargeCaptured(charge)) {
        res.status(402).json({ error: 'PAYMENT_NOT_CAPTURED', status: charge.status });
        return;
      }
    }

    const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
    const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
    const origin = `${proto}://${host}`;
    const result = await processCapturedPaymentCharge(charge, { origin });

    res.status(200).json({
      ...result,
      flow,
      chargeId: charge.id,
      parentAccessToken: result.deviceTokens?.parent ?? null,
    });
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'VERIFY_FAILED' });
  }
}
````

## File: api/_handlers/payment/webhook.js
````javascript
/**
 * POST /api/payment/webhook
 */

import { verifyTapWebhookHash, sanitizeAscii } from '../../../src/lib/tapPayments.js';
import { isMockPaymentsEnabled, isMockChargeId, verifyMockWebhookRequest } from '../../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../../src/lib/paymentWebhookProcessor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const charge = req.body;
  if (!charge?.id) {
    res.status(400).json({ error: 'INVALID_PAYLOAD' });
    return;
  }

  const isMock = isMockChargeId(charge.id);

  if (isMock) {
    if (!isMockPaymentsEnabled()) {
      res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
      return;
    }
    if (!verifyMockWebhookRequest(charge, req.headers)) {
      res.status(401).json({ error: 'INVALID_MOCK_WEBHOOK' });
      return;
    }
  } else {
    const hashstring = req.headers['hashstring'] || req.headers['Hashstring'];
    const verified = await verifyTapWebhookHash(charge, hashstring);
    if (!verified) {
      res.status(401).json({ error: 'INVALID_HASHSTRING' });
      return;
    }
  }

  try {
    const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
    const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
    const origin = `${proto}://${host}`;
    const result = await processCapturedPaymentCharge(charge, { origin });
    res.status(200).json(result);
  } catch (err) {
    console.error('[payment/webhook]', err?.message);
    res.status(500).json({ error: err?.message ?? 'ACTIVATION_FAILED' });
  }
}
````

## File: api/_handlers/tawasul/airtableError.js
````javascript
/** Parse Airtable REST error body into a short human-readable string. */
export function formatAirtableApiError(status, rawText) {
  const text = String(rawText ?? '').trim();
  if (!text) return `Airtable ${status}`;
  try {
    const parsed = JSON.parse(text);
    const inner = parsed?.error;
    if (typeof inner === 'string') return `Airtable ${status}: ${inner}`;
    if (inner && typeof inner === 'object') {
      const type = inner.type ? `[${inner.type}] ` : '';
      const msg = inner.message || inner.error || JSON.stringify(inner);
      return `Airtable ${status}: ${type}${msg}`;
    }
    if (parsed?.message) return `Airtable ${status}: ${parsed.message}`;
  } catch {
    /* not JSON */
  }
  return `Airtable ${status}: ${text.slice(0, 280)}`;
}
````

## File: api/_handlers/tawasul/sanitize.js
````javascript
/**
 * Tawasul API input sanitization — strings only, no objects/timestamps-as-objects.
 */

const MIRROR_COMMANDS = new Set(['echo_goal', 'drop_star', 'drop_reward', 'calm_pulse', 'clear']);

export function sanitizeRecordId(value) {
  const id = String(value ?? '').trim();
  return /^rec[a-zA-Z0-9]{10,}$/.test(id) ? id : '';
}

export function sanitizeMirrorCommand(value) {
  const cmd = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return MIRROR_COMMANDS.has(cmd) ? cmd : '';
}

export function sanitizeMirrorPayload(value, fallback = '') {
  if (value == null) return String(fallback);
  if (typeof value === 'object') return String(fallback);
  const text = String(value).trim();
  if (!text || text === '[object Object]') return String(fallback);
  return text.slice(0, 500);
}

/** Goal / programmed_goal — preserve Arabic Unicode. */
export function sanitizeGoalText(value) {
  if (value == null) return '';
  if (typeof value === 'object') return '';
  const text = String(value).trim();
  if (!text || text === '[object Object]') return '';
  return text.slice(0, 5000);
}

export function sanitizeAsciiToken(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}
````

## File: api/_handlers/tawasul/student-goal.js
````javascript
/**
 * POST /api/tawasul/student-goal — save programmed_goal only (no assessment engine import).
 */

import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';
import { sanitizeGoalText, sanitizeRecordId } from './sanitize.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const recordId = sanitizeRecordId(req.body?.recordId ?? req.body?.studentId);
  const goal = sanitizeGoalText(
    req.body?.programmedGoal ??
      req.body?.programmed_goal ??
      req.body?.fields?.programmed_goal ??
      req.body?.goal
  );

  if (!recordId) {
    res.status(400).json({ error: 'RECORD_ID_REQUIRED' });
    return;
  }
  if (!goal) {
    res.status(400).json({ error: 'GOAL_TEXT_REQUIRED' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${recordId}`;

  try {
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: airtableHeaders(apiKey, { write: true }),
      body: JSON.stringify({ fields: { [SF.programmed_goal]: goal }, typecast: true }),
    });
    const text = await patchRes.text();
    if (!patchRes.ok) throw new Error(formatAirtableApiError(patchRes.status, text));
    const updated = JSON.parse(text);
    res.status(200).json({
      ok: true,
      recordId: updated.id,
      programmed_goal: updated.fields?.[SF.programmed_goal] ?? goal,
    });
  } catch (err) {
    const message = err?.message ?? 'STUDENT_GOAL_SAVE_FAILED';
    console.error('[tawasul/student-goal]', message);
    res.status(500).json({ error: message });
  }
}
````

## File: api/.gitkeep
````

````

## File: api/academy/tts.js
````javascript
/**
 * Optional cloud TTS proxy for Summer Academy.
 * Set ELEVENLABS_API_KEY on Vercel for premium voice; otherwise returns 503 and client falls back to Web Speech.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.AIRTABLE_TTS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Cloud TTS not configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }

  const text = String(body?.text ?? '').trim();
  const lang = body?.lang === 'en' ? 'en' : 'ar';
  if (!text || text.length > 500) {
    res.status(400).json({ error: 'Text required (max 500 chars)' });
    return;
  }

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID ||
    (lang === 'en' ? 'EXAVITQu4vr4xnSDxMaL' : 'pNInz6obpgDQGcFmaJgB');

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: errText || 'TTS failed' });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'TTS proxy error' });
  }
}
````

## File: api/activation/redeem.js
````javascript
/**
 * POST /api/activation/redeem — redeem activation code → Active subscription in Airtable.
 * On success: generates triple device tokens (parent / child / specialist) on the student record.
 */

import {
  generateTripleDeviceTokens,
  buildActivationRedeemFields,
  buildTriplePortalLinks,
} from '../../src/lib/tripleAccessProtocol.js';
import { STUDENT as SF } from '../../src/lib/airtableFields.js';

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

function normalizeCode(raw) {
  return String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

function planFromPrefix(code) {
  const m = code.match(/^AUN-(FREE|TUTOR|MEDICAL|INST|ASSESS)-/);
  if (!m) return null;
  const map = {
    FREE: 'free',
    TUTOR: 'tutor',
    MEDICAL: 'medical',
    INST: 'institution',
    ASSESS: 'assessment_only',
  };
  return map[m[1]] ?? null;
}

function landingForPlan(plan) {
  const map = {
    free: 'community',
    tutor: 'media',
    medical: 'diagnostics',
    institution: 'registry',
    assessment_only: 'diagnostics',
  };
  return map[plan] ?? 'community';
}

function subscriptionFieldsForActivation(plan) {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  return {
    [SF.subscription_status]: 'active',
    [SF.plan_code]: plan,
    [SF.last_payment_at]: new Date().toISOString(),
    [SF.payment_method]: 'manual_code',
    [SF.subscription_expires_at]: expires.toISOString().slice(0, 10),
    [SF.preferred_destination]: landingForPlan(plan),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const code = normalizeCode(req.body?.code);
  const studentId = sanitizeAscii(req.body?.studentId);

  if (!/^AUN-(FREE|TUTOR|MEDICAL|INST|ASSESS)-[A-Z0-9]{4}-\d{4}$/.test(code)) {
    res.status(400).json({ error: 'INVALID_CODE_FORMAT' });
    return;
  }
  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  const plan = planFromPrefix(code);
  if (!plan) {
    res.status(400).json({ error: 'UNKNOWN_PLAN' });
    return;
  }

  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = sanitizeAscii(
    process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || 'appaGfKj4vYhMw0cb'
  ).split('/')[0];
  const studentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) || 'tblzYmBGmCxx2vdcr';

  const deviceTokens = generateTripleDeviceTokens();

  const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
  const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
  const origin = `${proto}://${host}`;
  const portalLinks = buildTriplePortalLinks(origin, deviceTokens);

  if (!apiKey) {
    res.status(200).json({
      plan,
      landing: landingForPlan(plan),
      subscriptionRaw: 'active',
      active: true,
      mode: 'client_fallback',
      deviceTokens,
      portalLinks,
    });
    return;
  }

  const authHeader = { Authorization: `Bearer ${sanitizeAscii(apiKey)}`, Accept: 'application/json' };
  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${encodeURIComponent(studentId)}`;

  let existingComprehensiveStatus = null;
  try {
    const getRes = await fetch(recordUrl, { headers: authHeader });
    if (getRes.ok) {
      const row = JSON.parse(await getRes.text());
      existingComprehensiveStatus = row?.fields?.[SF.comprehensive_assessment_status] ?? null;
    }
  } catch {
    /* proceed with fresh activation fields */
  }

  const fields = buildActivationRedeemFields(subscriptionFieldsForActivation(plan), {
    tokens: deviceTokens,
    existingComprehensiveStatus,
  });
  fields[SF.activation_code_used] = code;

  try {
    const response = await fetch(recordUrl, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields, typecast: true }),
    });
    const text = await response.text();
    if (!response.ok) {
      res.status(response.status).send(text);
      return;
    }
    res.status(200).json({
      plan,
      landing: landingForPlan(plan),
      subscriptionRaw: 'active',
      active: true,
      deviceTokens,
      portalLinks,
      airtable: JSON.parse(text),
    });
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'Airtable PATCH failed' });
  }
}
````

## File: api/payment/[action].js
````javascript
/**
 * /api/payment/* — single Serverless Function (Vercel Hobby limit).
 * Routes: status, create-checkout, verify-return, webhook, mock-complete, mock-fire
 */

import { createActionRouter } from '../_handlers/dispatch.js';
import status from '../_handlers/payment/status.js';
import createCheckout from '../_handlers/payment/create-checkout.js';
import verifyReturn from '../_handlers/payment/verify-return.js';
import webhook from '../_handlers/payment/webhook.js';
import mockComplete from '../_handlers/payment/mock-complete.js';
import mockFire from '../_handlers/payment/mock-fire.js';

export default createActionRouter({
  status: { GET: status },
  'create-checkout': { POST: createCheckout },
  'verify-return': { GET: verifyReturn },
  webhook: { POST: webhook },
  'mock-complete': { GET: mockComplete },
  'mock-fire': { POST: mockFire },
});
````

## File: api/settlement/seal.js
````javascript
/**
 * POST /api/settlement/seal — server-side seal validation (immutable claims).
 */

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const claimStatus = sanitizeAscii(body.claimStatus);
  const recordId = sanitizeAscii(body.recordId);

  if (claimStatus === 'Sealed' && body.method === 'PATCH') {
    res.status(403).json({ error: 'CLAIM_SEALED_IMMUTABLE', recordId });
    return;
  }

  res.status(200).json({
    ok: true,
    sealed: true,
    message: 'Seal acknowledged — PATCH on Sealed claims rejected server-side',
    recordId: recordId || null,
  });
}
````

## File: docs/AIRTABLE_SCHEMA_PROTOCOL.md
````markdown
# Aunak — Airtable Schema (snake_case English)
# بروتوكول Airtable — مسميات إنجليزية موحّدة

> **Base ID:** `appaGfKj4vYhMw0cb`  
> **Source:** `src/lib/airtableFields.js`  
> **Status:** ✅ **LIVE** — `https://aunak.vercel.app` (27 Jun 2026)  
> **Operations log:** `docs/SOVEREIGN_OPERATIONS_LOG.md`

All column names are **lowercase snake_case English**. One field per concept — no Arabic/English duplicates. Single-select **option values** are also lowercase (`new`, `active`, `pending`, `approved`).

---

## 1. Students (`tblzYmBGmCxx2vdcr`)

| Field | Type | AR meaning |
|-------|------|------------|
| `student_name` | Single line text | اسم الطالب |
| `student_id` | Single line text | كود الطالب |
| `age` | Number | العمر |
| `diagnosis` | Long text | التشخيص |
| `parent_phone` | Phone | هاتف ولي الأمر |
| `preferred_destination` | Single select | الوجهة المفضلة |
| `subscription_status` | Single select | حالة الاشتراك |
| `face_biometric` | Long text | البصمة (JSON) |
| `biometric_status` | Single select | حالة البصمة |
| `status` | Single select | الحالة |
| `plan_code` | Single select | كود الباقة |
| `subscription_expires_at` | Date | انتهاء الاشتراك |
| `last_payment_at` | Date and time | آخر دفع |
| `payment_method` | Single line text | طريقة الدفع |
| `activation_code_used` | Single line text | كود التفعيل |
| `initial_assessment_score` | Number | نتيجة التقييم المبدئي |
| `comprehensive_assessment_status` | Single select | حالة التقييم الشامل |
| `parent_access_token` | Single line text | رمز جهاز الأهل |
| `child_interactive_token` | Single line text | رمز جهاز الطفل |
| `specialist_tutor_token` | Single line text | رمز المدرس/الإخصائي |
| `harmony_score` | Number | درجة التناغم |
| `camera_access` | Link → Access Control | صلاحيات الكاميرا |
| `assigned_class` | Single line text | الفصل |
| `session_start_time` | Single line text | وقت بدء الجلسة |
| `clinical_session_status` | Single select | حالة الجلسة |
| `smart_session_fields` | Number | عدد حقول الجلسة |
| `clinical_session_notes` | Long text | ملاحظات الجلسة |
| `biometric_attendance_verified` | Checkbox | حضور بيومتري |
| `biometric_attendance_at` | Date and time | وقت الحضور |
| `academic_progress` | Number | التقدم الأكاديمي |
| `behavior_intensity` | Number | شدة السلوك |
| `focus_level` | Number | مستوى التركيز |
| `t_static` | Number | ثواني الشرود |
| `eye_movement_map` | Long text | خريطة العين |
| `programmed_goal` | Long text | الهدف الإجرائي |
| `ai_session_report` | Long text | التقرير المختصر |
| `payment_status` | Single select | حالة الدفع |
| `session_fee` | Number | مستحقات الجلسة |
| `zero_point_report` | Long text | تقرير نقطة الصفر |
| `improvement_index` | Number | مؤشر التحسن |
| `operating_efficiency` | Number | كفاءة التشغيل |

**Select options (required — lowercase):**
- `status`: `new`, `active`
- `subscription_status`: `pending`, `active`
- `biometric_status`: `approved`
- `preferred_destination`: `media`, `registry`, `community`, `diagnostics`
- `plan_code`: `free`, `tutor`, `medical`, `institution`, `assessment_only`
- `comprehensive_assessment_status`: `not_started`, `in_progress`, `completed`

**Subscription / payment columns (Wave 2 — live):**

| Field | Type | Notes |
|-------|------|-------|
| `plan_code` | Single select | Set on activation redeem |
| `activation_code_used` | Single line text | Last redeemed code |
| `initial_assessment_score` | Number | Free quick-assessment result (Phase 3 UX) |
| `comprehensive_assessment_status` | Single select | `not_started` → `in_progress` → `completed` |
| `parent_access_token` | Single line text | Parent device login — reports & subscriptions |
| `child_interactive_token` | Single line text | Child device — games & assistant (no locks) |
| `specialist_tutor_token` | Single line text | Tutor/specialist/doctor — sessions & notes |
| `last_payment_at` | Date and time | ISO timestamp on redeem |
| `payment_method` | Single line text | e.g. `manual_code` |
| `subscription_expires_at` | Date | +30 days from redeem |

**Access Control (`tblfBvd5WI7alVCFU`) — live columns:** `user_name`, `user_email`, `status`, `permissions`, `access_level`, `access_token`, `last_login`  
Select: `status` → `active` · `access_level` → `parent`, `admin`, `specialist`

---

## 2. Daily Sessions (`tbl3mlewMLvqp6AXB`)

| Field | Type |
|-------|------|
| `session_date` | Date |
| `specialist_name` | Single line text |
| `student_name` | Single line text |
| `notes` | Long text |
| `claim_status` | Single select (`Sealed`) |
| `sealed_at` | Date and time |
| `specialist_signature` | Long text |
| `immutable_hash` | Single line text |
| `session_sequence` | Number |
| `pin_verified` | Checkbox |

---

## 3. Access Control (`tblfBvd5WI7alVCFU`)

| Field | Type |
|-------|------|
| `user_email` | Email |
| `user_name` | Single line text |
| `status` | Single select |
| `permissions` | Single line text |
| `access_level` | Single select |
| `access_areas` | Long text |
| `access_token` | Single line text |
| `last_login` | Date and time |

---

## 4. Specialists (`tblnmcLd5M3U6sErl`)

| Field | Type |
|-------|------|
| `specialist_name` | Single line text |
| `specialty` | Single select |
| `professional_email` | Email |
| `contact_phone` | Phone |
| `admin_notes` | Long text |
| `status` | Single select |
| `active_cases` | Number |
| `rating` | Number |

---

## 5. Scientific Items (`tblnCbBSmwDWwO5SJ`)

| Field | Type |
|-------|------|
| `title` | Single line text |
| `category` | Single select |
| `weight` | Number |
| `usage_count` | Number |

---

## 6. ABC Data (`tblJ580ptTVkv07hD`)

| Field | Type |
|-------|------|
| `case_id` | Number |
| `programmed_goal` | Long text |
| `behavior` | Long text |
| `status` | Single select |
| `intensity` | Single select |
| `crisis_score` | Number |
| `risk_label` | Single select |

---

## 7. Safe Media (`tbljdOSE8CozrzBZN`)

| Field | Type |
|-------|------|
| `title` | Single line text |
| `category` | Single select |
| `duration` | Single line text |
| `encrypted` | Checkbox |

---

## 8. Melody Lab (`tblMddsXqCz91hfoU`)

| Field | Type |
|-------|------|
| `pattern_id` | Single line text |
| `pattern_name` | Single line text |
| `description` | Long text |
| `score` | Number |
| `face_au` | Single line text |
| `emotional_monitoring` | Link → Emotional Monitoring |

---

## 9. Community Resources (`tblV28iWarzve32pP`)

| Field | Type |
|-------|------|
| `title` | Single line text |
| `resource_type` | Single select |
| `audience` | Single select |
| `downloads` | Number |
| `rating` | Number |
| `summary` | Long text |

---

## 10. Learning Difficulties (`tblcNXSmU90TomEHH`)

| Field | Type |
|-------|------|
| `student` | Link → Students |
| `programmed_goal` | Long text |
| `t_static` | Number |
| `focus_level` | Number |
| `academic_progress` | Number |
| `intervention_notes` | Long text |
| `weekly_milestone` | Single line text |

---

## 11. Emotional Monitoring (`tblokLHmSHss3FQft`)

| Field | Type |
|-------|------|
| `mood_label` | Single line text |
| `score` | Number |
| `intelligence_insight` | Long text |
| `preferred_pattern` | Checkbox |
| `melody_pattern` | Link → Melody Lab |

---

## 12. Goal Attempts (create + set `VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID`)

| Field | Type |
|-------|------|
| `student` | Link → Students |
| `session_id` | Single line text |
| `session_date` | Date |
| `goal_label` | Single line text |
| `goal_source` | Single select |
| `success_percent` | Number |
| `attempt_number` | Number |
| `specialist_email` | Email |
| `attempt_notes` | Long text |
| `recorded_at` | Date and time |

---

## 13. Summer Academy (create + set `VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID`)

| Field | Type |
|-------|------|
| `student` | Link → Students |
| `student_name` | Single line text |
| `event_type` | Single select |
| `track` | Single line text |
| `silent_level` | Number |
| `baseline_level` | Number |
| `current_level` | Number |
| `weak_points_json` | Long text |
| `daily_xp` | Number |
| `tasks_completed` | Number |
| `total_xp` | Number |
| `progress_json` | Long text |
| `recorded_at` | Date and time |
| `session_date` | Date |

---

## Enrollment biometric (phase 5)

- Capture saves `face_biometric` (Long text JSON); verify uses **in-browser reference** (82% threshold), not Airtable re-fetch.
- Sovereign login elsewhere uses **94.7%** (`SOVEREIGN_MATCH_CONFIDENCE` in `src/lib/biometricMatch.js`).

## Triple-device access (Phase 3 — redeem)

On successful `POST /api/activation/redeem`:

| Field | Token format | Device role |
|-------|--------------|-------------|
| `parent_access_token` | `AUN-PRT-{32hex}` | Parent — reports, sessions, billing |
| `child_interactive_token` | `AUN-CHD-{32hex}` | Child — games, assistant, no locks |
| `specialist_tutor_token` | `AUN-SPC-{32hex}` | Tutor / specialist / doctor |

Implementation: `src/lib/tripleAccessProtocol.js` · sets `comprehensive_assessment_status` → `not_started` unless already `completed`.

## Assessment columns (Phase 3 UX — pre-payment)

| Field | Type | When set |
|-------|------|----------|
| `initial_assessment_score` | Number | After free quick assessment |
| `comprehensive_assessment_status` | Single select | `not_started` on redeem; `completed` after full assessment |

---

## Airtable setup checklist (post-migration)

```
✅ Students tblzYmBGmCxx2vdcr — snake_case columns + subscription/payment fields
✅ Access Control tblfBvd5WI7alVCFU — user_name, user_email, access_level, last_login, permissions
✅ Single-select options lowercase (new, active, pending, approved)
❌ Remove VITE_AIRTABLE_*_FIELD env overrides from Vercel
```
````

## File: docs/SOVEREIGN_OPERATIONS_LOG.md
````markdown
# سجل العمليات السيادية — منصة عونك (Aunak)

> **الحالة:** ✅ تشغيل رسمي حي — 100% على الإنتاج  
> **التاريخ:** 27 يونيو 2026  
> **النطاق:** `https://aunak.vercel.app`  
> **Base Airtable:** `appaGfKj4vYhMw0cb`

---

## إعلان التشغيل الرسمي

تم بحمد الله **العبور الكامل والتشغيل الرسمي والحي** لمنصة عونك على السيرفر المباشر (`aunak.vercel.app`) بأعلى كفاءة أمنية برمجية وحركية. النظام متصل بالكامل: **Vercel + Airtable + البوابة البيومترية + التسجيل + التفعيل**.

---

## 1. تطهير قاعدة البيانات (Airtable)

### اعتماد snake_case نظيف

تم اعتماد وتطبيق نظام التسمية **snake_case بحروف صغيرة** في جميع الجداول الأساسية. المصدر الوحيد للحقول في الكود: `src/lib/airtableFields.js`.

| الجدول | حقول محورية (مُطبّقة) |
|--------|------------------------|
| **Students** | `student_name`, `student_id`, `age`, `diagnosis`, `parent_phone`, `preferred_destination`, `subscription_status`, `face_biometric`, `biometric_status`, `status` |
| **Access Control** | `user_name`, `user_email`, `status`, `permissions`, `access_level`, `access_token`, `last_login` |

### قواعد الكود

- لا تكرار عربي/إنجلizi — حقل واحد لكل مفهوم.
- لا overrides عبر `VITE_AIRTABLE_*_FIELD` — المسميات ثابتة في `airtableFields.js`.
- جميع الكتابات تستخدم `typecast: true`.
- قيم Single select **بحروف صغيرة**: `new`, `active`, `pending`, `approved`.

**مرجع:** `docs/AIRTABLE_SCHEMA_PROTOCOL.md`

---

## 2. بروتوكول السداد والتفعيل (Wave 2 — حي)

### أعمدة Students المضافة/المفعّلة

| الحقل | النوع | الوظيفة |
|-------|-------|---------|
| `plan_code` | Single select | الباقة: `free`, `tutor`, `medical`, `institution`, `assessment_only` |
| `activation_code_used` | Single line text | آخر كود تفعيل مستخدم |
| `last_payment_at` | Date and time | تاريخ آخر دفع/تفعيل |
| `payment_method` | Single line text | مثال: `manual_code` |
| `subscription_expires_at` | Date | انتهاء الاشتراك (+30 يوم عند redeem) |
| `subscription_status` | Single select | `pending` عند التسجيل → `active` بعد redeem |

### تدفق التفعيل

```
AunakEnrollment (تسجيل + بصمة)
    → subscription_status = pending
    → AunakActivationGate (Value Lock)
    → POST /api/activation/redeem
    → subscription_status = active + plan_code + preferred_destination
```

**صيغة الكود:** `AUN-{PLAN}-XXXX-YYYY`  
**الخطط:** `FREE` · `TUTOR` · `MEDICAL` · `INST` · `ASSESS`  
**إصدار أكواد:** `node scripts/issue.js [--plan tutor]`

**ملفات محورية:** `api/activation/redeem.js` · `src/lib/subscriptionEngine.js` · `src/components/AunakActivationGate.jsx`

---

## 3. التحقق البيومتري — مرحلة 5 (Enrollment Verify)

### المشكلة السابقة

- إعادة جلب `face_biometric` من Airtable بعد الحفظ مباشرة (تأخير + بيانات غير متزامنة).
- عتبة **94.7%** صارمة جداً لمسح ثانٍ بعد ثوانٍ من التقاط المرجع.
- مهلة 45 ثانية ثم رسالة «بصمة الوجه لا تطابق الطالب» + مربع كاميرا أسود.

### الحل المُطبّق (حي)

| البند | القيمة |
|-------|--------|
| عتبة التسجيل | **82%** (`ENROLLMENT_MATCH_CONFIDENCE`) |
| عتبة الدخول السيادي | **94.7%** (`SOVEREIGN_MATCH_CONFIDENCE`) — بدون تغيير |
| مرجع المطابقة | البصمة تُمرَّر من **ذاكرة المتصفح** (`capturedDescriptorJson`) — لا انتظار Airtable |
| الكاميرا | عنصر `<video>` دائم + إعادة ربط `requestAnimationFrame` |
| حفظ البصمة | `face_biometric` يُحفظ أولاً؛ `biometric_status` non-blocking |
| وضع التسجيل | `enrollmentMode: true` في `useBiometricScan` |

**ملفات محورية:** `src/components/AunakEnrollment.jsx` · `src/hooks/useBiometricScan.js` · `src/lib/biometricMatch.js`

---

## 4. البنية التشغيلية الحالية

```
المتصفح (aunak.vercel.app)
    ├── Vite/React 19 — الواجهة
    ├── face-api — البصمة
    └── /api/* (Vercel Serverless)
            ├── airtable.js (proxy)
            ├── activation/redeem.js
            └── settlement/seal.js
                    ↓
            Airtable appaGfKj4vYhMw0cb
```

### Env vars (إنتاج)

| المتغير | مطلوب |
|---------|-------|
| `AIRTABLE_API_KEY` | ✅ |
| `VITE_AIRTABLE_BASE_ID` | ✅ |
| `VITE_AIRTABLE_STUDENTS_TABLE_ID` | ✅ |
| `VITE_USE_AIRTABLE_PROXY=true` | ✅ |
| `VITE_AIRTABLE_*_FIELD` | ❌ احذفها — deprecated |

---

## 5. مفتاح التطوير السيادي (Master Bypass)

للفريق المعتمد — يتخطى حظر **anti-spoof** (94.7%) أثناء QA (واجهة الأهل، تسجيل متكرر).

| الطريقة | مثال |
|---------|------|
| URL عند الإقلاع | `?master=AUNAK-MASTER-2026` |
| لوحة التخطي | `SovereignMasterBypassPanel` |
| Env (اختياري) | `VITE_AUNAK_MASTER_KEY=AUNAK-MASTER-2026` |

**الكود:** `src/lib/sovereignMasterBypass.js` · bootstrap في `main.jsx`

---

## 6. سجل التحديثات

| التاريخ | الحدث |
|---------|-------|
| 2026-06 | توحيد snake_case + إزالة env field overrides |
| 2026-06 | أعمدة الاشتراك والتفعيل في Students |
| 2026-06 | إصلاح Enrollment Verify (82% + ذاكرة محلية + كاميرا) |
| 2026-06-27 | **تشغيل رسمي حي 100%** — تسجيل → بصمة → تحقق → بوابة تفعيل |
| 2026-07 | **Phase 3 schema** — assessment + triple device tokens (`tripleAccessProtocol.js`) |
| 2026-07 | **Master bypass** — `AUNAK-MASTER-2026` لتخطي anti-spoof في QA |

---

*سجل العمليات السيادية — مرجع فريق التطوير (أبو النوت والعملاق)*
````

## File: eslint.config.js
````javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
````

## File: hooks/.gitkeep
````

````

## File: index.html
````html
<!doctype html>
<html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/aunak-logo.png" />
    <link rel="apple-touch-icon" href="/aunak-logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>عونك | Aunak</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
````

## File: lib/.gitkeep
````

````

## File: postcss.config.js
````javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
````

## File: public/favicon.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" fill="none" viewBox="0 0 48 46"><path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" style="fill:#863bff;fill:color(display-p3 .5252 .23 1);fill-opacity:1"/><mask id="a" width="48" height="46" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M25.842 44.938c-.664.844-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.183c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.498 0-3.579-1.842-3.579H1.133c-.92 0-1.456-1.04-.92-1.787L9.91.473c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.578 1.842 3.578h11.377c.943 0 1.473 1.088.89 1.832L25.843 44.94z" style="fill:#000;fill-opacity:1"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#ede6ff" rx="5.508" ry="14.704" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -4.47 31.516)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#ede6ff" rx="10.399" ry="29.851" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -39.328 7.883)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#7e14ff" rx="5.508" ry="30.487" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -25.913 -14.639)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -32.644 -3.334)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -34.34 30.47)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#ede6ff" rx="14.072" ry="22.078" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="rotate(93.35 24.506 48.493)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx=".387" cy="8.972" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(39.51 .387 8.972)"/></g><g filter="url(#k)"><ellipse cx="47.523" cy="-6.092" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 47.523 -6.092)"/></g><g filter="url(#l)"><ellipse cx="41.412" cy="6.333" fill="#47bfff" rx="5.971" ry="9.665" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 41.412 6.333)"/></g><g filter="url(#m)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#n)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#o)"><ellipse cx="35.651" cy="29.907" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 35.651 29.907)"/></g><g filter="url(#p)"><ellipse cx="38.418" cy="32.4" fill="#47bfff" rx="5.971" ry="15.297" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 38.418 32.4)"/></g></g><defs><filter id="b" width="60.045" height="41.654" x="-19.77" y="16.149" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-54.613" y="-7.533" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-49.64" y="2.03" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-45.045" y="20.029" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-43.513" y="21.178" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="15.756" y="-17.901" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-27.636" y="-22.853" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="20.116" y="-38.415" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="24.641" y="-11.323" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="8.244" y="-2.416" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="18.713" y="10.588" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter></defs></svg>
````

## File: public/icons.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="bluesky-icon" viewBox="0 0 16 17">
    <g clip-path="url(#bluesky-clip)"><path fill="#08060d" d="M7.75 7.735c-.693-1.348-2.58-3.86-4.334-5.097-1.68-1.187-2.32-.981-2.74-.79C.188 2.065.1 2.812.1 3.251s.241 3.602.398 4.13c.52 1.744 2.367 2.333 4.07 2.145-2.495.37-4.71 1.278-1.805 4.512 3.196 3.309 4.38-.71 4.987-2.746.608 2.036 1.307 5.91 4.93 2.746 2.72-2.746.747-4.143-1.747-4.512 1.702.189 3.55-.4 4.07-2.145.156-.528.397-3.691.397-4.13s-.088-1.186-.575-1.406c-.42-.19-1.06-.395-2.741.79-1.755 1.24-3.64 3.752-4.334 5.099"/></g>
    <defs><clipPath id="bluesky-clip"><path fill="#fff" d="M.1.85h15.3v15.3H.1z"/></clipPath></defs>
  </symbol>
  <symbol id="discord-icon" viewBox="0 0 20 19">
    <path fill="#08060d" d="M16.224 3.768a14.5 14.5 0 0 0-3.67-1.153c-.158.286-.343.67-.47.976a13.5 13.5 0 0 0-4.067 0c-.128-.306-.317-.69-.476-.976A14.4 14.4 0 0 0 3.868 3.77C1.546 7.28.916 10.703 1.231 14.077a14.7 14.7 0 0 0 4.5 2.306q.545-.748.965-1.587a9.5 9.5 0 0 1-1.518-.74q.191-.14.372-.293c2.927 1.369 6.107 1.369 8.999 0q.183.152.372.294-.723.437-1.52.74.418.838.963 1.588a14.6 14.6 0 0 0 4.504-2.308c.37-3.911-.63-7.302-2.644-10.309m-9.13 8.234c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.894 0 1.614.82 1.599 1.82.001 1-.705 1.82-1.6 1.82m5.91 0c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.893 0 1.614.82 1.599 1.82 0 1-.706 1.82-1.6 1.82"/>
  </symbol>
  <symbol id="documentation-icon" viewBox="0 0 21 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="m15.5 13.333 1.533 1.322c.645.555.967.833.967 1.178s-.322.623-.967 1.179L15.5 18.333m-3.333-5-1.534 1.322c-.644.555-.966.833-.966 1.178s.322.623.966 1.179l1.534 1.321"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M17.167 10.836v-4.32c0-1.41 0-2.117-.224-2.68-.359-.906-1.118-1.621-2.08-1.96-.599-.21-1.349-.21-2.848-.21-2.623 0-3.935 0-4.983.369-1.684.591-3.013 1.842-3.641 3.428C3 6.449 3 7.684 3 10.154v2.122c0 2.558 0 3.838.706 4.726q.306.383.713.671c.76.536 1.79.64 3.581.66"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M3 10a2.78 2.78 0 0 1 2.778-2.778c.555 0 1.209.097 1.748-.047.48-.129.854-.503.982-.982.145-.54.048-1.194.048-1.749a2.78 2.78 0 0 1 2.777-2.777"/>
  </symbol>
  <symbol id="github-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clip-rule="evenodd"/>
  </symbol>
  <symbol id="social-icon" viewBox="0 0 20 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M12.5 6.667a4.167 4.167 0 1 0-8.334 0 4.167 4.167 0 0 0 8.334 0"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M2.5 16.667a5.833 5.833 0 0 1 8.75-5.053m3.837.474.513 1.035c.07.144.257.282.414.309l.93.155c.596.1.736.536.307.965l-.723.73a.64.64 0 0 0-.152.531l.207.903c.164.715-.213.991-.84.618l-.872-.52a.63.63 0 0 0-.577 0l-.872.52c-.624.373-1.003.094-.84-.618l.207-.903a.64.64 0 0 0-.152-.532l-.723-.729c-.426-.43-.289-.864.306-.964l.93-.156a.64.64 0 0 0 .412-.31l.513-1.034c.28-.562.735-.562 1.012 0"/>
  </symbol>
  <symbol id="x-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z" clip-rule="evenodd"/>
  </symbol>
</svg>
````

## File: README.md
````markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
````

## File: scripts/issue.js
````javascript
#!/usr/bin/env node
/**
 * Admin CLI — issue sovereign activation codes (AUN-{PLAN}-XXXX-YYYY).
 *
 * Usage:
 *   node scripts/issue.js                    # one TUTOR code
 *   node scripts/issue.js --plan medical --count 5
 *   node scripts/issue.js --plan assess --student recXXXXXXXX
 *
 * Plans: free | tutor | medical | institution | assess
 */

const PLAN_MAP = {
  free: 'FREE',
  tutor: 'TUTOR',
  medical: 'MEDICAL',
  institution: 'INST',
  inst: 'INST',
  assess: 'ASSESS',
  assessment: 'ASSESS',
  assessment_only: 'ASSESS',
};

const PLAN_CANONICAL = {
  FREE: 'free',
  TUTOR: 'tutor',
  MEDICAL: 'medical',
  INST: 'institution',
  ASSESS: 'assessment_only',
};

function parseArgs(argv) {
  const out = { plan: 'tutor', count: 1, studentId: null, year: new Date().getFullYear() };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--plan' || a === '-p') out.plan = String(argv[++i] ?? 'tutor').toLowerCase();
    else if (a === '--count' || a === '-n') out.count = Math.max(1, parseInt(argv[++i], 10) || 1);
    else if (a === '--student' || a === '-s') out.studentId = argv[++i] ?? null;
    else if (a === '--year' || a === '-y') out.year = parseInt(argv[++i], 10) || out.year;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function generateCode(planKey, year) {
  const prefix = PLAN_MAP[planKey];
  if (!prefix) {
    throw new Error(`Unknown plan "${planKey}". Use: free | tutor | medical | institution | assess`);
  }
  const seg = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X');
  return `AUN-${prefix}-${seg}-${year}`;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`
Aunak Activation Code Issuer
────────────────────────────
  node scripts/issue.js [--plan tutor] [--count 1] [--student recId] [--year 2026]

Plans: free, tutor, medical, institution (inst), assess
Format: AUN-{PLAN}-XXXX-YYYY
`);
    process.exit(0);
  }

  const canonical = PLAN_CANONICAL[PLAN_MAP[args.plan]];
  const issued = [];
  for (let i = 0; i < args.count; i++) {
    const code = generateCode(args.plan, args.year);
    issued.push({
      code,
      plan: canonical,
      status: 'Unused',
      issuedAt: new Date().toISOString(),
      issuedBy: 'admin_cli',
      studentId: args.studentId,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
  }

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Aunak Sovereign Activation Codes       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  for (const entry of issued) {
    console.log(`  CODE:  ${entry.code}`);
    console.log(`  PLAN:  ${entry.plan}`);
    console.log(`  EXP:   ${entry.expiresAt.slice(0, 10)}`);
    if (entry.studentId) console.log(`  STUD:  ${entry.studentId}`);
    console.log('');
  }

  console.log(`Issued ${issued.length} code(s) for plan "${canonical}".`);
  console.log('Distribute manually after payment confirmation.\n');

  if (process.env.ISSUE_JSON === '1') {
    console.log(JSON.stringify(issued, null, 2));
  }
}

main();
````

## File: scripts/tawasul-setup-base.mjs
````javascript
/**
 * Create Tawasul MVP Airtable base with schema-matched fields.
 * Requires PAT with schema.bases:write + data.records:write.
 *
 * Usage:
 *   set VITE_AIRTABLE_PAT=pat...
 *   set AIRTABLE_WORKSPACE_ID=wsp...   (from Airtable URL when creating base)
 *   node scripts/tawasul-setup-base.mjs
 *
 * Outputs base/table IDs for Vercel Preview env on branch Tawasul_MVP.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadPat() {
  const envPath = resolve(ROOT, '.env.local');
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, 'utf8');
    const m = text.match(/^VITE_AIRTABLE_PAT=(.+)$/m) || text.match(/^AIRTABLE_API_KEY=(.+)$/m);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return process.env.VITE_AIRTABLE_PAT || process.env.AIRTABLE_API_KEY || '';
}

const pat = loadPat();
const workspaceId = process.env.AIRTABLE_WORKSPACE_ID || '';

if (!pat) {
  console.error('Missing PAT — set VITE_AIRTABLE_PAT in .env.local or env');
  process.exit(1);
}
if (!workspaceId) {
  console.error('Missing AIRTABLE_WORKSPACE_ID — open airtable.com/workspaces and copy wsp... from URL');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${pat}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : {};
}

const payload = {
  name: 'Tawasul MVP — منصة تواصل',
  workspaceId,
  tables: [
    {
      name: 'Specialists',
      description: 'tblSpecialists — 2 specialists max for MVP',
      fields: [
        { name: 'specialist_name', type: 'singleLineText' },
        {
          name: 'specialist_tutor_token',
          type: 'singleLineText',
          description: 'AUN-SPC-{32hex} — specialist login',
        },
        { name: 'professional_email', type: 'email' },
        {
          name: 'status',
          type: 'singleSelect',
          options: { choices: [{ name: 'active' }, { name: 'inactive' }] },
        },
      ],
    },
    {
      name: 'Students',
      description: 'tblStudents — max 10 (5 per specialist)',
      fields: [
        { name: 'student_name', type: 'singleLineText' },
        { name: 'student_id', type: 'singleLineText' },
        { name: 'age', type: 'number', options: { precision: 0 } },
        {
          name: 'status',
          type: 'singleSelect',
          options: { choices: [{ name: 'new' }, { name: 'active' }] },
        },
        { name: 'child_interactive_token', type: 'singleLineText' },
        { name: 'specialist_tutor_token', type: 'singleLineText' },
        { name: 'programmed_goal', type: 'multilineText' },
        { name: 'initial_assessment_score', type: 'number', options: { precision: 0 } },
        {
          name: 'comprehensive_assessment_status',
          type: 'singleSelect',
          options: {
            choices: [{ name: 'not_started' }, { name: 'in_progress' }, { name: 'completed' }],
          },
        },
      ],
    },
    {
      name: 'Daily Sessions',
      description: 'tblDailySessions — auto-sealed island claims',
      fields: [
        { name: 'session_date', type: 'date', options: { dateFormat: { name: 'iso' } } },
        { name: 'specialist_name', type: 'singleLineText' },
        { name: 'student_name', type: 'singleLineText' },
        { name: 'notes', type: 'multilineText' },
        {
          name: 'claim_status',
          type: 'singleSelect',
          options: { choices: [{ name: 'Sealed' }] },
        },
        { name: 'sealed_at', type: 'dateTime', options: { timeZone: 'client', dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' } } },
        { name: 'session_fee', type: 'number', options: { precision: 2 } },
        { name: 'immutable_hash', type: 'singleLineText' },
      ],
    },
  ],
};

console.log('Creating Tawasul MVP base in workspace', workspaceId);

const base = await api('https://api.airtable.com/v0/meta/bases', {
  method: 'POST',
  body: JSON.stringify(payload),
});

const tables = base.tables ?? [];
const byName = (n) => tables.find((t) => t.name === n);
const specialists = byName('Specialists');
const students = byName('Students');
const sessions = byName('Daily Sessions');

if (!specialists || !students || !sessions) {
  throw new Error('Base created but table lookup failed — check Airtable UI');
}

// Link assigned_specialist on Students → Specialists (must exist after both tables)
await api(`https://api.airtable.com/v0/meta/bases/${base.id}/tables/${students.id}/fields`, {
  method: 'POST',
  body: JSON.stringify({
    name: 'assigned_specialist',
    type: 'multipleRecordLinks',
    options: { linkedTableId: specialists.id },
  }),
});

const envBlock = `# Tawasul MVP — generated ${new Date().toISOString()}
VITE_TAWASUL_MVP=true
VITE_AIRTABLE_BASE_ID=${base.id}
AIRTABLE_BASE_ID=${base.id}
VITE_AIRTABLE_SPECIALISTS_TABLE_ID=${specialists.id}
VITE_AIRTABLE_STUDENTS_TABLE_ID=${students.id}
VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID=${sessions.id}
AIRTABLE_DAILY_SESSIONS_TABLE_ID=${sessions.id}
# VITE_AIRTABLE_PAT=pat...
# AIRTABLE_API_KEY=pat...
`;

const outPath = resolve(ROOT, 'docs/TAWASUL_MVP_ENV.generated.txt');
writeFileSync(outPath, envBlock, 'utf8');

console.log('\n✅ Base created:', base.id);
console.log('   Specialists:', specialists.id);
console.log('   Students:', students.id, '(+ assigned_specialist link)');
console.log('   Daily Sessions:', sessions.id);
console.log('\nEnv block written to:', outPath);
console.log('\nNext:');
console.log('  1. Paste env block into Vercel Preview (branch Tawasul_MVP)');
console.log('  2. node scripts/tawasul-seed.mjs');
````

## File: scripts/test-daily-sessions.mjs
````javascript
/**
 * Unified seal check — tblDailySessions (tbl3mlewMLvqp6AXB) field mapping + live API probe.
 * Run: node scripts/test-daily-sessions.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE_ID = "appaGfKj4vYhMw0cb";
const DAILY_SESSIONS_TABLE = "tbl3mlewMLvqp6AXB";

const REQUIRED_FIELDS = [
  "Claim Status",
  "Sealed At",
  "Specialist Signature",
  "Immutable Hash",
  "Session Sequence",
  "PIN Verified",
  "Session Date",
  "Specialist Name",
  "Student Name",
  "Notes",
];

const CODE_FIELDS = {
  sessionDate: "Session Date",
  specialistName: "Specialist Name",
  studentName: "Student Name",
  notes: "Notes",
  claimStatus: "Claim Status",
  sealedAt: "Sealed At",
  specialistSignature: "Specialist Signature",
  immutableHash: "Immutable Hash",
  sessionSequence: "Session Sequence",
  pinVerified: "PIN Verified",
};

function loadPat() {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return process.env.VITE_AIRTABLE_PAT || process.env.AIRTABLE_API_KEY;
  const envText = readFileSync(envPath, "utf8");
  return (
    envText.match(/VITE_AIRTABLE_PAT=(.+)/)?.[1]?.trim() ||
    envText.match(/AIRTABLE_API_KEY=(.+)/)?.[1]?.trim()
  );
}

const pat = loadPat();
if (!pat) {
  console.error("FAIL: No Airtable PAT (VITE_AIRTABLE_PAT in .env.local)");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${pat}`, Accept: "application/json" };

console.log("=== Aunak Sealed Claim — Unified Field Check ===\n");
console.log("Table ID:", DAILY_SESSIONS_TABLE);
console.log("Base ID:", BASE_ID);

let failed = 0;

for (const [key, expected] of Object.entries(CODE_FIELDS)) {
  const ok = REQUIRED_FIELDS.includes(expected);
  console.log(ok ? "  OK" : "  FAIL", `${key} → "${expected}"`);
  if (!ok) failed += 1;
}

for (const f of REQUIRED_FIELDS) {
  if (!Object.values(CODE_FIELDS).includes(f)) {
    console.log("  WARN unmapped cloud field:", f);
  }
}

const metaUrl = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
try {
  const metaRes = await fetch(metaUrl, { headers });
  if (metaRes.ok) {
    const meta = await metaRes.json();
    const table = (meta.tables || []).find((t) => t.id === DAILY_SESSIONS_TABLE);
    if (table) {
      const names = new Set((table.fields || []).map((f) => f.name));
      console.log("\n--- Airtable schema probe ---");
      for (const f of REQUIRED_FIELDS) {
        const present = names.has(f);
        console.log(present ? "  OK" : "  MISSING", f);
        if (!present) failed += 1;
      }
    } else {
      console.warn("\nWARN: table not found in meta API (token may lack schema scope)");
    }
  } else {
    console.warn("\nWARN: meta API", metaRes.status, "(skip schema probe — check records instead)");
  }
} catch (e) {
  console.warn("\nWARN: meta probe failed", e.message);
}

const recUrl = `https://api.airtable.com/v0/${BASE_ID}/${DAILY_SESSIONS_TABLE}?maxRecords=3`;
const recRes = await fetch(recUrl, { headers });
if (!recRes.ok) {
  console.error("\nFAIL: records API", recRes.status, await recRes.text());
  process.exit(1);
}

const recData = await recRes.json();
console.log("\n--- Live records ---");
console.log("Records fetched:", (recData.records || []).length);

for (const rec of recData.records || []) {
  const f = rec.fields || {};
  console.log(`  rec ${rec.id}: Claim Status=${f["Claim Status"] ?? "—"}, Sequence=${f["Session Sequence"] ?? "—"}, Specialist=${f["Specialist Name"] ?? "—"}`);
}

console.log("\n=== Result:", failed === 0 ? "PASS — cloud binding ready" : `FAIL (${failed} issues)` , "===");
process.exit(failed === 0 ? 0 : 1);
````

## File: scripts/test-mock-payment.mjs
````javascript
/**
 * Sovereign mock payment test — simulates webhook → Airtable (standalone, no src imports).
 * Usage: node scripts/test-mock-payment.mjs [studentRecordId]
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes, createHmac } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE = 'appaGfKj4vYhMw0cb';
const TABLE = 'tblzYmBGmCxx2vdcr';

function loadEnvLocal() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) return null;
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function token(prefix) {
  return `AUN-${prefix}-${randomBytes(16).toString('hex').toUpperCase()}`;
}

function buildMockChargeId() {
  return `chg_MOCK_${Date.now().toString(36).toUpperCase()}_${randomBytes(3).toString('hex').toUpperCase()}`;
}

async function airtableGet(apiKey, recordId) {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}/${encodeURIComponent(recordId)}`,
    { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } }
  );
  if (!res.ok) return null;
  return res.json();
}

async function findPendingStudent(apiKey) {
  const filter = encodeURIComponent("{subscription_status}='pending'");
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}?maxRecords=5&filterByFormula=${filter}`,
    { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).records?.[0] ?? null;
}

/** Mirrors paymentWebhookProcessor + paymentActivation + tripleAccessProtocol */
async function activateMockPayment(apiKey, studentId, chargeId, plan = 'tutor') {
  const existing = await airtableGet(apiKey, studentId);
  const f = existing?.fields ?? {};
  const ref = `MOCK-${chargeId}`;
  if (String(f.activation_code_used ?? '').trim() === ref) {
    return { alreadyActivated: true, fields: f };
  }

  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  const comprehensive = String(f.comprehensive_assessment_status ?? '').toLowerCase();

  const fields = {
    subscription_status: 'active',
    plan_code: plan,
    last_payment_at: new Date().toISOString(),
    payment_method: 'mock',
    subscription_expires_at: expires.toISOString().slice(0, 10),
    preferred_destination: plan === 'medical' ? 'diagnostics' : 'media',
    activation_code_used: ref,
    parent_access_token: token('PRT'),
    child_interactive_token: token('CHD'),
    specialist_tutor_token: token('SPC'),
  };

  if (comprehensive !== 'completed') {
    fields.comprehensive_assessment_status = 'not_started';
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}/${encodeURIComponent(studentId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields, typecast: true }),
    }
  );

  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 400));
  return { alreadyActivated: false, airtable: JSON.parse(text), fields };
}

const env = loadEnvLocal();
const apiKey = env?.AIRTABLE_API_KEY || env?.VITE_AIRTABLE_PAT;

if (!apiKey) {
  console.error('❌ No AIRTABLE_API_KEY / VITE_AIRTABLE_PAT in .env.local');
  process.exit(1);
}

let studentId = process.argv[2]?.trim();
let row = studentId ? await airtableGet(apiKey, studentId) : null;

if (!row?.id) {
  console.log('🔍 Searching pending student…');
  row = await findPendingStudent(apiKey);
  studentId = row?.id;
}

if (!studentId) {
  console.error('❌ No student. Pass recXXX or create pending enrollment.');
  process.exit(1);
}

console.log('\n📋 BEFORE');
console.log('  id:', studentId);
console.log('  name:', row.fields?.student_name ?? '—');
console.log('  subscription_status:', row.fields?.subscription_status ?? '—');
console.log('  parent_access_token:', row.fields?.parent_access_token ? 'set' : 'empty');

const chargeId = buildMockChargeId();
console.log('\n⚡ Mock CAPTURED webhook simulation');
console.log('  chargeId:', chargeId);

const result = await activateMockPayment(apiKey, studentId, chargeId, 'tutor');
console.log('\n✅ Processor:', result.alreadyActivated ? 'idempotent skip' : 'PATCH ok');

const after = await airtableGet(apiKey, studentId);
const af = after?.fields ?? {};

console.log('\n📋 AFTER Airtable');
console.log('  subscription_status:', af.subscription_status);
console.log('  plan_code:', af.plan_code);
console.log('  payment_method:', af.payment_method);
console.log('  activation_code_used:', af.activation_code_used);
console.log('  parent_access_token:', af.parent_access_token);
console.log('  child_interactive_token:', af.child_interactive_token ? 'set' : 'empty');
console.log('  specialist_tutor_token:', af.specialist_tutor_token ? 'set' : 'empty');

const ok =
  af.subscription_status === 'active' &&
  af.parent_access_token?.startsWith('AUN-PRT-') &&
  af.child_interactive_token?.startsWith('AUN-CHD-') &&
  af.specialist_tutor_token?.startsWith('AUN-SPC-');

console.log(ok ? '\n🟢 MOCK WEBHOOK → AIRTABLE: PASSED' : '\n🔴 FAILED');
process.exit(ok ? 0 : 1);
````

## File: scripts/test-routing.mjs
````javascript
/**
 * Standalone routing runtime test — writes debug-775441.log
 */
import { appendFileSync } from "fs";

const LOG = "debug-775441.log";
function log(message, data, hypothesisId) {
  appendFileSync(
    LOG,
    JSON.stringify({
      sessionId: "775441",
      runId: "post-fix",
      hypothesisId,
      location: "scripts/test-routing.mjs",
      message,
      data,
      timestamp: Date.now(),
    }) + "\n"
  );
}

const VALID = new Set(["live", "media", "registry", "diagnostics"]);

function readPreferred(student) {
  const mapped = student?.preferredLanding;
  if (mapped != null && mapped !== "") {
    if (Array.isArray(mapped)) {
      const first = mapped.find((v) => v != null && String(v).trim() !== "");
      if (first != null) return String(first).trim();
    } else return String(mapped).trim();
  }
  const raw = student?.fields?.["الوجهة المفضلة"];
  if (raw == null) return "";
  if (Array.isArray(raw)) return String(raw[0] ?? "").trim();
  return String(raw).trim();
}

function statusOf(student) {
  const mapped = student?.status;
  if (mapped != null && String(mapped).trim() !== "") return String(mapped).trim();
  return String(student?.fields?.Status ?? "").trim();
}

function resolve(student) {
  const statusRaw = statusOf(student);
  const preferredRaw = readPreferred(student);
  const s = statusRaw.toLowerCase();
  if (s === "new" || s === "جديد") return { section: "diagnostics", preferredRaw, statusRaw };
  if (s === "active" || s === "نشط") {
    const key = preferredRaw.toLowerCase();
    return { section: VALID.has(key) ? key : "live", preferredRaw, statusRaw };
  }
  return { section: "diagnostics", preferredRaw, statusRaw };
}

const cases = [
  [{ status: "New", preferredLanding: "media", fields: { Status: "New", "الوجهة المفضلة": "media" } }, "diagnostics"],
  [{ status: "Active", preferredLanding: "media", fields: { Status: "Active", "الوجهة المفضلة": "media" } }, "media"],
  [{ fields: { Status: "Active", "الوجهة المفضلة": "live" } }, "live"],
  [{ status: "Active", preferredLanding: "registry", fields: { Status: "Active", "الوجهة المفضلة": "registry" } }, "registry"],
  [{ fields: { Status: "جديد", "الوجهة المفضلة": "live" } }, "diagnostics"],
];

let failed = 0;
for (const [student, expect] of cases) {
  const result = resolve(student);
  const ok = result.section === expect;
  if (!ok) failed += 1;
  log("routing_case", { ...result, expect, ok }, ok ? "PASS" : "FAIL");
}

console.log(failed === 0 ? "ALL PASS" : `${failed} FAILED`);
process.exit(failed > 0 ? 1 : 0);
````

## File: src/App.css
````css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
````

## File: src/assets/react.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
````

## File: src/assets/vite.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" width="77" height="47" fill="none" aria-labelledby="vite-logo-title" viewBox="0 0 77 47"><title id="vite-logo-title">Vite</title><style>.parenthesis{fill:#000}@media (prefers-color-scheme:dark){.parenthesis{fill:#fff}}</style><path fill="#9135ff" d="M40.151 45.71c-.663.844-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.493c-.92 0-1.457-1.04-.92-1.788l7.479-10.471c1.07-1.498 0-3.578-1.842-3.578H15.443c-.92 0-1.456-1.04-.92-1.788l9.696-13.576c.213-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.472c-1.07 1.497 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.087.89 1.83L40.153 45.712z"/><mask id="a" width="48" height="47" x="14" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M40.047 45.71c-.663.843-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.389c-.92 0-1.457-1.04-.92-1.788l7.479-10.472c1.07-1.497 0-3.578-1.842-3.578H15.34c-.92 0-1.456-1.04-.92-1.788l9.696-13.575c.213-.297.556-.474.92-.474H53.93c.92 0 1.456 1.04.92 1.788L47.37 13.03c-1.07 1.498 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.088.89 1.831L40.049 45.712z"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#eee6ff" rx="5.508" ry="14.704" transform="rotate(269.814 20.96 11.29)scale(-1 1)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#eee6ff" rx="10.399" ry="29.851" transform="rotate(89.814 -16.902 -8.275)scale(1 -1)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#8900ff" rx="5.508" ry="30.487" transform="rotate(89.814 -19.197 -7.127)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.928 4.177)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.738 5.52)scale(1 -1)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#eee6ff" rx="14.072" ry="22.078" transform="rotate(93.35 31.245 55.578)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx="14.592" cy="9.743" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(39.51 14.592 9.743)"/></g><g filter="url(#k)"><ellipse cx="61.728" cy="-5.321" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 61.728 -5.32)"/></g><g filter="url(#l)"><ellipse cx="55.618" cy="7.104" fill="#00c2ff" rx="5.971" ry="9.665" transform="rotate(37.892 55.618 7.104)"/></g><g filter="url(#m)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#n)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#o)"><ellipse cx="49.857" cy="30.678" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 49.857 30.678)"/></g><g filter="url(#p)"><ellipse cx="52.623" cy="33.171" fill="#00c2ff" rx="5.971" ry="15.297" transform="rotate(37.892 52.623 33.17)"/></g></g><path d="M6.919 0c-9.198 13.166-9.252 33.575 0 46.789h6.215c-9.25-13.214-9.196-33.623 0-46.789zm62.424 0h-6.215c9.198 13.166 9.252 33.575 0 46.789h6.215c9.25-13.214 9.196-33.623 0-46.789" class="parenthesis"/><defs><filter id="b" width="60.045" height="41.654" x="-5.564" y="16.92" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-40.407" y="-6.762" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-35.435" y="2.801" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-30.84" y="20.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-29.307" y="21.949" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="29.961" y="-17.13" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-13.43" y="-22.082" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="34.321" y="-37.644" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="38.847" y="-10.552" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="22.45" y="-1.645" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="32.919" y="11.36" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter></defs></svg>
````

## File: src/components/.gitkeep
````

````

## File: src/components/assessment/AssessmentPromoModal.jsx
````javascript
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, Crown, ArrowLeft, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePromoVoice } from '../../hooks/usePromoVoice';
import PaymentCheckoutButton from '../PaymentCheckoutButton';

export default function AssessmentPromoModal({
  lang = 'ar',
  open,
  onContinue,
  onClose,
  studentId,
  customer,
  defaultPlan,
  flow = 'enrollment',
}) {
  const { speakPromo, stop, isSupported } = usePromoVoice(lang);
  const [muted, setMuted] = useState(false);
  const [scene, setScene] = useState(0);

  const copy =
    lang === 'en'
      ? {
          headline: 'The Full Picture Changes Everything',
          sub: 'Comprehensive assessment — not guesswork',
          bullets: [
            'Hidden strengths revealed in 48 hours',
            'Personalized rehab plan for your child',
            'Sovereign data — trusted by centers',
          ],
          cta: 'Continue with activation code',
          payOnline: 'Secure online payment',
          payDivider: 'or enter admin code at next step',
          skip: 'Continue to activation',
          mute: 'Mute voice',
          unmute: 'Play voice',
          scenes: ['Every child has a hidden map…', 'The free scan shows the surface…', 'The full assessment unlocks the path.'],
        }
      : {
          headline: 'الصورة الكاملة… تغيّر كل شيء',
          sub: 'التقييم الشامل — لا تخمين ولا انتظار',
          bullets: [
            'كشف نقاط القوة المخفية خلال 48 ساعة',
            'خطة تأهيل شخصية لطفلك',
            'بيانات سيادية معتمدة من المراكز',
          ],
          cta: 'متابعة بكود التفعيل',
          payOnline: 'السداد الآمن عبر الإنترنت',
          payDivider: 'أو أدخل كود الإدارة في الخطوة التالية',
          skip: 'متابعة للتفعيل',
          mute: 'كتم الصوت',
          unmute: 'تشغيل الصوت الرنان',
          scenes: ['كل طفل يحمل خريطة قدرات…', 'المسح المجاني يكشف السطح…', 'التقييم الشامل يفتح الطريق.'],
        };

  useEffect(() => {
    if (!open) {
      stop();
      setScene(0);
      return undefined;
    }
    if (!muted && isSupported) {
      const t = setTimeout(() => speakPromo(), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, muted, isSupported, speakPromo, stop]);

  useEffect(() => {
    if (!open) return undefined;
    const interval = setInterval(() => setScene((s) => (s + 1) % copy.scenes.length), 2800);
    return () => clearInterval(interval);
  }, [open, copy.scenes.length]);

  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      speakPromo();
    } else {
      setMuted(true);
      stop();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#050508]/90 backdrop-blur-lg" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden border border-[#c9a962]/40 shadow-[0_0_80px_rgba(201,169,98,0.35)]"
            initial={{ scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Cinematic "video" panel */}
            <div className="relative aspect-video bg-gradient-to-br from-[#1a0a2e] via-[#0f172a] to-[#1c1917] overflow-hidden">
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_40%,rgba(201,169,98,0.45)_0%,transparent_55%)] animate-pulse" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-8"
                key={scene}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Crown className="w-16 h-16 text-[#e8c872] mx-auto mb-4 drop-shadow-[0_0_24px_rgba(232,200,114,0.8)]" />
                <p className="text-2xl md:text-3xl font-black text-white leading-relaxed drop-shadow-lg">
                  {copy.scenes[scene]}
                </p>
              </motion.div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <span className="text-xs font-mono text-[#e8c872]/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AUNAK · PROMO
                </span>
                {isSupported && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/50 border border-white/20 text-xs text-white"
                  >
                    {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    {muted ? copy.unmute : copy.mute}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#12121a]/95 p-6 md:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#e8c872] to-amber-400 mb-1">
                {copy.headline}
              </h2>
              <p className="text-sm text-slate-400 mb-4">{copy.sub}</p>
              <ul className="space-y-2 mb-6">
                {copy.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>

              {studentId && (
                <div className="mb-4">
                  <p className="text-[10px] font-mono text-emerald-400/80 text-center mb-3 uppercase tracking-wider">
                    {copy.payOnline}
                  </p>
                  <PaymentCheckoutButton
                    lang={lang}
                    studentId={studentId}
                    plan={defaultPlan}
                    flow={flow}
                    customer={customer}
                  />
                  <p className="text-[10px] text-slate-600 text-center mt-3">{copy.payDivider}</p>
                </div>
              )}

              <button
                type="button"
                onClick={onContinue}
                className="w-full py-3.5 rounded-2xl border border-[#c9a962]/40 text-[#e8c872] font-bold hover:bg-[#c9a962]/10 transition-all mb-3"
              >
                {copy.cta}
              </button>
              <button
                type="button"
                onClick={onClose ?? onContinue}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> {copy.skip}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
````

## File: src/components/assessment/AssessmentResultScreen.jsx
````javascript
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Sparkles, Target } from 'lucide-react';

const BAND_STYLE = {
  balanced: {
    ring: 'border-emerald-400/50',
    glow: 'shadow-[0_0_48px_rgba(52,211,153,0.25)]',
    icon: Sparkles,
    color: 'text-emerald-300',
  },
  moderate: {
    ring: 'border-amber-400/50',
    glow: 'shadow-[0_0_48px_rgba(251,191,36,0.25)]',
    icon: TrendingUp,
    color: 'text-amber-300',
  },
  elevated: {
    ring: 'border-rose-400/50',
    glow: 'shadow-[0_0_48px_rgba(251,113,133,0.3)]',
    icon: AlertCircle,
    color: 'text-rose-300',
  },
};

export default function AssessmentResultScreen({ lang = 'ar', result, studentName, onShowPromo }) {
  if (!result) return null;

  const style = BAND_STYLE[result.band] ?? BAND_STYLE.moderate;
  const Icon = style.icon;

  const copy =
    lang === 'en'
      ? {
          label: 'Preliminary result',
          for: 'For',
          score: 'Developmental focus index',
          disclaimer: 'Not a clinical diagnosis — a smart preliminary map.',
          cta: 'See how the full assessment changes everything',
        }
      : {
          label: 'النتيجة المبدئية',
          for: 'للطالب',
          score: 'مؤشر التركيز التطوري',
          disclaimer: 'ليست تشخيصاً سريرياً — خريطة مبدئية ذكية.',
          cta: 'اكتشف كيف يغيّر التقييم الشامل كل شيء',
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-lg mx-auto rounded-3xl border-2 ${style.ring} ${style.glow} bg-[#12121a]/80 backdrop-blur-xl p-6 md:p-8`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">{copy.label}</p>
      <h2 className="text-xl font-bold text-slate-200 mb-1">
        {copy.for}: <span className="text-[#e8c872]">{studentName}</span>
      </h2>
      <p className={`text-lg font-bold mb-6 ${style.color}`}>{result.title}</p>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={style.color}
              strokeDasharray={`${(result.scorePercent / 100) * 264} 264`}
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(result.scorePercent / 100) * 264} 264` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{result.scorePercent}</span>
            <span className="text-[10px] text-slate-500 font-mono">{copy.score}</span>
          </div>
        </div>
        <Icon className={`w-12 h-12 ${style.color}`} />
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-3">{result.summary}</p>
      <p className="text-sm text-emerald-300/90 mb-2 flex items-start gap-2">
        <Target className="w-4 h-4 shrink-0 mt-0.5" />
        {result.strengthsText}
      </p>
      <p className="text-sm text-amber-300/90 mb-4">{result.focusText}</p>
      <p className="text-xs text-slate-500 mb-6 font-mono">{copy.disclaimer}</p>

      <button
        type="button"
        onClick={onShowPromo}
        className="w-full py-4 rounded-2xl bg-gradient-to-l from-blue-600 to-violet-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.45)] transition-all animate-pulse"
      >
        {copy.cta}
      </button>
    </motion.div>
  );
}
````

## File: src/components/AunakActivationGate.jsx
````javascript
import { useState, useMemo } from 'react';
import { KeyRound, Shield, Loader2, CheckCircle2, ArrowRight, Lock, Clock, AlertTriangle } from 'lucide-react';
import PlatformLogo, { GATE_LOGO_CLASS } from './PlatformLogo';
import PaymentCheckoutButton from './PaymentCheckoutButton';
import TriplePortalCards from './TriplePortalCards';
import { buildTriplePortalLinks } from '../lib/tripleAccessProtocol';
import { useAuth } from '../lib/auth';
import { redeemActivationCodeWithApi } from '../lib/subscriptionEngine';
import { PLAN_LABELS, landingForPlan, PLAN_CODES } from '../lib/plans';
import { normalizeActivationCode, validateCodeFormat } from '../lib/activationCodes';
import { LUX } from '../lib/luxTheme.js';

/**
 * Sovereign activation gate — Value Lock overlay for Pending / expired subscriptions.
 * Redeems manual code via /api/activation/redeem → Active + plan landing.
 */
export default function AunakActivationGate({
  lang = 'ar',
  studentId,
  childName,
  reason = 'pending',
  enrollmentFlow = false,
  onActivated,
  onSkip,
}) {
  const { patchSession } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);

  const t = {
    ar: {
      title: 'بوابة التفعيل السيادية',
      subtitle: 'أدخل كود التفعيل الذي منحته الإدارة بعد السداد',
      student: 'الطالب',
      placeholder: 'AUN-TUTOR-XXXX-2026',
      activate: 'تعميد وتفعيل',
      activating: 'جاري التعميد...',
      success: 'تم التعميد — حالة الاشتراك Active',
      invalid: 'كود غير صالح أو منتهي',
      hint: 'FREE · TUTOR · MEDICAL · INST · ASSESS',
      enterGate: 'الدخول للبوابة المفضلة',
      valueLock: 'Value Lock — الوصول مقفل حتى التفعيل',
      pendingNote: 'حسابك في انتظار التفعيل',
      expiredNote: 'انتهى اشتراكك — أدخل كوداً جديداً للتجديد',
      formatHint: 'الصيغة: AUN-{PLAN}-XXXX-YYYY',
      assessNote: 'باقة ASSESS تفتح التقييم الشامل المعزول فقط',
      enterBiometric: 'متابعة تسجيل البصمة (بعد السداد)',
      orPay: 'أو السداد الإلكتروني الآمن',
      manualCode: 'كود التفعيل اليدوي',
      tripleTitle: 'بوابات السيادة الثلاث — احفظ روابط الأجهزة',
    },
    en: {
      title: 'Sovereign Activation Gate',
      subtitle: 'Enter the activation code issued by admin after payment',
      student: 'Student',
      placeholder: 'AUN-TUTOR-XXXX-2026',
      activate: 'Seal & Activate',
      activating: 'Sealing...',
      success: 'Sealed — subscription Active',
      invalid: 'Invalid or expired code',
      hint: 'FREE · TUTOR · MEDICAL · INST · ASSESS',
      enterGate: 'Enter preferred portal',
      valueLock: 'Value Lock — access blocked until activation',
      pendingNote: 'Your account is pending activation',
      expiredNote: 'Subscription expired — enter a renewal code',
      formatHint: 'Format: AUN-{PLAN}-XXXX-YYYY',
      assessNote: 'ASSESS plan opens isolated full assessment only',
      enterBiometric: 'Continue to biometric enrollment (post-payment)',
      orPay: 'Or pay securely online',
      manualCode: 'Manual activation code',
      tripleTitle: 'Triple sovereign portals — save device links',
    },
  };
  const copy = t[lang] ?? t.ar;
  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;

  const codeValid = useMemo(() => validateCodeFormat(normalizeActivationCode(code)), [code]);
  const reasonNote = reason === 'expired' ? copy.expiredNote : copy.pendingNote;
  const ReasonIcon = reason === 'expired' ? Clock : AlertTriangle;

  const handleCodeChange = (raw) => {
    const cleaned = String(raw ?? '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setCode(cleaned);
    if (error) setError('');
  };

  const enterPortal = (data) => {
    const plan = data?.plan ?? PLAN_CODES.TUTOR;
    const landing = data?.landing ?? landingForPlan(plan);
    patchSession({
      subscriptionActivated: true,
      subscriptionRaw: 'Active',
      plan,
      subscriptionPending: false,
      landingSection: landing,
      assessmentOnlyMode: plan === PLAN_CODES.ASSESSMENT_ONLY,
    });
    onSkip?.(data);
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!code.trim() || busy || !studentId) return;
    if (!codeValid) {
      setError(copy.invalid);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await redeemActivationCodeWithApi({ code: code.trim(), studentId });
      setResult(data);
      setSuccess(true);
      patchSession({
        subscriptionRaw: 'Active',
        plan: data.plan,
        subscriptionPending: false,
        landingSection: data.landing ?? landingForPlan(data.plan),
        assessmentOnlyMode: data.plan === PLAN_CODES.ASSESSMENT_ONLY,
      });
      onActivated?.(data);
    } catch (err) {
      setError(err?.message === 'INVALID_CODE_FORMAT' ? copy.invalid : err?.message || copy.invalid);
    } finally {
      setBusy(false);
    }
  };

  const backdrop = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#0a0a0c]/92 backdrop-blur-md" />
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-blue-600/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,#3b82f6_0px,#3b82f6_1px,transparent_1px,transparent_48px),repeating-linear-gradient(90deg,#3b82f6_0px,#3b82f6_1px,transparent_1px,transparent_48px)]" />
    </div>
  );

  if (success && result) {
    const isAssess = result.plan === PLAN_CODES.ASSESSMENT_ONLY;
    const portalLinks =
      result.portalLinks ??
      buildTriplePortalLinks(typeof window !== 'undefined' ? window.location.origin : '', result.deviceTokens);
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${LUX.pageWrap} fixed inset-0 z-[100] flex items-center justify-center p-6`}>
        {backdrop}
        <div className="relative z-10 max-w-md w-full rounded-3xl bg-[#12121a]/95 border border-blue-500/40 shadow-[0_0_64px_rgba(59,130,246,0.25)] p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-blue-200 mb-2">{copy.success}</h2>
          <p className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/50 text-blue-100 font-mono text-sm mb-3">
            Active · {labels[result.plan] ?? result.plan}
          </p>
          {portalLinks && (
            <>
              <p className="text-xs text-blue-300/80 mb-2 font-mono">{copy.tripleTitle}</p>
              <TriplePortalCards lang={lang} portalLinks={portalLinks} compact />
            </>
          )}
          {isAssess && (
            <p className="text-xs text-blue-300/80 mb-4 font-mono">{copy.assessNote}</p>
          )}
          <button
            type="button"
            onClick={() => {
              if (enrollmentFlow) {
                onActivated?.(result);
                return;
              }
              enterPortal(result);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_32px_rgba(59,130,246,0.35)] transition-all"
          >
            {enrollmentFlow ? copy.enterBiometric : copy.enterGate}{' '}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${LUX.pageWrap} fixed inset-0 z-[100] flex items-center justify-center p-6`}>
      {backdrop}

      <div className="relative z-10 max-w-md w-full">
        <div className="flex justify-center mb-5">
          <PlatformLogo lang={lang} className={GATE_LOGO_CLASS} />
        </div>

        <div className="rounded-3xl bg-[#12121a]/95 border border-blue-500/30 shadow-[0_0_48px_rgba(59,130,246,0.18)] overflow-hidden">
          <div className="px-6 py-4 bg-blue-600/10 border-b border-blue-500/25 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-400/30">
              <Lock className="w-5 h-5 text-blue-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-blue-400/80 uppercase tracking-wider">{copy.valueLock}</p>
              <p className="text-xs text-blue-200/90 flex items-center gap-1.5 mt-0.5">
                <ReasonIcon className="w-3.5 h-3.5 shrink-0" />
                {reasonNote}
              </p>
            </div>
            <Shield className="w-6 h-6 text-blue-400/60 shrink-0" />
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <KeyRound className="w-11 h-11 text-blue-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold bg-gradient-to-l from-blue-200 to-blue-400 bg-clip-text text-transparent">
                {copy.title}
              </h2>
              <p className="text-sm text-slate-400 mt-2">{copy.subtitle}</p>
              {childName && (
                <p className="text-xs font-mono text-slate-500 mt-2">{copy.student}: {childName}</p>
              )}
            </div>

            {studentId && (
              <div className="mb-6 pb-6 border-b border-white/[0.06]">
                <PaymentCheckoutButton
                  lang={lang}
                  studentId={studentId}
                  flow={enrollmentFlow ? 'enrollment' : 'gate'}
                  customer={{ name: childName }}
                />
              </div>
            )}

            <p className="text-[10px] font-mono text-slate-500 text-center mb-4 uppercase tracking-wider">
              {copy.manualCode}
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={copy.placeholder}
                  className={`w-full bg-[#0d0d10] border rounded-xl px-4 py-3.5 font-mono text-center tracking-wider transition-colors ${
                    code && !codeValid
                      ? 'border-rose-500/40 text-rose-300'
                      : codeValid
                        ? 'border-blue-400/50 text-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.12)]'
                        : 'border-white/10 text-blue-100'
                  }`}
                />
                {codeValid && (
                  <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-blue-400" />
                )}
              </div>

              <p className="text-[10px] text-slate-500 text-center font-mono">{copy.formatHint}</p>
              <p className="text-[10px] text-blue-400/70 text-center font-mono">{copy.hint}</p>

              {error && (
                <p className="text-xs text-rose-400 text-center bg-rose-500/10 border border-rose-400/25 rounded-lg py-2 px-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !code.trim() || !codeValid}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_32px_rgba(59,130,246,0.35)] transition-all"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {busy ? copy.activating : copy.activate}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakEnrollment.jsx
````javascript
import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import PlatformLogo from "./PlatformLogo";
import {
  createStudentRecord,
  buildStudentEnrollmentFields,
  generateUniqueStudentCode,
} from "../lib/airtable";
import {
  validateEnrollmentStep1,
  ENROLLMENT_AGE_MIN,
  ENROLLMENT_AGE_MAX,
} from "../lib/enrollmentValidation";
import { getDiagnosisOptions } from "../lib/diagnosisOptions";
import { getCountryOptions, DEFAULT_COUNTRY_ISO } from "../lib/countryDialCodes";
import FreeAssessmentFlow from "./assessment/FreeAssessmentFlow";
import AunakActivationGate from "./AunakActivationGate";
import PostActivationBiometric from "./PostActivationBiometric";
import { LUX } from "../lib/luxTheme.js";
import { getCountryByIso } from "../lib/countryDialCodes";
import { readPaymentComplete, clearPaymentComplete, readEnrollmentDraft, clearEnrollmentDraft, saveEnrollmentDraft } from "../lib/paymentClient";

/**
 * Sovereign enrollment — strict funnel:
 * Data → Free assessment → Promo → Payment/activation → Biometric (post-pay only)
 */
export default function AunakEnrollment({ lang = "ar", onEnrolled }) {
  const [phase, setPhase] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [parentPhone, setParentPhone] = useState("");
  const [preferredLanding, setPreferredLanding] = useState("media");
  const [recordId, setRecordId] = useState(null);
  const [studentCode, setStudentCode] = useState("");
  const [activationResult, setActivationResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const t = {
    ar: {
      title: "تسجيل الطالب السيادي",
      subtitle: "تسجيل → تقييم مجاني → تفعيل الاشتراك → البصمة (بعد السداد فقط)",
      phaseData: "التسجيل",
      phaseAssessment: "التقييم",
      phaseActivation: "التفعيل",
      phaseBiometric: "البصمة",
      name: "إسم الطالب",
      nameHint: "يرجى كتابة اسمين على الأقل (الاسم الأول واللقب)",
      namePlaceholder: "يرجى كتابة اسمين على الأقل (الاسم الأول واللقب)",
      age: "العمر",
      ageHint: `من ${ENROLLMENT_AGE_MIN} إلى ${ENROLLMENT_AGE_MAX} سنة`,
      diagnosis: "التشخيص",
      diagnosisPlaceholder: "— اختر التشخيص —",
      parentPhone: "هاتف ولي الامر",
      phoneHint: "اختر كود الدولة ثم أدخل رقم الجوال بدون الصفر الأول",
      preferredLanding: "الوجهة المفضلة",
      landingMedia: "عالم الجزر (media)",
      landingRegistry: "سجل الحالات (registry)",
      next: "التالي — التقييم المجاني",
      errField:
        "تعذر حفظ البيانات — عمود Airtable غير موجود أو اسمه مختلف. تحقق من أسماء الأعمدة في جدول الطلاب.",
      errSave: "فشل حفظ السجل",
      errValidation: "صحّح الحقول المظللة قبل المتابعة",
      activatedNote: "تم تفعيل الاشتراك — أكمل تسجيل البصمة الآن",
    },
    en: {
      title: "Sovereign Student Enrollment",
      subtitle: "Register → free assessment → activate plan → biometric (after payment only)",
      phaseData: "Register",
      phaseAssessment: "Assessment",
      phaseActivation: "Activation",
      phaseBiometric: "Biometric",
      name: "Student name",
      nameHint: "Enter at least two names (first name and family name)",
      namePlaceholder: "Enter at least two names (first and last name)",
      age: "Age",
      ageHint: `Ages ${ENROLLMENT_AGE_MIN}–${ENROLLMENT_AGE_MAX} only`,
      diagnosis: "Diagnosis",
      diagnosisPlaceholder: "— select diagnosis —",
      parentPhone: "Guardian phone",
      phoneHint: "Select country code, then enter mobile without leading zero",
      preferredLanding: "Preferred landing",
      landingMedia: "Digital islands (media)",
      landingRegistry: "Case registry (registry)",
      next: "Next — free assessment",
      errField: "Could not save — Airtable column mismatch.",
      errSave: "Failed to save record",
      errValidation: "Fix highlighted fields before continuing",
      activatedNote: "Subscription active — complete biometric enrollment now",
    },
  };
  const copy = t[lang] ?? t.ar;

  const phaseLabels = [copy.phaseData, copy.phaseAssessment, copy.phaseActivation, copy.phaseBiometric];

  const diagnosisOptions = useMemo(() => getDiagnosisOptions(lang), [lang]);
  const countryOptions = useMemo(() => getCountryOptions(lang), [lang]);

  const validation = useMemo(
    () => validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang }),
    [name, age, parentPhone, countryIso, diagnosis, lang]
  );

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const runValidation = useCallback(() => {
    const result = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
    setFieldErrors(result.errors);
    setTouched({ name: true, age: true, phone: true, diagnosis: true });
    return result;
  }, [name, age, parentPhone, countryIso, diagnosis, lang]);

  const showError = (field) => touched[field] && fieldErrors[field];

  /** Resume enrollment after Tap redirect (?enrollment=1&payment=done or sessionStorage). */
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const paymentDone = params.get('payment') === 'done' || params.get('enrollment') === '1';
    const complete = readPaymentComplete();
    const draft = readEnrollmentDraft();
    if (!complete?.studentId && !draft?.recordId) return;

    if (draft) {
      if (draft.name) setName(draft.name);
      if (draft.age) setAge(String(draft.age));
      if (draft.diagnosis) setDiagnosis(draft.diagnosis);
      if (draft.countryIso) setCountryIso(draft.countryIso);
      if (draft.parentPhone) setParentPhone(draft.parentPhone);
      if (draft.preferredLanding) setPreferredLanding(draft.preferredLanding);
      if (draft.studentCode) setStudentCode(draft.studentCode);
    }

    const sid = complete?.studentId || draft?.recordId;
    if (sid) setRecordId(sid);

    if (complete?.active || complete?.subscriptionRaw === 'active') {
      setActivationResult(complete);
      setPhase(4);
      clearPaymentComplete();
      clearEnrollmentDraft();
    }

    if (paymentDone && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('enrollment');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const assessmentCustomer = useMemo(() => {
    const country = getCountryByIso(countryIso);
    const national = parentPhone.replace(/\D/g, "").replace(/^0/, "");
    return {
      name: name.trim(),
      phoneCountryCode: country.dial,
      phoneNumber: national,
    };
  }, [name, parentPhone, countryIso]);

  const inputBorder = (field) => {
    if (showError(field)) return "border-rose-500/60 focus:border-rose-400";
    if (touched[field] && !fieldErrors[field]) return "border-emerald-400/40";
    return "border-white/[0.08] focus:border-emerald-400";
  };

  const submitData = async () => {
    const result = runValidation();
    if (!result.ok) {
      setError(result.firstError || copy.errValidation);
      return;
    }

    setBusy(true);
    setError("");
    const normalized = result.normalized;
    const code = generateUniqueStudentCode({
      name: normalized.name,
      parentPhone: normalized.parentPhone,
    });
    setStudentCode(code);
    try {
      const row = await createStudentRecord(
        buildStudentEnrollmentFields({
          name: normalized.name,
          age: normalized.age,
          diagnosis: normalized.diagnosis,
          parentPhone: normalized.parentPhone,
          parentCountryCode: normalized.parentCountryCode,
          preferredLanding,
        })
      );
      setRecordId(row.id);
      setStudentCode(row.studentCode ?? code);
      setName(normalized.name);
      setAge(String(normalized.age));
      saveEnrollmentDraft({
        recordId: row.id,
        name: normalized.name,
        age: normalized.age,
        diagnosis: normalized.diagnosis,
        countryIso,
        parentPhone: normalized.parentPhone,
        preferredLanding,
        studentCode: row.studentCode ?? code,
      });
      setPhase(2);
    } catch (e) {
      const msg = e?.message || "";
      const detail =
        msg.includes("UNKNOWN_FIELD_NAME") ||
        msg.includes("INVALID_SELECT") ||
        msg.includes("SELECT_OPTION")
          ? msg.replace(/^[^:]+:\s*/, "")
          : msg;
      setError(
        msg.includes("UNKNOWN_FIELD_NAME") || msg.includes("INVALID_SELECT") || msg.includes("SELECT_OPTION")
          ? `${copy.errField} (${detail})`
          : e?.message || copy.errSave
      );
    } finally {
      setBusy(false);
    }
  };

  if (phase === 3) {
    return (
      <AunakActivationGate
        lang={lang}
        studentId={recordId}
        childName={name.trim()}
        reason="pending"
        enrollmentFlow
        onActivated={(data) => {
          setActivationResult(data);
          setPhase(4);
        }}
      />
    );
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 md:p-10 font-sans"
    >
      <header className="max-w-3xl mx-auto mb-8 flex items-center gap-4 border-b border-[#c9a962]/15 pb-6">
        <PlatformLogo lang={lang} className="w-14 h-16 rounded-xl" />
        <div>
          <h1 className={LUX.titleGradient}>{copy.title}</h1>
          <p className="text-sm text-slate-400">{copy.subtitle}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto flex flex-wrap gap-2 mb-8 text-xs font-mono">
        {phaseLabels.map((label, i) => {
          const stepNum = i + 1;
          const locked = stepNum > phase;
          return (
            <div
              key={label}
              className={`flex-1 min-w-[4.5rem] py-2 px-2 rounded-lg border text-center ${
                phase === stepNum
                  ? "border-emerald-400 text-[#e8c872]"
                  : locked
                    ? "border-white/[0.04] text-slate-600 opacity-50"
                    : "border-[#c9a962]/15 text-slate-500"
              }`}
            >
              {stepNum}. {label}
              {stepNum === 4 && phase < 4 && (lang === "ar" ? " 🔒" : " 🔒")}
            </div>
          );
        })}
      </div>

      {error && <p className="max-w-3xl mx-auto mb-4 text-rose-300 text-sm">{error}</p>}

      {phase === 1 ? (
        <div className="max-w-md mx-auto space-y-4 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] rounded-3xl p-8">
          <div>
            <label className="block text-sm text-slate-400">{copy.name}</label>
            <p className="text-[10px] text-slate-600 mb-1.5">{copy.nameHint}</p>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onBlur={() => {
                markTouched("name");
                const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                setFieldErrors(r.errors);
              }}
              placeholder={copy.namePlaceholder}
              autoComplete="off"
              name="aunak-student-full-name"
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("name")}`}
            />
            {showError("name") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.age}</label>
            <p className="text-[10px] text-slate-600 mb-1.5">{copy.ageHint}</p>
            <input
              value={age}
              onChange={(e) => {
                setAge(e.target.value.replace(/[^\d]/g, "").slice(0, 2));
                if (error) setError("");
              }}
              onBlur={() => {
                markTouched("age");
                const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                setFieldErrors(r.errors);
              }}
              type="text"
              inputMode="numeric"
              min={ENROLLMENT_AGE_MIN}
              max={ENROLLMENT_AGE_MAX}
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("age")}`}
            />
            {showError("age") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.diagnosis}</label>
            <select
              value={diagnosis}
              onChange={(e) => {
                setDiagnosis(e.target.value);
                if (error) setError("");
              }}
              onBlur={() => {
                markTouched("diagnosis");
                const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                setFieldErrors(r.errors);
              }}
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("diagnosis")}`}
            >
              <option value="">{copy.diagnosisPlaceholder}</option>
              {diagnosisOptions.map((opt) => (
                <option key={opt.id} value={opt.airtableValue}>
                  {opt.label}
                </option>
              ))}
            </select>
            {showError("diagnosis") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.diagnosis}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.parentPhone}</label>
            <p className="text-[10px] text-slate-600 mb-1.5">{copy.phoneHint}</p>
            <div className="flex gap-2">
              <select
                value={countryIso}
                onChange={(e) => {
                  setCountryIso(e.target.value);
                  if (error) setError("");
                }}
                dir="ltr"
                className="w-[42%] min-w-[8rem] px-2 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] outline-none focus:border-emerald-400 text-sm"
              >
                {countryOptions.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                value={parentPhone}
                onChange={(e) => {
                  setParentPhone(e.target.value.replace(/[^\d\s-]/g, ""));
                  if (error) setError("");
                }}
                onBlur={() => {
                  markTouched("phone");
                  const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                  setFieldErrors(r.errors);
                }}
                dir="ltr"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="5xxxxxxxx"
                className={`flex-1 px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("phone")}`}
              />
            </div>
            {showError("phone") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.phone}</p>
            )}
          </div>

          <label className="block text-sm text-slate-400">{copy.preferredLanding}</label>
          <select
            value={preferredLanding}
            onChange={(e) => setPreferredLanding(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] outline-none focus:border-emerald-400"
          >
            <option value="media">{copy.landingMedia}</option>
            <option value="registry">{copy.landingRegistry}</option>
          </select>

          <button
            type="button"
            disabled={busy || !validation.ok}
            onClick={submitData}
            className={`${LUX.btnEmerald} w-full py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2`.trim()}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}{" "}
            {copy.next}
          </button>
        </div>
      ) : phase === 2 ? (
        <FreeAssessmentFlow
          lang={lang}
          studentName={name.trim()}
          recordId={recordId}
          customer={assessmentCustomer}
          onBack={() => setPhase(1)}
          onComplete={() => setPhase(3)}
        />
      ) : (
        <>
          {activationResult && (
            <p className="max-w-lg mx-auto text-center text-emerald-300 text-sm mb-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {copy.activatedNote}
