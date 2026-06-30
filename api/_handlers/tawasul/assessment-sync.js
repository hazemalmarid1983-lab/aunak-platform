/**
 * POST /api/tawasul/assessment-sync — self-contained (no broken ESM import chain).
 */

import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';
import { sanitizeRecordId } from './sanitize.js';

async function patchStudent(apiKey, baseId, tableId, recordId, fields) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: airtableHeaders(apiKey, { write: true }),
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(formatAirtableApiError(res.status, text));
  return JSON.parse(text);
}

function pickField(fields, ...keys) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return v;
  }
  return null;
}

function parseScore(raw) {
  if (raw == null || raw === '') return null;
  const n = Number(String(raw).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function goalFromScore(name, score, lang = 'ar') {
  const n = parseScore(score);
  if (n == null) return null;
  const band = n >= 70 ? 'balanced' : n >= 45 ? 'moderate' : 'elevated';
  const templates = {
    ar: {
      balanced: (who) => `🎯 ${who}: هدف اليوم — تعزيز التواصل البصري عبر لعبة الجزر (3 جولات هادئة).`,
      moderate: (who) => `🎯 ${who}: هدف إجرائي — تنظيم الانتباه · 5 تفاعلات في عالم الجزر + مكافأة نجمة.`,
      elevated: (who) => `🎯 ${who}: هدف عاجل — تهدئة ثم جذب انتباه · ابدأ بتبويب «هدوء» ثم «تفاعل» (5 نجوم).`,
    },
    en: {
      balanced: (who) => `🎯 ${who}: Daily goal — strengthen eye contact via island play (3 calm rounds).`,
      moderate: (who) => `🎯 ${who}: Programmed goal — attention regulation · 5 island interactions + star reward.`,
      elevated: (who) => `🎯 ${who}: Urgent goal — calm then engage · start Calm tab then Engage (5 stars).`,
    },
  };
  const who = String(name ?? 'الطفل').trim() || 'الطفل';
  const tpl = templates[lang]?.[band] ?? templates.ar[band];
  return tpl(who);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const recordId = sanitizeRecordId(req.body?.recordId);
  const fieldsIn = req.body?.fields && typeof req.body.fields === 'object' ? req.body.fields : {};

  if (!recordId) {
    res.status(400).json({ error: 'RECORD_ID_REQUIRED' });
    return;
  }

  try {
    const getUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${recordId}`;
    const getRes = await fetch(getUrl, { headers: airtableHeaders(apiKey) });
    const getText = await getRes.text();
    if (!getRes.ok) throw new Error(formatAirtableApiError(getRes.status, getText));
    const record = JSON.parse(getText);

    const merged = { ...(record.fields ?? {}), ...fieldsIn };
    const name = pickField(merged, 'Name', 'student_name') ?? 'الطفل';

    const patch = {};
    if (fieldsIn.initial_assessment_score != null) {
      patch[SF.initial_assessment_score] = parseScore(fieldsIn.initial_assessment_score);
    }
    if (fieldsIn.comprehensive_assessment_status != null) {
      patch[SF.comprehensive_assessment_status] = String(fieldsIn.comprehensive_assessment_status).trim();
    }

    const score = parseScore(fieldsIn.initial_assessment_score ?? merged[SF.initial_assessment_score]);
    const status = String(
      fieldsIn.comprehensive_assessment_status ??
        merged[SF.comprehensive_assessment_status] ??
        merged.comprehensive_assessment ??
        ''
    ).toLowerCase();
    const existingGoal = pickField(merged, SF.programmed_goal);
    const completed = /completed|complete|done|مكتمل/.test(status);

    if (score != null && completed && (!existingGoal || String(existingGoal).trim().length < 8)) {
      const autoGoal = goalFromScore(name, score, 'ar');
      if (autoGoal) {
        patch[SF.programmed_goal] = autoGoal;
        patch[SF.comprehensive_assessment_status] = 'completed';
      }
    }

    const updated = await patchStudent(apiKey, baseId, studentsTable, recordId, patch);
    res.status(200).json({
      ok: true,
      recordId: updated.id,
      programmed_goal: updated.fields?.[SF.programmed_goal] ?? null,
      autoGoal: Boolean(patch[SF.programmed_goal]),
    });
  } catch (err) {
    const message = err?.message ?? 'ASSESSMENT_SYNC_FAILED';
    console.error('[tawasul/assessment-sync]', message);
    res.status(500).json({ error: message });
  }
}
