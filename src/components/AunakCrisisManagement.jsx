import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, AlertTriangle, BrainCircuit, ShieldCheck } from 'lucide-react';

export default function AunakCrisisManagement({ lang = 'ar' }) {
  const [intensity, setIntensity] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [duration, setDuration] = useState(1);
  const [riskScore, setRiskScore] = useState(4.5);

  const t = {
    ar: {
      title: 'الدرع الذكي وإدارة الأزمات',
      subtitle: 'نظام (ABC Data) وتقييم مستوى الخطر اللحظي المعتمد ببراءة اختراع',
      abcInputs: 'مدخلات السلوك (ABC)',
      intensity: 'الشدة (Intensity) - الوزن: x2',
      frequency: 'التكرار (Frequency) - الوزن: x1.5',
      duration: 'المدة بالدقائق (Duration) - الوزن: x1',
      riskIndex: 'مؤشر الخطر اللحظي',
      critical: 'تحذير: مستوى خطر حرج! تم تفعيل بروتوكول الدرع الذكي وإبلاغ الإدارة.',
      stable: 'الوضع مستقر - السلوك تحت السيطرة',
    },
    en: {
      title: 'Smart Shield & Crisis Management',
      subtitle: 'ABC Data system and patented real-time risk assessment',
      abcInputs: 'Behavior Inputs (ABC)',
      intensity: 'Intensity — weight: x2',
      frequency: 'Frequency — weight: x1.5',
      duration: 'Duration (minutes) — weight: x1',
      riskIndex: 'Real-Time Risk Index',
      critical: 'Warning: Critical risk level! Smart Shield protocol activated and management notified.',
      stable: 'Status stable — behavior under control',
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    const score = (intensity * 2) + (frequency * 1.5) + duration;
    setRiskScore(score);
  }, [intensity, frequency, duration]);

  const isCritical = riskScore > 15;

  return (
    <div className="p-6 md:p-10 bg-[#050508] min-h-screen text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <header className="mb-10 border-b border-slate-800 pb-6">
         <h2 className="text-3xl md:text-4xl font-bold text-rose-400 flex items-center gap-3">
           <ShieldAlert className="w-10 h-10" /> {copy.title}
         </h2>
         <p className="text-slate-400 mt-2 text-lg">{copy.subtitle}</p>
       </header>

       <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
         <div className="bg-slate-900/60 backdrop-blur p-8 rounded-3xl border border-slate-800 shadow-2xl">
           <h3 className="text-2xl font-bold text-amber-400 mb-8 flex items-center gap-2"><Activity className="w-6 h-6" /> {copy.abcInputs}</h3>
           <div className="space-y-8">
             <div>
               <label className="flex justify-between text-lg mb-3 text-slate-300"><span>{copy.intensity}</span> <span className="font-bold text-amber-400 text-xl">{intensity}</span></label>
               <input type="range" min="1" max="5" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
             </div>
             <div>
               <label className="flex justify-between text-lg mb-3 text-slate-300"><span>{copy.frequency}</span> <span className="font-bold text-amber-400 text-xl">{frequency}</span></label>
               <input type="range" min="1" max="5" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
             </div>
             <div>
               <label className="flex justify-between text-lg mb-3 text-slate-300"><span>{copy.duration}</span> <span className="font-bold text-amber-400 text-xl">{duration}</span></label>
               <input type="range" min="1" max="20" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
             </div>
           </div>
         </div>

         <div className={`p-10 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${isCritical ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_70px_rgba(244,63,94,0.2)]' : 'bg-slate-900/60 border-emerald-500/30'}`}>
           <BrainCircuit className={`w-24 h-24 mb-6 ${isCritical ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`} />
           <h3 className="text-2xl font-bold text-slate-100 mb-4">{copy.riskIndex}</h3>
           <div className={`text-8xl font-black font-mono mb-6 ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
             {riskScore.toFixed(1)}
           </div>
           {isCritical ? (
             <div className="bg-rose-500/20 text-rose-300 border border-rose-500/50 px-6 py-4 rounded-xl flex items-center gap-3 font-bold animate-bounce mt-4 text-lg text-center">
               <AlertTriangle className="w-8 h-8 shrink-0" /> {copy.critical}
             </div>
           ) : (
             <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-4 rounded-xl flex items-center gap-3 font-bold mt-4 text-lg">
               <ShieldCheck className="w-8 h-8" /> {copy.stable}
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
