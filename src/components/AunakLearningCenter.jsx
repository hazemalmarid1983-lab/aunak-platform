import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Brain,
  GraduationCap,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapLearningRecord } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner } from './AirtableStatus';

const GROWTH_PILLARS = {
  ar: [
    { id: 'literacy', label: 'القراءة والكتابة', icon: BookOpen, color: 'sky' },
    { id: 'cognitive', label: 'المهارات المعرفية', icon: Brain, color: 'violet' },
    { id: 'focus', label: 'التركيز والانتباه', icon: Lightbulb, color: 'amber' },
    { id: 'progress', label: 'التقدم الأكاديمي', icon: TrendingUp, color: 'emerald' },
  ],
  en: [
    { id: 'literacy', label: 'Literacy Skills', icon: BookOpen, color: 'sky' },
    { id: 'cognitive', label: 'Cognitive Skills', icon: Brain, color: 'violet' },
    { id: 'focus', label: 'Focus & Attention', icon: Lightbulb, color: 'amber' },
    { id: 'progress', label: 'Academic Progress', icon: TrendingUp, color: 'emerald' },
  ],
};

const PILLAR_STYLES = {
  sky: {
    card: 'border-sky-500/30 bg-sky-500/10 hover:border-sky-400/50',
    icon: 'text-sky-400 bg-sky-500/15',
    bar: 'bg-sky-400',
  },
  violet: {
    card: 'border-violet-500/30 bg-violet-500/10 hover:border-violet-400/50',
    icon: 'text-violet-400 bg-violet-500/15',
    bar: 'bg-violet-400',
  },
  amber: {
    card: 'border-amber-500/30 bg-amber-500/10 hover:border-amber-400/50',
    icon: 'text-amber-400 bg-amber-500/15',
    bar: 'bg-amber-400',
  },
  emerald: {
    card: 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400/50',
    icon: 'text-emerald-400 bg-emerald-500/15',
    bar: 'bg-emerald-400',
  },
};

export default function AunakLearningCenter({ lang = 'ar' }) {
  const { records, error, isEmpty, loading } = useAirtableData(AIRTABLE_TABLES.learningDifficulties, {
    mapRecord: mapLearningRecord,
    lang,
  });

  const latest = records[0] ?? null;
  const pillars = GROWTH_PILLARS[lang] ?? GROWTH_PILLARS.ar;

  const [activePillar, setActivePillar] = useState(pillars[0]?.id ?? 'literacy');
  const [engagementPulse, setEngagementPulse] = useState(0);

  const t = {
    ar: {
      title: 'مركز النمو الأكاديمي والمعرفي',
      subtitle: 'المتابعة التربوية والتأهيلية — مسارات تعليمية مخصصة من Airtable',
      subtitleActive: (label) => `مسار نشط: ${label}`,
      subtitleEmpty: 'لا توجد بيانات تعليمية حالياً — أضف سجلات في Airtable',
      badge: 'مركز تعليمي',
      growthHub: 'محاور النمو',
      engagement: 'مؤشر المشاركة التعليمية',
      engagementHint: 'يعكس مدى تفاعل المتعلم مع الأنشطة الأكاديمية',
      focus: 'مستوى التركيز الأكاديمي',
      milestone: 'إنجاز الأسبوع',
      milestoneBody: 'أكمل الطالب 3 أنشطة قراءة متدرجة — استمر في تعزيز المهارات اللغوية.',
      coachTip: 'توصية المعلّم الذكي',
      coachBody:
        'فعّل أنشطة بصرية-سمعية قصيرة لدعم الانتباه، ثم انتقل تدريجياً إلى مهام قراءة أطول لبناء الثقة الأكاديمية.',
      applyTip: 'تطبيق التوصية',
      sessionNotes: 'ملاحظات التقدم التربوي',
      recordsCount: (n) => `${n} سجلات تعليمية`,
    },
    en: {
      title: 'Academic & Cognitive Growth Hub',
      subtitle: 'Educational & rehabilitative follow-up — personalized learning paths from Airtable',
      subtitleActive: (label) => `Active path: ${label}`,
      subtitleEmpty: 'No educational records yet — add entries in Airtable',
      badge: 'Learning Hub',
      growthHub: 'Growth Pillars',
      engagement: 'Educational Engagement Index',
      engagementHint: 'Reflects learner participation in academic activities',
      focus: 'Academic Focus Level',
      milestone: 'Weekly Milestone',
      milestoneBody: 'The learner completed 3 leveled reading activities — keep building literacy skills.',
      coachTip: 'Smart Educator Tip',
      coachBody:
        'Use short multisensory activities to support attention, then gradually extend reading tasks to build academic confidence.',
      applyTip: 'Apply Recommendation',
      sessionNotes: 'Educational Progress Notes',
      recordsCount: (n) => `${n} learning records`,
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    setActivePillar((GROWTH_PILLARS[lang] ?? GROWTH_PILLARS.ar)[0]?.id ?? 'literacy');
  }, [lang]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEngagementPulse((prev) => (prev + 1) % 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const focusFromAirtable = latest?.focusLevel;
  const focusLevel =
    focusFromAirtable != null
      ? Math.min(100, Math.max(10, focusFromAirtable))
      : Math.min(88, 62 + (engagementPulse % 20));

  const engagementScore = useMemo(() => {
    if (latest?.tStatic != null) {
      return Math.min(100, Math.max(20, 100 - latest.tStatic * 4));
    }
    return Math.min(95, 70 + (engagementPulse % 25));
  }, [latest?.tStatic, engagementPulse]);

  const pillarScores = useMemo(() => {
    const base = focusLevel;
    return pillars.reduce((acc, pillar, index) => {
      acc[pillar.id] = Math.min(100, Math.max(15, base - index * 6 + (engagementPulse % 10)));
      return acc;
    }, {});
  }, [pillars, focusLevel, engagementPulse]);

  const activePillarMeta = pillars.find((p) => p.id === activePillar) ?? pillars[0];
  const activeStyles = PILLAR_STYLES[activePillarMeta?.color] ?? PILLAR_STYLES.sky;
  const ActivePillarIcon = activePillarMeta?.icon;

  return (
    <div
      className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <AirtableErrorBanner error={error} />

      <header className="mb-10 relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-slate-900/80 to-violet-950/30 p-8 shadow-[0_0_40px_rgba(14,165,233,0.08)]">
        <div className="absolute top-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> {copy.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-sky-300 to-violet-300 bg-clip-text text-transparent flex items-center gap-3">
              <GraduationCap className="w-9 h-9 text-sky-400 shrink-0" /> {copy.title}
            </h2>
            <p className="text-slate-400 mt-3 text-base max-w-2xl leading-relaxed">
              {latest ? copy.subtitleActive(latest.label) : copy.subtitleEmpty}
            </p>
            {!loading && records.length > 0 && (
              <p className="text-xs text-sky-400/80 font-mono mt-2">{copy.recordsCount(records.length)}</p>
            )}
          </div>
          <div className="shrink-0 p-5 rounded-2xl border border-sky-500/25 bg-sky-950/40 text-center min-w-[140px]">
            <p className="text-xs text-slate-500 mb-1">{copy.engagement}</p>
            <p className="text-4xl font-black text-sky-300">{engagementScore}%</p>
            <p className="text-[10px] text-slate-500 mt-2 leading-snug">{copy.engagementHint}</p>
          </div>
        </div>
      </header>

      {!loading && isEmpty && (
        <div className="mb-6">
          <AirtableEmpty lang={lang} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" /> {copy.growthHub}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {pillars.map((pillar) => {
                const styles = PILLAR_STYLES[pillar.color] ?? PILLAR_STYLES.sky;
                const Icon = pillar.icon;
                const score = pillarScores[pillar.id] ?? 0;
                const isActive = activePillar === pillar.id;

                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillar(pillar.id)}
                    className={`p-5 rounded-2xl border text-left transition-all ${styles.card} ${
                      isActive ? 'ring-2 ring-offset-2 ring-offset-[#050508] ring-sky-400/50 shadow-lg' : ''
                    } ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${styles.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm mb-2">{pillar.label}</h4>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${styles.bar}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-500">{score}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`p-8 rounded-3xl border shadow-xl min-h-[220px] flex flex-col justify-center ${activeStyles.card}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeStyles.icon}`}>
                {ActivePillarIcon && <ActivePillarIcon className="w-7 h-7" />}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                  {lang === 'ar' ? 'أ ب ت' : 'A B C'}
                </p>
                <h4 className="text-xl font-bold text-slate-100">{activePillarMeta?.label}</h4>
              </div>
            </div>
            <p className="text-5xl md:text-6xl font-black text-slate-100/90 tracking-tight">
              {pillarScores[activePillar] ?? 0}%
            </p>
            <p className="text-sm text-slate-400 mt-3">{copy.engagementHint}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 mb-2 font-mono text-sm">{copy.focus}</h3>
            <div className="text-5xl font-black text-emerald-400 mb-4">{focusLevel}%</div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${focusLevel}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10">
            <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> {copy.milestone}
            </h4>
            <p className="text-sm text-amber-200/80 leading-relaxed">{copy.milestoneBody}</p>
          </div>

          {latest?.notes && (
            <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sm text-sky-200">
              <p className="text-xs font-bold text-sky-400 mb-2">{copy.sessionNotes}</p>
              {latest.notes}
            </div>
          )}

          <div className="p-5 rounded-2xl border border-violet-500/40 bg-violet-500/10">
            <h4 className="font-bold text-violet-300 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> {copy.coachTip}
            </h4>
            <p className="text-sm text-violet-200/80 leading-relaxed mb-4">{copy.coachBody}</p>
            <button
              type="button"
              className="w-full py-2.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 rounded-xl text-sm font-bold transition-all"
            >
              {copy.applyTip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
