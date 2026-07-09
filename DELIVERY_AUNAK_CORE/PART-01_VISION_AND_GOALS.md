# الجزء 1 — الرؤية والهدف

> منصة عونك الأصلية · Aunak Core · يوليو 2026

---

## 1.1 ما هي منصة عونك؟

**عونك (Aunak)** منصّة رقمية سيادية متكاملة لدعم الأطفال ذوي **اضطراب طيف التوحّد** و**صعوبات التعلّم**، موجّهة للسوق العربي (**RTL أولاً** مع دعم إنجليزي في النصوص).

تجمع في مكان واحد:
- **بوابة سريرية** للأخصائيين والإدارة (تشخيص، سلوك ABC، فصول، صعوبات تعلّم، رصد عاطفي، أزمات، تقارير، بحث).
- **واجهة الطفل التفاعلية** (`/child`) — عالم لعب حسّي/بصري.
- **لوحة ولي الأمر** (`/parent`) — متابعة الطفل والجلسات والتقارير.
- **الأكاديمية الصيفية** (`/summer-academy`) — مسارات تعلّم مُلعّبة.
- **نظام تسجيل + تقييم مجاني + تفعيل/دفع + بصمة وجه بيومترية**.

**الإنتاج الحي:** https://aunak.vercel.app  
**قاعدة Airtable:** `appaGfKj4vYhMw0cb`

---

## 1.2 الأهداف الخمسة للمنصة

| # | الهدف | كيف تتحقق في المنصة |
|---|--------|----------------------|
| 1 | **تشخيص مبكّر وتحويل** | تقييم مجاني سريع (6 مجالات) → ملف مبدئي → دفع/تفعيل → تقييم شامل |
| 2 | **تأهيل مُدار سريرياً** | أدوات للأخصائي: أهداف إجرائية، سلوك ABC، انفعالات، Harmony Score، Focus، Behavior Intensity |
| 3 | **إشراك الطفل حسّياً** | واجهة طفل تُلعّب التعلّم: نطق، نجوم، مكافآت، منطقة هدوء |
| 4 | **سيادة البيانات والوصول** | هوية رقمية للطالب + **ثلاثية الوصول** (ولي أمر / طفل / أخصائي) + تحقّق بيومتري + منع تحايل |
| 5 | **محاسبة الجلسات** | ختم جلسات يومية **غير قابلة للتعديل** (`Sealed`) كمصدر حقيقة للفوترة |

---

## 1.3 الفلسفة التشغيلية (كما هي مُطبّقة في الكود)

- **الطفل رحلة وليس ملفاً:** سجل حيّ يتطور (تقييم → خطة → جلسات → تقارير).
- **Value Lock:** لا وصول كامل للمحتوى السريري قبل **اشتراك نشط** (`subscription_status = active`).
- **البصمة بعد الدفع:** الكامera/البيومترية **محجوبة** حتى `subscription_status = active`.
- **السيادة الرقمية:** ثلاثة توكنات منفصلة لكل طالب بعد التفعيل — بوابات معزولة.
- **الذكاء مساعد وليس بديلاً:** كل المحركات **حتمية (rule-based)** قابلة للتفسير؛ لا LLM داخلي.

---

## 1.4 الجمهور المستهدف

| الفئة | الدور في المنصة |
|-------|-----------------|
| **أخصائي / معالج** | إدارة الحالات، الجلسات، الأهداف، السلوك، التقارير |
| **مدير مركز / إدارة** | سجل الجلسات، التسوية، الأخصائيون، التحكم السيادي |
| **ولي أمر** | تسجيل الطفل، التفعيل، متابعة التقدّم، بوابة ولي الأمر |
| **الطفل** | واجهة لعب/تعلّم عبر `/child?token=…` |
| **المالك السيادي** | `hazem@aunak-center.com` — تجاوز كامل + أقسام حصرية |

---

## 1.5 حزمة التقنيات (Tech Stack)

| الطبقة | التقنية |
|--------|---------|
| الواجهة | React 19 + Vite 8 (SPA، **بلا SSR**) |
| التنسيق | Tailwind CSS 3 + PostCSS + `luxTheme.js` |
| الحركة | framer-motion 12 + CSS keyframes |
| الأيقونات | lucide-react |
| البيومترية | @vladmandic/face-api (نماذج jsDelivr CDN) |
| الخلفية | Vercel Serverless Functions (Node ESM) في `api/` |
| قاعدة البيانات | Airtable REST v0 (fetch أصلي، **بلا** حزمة airtable) |
| الدفع | Tap Payments (+ Mock للمعاينة) |
| الصوت/النطق | Web Audio · Web Speech · ElevenLabs TTS (اختياري) |
| التشفير | Web Crypto API (AES-256-GCM) |
| الاستضافة | Vercel · SPA rewrite عدا `/api` |

**ما لا يُستخدم:** TypeScript · Redux/Zustand · react-router (توجيه يدوي بالمسار).

---

## 1.6 الهيكل العام للمشروع

```
aunak/
├── index.html                 # SPA (lang="ar")
├── package.json
├── vite.config.js · vercel.json · tailwind.config.js
│
├── api/                       # Vercel Serverless
│   ├── airtable.js            # بروكسي Airtable
│   ├── academy/tts.js         # بروكسي ElevenLabs
│   ├── activation/redeem.js   # تفعيل كود
│   ├── payment/[action].js    # الدفع
│   ├── session/child-seal.js  # ختم جلسة الطفل
│   ├── settlement/seal.js     # ختم التسوية
│   └── parent/sessions.js     # جلسات ولي الأmer
│
├── src/
│   ├── main.jsx               # bootstrapMasterBypassFromUrl → App
│   ├── App.jsx                # الموجّه الأعلى (pathname)
│   ├── components/            # الواجهات (Aunak*, child/, parent/, summer-academy/, assessment/)
│   ├── hooks/                 # خطافات السلوك والتأثيرات
│   └── lib/                   # المنطق الأساسي
│
├── docs/                      # بروتوكولات تشغيل (AIRTABLE_SCHEMA, SOVEREIGN_OPERATIONS_LOG)
└── scripts/                   # أدوات Node (issue, diagnostic, test)
```

---

## 1.7 كيف يبدأ التطبيق (Bootstrap)

```
index.html
  → src/main.jsx
      1. bootstrapMasterBypassFromUrl()   # ?master=AUNAK-MASTER-2026 (QA فقط)
      2. createRoot(#root).render(<StrictMode><App/></StrictMode>)
  → App.jsx
      ErrorBoundary → AuthProvider → اختيار الواجهة حسب pathname
```

**AuthProvider** يقرأ/يكتب الجلسة من `sessionStorage` (`aunak.session.v1`).

---

## 1.8 نطاق هذا التسليم vs ما هو خارج النطاق

| داخل النطاق (عونك الأصلية) | خارج النطاق (مسارات منفصلة) |
|---------------------------|------------------------------|
| `/` → GatedPlatform → EcosystemHub | `/tawasul` أو `VITE_TAWASUL_MVP=true` |
| `/child`, `/parent`, `/summer-academy` | `/english` (English Talk Island) |
| `/payment/return` | `docs/philosophy/` وطبقة المعرفة الميدانية |
| قاعدة `appaGfKj4vYhMw0cb` | قاعدة sandbox `app3vCT2j2JepNVZa` |

---

*التالي: [الجزء 2 — أنواع المستخدمين](./PART-02_USER_TYPES.md)*
