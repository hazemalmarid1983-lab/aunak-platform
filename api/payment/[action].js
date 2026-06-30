/**
 * /api/payment/* — single Serverless Function (Vercel Hobby limit).
 * Routes: status, create-checkout, verify-return, webhook, mock-complete, mock-fire
 */

import { createActionRouter } from '../_handlers/dispatch.js';
import status from '../_handlers/payment/status.js';
import createCheckout from '../_handlers/payment/create-checkout.js';
import verifyReturn from '../_handlers/payment/verify-return.js';
import webhook from '../_handlers/payment/webhook.js';
import mockComplete from '../_handlers/payment/mock-complete.js';
import mockFire from '../_handlers/payment/mock-fire.js';

export default createActionRouter({
  status: { GET: status },
  'create-checkout': { POST: createCheckout },
  'verify-return': { GET: verifyReturn },
  webhook: { POST: webhook },
  'mock-complete': { GET: mockComplete },
  'mock-fire': { POST: mockFire },
});
