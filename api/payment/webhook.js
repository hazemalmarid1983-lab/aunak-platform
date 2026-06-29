/**
 * POST /api/payment/webhook — Tap IPN + Mock charge (Preview).
 */

import { verifyTapWebhookHash, sanitizeAscii } from '../../src/lib/tapPayments.js';
import { isMockPaymentsEnabled, isMockChargeId, verifyMockWebhookRequest } from '../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../src/lib/paymentWebhookProcessor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const charge = req.body;
  if (!charge?.id) {
    res.status(400).json({ error: 'INVALID_PAYLOAD' });
    return;
  }

  const isMock = isMockChargeId(charge.id);

  if (isMock) {
    if (!isMockPaymentsEnabled()) {
      res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
      return;
    }
    if (!verifyMockWebhookRequest(charge, req.headers)) {
      res.status(401).json({ error: 'INVALID_MOCK_WEBHOOK' });
      return;
    }
  } else {
    const hashstring = req.headers['hashstring'] || req.headers['Hashstring'];
    const verified = await verifyTapWebhookHash(charge, hashstring);
    if (!verified) {
      res.status(401).json({ error: 'INVALID_HASHSTRING' });
      return;
    }
  }

  try {
    const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
    const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
    const origin = `${proto}://${host}`;
    const result = await processCapturedPaymentCharge(charge, { origin });
    res.status(200).json(result);
  } catch (err) {
    console.error('[payment/webhook]', err?.message);
    res.status(500).json({ error: err?.message ?? 'ACTIVATION_FAILED' });
  }
}
