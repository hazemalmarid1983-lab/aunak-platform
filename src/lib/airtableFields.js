/**
 * Canonical Airtable column names — snake_case English only (fixed, no env overrides).
 * Table/base IDs remain configurable via VITE_AIRTABLE_* in airtableTables.js / airtable.js.
 *
 * Wave 3 — July 2026 Constitution: identity vault + triple access + assessment funnel.
 * Live ops: docs/SOVEREIGN_OPERATIONS_LOG.md · aunak.vercel.app
 */

/** Wave 3 — digital identity vault (Students table) */
export const STUDENT_IDENTITY_VAULT = {
  /** Free quick-assessment score (Number 0–100) */
  initial_assessment_score: 'initial_assessment_score',
  /** Comprehensive assessment lifecycle — defaults not_started */
  comprehensive_assessment_status: 'comprehensive_assessment_status',
};

/** Wave 3 — triple sovereign device tokens (one activation → three portals) */
export const TRIPLE_ACCESS = {
  parent: 'parent_access_token',
  child: 'child_interactive_token',
  specialist: 'specialist_tutor_token',
};

/**
 * Professional specialties (SPED / allied health) — select values lowercase.
 * AR: تربية خاصة · نطق ولغة · علاج وظيفي · علاج طبيعي · نفسي · خدمة اجتماعية · تدخل مبكر
 */
export const SPECIALTY = {
  special_education: "special_education",
  speech_language: "speech_language",
  occupational_therapy: "occupational_therapy",
  physiotherapy: "physiotherapy",
  psychology: "psychology",
  social_work: "social_work",
  early_intervention: "early_intervention",
};

/** Duty shifts — private dual (morning+evening); government single (day) */
export const DUTY_SHIFT = {
  morning: "morning",
  evening: "evening",
  day: "day",
};

/** Centers — multi-tenant hub for all Oman centers */
export const CENTER = {
  name: "center_name",
  name_ar: "center_name_ar",
  code: "center_code",
  type: "center_type",
  shift_model: "shift_model",
  morning_start: "morning_start",
  morning_end: "morning_end",
  evening_start: "evening_start",
  evening_end: "evening_end",
  day_start: "day_start",
  day_end: "day_end",
  governorate: "governorate",
  wilayat: "wilayat",
  ministry_license_no: "ministry_license_no",
  contact_phone: "contact_phone",
  contact_email: "contact_email",
  address: "address",
  status: "status",
  notes: "notes",
};

export const CENTER_SELECT = {
  center_type: { private: "private", government: "government" },
  shift_model: { dual: "dual", single: "single" },
  status: { active: "active", inactive: "inactive", suspended: "suspended" },
};

/** Students table */
export const STUDENT = {
  name: "student_name",
  id: "student_id",
  age: "age",
  diagnosis: "diagnosis",
  /** Guardian-reported presenting symptoms (no parent diagnosis picker) */
  presenting_symptoms: "presenting_symptoms",
  /** Relative weights + Dynamic Branching snapshot from 12-item screening */
  screening_weights: "screening_weights",
  parent_phone: "parent_phone",
  parent_country_code: "parent_country_code",
  parent_name: "parent_name",
  preferred_destination: "preferred_destination",
  subscription_status: "subscription_status",
  face_biometric: "face_biometric",
  biometric_status: "biometric_status",
  status: "status",
  harmony_score: "harmony_score",
  camera_access: "camera_access",
  assigned_class: "assigned_class",
  /** Multi-center FK */
  center_code: "center_code",
  center_record_id: "center_record_id",
  /** morning|evening (private) or day (government) */
  assigned_shift: "assigned_shift",
  assigned_specialist_id: "assigned_specialist_id",
  date_of_birth: "date_of_birth",
  gender: "gender",
  enrollment_date: "enrollment_date",
  plan_code: "plan_code",
  subscription_expires_at: "subscription_expires_at",
  last_payment_at: "last_payment_at",
  payment_method: "payment_method",
  activation_code_used: "activation_code_used",
  /** Civil / national ID — sole upsert key for enrollment */
  national_id: "national_id",
  /** Arabic display name (optional) — same row as English student_name */
  student_name_ar: "student_name_ar",
  session_start_time: "session_start_time",
  clinical_session_status: "clinical_session_status",
  smart_session_fields: "smart_session_fields",
  clinical_session_notes: "clinical_session_notes",
  biometric_attendance_verified: "biometric_attendance_verified",
  biometric_attendance_at: "biometric_attendance_at",
  academic_progress: "academic_progress",
  behavior_intensity: "behavior_intensity",
  focus_level: "focus_level",
  t_static: "t_static",
  eye_movement_map: "eye_movement_map",
  programmed_goal: "programmed_goal",
  /** JSON array of active bank goals (governance) */
  active_iep_goals: "active_iep_goals",
  iep_support_severity: "iep_support_severity",
  custom_goals_pending: "custom_goals_pending",
  /** JSON — sealed/draft operational assessment protocol session */
  assessment_protocol_json: "assessment_protocol_json",
  assessment_protocol_status: "assessment_protocol_status",
  ai_session_report: "ai_session_report",
  payment_status: "payment_status",
  session_fee: "session_fee",
  zero_point_report: "zero_point_report",
  improvement_index: "improvement_index",
  operating_efficiency: "operating_efficiency",
  initial_assessment_score: STUDENT_IDENTITY_VAULT.initial_assessment_score,
  comprehensive_assessment_status: STUDENT_IDENTITY_VAULT.comprehensive_assessment_status,
  parent_access_token: TRIPLE_ACCESS.parent,
  child_interactive_token: TRIPLE_ACCESS.child,
  specialist_tutor_token: TRIPLE_ACCESS.specialist,
  /** Link → Specialists (Tawasul MVP per-specialist caseload isolation) */
  assigned_specialist: "assigned_specialist",
  /** Ghost Mirror — specialist → child live commands */
  mirror_command: "mirror_command",
  mirror_payload: "mirror_payload",
  notes: "notes",
};

/** Required Single-select options for Access Control table */
export const ACCESS_SELECT = {
  status: { active: "active" },
  access_level: { parent: "parent", admin: "admin", specialist: "specialist", ministry_auditor: "ministry_auditor" },
};

export const STUDENT_SELECT = {
  status: { new: "new", active: "active" },
  subscription_status: { pending: "pending", active: "active" },
  preferred_destination: {
    live: "live",
    media: "media",
    registry: "registry",
    community: "community",
    diagnostics: "diagnostics",
    classrooms: "classrooms",
  },
  biometric_status: { approved: "approved" },
  comprehensive_assessment_status: {
    not_started: "not_started",
    in_progress: "in_progress",
    completed: "completed",
  },
};

/** Human checklist for Airtable Single-select setup */
export const STUDENT_SELECT_CHECKLIST = [
  "status: new, active",
  "subscription_status: pending, active",
  "preferred_destination: live, media, registry, community, diagnostics, classrooms",
  "biometric_status: approved",
  "national_id: text — sole enrollment upsert key",
  "student_name: English canonical name (Latin)",
  "student_name_ar: Arabic display name (optional, same row)",
  "plan_code: free, tutor, medical, institution, assessment_only",
  "comprehensive_assessment_status: not_started, in_progress, completed",
  "mirror_command: echo_goal, drop_star, drop_reward, calm_pulse, clear",
  "mirror_payload: text",
  "initial_assessment_score: number (free quick scan 0–100)",
  "parent_access_token / child_interactive_token / specialist_tutor_token: AUN-{PRT|CHD|SPC}-{32hex}",
  "diagnosis: clinician-only (never parent-selected) — prefer under_assessment until adaptive complete",
  "presenting_symptoms: long text — guardian symptoms only",
  "screening_weights: JSON — 4-dimension relative weights + clinicalPath",
  "parent_country_code: text (dial digits, e.g. 966)",
];

/** Daily Sessions — sealed clinical/educational session notes */
export const DAILY_SESSION = {
  session_date: "session_date",
  center_code: "center_code",
  duty_shift: "duty_shift",
  specialty: "specialty",
  specialist_name: "specialist_name",
  specialist_record_id: "specialist_record_id",
  student_name: "student_name",
  student_record_id: "student_record_id",
  notes: "notes",
  claim_status: "claim_status",
  sealed_at: "sealed_at",
  specialist_signature: "specialist_signature",
  immutable_hash: "immutable_hash",
  session_sequence: "session_sequence",
  pin_verified: "pin_verified",
  session_fee: "session_fee",
};

/**
 * Session Periods — daily timetable slots per center / shift / specialty
 * (تربية خاصة · نطق · وظيفي …)
 */
export const SESSION_PERIOD = {
  period_key: "period_key",
  center_code: "center_code",
  center_record_id: "center_record_id",
  session_date: "session_date",
  duty_shift: "duty_shift",
  period_number: "period_number",
  start_time: "start_time",
  end_time: "end_time",
  specialty: "specialty",
  specialist_name: "specialist_name",
  specialist_record_id: "specialist_record_id",
  student_name: "student_name",
  student_record_id: "student_record_id",
  room_or_hall: "room_or_hall",
  period_status: "period_status",
  goal_focus: "goal_focus",
  session_notes: "session_notes",
  recorded_by: "recorded_by",
  sealed_at: "sealed_at",
  immutable_hash: "immutable_hash",
};

/** Access Control table */
export const ACCESS = {
  user_email: "user_email",
  user_name: "user_name",
  status: "status",
  permissions: "permissions",
  access_level: "access_level",
  access_areas: "access_areas",
  access_token: "access_token",
  center_code: "center_code",
  center_record_id: "center_record_id",
  last_login: "last_login",
};

/** Specialists table */
export const SPECIALIST = {
  name: "specialist_name",
  name_ar: "specialist_name_ar",
  specialty: "specialty",
  email: "professional_email",
  phone: "contact_phone",
  center_code: "center_code",
  center_record_id: "center_record_id",
  duty_shifts: "duty_shifts",
  admin_notes: "admin_notes",
  status: "status",
  cases: "active_cases",
  license_no: "license_no",
  rating: "rating",
  specialist_tutor_token: TRIPLE_ACCESS.specialist,
  /** Link → Students (Tawasul MVP caseload — populated on Specialists row) */
  students: "Students",
};

/** Attendance Ledger — immutable daily presence (governance) */
export const ATTENDANCE_LEDGER = {
  ledger_key: "ledger_key",
  student_record_id: "student_record_id",
  student_name: "student_name",
  attendance_date: "attendance_date",
  status: "status",
  sealed_at: "sealed_at",
  immutable_hash: "immutable_hash",
  recorded_by: "recorded_by",
  biometric_verified: "biometric_verified",
  note: "note",
  center_id: "center_id",
  center_code: "center_code",
  duty_shift: "duty_shift",
};

/** Goal Evidence — sealed proof of goal work */
export const GOAL_EVIDENCE = {
  student_record_id: "student_record_id",
  goal_id: "goal_id",
  goal_label: "goal_label",
  evidence_date: "evidence_date",
  note: "note",
  success_percent: "success_percent",
  has_photo: "has_photo",
  sealed_at: "sealed_at",
  immutable_hash: "immutable_hash",
  teacher_id: "teacher_id",
  center_code: "center_code",
  specialty: "specialty",
  duty_shift: "duty_shift",
};

/** Attendance correction requests (original seal stays) */
export const ATTENDANCE_CORRECTION = {
  student_record_id: "student_record_id",
  attendance_date: "attendance_date",
  original_status: "original_status",
  requested_status: "requested_status",
  reason: "reason",
  requested_by: "requested_by",
  requested_at: "requested_at",
  status: "status",
  original_hash: "original_hash",
  center_code: "center_code",
  duty_shift: "duty_shift",
};

/** Goal Attempts table */
export const GOAL_ATTEMPT = {
  student: "student",
  session_id: "session_id",
  session_date: "session_date",
  goal_label: "goal_label",
  goal_source: "goal_source",
  success_percent: "success_percent",
  attempt_number: "attempt_number",
  specialist_email: "specialist_email",
  attempt_notes: "attempt_notes",
  recorded_at: "recorded_at",
};

/** Summer Academy table */
export const SUMMER_ACADEMY = {
  student: "student",
  student_name: "student_name",
  event_type: "event_type",
  track: "track",
  silent_level: "silent_level",
  baseline_level: "baseline_level",
  current_level: "current_level",
  weak_points: "weak_points_json",
  daily_xp: "daily_xp",
  tasks_completed: "tasks_completed",
  total_xp: "total_xp",
  progress_json: "progress_json",
  recorded_at: "recorded_at",
  session_date: "session_date",
};

/** Scientific Items */
export const SCIENTIFIC_ITEM = {
  title: "title",
  category: "category",
  weight: "weight",
  usage: "usage_count",
};

/** ABC / Behavior Mod */
export const ABC = {
  case_id: "case_id",
  goal: "programmed_goal",
  behavior: "behavior",
  status: "status",
  intensity: "intensity",
  crisis_score: "crisis_score",
  risk_label: "risk_label",
};

/** Safe Media */
export const MEDIA = {
  title: "title",
  category: "category",
  duration: "duration",
  encrypted: "encrypted",
};

/** Melody Lab */
export const MELODY = {
  pattern_id: "pattern_id",
  name: "pattern_name",
  description: "description",
  score: "score",
  face_au: "face_au",
  emotional_link: "emotional_monitoring",
};

/** Community Resources */
export const RESOURCE = {
  title: "title",
  type: "resource_type",
  audience: "audience",
  downloads: "downloads",
  rating: "rating",
  summary: "summary",
};

/** Learning Difficulties */
export const LEARNING = {
  student: "student",
  goal: "programmed_goal",
  t_static: "t_static",
  focus_level: "focus_level",
  academic_progress: "academic_progress",
  notes: "intervention_notes",
  milestone: "weekly_milestone",
};

/** Emotional Monitoring */
export const EMOTION = {
  label: "mood_label",
  score: "score",
  insight: "intelligence_insight",
  preferred_pattern: "preferred_pattern",
  melody_link: "melody_pattern",
};
