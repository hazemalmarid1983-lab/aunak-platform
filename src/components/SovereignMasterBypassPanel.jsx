import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import {
  activateMasterBypass,
  isMasterBypassActive,
  clearMasterBypass,
} from '../lib/sovereignMasterBypass';

/**
 * Dev-only unlock when anti-spoof blocks duplicate face during QA.
 */
export default function SovereignMasterBypassPanel({ lang = 'ar', onUnlocked, compact = false }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [active, setActive] = useState(() => isMasterBypassActive());

  const copy =
    lang === 'en'
      ? {
          title: 'Sovereign dev bypass',
          hint: 'Authorized team only — skips duplicate-face block for UI testing',
          placeholder: 'AUNAK-MASTER-2026',
          activate: 'Activate bypass',
          active: 'Bypass active — anti-spoof skipped',
          clear: 'Disable bypass',
          invalid: 'Invalid master key',
        }
      : {
          title: 'تخطي التطوير السيادي',
          hint: 'للفريق المعتمد فقط — يتخطى حظر الوجه المكرر لفحص الواجهات',
          placeholder: 'AUNAK-MASTER-2026',
          activate: 'تفعيل التخطي',
          active: 'التخطي مفعّل — anti-spoof متوقف',
          clear: 'إيقاف التخطي',
          invalid: 'مفتاح غير صالح',
        };

  const submit = (e) => {
    e?.preventDefault();
    if (activateMasterBypass(key)) {
      setActive(true);
      setError('');
      onUnlocked?.();
    } else {
      setError(copy.invalid);
    }
  };

  const deactivate = () => {
    clearMasterBypass();
    setActive(false);
    setKey('');
  };

  if (active) {
    return (
      <div
        className={`rounded-xl border border-amber-400/35 bg-amber-950/25 ${
          compact ? 'p-3' : 'p-4 mt-4'
        }`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <p className="text-xs text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {copy.active}
        </p>
        <button
          type="button"
          onClick={deactivate}
          className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 underline"
        >
          {copy.clear}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-xl border border-white/[0.08] bg-black/30 ${
        compact ? 'p-3 mt-4' : 'p-4 mt-6'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {!compact && (
        <>
          <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mb-1">
            <KeyRound className="w-3.5 h-3.5" />
            {copy.title}
          </p>
          <p className="text-[10px] text-slate-600 mb-3">{copy.hint}</p>
        </>
      )}
      <div className="flex gap-2">
        <input
          type="password"
          dir="ltr"
          autoComplete="off"
          value={key}
          onChange={(e) => {
            setKey(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          placeholder={copy.placeholder}
          className="flex-1 px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-xs font-mono text-amber-200/90"
        />
        <button
          type="submit"
          disabled={!key.trim()}
          className="px-3 py-2 rounded-lg bg-amber-600/80 text-[#0a0a0c] text-xs font-bold disabled:opacity-40"
        >
          {copy.activate}
        </button>
      </div>
      {error && <p className="text-[10px] text-rose-400 mt-2">{error}</p>}
    </form>
  );
}
