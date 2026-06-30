import { useCallback, useEffect, useRef, useState } from 'react';
import { Ghost, Loader2, Sparkles, Target, Volume2 } from 'lucide-react';
import { MIRROR_COMMANDS } from '../../lib/tawasulMirror';
import { STUDENT as SF } from '../../lib/airtableFields';
import { readTawasulApiError, tawasulFetchJson } from '../../lib/tawasulFetch';

async function sendMirror({ studentId, command, payload = '' }) {
  const { res, data } = await tawasulFetchJson('/api/tawasul/mirror', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: String(studentId ?? ''),
      command: String(command ?? ''),
      payload: String(payload ?? ''),
    }),
  });
  if (!res.ok) throw new Error(readTawasulApiError(data, res.status));
  return data;
}

async function sendEchoGoal({ studentId, goalText }) {
  const goalEcho = String(goalText ?? '').trim();
  if (!goalEcho) throw new Error('GOAL_TEXT_REQUIRED');

  const { res, data } = await tawasulFetchJson('/api/tawasul/mirror', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: String(studentId ?? ''),
      command: MIRROR_COMMANDS.ECHO_GOAL,
      payload: 'live',
      goalEcho,
    }),
  });
  if (!res.ok) throw new Error(readTawasulApiError(data, res.status));
  return data;
}

const IDLE_LOADING = {
  [MIRROR_COMMANDS.ECHO_GOAL]: false,
  [MIRROR_COMMANDS.DROP_STAR]: false,
  [MIRROR_COMMANDS.CALM_PULSE]: false,
};

export default function TawasulMirrorPanel({ lang = 'ar', student, goalDraft, onGoalSynced }) {
  const [loading, setLoading] = useState(IDLE_LOADING);
  const [error, setError] = useState('');
  const inFlightRef = useRef(null);

  useEffect(() => {
    setError('');
    inFlightRef.current = null;
    setLoading(IDLE_LOADING);
  }, [student?.id]);

  const copy =
    lang === 'en'
      ? {
          title: 'Ghost Mirror',
          echo: 'Echo goal on child screen',
          star: 'Drop star reward',
          calm: 'Calm pulse',
        }
      : {
          title: 'المرآة الشبحية',
          echo: 'تكرار الهدف على شاشة الطفل',
          star: 'إسقاط مكافأة نجمة',
          calm: 'نبضة هدوء',
        };

  const clearCommandLoading = useCallback((command) => {
    setLoading((prev) => ({ ...prev, [command]: false }));
  }, []);

  const releaseCommand = useCallback((command) => {
    inFlightRef.current = null;
    clearCommandLoading(command);
  }, [clearCommandLoading]);

  const runCommand = useCallback(
    async (command, apiCall, afterSuccess) => {
      if (!student?.id || inFlightRef.current) return;

      inFlightRef.current = command;
      setLoading((prev) => ({ ...prev, [command]: true }));
      setError('');

      try {
        await apiCall();
        clearCommandLoading(command);
        afterSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : readTawasulApiError(e, 'ERR'));
      } finally {
        releaseCommand(command);
      }
    },
    [clearCommandLoading, releaseCommand, student?.id]
  );

  useEffect(() => {
    return () => {
      inFlightRef.current = null;
    };
  }, []);

  const onEchoGoal = () => {
    const goalText = String(goalDraft ?? student?.programmedGoal ?? '').trim();
    runCommand(
      MIRROR_COMMANDS.ECHO_GOAL,
      () => sendEchoGoal({ studentId: student.id, goalText }),
      () => onGoalSynced?.(goalText)
    );
  };

  const onDropStar = () => {
    runCommand(MIRROR_COMMANDS.DROP_STAR, () =>
      sendMirror({
        studentId: student.id,
        command: MIRROR_COMMANDS.DROP_STAR,
        payload: 'star',
      })
    );
  };

  const onCalmPulse = () => {
    runCommand(MIRROR_COMMANDS.CALM_PULSE, () =>
      sendMirror({
        studentId: student.id,
        command: MIRROR_COMMANDS.CALM_PULSE,
        payload: '1',
      })
    );
  };

  const anyLoading = Object.values(loading).some(Boolean);

  const mergeBtn = (isLoading, activeCls, idleCls) =>
    `flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
      isLoading ? activeCls : idleCls
    }`;

  return (
    <div className="rounded-xl border border-[#c9a962]/25 bg-[#0d0d10]/60 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-[#e8c872]">
        <Ghost className="w-4 h-4" />
        {copy.title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          disabled={loading[MIRROR_COMMANDS.ECHO_GOAL] || (anyLoading && !loading[MIRROR_COMMANDS.ECHO_GOAL])}
          onClick={onEchoGoal}
          aria-busy={loading[MIRROR_COMMANDS.ECHO_GOAL]}
          className={mergeBtn(
            loading[MIRROR_COMMANDS.ECHO_GOAL],
            'bg-[#c9a962]/25 border-2 border-[#c9a962]/60 text-[#e8c872] ring-2 ring-[#c9a962]/20',
            'bg-[#c9a962]/10 border border-[#c9a962]/30 text-[#e8c872] hover:bg-[#c9a962]/15'
          )}
        >
          {loading[MIRROR_COMMANDS.ECHO_GOAL] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
          {copy.echo}
        </button>
        <button
          type="button"
          disabled={loading[MIRROR_COMMANDS.DROP_STAR] || (anyLoading && !loading[MIRROR_COMMANDS.DROP_STAR])}
          onClick={onDropStar}
          aria-busy={loading[MIRROR_COMMANDS.DROP_STAR]}
          className={mergeBtn(
            loading[MIRROR_COMMANDS.DROP_STAR],
            'bg-emerald-500/25 border-2 border-emerald-400/60 text-emerald-200 ring-2 ring-emerald-400/20',
            'bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/15'
          )}
        >
          {loading[MIRROR_COMMANDS.DROP_STAR] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {copy.star}
        </button>
        <button
          type="button"
          disabled={loading[MIRROR_COMMANDS.CALM_PULSE] || (anyLoading && !loading[MIRROR_COMMANDS.CALM_PULSE])}
          onClick={onCalmPulse}
          aria-busy={loading[MIRROR_COMMANDS.CALM_PULSE]}
          className={mergeBtn(
            loading[MIRROR_COMMANDS.CALM_PULSE],
            'bg-cyan-500/25 border-2 border-cyan-400/60 text-cyan-100 ring-2 ring-cyan-400/20',
            'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/15'
          )}
        >
          {loading[MIRROR_COMMANDS.CALM_PULSE] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Target className="w-3 h-3" />
          )}
          {copy.calm}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <p className="text-[10px] text-slate-500 font-mono">
        mirror → {SF.programmed_goal} + {SF.mirror_command}
      </p>
    </div>
  );
}
