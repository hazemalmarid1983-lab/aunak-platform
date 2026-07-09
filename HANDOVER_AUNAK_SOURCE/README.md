# HANDOVER — شيفرة مصدر عونك الأصلية (Aunak Core Source)

> **مصدر:** فرع `main` · https://aunak.vercel.app · يوليو 2026  
> **يُكمّل:** مجلد `DELIVERY_AUNAK_CORE/` (الوصف التوثيقي — 8 أجزاء) الذي نسخته سابقاً.

---

## ما هذا المجلد؟

**نسخة تشغيلية من الشيفرة** — الملفات الفعلية التي يبني عليها المساعد الجديد (React + API + lib + hooks + scripts).

هذا **ليس** مشروعاً منفصلاً للنشر — هو **حزمة تسليم** من المستودع الحقيقي.

---

## كيف تستخدمها المساعد الجديد؟

1. اقرأ أولاً `../DELIVERY_AUNAK_CORE/INDEX.md` (الوصف الكامل).
2. افتح هذا المجلد لفهم **كيف** يُنفَّذ ما وُصف في الأجزاء الثمانية.
3. للتشغيل المحلي (بعد إعداد `.env.local` **لديك أنت فقط**):
   ```bash
   npm install
   npm run dev
   ```

---

## ما يشمله (184 ملف · ~2 MB)

| المجلد | المحتوى |
|--------|---------|
| `src/` | كل المكوّنات + lib + hooks (البوابة، الطفل، ولي الأمر، الأكاديمية…) |
| `api/` | دوال Vercel (دفع، تفعيل، Airtable proxy، child-seal…) |
| `scripts/` | issue.js · diagnostic · test scripts |
| `docs/` | AIRTABLE_SCHEMA_PROTOCOL · SOVEREIGN_OPERATIONS_LOG · الملخص التنفيذي |
| جذر | package.json · vite · vercel · tailwind · index.html |

---

## ما استُبعد (لا يخدم المساعد / يضر المشروع)

| مستبعد | السبب |
|--------|--------|
| `src/components/tawasul/` | مسار تواصل منفصل |
| `api/tawasul/` + `api/_handlers/tawasul/` | APIs تواصل |
| `scripts/tawasul-*` | إعداد sandbox تواصل فقط |
| `docs/TAWASUL_MVP.md` | وثيقة مسار منفصل |
| `docs/philosophy/` · `domain-knowledge/` … | طبقة فلسفة (غير على main أصلاً) |
| English Talk Island | غير على main |
| `.env*` · `node_modules/` · `dist/` | أسرار / مخرجات build |
| `DELIVERY_AUNAK_CORE/` · `PROJECT_HANDOVER/` · `CONTEXT_PARTS/` | لديك الوصف منفصلاً |

---

## تعديل في هذه النسخة

**`src/App.jsx`** — أُزيلت منه مسارات Tawasul UI (Gate/Hub) لأن مكوّناتها حُذفت من الحزمة.  
باقي الملفات من `main` كما هي.

**ملاحظة:** بعض ملفات `src/lib/tawasul*.js` **ما زالت موجودة** لأن واجهة الطفل تستخدم `tawasulChildTheme` للتنسيق الشرطي — لكن **مسار Tawasul معطّل** في `App.jsx` هنا.

---

## أمان — مهم

- **لا تُرفق** `.env.local` للمساعد.
- **لا تُشارك** PAT أو Tap secret أو ElevenLabs key.
- المساعد يعمل على **وصف + شيفرة** — البيانات الحية في Airtable تبقى عندك.

---

## العلاقة بمشروعك الحقيقي

```
aunak/                          ← المستودع الحي (git)
├── DELIVERY_AUNAK_CORE/        ← الوصف (8 أجزاء) — لديك
├── HANDOVER_AUNAK_SOURCE/      ← الشيفرة (هذا المجلد) — جديد
├── Maryam_English_Island       ← فرع منفصل (لا يُسلَّم)
└── Tawasul_MVP                 ← فرع منفصل (لا يُسلَّم)
```

**لا تدمج** `HANDOVER_AUNAK_SOURCE` في git كبديل للمشروع — هو **للتسليم فقط**.

---

*آخر تحديث: يوليو 2026*
