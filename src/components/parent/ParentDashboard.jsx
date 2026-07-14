import { useEffect, useState } from 'react';
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
import { monthAttendanceSummary, hydrateAttendanceFromCloud } from '../../lib/attendanceLedger';
import { getStudentGoalPlan, listGoalEvidence, hydrateGoalsFromCloud } from '../../lib/iepGoalAssignment';

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
          {session.specialistName || (lang === 'en' ? 'Behavior Therapist' : 'المعالج السلوكي')}
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

  const sealedMonth = student?.id
    ? monthAttendanceSummary(student.id, new Date().toISOString().slice(0, 7))
    : null;
  const goalPlan = student?.id ? getStudentGoalPlan(student.id) : null;
  const evidenceRows = student?.id ? listGoalEvidence(student.id) : [];
  const [govTick, setGovTick] = useState(0);

  useEffect(() => {
    if (!student?.id) return;
    let cancelled = false;
    (async () => {
      await hydrateAttendanceFromCloud();
      await hydrateGoalsFromCloud(student);
      if (!cancelled) setGovTick((n) => n + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [student?.id]);

  const copy =
    lang === 'en'
      ? {
          title: 'Parent / Guardian Dashboard',
          subtitle: 'Your beneficiary only — secure parent access token',
          child: 'Beneficiary',
          plan: 'Consultative License',
          subscription: 'Subscription',
          diagnosis: 'Diagnosis / status',
          parentContact: 'Parent contact',
          refresh: 'Refresh',
          logout: 'Lock dashboard',
          sectionAssessment: 'Summary & initial developmental screening',
          sectionSessions: 'Certified session register',
          sectionTreatment: 'Individualized Education Plan (IEP) & progress',
          noAssessment: 'No developmental screening yet — complete the free matrix during enrollment.',
          noSessions: 'No certified sessions in the last 90 days.',
          goal: 'Active IEP goal',
          overall: 'Follow-up index & baseline',
          comprehensive: 'Comprehensive assessment',
          attendance: 'Attendance register',
          sealedAttendance: 'Certified center attendance (this month)',
          present: 'Present',
          absent: 'Absent',
          excused: 'Excused absence',
          activeGoals: 'Active IEP goals',
          evidenceCount: 'Certified verification records',
        }
      : {
          title: 'لوحة ولي الأمر',
          subtitle: 'بيانات المستفيد فقط — دخول برمز ولي الأمر',
          child: 'المستفيد',
          plan: 'الرخصة الاستشارية',
          subscription: 'الاشتراك',
          diagnosis: 'التشخيص / الحالة',
          parentContact: 'تواصل ولي الأمر',
          refresh: 'تحديث',
          logout: 'قفل اللوحة',
          sectionAssessment: 'الملخص والمسح النمائي الأولي',
          sectionSessions: 'سجل الجلسات الموثّقة',
          sectionTreatment: 'الخطة التربوية الفردية والتقدم',
          noAssessment: 'لا يوجد مسح نمائي أولي بعد — أكمل المقياس أثناء التسجيل.',
          noSessions: 'لا توجد جلسات موثّقة خلال آخر 90 يوماً.',
          goal: 'الهدف الفردي النشط',
          overall: 'مؤشر المتابعة وخط الأساس',
          comprehensive: 'التقييم الشامل',
          attendance: 'سجل الحضور',
          sealedAttendance: 'حضور المركز الموثّق (هذا الشهر)',
          present: 'حضور',
          absent: 'غياب',
          excused: 'غياب بعذر',
          activeGoals: 'أهداف الخطة الفردية',
          evidenceCount: 'أدلة تحقق موثّقة',
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

          {sealedMonth && (
            <section className={`${LUX.glassCard} space-y-3`} key={govTick}>
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" />
                <h2 className={LUX.headingGold}>{copy.sealedAttendance}</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-mono text-emerald-300">{sealedMonth.present}</p>
                  <p className="text-[10px] text-slate-500">{copy.present}</p>
                </div>
                <div>
                  <p className="text-2xl font-mono text-rose-300">{sealedMonth.absent}</p>
                  <p className="text-[10px] text-slate-500">{copy.absent}</p>
                </div>
                <div>
                  <p className="text-2xl font-mono text-amber-300">{sealedMonth.excused}</p>
                  <p className="text-[10px] text-slate-500">{copy.excused}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {copy.activeGoals}: {goalPlan?.goals?.length ?? 0} · {copy.evidenceCount}:{' '}
                {evidenceRows.length}
              </p>
            </section>
          )}

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
                {lang === 'en' ? 'Last ABC session' : 'آخر جلسة ABC'}: {attendance.lastSessionDate}
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
                      ? 'Metrics will appear after behavior therapist sessions update the beneficiary record.'
                      : 'ستظهر المقاييس بعد تحديث سجل المستفيد من جلسات المعالج السلوكي.'}
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
