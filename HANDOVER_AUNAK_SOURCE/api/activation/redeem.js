/**
 * POST /api/activation/redeem — redeem activation code → Active subscription in Airtable.
 * On success: generates triple device tokens (parent / child / specialist) on the student record.
 */

import {
  generateTripleDeviceTokens,
  buildActivationRedeemFields,
  buildTriplePortalLinks,
} from '../../src/lib/tripleAccessProtocol.js';
import { STUDENT as SF } from '../../src/lib/airtableFields.js';

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

function normalizeCode(raw) {
  return String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

function planFromPrefix(code) {
  const m = code.match(/^AUN-(FREE|TUTOR|MEDICAL|INST|ASSESS)-/);
  if (!m) return null;
  const map = {
    FREE: 'free',
    TUTOR: 'tutor',
    MEDICAL: 'medical',
    INST: 'institution',
    ASSESS: 'assessment_only',
  };
  return map[m[1]] ?? null;
}

function landingForPlan(plan) {
  const map = {
    free: 'community',
    tutor: 'media',
    medical: 'diagnostics',
    institution: 'registry',
    assessment_only: 'diagnostics',
  };
  return map[plan] ?? 'community';
}

function subscriptionFieldsForActivation(plan) {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  return {
    [SF.subscription_status]: 'active',
    [SF.plan_code]: plan,
    [SF.last_payment_at]: new Date().toISOString(),
    [SF.payment_method]: 'manual_code',
    [SF.subscription_expires_at]: expires.toISOString().slice(0, 10),
    [SF.preferred_destination]: landingForPlan(plan),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const code = normalizeCode(req.body?.code);
  const studentId = sanitizeAscii(req.body?.studentId);

  if (!/^AUN-(FREE|TUTOR|MEDICAL|INST|ASSESS)-[A-Z0-9]{4}-\d{4}$/.test(code)) {
    res.status(400).json({ error: 'INVALID_CODE_FORMAT' });
    return;
  }
  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  const plan = planFromPrefix(code);
  if (!plan) {
    res.status(400).json({ error: 'UNKNOWN_PLAN' });
    return;
  }

  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = sanitizeAscii(
    process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || 'appaGfKj4vYhMw0cb'
  ).split('/')[0];
  const studentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) || 'tblzYmBGmCxx2vdcr';

  const deviceTokens = generateTripleDeviceTokens();

  const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
  const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
  const origin = `${proto}://${host}`;
  const portalLinks = buildTriplePortalLinks(origin, deviceTokens);

  if (!apiKey) {
    res.status(200).json({
      plan,
      landing: landingForPlan(plan),
      subscriptionRaw: 'active',
      active: true,
      mode: 'client_fallback',
      deviceTokens,
      portalLinks,
    });
    return;
  }

  const authHeader = { Authorization: `Bearer ${sanitizeAscii(apiKey)}`, Accept: 'application/json' };
  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${encodeURIComponent(studentId)}`;

  let existingComprehensiveStatus = null;
  try {
    const getRes = await fetch(recordUrl, { headers: authHeader });
    if (getRes.ok) {
      const row = JSON.parse(await getRes.text());
      existingComprehensiveStatus = row?.fields?.[SF.comprehensive_assessment_status] ?? null;
    }
  } catch {
    /* proceed with fresh activation fields */
  }

  const fields = buildActivationRedeemFields(subscriptionFieldsForActivation(plan), {
    tokens: deviceTokens,
    existingComprehensiveStatus,
  });
  fields[SF.activation_code_used] = code;

  try {
    const response = await fetch(recordUrl, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields, typecast: true }),
    });
    const text = await response.text();
    if (!response.ok) {
      res.status(response.status).send(text);
      return;
    }
    res.status(200).json({
      plan,
      landing: landingForPlan(plan),
      subscriptionRaw: 'active',
      active: true,
      deviceTokens,
      portalLinks,
      airtable: JSON.parse(text),
    });
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'Airtable PATCH failed' });
  }
}
