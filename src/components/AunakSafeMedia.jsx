import { useState, useEffect, useMemo } from 'react';
import { Video, ShieldCheck, PlayCircle, BrainCircuit, Lock, Clock, Image, Headphones } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapMedia } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';

const MEDIA_CATEGORIES = {
  en: ['Video Tutorials', 'Visual Aids', 'Audio Exercises'],
  ar: ['دروس فيديو', 'وسائل بصرية', 'تمارين صوتية'],
};

const CATEGORY_ALIASES = {
  'Video Tutorials': ['video tutorials', 'video', 'tutorial', 'فيديو', 'دروس فيديو', 'دروس'],
  'Visual Aids': ['visual aids', 'visual', 'aids', 'image', 'بصر', 'وسائل بصرية', 'مرئ'],
  'Audio Exercises': ['audio exercises', 'audio', 'exercise', 'sound', 'صوت', 'تمارين صوتية', 'سمع'],
};

function normalizeMediaCategory(rawCategory, lang = 'ar') {
  const canonical = MEDIA_CATEGORIES.en;
  const localized = MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar;
  if (!rawCategory) return localized[0];

  const lower = String(rawCategory).toLowerCase().trim();
  const idx = canonical.findIndex((cat) => {
    if (cat.toLowerCase() === lower) return true;
    return (CATEGORY_ALIASES[cat] ?? []).some((alias) => lower.includes(alias.toLowerCase()));
  });

  return idx >= 0 ? localized[idx] : rawCategory;
}

function categoryIcon(category, lang = 'ar') {
  const labels = MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar;
  if (category === labels[0]) return Video;
  if (category === labels[1]) return Image;
  if (category === labels[2]) return Headphones;
  return Video;
}

export default function AunakSafeMedia({ lang = 'ar' }) {
  const { records: mediaLibrary, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.safeMedia, {
    mapRecord: mapMedia,
    lang,
  });

  const categoryOptions = MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar;
  const [activeCategory, setActiveCategory] = useState(categoryOptions[0]);
  const [activeVideo, setActiveVideo] = useState(null);

  const t = {
    ar: {
      title: 'مكتبة الوسائط الآمنة (Safe Media)',
      subtitle: 'محتوى مشفر (AES-256) — بيانات حية من Airtable',
      categories: 'تصنيفات المكتبة',
      selectClip: 'اختر مقطعاً للبدء',
      aiSummary: 'ملخص الوسائط وتوصيات التعلم (AI)',
      activeClip: (title, category) => `المقطع النشط: ${title} (${category}).`,
      noData: 'لا توجد بيانات حالياً — أضف مقاطع في Airtable لعرض التوصيات الذكية.',
      emptyCategory: 'لا توجد مقاطع في هذا التصنيف.',
      archive: 'الأرشيف المشفر',
    },
    en: {
      title: 'Safe Media Library',
      subtitle: 'AES-256 encrypted content — live data from Airtable',
      categories: 'Library Categories',
      selectClip: 'Select a clip to start',
      aiSummary: 'Media Summary & Learning Recommendations (AI)',
      activeClip: (title, category) => `Active clip: ${title} (${category}).`,
      noData: 'No data yet — add clips in Airtable to show AI recommendations.',
      emptyCategory: 'No clips in this category.',
      archive: 'Encrypted Archive',
    },
  };

  const copy = t[lang] ?? t.ar;

  const normalizedLibrary = useMemo(
    () =>
      mediaLibrary.map((item) => ({
        ...item,
        displayCategory: normalizeMediaCategory(item.category, lang),
      })),
    [mediaLibrary, lang]
  );

  const filteredLibrary = useMemo(
    () => normalizedLibrary.filter((item) => item.displayCategory === activeCategory),
    [normalizedLibrary, activeCategory]
  );

  useEffect(() => {
    setActiveCategory((MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar)[0]);
  }, [lang]);

  useEffect(() => {
    if (filteredLibrary.length > 0) {
      setActiveVideo((prev) =>
        prev && filteredLibrary.some((m) => m.id === prev) ? prev : filteredLibrary[0].id
      );
    } else {
      setActiveVideo(null);
    }
  }, [filteredLibrary]);

  const selected = filteredLibrary.find((m) => m.id === activeVideo) ?? normalizedLibrary.find((m) => m.id === activeVideo);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-3">
          <Video className="w-10 h-10" /> {copy.title}
        </h2>
        <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-slate-800 pb-2">{copy.categories}</h3>
          <nav className="space-y-2">
            {categoryOptions.map((cat) => {
              const Icon = categoryIcon(cat, lang);
              const count = normalizedLibrary.filter((m) => m.displayCategory === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold transition-all text-sm ${
                    activeCategory === cat
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-lg'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className={`flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {cat}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{count}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-6 right-6 z-10 flex gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-lg text-xs font-mono font-bold flex items-center gap-1 backdrop-blur-md">
                <ShieldCheck className="w-3 h-3" /> AES-256 SECURED
              </span>
            </div>
            <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <PlayCircle className="w-20 h-20 text-emerald-500/50 group-hover:text-emerald-400 transition-colors cursor-pointer z-10" />
              <p className="mt-4 text-slate-500 font-mono z-10">{selected?.title || copy.selectClip}</p>
            </div>
          </div>

          <div className="bg-emerald-900/10 p-8 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6" /> {copy.aiSummary}
            </h3>
            <p className="text-md text-emerald-200/80 leading-relaxed bg-emerald-950/50 p-5 rounded-xl border border-emerald-500/30">
              {selected ? copy.activeClip(selected.title, selected.displayCategory) : copy.noData}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Lock className="w-5 h-5 text-slate-500" /> {copy.archive}
              <span className="text-xs font-normal text-emerald-400/80 ml-auto">{activeCategory}</span>
            </h3>
            {loading ? (
              <AirtableLoading lang={lang} />
            ) : isEmpty ? (
              <AirtableEmpty lang={lang} />
            ) : filteredLibrary.length === 0 ? (
              <AirtableEmpty lang={lang} message={copy.emptyCategory} />
            ) : (
              <div className="space-y-3">
                {filteredLibrary.map((media) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => setActiveVideo(media.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      activeVideo === media.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <h4
                        className={`font-bold text-sm ${activeVideo === media.id ? 'text-emerald-300' : 'text-slate-200'}`}
                      >
                        {media.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{media.displayCategory}</p>
                    </div>
                    <div className={`flex flex-col ${lang === 'ar' ? 'items-end text-left' : 'items-end text-right'}`}>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {media.duration}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
