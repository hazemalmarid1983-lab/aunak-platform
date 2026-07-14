# Manual P0/P1 field checklist — Students (production)
# Base: appaGfKj4vYhMw0cb · Table: tblzYmBGmCxx2vdcr (جدول الطالب)
# Use this if Meta API PAT lacks schema.bases:write
# DO NOT delete any existing Arabic/legacy columns.

## P0 — add / edit first

### 1) New field
| Name | Type | Notes |
|------|------|-------|
| national_id | Single line text | Sole upsert key |
| student_name_ar | Single line text | Arabic display name (same row as student_name) |

### 2) Edit existing select — preferred_destination
Keep existing `media`. Add options (exact lowercase):
- registry
- community
- diagnostics
- classrooms

### 3) Confirm existing selects (do not remove legacy values)
- subscription_status must include: pending, active
- biometric_status must include: approved
- comprehensive_assessment_status: not_started, in_progress, completed
- status: new, active
- plan_code: leave as Single line text for now (do not convert)

## P1 — create these fields

| Name | Type | Options / link |
|------|------|----------------|
| programmed_goal | Long text | |
| mirror_command | Single select | echo_goal, drop_star, drop_reward, calm_pulse, clear |
| mirror_payload | Single line text | |
| clinical_session_notes | Long text | |
| session_start_time | Single line text | |
| clinical_session_status | Single select | idle, live, sealed, closed |
| smart_session_fields | Number (integer) | |
| biometric_attendance_verified | Checkbox | |
| biometric_attendance_at | Date time | |
| ai_session_report | Long text | |
| payment_status | Single select | pending, paid, unpaid, waived |
| session_fee | Number (decimal OK) | |
| assigned_class | Single line text | |
| assigned_specialist | Link to another record | Link → table الأخصائيين (tblnmcLd5M3U6sErl) |

## After UI changes
Re-run dry-run to verify:
  npm run schema:students:dry

Or with write-enabled PAT:
  npm run schema:students:apply
