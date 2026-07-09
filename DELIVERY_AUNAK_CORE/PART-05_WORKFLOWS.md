# الجزء 5 — سير العمل (Workflows)

> منصة عونك الأصلية · Aunak Core · يوليو 2026

---

## 5.1 سير عمل الدخول الكامل

```
                    ┌─────────────┐
                    │   زائر /    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         /child?token  /parent?token   /
              │            │            │
              ▼            ▼            ▼
         ChildShell   ParentShell   AunakGate
              │            │            │
              │       BiometricGate   ├── biometric → session
              │            │            ├── token → session
              ▼            ▼            └── enroll → Enrollment
         4-tab play   Dashboard
```

---

## 5.2 سير عمل التسجيل (Enrollment Funnel) — 4 مراحل صارمة

**المكوّن:** `AunakEnrollment.jsx`  
**التحقّق:** `enrollmentValidation.js`

| # | المرحلة | ماذا يحدث | أين تنتهي |
|---|---------|-----------|-----------|
| 1 | **Register data** | اسم (جزءان+ · حروف) · عمر 2–18 · هاتف حقيقي | `createStudentRecord` → Airtable: `status=new`, `subscription_status=pending` |
| 2 | **Free assessment** | `FreeAssessmentFlow` — 6 مجالات | `initial_assessment_score` محفوظ + promo modal |
| 3 | **Activation gate** | كود أو Tap checkout | `subscription_status=active`, `plan_code`, triple tokens, +1 month expiry |
| 4 | **Biometric** | `PostActivationBiometric` | `face_biometric` + `biometric_status=approved` |

**قواعد صارمة:**
- الزر معطّل حتى `validation.ok` في المرحلة 1
- **الكamera محجوبة** قبل active subscription
- Anti-spoof: duplicate face ≥94.7% → `FACE_DUPLICATE_BLOCKED`
- Enrollment match threshold: **82%**

**استئناف بعد الدفع:**
- URL `?payment=done`
- أو `sessionStorage` draft عبر `paymentClient.js`

---

## 5.3 سير عمل التقييم المجاني

```
AunakEnrollment (phase 2)
  → FreeAssessmentFlow
      → 6 questions (0–3 each domain)
      → initialAssessmentEngine.js scores
      → save initial_assessment_score to Airtable
      → AssessmentResultScreen
      → AssessmentPromoModal (CTA activation)
```

**المجالات الستة:** التواصل · الاجتماعي · السلوك · الحسّي · اللغة · المرونة

**النطاقات:**
| Score | Band |
|-------|------|
| <36 | balanced |
| 36–65 | moderate |
| ≥66 | elevated |

---

## 5.4 سير عمل الدفع (Tap Payments)

```
PaymentCheckoutButton
  → POST /api/payment/create-checkout
      (السعر من paymentPlans.js server-side)
  → redirect to Tap checkout URL
  → user pays
  → Tap webhook → POST /api/payment/webhook
      → verify hashstring (tapPayments.js)
      → processCapturedPaymentCharge
      → activateStudentAfterPayment
          subscription_status = active
          plan_code = ...
          generate triple tokens
          subscription_expires_at = +1 month
  → user returns → /payment/return
      → GET /api/payment/verify-return
      → PaymentReturn UI
```

**Mock mode:** `MOCK_PAYMENTS=true` أو غياب `TAP_SECRET_KEY` → mock-complete/mock-fire

---

## 5.5 سير عمل التفعيل بالكود

```
AunakActivationGate
  → user enters AUN-{PLAN}-XXXX-YYYY
  → POST /api/activation/redeem
      → validate code format + prefix
      → update student record
      → generateTripleDeviceTokens()
      → return portal links
  → TriplePortalCards displayed
  → patchSession({ subscriptionActivated: true, ... })
  → biometric gate next
```

**بادئات الكود:**
| Prefix | Plan |
|--------|------|
| FREE | free |
| TUTOR | tutor |
| MEDICAL | medical |
| INST | institution |
| ASSESS | assessment_only |

**إصدار أكواد:** `node scripts/issue.js`

---

## 5.6 سير عمل البصمة

### تسجيل (Enrollment / PostActivation)
```
PostActivationBiometric
  → useBiometricScan({ enrollmentMode: true })
  → captureStableDescriptor() — 5 frames averaged
  → assertFaceUniqueInRegistry() — scan ALL students
  → if duplicate ≥94.7% → BLOCK (unless master bypass)
  → match at 82% threshold for verify
  → updateStudentRecord({ face_biometric, biometric_status: approved })
```

### دخول سيادي (Gate)
```
AunakGate → AunakBiometrics
  → matchStudentByFaceDescriptor()
  → threshold 94.7%
  → sovereignLogin.buildSession()
  → harmony −20% on login
  → smart routing (new→diagnostics, active→preferred_destination)
```

---

## 5.7 سير عمل GatedPlatform (بعد الدخول)

```
GatedPlatform
  │
  ├─ user.tawasulMvp? → (خارج نطاق هذا التسليم)
  │
  ├─ !user → AunakGate
  │
  ├─ needsActivationGate(user) → AunakActivationGate
  │     onActivated/onSkip → patchSession → biometricGate='required'
  │
  ├─ biometricGate === null → loading spinner
  │     (fetchStudents → check face_biometric)
  │
  ├─ biometricGate === 'required' → PostActivationBiometric
  │     onComplete → biometricGate='done'
  │
  └─ biometricGate === 'done' → AunakEcosystemHub
```

---

## 5.8 سير عمل الجلسة السريرية (Session Registry)

```
AunakSessionRegistry
  │
  ├─ Select active student
  ├─ GoalEngine — set/view goals
  │     → goalAttempts table (or localStorage fallback)
  │     → AUN-4611 attestation check before billing
  │
  ├─ Daily reconciliation
  │     → match sessions to students
  │
  ├─ PIN verification (specialist)
  │
  └─ Seal claim
        → settlementEngine.createSealedSessionClaim()
        → DailySession: claim_status=Sealed, immutable_hash, sealed_at
        → assertClaimNotSealed prevents re-edit
```

**Financial attestation (AUN-4611):**
- `verifyAun4611SessionAttestation()` — child biometric within ±8h of session

---

## 5.9 سير عمل لعب الطفل + الختم

```
ChildInteractiveShell
  → token verify (childAccess.js)
  → 4 tabs: home · play · calm · stars
  → ChildPlayZone interactions → stars++
  → at 5 stars (production) OR interaction threshold:
      triggerChildIslandSeal()
        → POST /api/session/child-seal
        → childSessionSeal.js
        → create DailySession row (Sealed)
```

---

## 5.10 سير عمل التقارير

```
AunakReportsDashboard
  → reportEngine.aggregateSealedSessions()
  → filter: claim_status = Sealed
  → periods: weekly / monthly
  → printable HTML export

ParentDashboard §2
  → GET /api/parent/sessions?studentId=...
  → last 90 days sealed sessions
```

---

## 5.11 سير عمل الأكاديمية الصيفية

```
AunakSummerAcademy
  │
  ├─ welcome: AcademyWelcomeMission
  │     → silent baseline questions
  │     → summerAcademyEngine.setSilentLevels()
  │
  ├─ hub: AcademyTrackHub
  │     → 4 tracks (arabic, math, english, brain)
  │     → XP · streaks · daily tasks
  │     → AcademyBrainWheel mini-game
  │     → AcademyLeaderboard
  │     → persist: summerAcademyAirtable (or localStorage)
  │
  └─ parentZone: AcademyParentZone
        → weekly report
        → leap certificate (parent/admin view)
```

---

## 5.12 سير عمل Value Lock (Paywall)

```
User navigates to section X
  → sectionCanAccess(user, X)
      → canAccessSection(role, X)?
      → planAllows(plan, X)?
      → isSubscriptionActive(subscription)?
      → PREMIUM_SECTIONS check?
  → if blocked → AunakPaywall overlay
  → if assessment_only → only diagnostics + enrollment visible
```

---

## 5.13 سير عمل Stealth Mode

```
5 taps on PlatformLogo
  → toggleAppStealth()
  → isSectionHiddenInStealth(sectionId)
  → hides sensitive sections from sidebar
  → studentPrivacy.js masks financial/clinical fields
```

---

## 5.14 سير عمل التسوية المالية

```
AunakSessionRegistry → settlement flow
  → SettlementConfirmModal
  → POST /api/settlement/seal
  → specialistAttestation HMAC signature
  → sovereignApproved seal
```

---

## 5.15 جدول: أين تنتهي كل عملية

| العملية | البداية | النهاية (مصدر الحقيقة) |
|---------|---------|------------------------|
| الدخول | توكن/بصمة | `sessionStorage` aunak.session.v1 |
| التسجيل | نموذج phase 1 | Airtable Students `status=active`, `subscription=pending` |
| التقييم | 6 أسئلة | `initial_assessment_score` على Students |
| التفعيل | كود/دفع | `subscription=active` + triple tokens + expiry |
| البصمة | PostActivation | `face_biometric` JSON على Students |
| جلسة لعب | 5 نجوم/تفاعل | DailySession `Sealed` |
| claim سريري | PIN + seal | DailySession `Sealed` + hash |
| تقرير | Reports dashboard | HTML print من sealed sessions |
| أكاديمية | track task | summerAcademy table أو localStorage |
| دفع | checkout | webhook → student activated |

---

*التالي: [الجزء 6 — الذكاء الاصطناعي](./PART-06_AI.md)*
