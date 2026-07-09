import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Brain,
  Eye,
  GraduationCap,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { useGazeNeutralityObserver } from '../hooks/useGazeNeutralityObserver';
import { detectGazeNeutralityCondition } from '../lib/sovereignProtocol';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../lib/auth';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapLearningRecord } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const GROWTH_PILLARS = {
  ar: [
    { id: 'literacy', label: 'القراءة والكتابة', icon: BookOpen, color: 'gold' },
    { id: 'cognitive', label: 'المهارات المعرفية', icon: Brain, color: 'emerald' },
    { id: 'focus', label: 'التركيز والانتباه', icon: Lightbulb, color: 'muted' },
    { id: 'progress', label: 'التقدم الأكاديمي', icon: TrendingUp, color: 'emerald' },
  ],
  en: [
    { id: 'literacy', label: 'Literacy Skills', icon: BookOpen, color: 'gold' },
    { id: 'cognitive', label: 'Cognitive Skills', icon: Brain, color: 'emerald' },
    { id: 'focus', label: 'Focus & Attention', icon: Lightbulb, color: 'muted' },
    { id: 'progress', label: 'Academic Progress', icon: TrendingUp, color: 'emerald' },
  ],
};

const PILLAR_STYLES = {
  gold: {
    card: LUX.pillarGold,
    icon: 'text-[#e8c872] bg-[#c9a962]/12 border border-[#c9a962]/25',
    bar: 'bg-gradient-to-r from-[#c9a962] to-[#d4af37]',
  },
  emerald: {
    card: LUX.pillarEmerald,
    icon: 'text-emerald-400 bg-emerald-500/12 border border-emerald-400/25',
    bar: 'bg-emerald-400',
  },
  muted: {
    card: LUX.pillarMuted,
    icon: 'text-[#e8c872] bg-[#c9a962]/8 border border-[#c9a962]/20',
    bar: 'bg-[#c9a962]/60',
  },
};

const PENDING = '—';

export default function AunakLearningCenter({ lang = 'ar' }) {
  const { records, error, isEmpty, loading } = useAirtableData(AIRTABLE_TABLES.learningDifficulties, {
    mapRecord: mapLearningRecord,
    lang,
  });
  const { students } = useStudents(lang);
  const { user } = useAuth();

  const latest = records[0] ?? null;
  const pillars = GROWTH_PILLARS[lang] ?? GROWTH_PILLARS.ar;

  const [activePillar, setActivePillar] = useState(pillars[0]?.id ?? 'literacy');

  const t = {
    ar: {
      title: 'مركز النمو الأكاديمي والمعرفي',
      subtitle: 'المتابعة التربوية والتأهيلية — مسارات تعليمية مخصصة من Airtable',
      subtitleStudent: (name) => `الطالب: ${name}`,
      subtitleGoal: (goal) => `الهدف التعليمي: ${goal}`,
      subtitleEmpty: 'لا توجد بيانات تعليمية حالياً — أضف سجلات في Airtable',
      noAssessment: 'لم يُجرَ اختبار بعد',
      badge: 'مركز تعليمي',
      growthHub: 'محاور النمو',
      engagement: 'مؤشر المشاركة التعليمية',
      engagementHint: 'يعكس مدى تفاعل المتعلم مع الأنشطة الأكاديمية',
      focus: 'مستوى التركيز الأكاديمي',
      milestone: 'إنجاز الأسبوع',
      coachTip: 'توصية المعلّم الذكي',
      applyTip: 'تطبيق التوصية',
      sessionNotes: 'ملاحظات التقدم التربوي',
      recordsCount: (n) => `${n} سجلات تعليمية`,
    },
    en: {
      title: 'Academic & Cognitive Growth Hub',
      subtitle: 'Educational & rehabilitative follow-up — personalized learning paths from Airtable',
      subtitleStudent: (name) => `Student: ${name}`,
      subtitleGoal: (goal) => `Learning goal: ${goal}`,
      subtitleEmpty: 'No educational records yet — add entries in Airtable',
      noAssessment: 'No assessment yet',
      badge: 'Learning Hub',
      growthHub: 'Growth Pillars',
      engagement: 'Educational Engagement Index',
      engagementHint: 'Reflects learner participation in academic activities',
      focus: 'Academic Focus Level',
      milestone: 'Weekly Milestone',
      coachTip: 'Smart Educator Tip',
      applyTip: 'Apply Recommendation',
      sessionNotes: 'Educational Progress Notes',
      recordsCount: (n) => `${n} learning records`,
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    setActivePillar((GROWTH_PILLARS[lang] ?? GROWTH_PILLARS.ar)[0]?.id ?? 'literacy');
  }, [lang]);

  const studentList = Array.isArray(students) ? students : [];
  const activeStudentId = user?.activeStudentId ?? user?.childId ?? null;
  const linkedStudent = useMemo(() => {
    if (latest?.studentLinkedId) {
      const byLink = studentList.find((s) => s.id === latest.studentLinkedId);
      if (byLink) return byLink;
    }
    if (activeStudentId) {
      return studentList.find((s) => s.id === activeStudentId) ?? null;
    }
    return null;
  }, [studentList, latest?.studentLinkedId, activeStudentId]);

  const subtitleText = useMemo(() => {
    if (!latest && isEmpty) return copy.subtitleEmpty;
    if (linkedStudent?.name) return copy.subtitleStudent(linkedStudent.name);
    if (latest?.goalLabel) return copy.subtitleGoal(latest.goalLabel);
    return copy.subtitle;
  }, [latest, isEmpty, linkedStudent, copy]);

  const hasAssessment = latest?.tStatic != null || latest?.focusLevel != null;

  const focusLevel = hasAssessment && latest?.focusLevel != null
    ? Math.min(100, Math.max(0, latest.focusLevel))
    : null;

  const gazeTrigger = hasAssessment && detectGazeNeutralityCondition({
    focusLevel,
    tStatic: latest?.tStatic ?? null,
  });

  const gaze = useGazeNeutralityObserver({
    active: hasAssessment,
    triggerCondition: gazeTrigger,
    lang,
    disableDim: true,
  });

  const engagementScore = useMemo(() => {
    if (!hasAssessment) return null;
    if (latest?.tStatic != null) {
      return Math.min(100, Math.max(0, 100 - latest.tStatic * 4));
    }
    if (focusLevel != null) return focusLevel;
    return null;
  }, [hasAssessment, latest?.tStatic, focusLevel]);

  const pillarScores = useMemo(() => {
    if (!hasAssessment) {
      return pillars.reduce((acc, pillar) => {
        acc[pillar.id] = null;
        return acc;
      }, {});
    }
    const academic = latest?.academicProgress;
    const focus = focusLevel ?? academic;
    return {
      literacy: academic != null ? Math.min(100, academic) : focus,
      cognitive: focus != null ? Math.min(100, Math.max(0, focus - 4)) : null,
      focus: focusLevel,
      progress: academic,
    };
  }, [hasAssessment, latest?.academicProgress, focusLevel, pillars]);

  const formatScore = (score) => (score == null ? PENDING : `${score}%`);

  const activePillarMeta = pillars.find((p) => p.id === activePillar) ?? pillars[0];
  const activeStyles = PILLAR_STYLES[activePillarMeta?.color] ?? PILLAR_STYLES.gold;
  const ActivePillarIcon = activePillarMeta?.icon;
  const activePillarScore = pillarScores[activePillar];

  return (
    <div
      className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <AirtableErrorBanner error={error} />

      <header className={`mb-10 relative overflow-hidden rounded-3xl ${LUX.glassCard} p-8`}>
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#c9a962]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${LUX.emeraldBadge}`}>
              <Sparkles className="w-3.5 h-3.5" /> {copy.badge}
            </span>
            <h2 className={`${LUX.titleGradient} flex items-center gap-3 text-3xl md:text-4xl`}>
              <GraduationCap className="w-9 h-9 text-[#d4af37] shrink-0" /> {copy.title}
            </h2>
            <p className="text-slate-400 mt-3 text-base max-w-2xl leading-relaxed">{subtitleText}</p>
            {!loading && records.length > 0 && (
              <p className="text-xs text-[#c9a962]/80 font-mono mt-2">{copy.recordsCount(records.length)}</p>
            )}
          </div>
          <div className="shrink-0 p-5 rounded-2xl border border-[#c9a962]/25 bg-[#12121a]/70 backdrop-blur-xl text-center min-w-[140px]">
            <p className="text-xs text-slate-500 mb-1">{copy.engagement}</p>
            <p className={`text-4xl font-black ${hasAssessment ? 'text-[#e8c872]' : 'text-slate-500'}`}>
              {engagementScore != null ? `${engagementScore}%` : copy.noAssessment}
            </p>
            <p className="text-[10px] text-slate-500 mt-2 leading-snug">{copy.engagementHint}</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mb-6">
          <AirtableLoading lang={lang} />
        </div>
      ) : isEmpty ? (
        <div className="mb-6">
          <AirtableEmpty lang={lang} />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#d4af37]" /> {copy.growthHub}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {pillars.map((pillar) => {
                const styles = PILLAR_STYLES[pillar.color] ?? PILLAR_STYLES.gold;
                const Icon = pillar.icon;
                const score = pillarScores[pillar.id];
                const isActive = activePillar === pillar.id;

                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillar(pillar.id)}
                    className={`p-5 rounded-2xl border text-left transition-all ${styles.card} ${
                      isActive ? 'ring-2 ring-offset-2 ring-offset-[#050508] ring-[#c9a962]/45 shadow-lg' : ''
                    } ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${styles.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-300 text-sm mb-2">{pillar.label}</h4>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-1">
                      {score != null && (
                        <div
                          className={`h-1.5 rounded-full transition-all duration-700 ${styles.bar}`}
                          style={{ width: `${score}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500">{formatScore(score)}</span>
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
                <h4 className="text-xl font-bold text-slate-300">{activePillarMeta?.label}</h4>
              </div>
            </div>
            <p className={`text-5xl md:text-6xl font-black tracking-tight ${hasAssessment ? 'text-[#e8c872]' : 'text-slate-500'}`}>
              {formatScore(activePillarScore)}
            </p>
            <p className="text-sm text-slate-400 mt-3">
              {hasAssessment ? copy.engagementHint : copy.noAssessment}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {gaze.visible && (
            <div className="p-5 rounded-2xl border border-rose-500/40 bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.12)]">
              <h4 className="font-bold text-rose-300 mb-2 flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 animate-pulse" /> {gaze.alertTitle}
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              </h4>
              <p className="text-xs text-rose-200/90 font-mono leading-relaxed min-h-[2.5rem]" dir="auto">
                {gaze.typedAlert}
                <span className="inline-block w-1.5 h-3.5 bg-rose-300 animate-pulse align-middle ms-0.5" />
              </p>
            </div>
          )}

          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-2xl">
            <h3 className="text-slate-400 mb-2 font-mono text-sm">{copy.focus}</h3>
            <div className={`text-5xl font-black mb-4 ${hasAssessment && focusLevel != null ? 'text-emerald-400' : 'text-slate-500'}`}>
              {focusLevel != null ? `${focusLevel}%` : copy.noAssessment}
            </div>
            {focusLevel != null && (
              <div className="w-full bg-[#12121a]/70 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${focusLevel}%` }}
                />
              </div>
            )}
          </div>

          {latest?.milestone && (
            <div className="p-5 rounded-2xl border border-[#c9a962]/30 bg-[#c9a962]/10">
              <h4 className="font-bold text-[#e8c872] mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> {copy.milestone}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">{latest.milestone}</p>
            </div>
          )}

          {latest?.notes && (
            <div className="p-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-sm text-emerald-200">
              <p className="text-xs font-bold text-emerald-400 mb-2">{copy.sessionNotes}</p>
              {latest.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
