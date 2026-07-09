# الجزء 8 — المتبقي (بيئة · أمان · دين تقني · فهرس)

> منصة عونك الأصلية · Aunak Core · يوليو 2026

---

## 8.1 متغيّرات البيئة

### خادمية (Vercel — **بدون** بادئة VITE_)

| Variable | Purpose |
|----------|---------|
| `AIRTABLE_API_KEY` | PAT للقراءة/الكتابة |
| `AIRTABLE_BASE_ID` | `appaGfKj4vYhMw0cb` (production) |
| `AIRTABLE_DAILY_SESSIONS_TABLE_ID` | override اختياري |
| `TAP_SECRET_KEY` / `TAP_SECRET` | Tap Payments |
| `ELEVENLABS_API_KEY` | TTS cloud |
| `ELEVENLABS_VOICE_ID` | صوت TTS (optional) |
| `MOCK_PAYMENTS` | `true` = mock mode |

### عميلية (VITE_ — **تُحقن في bundle**)

| Variable | Purpose | ⚠️ |
|----------|---------|-----|
| `VITE_AIRTABLE_API_KEY` / `VITE_AIRTABLE_PAT` | direct Airtable | exposed |
| `VITE_AIRTABLE_BASE_ID` | base selection | |
| `VITE_USE_AIRTABLE_PROXY` | `true` → `/api/airtable` | **يُفترض true في prod** |
| `VITE_AIRTABLE_STUDENTS_TABLE_ID` | students override | |
| `VITE_AIRTABLE_SPECIALISTS_TABLE_ID` | specialists override | |
| `VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID` | sessions override | |
| `VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID` | goal attempts | |
| `VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID` | summer academy | |
| `VITE_AUNAK_MASTER_KEY` | override QA master key | |

> **لا يوجد `.env.example`** في المستودع — يحتاج إنشاء.

---

## 8.2 النشر (Deployment)

| Item | Value |
|------|-------|
| Host | Vercel |
| Production branch | `main` |
| URL | https://aunak.vercel.app |
| SPA rewrite | `vercel.json` — all → `index.html` except `/api/*` |
| Serverless | `api/` folder — Node ESM |
| Vercel plan | Hobby (function count limit applies) |

### Build
```bash
npm run dev      # local dev
npm run build    # → dist/
npm run preview  # preview production build
npm run lint     # eslint
```

---

## 8.3 السكربتات — `scripts/`

| Script | Purpose |
|--------|---------|
| `issue.js` | Issue activation codes `AUN-{PLAN}-XXXX-YYYY` |
| `airtable-diagnostic.mjs` | Diagnose Airtable connectivity |
| `test-routing.mjs` | Manual route tests |
| `test-mock-payment.mjs` | Mock payment flow test |
| `test-daily-sessions.mjs` | Daily sessions test |
| `tawasul-setup-base.mjs` | *(Tawasul sandbox — خارج النطاق)* |
| `english-island-fields.mjs` | *(English Island — خارج النطاق)* |

---

## 8.4 الاعتماديات

### Production dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.6 | UI |
| react-dom | ^19.2.6 | DOM |
| framer-motion | ^12.42.0 | Animation |
| lucide-react | ^1.16.0 | Icons |
| @vladmandic/face-api | ^1.7.15 | Face biometric |

### Dev dependencies
Vite 8 · Tailwind 3 · ESLint 10 · PostCSS · Autoprefixer

### External services (runtime)
| Service | Criticality |
|---------|-------------|
| Airtable REST | **Critical** — sole database |
| Vercel | **Critical** — hosting + API |
| Tap Payments | Important — billing |
| ElevenLabs | Optional — TTS fallback to Web Speech |
| jsDelivr CDN | Important — face-api models |

### Browser APIs required
WebGL/WASM · getUserMedia · Web Audio · Web Speech · Web Crypto · sessionStorage/localStorage

---

## 8.5 الأمان — ملخص

### نقاط القوة ✅
- Airtable proxy hides PAT (when enabled)
- Server-side pricing in create-checkout
- Webhook hashstring verification (Tap)
- Anti-spoof duplicate face ≥94.7%
- Sovereign login threshold 94.7%
- Biometric blocked until subscription active
- Sealed sessions immutable (`CLAIM_SEALED_IMMUTABLE`)
- AES-256-GCM encryption
- ASCII header sanitization
- Strict activation code / token regex

### مخاطر عالية ⚠️
| ID | Risk | Mitigation |
|----|------|------------|
| H1 | Airtable PAT in client bundle | Force proxy in production |
| H2 | Unsigned sessionStorage — role tampering | Server-side auth for writes |
| H3 | Master bypass hardcoded | Env-only, non-prod |

### مخاطر متوسطة
- No rate limiting on redeem/checkout
- Full-table token scan on client
- Biometric vectors processed client-side
- face-api models from public CDN
- No Origin restriction on API handlers

### Compliance note
Platform handles **minor health/biometric data** — requires parental consent, retention policy, encryption review.

---

## 8.6 الدين التقني

| # | Item | Impact |
|---|------|--------|
| 1 | No automated tests / CI | High — silent regressions |
| 2 | JS bundle >2MB, no code-splitting | High — slow first load |
| 3 | Duplicate activation logic (client vs server) | Medium |
| 4 | Dead code: ChildAwniCompanion, AunakEmotion | Medium |
| 5 | Airtable as OLTP — full scans | High strategic |
| 6 | goalAttempts/summerAcademy → localStorage fallback | Medium |
| 7 | Manual routing, no 404 | Medium |
| 8 | Distributed state (session + localStorage + hooks) | Medium |
| 9 | README is default Vite template | Low |
| 10 | No centralized error monitoring (Sentry) | Medium |
| 11 | No TypeScript | Medium |

### Priority remediation
| Priority | Items |
|----------|-------|
| P0 | Tests + CI · Airtable security (H1) |
| P1 | Code-splitting · unify activation logic |
| P2 | Dead code cleanup · router · error monitoring |
| P3 | README/.env · gradual TS |

---

## 8.7 التخزين المحلي (Storage Keys)

| Key | Store | Content |
|-----|-------|---------|
| `aunak.session.v1` | sessionStorage | User session |
| `aunak.sovereignMasterBypass.v1` | sessionStorage | QA bypass flag |
| `aunak.activationCodes.v1` | localStorage | Local activation codes |
| `aunak.dailySessions.v1` | localStorage | Session backup |
| `aunak.goalAttempts.v1` | localStorage | Goal attempts backup |
| `aunak.ledgerOverride.v1` | localStorage | Ledger override |
| enrollment/payment drafts | sessionStorage | via paymentClient.js |

---

## 8.8 وثائق تشغيل موجودة (داخل الم repo — ليست فلسفة)

| File | Purpose |
|------|---------|
| `docs/AIRTABLE_SCHEMA_PROTOCOL.md` | snake_case schema rules |
| `docs/SOVEREIGN_OPERATIONS_LOG.md` | Live operations log |
| `docs/الملخص_التنفيذي_السيادي_لمنصة_عونك.md` | Executive summary |

---

## 8.9 فهرس الملفات — Core Only

### Root
`index.html` · `package.json` · `vite.config.js` · `vercel.json` · `tailwind.config.js` · `eslint.config.js`

### Entry
`src/main.jsx` · `src/App.jsx` · `src/index.css` · `src/App.css`

### API (core)
`api/airtable.js` · `api/activation/redeem.js` · `api/payment/[action].js` · `api/session/child-seal.js` · `api/settlement/seal.js` · `api/parent/sessions.js` · `api/academy/tts.js` · `api/_handlers/dispatch.js` · `api/_handlers/payment/*`

### Components — Hub (Aunak*)
`AunakEcosystemHub` · `AunakGate` · `AunakEnrollment` · `AunakActivationGate` · `AunakPaywall` · `AunakAccessControl` · `AunakBehaviorMod` · `AunakBiometrics` · `AunakClassrooms` · `AunakCommunityChat` · `AunakCrisisManagement` · `AunakDiagnostics` · `AunakEmotionalLab` · `AunakLearningCenter` · `AunakLiveDashboard` · `AunakReportsDashboard` · `AunakResearchHub` · `AunakResources` · `AunakSafeMedia` · `AunakScientificItems` · `AunakSessionRegistry` · `AunakSpecialists` · `AunakSummerAcademy`

### Components — Child
`ChildInteractiveShell` · `ChildHomePanel` · `ChildPlayZone` · `ChildCalmZone` · `ChildStarsPanel` · `ChildBottomNav` · `ChildAvatar` · `ChildGoalSpeaker` · `ChildCelebration` · `ChildCalmOverlay`

### Components — Parent
`ParentShell` · `ParentBiometricGate` · `ParentDashboard`

### Components — Assessment / Payment / Academy
`FreeAssessmentFlow` · `AssessmentResultScreen` · `AssessmentPromoModal` · `PaymentCheckoutButton` · `PaymentReturn` · `TriplePortalCards` · `SettlementConfirmModal` · `PostActivationBiometric` · `AcademyWelcomeMission` · `AcademyTrackHub` · `AcademyBrainWheel` · `AcademyLeaderboard` · `AcademyParentZone` · + shell/mascot/background helpers

### Components — Sovereign / Utility
`SovereignCommandBar` · `SovereignMasterBypassPanel` · `GoalEngine` · `PlatformLogo` · `ErrorBoundary` · `AirtableStatus`

### Lib (core — 48 files)
See Part 3 §3.10 for full list

### Hooks (16 files)
See Part 3 §3.11 for full list

---

## 8.10 كود ميّت / غير مستخدم

| File | Status |
|------|--------|
| `ChildAwniCompanion.jsx` | Not imported — old design |
| `AunakEmotion.jsx` | Orphan — hub uses AunakEmotionalLab |
| `@deprecated` fields in `airtable.js` | Legacy aliases |
| `generateStudentId()` | Deprecated |

---

## 8.11 قيود Vercel Hobby

- Maximum serverless function count — affects API route consolidation
- Production uses consolidated `[action].js` routers via `createActionRouter`

---

## 8.12 ما هو خارج هذا التسليم (مرجع)

| Track | Branch | Route |
|-------|--------|-------|
| Tawasul | `Tawasul_MVP` | `VITE_TAWASUL_MVP=true` |
| English Talk Island | `Maryam_English_Island` | `/english?token=AUN-ENG-…` |
| Philosophy docs | untracked | `docs/philosophy/`, `domain-knowledge/` |

هذه المسارات **منفصلة** ولا تُعدّ جزءاً من عونك الأصلية الموصوفة في الأجزاء 1–8.

---

## 8.13 Checklist للمساعد الجديد

- [ ] Read Part 1–2 for vision + users
- [ ] Read Part 4 for every screen
- [ ] Read Part 5 for enrollment → payment → biometric funnel
- [ ] Read Part 7 for Airtable schema before any write
- [ ] Set `VITE_USE_AIRTABLE_PROXY=true` in production
- [ ] Never commit `.env.local` or PATs
- [ ] Test on Chrome (Web Speech support)
- [ ] Use `node scripts/issue.js` for activation codes in dev

---

*نهاية نسخة التسليم — 8 أجزاء.*  
*العودة إلى: [INDEX](./INDEX.md)*
