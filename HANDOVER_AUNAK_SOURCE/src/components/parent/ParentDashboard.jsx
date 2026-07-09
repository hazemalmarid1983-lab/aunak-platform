import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import AssessmentResultScreen from '../assessment/AssessmentResultScreen';
import { useParentDashboard } from '../../hooks/useParentDashboard';
import { diagnosisLabel } from '../../lib/diagnosisOptions';
import { COUNTRY_DIAL_CODES } from '../../lib/countryDialCodes';
import { getField } from '../../lib/airtable';
import { STUDENT as SF } from '../../lib/airtableFields';
import PlatformLogo from '../PlatformLogo';
import { LUX } from '../../lib/luxTheme';

const METRIC_COLORS = {
  emerald: 'from-emerald-500 to-emerald-400',
  cyan: 'from-cyan-500 to-cyan-400',
  amber: 'from-amber-500 to-amber-400',
  violet: 'from-violet-500 to-violet-400',
  rose: 'from-rose-500 to-rose-400',
};

function MetricBar({ label, value, color = 'emerald' }) {
  const grad = METRIC_COLORS[color] ?? METRIC_COLORS.emerald;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-[#e8c872]">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-l ${grad}`}
        />
      </div>
    </div>
  );
}

function SessionRow({ session, lang }) {
  const copy =
    lang === 'en'
      ? { sealed: 'Sealed', seq: 'Seq.', verified: 'PIN verified' }
      : { sealed: 'موثّقة', seq: 'تسلسل', verified: 'PIN مُحقَّق' };

  const sealedLabel = session.sealedAt
    ? String(session.sealedAt).slice(0, 16).replace('T', ' ')
    : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#0d0d10]/50 hover:border-[#c9a962]/25 transition-colors">
      <div className="flex items-center gap-3 min-w-[7rem]">
        <CalendarCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-mono text-sm text-slate-300">{session.sessionDate || '—'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {session.specialistName || (lang === 'en' ? 'Specialist' : 'الإخصائي')}
        </p>
        {session.notes ? (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{session.notes}</p>
        ) : null}
        {sealedLabel && (
          <p className="text-[10px] font-mono text-slate-600 mt-1">
            {lang === 'en' ? 'Sealed at' : 'توقيت الختم'}: {sealedLabel}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        {session.sessionSequence != null && (
          <span className="text-[10px] font-mono text-slate-600">
            {copy.seq} {session.sessionSequence}
          </span>
        )}
        {session.pinVerified && (
          <span className="text-[10px] font-mono text-cyan-500/80">{copy.verified}</span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
          <ShieldCheck className="w-3 h-3" /> {copy.sealed}
        </span>
      </div>
    </div>
  );
}

export default function ParentDashboard({ lang = 'ar', student, parentToken, onLogout }) {
  const {
    assessment,
    treatment,
    sessions,
    attendance,
    sessionsLoading,
    sessionsError,
    refreshing,
    refreshAll,
  } = useParentDashboard(student, lang);

  const planCode = getField(student?.fields, SF.plan_code) || '—';
  const subStatus = getField(student?.fields, SF.subscription_status) || '—';
  const diagnosis = diagnosisLabel(
    student?.diagnosis ?? getField(student?.fields, SF.diagnosis),
    lang
  );
  const parentPhoneRaw =
    student?.parentPhone ?? getField(student?.fields, SF.parent_phone) ?? '';
  const parentDial =
    student?.parentCountryCode ?? getField(student?.fields, SF.parent_country_code) ?? '';
  const countryMeta = COUNTRY_DIAL_CODES.find((c) => c.dial === String(parentDial).replace(/\D/g, ''));
  const parentPhoneDisplay = parentPhoneRaw
    ? countryMeta
      ? `${countryMeta.flag} +${countryMeta.dial} ${parentPhoneRaw}`
      : parentDial
        ? `+${String(parentDial).replace(/\D/g, '')} ${parentPhoneRaw}`
        : String(parentPhoneRaw)
    : '—';

  const copy =
    lang === 'en'
      ? {
          title: 'Parent Dashboard',
          subtitle: 'Your child only — sovereign parent token',
          child: 'Child',
          plan: 'Plan',
          subscription: 'Subscription',
          diagnosis: 'Diagnosis',
          parentContact: 'Parent contact',
          refresh: 'Refresh',
          logout: 'Lock dashboard',
          sectionAssessment: 'Summary & preliminary report',
          sectionSessions: 'Daily session registry',
          sectionTreatment: 'Treatment plan & metrics',
          noAssessment: 'No preliminary assessment yet — complete the free assessment during enrollment.',
          noSessions: 'No sealed sessions in the last 90 days.',
          goal: 'Programmed goal',
          overall: 'Overall progress index',
          comprehensive: 'Comprehensive assessment',
          attendance: 'Attendance ledger',
        }
      : {
          title: 'لوحة الأهل',
          subtitle: 'بيانات طفلك فقط — رمز الأهل السيادي',
          child: 'الطفل',
          plan: 'الباقة',
          subscription: 'الاشتراك',
          diagnosis: 'التشخيص',
          parentContact: 'تواصل ولي الأمر',
          refresh: 'تحديث',
          logout: 'قفل اللوحة',
          sectionAssessment: 'الملخص والتقرير المبدئي',
          sectionSessions: 'سجل الجلسات اليومية',
          sectionTreatment: 'الخطة العلاجية والمقاييس',
          noAssessment: 'لا يوجد تقييم مبدئي بعد — أكمل التقييم المجاني أثناء التسجيل.',
          noSessions: 'لا توجد جلسات موثّقة خلال آخر 90 يوماً.',
          goal: 'الهدف المبرمج',
          overall: 'مؤشر التقدم العام',
          comprehensive: 'التقييم الشامل',
          attendance: 'سجل الحضور',
        };

  const comprehensiveLabels = {
    not_started: lang === 'en' ? 'Not started' : 'لم يبدأ',
    in_progress: lang === 'en' ? 'In progress' : 'قيد التنفيذ',
    completed: lang === 'en' ? 'Completed' : 'مكتمل',
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={LUX.pageWrap}>
      <div className={LUX.pageWrapGradient} aria-hidden />
      <div className="relative z-10 min-h-screen">
        <header className={`${LUX.headerBar} sticky top-0 z-20`}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div className="flex items-center gap-4">
              <PlatformLogo lang={lang} className="w-12 h-12 hidden sm:block" iconClassName="w-10 h-10" />
              <div>
                <h1 className={LUX.titleGradient}>{copy.title}</h1>
                <p className={LUX.subtitle}>{copy.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={refreshAll}
                disabled={refreshing}
                className={LUX.btnGhost}
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  <RefreshCw className="w-4 h-4 inline" />
                )}{' '}
                {copy.refresh}
              </button>
              {onLogout && (
                <button type="button" onClick={onLogout} className={LUX.btnGhost}>
                  {copy.logout}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
          {/* Child identity card */}
          <section className={`${LUX.glassCard} grid sm:grid-cols-2 lg:grid-cols-5 gap-4`}>
            <div className="flex items-center gap-3">
              <UserRound className="w-8 h-8 text-[#c9a962]" />
              <div>
                <p className="text-xs text-slate-500">{copy.child}</p>
                <p className="font-bold text-lg text-[#e8c872]">{student?.name}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">{copy.diagnosis}</p>
              <p className="text-sm text-slate-300">{diagnosis}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{copy.parentContact}</p>
              <p className="text-sm font-mono text-slate-300" dir="ltr">{parentPhoneDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{copy.plan}</p>
              <p className="text-sm font-mono text-emerald-300">{planCode}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{copy.subscription}</p>
              <p className="text-sm font-mono text-emerald-300">{subStatus}</p>
            </div>
          </section>

          {/* Section 1 — Assessment */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <h2 className={LUX.headingGold}>{copy.sectionAssessment}</h2>
            </div>
            {assessment.hasAssessment && assessment.result ? (
              <div className="grid lg:grid-cols-2 gap-6 items-start">
                <AssessmentResultScreen
                  lang={lang}
                  result={assessment.result}
                  studentName={student?.name}
                />
                <div className={`${LUX.glassCard} space-y-4`}>
                  <p className={LUX.bodyText}>{assessment.result.summary}</p>
                  <div className={`p-4 rounded-xl border ${LUX.borderGold} bg-[#c9a962]/5`}>
                    <p className="text-xs text-[#c9a962] font-bold mb-1">
                      {lang === 'en' ? 'Platform recommendation' : 'توصية المنصة'}
                    </p>
                    <p className="text-sm text-slate-200">{assessment.result.recommendation}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {copy.comprehensive}:{' '}
                    <span className="text-slate-300">
                      {comprehensiveLabels[assessment.comprehensiveStatus] ??
                        assessment.comprehensiveStatus}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${LUX.glassCard} text-center py-12`}>
                <ClipboardList className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className={LUX.muted}>{copy.noAssessment}</p>
              </div>
            )}
          </section>

          {/* Section 2 — Sessions */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" />
                <h2 className={LUX.headingGold}>{copy.sectionSessions}</h2>
              </div>
              <span className={LUX.emeraldBadge}>
                {copy.attendance}: {attendance.label}
              </span>
            </div>
            {attendance.lastSessionDate && (
              <p className="text-xs text-slate-500 font-mono">
                {lang === 'en' ? 'Last session' : 'آخر جلسة'}: {attendance.lastSessionDate}
                {attendance.lastSpecialist ? ` · ${attendance.lastSpecialist}` : ''}
              </p>
            )}
            {sessionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : sessionsError ? (
              <p className={LUX.errorRose}>{sessionsError}</p>
            ) : sessions.length === 0 ? (
              <div className={`${LUX.glassCard} text-center py-10`}>
                <p className={LUX.muted}>{copy.noSessions}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                {sessions.map((s) => (
                  <SessionRow key={s.id ?? `${s.sessionDate}-${s.sessionSequence}`} session={s} lang={lang} />
                ))}
              </div>
            )}
          </section>

          {/* Section 3 — Treatment metrics */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h2 className={LUX.headingGold}>{copy.sectionTreatment}</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 ${LUX.glassCard} space-y-5`}>
                {treatment.programmedGoal && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                    <Target className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-cyan-400/80 font-bold mb-1">{copy.goal}</p>
                      <p className="text-sm text-slate-200">{treatment.programmedGoal}</p>
                    </div>
                  </div>
                )}
                {treatment.metrics.length > 0 ? (
                  <div className="space-y-4">
                    {treatment.metrics.map((m) => (
                      <MetricBar key={m.key} label={m.label} value={m.value} color={m.color} />
                    ))}
                  </div>
                ) : (
                  <p className={`${LUX.muted} text-sm text-center py-6`}>
                    {lang === 'en'
                      ? 'Metrics will appear after specialist sessions update the student record.'
                      : 'ستظهر المقاييس بعد تحديث سجل الطالب من جلسات الإخصائي.'}
                  </p>
                )}
              </div>

              <div className={`${LUX.glassCard} flex flex-col items-center justify-center text-center`}>
                <TrendingUp className="w-8 h-8 text-[#d4af37] mb-3" />
                <p className="text-xs text-slate-500 mb-2">{copy.overall}</p>
                {treatment.overallProgress != null ? (
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#d4af37"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(treatment.overallProgress / 100) * 264} 264`}
                        initial={{ strokeDasharray: '0 264' }}
                        animate={{ strokeDasharray: `${(treatment.overallProgress / 100) * 264} 264` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-[#e8c872]">{treatment.overallProgress}</span>
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl text-slate-600">—</span>
                )}
                {treatment.harmonyScore != null && (
                  <p className="text-xs font-mono text-slate-500 mt-4">
                    {lang === 'en' ? 'Harmony' : 'التناغم'}: {treatment.harmonyScore}%
                  </p>
                )}
              </div>
            </div>
          </section>

          {parentToken && (
            <footer className="text-center text-[10px] font-mono text-slate-600 pb-4">
              PRT · {String(parentToken).slice(0, 12)}…
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
