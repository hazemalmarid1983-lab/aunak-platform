import { useMemo, useState, useEffect } from 'react';
import { BrainCircuit, ShieldAlert, ShieldCheck, Smile, Frown, Angry, Meh } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapEmotionSignal } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const ICON_BY_EMOTION = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
  angry: Angry,
  joy: Smile,
  calm: Meh,
};

function getShieldState(emotionId) {
  const id = String(emotionId).toLowerCase();
  if (id.includes('happy') || id.includes('joy')) {
    return {
      level: 'Stable',
      note: 'Child is regulated. Keep current activity pacing.',
      critical: false,
    };
  }
  if (id.includes('neutral') || id.includes('calm')) {
    return {
      level: 'Observing',
      note: 'Attention is acceptable. Use light engagement prompts.',
      critical: false,
    };
  }
  if (id.includes('sad')) {
    return {
      level: 'Caution',
      note: 'Possible emotional drop. Start calm support protocol.',
      critical: true,
    };
  }
  return {
    level: 'Critical',
    note: 'Escalation detected. Smart Shield crisis protocol engaged.',
    critical: true,
  };
}

function resolveIcon(emotionId) {
  const id = String(emotionId).toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_BY_EMOTION)) {
    if (id.includes(key)) return Icon;
  }
  return Meh;
}

function colorFor(emotionId) {
  const id = String(emotionId).toLowerCase();
  if (id.includes('happy') || id.includes('joy')) return 'text-emerald-400';
  if (id.includes('neutral') || id.includes('calm')) return 'text-emerald-400';
  if (id.includes('sad')) return 'text-[#d4af37]';
  if (id.includes('angry')) return 'text-rose-400';
  return 'text-slate-400';
}

export default function AunakEmotion() {
  const { records, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.emotionalMonitoring, {
    mapRecord: mapEmotionSignal,
  });

  const emotions = records.filter((r) => r?.label);
  const [activeEmotion, setActiveEmotion] = useState(null);

  useEffect(() => {
    if (emotions.length > 0) {
      const first = emotions[0].emotionId ?? emotions[0].id;
      setActiveEmotion((prev) =>
        prev && emotions.some((e) => (e.emotionId ?? e.id) === prev) ? prev : first
      );
    } else {
      setActiveEmotion(null);
    }
  }, [records, isEmpty]);

  const shield = useMemo(
    () => (activeEmotion ? getShieldState(activeEmotion) : null),
    [activeEmotion]
  );
  const activeRecord = emotions.find((e) => (e.emotionId ?? e.id) === activeEmotion);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 md:p-10" dir="ltr">
      <header className="max-w-6xl mx-auto mb-8 pb-6 border-b border-[#c9a962]/15">
        <h2 className={`${LUX.titleGradient} flex items-center gap-3`}>
          <BrainCircuit className="w-8 h-8" /> Aunak Emotion Detection
        </h2>
        <p className="text-slate-400 mt-2">Live emotional monitoring from Airtable — no demo data</p>
      </header>

      <AirtableErrorBanner error={error} />

      <main className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-slate-300 mb-5">Emotion Signals</h3>
          {loading ? (
            <AirtableLoading message="Loading emotional monitoring..." />
          ) : isEmpty || emotions.length === 0 ? (
            <AirtableEmpty lang="en" message="No emotional monitoring records in Airtable yet." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {emotions.map((item) => {
                const eid = item.emotionId ?? item.id;
                const Icon = resolveIcon(eid);
                const isActive = activeEmotion === eid;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveEmotion(eid)}
                    className={`rounded-2xl p-5 border transition-all text-left ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'border-white/[0.08] bg-slate-800/40 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 font-bold ${colorFor(eid)}`}>
                        <Icon className="w-5 h-5" /> {item.label}
                      </span>
                      <span className="text-sm font-mono text-slate-400">
                        {item.score != null ? `${item.score}%` : '—'}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-slate-400 mt-3 line-clamp-2">{item.note}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <aside
          className={`border rounded-3xl p-6 shadow-2xl transition-all ${
            !shield
              ? 'border-white/[0.08] bg-[#12121a]/50'
              : shield.critical
                ? 'border-rose-500/40 bg-rose-950/20'
                : 'border-emerald-500/30 bg-emerald-950/10'
          }`}
        >
          <h3 className="text-lg font-bold text-slate-300 mb-4">Smart Shield Status</h3>
          {!shield ? (
            <p className="text-sm text-slate-500">Select a live signal from Airtable to interpret.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                {shield.critical ? (
                  <ShieldAlert className="w-7 h-7 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                )}
                <span className={`font-black text-2xl ${shield.critical ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {shield.level}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeRecord?.note || shield.note}
              </p>
              <div className="mt-5 text-xs text-slate-500 font-mono">
                Active emotion: {String(activeEmotion).toUpperCase()}
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
