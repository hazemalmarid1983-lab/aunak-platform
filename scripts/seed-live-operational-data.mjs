/**
 * Seed live operational rows into central base appcjitgWsbvIebwf.
 * Requires a valid PAT in .env.local (AIRTABLE_API_KEY or VITE_AIRTABLE_PAT).
 *
 *   node scripts/seed-live-operational-data.mjs --dry-run
 *   node scripts/seed-live-operational-data.mjs --apply
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE_ID =
  process.env.AUNAK_CENTRAL_BASE_ID ||
  process.env.AIRTABLE_BASE_ID ||
  process.env.VITE_AIRTABLE_BASE_ID ||
  'appcjitgWsbvIebwf';
const APPLY = process.argv.includes('--apply');

const TABLES = {
  centers: process.env.VITE_AIRTABLE_CENTERS_TABLE_ID || 'tblm1ayaXTG0vdm7d',
  specialists: process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID || 'tblqTYEHCPBO23DBa',
  students: process.env.AIRTABLE_STUDENTS_TABLE_ID || process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID || 'tblTidBPaVM4cf3O9',
  accessControl: process.env.VITE_AIRTABLE_ACCESS_CONTROL_TABLE_ID || process.env.VITE_AIRTABLE_ACCESS_TABLE_ID || 'tblsGNIKRfTpMZ8Kn',
  dailySessions: process.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID || 'tblnNGiaKccMSpizT',
};

function loadPat() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) throw new Error('Missing .env.local');
  const text = readFileSync(path, 'utf8');
  const get = (k) => {
    const m = text.match(new RegExp(`^${k}=(.*)$`, 'm'));
    if (!m) return '';
    return m[1].trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
  };
  return get('AIRTABLE_API_KEY') || get('VITE_AIRTABLE_PAT') || get('VITE_AIRTABLE_API_KEY');
}

const pat = loadPat();
if (!pat) {
  console.error('Missing Airtable PAT in .env.local');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${pat}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api(path, options = {}) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${data?.error?.message || JSON.stringify(data)}`);
  }
  return data;
}

async function listAll(tableId) {
  const all = [];
  let offset;
  do {
    const qs = new URLSearchParams({ pageSize: '100' });
    if (offset) qs.set('offset', offset);
    const page = await api(`${tableId}?${qs}`);
    all.push(...(page.records || []));
    offset = page.offset;
  } while (offset);
  return all;
}

async function createMany(tableId, records) {
  const out = [];
  for (let i = 0; i < records.length; i += 10) {
    const chunk = records.slice(i, i + 10);
    if (!APPLY) {
      console.log(`[dry-run] POST ${tableId} × ${chunk.length}`);
      out.push(...chunk.map((r, idx) => ({ id: `dry-${i + idx}`, fields: r.fields })));
      continue;
    }
    const page = await api(tableId, {
      method: 'POST',
      body: JSON.stringify({ records: chunk, typecast: true }),
    });
    out.push(...(page.records || []));
  }
  return out;
}

function token(prefix) {
  return `${prefix}-${randomBytes(16).toString('hex')}`;
}

async function main() {
  console.log(APPLY ? 'APPLY — writing live rows' : 'DRY-RUN — no writes');
  console.log(`Base ${BASE_ID}\n`);

  // Connectivity check
  await listAll(TABLES.centers).then((r) => console.log(`Centers: ${r.length}`));

  const centers = await listAll(TABLES.centers);
  if (!centers.length) {
    console.log('+ Seeding centers…');
    await createMany(TABLES.centers, [
      {
        fields: {
          center_name: 'Private Special Education Center — Demo',
          center_name_ar: 'مركز تربية خاصة خاص — تجريبي',
          center_code: 'PRIV-DEMO-01',
          center_type: 'private',
          shift_model: 'dual',
          morning_start: '07:30',
          morning_end: '12:30',
          evening_start: '15:00',
          evening_end: '19:00',
          governorate: 'Muscat',
          status: 'active',
        },
      },
      {
        fields: {
          center_name: 'Government Special Education Center — Demo',
          center_name_ar: 'مركز تربية خاصة حكومي — تجريبي',
          center_code: 'GOV-DEMO-01',
          center_type: 'government',
          shift_model: 'single',
          day_start: '07:30',
          day_end: '13:30',
          governorate: 'Muscat',
          status: 'active',
        },
      },
    ]);
  }

  const access = await listAll(TABLES.accessControl);
  console.log(`Access Control: ${access.length}`);
  if (!access.length) {
    console.log('+ Seeding access control tokens…');
    const seeded = await createMany(TABLES.accessControl, [
      {
        fields: {
          user_name: 'مفتش الوزارة',
          user_email: 'ministry@aunak.om',
          status: 'active',
          access_level: 'ministry_auditor',
          access_token: token('AUN-MIN'),
          permissions: 'ministry overview',
          center_code: 'PRIV-DEMO-01',
        },
      },
      {
        fields: {
          user_name: 'مشرف الوزارة',
          user_email: 'supervisor@aunak.om',
          status: 'active',
          access_level: 'ministry_supervisor',
          access_token: token('AUN-SUP'),
          permissions: 'assessment protocol',
          center_code: 'PRIV-DEMO-01',
        },
      },
      {
        fields: {
          user_name: 'أحمد المعالج',
          user_email: 'specialist@aunak.om',
          status: 'active',
          access_level: 'specialist',
          access_token: token('AUN-SPC'),
          permissions: 'clinical sessions',
          center_code: 'PRIV-DEMO-01',
        },
      },
      {
        fields: {
          user_name: 'مدير المركز',
          user_email: 'admin@aunak.om',
          status: 'active',
          access_level: 'admin',
          access_token: token('AUN-ADM'),
          permissions: 'advanced settings',
          center_code: 'PRIV-DEMO-01',
        },
      },
    ]);
    if (APPLY) {
      console.log('\n=== Login tokens (save these) ===');
      for (const row of seeded) {
        console.log(
          `${row.fields.access_level}\t${row.fields.user_name}\t${row.fields.access_token}`
        );
      }
    }
  } else {
    console.log('· Access Control already has rows — skip seed (tokens not re-printed)');
  }

  const specialists = await listAll(TABLES.specialists);
  console.log(`Specialists: ${specialists.length}`);
  if (!specialists.length) {
    console.log('+ Seeding specialists…');
    await createMany(TABLES.specialists, [
      {
        fields: {
          specialist_name: 'أحمد المعالج',
          specialty: 'special_education',
          professional_email: 'specialist@aunak.om',
          contact_phone: '95000001',
          status: 'active',
          center_code: 'PRIV-DEMO-01',
          duty_shifts: ['morning', 'evening'],
        },
      },
      {
        fields: {
          specialist_name: 'نورة أخصائية النطق',
          specialty: 'speech_language',
          professional_email: 'speech@aunak.om',
          contact_phone: '95000002',
          status: 'active',
          center_code: 'PRIV-DEMO-01',
          duty_shifts: ['morning'],
        },
      },
    ]);
  }

  const students = await listAll(TABLES.students);
  console.log(`Students: ${students.length}`);
  if (!students.length) {
    console.log('+ Seeding students…');
    await createMany(TABLES.students, [
      {
        fields: {
          student_name: 'سالم العبري',
          student_id: 'AUN-SALEM-01',
          age: 8,
          status: 'active',
          subscription_status: 'active',
          diagnosis: 'under_assessment',
          center_code: 'PRIV-DEMO-01',
          assigned_shift: 'morning',
          harmony_score: 90,
          comprehensive_assessment_status: 'completed',
          initial_assessment_score: 82,
          focus_level: 88,
          behavior_intensity: 18,
          academic_progress: 75,
          parent_phone: '91234567',
          parent_country_code: '968',
          parent_access_token: token('AUN-PRT'),
          child_interactive_token: token('AUN-CHD'),
          specialist_tutor_token: token('AUN-SPC'),
          preferred_destination: 'registry',
          plan_code: 'tutor',
        },
      },
      {
        fields: {
          student_name: 'فيصل الحارثي',
          student_id: 'AUN-FAISAL-01',
          age: 10,
          status: 'active',
          subscription_status: 'active',
          diagnosis: 'under_assessment',
          center_code: 'PRIV-DEMO-01',
          assigned_shift: 'morning',
          harmony_score: 62,
          comprehensive_assessment_status: 'in_progress',
          initial_assessment_score: 55,
          focus_level: 58,
          behavior_intensity: 40,
          academic_progress: 48,
          parent_phone: '92345678',
          parent_country_code: '968',
          parent_access_token: token('AUN-PRT'),
          child_interactive_token: token('AUN-CHD'),
          specialist_tutor_token: token('AUN-SPC'),
          preferred_destination: 'live',
          plan_code: 'tutor',
        },
      },
      {
        fields: {
          student_name: 'مريم البلوشي',
          student_id: 'AUN-MARYAM-01',
          age: 6,
          status: 'active',
          subscription_status: 'active',
          diagnosis: 'under_assessment',
          center_code: 'PRIV-DEMO-01',
          assigned_shift: 'evening',
          harmony_score: 45,
          comprehensive_assessment_status: 'not_started',
          initial_assessment_score: 38,
          focus_level: 42,
          behavior_intensity: 55,
          academic_progress: 30,
          parent_phone: '93456789',
          parent_country_code: '968',
          parent_access_token: token('AUN-PRT'),
          child_interactive_token: token('AUN-CHD'),
          specialist_tutor_token: token('AUN-SPC'),
          preferred_destination: 'governance',
          plan_code: 'medical',
        },
      },
    ]);
  }

  console.log('\nDone.');
  if (!APPLY) console.log('Re-run with --apply after PAT is valid.');
}

main().catch((e) => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});
