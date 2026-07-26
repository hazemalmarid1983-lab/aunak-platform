/**
 * In-memory Airtable stand-in for MOCK_DATA_MODE.
 * Reads + writes persist for the browser session (no network).
 */

import { AIRTABLE_TABLES } from './airtableTables';
import {
  STUDENT as SF,
  DAILY_SESSION as DS,
  ACCESS as AF,
  CENTER as CF,
  SESSION_PERIOD as SP,
  ATTENDANCE_LEDGER as AL,
  GOAL_EVIDENCE as GE,
  ATTENDANCE_CORRECTION as AC,
  SPECIALIST as SPEC,
} from './airtableFields';
import { formatB2GChildCode } from './b2gAnonymization';

function cloneRecord(record) {
  return {
    id: record.id,
    createdTime: record.createdTime ?? new Date().toISOString(),
    fields: { ...(record.fields ?? {}) },
  };
}

function seedStudents() {
  return [
    {
      id: 'recMockStudent001',
      createdTime: '2026-07-01T08:00:00.000Z',
      fields: {
        [SF.name]: 'سالم العبري',
        [SF.id]: 'AUN-SALEM-DEMO',
        [SF.age]: 8,
        [SF.diagnosis]: 'under_assessment',
        [SF.status]: 'active',
        [SF.subscription_status]: 'active',
        [SF.harmony_score]: 90,
        [SF.comprehensive_assessment_status]: 'completed',
        [SF.initial_assessment_score]: 82,
        [SF.focus_level]: 88,
        [SF.behavior_intensity]: 18,
        [SF.academic_progress]: 75,
        [SF.parent_phone]: '91234567',
        [SF.parent_country_code]: '968',
        [SF.parent_name]: 'ولي أمر سالم',
        [SF.center_code]: 'PRIV-DEMO-01',
        [SF.assigned_shift]: 'morning',
        [SF.programmed_goal]: 'طلب عنصر مفضل بجملة من كلمتين',
        [SF.clinical_session_status]: 'active',
        [SF.parent_access_token]: 'AUN-PRT-MOCKSALEM0000000000000001',
        [SF.child_interactive_token]: 'AUN-CHD-MOCKSALEM0000000000000001',
        [SF.specialist_tutor_token]: 'AUN-SPC-MOCKSALEM0000000000000001',
        [SF.preferred_destination]: 'registry',
        [SF.plan_code]: 'tutor',
      },
    },
    {
      id: 'recMockStudent002',
      createdTime: '2026-07-01T08:05:00.000Z',
      fields: {
        [SF.name]: 'فيصل الحارثي',
        [SF.id]: 'AUN-FAISAL-DEMO',
        [SF.age]: 10,
        [SF.diagnosis]: 'under_assessment',
        [SF.status]: 'active',
        [SF.subscription_status]: 'active',
        [SF.harmony_score]: 62,
        [SF.comprehensive_assessment_status]: 'in_progress',
        [SF.initial_assessment_score]: 55,
        [SF.focus_level]: 58,
        [SF.behavior_intensity]: 40,
        [SF.academic_progress]: 48,
        [SF.parent_phone]: '92345678',
        [SF.parent_country_code]: '968',
        [SF.parent_name]: 'ولي أمر فيصل',
        [SF.center_code]: 'PRIV-DEMO-01',
        [SF.assigned_shift]: 'morning',
        [SF.programmed_goal]: 'تتبع تعليم من خطوتين بمساعدة بصرية',
        [SF.clinical_session_status]: 'active',
        [SF.parent_access_token]: 'AUN-PRT-MOCKFAISAL000000000000001',
        [SF.child_interactive_token]: 'AUN-CHD-MOCKFAISAL000000000000001',
        [SF.specialist_tutor_token]: 'AUN-SPC-MOCKFAISAL000000000000001',
        [SF.preferred_destination]: 'live',
        [SF.plan_code]: 'tutor',
      },
    },
    {
      id: 'recMockStudent003',
      createdTime: '2026-07-01T08:10:00.000Z',
      fields: {
        [SF.name]: 'مريم البلوشي',
        [SF.id]: 'AUN-MARYAM-DEMO',
        [SF.age]: 6,
        [SF.diagnosis]: 'under_assessment',
        [SF.status]: 'active',
        [SF.subscription_status]: 'active',
        [SF.harmony_score]: 45,
        [SF.comprehensive_assessment_status]: 'not_started',
        [SF.initial_assessment_score]: 38,
        [SF.focus_level]: 42,
        [SF.behavior_intensity]: 55,
        [SF.academic_progress]: 30,
        [SF.parent_phone]: '93456789',
        [SF.parent_country_code]: '968',
        [SF.parent_name]: 'ولي أمر مريم',
        [SF.center_code]: 'PRIV-DEMO-01',
        [SF.assigned_shift]: 'evening',
        [SF.programmed_goal]: 'تثبيت التواصل البصري لمدة 5 ثوانٍ',
        [SF.clinical_session_status]: 'pending',
        [SF.parent_access_token]: 'AUN-PRT-MOCKMARYAM000000000000001',
        [SF.child_interactive_token]: 'AUN-CHD-MOCKMARYAM000000000000001',
        [SF.specialist_tutor_token]: 'AUN-SPC-MOCKMARYAM000000000000001',
        [SF.preferred_destination]: 'governance',
        [SF.plan_code]: 'medical',
      },
    },
  ];
}

function seedDailySessions() {
  return [
    {
      id: 'recMockSession001',
      fields: {
        [DS.session_date]: '2026-07-14',
        [DS.student_name]: 'سالم العبري',
        [DS.student_record_id]: 'recMockStudent001',
        [DS.specialist_name]: 'أحمد المعالج',
        [DS.claim_status]: 'Sealed',
        [DS.sealed_at]: '2026-07-14T11:30:00.000Z',
        [DS.immutable_hash]: 'mockhash001abcdef',
        [DS.session_sequence]: 1,
        [DS.pin_verified]: true,
        [DS.notes]: 'جلسة موثّقة — تقدم في الطلب الوظيفي',
        [DS.duty_shift]: 'morning',
        [DS.specialty]: 'special_education',
        [DS.center_code]: 'PRIV-DEMO-01',
      },
    },
    {
      id: 'recMockSession002',
      fields: {
        [DS.session_date]: '2026-07-15',
        [DS.student_name]: 'فيصل الحارثي',
        [DS.student_record_id]: 'recMockStudent002',
        [DS.specialist_name]: 'أحمد المعالج',
        [DS.claim_status]: 'Sealed',
        [DS.sealed_at]: '2026-07-15T12:05:00.000Z',
        [DS.immutable_hash]: 'mockhash002abcdef',
        [DS.session_sequence]: 2,
        [DS.pin_verified]: true,
        [DS.notes]: 'جلسة موثّقة — تحسن في اتباع التعليمات',
        [DS.duty_shift]: 'morning',
        [DS.specialty]: 'special_education',
        [DS.center_code]: 'PRIV-DEMO-01',
      },
    },
    {
      id: 'recMockSession003',
      fields: {
        [DS.session_date]: '2026-07-16',
        [DS.student_name]: 'سالم العبري',
        [DS.student_record_id]: 'recMockStudent001',
        [DS.specialist_name]: 'نورة أخصائية النطق',
        [DS.claim_status]: 'Sealed',
        [DS.sealed_at]: '2026-07-16T17:40:00.000Z',
        [DS.immutable_hash]: 'mockhash003abcdef',
        [DS.session_sequence]: 3,
        [DS.pin_verified]: true,
        [DS.notes]: 'جلسة نطق موثّقة — إنتاج كلمتين',
        [DS.duty_shift]: 'evening',
        [DS.specialty]: 'speech_language',
        [DS.center_code]: 'PRIV-DEMO-01',
      },
    },
    {
      id: 'recMockSession004',
      fields: {
        [DS.session_date]: '2026-07-17',
        [DS.student_name]: 'مريم البلوشي',
        [DS.student_record_id]: 'recMockStudent003',
        [DS.specialist_name]: 'أحمد المعالج',
        [DS.claim_status]: 'Sealed',
        [DS.sealed_at]: '2026-07-17T10:20:00.000Z',
        [DS.immutable_hash]: 'mockhash004abcdef',
        [DS.session_sequence]: 4,
        [DS.pin_verified]: true,
        [DS.notes]: 'جلسة موثّقة — ثبات نظرة وتحفيز هادئ',
        [DS.duty_shift]: 'morning',
        [DS.specialty]: 'special_education',
        [DS.center_code]: 'PRIV-DEMO-01',
      },
    },
  ];
}

function seedAccess() {
  return [
    {
      id: 'recMockAccessMinistry',
      fields: {
        [AF.user_name]: 'مفتش الوزارة',
        [AF.user_email]: 'ministry@demo.aunak',
        [AF.status]: 'active',
        [AF.access_level]: 'ministry_auditor',
        [AF.access_token]: 'MOCK-MINISTRY',
        [AF.permissions]: 'ministry overview',
        [AF.center_code]: 'PRIV-DEMO-01',
      },
    },
    {
      id: 'recMockAccessSupervisor',
      fields: {
        [AF.user_name]: 'مشرف الوزارة',
        [AF.user_email]: 'supervisor@demo.aunak',
        [AF.status]: 'active',
        [AF.access_level]: 'ministry_supervisor',
        [AF.access_token]: 'MOCK-SUPERVISOR',
        [AF.permissions]: 'assessment protocol',
        [AF.center_code]: 'PRIV-DEMO-01',
      },
    },
    {
      id: 'recMockAccessSpecialist',
      fields: {
        [AF.user_name]: 'أحمد المعالج',
        [AF.user_email]: 'specialist@demo.aunak',
        [AF.status]: 'active',
        [AF.access_level]: 'specialist',
        [AF.access_token]: 'MOCK-SPECIALIST',
        [AF.permissions]: 'clinical sessions',
        [AF.center_code]: 'PRIV-DEMO-01',
      },
    },
    {
      id: 'recMockAccessAdmin',
      fields: {
        [AF.user_name]: 'مدير المركز',
        [AF.user_email]: 'admin@demo.aunak',
        [AF.status]: 'active',
        [AF.access_level]: 'admin',
        [AF.access_token]: 'MOCK-ADMIN',
        [AF.permissions]: 'advanced settings',
        [AF.center_code]: 'PRIV-DEMO-01',
      },
    },
  ];
}

function seedSpecialists() {
  return [
    {
      id: 'recMockSpec001',
      fields: {
        [SPEC.name]: 'أحمد المعالج',
        specialty: 'special_education',
        [SPEC.email]: 'specialist@demo.aunak',
        [SPEC.phone]: '95000001',
        status: 'active',
        [SPEC.center_code]: 'PRIV-DEMO-01',
        [SPEC.duty_shifts]: ['morning', 'evening'],
        [SPEC.cases]: 3,
      },
    },
    {
      id: 'recMockSpec002',
      fields: {
        [SPEC.name]: 'نورة أخصائية النطق',
        specialty: 'speech_language',
        [SPEC.email]: 'speech@demo.aunak',
        [SPEC.phone]: '95000002',
        status: 'active',
        [SPEC.center_code]: 'PRIV-DEMO-01',
        [SPEC.duty_shifts]: ['morning'],
        [SPEC.cases]: 1,
      },
    },
  ];
}

function seedCenters() {
  return [
    {
      id: 'recMockCenterPrivate',
      fields: {
        [CF.name]: 'Private Special Education Center — Demo',
        [CF.name_ar]: 'مركز تربية خاصة خاص — تجريبي',
        [CF.code]: 'PRIV-DEMO-01',
        [CF.type]: 'private',
        [CF.shift_model]: 'dual',
        [CF.morning_start]: '07:30',
        [CF.morning_end]: '12:30',
        [CF.evening_start]: '15:00',
        [CF.evening_end]: '19:00',
        [CF.governorate]: 'Muscat',
        [CF.status]: 'active',
      },
    },
    {
      id: 'recMockCenterGov',
      fields: {
        [CF.name]: 'Government Special Education Center — Demo',
        [CF.name_ar]: 'مركز تربية خاصة حكومي — تجريبي',
        [CF.code]: 'GOV-DEMO-01',
        [CF.type]: 'government',
        [CF.shift_model]: 'single',
        [CF.day_start]: '07:30',
        [CF.day_end]: '13:30',
        [CF.governorate]: 'Muscat',
        [CF.status]: 'active',
      },
    },
  ];
}

function seedSessionPeriods() {
  return [
    {
      id: 'recMockPeriod001',
      fields: {
        [SP.period_key]: 'PRIV-DEMO-01::2026-07-17::morning::1',
        [SP.center_code]: 'PRIV-DEMO-01',
        [SP.session_date]: '2026-07-17',
        [SP.duty_shift]: 'morning',
        [SP.period_number]: 1,
        [SP.start_time]: '07:30',
        [SP.end_time]: '08:10',
        [SP.specialty]: 'special_education',
        [SP.specialist_name]: 'أحمد المعالج',
        [SP.specialist_record_id]: 'recMockSpec001',
        [SP.student_name]: 'سالم العبري',
        [SP.student_record_id]: 'recMockStudent001',
        [SP.period_status]: 'completed',
        [SP.goal_focus]: 'طلب بجملة من كلمتين',
      },
    },
    {
      id: 'recMockPeriod002',
      fields: {
        [SP.period_key]: 'PRIV-DEMO-01::2026-07-17::morning::2',
        [SP.center_code]: 'PRIV-DEMO-01',
        [SP.session_date]: '2026-07-17',
        [SP.duty_shift]: 'morning',
        [SP.period_number]: 2,
        [SP.start_time]: '08:30',
        [SP.end_time]: '09:10',
        [SP.specialty]: 'speech_language',
        [SP.specialist_name]: 'نورة أخصائية النطق',
        [SP.specialist_record_id]: 'recMockSpec002',
        [SP.student_name]: 'فيصل الحارثي',
        [SP.student_record_id]: 'recMockStudent002',
        [SP.period_status]: 'scheduled',
        [SP.goal_focus]: 'تتبع تعليم من خطوتين',
      },
    },
  ];
}

function seedAttendance() {
  return [
    {
      id: 'recMockLedger001',
      fields: {
        [AL.ledger_key]: 'recMockStudent001::2026-07-17',
        [AL.student_record_id]: 'recMockStudent001',
        [AL.student_name]: 'سالم العبري',
        [AL.attendance_date]: '2026-07-17',
        [AL.status]: 'present',
        [AL.sealed_at]: '2026-07-17T10:05:00.000Z',
        [AL.immutable_hash]: 'mockledger001',
        [AL.recorded_by]: 'أحمد المعالج',
        [AL.biometric_verified]: true,
        [AL.center_code]: 'PRIV-DEMO-01',
        [AL.duty_shift]: 'morning',
      },
    },
    {
      id: 'recMockLedger002',
      fields: {
        [AL.ledger_key]: 'recMockStudent002::2026-07-17',
        [AL.student_record_id]: 'recMockStudent002',
        [AL.student_name]: 'فيصل الحارثي',
        [AL.attendance_date]: '2026-07-17',
        [AL.status]: 'present',
        [AL.sealed_at]: '2026-07-17T10:08:00.000Z',
        [AL.immutable_hash]: 'mockledger002',
        [AL.recorded_by]: 'أحمد المعالج',
        [AL.biometric_verified]: false,
        [AL.center_code]: 'PRIV-DEMO-01',
        [AL.duty_shift]: 'morning',
      },
    },
    {
      id: 'recMockLedger003',
      fields: {
        [AL.ledger_key]: 'recMockStudent003::2026-07-16',
        [AL.student_record_id]: 'recMockStudent003',
        [AL.student_name]: 'مريم البلوشي',
        [AL.attendance_date]: '2026-07-16',
        [AL.status]: 'absent',
        [AL.sealed_at]: '2026-07-16T14:05:00.000Z',
        [AL.immutable_hash]: 'mockledger003',
        [AL.recorded_by]: 'أحمد المعالج',
        [AL.biometric_verified]: false,
        [AL.center_code]: 'PRIV-DEMO-01',
        [AL.duty_shift]: 'evening',
        [AL.note]: 'غياب بعذر — بانتظار تصحيح',
      },
    },
  ];
}

function seedGoalEvidence() {
  return [
    {
      id: 'recMockEvidence001',
      fields: {
        [GE.student_record_id]: 'recMockStudent001',
        [GE.goal_id]: 'e-m-com-2',
        [GE.goal_label]: 'يكوّن جملة من كلمتين للطلب',
        [GE.evidence_date]: '2026-07-16',
        [GE.success_percent]: 80,
        [GE.has_photo]: false,
        [GE.sealed_at]: '2026-07-16T12:00:00.000Z',
        [GE.immutable_hash]: 'mockevidence001',
        [GE.teacher_id]: 'recMockSpec001',
        [GE.center_code]: 'PRIV-DEMO-01',
        [GE.specialty]: 'special_education',
        [GE.duty_shift]: 'morning',
        [GE.note]: 'نجاح مستقل في 4 من 5 محاولات',
      },
    },
    {
      id: 'recMockEvidence002',
      fields: {
        [GE.student_record_id]: 'recMockStudent002',
        [GE.goal_id]: 'e-m-att-1',
        [GE.goal_label]: 'يتبع تعليماً من خطوتين',
        [GE.evidence_date]: '2026-07-15',
        [GE.success_percent]: 60,
        [GE.has_photo]: false,
        [GE.sealed_at]: '2026-07-15T12:20:00.000Z',
        [GE.immutable_hash]: 'mockevidence002',
        [GE.teacher_id]: 'recMockSpec001',
        [GE.center_code]: 'PRIV-DEMO-01',
        [GE.specialty]: 'special_education',
        [GE.duty_shift]: 'morning',
      },
    },
  ];
}

function seedCorrections() {
  return [
    {
      id: 'recMockCorrection001',
      fields: {
        [AC.student_record_id]: 'recMockStudent003',
        [AC.attendance_date]: '2026-07-16',
        [AC.original_status]: 'absent',
        [AC.requested_status]: 'excused',
        [AC.reason]: 'غياب بعذر طبي موثق من ولي الأمر',
        [AC.requested_by]: 'أحمد المعالج',
        [AC.requested_at]: '2026-07-16T15:00:00.000Z',
        [AC.status]: 'pending',
        [AC.original_hash]: 'mockledger003',
        [AC.center_code]: 'PRIV-DEMO-01',
        [AC.duty_shift]: 'evening',
      },
    },
  ];
}

function buildStore() {
  return {
    [AIRTABLE_TABLES.students]: seedStudents(),
    [AIRTABLE_TABLES.dailySessions]: seedDailySessions(),
    [AIRTABLE_TABLES.accessControl]: seedAccess(),
    [AIRTABLE_TABLES.specialists]: seedSpecialists(),
    [AIRTABLE_TABLES.centers]: seedCenters(),
    [AIRTABLE_TABLES.sessionPeriods]: seedSessionPeriods(),
    [AIRTABLE_TABLES.attendanceLedger]: seedAttendance(),
    [AIRTABLE_TABLES.goalEvidence]: seedGoalEvidence(),
    [AIRTABLE_TABLES.attendanceCorrections]: seedCorrections(),
  };
}

let store = buildStore();
let idSeq = 1000;

/** Deterministic demo UDI code (browser-safe; not production HMAC). */
export function mockB2gChildCode(recordId) {
  const id = String(recordId ?? '');
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return formatB2GChildCode(hex);
}

export function mockListRecords(tableId) {
  const key = String(tableId ?? '');
  const rows = store[key];
  if (!Array.isArray(rows)) return [];
  return rows.map(cloneRecord);
}

export function mockWriteRecord(tableId, method, body, recordId) {
  const key = String(tableId ?? '');
  if (!store[key]) store[key] = [];
  const list = store[key];
  const fields = { ...(body?.fields ?? body ?? {}) };
  const upper = String(method ?? 'POST').toUpperCase();

  if (upper === 'POST') {
    idSeq += 1;
    const id = recordId || `recMockWrite${idSeq.toString(36)}`;
    const row = {
      id,
      createdTime: new Date().toISOString(),
      fields: { ...fields },
    };
    list.push(row);
    return cloneRecord(row);
  }

  if (upper === 'PATCH' || upper === 'PUT') {
    const idx = list.findIndex((r) => r.id === recordId);
    if (idx < 0) {
      const row = {
        id: recordId || `recMockWrite${(++idSeq).toString(36)}`,
        createdTime: new Date().toISOString(),
        fields: { ...fields },
      };
      list.push(row);
      return cloneRecord(row);
    }
    list[idx] = {
      ...list[idx],
      fields: { ...list[idx].fields, ...fields },
    };
    return cloneRecord(list[idx]);
  }

  if (upper === 'DELETE') {
    const idx = list.findIndex((r) => r.id === recordId);
    if (idx >= 0) list.splice(idx, 1);
    return { id: recordId, deleted: true };
  }

  return { id: recordId || `recMockWrite${(++idSeq).toString(36)}`, fields };
}

export function mockFindStudentByUdiCode(udiCode) {
  const code = String(udiCode ?? '').trim().toUpperCase();
  if (!/^CHD-[A-F0-9]{4}$/.test(code)) return null;
  const students = store[AIRTABLE_TABLES.students] || [];
  return students.find((row) => mockB2gChildCode(row.id) === code) ?? null;
}

export function resetMockAirtableStore() {
  store = buildStore();
  idSeq = 1000;
}
