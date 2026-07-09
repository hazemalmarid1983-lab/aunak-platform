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
