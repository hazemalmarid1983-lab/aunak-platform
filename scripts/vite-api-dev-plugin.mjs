/**
 * Local Vite middleware — mounts Vercel-style api/*.js handlers under /api/*
 * so enrollment and Airtable proxy work with `npm run dev` (no vercel CLI required).
 */
import { loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

function applyEnv(mode, root) {
  const env = loadEnv(mode, root, '');
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }
  // Always refresh Airtable routing keys from .env.local so base/table cutovers apply without stale shell env.
  for (const [key, value] of Object.entries(env)) {
    if (!key.includes('AIRTABLE')) continue;
    if (value != null && String(value).trim() !== '') {
      process.env[key] = value;
    }
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      const ct = String(req.headers['content-type'] || '');
      if (ct.includes('application/json')) {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(e);
        }
        return;
      }
      resolve({ raw });
    });
    req.on('error', reject);
  });
}

function createRes(nodeRes) {
  let statusCode = 200;
  const headers = {};
  const api = {
    status(code) {
      statusCode = Number(code) || 200;
      return api;
    },
    setHeader(name, value) {
      headers[name] = value;
      return api;
    },
    /** Vercel/Node handlers often chain res.status().setHeader().send(body) */
    send(body) {
      if (nodeRes.headersSent) return api;
      nodeRes.statusCode = statusCode;
      for (const [k, v] of Object.entries(headers)) nodeRes.setHeader(k, v);
      if (body != null && typeof body === 'object' && !Buffer.isBuffer(body)) {
        if (!headers['Content-Type'] && !headers['content-type']) {
          nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        nodeRes.end(typeof body === 'string' ? body : JSON.stringify(body));
        return api;
      }
      nodeRes.end(body ?? '');
      return api;
    },
    json(payload) {
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json; charset=utf-8';
      }
      return api.send(payload ?? {});
    },
    end(body) {
      return api.send(body ?? '');
    },
    get statusCode() {
      return statusCode;
    },
    set statusCode(code) {
      statusCode = Number(code) || 200;
    },
  };
  return api;
}

/** Map request pathname → absolute handler file under api/ */
function resolveHandlerFile(root, pathname) {
  const rel = pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  if (!rel || rel.includes('..')) return null;

  const apiRoot = path.join(root, 'api');
  const exact = path.join(apiRoot, `${rel}.js`);
  if (fs.existsSync(exact)) return { file: exact, params: {} };

  const indexFile = path.join(apiRoot, rel, 'index.js');
  if (fs.existsSync(indexFile)) return { file: indexFile, params: {} };

  // Dynamic segments: api/payment/[action].js, api/tawasul/[action].js
  const parts = rel.split('/');
  if (parts.length >= 2) {
    const dyn = path.join(apiRoot, parts[0], '[action].js');
    if (fs.existsSync(dyn)) {
      return { file: dyn, params: { action: parts.slice(1).join('/') } };
    }
  }

  return null;
}

export function aunakApiDevPlugin() {
  return {
    name: 'aunak-api-dev',
    configureServer(server) {
      const root = server.config.root || process.cwd();
      const mode = server.config.mode || 'development';
      applyEnv(mode, root);

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          next();
          return;
        }

        try {
          // Refresh Airtable env on each API hit (supports base cutover without full restart)
          applyEnv(mode, root);

          const pathname = url.split('?')[0];
          const resolved = resolveHandlerFile(root, pathname);
          if (!resolved) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'API_ROUTE_NOT_FOUND', path: pathname }));
            return;
          }

          const query = Object.fromEntries(new URL(url, 'http://localhost').searchParams.entries());
          const body =
            req.method === 'GET' || req.method === 'HEAD' ? {} : await readBody(req);

          const mod = await import(`${pathToFileURL(resolved.file).href}?t=${Date.now()}`);
          const handler = mod.default;
          if (typeof handler !== 'function') {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'HANDLER_NOT_DEFAULT_EXPORT' }));
            return;
          }

          const apiReq = {
            method: req.method,
            headers: req.headers,
            body,
            query: { ...query, ...resolved.params },
            url,
          };
          const apiRes = createRes(res);
          await handler(apiReq, apiRes);
          if (!res.writableEnded) {
            apiRes.json({ error: 'HANDLER_NO_RESPONSE' });
          }
        } catch (err) {
          console.error('[vite-api-dev]', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                error: err?.message || 'API_DEV_MIDDLEWARE_FAILED',
              })
            );
          }
        }
      });
    },
  };
}
