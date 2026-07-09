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
