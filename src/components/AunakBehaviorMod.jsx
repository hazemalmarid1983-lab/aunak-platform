import { useState, useEffect } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapAbcPlan } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { TrendingDown, BrainCircuit, LineChart, FileSignature, Target } from 'lucide-react';
import { LUX } from '../lib/luxTheme.js';

export default function AunakBehaviorMod({ lang = 'ar' }) {
  const { students } = useStudents(lang);
  const { records: plans, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.abcData, {
    mapRecord: mapAbcPlan,
    lang,
  });

  const [activePlan, setActivePlan] = useState(null);

  const t = {
    ar: {
      title: 'إدارة تعديل السلوك',
      subtitle: 'خطط ABC — بيانات حية من Airtable',
      targetStudent: 'الطالب المستهدف:',
      activePlans: 'الخطط السلوكية النشطة',
      emptyAbc: 'لا توجد بيانات ABC حالياً',
      planDetails: 'تفاصيل خطة التدخل',
      targetBehavior: 'السلوك المستهدف',
      strategyLabel: 'استراتيجية التدخل وملاحظات التقدم (نص حر)',
      strategyPlaceholder: 'أدخل استراتيجيات التدخل وملاحظات الجلسة هنا...',
      chartTitle: 'منحنى شدة السلوك (AI)',
      viewChart: 'عرض تفاصيل الرسم البياني',
      planMeta: (title, intensity) => `الخطة: ${title} — ${intensity}`,
      abcFallback: 'بيانات ABC من Airtable',
      progressTitle: 'تقييم التقدم الذكي',
      progressBody: 'تشير البيانات التحليلية إلى استجابة ممتازة لاستراتيجية (التعزيز التفاضلي). يُنصح بتقليل المحفزات المادية تدريجياً.',
    },
    en: {
      title: 'Behavior Modification',
      subtitle: 'ABC plans — live data from Airtable',
      targetStudent: 'Target student:',
      activePlans: 'Active Behavior Plans',
      emptyAbc: 'No ABC data available',
      planDetails: 'Intervention Plan Details',
      targetBehavior: 'Target Behavior',
      strategyLabel: 'Intervention strategy & progress notes (free text)',
      strategyPlaceholder: 'Enter intervention strategies and session notes here...',
      chartTitle: 'Behavior Intensity Curve (AI)',
      viewChart: 'View Chart Details',
      planMeta: (title, intensity) => `Plan: ${title} — ${intensity}`,
      abcFallback: 'ABC data from Airtable',
      progressTitle: 'Smart Progress Assessment',
      progressBody: 'Analytics indicate excellent response to differential reinforcement. Recommend gradually reducing tangible reinforcers.',
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (plans.length > 0) {
      setActivePlan((prev) =>
        prev && plans.some((p) => p.id === prev) ? prev : plans[0].id
      );
    } else {
      setActivePlan(null);
    }
  }, [plans]);

  const active = plans.find((p) => p.id === activePlan) ?? null;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-orange-400 flex items-center gap-3">
            <TrendingDown className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-5 rounded-2xl border border-[#c9a962]/15">
            <h3 className="text-sm text-slate-500 mb-2 font-bold">{copy.targetStudent}</h3>
            <p className="text-xl font-bold text-slate-300 flex items-center gap-2">
               {students?.[0]?.name || '—'}
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.activePlans}</h3>
            {loading ? (
              <AirtableLoading lang={lang} />
            ) : isEmpty ? (
              <AirtableEmpty lang={lang} message={copy.emptyAbc} />
            ) : (
            plans.map(plan => (
              <button 
                key={plan.id}
                type="button"
                onClick={() => setActivePlan(plan.id)}
                className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-4 rounded-xl border transition-all ${activePlan === plan.id ? 'bg-[#c9a962]/10 border-[#c9a962]/35/50 text-[#e8c872] shadow-lg' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'}`}
              >
                <h4 className="font-bold text-sm mb-1">{plan.title}</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{plan.status}</span>
                  <span className="text-emerald-400" dir="ltr">{plan.intensity}</span>
                </div>
              </button>
            ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
                 <h3 className="text-2xl font-bold text-slate-300 flex items-center gap-2"><FileSignature className="w-6 h-6 text-orange-400" /> {copy.planDetails}</h3>
                 {active && (
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold animate-pulse">{active.status}</span>
                 )}
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : !active ? (
                <AirtableEmpty lang={lang} />
              ) : (
              <div className="space-y-5">
                 <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <p className="text-sm text-slate-500 mb-2 font-bold flex items-center gap-2"><Target className="w-4 h-4" /> {copy.targetBehavior}</p>
                    <p className="text-slate-200">{active.behavior}</p>
                 </div>
                 <div>
                    <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.strategyLabel}</label>
                    <textarea className="w-full h-24 bg-[#0d0d10]/90 border border-white/[0.08] rounded-xl p-4 text-slate-300 focus:border-[#c9a962]/45 outline-none text-sm" placeholder={copy.strategyPlaceholder}></textarea>
                 </div>
              </div>
              )}
           </div>

           <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-orange-900/10 p-6 rounded-3xl border border-[#c9a962]/35/20 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#0d0d10]/90/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                     <button type="button" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold">{copy.viewChart}</button>
                  </div>
                  <LineChart className="w-16 h-16 text-orange-500/50 mb-3" />
                  <h3 className="text-lg font-bold text-[#e8c872]">{copy.chartTitle}</h3>
                  <p className="text-xs text-orange-200/60 mt-2 font-mono">
                    {active ? copy.planMeta(active.title, active.intensity) : copy.abcFallback}
                  </p>
               </div>

               <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-emerald-400" /> {copy.progressTitle}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                     {copy.progressBody}
                  </p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
