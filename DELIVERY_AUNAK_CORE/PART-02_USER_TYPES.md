# الجزء 2 — أنواع المستخدمين

> منصة عونك الأصلية · Aunak Core · يوليو 2026

---

## 2.1 ملخص أنواع المستخدمين

| النوع | كود الدور | طريقة الدخول | الوجهة بعد الدخول |
|-------|-----------|--------------|-------------------|
| **المالك السيادي** | `admin` + `isSovereignOwner()` | توكن Access Control أو بصمة ≥94.7% | كل الأقسام بما فيها `access` و`specialists` |
| **مدير سريري** | `admin` | `access_token` في Access Control | 16 قسم سريري (`CLINICAL_MANAGER_SECTIONS`) |
| **أخصائي** | `specialist` | توكن Access Control | `landingSection: registry` + أقسام سريرية |
| **ولي أمر (بوابة رئيسية)** | `parent` | بصمة وجه الطفل عند `AunakGate` | `preferred_destination` أو حسب الباقة |
| **ولي أمر (بوابة معزولة)** | — | `/parent?token=AUN-PRT-{32hex}` | `ParentBiometricGate` → `ParentDashboard` |
| **طفل** | — | `/child?token=AUN-CHD-{32hex}` | `ChildInteractiveShell` (4 تبويبات) |
| **زائر تسجيل** | — | `AunakGate` → وضع التسجيل أو `?enroll=1` | معالج 4 مراحل `AunakEnrollment` |
| **مستخدم أكاديمية** | أي جلسة نشطة | `/summer-academy` | `AunakSummerAcademy` |
| **عائد من الدفع** | — | `/payment/return` | `PaymentReturn` |

---

## 2.2 الأدوار (Roles) — `src/lib/auth.jsx`

```javascript
ROLES = { ADMIN: "admin", SPECIALIST: "specialist", PARENT: "parent" }
```

### المالك السيادي
- **البريد:** `hazem@aunak-center.com` (`SOVEREIGN_OWNER_EMAIL`)
- **الصلاحية:** `isSovereignOwner()` → كل الأقسام + `SOVEREIGN_ONLY_SECTIONS` (`access`, `specialists`)
- **ميزات إضافية:** `useRoadmapStats`, أوامر صوتية `SovereignCommandBar`, لوحة Master Bypass

### المدير السريري (`admin`)
- **الأقسام:** `CLINICAL_MANAGER_SECTIONS` (16 قسم — بدون `access`/`specialists` الحصريين)
- **يُستنتج من:** `access_level = admin` أو صلاحية "الإعدادات المتقدمة" في Access Control

### الأخصائي (`specialist`)
- **الأقسام:** live, registry, diagnostics, behavior, classrooms, scientific, learning, emotion, crisis, media, enrollment, biometrics, community, research, reports
- **جلسة سريرية:** `buildSpecialistClinicalSession` — يفعّل مراقب النظرة، المحرك العصبي، عدّاد 66 حقلاً

### ولي الأمر (`parent`)
- **الأقسام:** media, community, biometrics, resources, emotion, reports, summerAcademy
- **قيود:** يمر ببوابة التفعيل (`needsActivationGate`) إن كان الاشتراك pending/expired

---

## 2.3 الباقات (Plans) — Value Lock — `src/lib/plans.js`

| الكود | التسمية (AR) | الترتيب | أقسام مفتوحة (ملخّص) |
|-------|-------------|---------|----------------------|
| `free` | المنصة المجتمعية | 0 | community, resources |
| `tutor` | المدرس الخصوصي | 1 | + media, biometrics, emotion, learning, classrooms |
| `medical` | الأطباء والعيادات | 2 | + diagnostics, crisis, live, scientific, reports |
| `institution` | المراكز والوزارات | 3 | + registry, behavior, enrollment, specialists, research, access |
| `assessment_only` | باقة التقييم الشامل | استثناء | **diagnostics + enrollment فقط** |

### هبوط بعد التفعيل (`PLAN_LANDING`)
| الباقة | القسم الافتراضي |
|--------|----------------|
| free | community |
| tutor | media |
| medical | diagnostics |
| institution | registry |
| assessment_only | diagnostics |

### أقسام Premium (تتطلب اشتراك active)
- `emotion` (مختبر الألحان)
- `crisis` (الدرع الذكي)
- المدير (`admin`) يتجاوز قفل الاشتراك

---

## 2.4 طرق الدخول بالتفصيل

### أ) الدخول البيومتري — `AunakGate.jsx` (الوضع الافتراضي)
1. المستخدم يفتح `/`
2. `AunakGate` يعرض `AunakBiometrics` بوضع `gateMode: autoEnterOnMatch`
3. face-api يلتقط الوجه ويطابقه بسجل الطالب
4. عند ≥**94.7%** → `sovereignLogin.js` يبني الجلسة
5. خصم انسجام 20% عند الدخول + توجيه ذكي:
   - `status = new` → diagnostics
   - `status = active` → `preferred_destination`

### ب) دخول الأخصائي/الإدارة بالتوكن
1. نموذج توكن في `AunakGate`
2. `verifyAccessToken(token)` يبحث في **Access Control** (`access_token` أو `user_email`)
3. يستنتج الدور والباقة → جلسة سريرية

### ج) التسجيل العام
1. زر "تسجيل طالب جديد" في `AunakGate` أو رابط `?enroll=1`
2. يفتح `AunakEnrollment` (4 مراحل — انظر الجزء 5)
3. **لا دخول للبوابة** حتى اكتمال البصمة بعد التفعيل

### د) بوابة ولي الأمر المعزولة
1. `/parent?token=AUN-PRT-XXXXXXXX`
2. `parentAccess.js` → `findStudentByParentToken`
3. `ParentBiometricGate` (تحقّق وجه) → `ParentDashboard`

### هـ) بوابة الطفل المعزولة
1. `/child?token=AUN-CHD-XXXXXXXX`
2. `childAccess.js` → `findStudentByChildToken`
3. `ChildInteractiveShell` — **4 تبويبات:** home · play · calm · stars

### و) الأكاديمية الصيفية
1. `/summer-academy`
2. إن لا جلسة → `AunakGate`
3. إن جلسة نشطة → `AunakSummerAcademy`

---

## 2.5 ثلاثية الوصول (Triple Access) — `tripleAccessProtocol.js`

عند **تفعيل الاشتراك** (كود أو دفع) تُولَّد تلقائياً على سجل الطالب:

| التوكن | البادئة | الرابط |
|--------|---------|--------|
| ولي الأمر | `AUN-PRT-{32hex}` | `/parent?token=…` |
| الطفل | `AUN-CHD-{32hex}` | `/child?token=…` |
| الأخصائي/مدرّس | `AUN-SPC-{32hex}` | `/?section=specialists&token=…` |

تُعرض في `TriplePortalCards` داخل `AunakActivationGate` بعد التفعيل الناجح.

---

## 2.6 الجلسة (Session Object)

**المخزن:** `sessionStorage` → `aunak.session.v1`

**حقول الجلسة الشائعة:**
```
role, plan, name, email, recordId, childId, childName,
dynamicSessionId, landingSection, biometricSovereign,
subscriptionActivated, subscriptionRaw, assessmentOnlyMode,
activeStudentId, activeTab, sovereignFullView, ...
```

**تحديث جزئي:** `patchSession({ ... })` — يُستخدم بعد التفعيل/تبديل الطالب.

---

## 2.7 مصفوفة الصلاحيات — `canAccessSection(user, role, sectionId)`

```
1. SOVEREIGN_ONLY (access, specialists) → المالك السيادي فقط
2. biometricSovereign → BIOMETRIC_SOVEREIGN_SECTIONS (16 قسم)
3. isSovereignOwner → كل شيء
4. admin → CLINICAL_MANAGER_SECTIONS
5. ROLE_ACCESS[role] → قائمة الأقسام المسموحة
6. planAllows(plan, sectionId) → Value Lock حسب الباقة
7. PREMIUM_SECTIONS (emotion, crisis) → اشتراك active
8. assessment_only → diagnostics + enrollment فقط
9. Stealth mode → إخفاء أقسام حسب studentPrivacy.js
```

---

## 2.8 Master Bypass (QA فقط)

| العنصر | القيمة |
|--------|--------|
| المفتاح | `AUNAK-MASTER-2026` |
| التفعيل | `?master=AUNAK-MASTER-2026` أو `SovereignMasterBypassPanel` |
| التأثير | يتجاوز `assertFaceUniqueInRegistry()` (منع الوجه المكرر) |
| **تحذير** | للاختبار الداخلي فقط — ليس للإنتاج العام |

---

*التالي: [الجزء 3 — الوحدات](./PART-03_MODULES.md)*
