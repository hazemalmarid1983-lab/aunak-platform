import { useState, useEffect, useMemo } from 'react';
import { BookMarked, Layers, BrainCircuit, Database, PlusCircle, Activity } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapScientificItem } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';

const DEFAULT_CATEGORIES = {
  ar: ['اللغة الاستقبالية', 'اللغة التعبيرية', 'التفاعل الاجتماعي', 'صعوبات التعلم', 'المهارات الحركية'],
  en: ['Receptive Language', 'Expressive Language', 'Social Interaction', 'Learning Difficulties', 'Motor Skills'],
};

export default function AunakScientificItems({ lang = 'ar' }) {
  const { records, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.scientificItems, {
    mapRecord: mapScientificItem,
    lang,
  });

  const t = {
    ar: {
      title: 'مكتبة البنود العلمية',
      subtitle: 'بيانات حية من Airtable — المرجع السريري للبنود العلمية',
      addItem: 'إضافة بند جديد',
      totalItems: 'إجمالي البنود',
      itemsUnit: 'بنداً',
      categories: 'التصنيفات العلمية',
      domainItems: (cat) => `بنود مجال: ${cat}`,
      usage: (n) => `تم استخدامه في ${n} خطة علاجية (IEP)`,
      weight: 'الوزن النسبي (AI)',
      emptyLibrary: 'لا توجد بيانات حالياً في مكتبة البنود',
      emptyCategory: 'لا توجد بنود في هذا التصنيف حالياً.',
      aiTitle: 'تحليل الأوزان النسبية للذكاء الاصطناعي',
      aiBody: 'يقوم نظام الذكاء الاصطناعي بتحديث "الوزن النسبي" لكل بند تلقائياً بناءً على معدل نجاحه في جلسات (تعديل السلوك). البنود ذات الأوزان المرتفعة (أعلى من 0.8) سيتم اقتراحها أولاً عند بناء خطط (IEP) الجديدة لضمان أقصى درجات الاستجابة والتناغم.',
    },
    en: {
      title: 'Scientific Items Library',
      subtitle: 'Live Airtable data — clinical reference for scientific items',
      addItem: 'Add New Item',
      totalItems: 'Total Items',
      itemsUnit: 'items',
      categories: 'Scientific Categories',
      domainItems: (cat) => `Domain items: ${cat}`,
      usage: (n) => `Used in ${n} IEP plans`,
      weight: 'Relative Weight (AI)',
      emptyLibrary: 'No data in the scientific items library',
      emptyCategory: 'No items in this category yet.',
      aiTitle: 'AI Relative Weight Analysis',
      aiBody: 'The AI system updates each item\'s relative weight based on success rates in behavior modification sessions. Items above 0.8 are prioritized when building new IEP plans for maximum response and harmony.',
    },
  };

  const copy = t[lang] ?? t.ar;
  const fallbackCategories = DEFAULT_CATEGORIES[lang] ?? DEFAULT_CATEGORIES.ar;

  const categories = useMemo(() => {
    const fromData = [...new Set(records.map((r) => r.category).filter(Boolean))];
    return fromData.length > 0 ? fromData : fallbackCategories;
  }, [records, fallbackCategories]);

  const [activeCategory, setActiveCategory] = useState(fallbackCategories[0]);

  useEffect(() => {
    const next = (DEFAULT_CATEGORIES[lang] ?? DEFAULT_CATEGORIES.ar)[0];
    setActiveCategory(next);
  }, [lang]);

  useEffect(() => {
    if (categories.length && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const filteredItems = records.filter((item) => item.category === activeCategory);
  const totalCount = records.length;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-violet-400 flex items-center gap-3">
            <Database className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <PlusCircle className="w-5 h-5" /> {copy.addItem}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 mb-4 flex items-center gap-3">
             <Layers className="w-8 h-8 text-violet-500" />
             <div>
                <h3 className="text-sm text-slate-400 font-bold">{copy.totalItems}</h3>
                <p className="text-2xl font-black text-slate-100">
                  {loading ? '…' : totalCount} <span className="text-sm font-normal text-slate-500">{copy.itemsUnit}</span>
                </p>
             </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-slate-800 pb-2">{copy.categories}</h3>
          <nav className="space-y-2">
            {categories.map(cat => (
              <button 
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold transition-all text-sm ${activeCategory === cat ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
              >
                {cat}
                {activeCategory === cat && <Activity className="w-4 h-4" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                 <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2"><BookMarked className="w-6 h-6 text-violet-400" /> {copy.domainItems(activeCategory)}</h3>
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : isEmpty ? (
                <AirtableEmpty lang={lang} message={copy.emptyLibrary} />
              ) : (
              <div className="space-y-4">
                 {filteredItems.length > 0 ? filteredItems.map(item => (
                    <div key={item.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-violet-500/30 transition-colors flex justify-between items-center group">
                       <div>
                          <h4 className="text-md font-bold text-slate-200">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 font-mono">{copy.usage(item.usage)}</p>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-400 mb-1">{copy.weight}</span>
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold font-mono">{item.weight}</span>
                       </div>
                    </div>
                 )) : (
                    <AirtableEmpty lang={lang} message={copy.emptyCategory} />
                 )}
              </div>
              )}
           </div>

           <div className="bg-violet-900/10 p-8 rounded-3xl border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.05)]">
              <h3 className="text-xl font-bold text-violet-300 mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiTitle}</h3>
              <p className="text-md text-violet-200/80 leading-relaxed bg-violet-950/50 p-5 rounded-xl border border-violet-500/30">
                 {copy.aiBody}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
