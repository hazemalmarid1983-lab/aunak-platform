import { useMemo, useState, useEffect } from 'react';
import { BrainCircuit, ShieldAlert, ShieldCheck, Smile, Frown, Angry, Meh } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapEmotionSignal } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';

const ICON_BY_EMOTION = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
  angry: Angry,
  joy: Smile,
  calm: Meh,
};

const FALLBACK_EMOTIONS = [
  { id: 'happy', emotionId: 'happy', label: 'Happy', score: 92 },
  { id: 'neutral', emotionId: 'neutral', label: 'Neutral', score: 68 },
  { id: 'sad', emotionId: 'sad', label: 'Sad', score: 42 },
  { id: 'angry', emotionId: 'angry', label: 'Angry', score: 18 },
];

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
  if (id.includes('neutral') || id.includes('calm')) return 'text-cyan-400';
  if (id.includes('sad')) return 'text-amber-400';
  if (id.includes('angry')) return 'text-rose-400';
  return 'text-slate-400';
}

export default function AunakEmotion() {
  const { records, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.emotionalMonitoring, {
    mapRecord: mapEmotionSignal,
  });

  const emotions = isEmpty ? FALLBACK_EMOTIONS : records;

  const [activeEmotion, setActiveEmotion] = useState(FALLBACK_EMOTIONS[1].emotionId);

  useEffect(() => {
    if (emotions.length > 0) {
      const first = emotions[0].emotionId ?? emotions[0].id;
      setActiveEmotion((prev) =>
        emotions.some((e) => (e.emotionId ?? e.id) === prev) ? prev : first
      );
    }
  }, [records.length, isEmpty]);

  const shield = useMemo(() => getShieldState(activeEmotion), [activeEmotion]);
  const activeRecord = emotions.find((e) => (e.emotionId ?? e.id) === activeEmotion);

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 p-6 md:p-10" dir="ltr">
      <header className="max-w-6xl mx-auto mb-8 pb-6 border-b border-slate-800">
        <h2 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
          <BrainCircuit className="w-8 h-8" /> Aunak Emotion Detection
        </h2>
        <p className="text-slate-400 mt-2">
          Live emotional monitoring from Airtable {isEmpty && '(showing demo signals until records exist)'}
        </p>
      </header>

      <AirtableErrorBanner error={error} />

      <main className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-slate-100 mb-5">Emotion Signals</h3>
          {loading ? (
            <AirtableLoading message="Loading emotional monitoring..." />
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
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-2 font-bold ${colorFor(eid)}`}>
                      <Icon className="w-5 h-5" /> {item.label}
                    </span>
                    <span className="text-sm font-mono text-slate-400">{item.score}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">Tap to run Smart Shield interpretation.</p>
                </button>
              );
            })}
          </div>
          )}
          {!loading && isEmpty && (
            <p className="text-xs text-slate-500 mt-4 text-center">لا توجد بيانات حالياً — عرض إشارات تجريبية</p>
          )}
        </section>

        <aside
          className={`border rounded-3xl p-6 shadow-2xl transition-all ${
            shield.critical
              ? 'border-rose-500/40 bg-rose-950/20'
              : 'border-emerald-500/30 bg-emerald-950/10'
          }`}
        >
          <h3 className="text-lg font-bold text-slate-100 mb-4">Smart Shield Status</h3>
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
        </aside>
      </main>
    </div>
  );
}
