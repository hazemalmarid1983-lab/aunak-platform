/** Shared action router for Vercel dynamic API routes (counts as one Serverless Function). */

export function createActionRouter(routes) {
  return async function handler(req, res) {
    const action = String(req.query?.action ?? '').trim();
    const route = routes[action];
    if (!route) {
      res.status(404).json({ error: 'NOT_FOUND', action });
      return;
    }
    const fn = route[req.method];
    if (!fn) {
      res.status(405).json({ error: 'Method not allowed', action, method: req.method });
      return;
    }
    return fn(req, res);
  };
}
