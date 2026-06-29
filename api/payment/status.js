/**
 * GET /api/payment/status — readiness probe (Tap + Mock + Airtable).
 */

import { isTapConfigured } from '../../src/lib/tapPayments.js';
import { isMockPaymentsEnabled } from '../../src/lib/mockPayments.js';
import { airtableConfigFromEnv } from '../../src/lib/paymentActivation.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost');
  const proto = String(req.headers['x-forwarded-proto'] || 'https');
  const origin = `${proto}://${host}`;

  const airtable = airtableConfigFromEnv();
  const mockEnabled = isMockPaymentsEnabled();
  const tapConfigured = isTapConfigured();

  res.status(200).json({
    ok: true,
    environment: process.env.VERCEL_ENV || 'local',
    tapConfigured,
    mockPaymentsEnabled: mockEnabled,
    paymentReady: tapConfigured || mockEnabled,
    airtableConfigured: Boolean(airtable.apiKey),
    routes: {
      createCheckout: `${origin}/api/payment/create-checkout`,
      webhook: `${origin}/api/payment/webhook`,
      verifyReturn: `${origin}/api/payment/verify-return`,
      mockComplete: `${origin}/api/payment/mock-complete`,
      mockFire: `${origin}/api/payment/mock-fire`,
      paymentReturnPage: `${origin}/payment/return`,
    },
    fallback: {
      mockMode: 'Preview without TAP_SECRET_KEY → mock checkout + webhook path',
      postRedirect: 'verify-return activates if webhook lagged',
    },
    nextStep: mockEnabled
      ? 'POST /api/payment/mock-fire with { studentId } or use UI Pay button'
      : 'Add TAP_SECRET_KEY (Preview) then POST create-checkout',
  });
}
