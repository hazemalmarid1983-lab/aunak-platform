/**
 * POST /api/session/child-seal
 * Child Island World interaction → Sealed claim in tblDailySessions (AUN-4611).
 */

import { sealSessionFromChildIsland, CHILD_ISLAND_SEAL_THRESHOLD } from '../../src/lib/childSessionSeal.js';

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentId = sanitizeAscii(req.body?.studentId);
  const studentName = sanitizeAscii(req.body?.studentName);
  const interactionCount = Number(req.body?.interactionCount) || CHILD_ISLAND_SEAL_THRESHOLD;
  const source = sanitizeAscii(req.body?.source) || 'island_world';
  const interactionType = sanitizeAscii(req.body?.interactionType) || 'play_engagement';

  if (!studentName && !studentId) {
    res.status(400).json({ error: 'STUDENT_REQUIRED' });
    return;
  }

  if (interactionCount < CHILD_ISLAND_SEAL_THRESHOLD) {
    res.status(400).json({
      error: 'THRESHOLD_NOT_MET',
      required: CHILD_ISLAND_SEAL_THRESHOLD,
      received: interactionCount,
    });
    return;
  }

  try {
    const result = await sealSessionFromChildIsland({
      studentId,
      studentName,
      interactionCount,
      source,
      interactionType,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'CHILD_SEAL_FAILED' });
  }
}
