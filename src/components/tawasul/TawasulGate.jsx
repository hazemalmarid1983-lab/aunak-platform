import { useState } from 'react';
import { KeyRound, Loader2, MessageCircle } from 'lucide-react';
import PlatformLogo from '../PlatformLogo';
import { useAuth } from '../../lib/auth';
import { verifyTawasulSpecialistToken } from '../../lib/tawasulAuth';
import { TAWASUL_COPY } from '../../lib/tawasulConfig';

export default function TawasulGate({ lang = 'ar' }) {
  const { login } = useAuth();
  const [token, setToken] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const copy = TAWASUL_COPY[lang] ?? TAWASUL_COPY.ar;

  const submit = async (e) => {
    e?.preventDefault();
    if (!token.trim() || state === 'verifying') return;
    setState('verifying');
    setError('');
    try {
      const session = await verifyTawasulSpecialistToken(token);
      if (session) login(session);
      else {
        setState('error');
        setError(copy.tokenInvalid);
      }
    } catch (err) {
      setState('error');
      setError(err?.message ?? copy.tokenInvalid);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1222] via-[#12121a] to-[#0a0a0c] flex items-center justify-center p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-[#12121a]/90 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <div className="flex flex-col items-center gap-3 mb-8">
          <MessageCircle className="w-10 h-10 text-cyan-400" />
          <PlatformLogo lang={lang} className="h-10 w-auto" />
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-300 to-teal-400">
            {copy.platform}
          </h1>
          <p className="text-xs text-slate-500 text-center">{copy.tagline}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-bold text-slate-300">{copy.specialistGate}</label>
          <div className="relative">
            <KeyRound className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 start-3" />
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={copy.tokenHint}
              className="w-full rounded-xl border border-white/10 bg-black/30 py-3 ps-10 pe-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={!token.trim() || state === 'verifying'}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-l from-cyan-500 to-teal-500 text-white disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {state === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {copy.specialistGate}
          </button>
        </form>
      </div>
    </div>
  );
}
