import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('tawasulConfig routing', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { pathname: '/' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadConfig(env = {}) {
    vi.stubEnv('VITE_AIRTABLE_BASE_ID', env.base ?? 'appaGfKj4vYhMw0cb');
    vi.stubEnv('VITE_TAWASUL_MVP', env.tawasul ?? 'false');
    vi.resetModules();
    return import('../src/lib/tawasulConfig.js');
  }

  it('shouldShowTawasulShell is false at / on sovereign production', async () => {
    const { shouldShowTawasulShell } = await loadConfig({ base: 'appaGfKj4vYhMw0cb', tawasul: 'true' });
    window.location.pathname = '/';
    expect(shouldShowTawasulShell()).toBe(false);
  });

  it('shouldShowTawasulShell is true on /tawasul even on sovereign production', async () => {
    const { shouldShowTawasulShell } = await loadConfig({ base: 'appaGfKj4vYhMw0cb', tawasul: 'false' });
    window.location.pathname = '/tawasul';
    expect(shouldShowTawasulShell()).toBe(true);
  });

  it('shouldShowTawasulShell hijacks / only on Tawasul sandbox base', async () => {
    const { shouldShowTawasulShell } = await loadConfig({ base: 'app3vCT2j2JepNVZa', tawasul: 'true' });
    window.location.pathname = '/';
    expect(shouldShowTawasulShell()).toBe(true);
  });
});
