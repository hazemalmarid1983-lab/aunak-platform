import { useState, useEffect } from 'react';
import { Camera, Music, Smile, Activity, BrainCircuit, PlayCircle } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapMelodyPattern, mapEmotionSignal } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';

export default function AunakEmotionalLab({ lang = 'ar' }) {
  const { records: patterns, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.melodyLab, {
    mapRecord: mapMelodyPattern,
    lang,
  });

  const { records: emotionSignals } = useAirtableData(AIRTABLE_TABLES.emotionalMonitoring, {
    mapRecord: mapEmotionSignal,
    lang,
  });

  const topEmotion = emotionSignals[0] ?? null;

  const [activePattern, setActivePattern] = useState(null);

  const t = {
    ar: {
      title: 'مختبر ألحان عونك والرصد العاطفي',
      subtitle: 'أنماط صوتية حية من Airtable (مختبر الألحان)',
      liveMonitoring: 'الرصد العاطفي اللحظي',
      detected: (label, score) => `رصد: ${label} (${score}%)`,
      scanning: (au) => `Face AUs: ${au || 'SCANNING...'}`,
      patterns: 'الأنماط الصوتية التعليمية',
      emptyMelody: 'لا توجد بيانات حالياً في مختبر الألحان',
      interaction: 'مؤشر التفاعل',
      aiAnalysis: (name, score) => `تحليل الذكاء الاصطناعي: ${name} — ${score}% تفاعل.`,
    },
    en: {
      title: 'Aunak Melodies Lab & Emotional Monitoring',
      subtitle: 'Live audio patterns from Airtable (Melody Lab)',
      liveMonitoring: 'Live Emotional Monitoring',
      detected: (label, score) => `Detected: ${label} (${score}%)`,
      scanning: (au) => `Face AUs: ${au || 'SCANNING...'}`,
      patterns: 'Educational Audio Patterns',
      emptyMelody: 'No data in Melody Lab yet',
      interaction: 'Interaction Index',
      aiAnalysis: (name, score) => `AI analysis: ${name} — ${score}% engagement.`,
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (patterns.length > 0) {
      const firstId = patterns[0].id;
      setActivePattern((prev) =>
        prev && patterns.some((p) => p.id === prev) ? prev : firstId
      );
    }
  }, [patterns]);

  const active = patterns.find((p) => p.id === activePattern) ?? null;

  return (
    <div className="p-6 md:p-10 min-h-screen text-slate-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <header className="mb-8 border-b border-slate-800 pb-6">
         <h2 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
           <Music className="w-8 h-8" /> {copy.title}
         </h2>
         <p className="text-slate-400 mt-2">{copy.subtitle}</p>
       </header>

       <AirtableErrorBanner error={error} />

       <div className="grid lg:grid-cols-2 gap-8">
         <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
           <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
             <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> AI CAMERA ACTIVE
             </div>
             <Camera className="w-5 h-5 text-slate-500" />
           </div>
           <div className="relative aspect-video bg-slate-950 rounded-xl border border-slate-700 flex flex-col items-center justify-center overflow-hidden">
             <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-xl animate-pulse" />
             <Smile className="w-16 h-16 text-cyan-400 mb-4" strokeWidth={1.5} />
             <div className="text-center z-10">
               <h3 className="font-bold text-slate-200">{copy.liveMonitoring}</h3>
               <p className="text-xs text-slate-400 font-mono mt-2">
                 {topEmotion
                   ? copy.detected(topEmotion.label, topEmotion.score)
                   : copy.scanning(active?.au)}
               </p>
             </div>
           </div>
         </div>

         <div className="space-y-4">
           <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-6">
             <Activity className="w-5 h-5" /> {copy.patterns}
           </h3>
           {loading ? (
             <AirtableLoading lang={lang} />
           ) : isEmpty ? (
             <AirtableEmpty lang={lang} message={copy.emptyMelody} />
           ) : (
           patterns.map(pattern => (
             <button key={pattern.id} type="button" onClick={() => setActivePattern(pattern.id)} className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${activePattern === pattern.id ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}>
               <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                 <h4 className="font-bold text-slate-100 flex items-center gap-2"><PlayCircle className={`w-4 h-4 ${activePattern === pattern.id ? 'text-cyan-400' : 'text-slate-500'}`} /> {pattern.name}</h4>
                 <p className="text-sm text-slate-400 mt-1">{pattern.desc}</p>
               </div>
               <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                 <div className="text-2xl font-black text-emerald-400">{pattern.score}%</div>
                 <div className="text-[10px] text-slate-500">{copy.interaction}</div>
               </div>
             </button>
           ))
           )}
           {active && (
             <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex gap-3">
               <BrainCircuit className="w-6 h-6 text-emerald-400 shrink-0" />
               <p className="text-sm text-emerald-200">{copy.aiAnalysis(active.name, active.score)}</p>
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
