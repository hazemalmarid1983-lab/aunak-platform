import { useState, useEffect, useMemo } from 'react';
import { Stethoscope, Mail, Phone, Award, ShieldCheck, Activity } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapSpecialist } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';

export default function AunakSpecialists({ lang = 'ar' }) {
  const { records: specialists, loading, error } = useAirtableData(AIRTABLE_TABLES.specialists, {
    mapRecord: mapSpecialist,
    lang,
  });

  const [activeSpecialist, setActiveSpecialist] = useState(null);

  const visibleSpecialists = useMemo(
    () =>
      specialists.filter(
        (s) =>
          s.email ||
          s.phone ||
          s.rating != null ||
          (s.specialty && s.specialty !== '—') ||
          (s.name &&
            s.name !== (lang === 'en' ? 'Specialist' : 'أخصائي') &&
            s.name !== s.specialty)
      ),
    [specialists, lang]
  );

  const t = {
    ar: {
      title: 'إدارة الكادر والأخصائيين',
      subtitle: 'بيانات حية من Airtable',
      addSpecialist: '+ إضافة أخصائي',
      staff: 'الكادر السريري',
      profile: 'الملف المهني السريري',
      verified: 'موثق ومسجل',
      activeCases: 'الحالات النشطة',
      performance: 'تقييم الأداء',
      adminNotes: 'ملاحظات الإدارة (خاصة)',
      statusNote: (status) => `الحالة: ${status}. يتم مزامنة ملاحظات الأداء من سجل الجلسات و(ABC Data).`,
      aiTitle: 'تحليل الأداء الذكي (AI Performance)',
      aiBody: 'تشير البيانات المستخرجة من (سجل الجلسات الذكي) إلى كفاءة عالية للأخصائي في استخدام "النمط التفاعلي" بمختبر الألحان.',
    },
    en: {
      title: 'Specialists & Staff Management',
      subtitle: 'Live data from Airtable',
      addSpecialist: '+ Add Specialist',
      staff: 'Clinical Staff',
      profile: 'Clinical Professional Profile',
      verified: 'Verified & Registered',
      activeCases: 'Active Cases',
      performance: 'Performance Rating',
      adminNotes: 'Admin Notes (Private)',
      statusNote: (status) => `Status: ${status}. Performance notes sync from Session Registry and ABC Data.`,
      aiTitle: 'AI Performance Analysis',
      aiBody: 'Data from the Smart Session Registry shows high specialist efficiency using the interactive pattern in the Melodies Lab.',
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (visibleSpecialists.length > 0) {
      setActiveSpecialist((prev) =>
        prev && visibleSpecialists.some((s) => s.id === prev) ? prev : visibleSpecialists[0].id
      );
    } else {
      setActiveSpecialist(null);
    }
  }, [visibleSpecialists]);

  const active = visibleSpecialists.find((s) => s.id === activeSpecialist) ?? null;
  const showEmpty = !loading && visibleSpecialists.length === 0;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-teal-400 flex items-center gap-3">
            <Stethoscope className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
          {copy.addSpecialist}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-slate-800 pb-2">{copy.staff}</h3>
          {loading ? (
            <AirtableLoading lang={lang} />
          ) : showEmpty ? (
            <AirtableEmpty lang={lang} />
          ) : (
          <nav className="space-y-2">
            {visibleSpecialists.map(spec => (
              <button 
                key={spec.id}
                type="button"
                onClick={() => setActiveSpecialist(spec.id)}
                className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-4 rounded-xl border transition-all ${activeSpecialist === spec.id ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
              >
                <h4 className="font-bold text-sm mb-1">{spec.name}</h4>
                <p className="text-xs text-slate-500">{spec.specialty}</p>
              </button>
            ))}
          </nav>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                 <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Award className="w-6 h-6 text-teal-400" /> {copy.profile}</h3>
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">{copy.verified}</span>
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : !active ? (
                <AirtableEmpty lang={lang} />
              ) : (
              <>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                       <Mail className="w-4 h-4 text-slate-500" />
                       <span className="text-sm text-slate-300">{active.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                       <Phone className="w-4 h-4 text-slate-500" />
                       <span className="text-sm text-slate-300" dir="ltr">{active.phone || '—'}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                       <span className="text-xs text-slate-500 mb-1">{copy.activeCases}</span>
                       <span className="text-2xl font-black text-teal-400">{active.cases}</span>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                       <span className="text-xs text-slate-500 mb-1">{copy.performance}</span>
                       <span className="text-2xl font-black text-amber-400">{active.rating ?? '—'}</span>
                    </div>
                 </div>
              </div>

              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden group">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-400 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-rose-400" /> {copy.adminNotes}</span>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20">STEALTH MODE</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed font-mono">
                    {copy.statusNote(active.status)}
                 </p>
              </div>
              </>
              )}
           </div>

           <div className="bg-teal-900/10 p-8 rounded-3xl border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.05)] flex items-start gap-4">
              <Activity className="w-8 h-8 text-teal-400 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-teal-300 mb-2">{copy.aiTitle}</h3>
                <p className="text-sm text-teal-200/80 leading-relaxed">
                   {copy.aiBody}
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
