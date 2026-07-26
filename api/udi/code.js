import { b2gChildCode } from '../_handlers/b2g/anonymize.js';

const AIRTABLE_RECORD_ID = /^rec[a-zA-Z0-9]{10,}$/;

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const recordId = String(req.body?.recordId ?? '').trim();
  if (!AIRTABLE_RECORD_ID.test(recordId)) {
    res.status(400).json({ error: 'INVALID_STUDENT_RECORD_ID' });
    return;
  }

  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ b2gCode: b2gChildCode(recordId) });
}
