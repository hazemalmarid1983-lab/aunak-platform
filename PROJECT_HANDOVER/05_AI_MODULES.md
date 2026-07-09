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
