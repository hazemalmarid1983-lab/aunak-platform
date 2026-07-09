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
