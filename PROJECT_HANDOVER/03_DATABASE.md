# 03 · قاعدة البيانات (Database — Airtable)

> المخزن الوحيد للبيانات هو **Airtable** (لا SQL/NoSQL تقليدي). الوصول عبر REST API بـ fetch أصلي.
> المصدر القانوني لأسماء الأعمدة: `src/lib/airtablefields.js` — **snake_case إنجليزي فقط**، وقيم select بحروف صغيرة.

---

## القواعد (Bases)

| البيئة | Base ID | المصدر |
|--------|---------|--------|
| الإنتاج السيادي | `appaGfKj4vYhMw0cb` | افتراضي في `airtable.js` و`redeem.js` |
| تواصل (Tawasul MVP / Sandbox) | `app3vCT2j2JepNVZa` | يُختار عند `VITE_TAWASUL_MVP=true` (`api/airtable.js`, `child-seal.js`) |

يُحلّ الـ Base ID عبر `VITE_AIRTABLE_BASE_ID` (عميل) أو `AIRTABLE_BASE_ID`/`VITE_AIRTABLE_BASE_ID` (خادم)، مع تنقية ASCII صارمة.

---

## معرّفات الجداول (`src/lib/airtableTables.js`)

| المفتاح المنطقي | Table ID | ملاحظة |
|-----------------|----------|--------|
| `students` | `tblzYmBGmCxx2vdcr` | قابل للتهيئة عبر `VITE_AIRTABLE_STUDENTS_TABLE_ID` |
| `dailySessions` | `tbl3mlewMLvqp6AXB` | سجل الجلسات (سحابي، معزول) |
| `scientificItems` | `tblnCbBSmwDWwO5SJ` | ثابت |
| `specialists` | `tblnmcLd5M3U6sErl` | قابل للتهيئة |
| `abcData` | `tblJ580ptTVkv07hD` | تعديل السلوك ABC |
| `safeMedia` | `tbljdOSE8CozrzBZN` | مكتبة الوسائط |
| `melodyLab` | `tblMddsXqCz91hfoU` | مختبر الألحان |
| `communityResources` | `tblV28iWarzve32pP` | موارد المجتمع |
| `accessControl` | `tblfBvd5WI7alVCFU` | صلاحيات/توكنات الأخصائي والإدارة |
| `learningDifficulties` | `tblcNXSmU90TomEHH` | صعوبات التعلّم |
| `emotionalMonitoring` | `tblokLHmSHss3FQft` | الرصد العاطفي + الأزمات |
| `goalAttempts` | *(فارغ افتراضياً)* | يتطلب `VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID` وإلا localStorage |
| `summerAcademy` | *(فارغ افتراضياً)* | يتطلب `VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID` وإلا localStorage |

---

## الجداول والحقول

### 1) Students (`tblzYmBGmCxx2vdcr`) — الجدول المحوري
الهوية، الاشتراك، البيومترية، المؤشرات السريرية، وأوامر المرآة.

| الفئة | الحقول |
|------|--------|
| هوية | `student_name`, `student_id`, `age`, `diagnosis`, `parent_phone`, `parent_country_code`, `preferred_destination` |
| اشتراك/دفع | `subscription_status` (pending→active), `plan_code`, `subscription_expires_at`, `last_payment_at`, `payment_method`, `activation_code_used`, `payment_status`, `session_fee` |
| بيومترية | `face_biometric` (128 float JSON), `biometric_status` (approved), `camera_access` (link→Access Control), `biometric_attendance_verified`, `biometric_attendance_at` |
| تقييم (Wave 3) | `initial_assessment_score` (0–100), `comprehensive_assessment_status` (not_started/in_progress/completed) |
| ثلاثية الوصول | `parent_access_token`, `child_interactive_token`, `specialist_tutor_token` (AUN-{PRT\|CHD\|SPC}-32hex) |
| مؤشرات سريرية | `harmony_score`, `academic_progress`, `behavior_intensity`, `focus_level`, `improvement_index`, `operating_efficiency`, `t_static`, `eye_movement_map` |
| جلسة | `session_start_time`, `clinical_session_status`, `clinical_session_notes`, `smart_session_fields`, `ai_session_report`, `zero_point_report`, `status`, `programmed_goal` |
| العزل (تواصل) | `assigned_specialist` (link→Specialists) |
| **المرآة الشبحية** | `mirror_command`, `mirror_payload` |

قيم `mirror_command`: `echo_goal`, `drop_star`, `drop_reward`, `calm_pulse`, `clear`.

### 2) Access Control (`tblfBvd5WI7alVCFU`) — صلاحيات الأخصائي/الإدارة
`user_email`, `user_name`, `status`, `permissions`, `access_level` (parent/admin/specialist), `access_areas`, `access_token`, `last_login`.

### 3) Specialists (`tblnmcLd5M3U6sErl`)
`specialist_name`, `specialty`, `professional_email`, `contact_phone`, `admin_notes`, `status`, `active_cases`, `rating`, `specialist_tutor_token`, `Students` (link → caseload).

### 4) Daily Sessions (`tbl3mlewMLvqp6AXB`) — سجل الفوترة غير القابل للتعديل
`session_date`, `specialist_name`, `student_name`, `notes`, `claim_status` (Sealed)، `sealed_at`, `specialist_signature`, `immutable_hash`, `session_sequence`, `pin_verified`.
> عند `claim_status = "Sealed"` → السجل غير قابل للتعديل (`assertClaimNotSealed` يرمي `CLAIM_SEALED_IMMUTABLE`).

### 5) Goal Attempts (اختياري)
`student` (link), `session_id`, `session_date`, `goal_label`, `goal_source` (IEP/ABC/Learning), `success_percent`, `attempt_number`, `specialist_email`, `attempt_notes`, `recorded_at`.

### 6) جداول القطاعات الأخرى
- **ABC/Behavior** (`tblJ580…`): `case_id`, `programmed_goal`, `behavior`, `status`, `intensity`, `crisis_score`, `risk_label`.
- **Learning Difficulties** (`tblcNX…`): `student`, `programmed_goal`, `t_static`, `focus_level`, `academic_progress`, `intervention_notes`, `weekly_milestone`.
- **Emotional Monitoring** (`tblokL…`): `mood_label`, `score`, `intelligence_insight`, `preferred_pattern`, `melody_pattern`.
- **Scientific Items** (`tblnCb…`): `title`, `category`, `weight`, `usage_count`.
- **Safe Media** (`tbljdO…`): `title`, `category`, `duration`, `encrypted`.
- **Melody Lab** (`tblMdd…`): `pattern_id`, `pattern_name`, `description`, `score`, `face_au`, `emotional_monitoring`.
- **Community Resources** (`tblV28…`): `title`, `resource_type`, `audience`, `downloads`, `rating`, `summary`.
- **Summer Academy** (اختياري): `student`, `event_type`, `track`, `silent_level`, `baseline_level`, `current_level`, `weak_points_json`, `daily_xp`, `tasks_completed`, `total_xp`, `progress_json`, `recorded_at`.

---

## العلاقات (Relationships)

```
Specialists (1) ──< assigned_specialist >── (N) Students     # عزل الحالات في تواصل
Students (1) ──< student (link) >── (N) Goal Attempts
Students (1) ──< camera_access (link) >── (N) Access Control  # صلاحية كاميرا
Students (1) ──< student (link) >── (N) Summer Academy
Daily Sessions / ABC / Learning ── ربط بالاسم/النص (غير مُعرّف بروابط دائماً)
```
> كثير من الربط منطقي بالاسم/الكود وليس علاقات Airtable رسمية (مثل Daily Sessions عبر `specialist_name`/`student_name`).

---

## أنماط الوصول (Access Patterns)

- **قراءة**: `fetchAirtableRecords(tableId)` تجرّب `view: "Grid view"` ثم تسقط لبدون view، مع ترقيم صفحات (offset).
- **كتابة**: `airtableWrite` (POST/PATCH) مع `typecast: true` تلقائياً، وتنقية الحقول الفارغة (`scrubFields`).
- **مطابقة مرنة للحقول**: `getField(fields, name, ...fallbacks)` تتسامح مع اختلاف التسميات.
- **قناتان**: مباشر (`https://api.airtable.com`) أو بروكسي (`/api/airtable`) حسب `VITE_USE_AIRTABLE_PROXY`، مع سقوط تلقائي بينهما.
- **نسخ احتياطي محلي**: الجلسات اليومية ومحاولات الأهداف تُخزّن أيضاً في `localStorage` عند غياب الجداول السحابية.
- **تنقية Latin-1**: كل الترويسات تُفحص لضمان توكنات ASCII آمنة (تفادي أخطاء عربية في الترويسات).

## قيود مهمة (Select options)
راجع `STUDENT_SELECT_CHECKLIST` في `airtableFields.js` — يجب إنشاء خيارات select مسبقاً في Airtable (مثل `status: new,active` · `subscription_status: pending,active` · `plan_code: free,tutor,medical,institution,assessment_only` · `mirror_command: echo_goal,drop_star,drop_reward,calm_pulse,clear`) وإلا يفشل الكتابة بـ `SELECT_OPTION_MISSING`.
