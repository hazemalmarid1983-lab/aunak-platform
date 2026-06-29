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
