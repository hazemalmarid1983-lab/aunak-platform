import { useState, useEffect, useMemo } from 'react';
import { FolderOpen, FileText, Download, Star, BrainCircuit, Users } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapResource } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';

const FILTER_OPTIONS = {
  ar: ['الكل', 'أدوات تشخيص', 'أدلة إرشادية', 'مقالات تعليمية', 'فيديوهات'],
  en: ['All', 'Diagnostic Tools', 'Guidelines', 'Educational Articles', 'Videos'],
};

export default function AunakResources({ lang = 'ar' }) {
  const { records: resources, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.communityResources, {
    mapRecord: mapResource,
    lang,
  });

  const filterOptions = useMemo(() => {
    const types = [...new Set(resources.map((r) => r.type).filter(Boolean))];
    const allLabel = lang === 'en' ? 'All' : 'الكل';
    return types.length > 0 ? [allLabel, ...types] : FILTER_OPTIONS[lang] ?? FILTER_OPTIONS.ar;
  }, [resources, lang]);

  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);

  useEffect(() => {
    setActiveFilter(filterOptions[0]);
  }, [lang, filterOptions]);

  useEffect(() => {
    if (filterOptions.length && !filterOptions.includes(activeFilter)) {
      setActiveFilter(filterOptions[0]);
    }
  }, [filterOptions, activeFilter]);

  const t = {
    ar: {
      title: 'موارد دعم المجتمع',
      subtitle: 'بيانات حية من Airtable',
      addResource: '+ إضافة مورد جديد',
      categories: 'تصنيفات الموارد',
      emptyLibrary: 'لا توجد بيانات حالياً في موارد المجتمع',
      emptyFilter: 'لا توجد موارد في هذا التصنيف.',
      aiTitle: 'ملخص المورد ودرجة إمكانية الوصول (AI)',
      aiBody: (n) => `يقوم الذكاء الاصطناعي بتحليل الموارد المرفوعة وتلخيصها تلقائياً. ${n} مورداً متزامناً من Airtable.`,
    },
    en: {
      title: 'Community Support Resources',
      subtitle: 'Live data from Airtable',
      addResource: '+ Add New Resource',
      categories: 'Resource Categories',
      emptyLibrary: 'No data in community resources',
      emptyFilter: 'No resources in this category.',
      aiTitle: 'Resource Summary & Accessibility Score (AI)',
      aiBody: (n) => `AI analyzes and summarizes uploaded resources automatically. ${n} resources synced from Airtable.`,
    },
  };

  const copy = t[lang] ?? t.ar;
  const allLabel = filterOptions[0];

  const filtered =
    activeFilter === allLabel
      ? resources
      : resources.filter(
          (r) =>
            r.type?.includes(activeFilter) ||
            activeFilter.includes(r.type || '')
        );

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-pink-400 flex items-center gap-3">
            <FolderOpen className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)]">
          {copy.addResource}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-slate-800 pb-2">{copy.categories}</h3>
          <nav className="space-y-2">
            {filterOptions.map(cat => (
              <button 
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-3.5 rounded-xl border font-bold transition-all text-sm ${activeFilter === cat ? 'bg-pink-500/10 border-pink-500/50 text-pink-300 shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {loading ? (
             <AirtableLoading lang={lang} />
           ) : isEmpty ? (
             <AirtableEmpty lang={lang} message={copy.emptyLibrary} />
           ) : (
           <div className="grid md:grid-cols-2 gap-6">
             {filtered.length > 0 ? filtered.map(res => (
                <div key={res.id} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl hover:border-pink-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-pink-400" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-100">{res.title}</h4>
                            <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded-md">{res.type}</span>
                         </div>
                      </div>
                   </div>
                   <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">{res.summary || '—'}</p>
                   <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="flex gap-4">
                         <span className="flex items-center gap-1 text-xs text-slate-500"><Users className="w-3 h-3"/> {res.audience}</span>
                         <span className="flex items-center gap-1 text-xs text-slate-500"><Download className="w-3 h-3"/> {res.downloads}</span>
                      </div>
                      {res.rating != null && (
                        <span className="flex items-center gap-1 text-xs text-amber-400 font-bold"><Star className="w-3 h-3"/> {res.rating}</span>
                      )}
                   </div>
                </div>
             )) : (
               <div className="col-span-2"><AirtableEmpty lang={lang} message={copy.emptyFilter} /></div>
             )}
           </div>
           )}

           <div className="bg-pink-900/10 p-8 rounded-3xl border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.05)] mt-8">
              <h3 className="text-xl font-bold text-pink-300 mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiTitle}</h3>
              <p className="text-md text-pink-200/80 leading-relaxed bg-pink-950/50 p-5 rounded-xl border border-pink-500/30">
                 {copy.aiBody(resources.length)}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
