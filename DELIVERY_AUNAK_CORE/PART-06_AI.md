# الجزء 6 — الذكاء الاصطناعي والمعالجة

> منصة عونك الأصلية · Aunak Core · يوليو 2026

**تعريف "الذكاء" في عونك:** رؤية حاسوبية (face-api) + خوارزميات حتمية rule-based + صوت/نطق + تشفير.  
**لا LLM داخلي.** التكامل الخارجي الوحيد = ElevenLabs TTS (اختياري).

---

## 6.1 بصمة الوجه — `biometricMatch.js` + `useBiometricScan.js`

### المحرك
- **@vladmandic/face-api** (TensorFlow.js)
- نماذج CDN jsDelivr: `tinyFaceDetector`, `faceLandmark68Net`, `faceRecognitionNet`
- مخرج: متجه **128 float** (`descriptor`)
- المسافة: Euclidean → similarity = `(1 - distance/0.6) * 100`

### العتبات
| الثابت | القيمة | الاستخدام |
|--------|--------|-----------|
| `SOVEREIGN_MATCH_CONFIDENCE` | **94.7%** | دخول Gate + anti-spoof duplicate |
| `ENROLLMENT_MATCH_CONFIDENCE` | **82%** | verify أثناء enrollment/post-activation |
| `ANTI_SPOOF_DUPLICATE_CONFIDENCE` | **94.7%** | فحص الوجه المكرر across all students |

### الوظائف
| Function | الوظيفة |
|----------|---------|
| `captureStableDescriptor()` | 5 إطارات → متوسط → بصمة أدق |
| `matchStudentByFaceDescriptor()` | أقرب طالب ≥94.7% |
| `assertFaceUniqueInRegistry()` | يمسح كل الطلاب — duplicate → `FACE_DUPLICATE_BLOCKED` |
| `studentHasFaceBiometric()` | فحص وجود بصمة على سجل |

### Master Bypass
- `AUNAK-MASTER-2026` يتجاوز duplicate check (QA only)

---

## 6.2 كاشف الانهيار — Meltdown AI

**الملف:** `useMeltdownPredictor.js`

| Parameter | Value |
|-----------|-------|
| `MELTDOWN_LATENCY_MS` | 280ms |
| Trigger | 3 interactions ≤280ms consecutive |

**السلوك:**
- يراقب زمن الاستجابة (click/touch/key)
- 3 bursts → `meltdownRisk = true`
- `playWarningPulse()` — نبضة صوتية
- يُدمج مع ABC crisis risk → `fusedCritical`

**يُستخدم في:** Hub (AunakEcosystemHub) + CrisisManagement

---

## 6.3 مراقب حياد النظرة — Gaze Neutrality

**الملف:** `useGazeNeutralityObserver.js`

| Parameter | Value |
|-----------|-------|
| `GAZE_HOLD_MS` | 5000ms |
| Condition | `focusLevel < 64` OR `t_static ≥ 5s` |

**السلوك:**
- hold 5s → typewriter alert sound
- CSS `lux-gaze-dim` — تعتيم محيطي
- توصية بنشاط جذب انتباه

**يُستخدم في:** Hub + LearningCenter

---

## 6.4 محرك الانسجام — Harmony Score

**الملف:** `harmonyEngine.js` + `useHarmonyEngine.js`

**المعادلة:**
```
harmony = (academic_progress + (100 - behavior_intensity)) / 2
```

**عقوبة الفجوة:**
```
if |academic - behavior| ≥ 20 → harmony × 0.8 (−20%)
```

**عند الدخول البيومتري:**
- `computeHarmonyAfterBiometricLogin()` — خصم 20% إضافي ثم إعادة حساب
- يُزامن → `harmony_score` على Airtable

---

## 6.5 محرك الأهداف — AUN-4611

**الملف:** `goalEngine.js` + `GoalEngine.jsx`

| Feature | Detail |
|---------|--------|
| Goal sources | IEP + ABC plans + Learning records |
| `buildApprovedGoalList()` | دمج الأهداف المعتمدة |
| `GOAL_REPORT_THRESHOLD` | 80% — للتقارير فقط (لا قفل تنقّل) |
| `suggestAlternateGoal()` | اقتراح بديل عند انخفاض success |
| Attestation | `verifyAun4611SessionAttestation()` — biometric ±8h |

**Summaries:**
- `summarizeSessionAttempts()`
- `summarizeWeeklyAttempts()`

---

## 6.6 محرك التقييم المجاني

**الملف:** `initialAssessmentEngine.js`

**6 domains × score 0–3:**
1. Communication
2. Social
3. Behavior
4. Sensory
5. Language
6. Flexibility

**Output:**
- `scorePercent` 0–100
- `band`: balanced / moderate / elevated
- `domainScores[]`
- `strengths[]`, `focusAreas[]`
- `title`, `summary`, `recommendation` (AR + EN)

**Storage:** `initial_assessment_score` on Students  
**Rebuild:** can reconstruct profile from saved score alone

---

## 6.7 الدرع الذكي — Crisis Risk (ABC)

**الملف:** `useCrisisAlerts.js`

**Formula:**
```
riskScore = Intensity × 2 + Frequency × 1.5 + Duration
```

**Data source:** abcData table (intensity, crisis_score, risk_label)

**UI:** `AunakCrisisManagement` — live risk index + alerts

---

## 6.8 الصوت والنطق

### sovereignAudio.js — Web Audio synthesis
| Function | Sound |
|----------|-------|
| `playWarningPulse()` | نبضة تحذير |
| `startProcessingHum()` | طنين معالجة |
| `playTypewriterEffect()` | آلة كاتبة |
| `playTaDaFanfare()` | لحن مكافأة Ta-da |
| `playSuccessChime()` | نغمة نجاح |
| `playStarDrop()` | نجمة |
| `startCalmDrone()` | درون هدوء |
| `startCalmDrone()` / calm pulse | تهدئة |

### sovereignVoice.js — Web Speech
- Supervisor voice commands → section navigation
- `SovereignCommandBar` integration

### academyVoice.js — TTS Queue
- `enqueueAcademySpeech(text, { lang, preferCloud })`
- `scriptWelcome()`, `scriptEncouragement()`
- Cloud first → Web Speech fallback

### api/academy/tts.js — ElevenLabs Proxy
- Model: `eleven_multilingual_v2`
- Returns: audio/mpeg
- 503 if no API key → client falls back to Web Speech

---

## 6.9 التشفير — Sovereign Crypto

**الملف:** `sovereignCrypto.js`

| Method | Algorithm |
|--------|-----------|
| `encryptSessionPayload` | AES-256-GCM |
| `decryptSessionPayload` | AES-256-GCM |
| `encryptForExport` | AES-256-GCM one-time key |

**Key derivation:** padded from `dynamicSessionId` / `childCode` / `activeStudentId`

**Used in:** research export · session field encryption

---

## 6.10 Moderator AI (Community Chat)

**الملف:** `AunakCommunityChat.jsx`

- **Rule-based regex** (not ML)
- Blocks: personal names · diagnosis terms · phone numbers · emails
- Purpose: peer support safety

---

## 6.11 Research Anonymizer

**الملف:** `research.js`

| Step | Action |
|------|--------|
| 1 | Strip PII fields |
| 2 | Smart censor remaining identifiers |
| 3 | AES encrypt export bundle |

**UI:** `AunakResearchHub`

---

## 6.12 Summer Academy Silent Assessment

**الملف:** `summerAcademyEngine.js`

- Welcome mission questions → silent baseline levels per track
- No explicit "test" UX — levels inferred
- Feeds track difficulty + XP progression

---

## 6.13 Scientific Items AI Weight

**الملف:** `AunakScientificItems.jsx` + scientificItems table

- Each item has `weight` score
- Used for IEP suggestion ranking (rule-based sort)

---

## 6.14 Behavior Mod AI Narrative

**الملف:** `AunakBehaviorMod.jsx`

- Progress narrative generated from ABC data trends
- Rule-based text (not LLM)

---

## 6.15 Live Dashboard B2B Eye Tracking

**الملف:** `AunakLiveDashboard.jsx`

- Reads `eye_movement_map` from student record
- Renders heatmap visualization
- Requires institution-tier plan (`isActiveB2B`)

---

## 6.16 ملخص: ما هو "ذكاء" وما ليس

| ✅ ذكاء/معالجة في المنصة | ❌ ليس في المنصة |
|--------------------------|------------------|
| face-api biometric | GPT / Claude / LLM |
| Harmony / Meltdown / Gaze rules | ML training pipeline |
| ABC crisis scoring | Cloud vision API |
| Assessment scoring | Automatic diagnosis |
| ElevenLabs TTS (optional) | Speech-to-text production |
| AES encryption | Blockchain |
| Community regex moderator | |

---

## 6.17 Hooks Map — أين يُفعَّل كل محرك

| Hook | Active in |
|------|-----------|
| `useHarmonyEngine` | AunakEcosystemHub |
| `useGazeNeutralityObserver` | Hub, LearningCenter |
| `useMeltdownPredictor` | Hub, CrisisManagement |
| `useCrisisAlerts` | CrisisManagement |
| `useBiometricScan` | Gate, Biometrics, PostActivation, ParentBiometricGate |
| `useActiveStudentMetrics` | Hub |
| `useGoalEngine` | SessionRegistry |
| `useAcademyVoice` | SummerAcademy, ChildGoalSpeaker |

---

*التالي: [الجزء 7 — قاعدة البيانات والمنطق](./PART-07_DATABASE_AND_LOGIC.md)*
