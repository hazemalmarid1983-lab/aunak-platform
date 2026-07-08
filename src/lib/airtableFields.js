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

/** Students table */
export const STUDENT = {
  name: "student_name",
  id: "student_id",
  age: "age",
  diagnosis: "diagnosis",
  parent_phone: "parent_phone",
  parent_country_code: "parent_country_code",
  preferred_destination: "preferred_destination",
  subscription_status: "subscription_status",
  face_biometric: "face_biometric",
  biometric_status: "biometric_status",
  status: "status",
  harmony_score: "harmony_score",
  camera_access: "camera_access",
  assigned_class: "assigned_class",
  plan_code: "plan_code",
  subscription_expires_at: "subscription_expires_at",
  last_payment_at: "last_payment_at",
  payment_method: "payment_method",
  activation_code_used: "activation_code_used",
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
    media: "media",
    registry: "registry",
    community: "community",
    diagnostics: "diagnostics",
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
  "preferred_destination: media, registry, community, diagnostics",
  "biometric_status: approved",
  "plan_code: free, tutor, medical, institution, assessment_only",
  "comprehensive_assessment_status: not_started, in_progress, completed",
  "mirror_command: echo_goal, drop_star, drop_reward, calm_pulse, clear",
  "mirror_payload: text",
  "initial_assessment_score: number (free quick scan 0–100)",
  "parent_access_token / child_interactive_token / specialist_tutor_token: AUN-{PRT|CHD|SPC}-{32hex}",
  "diagnosis: autism_spectrum, adhd, learning_difficulty, language_delay, under_assessment",
  "parent_country_code: text (dial digits, e.g. 966)",
];

/** Daily Sessions table */
export const DAILY_SESSION = {
  session_date: "session_date",
  specialist_name: "specialist_name",
  student_name: "student_name",
  notes: "notes",
  claim_status: "claim_status",
  sealed_at: "sealed_at",
  specialist_signature: "specialist_signature",
  immutable_hash: "immutable_hash",
  session_sequence: "session_sequence",
  pin_verified: "pin_verified",
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
  last_login: "last_login",
};

/** Specialists table */
export const SPECIALIST = {
  name: "specialist_name",
  specialty: "specialty",
  email: "professional_email",
  phone: "contact_phone",
  admin_notes: "admin_notes",
  status: "status",
  cases: "active_cases",
  rating: "rating",
  specialist_tutor_token: TRIPLE_ACCESS.specialist,
  /** Link → Students (Tawasul MVP caseload — populated on Specialists row) */
  students: "Students",
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
