import { useState } from 'react';
import { Ghost, Loader2, Sparkles, Target, Volume2 } from 'lucide-react';
import { MIRROR_COMMANDS } from '../../lib/tawasulMirror';
import { TAWASUL_STUDENT } from '../../lib/tawasulStudentFields';

function readApiError(data, status) {
  const err = data?.error ?? data?.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    return err.message || err.error || err.hint || JSON.stringify(err);
  }
  return `MIRROR_${status}`;
}

async function sendMirror({ studentId, command, payload = '', goalEcho }) {
  const res = await fetch('/api/tawasul/mirror', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ studentId, command, payload, goalEcho }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(readApiError(data, res.status));
  return data;
}

export default function TawasulMirrorPanel({ lang = 'ar', student, goalDraft, onGoalSynced }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const copy =
    lang === 'en'
      ? {
          title: 'Ghost Mirror',
          echo: 'Echo goal on child screen',
          star: 'Drop star reward',
          calm: 'Calm pulse',
          speaking: 'Sending…',
        }
      : {
          title: 'المرآة الشبحية',
          echo: 'تكرار الهدف على شاشة الطفل',
          star: 'إسقاط مكافأة نجمة',
          calm: 'نبضة هدوء',
          speaking: 'جاري الإرسال…',
        };

  const run = async (command, payload = '', goalEcho) => {
    if (!student?.id || busy) return;
    setBusy(command);
    setError('');
    try {
      await sendMirror({ studentId: student.id, command, payload, goalEcho });
      if (goalEcho) onGoalSynced?.(goalEcho);
    } catch (e) {
      setError(e instanceof Error ? e.message : readApiError(e, 'ERR'));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="rounded-xl border border-[#c9a962]/25 bg-[#0d0d10]/60 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-[#e8c872]">
        <Ghost className="w-4 h-4" />
        {copy.title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => run(MIRROR_COMMANDS.ECHO_GOAL, 'live', goalDraft || student?.programmedGoal)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#c9a962]/10 border border-[#c9a962]/30 text-xs font-bold text-[#e8c872] disabled:opacity-50"
        >
          {busy === MIRROR_COMMANDS.ECHO_GOAL ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
          {copy.echo}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => run(MIRROR_COMMANDS.DROP_STAR, `${Date.now()}`)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs font-bold text-emerald-300 disabled:opacity-50"
        >
          {busy === MIRROR_COMMANDS.DROP_STAR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {copy.star}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => run(MIRROR_COMMANDS.CALM_PULSE, '1')}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-xs font-bold text-cyan-200 disabled:opacity-50"
        >
          {busy === MIRROR_COMMANDS.CALM_PULSE ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
          {copy.calm}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <p className="text-[10px] text-slate-500 font-mono">
        mirror → {TAWASUL_STUDENT.programmedGoal} + {TAWASUL_STUDENT.mirrorCommand}
      </p>
    </div>
  );
}
