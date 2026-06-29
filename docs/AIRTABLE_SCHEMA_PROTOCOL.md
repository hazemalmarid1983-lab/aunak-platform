# Aunak — Airtable Schema (snake_case English)
# بروتوكول Airtable — مسميات إنجليزية موحّدة

> **Base ID:** `appaGfKj4vYhMw0cb`  
> **Source:** `src/lib/airtableFields.js`  
> **Status:** ✅ **LIVE** — `https://aunak.vercel.app` (27 Jun 2026)  
> **Operations log:** `docs/SOVEREIGN_OPERATIONS_LOG.md`

All column names are **lowercase snake_case English**. One field per concept — no Arabic/English duplicates. Single-select **option values** are also lowercase (`new`, `active`, `pending`, `approved`).

---

## 1. Students (`tblzYmBGmCxx2vdcr`)

| Field | Type | AR meaning |
|-------|------|------------|
| `student_name` | Single line text | اسم الطالب |
| `student_id` | Single line text | كود الطالب |
| `age` | Number | العمر |
| `diagnosis` | Long text | التشخيص |
| `parent_phone` | Phone | هاتف ولي الأمر |
| `preferred_destination` | Single select | الوجهة المفضلة |
| `subscription_status` | Single select | حالة الاشتراك |
| `face_biometric` | Long text | البصمة (JSON) |
| `biometric_status` | Single select | حالة البصمة |
| `status` | Single select | الحالة |
| `plan_code` | Single select | كود الباقة |
| `subscription_expires_at` | Date | انتهاء الاشتراك |
| `last_payment_at` | Date and time | آخر دفع |
| `payment_method` | Single line text | طريقة الدفع |
| `activation_code_used` | Single line text | كود التفعيل |
| `initial_assessment_score` | Number | نتيجة التقييم المبدئي |
| `comprehensive_assessment_status` | Single select | حالة التقييم الشامل |
| `parent_access_token` | Single line text | رمز جهاز الأهل |
| `child_interactive_token` | Single line text | رمز جهاز الطفل |
| `specialist_tutor_token` | Single line text | رمز المدرس/الإخصائي |
| `harmony_score` | Number | درجة التناغم |
| `camera_access` | Link → Access Control | صلاحيات الكاميرا |
| `assigned_class` | Single line text | الفصل |
| `session_start_time` | Single line text | وقت بدء الجلسة |
| `clinical_session_status` | Single select | حالة الجلسة |
| `smart_session_fields` | Number | عدد حقول الجلسة |
| `clinical_session_notes` | Long text | ملاحظات الجلسة |
| `biometric_attendance_verified` | Checkbox | حضور بيومتري |
| `biometric_attendance_at` | Date and time | وقت الحضور |
| `academic_progress` | Number | التقدم الأكاديمي |
| `behavior_intensity` | Number | شدة السلوك |
| `focus_level` | Number | مستوى التركيز |
| `t_static` | Number | ثواني الشرود |
| `eye_movement_map` | Long text | خريطة العين |
| `programmed_goal` | Long text | الهدف الإجرائي |
| `ai_session_report` | Long text | التقرير المختصر |
| `payment_status` | Single select | حالة الدفع |
| `session_fee` | Number | مستحقات الجلسة |
| `zero_point_report` | Long text | تقرير نقطة الصفر |
| `improvement_index` | Number | مؤشر التحسن |
| `operating_efficiency` | Number | كفاءة التشغيل |

**Select options (required — lowercase):**
- `status`: `new`, `active`
- `subscription_status`: `pending`, `active`
- `biometric_status`: `approved`
- `preferred_destination`: `media`, `registry`, `community`, `diagnostics`
- `plan_code`: `free`, `tutor`, `medical`, `institution`, `assessment_only`
- `comprehensive_assessment_status`: `not_started`, `in_progress`, `completed`

**Subscription / payment columns (Wave 2 — live):**

| Field | Type | Notes |
|-------|------|-------|
| `plan_code` | Single select | Set on activation redeem |
| `activation_code_used` | Single line text | Last redeemed code |
| `initial_assessment_score` | Number | Free quick-assessment result (Phase 3 UX) |
| `comprehensive_assessment_status` | Single select | `not_started` → `in_progress` → `completed` |
| `parent_access_token` | Single line text | Parent device login — reports & subscriptions |
| `child_interactive_token` | Single line text | Child device — games & assistant (no locks) |
| `specialist_tutor_token` | Single line text | Tutor/specialist/doctor — sessions & notes |
| `last_payment_at` | Date and time | ISO timestamp on redeem |
| `payment_method` | Single line text | e.g. `manual_code` |
| `subscription_expires_at` | Date | +30 days from redeem |

**Access Control (`tblfBvd5WI7alVCFU`) — live columns:** `user_name`, `user_email`, `status`, `permissions`, `access_level`, `access_token`, `last_login`  
Select: `status` → `active` · `access_level` → `parent`, `admin`, `specialist`

---

## 2. Daily Sessions (`tbl3mlewMLvqp6AXB`)

| Field | Type |
|-------|------|
| `session_date` | Date |
| `specialist_name` | Single line text |
| `student_name` | Single line text |
| `notes` | Long text |
| `claim_status` | Single select (`Sealed`) |
| `sealed_at` | Date and time |
| `specialist_signature` | Long text |
| `immutable_hash` | Single line text |
| `session_sequence` | Number |
| `pin_verified` | Checkbox |

---

## 3. Access Control (`tblfBvd5WI7alVCFU`)

| Field | Type |
|-------|------|
| `user_email` | Email |
| `user_name` | Single line text |
| `status` | Single select |
| `permissions` | Single line text |
| `access_level` | Single select |
| `access_areas` | Long text |
| `access_token` | Single line text |
| `last_login` | Date and time |

---

## 4. Specialists (`tblnmcLd5M3U6sErl`)

| Field | Type |
|-------|------|
| `specialist_name` | Single line text |
| `specialty` | Single select |
| `professional_email` | Email |
| `contact_phone` | Phone |
| `admin_notes` | Long text |
| `status` | Single select |
| `active_cases` | Number |
| `rating` | Number |

---

## 5. Scientific Items (`tblnCbBSmwDWwO5SJ`)

| Field | Type |
|-------|------|
| `title` | Single line text |
| `category` | Single select |
| `weight` | Number |
| `usage_count` | Number |

---

## 6. ABC Data (`tblJ580ptTVkv07hD`)

| Field | Type |
|-------|------|
| `case_id` | Number |
| `programmed_goal` | Long text |
| `behavior` | Long text |
| `status` | Single select |
| `intensity` | Single select |
| `crisis_score` | Number |
| `risk_label` | Single select |

---

## 7. Safe Media (`tbljdOSE8CozrzBZN`)

| Field | Type |
|-------|------|
| `title` | Single line text |
| `category` | Single select |
| `duration` | Single line text |
| `encrypted` | Checkbox |

---

## 8. Melody Lab (`tblMddsXqCz91hfoU`)

| Field | Type |
|-------|------|
| `pattern_id` | Single line text |
| `pattern_name` | Single line text |
| `description` | Long text |
| `score` | Number |
| `face_au` | Single line text |
| `emotional_monitoring` | Link → Emotional Monitoring |

---

## 9. Community Resources (`tblV28iWarzve32pP`)

| Field | Type |
|-------|------|
| `title` | Single line text |
| `resource_type` | Single select |
| `audience` | Single select |
| `downloads` | Number |
| `rating` | Number |
| `summary` | Long text |

---

## 10. Learning Difficulties (`tblcNXSmU90TomEHH`)

| Field | Type |
|-------|------|
| `student` | Link → Students |
| `programmed_goal` | Long text |
| `t_static` | Number |
| `focus_level` | Number |
| `academic_progress` | Number |
| `intervention_notes` | Long text |
| `weekly_milestone` | Single line text |

---

## 11. Emotional Monitoring (`tblokLHmSHss3FQft`)

| Field | Type |
|-------|------|
| `mood_label` | Single line text |
| `score` | Number |
| `intelligence_insight` | Long text |
| `preferred_pattern` | Checkbox |
| `melody_pattern` | Link → Melody Lab |

---

## 12. Goal Attempts (create + set `VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID`)

| Field | Type |
|-------|------|
| `student` | Link → Students |
| `session_id` | Single line text |
| `session_date` | Date |
| `goal_label` | Single line text |
| `goal_source` | Single select |
| `success_percent` | Number |
| `attempt_number` | Number |
| `specialist_email` | Email |
| `attempt_notes` | Long text |
| `recorded_at` | Date and time |

---

## 13. Summer Academy (create + set `VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID`)

| Field | Type |
|-------|------|
| `student` | Link → Students |
| `student_name` | Single line text |
| `event_type` | Single select |
| `track` | Single line text |
| `silent_level` | Number |
| `baseline_level` | Number |
| `current_level` | Number |
| `weak_points_json` | Long text |
| `daily_xp` | Number |
| `tasks_completed` | Number |
| `total_xp` | Number |
| `progress_json` | Long text |
| `recorded_at` | Date and time |
| `session_date` | Date |

---

## Enrollment biometric (phase 5)

- Capture saves `face_biometric` (Long text JSON); verify uses **in-browser reference** (82% threshold), not Airtable re-fetch.
- Sovereign login elsewhere uses **94.7%** (`SOVEREIGN_MATCH_CONFIDENCE` in `src/lib/biometricMatch.js`).

## Triple-device access (Phase 3 — redeem)

On successful `POST /api/activation/redeem`:

| Field | Token format | Device role |
|-------|--------------|-------------|
| `parent_access_token` | `AUN-PRT-{32hex}` | Parent — reports, sessions, billing |
| `child_interactive_token` | `AUN-CHD-{32hex}` | Child — games, assistant, no locks |
| `specialist_tutor_token` | `AUN-SPC-{32hex}` | Tutor / specialist / doctor |

Implementation: `src/lib/tripleAccessProtocol.js` · sets `comprehensive_assessment_status` → `not_started` unless already `completed`.

## Assessment columns (Phase 3 UX — pre-payment)

| Field | Type | When set |
|-------|------|----------|
| `initial_assessment_score` | Number | After free quick assessment |
| `comprehensive_assessment_status` | Single select | `not_started` on redeem; `completed` after full assessment |

---

## Airtable setup checklist (post-migration)

```
✅ Students tblzYmBGmCxx2vdcr — snake_case columns + subscription/payment fields
✅ Access Control tblfBvd5WI7alVCFU — user_name, user_email, access_level, last_login, permissions
✅ Single-select options lowercase (new, active, pending, approved)
❌ Remove VITE_AIRTABLE_*_FIELD env overrides from Vercel
```
