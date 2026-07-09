# الجزء 3 — الوحدات

> منصة عونك الأصلية · Aunak Core · يوليو 2026

---

## 3.1 الحاوية الرئيسية — `AunakEcosystemHub.jsx`

البوابة السريرية الكاملة. تحتوي على:
- **قائمتان جانبيتان** مُفلترتان بالصلاحية
- **18 قسم/تبويب** (12 رئيسي + 6 حيّ)
- **Paywall** (`AunakPaywall`) عند قفل الباقة
- **Stealth mode** — 5 نقرات على الشعار → إخفاء أقسام
- **محركات نشطة:** Harmony · Gaze · Meltdown · ActiveStudentMetrics · RoadmapStats

---

## 3.2 الأقسام الرئيسية (MAIN_NAV — 12 قسم)

| ID | AR | EN | المكوّن | الوظيفة |
|----|-----|-----|---------|---------|
| `enrollment` | تسجيل الطلاب | Student Enrollment | `AunakEnrollment` | معالج تسجيل 4 مراحل |
| `registry` | سجل الجلسات | Session Registry | `AunakSessionRegistry` | جلسات ميدانية + GoalEngine + تسوية |
| `diagnostics` | مقاييس التشخيص | Diagnostics | `AunakDiagnostics` | CARS-2 / GARS-3 / VB-MAPP + تقرير zero-point |
| `media` | مكتبة الوسائط | Safe Media | `AunakSafeMedia` | وسائط آمنة مشفّرة + ختم جلسة عند التفاعل |
| `behavior` | تعديل السلوك | Behavior Mod | `AunakBehaviorMod` | خطط ABC + سرد تقدّم AI |
| `classrooms` | الفصول الدراسية | Classrooms | `AunakClassrooms` | تجميع الطلاب حسب `assigned_class` |
| `scientific` | المكتبة العلمية | Scientific Lib | `AunakScientificItems` | بنود علمية + أوزان لاقتراح IEP |
| `specialists` | إدارة الأخصائيين | Specialists | `AunakSpecialists` | roster الأخصائيين (سيادي) |
| `resources` | موارد المجتمع | Resources | `AunakResources` | مكتبة موارد مجتمعية |
| `research` | مركز الأبحاث | Research Center | `AunakResearchHub` | تصدير بحثي مُ anonymized + AES |
| `reports` | تقارير الأداء | Performance Reports | `AunakReportsDashboard` | تقارير من الجلسات المختومة |
| `access` | التحكم السيادي | Access Control | `AunakAccessControl` | سجل الصلاحيات + stealth (سيادي) |

**الحد الأدنى للباقة:** enrollment/registry/behavior/specialists/research/access → `institution` · diagnostics/crisis/live/reports/scientific → `medical` · media/learning/emotion/classrooms → `tutor`

---

## 3.3 التبويبات الحية (LIVE TABS — 6 تبويبات)

| ID | AR | EN | المكوّن | الوظيفة |
|----|-----|-----|---------|---------|
| `live` | السجل الحي | Live Registry | `AunakLiveDashboard` | سجل حي + Harmony + heatmap تتبّع بصري B2B |
| `crisis` | الدرع الذكي | Smart Shield | `AunakCrisisManagement` | مؤشر خطر أزمة ABC-weighted |
| `learning` | صعوبات التعلم | Learning Center | `AunakLearningCenter` | صعوبات تعلّم + gaze neutrality |
| `emotion` | مختبر الألحان | Melodies Lab | `AunakEmotionalLab` | أنماط ألحان + ربط emotional monitoring |
| `biometrics` | البصمة الحيوية | Biometrics ID | `AunakBiometrics` | مسح/تسجيل وجه + مطابقة |
| `community` | مجتمع عونك | Aunak Community | `AunakCommunityChat` | دردشة دعم + moderator regex |

**Premium (اشتراك active):** `emotion`, `crisis`

---

## 3.4 بوابات الدخول والتفعيل

| المكوّن | الملف | الوظيفة |
|---------|-------|---------|
| `AunakGate` | `AunakGate.jsx` | بوابة عامة: بصمة / توكن أخصائي / تسجيل |
| `AunakActivationGate` | `AunakActivationGate.jsx` | Value Lock — كود تفعيل + Tap checkout + TriplePortalCards |
| `PostActivationBiometric` | `PostActivationBiometric.jsx` | التقاط بصمة الطفل **بعد** اشتراك active |
| `AunakPaywall` | `AunakPaywall.jsx` | جدار زجاجي — مقارنة باقات + فيديوهات promo |
| `PaymentCheckoutButton` | `PaymentCheckoutButton.jsx` | زر الدفع → create-checkout |
| `PaymentReturn` | `PaymentReturn.jsx` | تأكيد عودة من Tap |
| `TriplePortalCards` | `TriplePortalCards.jsx` | بطاقات روابط الثلاثية بعد التفعيل |
| `SettlementConfirmModal` | `SettlementConfirmModal.jsx` | تأكيد ختم التسوية المالية |

---

## 3.5 واجهة الطفل — `src/components/child/`

| المكوّن | الوظيفة |
|---------|---------|
| `ChildInteractiveShell.jsx` | الحاوية — token gate + 4 tabs + session seal |
| `ChildHomePanel.jsx` | ترحيب + الهد المبرمج + GoalSpeaker |
| `ChildPlayZone.jsx` | منطقة لعب تفاعلية + نجوم |
| `ChildCalmZone.jsx` | منطقة هدوء حسّية |
| `ChildStarsPanel.jsx` | عدّاد النجوم |
| `ChildBottomNav.jsx` | تنقّل سفلي (4 tabs) |
| `ChildAvatar.jsx` | أفاتار روبوت (تنفّس، غمز، مزاج) |
| `ChildGoalSpeaker.jsx` | نطق الهدف (TTS + visual) |
| `ChildCelebration.jsx` | احتفال ملء الشاشة (مكافأة) |
| `ChildCalmOverlay.jsx` | تدرّج مهدّئ + كرة تنفّس |
| `ChildAwniCompanion.jsx` | **غير مستخدم** (كود قديم) |

**الإنتاج (بدون flag تواصل):** ثيم `CHILD` (برتقالي/مرح) · 4 تبويبات · **بدون** استطلاع مرآة · **بدون** تبويب assessment

---

## 3.6 لوحة ولي الأمر — `src/components/parent/`

| المكوّن | الوظيفة |
|---------|---------|
| `ParentShell.jsx` | حاوية + token parsing |
| `ParentBiometricGate.jsx` | تحقّق بصمة قبل Dashboard |
| `ParentDashboard.jsx` | 3 أقسام: تقييم + جلسات + مؤشرات علاج |

---

## 3.7 الأكاديمية الصيفية — `src/components/summer-academy/`

| المكوّن | الوظيفة |
|---------|---------|
| `AunakSummerAcademy.jsx` | الحاوية — welcome → hub → parent zone |
| `AcademyWelcomeMission.jsx` | تقييم صامت baseline (أسئلة) |
| `AcademyTrackHub.jsx` | 4 مسارات: arabic · math · english · brain |
| `AcademyBrainWheel.jsx` | عجلة دوّارة mini-game |
| `AcademyLeaderboard.jsx` | لوحة XP إيجابية |
| `AcademyParentZone.jsx` | تقرير أسبوعي + شهادة leap |
| `AcademyShell.jsx` | غلاف بصري |
| `AcademyMascot.jsx` | شخصية مرافقة |
| `AcademyLiveBackground.jsx` | خلفية حية |
| `AcademyAnimatedIcon.jsx` | أيقونات متحركة |

**ملاحظة:** الأكاديمية **ليست** في sidebar الـ Hub — الوصول عبر `/summer-academy` فقط (رغم أن `summerAcademy` في صلاحيات ولي الأمر).

---

## 3.8 التقييم — `src/components/assessment/`

| المكوّن | الوظيفة |
|---------|---------|
| `FreeAssessmentFlow.jsx` | 6 أسئلة · ~3 دقائق · حفظ score |
| `AssessmentResultScreen.jsx` | عرض النتيجة + النطاق + التوصية |
| `AssessmentPromoModal.jsx` | CTA للتفعيل/الدفع بعد التقييم |

---

## 3.9 عناصر سيادية إضافية

| المكوّن | الوظيفة |
|---------|---------|
| `SovereignCommandBar.jsx` | أوامر صوتية — انتقال بين الأقسام |
| `SovereignMasterBypassPanel.jsx` | لوحة QA bypass |
| `GoalEngine.jsx` | واجهة محرك الأهداف AUN-4611 (في Session Registry) |
| `PlatformLogo.jsx` | شعار المنصة |
| `Sidebar.jsx` | شريط جانبي (إن وُجد في سياقات فرعية) |
| `ErrorBoundary.jsx` | التقاط أخطاء React على المستوى الأعلى |
| `AirtableStatus.jsx` | مؤشر اتصال Airtable |

---

## 3.10 مكتبة الخدمات — `src/lib/` (48 ملفاً)

### قاعدة البيانات
| الملف | الوظيفة |
|-------|---------|
| `airtable.js` | عميل REST + CRUD + pagination + proxy fallback |
| `airtableFields.js` | أسماء الأعمدة القانونية snake_case |
| `airtableTables.js` | معرّفات الجداول tbl… |
| `airtableMappers.js` | mapStudent + mappers أخرى |

### مصادقة وصلاحيات
| الملف | الوظيفة |
|-------|---------|
| `auth.jsx` | AuthProvider · roles · canAccessSection · verifyAccessToken |
| `plans.js` | Value Lock matrix · PLAN_CODES · planAllows |
| `sovereignLogin.js` | بناء جلسة بعد بصمة + smart routing |
| `sovereignProtocol.js` | ثوابت بروتوكول سريري |
| `sovereignMasterBypass.js` | QA master key |
| `childAccess.js` | resolve `AUN-CHD-` token |
| `parentAccess.js` | resolve `AUN-PRT-` token |
| `tripleAccessProtocol.js` | توليد ثلاثية التوكنات |

### ذكاء ومعالجة
| الملف | الوظيفة |
|-------|---------|
| `biometricMatch.js` | face-api · capture · match · anti-spoof |
| `harmonyEngine.js` | Harmony score + gap penalty |
| `goalEngine.js` | AUN-4611 goals + attestation |
| `initialAssessmentEngine.js` | 6-domain free assessment |
| `sovereignAudio.js` | Web Audio synthesis |
| `sovereignVoice.js` | Web Speech supervisor commands |
| `academyVoice.js` | TTS queue (cloud + fallback) |
| `sovereignCrypto.js` | AES-256-GCM |

### دفع واشتراك
| الملف | الوظيفة |
|-------|---------|
| `tapPayments.js` | Tap charge + hash verify |
| `paymentPlans.js` | SAR pricing server-side |
| `paymentClient.js` | checkout redirect + sessionStorage draft |
| `paymentActivation.js` | post-payment fields |
| `paymentWebhookProcessor.js` | CAPTURED → activate |
| `activationCodes.js` | generate/validate codes |
| `subscriptionEngine.js` | activation gate + redeem client |
| `mockPayments.js` | dev mock charges |

### جلسات وتقارير
| الملف | الوظيفة |
|-------|---------|
| `childSessionSeal.js` | server child seal logic |
| `childSessionBridge.js` | client trigger seal API |
| `settlementEngine.js` | claim sealing + PIN |
| `specialistAttestation.js` | HMAC settlement signatures |
| `reportEngine.js` | sealed sessions → reports |
| `parentDashboardEngine.js` | parent views aggregation |

### أكاديمية ومساعدات
| الملف | الوظيفة |
|-------|---------|
| `summerAcademyEngine.js` | tracks · XP · streaks · silent assessment |
| `summerAcademyAirtable.js` | cloud/local persistence |
| `enrollmentValidation.js` | step-1 strict validation |
| `enrollmentLink.js` | ?enroll=1 helpers |
| `diagnosisOptions.js` | diagnosis select values |
| `countryDialCodes.js` | phone dial codes |
| `luxTheme.js` | dark gold LUX CSS tokens |
| `childTheme.js` | bright child play theme |
| `academyTheme.js` | summer academy theme |
| `research.js` | PII anonymization + export |
| `studentPrivacy.js` | stealth · field masking |
| `specialistIsolation.js` | caseload filter |

---

## 3.11 الخطافات — `src/hooks/`

| الخطاف | الوظيفة |
|--------|---------|
| `useBiometricScan.js` | capture/scan lifecycle |
| `useHarmonyEngine.js` | live harmony sync |
| `useGazeNeutralityObserver.js` | gaze hold detection |
| `useMeltdownPredictor.js` | response latency meltdown |
| `useCrisisAlerts.js` | ABC crisis risk |
| `useActiveStudentMetrics.js` | active student KPIs |
| `useRoadmapStats.js` | sovereign roadmap stats |
| `useAirtableData.js` | generic Airtable fetch |
| `useStudents.js` | students list hook |
| `useGoalEngine.js` | goal attempts hook |
| `useParentDashboard.js` | parent data hook |
| `useSummerAcademy.js` | academy state |
| `useAcademyVoice.js` | academy TTS hook |
| `useAcademyMood.js` | academy mood state |
| `usePromoVoice.js` | paywall promo voice |
| `useSovereignVoice.js` | sovereign voice hook |

---

*التالي: [الجزء 4 — الشاشات](./PART-04_SCREENS.md)*
