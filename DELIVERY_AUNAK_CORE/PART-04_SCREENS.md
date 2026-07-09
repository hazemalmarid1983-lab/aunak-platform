# الجزء 4 — الشاشات

> منصة عونك الأصلية · Aunak Core · يوليو 2026  
> **وصف واقعي** لكل شاشة كما تظهر للمستخدم — بدون إعادة تصميم.

---

## 4.1 خريطة المسارات العليا (`App.jsx`)

```
App (ErrorBoundary → AuthProvider)
│
├─ /payment/return ──────────────► PaymentReturn
├─ /child ───────────────────────► ChildInteractiveShell
├─ /parent ──────────────────────► ParentShell
├─ /summer-academy ──────────────► SummerAcademyShell → AunakSummerAcademy
│                                    (إن لا user → AunakGate)
└─ / (default) ──────────────────► GatedPlatform
                                     ├─ AunakGate (no session)
                                     ├─ AunakActivationGate (pending sub)
                                     ├─ PostActivationBiometric (no face)
                                     └─ AunakEcosystemHub (ready)
```

**لا react-router** — كل التوجيه عبر `window.location.pathname`.

---

## 4.2 شاشة البوابة — `AunakGate`

**المسار:** `/` (عند عدم وجود جلسة)

**العناصر:**
- شعار المنصة + عنوان "بوابة عونك السيادية"
- **الوضع الافتراضي:** مسح بصمة (`AunakBiometrics` — autoEnterOnMatch)
- **تبديل:** "دخول بالتوكن" — نموذج توكن Access Control
- **زر:** "تسجيل طالب جديد" → يفتح `AunakEnrollment` full-screen
- **شريط رابط:** URL قابل للمشاركة للتسجيل (`?enroll=1`)
- **تبديل لغة:** AR / EN

**حالات:**
- loading (تحميل face-api models)
- scanning (كاميرا نشطة)
- match found → بناء جلسة → GatedPlatform
- no match → رسالة خطأ
- token mode → verifyAccessToken

---

## 4.3 شاشة التفعيل — `AunakActivationGate`

**متى تظهر:** `needsActivationGate(user)` — اشتراك pending/expired

**العناصر:**
- خلفية blur للمنصة خلف البوابة
- اسم الطفل + سبب القفل (`activationGateReason`)
- **حقل كود تفعيل:** `AUN-{PLAN}-XXXX-YYYY`
- **زر دفع:** `PaymentCheckoutButton` (Tap/Mock)
- **بطاقات الباقات:** free · tutor · medical · institution · assessment_only
- بعد النجاح: `TriplePortalCards` (روابط parent/child/specialist)

---

## 4.4 شاشة البصمة بعد التفعيل — `PostActivationBiometric`

**متى تظهر:** اشتراك active + لا `face_biometric` على سجل الطفل

**العناصر:**
- عنوان "تسجيل بصمة الطفل"
- كاميرا + face-api capture
- عتبة التحقّق: **82%** (enrollment mode)
- **Anti-spoof:** فحص uniqueness ≥94.7% عبر `assertFaceUniqueInRegistry`
- زر "اكتمل" → `onComplete()` → EcosystemHub

**قاعدة صارمة:** الكامera **محجوبة** قبل `subscription_status = active`.

---

## 4.5 البوابة السريرية — `AunakEcosystemHub`

**المسار:** `/` (بعد اجتياز البوابات)

**التخطيط:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo · اسم المستخدم · Stealth · Audio · Lang · Logout │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                           │
│          │                                              │
│ MAIN (12)│  [Active Section Component]                  │
│ ──────── │                                              │
│ LIVE (6) │  + SovereignCommandBar (owner)               │
│          │  + Paywall overlay (if locked)               │
└──────────┴──────────────────────────────────────────────┘
```

**التبويب الافتراضي:**
- admin/specialist → `live`
- parent → `media`

**Stealth:** 5 نقرات على الشعار → `toggleAppStealth()` → إخفاء أقسام حسّاسة

---

## 4.6 شاشات الأقسام الرئيسية (12)

### 4.6.1 تسجيل الطلاب — `AunakEnrollment`
- **4 مراحل:** بيانات → تقييم → تفعيل → بصمة
- (تفصيل كامل في الجزء 5)

### 4.6.2 سجل الجلسات — `AunakSessionRegistry`
- قائمة جلسات يومية
- `GoalEngine` — أهداف الجلسة + محاولات
- مطابقة يومية (reconciliation)
- PIN verification
- ختم claim → `Sealed`
- `SettlementConfirmModal`

### 4.6.3 مقاييس التشخيص — `AunakDiagnostics`
- مقاييس: CARS-2 · GARS-3 · VB-MAPP
- تقرير zero-point من سجل الطفل
- عرض `initial_assessment_score`

### 4.6.4 مكتبة الوسائط — `AunakSafeMedia`
- قائمة وسائط من Airtable (title, category, duration, encrypted)
- تشغيل/عرض
- ختم جلسة child-seal عند engagement threshold

### 4.6.5 تعديل السلوك — `AunakBehaviorMod`
- خطط ABC من جدول abcData
- case_id · programmed_goal · behavior · intensity · crisis_score
- سرد تقدّم AI narrative

### 4.6.6 الفصول — `AunakClassrooms`
- تجميع طلاب حسب `assigned_class`

### 4.6.7 المكتبة العلمية — `AunakScientificItems`
- بنود علمية + weight + usage_count
- اقتراحات IEP

### 4.6.8 إدارة الأخصائيين — `AunakSpecialists` *(سيادي)*
- roster: name · specialty · email · phone · cases · rating
- admin_notes (قابل للتعديل من المالك)

### 4.6.9 موارد المجتمع — `AunakResources`
- موارد من communityResources
- فلاتر: type · audience · rating

### 4.6.10 مركز الأبحاث — `AunakResearchHub`
- تصدير بيانات مُ anonymized
- PII censor + AES export

### 4.6.11 تقارير الأداء — `AunakReportsDashboard`
- فترات: أسبوعي · شهري
- طباعة/export
- مصدر: جلسات `Sealed` فقط

### 4.6.12 التحكم السيادي — `AunakAccessControl` *(سيادي)*
- عرض Access Control table
- stealth controls · roadmap stats

---

## 4.7 شاشات التبويبات الحية (6)

### 4.7.1 السجل الحي — `AunakLiveDashboard`
- قائمة طلاب حية + harmony scores
- B2B: eye-tracking heatmap (`eye_movement_map`)

### 4.7.2 الدرع الذكي — `AunakCrisisManagement`
- مؤشر خطر ABC-weighted live
- تنبيهات meltdown fused

### 4.7.3 صعوبات التعلم — `AunakLearningCenter`
- بيانات learningDifficulties
- focus_level · t_static · academic_progress
- gaze neutrality alerts

### 4.7.4 مختبر الألحان — `AunakEmotionalLab`
- أنماط melodyLab
- ربط emotionalMonitoring

### 4.7.5 البصمة الحيوية — `AunakBiometrics`
- **وضع Hub:** تسجيل/مطابقة وجه لطالب نشط
- عرض biometric_status · face_biometric presence

### 4.7.6 مجتمع عونك — `AunakCommunityChat`
- دردشة أقران
- moderator: regex blocks names/diagnoses/contacts

---

## 4.8 واجهة الطفل — `ChildInteractiveShell`

**المسار:** `/child?token=AUN-CHD-…`

**الشاشة:**
```
┌─────────────────────────────────────┐
│ Header: عنوان · subtitle · lang   │
├─────────────────────────────────────┤
│                                     │
│  [Tab Content]                      │
│   home → ChildHomePanel             │
│   play → ChildPlayZone              │
│   calm → ChildCalmZone              │
│   stars → ChildStarsPanel           │
│                                     │
├─────────────────────────────────────┤
│ ChildBottomNav: 🏠 🎮 🌊 ⭐        │
└─────────────────────────────────────┘
```

**الثيم:** `CHILD` — سماء برتقالية/مرحة (ليس ثيم تواصل الذهبي)

**المكافآت:**
- نجوم تتراكم في play
- 5 نجوم → `triggerChildIslandSeal` → `/api/session/child-seal`

**حالات خطأ:**
- token missing → رسالة
- token invalid → رسالة
- loading → spinner

---

## 4.9 لوحة ولي الأمر — `ParentDashboard`

**المسار:** `/parent?token=AUN-PRT-…`

**بعد ParentBiometricGate:**

```
┌─────────────────────────────────────┐
│ بطاقة هوية الطفل                    │
│ name · plan · subscription · diagnosis │
├─────────────────────────────────────┤
│ §1 التقييم الأولي                   │
│ AssessmentResultScreen              │
├─────────────────────────────────────┤
│ §2 الجلسات المختومة (90 يوم)        │
│ من /api/parent/sessions             │
├─────────────────────────────────────┤
│ §3 مؤشرات العلاج                    │
│ goal · harmony · progress bars      │
└─────────────────────────────────────┘
```

---

## 4.10 الأكاديمية الصيفية — `AunakSummerAcademy`

**المسار:** `/summer-academy`

**Views (state machine):**
```
welcome → hub → parentZone
```

| View | الشاشة | المحتوى |
|------|--------|---------|
| welcome | `AcademyWelcomeMission` | أسئلة baseline صامتة |
| hub | `AcademyTrackHub` | 4 tracks + brain wheel + leaderboard |
| parentZone | `AcademyParentZone` | تقرير أسبوعي + leap certificate |

**Tracks:** arabic · math · english · brain

---

## 4.11 شاشات الدفع

### `PaymentCheckoutButton`
- يظهر داخل ActivationGate / Paywall
- POST `/api/payment/create-checkout` → redirect Tap

### `PaymentReturn`
- **المسار:** `/payment/return`
- GET `/api/payment/verify-return`
- عرض نتيجة: success / failed / pending
- redirect للتسجيل أو Hub

### `AunakPaywall`
- overlay زجاجي فوق قسم مقفل
- مقارنة باقات + promo videos

---

## 4.12 شاشات التقييم

### `FreeAssessmentFlow`
- 6 أسئلة · slider 0–3 · ~3 دقائق
- progress bar
- حفظ score → Airtable

### `AssessmentResultScreen`
- score % · band · strengths · focus areas
- recommendation AR/EN

### `AssessmentPromoModal`
- CTA: "فعّل الآن" / checkout

---

## 4.13 شاشات مساعدة

| الشاشة | متى |
|--------|-----|
| `ErrorBoundary` fallback | خطأ React غير متوقع |
| Loading spinner (GatedPlatform) | جاري فحص biometric gate |
| `AirtableStatus` | مؤشر اتصال (إن ظهر) |
| `SovereignMasterBypassPanel` | QA — owner only |

---

## 4.14 ملخص: من أول شاشة إلى آخر شاشة

```
زائر → AunakGate
  ├─ تسجيل → Enrollment (4 phases) → Hub
  ├─ بصمة → ActivationGate? → BiometricGate? → Hub
  └─ توكن → Hub

Hub → 18 section/tab screens

Parent token → BiometricGate → ParentDashboard (3 sections)

Child token → 4-tab play world → seal at 5 stars

Summer → welcome → hub (4 tracks) → parent zone

Payment → Tap → PaymentReturn → resume enrollment/activation
```

---

*التالي: [الجزء 5 — سير العمل](./PART-05_WORKFLOWS.md)*
