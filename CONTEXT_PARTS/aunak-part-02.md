<!-- AUNAK CONTEXT — Part 2 | lines 5001-10000 of 28509 | main + Tawasul (English Island excluded) -->

            </p>
          )}
          <PostActivationBiometric
            lang={lang}
            recordId={recordId}
            studentName={name.trim()}
            onComplete={(session) => onEnrolled?.(session)}
          />
        </>
      )}
    </div>
  );
}
````

## File: src/components/AunakPaywall.jsx
````javascript
import { useState } from 'react';
import { Lock, Sparkles, Check, Minus, Zap, PlayCircle, X, Film, KeyRound } from 'lucide-react';
import { PLAN_CODES, PLAN_LABELS, planAllows, planRank, normalizePlanCode } from '../lib/plans';
import { LUX } from '../lib/luxTheme.js';

const FEATURE_ROWS = [
  { id: 'community', ar: 'مجتمع عونك', en: 'Aunak Community', min: PLAN_CODES.FREE },
  { id: 'resources', ar: 'الموارد العامة', en: 'Public Resources', min: PLAN_CODES.FREE },
  { id: 'media', ar: 'الوسائط الآمنة', en: 'Safe Media', min: PLAN_CODES.TUTOR },
  { id: 'biometrics', ar: 'البصمة الحيوية', en: 'Biometrics', min: PLAN_CODES.TUTOR },
  { id: 'emotion', ar: 'مختبر الألحان', en: 'Melodies Lab', min: PLAN_CODES.TUTOR },
  { id: 'learning', ar: 'صعوبات التعلم', en: 'Learning Center', min: PLAN_CODES.TUTOR },
  { id: 'diagnostics', ar: 'التشخيص + تقرير نقطة الصفر', en: 'Diagnostics + Zero-Point', min: PLAN_CODES.MEDICAL },
  { id: 'crisis', ar: 'الدرع الذكي', en: 'Smart Shield', min: PLAN_CODES.MEDICAL },
  { id: 'live', ar: 'الرصد الحي', en: 'Live Monitoring', min: PLAN_CODES.MEDICAL },
  { id: 'registry', ar: 'سجل الجلسات', en: 'Session Registry', min: PLAN_CODES.INSTITUTION },
  { id: 'research', ar: 'مركز الأبحاث', en: 'Research Center', min: PLAN_CODES.INSTITUTION },
  { id: 'access', ar: 'التحكم السيادي', en: 'Sovereign Control', min: PLAN_CODES.INSTITUTION },
  { id: 'assessment', ar: 'التقييم الشامل (معزول)', en: 'Full Assessment (isolated)', min: PLAN_CODES.ASSESSMENT_ONLY, assessmentOnly: true },
].map((row) => ({ ...row, video: `/videos/promo-${row.id}.mp4` }));

const PLAN_COLUMNS = [
  { code: PLAN_CODES.FREE, accent: 'text-slate-300' },
  { code: PLAN_CODES.TUTOR, accent: 'text-[#e8c872]' },
  { code: PLAN_CODES.MEDICAL, accent: 'text-cyan-300' },
  { code: PLAN_CODES.INSTITUTION, accent: 'text-[#e8c872]', featured: true },
  { code: PLAN_CODES.ASSESSMENT_ONLY, accent: 'text-blue-300' },
];

function rowAllowedForPlan(row, planCode) {
  const p = normalizePlanCode(planCode);
  if (row.assessmentOnly) return p === PLAN_CODES.ASSESSMENT_ONLY;
  if (p === PLAN_CODES.ASSESSMENT_ONLY) return row.id === 'diagnostics' || row.id === 'assessment';
  return planAllows(p, row.id === 'assessment' ? 'diagnostics' : row.id);
}

export default function AunakPaywall({ lang = 'ar', featureName, currentPlan = PLAN_CODES.FREE, onActivate }) {
  const [promoRow, setPromoRow] = useState(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const t = {
    ar: {
      locked: (f) => `"${f}" خارج نطاق باقتك الحالية`,
      hint: 'المصفوفة الخماسية السيادية — انقر على ميزة مقفلة أو فعّل اشتراكك:',
      currentPlan: 'باقتك الحالية:',
      feature: 'الميزة',
      upgrade: 'إدخال كود التفعيل',
      featured: 'الأكثر قيمة',
      you: 'أنت هنا',
      promoTitle: 'عرض توضيحي قصير',
      promoFallback: 'العرض قيد الإنتاج — تفعّل فوراً بكود من الإدارة',
      close: 'إغلاق',
      watch: 'مشاهدة العرض',
    },
    en: {
      locked: (f) => `"${f}" is outside your current plan`,
      hint: 'Sovereign five-tier matrix — click a locked feature or activate:',
      currentPlan: 'Your current plan:',
      feature: 'Feature',
      upgrade: 'Enter Activation Code',
      featured: 'Best Value',
      you: 'You are here',
      promoTitle: 'Promotional Micro-Video',
      promoFallback: 'Video in production — activate with admin code',
      close: 'Close',
      watch: 'Watch promo',
    },
  };
  const copy = t[lang] ?? t.ar;
  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;
  const current = normalizePlanCode(currentPlan);

  const openPromo = (row) => {
    setVideoFailed(false);
    setPromoRow(row);
  };

  return (
    <div className={`relative min-h-full rounded-3xl overflow-hidden min-h-full bg-[#0a0a0c] text-slate-300`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[#0a0a0c]">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-full backdrop-blur-2xl bg-[#0d0d10]/90/55 border border-white/10 p-6 md:p-10 flex items-center justify-center">
        <div className="max-w-5xl w-full">
          <header className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-400" strokeWidth={1.4} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-300 mb-2">{copy.locked(featureName)}</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{copy.hint}</p>
            <p className="mt-3 text-xs font-mono text-[#e8c872]">
              {copy.currentPlan}{' '}
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-500/30">
                {labels[current] ?? current}
              </span>
            </p>
          </header>

          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-start p-3 text-slate-400 font-bold text-xs">{copy.feature}</th>
                    {PLAN_COLUMNS.map(({ code, accent, featured }) => (
                      <th key={code} className={`p-3 text-center font-bold whitespace-nowrap text-xs ${accent} ${featured ? 'bg-gradient-to-r from-[#c9a962] to-[#d4af37]/[0.06]' : ''}`}>
                        {labels[code]}
                        {code === current && <span className="block text-[9px] text-slate-500">({copy.you})</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row) => {
                    const rowLocked = !rowAllowedForPlan(row, current);
                    return (
                      <tr key={row.id} className="border-b border-white/5 last:border-0">
                        <td className="p-3 text-slate-300 font-medium text-xs">
                          {rowLocked ? (
                            <button type="button" onClick={() => openPromo(row)} className="inline-flex items-center gap-2 hover:text-[#e8c872]">
                              <PlayCircle className="w-4 h-4 shrink-0" />
                              {lang === 'ar' ? row.ar : row.en}
                            </button>
                          ) : (
                            lang === 'ar' ? row.ar : row.en
                          )}
                        </td>
                        {PLAN_COLUMNS.map(({ code, featured }) => (
                          <td key={code} className={`p-3 text-center ${featured ? 'bg-gradient-to-r from-[#c9a962] to-[#d4af37]/[0.06]' : ''}`}>
                            {rowAllowedForPlan(row, code) ? (
                              <Check className="w-4 h-4 text-emerald-400 inline" strokeWidth={2.5} />
                            ) : (
                              <Minus className="w-4 h-4 text-slate-700 inline" />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-5 bg-white/[0.03] border-t border-white/10 flex justify-center">
              <button
                type="button"
                onClick={onActivate}
                className="px-10 py-3.5 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-black text-base hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <KeyRound className="w-5 h-5" /> {copy.upgrade}
              </button>
            </div>
          </div>
        </div>
      </div>

      {promoRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-[#0d0d10]/90/70" onClick={() => setPromoRow(null)}>
          <div className="max-w-2xl w-full rounded-3xl bg-white/[0.06] border border-white/15 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-300 mb-4">{copy.promoTitle}</h3>
            <p className="text-sm text-slate-400">{copy.promoFallback}</p>
            <button type="button" onClick={() => setPromoRow(null)} className="mt-4 text-xs text-slate-500">{copy.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: src/components/AunakReportsDashboard.jsx
````javascript
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileBarChart,
  Loader2,
  Printer,
  Shield,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useAuth, ROLES } from '../lib/auth';
import { useStudents } from '../hooks/useStudents';
import {
  generateStudentPerformanceReport,
  formatReportAsText,
  REPORT_PERIODS,
} from '../lib/reportEngine';
import { LUX } from '../lib/luxTheme.js';

function ReportSection({ title, summary, children, accent = 'blue' }) {
  const border = accent === 'blue' ? 'border-blue-500/30' : 'border-blue-400/20';
  const bg = accent === 'blue' ? 'bg-blue-600/8' : 'bg-blue-500/5';
  return (
    <section className={`rounded-2xl border ${border} ${bg} p-5 md:p-6 aunak-report-section`}>
      <h3 className="text-base font-bold text-blue-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{summary}</p>
      {children}
    </section>
  );
}

function NoteList({ items, emptyLabel }) {
  if (!items?.length) {
    return <p className="text-xs text-slate-500 font-mono">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={`${item.date}-${i}`}
          className="text-sm text-slate-300 border-s border-blue-500/30 ps-3 leading-relaxed"
        >
          <span className="text-[10px] font-mono text-blue-400/80 block mb-0.5">
            {item.date} · {item.specialist}
          </span>
          {item.text}
        </li>
      ))}
    </ul>
  );
}

export default function AunakReportsDashboard({ lang = 'ar' }) {
  const { user } = useAuth();
  const role = user?.role ?? ROLES.PARENT;
  const isParent = role === ROLES.PARENT;
  const { students, loading: studentsLoading } = useStudents(lang);

  const [period, setPeriod] = useState(REPORT_PERIODS.WEEKLY);
  const [studentName, setStudentName] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef(null);

  const t = {
    ar: {
      title: 'لوحة تقارير الأداء',
      subtitle: 'محرك التقارير المؤتمت — بيانات الجلسات المختومة (Sealed Claims)',
      sealedBadge: 'Sealed Claims · tblDailySessions',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      student: 'اسم الطالب',
      selectStudent: 'اختر الطالب',
      generate: 'توليد التقرير',
      generating: 'جاري التجميع والصياغة...',
      print: 'طباعة / PDF',
      refresh: 'تحديث',
      noData: 'لا توجد جلسات مختومة في هذه الفترة',
      errorFetch: 'تعذّر سحب البيانات — تحقق من الاتصال بـ Airtable',
      academic: 'التقدم الأكاديمي والمهاري',
      behavioral: 'الاستقرار السلوكي والانفعالي',
      recommendations: 'التوصيات المستقبلية',
      parentLocked: 'تقرير الطفل المرتبط بحسابكم',
      sessions: 'جلسة مختومة',
      specialists: 'الأخصائيون',
      periodRange: 'نطاق الفترة',
      recItem: 'إرشاد',
      noNotes: 'لا ملاحظات في هذه الفئة',
    },
    en: {
      title: 'Performance Reports Dashboard',
      subtitle: 'Automated report engine — sealed session claims data',
      sealedBadge: 'Sealed Claims · tblDailySessions',
      weekly: 'Weekly',
      monthly: 'Monthly',
      student: 'Student name',
      selectStudent: 'Select student',
      generate: 'Generate Report',
      generating: 'Aggregating & composing...',
      print: 'Print / PDF',
      refresh: 'Refresh',
      noData: 'No sealed sessions in this period',
      errorFetch: 'Failed to fetch data — check Airtable connection',
      academic: 'Academic & Skill Progress',
      behavioral: 'Behavioral & Emotional Stability',
      recommendations: 'Future Recommendations',
      parentLocked: 'Report for your linked child',
      sessions: 'sealed session(s)',
      specialists: 'Specialists',
      periodRange: 'Period range',
      recItem: 'Guidance',
      noNotes: 'No notes in this category',
    },
  };
  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (isParent && user?.childName) {
      setStudentName(user.childName);
    }
  }, [isParent, user?.childName]);

  const runGenerate = useCallback(async () => {
    const name = studentName.trim();
    if (!name) return;
    setLoading(true);
    setError('');
    try {
      const data = await generateStudentPerformanceReport({ studentName: name, period, lang });
      setReport(data);
    } catch (err) {
      setError(err?.message || copy.errorFetch);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [studentName, period, lang, copy.errorFetch]);

  useEffect(() => {
    if (!studentName.trim()) return;
    runGenerate();
  }, [studentName, period, runGenerate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${LUX.page} min-h-full`}>
      {/* Screen chrome — hidden on print */}
      <div className="no-print relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400/8 blur-3xl" />

        <header className="relative z-10 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileBarChart className="w-7 h-7 text-blue-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-l from-blue-200 to-blue-400 bg-clip-text text-transparent">
                  {copy.title}
                </h1>
              </div>
              <p className="text-sm text-slate-400">{copy.subtitle}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" /> {copy.sealedBadge}
            </span>
          </div>
        </header>

        <div className="relative z-10 rounded-2xl bg-[#12121a]/80 border border-blue-500/25 p-4 md:p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex gap-2">
            {[REPORT_PERIODS.WEEKLY, REPORT_PERIODS.MONTHLY].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : 'bg-[#0d0d10] border border-white/10 text-slate-400 hover:border-blue-400/30'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block me-1.5 -mt-0.5" />
                {p === REPORT_PERIODS.WEEKLY ? copy.weekly : copy.monthly}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-mono text-blue-400/70 block mb-1">{copy.student}</label>
            {isParent ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-400/25 text-blue-100 text-sm">
                <User className="w-4 h-4 shrink-0" />
                <span>{user?.childName ?? copy.parentLocked}</span>
                <Shield className="w-3.5 h-3.5 ms-auto text-blue-400/60" />
              </div>
            ) : (
              <div className="relative">
                <select
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={studentsLoading}
                  className="w-full appearance-none bg-[#0d0d10] border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:border-blue-400/45 focus:outline-none"
                >
                  <option value="">{copy.selectStudent}</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.name ?? ''}>
                      {s.name ?? s.id}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={runGenerate}
            disabled={loading || !studentName.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-40 hover:shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {loading ? copy.generating : copy.generate}
          </button>

          {report && (
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#0d0d10] border border-blue-400/35 text-blue-200 font-bold text-sm flex items-center gap-2 hover:bg-blue-500/10 transition-all"
            >
              <Printer className="w-4 h-4" /> {copy.print}
            </button>
          )}
        </div>

        {error && (
          <p className="relative z-10 mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {/* Printable report body */}
      <div ref={printRef} className="aunak-report-print relative z-10">
        {loading && !report && (
          <div className="no-print flex items-center justify-center py-20 text-blue-300 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-mono text-sm">{copy.generating}</span>
          </div>
        )}

        {!loading && report && report.meta.sessionCount === 0 && (
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-10 text-center text-slate-400">
            {copy.noData}
          </div>
        )}

        {report && report.meta.sessionCount > 0 && (
          <article className="space-y-5">
            <div className="aunak-report-header rounded-2xl border border-blue-500/30 bg-[#12121a]/90 p-6 print:bg-white print:border-slate-300 print:text-black">
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-mono text-blue-400/70 uppercase tracking-wider print:text-slate-500">
                    Aunak AI Report Engine
                  </p>
                  <h2 className="text-xl font-bold text-blue-100 print:text-black mt-1">
                    {report.meta.studentName}
                  </h2>
                  <p className="text-sm text-slate-400 print:text-slate-600 mt-1">
                    {copy.periodRange}: {report.meta.startDate} → {report.meta.endDate}
                    <span className="mx-2">·</span>
                    {report.meta.periodLabel}
                  </p>
                </div>
                <div className="text-end text-xs font-mono text-slate-500 print:text-slate-600">
                  <p>
                    {report.meta.sessionCount} {copy.sessions}
                  </p>
                  {report.meta.specialists?.length > 0 && (
                    <p className="mt-1">
                      {copy.specialists}: {report.meta.specialists.join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <ReportSection title={copy.academic} summary={report.academicProgress.summary}>
              <NoteList items={report.academicProgress.highlights} emptyLabel={copy.noNotes} />
            </ReportSection>

            <ReportSection title={copy.behavioral} summary={report.behavioralStability.summary}>
              <NoteList items={report.behavioralStability.observations} emptyLabel={copy.noNotes} />
            </ReportSection>

            <ReportSection title={copy.recommendations} summary={report.recommendations.summary}>
              <ul className="space-y-2">
                {report.recommendations.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-300 border-s border-blue-500/30 ps-3 leading-relaxed print:text-black"
                  >
                    <span className="text-[10px] font-mono text-blue-400/70 block mb-0.5 print:text-slate-500">
                      {copy.recItem}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </ReportSection>

            <footer className="no-print text-[10px] font-mono text-slate-600 text-center pt-4">
              {formatReportAsText(report, lang).split('\n').slice(-1)[0]}
            </footer>
          </article>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/AunakResearchHub.jsx
````javascript
import { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  Eye,
  Download,
  Send,
  Lock,
  Globe2,
  Database,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { fetchAirtableRecords, parseHarmonyScore } from '../lib/airtable';
import {
  RESEARCH_SOURCES,
  anonymizeForResearch,
  smartCensorAudit,
  applyCensor,
  encryptForExport,
} from '../lib/research';
import { useAuth, ROLES } from '../lib/auth';
import { LUX } from '../lib/luxTheme.js';

/** Find the first indicator whose key matches the pattern. */
function pickIndicator(indicators, pattern) {
  for (const [key, value] of Object.entries(indicators ?? {})) {
    if (pattern.test(key)) return value;
  }
  return null;
}

function distribution(rows, pattern) {
  const counts = new Map();
  for (const row of rows) {
    let v = pickIndicator(row.indicators, pattern);
    if (Array.isArray(v)) v = v[0];
    if (v == null || v === '') continue;
    const label = String(v).trim();
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
}

const BAR_COLORS = ['bg-amber-600', 'bg-indigo-500', 'bg-emerald-600', 'bg-rose-500', 'bg-cyan-600', 'bg-violet-500'];

export default function AunakResearchHub({ lang = 'ar' }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.ADMIN;

  const [rowsBySource, setRowsBySource] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportKey, setExportKey] = useState(null);
  const [published, setPublished] = useState(false);

  const t = {
    ar: {
      title: 'مركز عونك للأبحاث',
      subtitle: 'القسم 16 — أطلس التوحد الوطني · بيانات مجرّدة بالكامل من الهوية',
      badgeCensor: 'الرقيب الذكي: المخرجات مدققة',
      badgeAes: 'تشفير AES-256',
      loading: 'جاري سحب البيانات الحيوية وتجريدها من الهوية...',
      kpiCases: 'حالة بحثية مجرّدة',
      kpiSources: 'مصادر حيوية',
      kpiHarmony: 'متوسط التناغم',
      kpiCensor: 'فحص الرقيب',
      censorPass: 'نظيف 100%',
      censorBlocked: (n) => `حُجبت ${n} سجلات`,
      atlas: 'أطلس التوحد الوطني',
      atlasHint: 'توزيعات مجمعة — لا يمكن إرجاع أي مؤشر لهوية طفل بعينه',
      diagDist: 'توزيع التشخيصات',
      moodDist: 'توزيع الحالات المزاجية المرصودة',
      harmonyDist: 'توزيع درجات التناغم',
      bucketLow: 'حرج (<50)',
      bucketMid: 'متوسط (50-79)',
      bucketHigh: 'مرتفع (80+)',
      noData: 'لا توجد مؤشرات كافية بعد',
      sources: 'المصادر الحيوية المغذية للأطلس',
      records: 'سجل',
      exportBtn: 'تحميل الحزمة البحثية (AES-256)',
      exportingBtn: 'جاري التشفير...',
      exportKeyLabel: 'مفتاح فك التشفير (يُعرض مرة واحدة — احفظه الآن):',
      publishBtn: 'نشر في الأطلس الوطني',
      publishedBtn: 'تم النشر في الأطلس',
      publishLocked: 'النشر صلاحية حصرية للمدير الأعلى (Super Admin)',
      anonNote: 'وظيفة anonymizeForResearch() أزالت أسماء الأطفال، الأكواد، بيانات التواصل وأولياء الأمور قبل أي عرض أو تحميل.',
    },
    en: {
      title: 'Aunak Research Center',
      subtitle: 'Section 16 — National Autism Atlas · fully de-identified data',
      badgeCensor: 'Smart Censor: outputs audited',
      badgeAes: 'AES-256 Encryption',
      loading: 'Pulling vital data and stripping identity...',
      kpiCases: 'Anonymized research cases',
      kpiSources: 'Vital sources',
      kpiHarmony: 'Avg. harmony',
      kpiCensor: 'Censor audit',
      censorPass: '100% clean',
      censorBlocked: (n) => `${n} rows blocked`,
      atlas: 'National Autism Atlas',
      atlasHint: 'Aggregate distributions — no indicator can be traced back to a child',
      diagDist: 'Diagnosis Distribution',
      moodDist: 'Observed Mood Distribution',
      harmonyDist: 'Harmony Score Distribution',
      bucketLow: 'Critical (<50)',
      bucketMid: 'Moderate (50-79)',
      bucketHigh: 'High (80+)',
      noData: 'Not enough indicators yet',
      sources: 'Vital sources feeding the atlas',
      records: 'records',
      exportBtn: 'Download Research Package (AES-256)',
      exportingBtn: 'Encrypting...',
      exportKeyLabel: 'Decryption key (shown once — save it now):',
      publishBtn: 'Publish to National Atlas',
      publishedBtn: 'Published to Atlas',
      publishLocked: 'Publishing is exclusive to the Super Admin',
      anonNote: 'anonymizeForResearch() removed child names, codes, contact and guardian data before any display or download.',
    },
  };
  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled(
        RESEARCH_SOURCES.map((s) => fetchAirtableRecords(s.tableId))
      );
      if (cancelled) return;
      const next = {};
      RESEARCH_SOURCES.forEach((s, i) => {
        const records = results[i].status === 'fulfilled' ? results[i].value : [];
        // تجريد الهوية ثم تمرير المخرجات على الرقيب الذكي قبل أي عرض.
        next[s.key] = applyCensor(anonymizeForResearch(records, s.key));
      });
      setRowsBySource(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allRows = useMemo(() => Object.values(rowsBySource).flat(), [rowsBySource]);
  const audit = useMemo(() => smartCensorAudit(allRows), [allRows]);

  const harmonyScores = useMemo(() => {
    return (rowsBySource.students ?? [])
      .map((row) => parseHarmonyScore(pickIndicator(row.indicators, /harmony|تناغم/i)))
      .filter((h) => h != null);
  }, [rowsBySource.students]);

  const avgHarmony = harmonyScores.length
    ? Math.round(harmonyScores.reduce((a, b) => a + b, 0) / harmonyScores.length)
    : null;

  const harmonyBuckets = useMemo(() => {
    const buckets = [
      { label: copy.bucketLow, color: 'bg-rose-500', count: 0 },
      { label: copy.bucketMid, color: 'bg-amber-600', count: 0 },
      { label: copy.bucketHigh, color: 'bg-emerald-600', count: 0 },
    ];
    for (const h of harmonyScores) {
      if (h < 50) buckets[0].count += 1;
      else if (h < 80) buckets[1].count += 1;
      else buckets[2].count += 1;
    }
    return buckets;
  }, [harmonyScores, copy.bucketLow, copy.bucketMid, copy.bucketHigh]);

  const diagDist = useMemo(
    () => distribution(rowsBySource.students ?? [], /تشخيص|diagnosis/i),
    [rowsBySource.students]
  );
  const moodDist = useMemo(
    () => distribution(rowsBySource.emotion ?? [], /مزاج|mood|عاطفة|emotion/i),
    [rowsBySource.emotion]
  );

  const handleExport = async () => {
    if (exporting || allRows.length === 0) return;
    setExporting(true);
    setExportKey(null);
    try {
      // الرقيب الذكي يدقق المخرجات النهائية قبل السماح بالتحميل.
      const cleanRows = applyCensor(allRows);
      const { fileText, keyHex } = await encryptForExport({
        atlas: 'Aunak National Autism Atlas',
        cases: cleanRows,
      });
      const blob = new Blob([fileText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aunak-research-${Date.now()}.aun.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportKey(keyHex);
    } finally {
      setExporting(false);
    }
  };

  const maxDiag = Math.max(1, ...diagDist.map(([, n]) => n));
  const maxMood = Math.max(1, ...moodDist.map(([, n]) => n));
  const maxBucket = Math.max(1, ...harmonyBuckets.map((b) => b.count));

  return (
    <div
      className="p-6 md:p-10 min-h-screen bg-[#08070d] text-slate-200 font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Dark Academic header */}
      <header className="mb-8 relative overflow-hidden rounded-3xl border border-amber-700/30 bg-gradient-to-br from-[#15110a] via-[#0d0b14] to-[#0a0d16] p-8 shadow-[0_0_50px_rgba(180,130,40,0.08)]">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-700/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-amber-300 via-amber-200 to-indigo-300 bg-clip-text text-transparent flex items-center gap-3">
              <FlaskConical className="w-9 h-9 text-amber-500 shrink-0" /> {copy.title}
            </h2>
            <p className="text-slate-400 mt-3 font-mono text-sm">{copy.subtitle}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Eye className="w-3.5 h-3.5" /> {copy.badgeCensor}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-600/30 text-[#e8c872] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> {copy.badgeAes}
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-24 text-slate-400 font-mono flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
          {copy.loading}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className="text-4xl font-black text-[#e8c872]">{allRows.length}</p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiCases}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className="text-4xl font-black text-[#e8c872]">{RESEARCH_SOURCES.length}</p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiSources}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className="text-4xl font-black text-emerald-300">{avgHarmony != null ? `${avgHarmony}%` : '—'}</p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiHarmony}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className={`text-lg font-black mt-2 ${audit.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                {audit.passed ? copy.censorPass : copy.censorBlocked(audit.flags.length)}
              </p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiCensor}</p>
            </div>
          </div>

          {/* National Atlas */}
          <section className="p-7 rounded-3xl bg-[#0d0b14] border border-indigo-800/40 shadow-xl">
            <div className="flex items-center gap-3 mb-1">
              <Globe2 className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-slate-300">{copy.atlas}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">{copy.atlasHint}</p>

            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { title: copy.diagDist, data: diagDist, max: maxDiag },
                { title: copy.moodDist, data: moodDist, max: maxMood },
              ].map(({ title, data, max }) => (
                <div key={title} className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15">
                  <h4 className="text-sm font-bold text-amber-200/90 mb-4">{title}</h4>
                  {data.length === 0 ? (
                    <p className="text-xs text-slate-600 py-6 text-center">{copy.noData}</p>
                  ) : (
                    <div className="space-y-3">
                      {data.map(([label, count], i) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300 truncate max-w-[70%]">{label}</span>
                            <span className="text-slate-500 font-mono">{count}</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                              style={{ width: `${(count / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15">
                <h4 className="text-sm font-bold text-amber-200/90 mb-4">{copy.harmonyDist}</h4>
                {harmonyScores.length === 0 ? (
                  <p className="text-xs text-slate-600 py-6 text-center">{copy.noData}</p>
                ) : (
                  <div className="flex items-end gap-4 h-36 px-2">
                    {harmonyBuckets.map((bucket) => (
                      <div key={bucket.label} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{bucket.count}</span>
                        <div
                          className={`w-full rounded-t-xl ${bucket.color} transition-all duration-700`}
                          style={{ height: `${Math.max(6, (bucket.count / maxBucket) * 100)}px` }}
                        />
                        <span className="text-[10px] text-slate-500 text-center leading-tight">{bucket.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sources + actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <section className="p-6 rounded-3xl bg-[#0d0b14] border border-[#c9a962]/15">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> {copy.sources}
              </h3>
              <div className="space-y-2">
                {RESEARCH_SOURCES.map((s) => (
                  <div key={s.key} className="flex items-center justify-between p-3 rounded-xl bg-[#100e16] border border-[#c9a962]/15/80 text-sm">
                    <span className="text-slate-300">{lang === 'ar' ? s.ar : s.en}</span>
                    <span className="text-xs font-mono text-[#d4af37]/80">
                      {(rowsBySource[s.key] ?? []).length} {copy.records}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate-500 leading-relaxed bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline me-1" /> {copy.anonNote}
              </p>
            </section>

            <section className="p-6 rounded-3xl bg-[#0d0b14] border border-amber-800/30 flex flex-col gap-4">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || allRows.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {exporting ? copy.exportingBtn : copy.exportBtn}
              </button>

              {exportKey && (
                <div className="p-4 rounded-xl bg-[#0d0d10]/90 border border-amber-600/40">
                  <p className="text-[11px] text-[#e8c872] mb-2 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> {copy.exportKeyLabel}
                  </p>
                  <code dir="ltr" className="block text-[10px] text-emerald-300 font-mono break-all select-all">
                    {exportKey}
                  </code>
                </div>
              )}

              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => setPublished(true)}
                  disabled={published}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${published ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' : 'bg-gradient-to-l from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white'}`}
                >
                  {published ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  {published ? copy.publishedBtn : copy.publishBtn}
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-2xl bg-slate-900 border border-white/[0.08] text-slate-500 text-sm font-bold flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> {copy.publishLocked}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: src/components/AunakSummerAcademy.jsx
````javascript
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth, ROLES } from '../lib/auth';
import { useSummerAcademy } from '../hooks/useSummerAcademy';
import { useAcademyVoice } from '../hooks/useAcademyVoice';
import { useAcademyMood } from '../hooks/useAcademyMood';
import { ACADEMY, ACADEMY_MOODS } from '../lib/academyTheme';
import AcademyShell from './summer-academy/AcademyShell';
import AcademyLiveBackground from './summer-academy/AcademyLiveBackground';
import AcademyWelcomeMission from './summer-academy/AcademyWelcomeMission';
import AcademyTrackHub from './summer-academy/AcademyTrackHub';
import AcademyBrainWheel from './summer-academy/AcademyBrainWheel';
import AcademyLeaderboard from './summer-academy/AcademyLeaderboard';
import AcademyParentZone, { AcademyParentButton } from './summer-academy/AcademyParentZone';

export default function AunakSummerAcademy({ lang: langProp = 'ar' }) {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState(langProp);
  const [taskLoading, setTaskLoading] = useState(false);
  const [mascotExpression, setMascotExpression] = useState('idle');
  const role = user?.role ?? ROLES.PARENT;
  const isParent = role === ROLES.PARENT || role === ROLES.ADMIN;
  const prevAnswersLen = useRef(0);
  const prevView = useRef('welcome');

  const sa = useSummerAcademy({ lang });
  const isParentView = sa.view === 'parent';
  const moodCtrl = useAcademyMood();
  const voice = useAcademyVoice({
    lang,
    studentName: sa.studentName,
    enabled: !isParentView,
    muted: isParentView,
  });

  const copy = {
    ar: {
      hubTitle: 'الأكاديمية الصيفية',
      hubSub: 'مغامرة حية · نورا معك!',
      xpToday: 'نقاط الجهد',
      streak: 'سلسلة',
    },
    en: {
      hubTitle: 'Summer Academy',
      hubSub: 'Live adventure · Nova is with you!',
      xpToday: 'Effort XP',
      streak: 'Streak',
    },
  }[lang];

  const handleStartWelcome = useCallback(() => {
    moodCtrl.toThinking();
    voice.onWelcomeStart();
    sa.startWelcome();
  }, [moodCtrl, voice, sa]);

  const handleAnswer = useCallback(
    (optionIndex) => {
      voice.onAnswer();
      setMascotExpression('happy');
      moodCtrl.celebrate();
      setTimeout(() => setMascotExpression('idle'), 800);
      sa.answerWelcome(optionIndex);
    },
    [voice, moodCtrl, sa]
  );

  const handleCompleteTask = useCallback(
    async (trackId) => {
      setTaskLoading(true);
      moodCtrl.toChallenge();
      const result = await sa.completeTask(trackId);
      if (!result.alreadyDone) {
        voice.onTaskComplete();
        moodCtrl.celebrate();
        setMascotExpression('cheer');
        setTimeout(() => setMascotExpression('idle'), 1200);
      }
      setTaskLoading(false);
    },
    [sa, voice, moodCtrl]
  );

  const handleWheelSpin = useCallback(() => {
    voice.onWheelSpin();
    moodCtrl.toThinking();
    setMascotExpression('wink');
    sa.spinWheel();
    setTimeout(() => setMascotExpression('idle'), 1000);
  }, [voice, moodCtrl, sa]);

  useEffect(() => {
    if (sa.currentQuestion) {
      moodCtrl.toThinking();
      voice.onQuestionShown(sa.currentQuestion);
    }
  }, [sa.currentQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const len = sa.welcomeAnswers?.length ?? 0;
    if (len > prevAnswersLen.current && len < (sa.mission?.questions?.length ?? 0)) {
      moodCtrl.toThinking();
    }
    prevAnswersLen.current = len;
  }, [sa.welcomeAnswers?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevView.current === 'welcome' && sa.view === 'hub' && sa.progress?.welcomeComplete) {
      voice.onAssessmentDone();
      moodCtrl.celebrate();
      setMascotExpression('cheer');
      setTimeout(() => setMascotExpression('idle'), 2000);
    }
    prevView.current = sa.view;
  }, [sa.view, sa.progress?.welcomeComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isParentView) {
      moodCtrl.toIdle();
      voice.cancel();
    }
  }, [isParentView]); // eslint-disable-line react-hooks/exhaustive-deps

  if (sa.loading) {
    return (
      <div className={`${ACADEMY.root} flex items-center justify-center`}>
        <AcademyLiveBackground mood={ACADEMY_MOODS.idle} />
        <motion.span
          className="text-5xl relative z-10"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          🎡
        </motion.span>
      </div>
    );
  }

  return (
    <AcademyShell
      lang={lang}
      mood={moodCtrl.mood}
      calm={isParentView}
      mascotExpression={mascotExpression}
      isSpeaking={voice.isSpeaking}
      showMascot={!isParentView}
      title={copy.hubTitle}
      subtitle={copy.hubSub}
      onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
      onLogout={logout}
    >
      {sa.view === 'welcome' && (
        <AcademyWelcomeMission
          lang={lang}
          mission={sa.mission}
          question={sa.currentQuestion}
          onStart={handleStartWelcome}
          onAnswer={handleAnswer}
          lastMessage={sa.lastMessage}
          onReplay={voice.replay}
        />
      )}

      {sa.view === 'hub' && (
        <>
          {sa.lastMessage && (
            <motion.div
              className={`${ACADEMY.cardCelebrate} text-center font-black text-lg text-amber-700`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {sa.lastMessage}
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <AcademyTrackHub
              lang={lang}
              trackIds={sa.trackIds}
              todayTasks={sa.todayTasks}
              onComplete={handleCompleteTask}
              loading={taskLoading}
              onChallenge={moodCtrl.toChallenge}
            />

            <div className="space-y-4">
              <div className={`${ACADEMY.card} text-center`}>
                <p className="text-xs font-bold text-slate-500 mb-1">{copy.xpToday}</p>
                <p className={ACADEMY.xpBadge}>{sa.progress?.dailyXp ?? 0}</p>
                <p className="text-xs font-bold text-orange-500 mt-2">
                  {copy.streak}: {sa.progress?.streak ?? 0} 🔥
                </p>
              </div>
              <AcademyBrainWheel
                lang={lang}
                onSpin={handleWheelSpin}
                result={sa.wheelTrack}
                brainMedia={sa.brainMedia}
              />
            </div>
          </div>

          <AcademyLeaderboard lang={lang} rows={sa.positiveLeaderboard} />

          {isParent && <AcademyParentButton lang={lang} onClick={() => sa.setView('parent')} />}
        </>
      )}

      {isParentView && isParent && (
        <AcademyParentZone
          lang={lang}
          report={sa.weeklyReport}
          cert={sa.leapCertificate}
          onBack={() => sa.setView('hub')}
        />
      )}
    </AcademyShell>
  );
}
````

## File: src/components/child/ChildAssessmentPanel.jsx
````javascript
import { useCallback } from 'react';
import FreeAssessmentFlow from '../assessment/FreeAssessmentFlow';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';
import {
  enqueueAcademySpeech,
  scriptAssessmentDone,
  unlockAcademyVoice,
} from '../../lib/academyVoice';
import { playSuccessChime } from '../../lib/sovereignAudio';

async function syncTawasulAssessment(recordId, computed, studentName) {
  const res = await fetch('/api/tawasul/assessment-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      recordId,
      studentName,
      fields: {
        initial_assessment_score: computed.scorePercent,
        comprehensive_assessment_status: 'completed',
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'ASSESSMENT_SYNC_FAILED');
  return data;
}

export default function ChildAssessmentPanel({
  lang = 'ar',
  studentName = '',
  recordId,
  onComplete,
  onGoalSynced,
}) {
  const copyOverrides =
    lang === 'en'
      ? {
          title: 'Neural skills river',
          subtitle: 'Six questions — flows into your sovereign profile',
          progress: 'Question',
          of: 'of',
          back: 'Back',
          next: 'Next',
          seeResult: 'Seal my result',
          saving: 'Syncing to neural vault…',
        }
      : {
          title: 'نهر المهارات العصبي',
          subtitle: 'ستة أسئلة — تنساب إلى ملفك السيادي',
          progress: 'سؤال',
          of: 'من',
          back: 'رجوع',
          next: 'التالي',
          seeResult: 'ختم نتيجتي',
          saving: 'مزامنة مع الخزنة العصبية…',
        };

  const persistResult = useCallback(
    async (id, computed) => {
      if (!id) return;
      await syncTawasulAssessment(id, computed, studentName);
    },
    [studentName]
  );

  const handleComplete = (result) => {
    unlockAcademyVoice();
    playSuccessChime();
    enqueueAcademySpeech(scriptAssessmentDone(lang), { lang, preferCloud: true });
    onGoalSynced?.();
    onComplete?.(result);
  };

  return (
    <div className={TAWASUL_CHILD.card}>
      <FreeAssessmentFlow
        lang={lang}
        studentName={studentName}
        recordId={recordId}
        skipPromo
        copyOverrides={copyOverrides}
        persistResult={persistResult}
        onComplete={handleComplete}
      />
    </div>
  );
}
````

## File: src/components/child/ChildAvatar.jsx
````javascript
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Living sovereign companion — a breathing, blinking robot friend whose eyes
 * track the child's finger/cursor and who winks + bounces when tapped.
 * No text, pure sensory presence (mood: happy | calm | celebrate).
 */
export default function ChildAvatar({ mood = 'happy', onTap, size = 168 }) {
  const wrapRef = useRef(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [wink, setWink] = useState(false);
  const [bounce, setBounce] = useState(0);

  useEffect(() => {
    const move = (clientX, clientY) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const max = 6; // px pupil travel
      setPupil({ x: (dx / dist) * Math.min(max, dist / 12), y: (dy / dist) * Math.min(max, dist / 12) });
    };
    const onMouse = (e) => move(e.clientX, e.clientY);
    const onTouch = (e) => {
      const tch = e.touches?.[0];
      if (tch) move(tch.clientX, tch.clientY);
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  const palette =
    mood === 'calm'
      ? { ring: 'from-indigo-400 to-violet-500', glow: 'rgba(129,140,248,0.5)', cheek: 'bg-indigo-300/50' }
      : mood === 'celebrate'
        ? { ring: 'from-[#e8c872] to-amber-400', glow: 'rgba(232,200,114,0.65)', cheek: 'bg-amber-300/60' }
        : { ring: 'from-[#c9a962] to-emerald-400', glow: 'rgba(52,211,153,0.5)', cheek: 'bg-emerald-300/50' };

  const handleTap = () => {
    setWink(true);
    setBounce((b) => b + 1);
    setTimeout(() => setWink(false), 420);
    onTap?.();
  };

  const eye = (delayClass) => (
    <div className="relative w-[22%] h-[26%] rounded-full bg-white overflow-hidden shadow-inner">
      <div className={`absolute inset-0 ${wink ? '' : delayClass}`} style={wink ? { transform: 'scaleY(0.1)' } : undefined}>
        <div
          className="absolute left-1/2 top-1/2 w-[55%] h-[55%] rounded-full bg-[#0a0a0c]"
          style={{ transform: `translate(calc(-50% + ${pupil.x}px), calc(-50% + ${pupil.y}px))` }}
        >
          <span className="absolute right-[18%] top-[14%] w-[28%] h-[28%] rounded-full bg-white/90" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.button
      type="button"
      ref={wrapRef}
      onClick={handleTap}
      aria-label="companion"
      className="relative outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded-full"
      style={{ width: size, height: size }}
      animate={{ scale: bounce % 2 === 0 ? 1 : [1, 1.12, 0.96, 1] }}
      transition={{ duration: 0.45 }}
      whileTap={{ scale: 0.94 }}
    >
      <span
        className="tawasul-ring absolute inset-0 rounded-full border-2 border-emerald-300/50"
        style={{ boxShadow: `0 0 40px ${palette.glow}` }}
      />
      <span className="tawasul-ring-delay absolute inset-0 rounded-full border-2 border-[#e8c872]/40" />

      <div
        className={`tawasul-avatar-breathe relative w-full h-full rounded-[42%] bg-gradient-to-br ${palette.ring} border-4 border-white/20 flex items-center justify-center`}
        style={{ boxShadow: `0 0 48px ${palette.glow}, inset 0 -10px 24px rgba(0,0,0,0.25)` }}
      >
        {/* antenna */}
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/60 rounded-full" />
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />

        {/* face plate */}
        <div className="relative w-[74%] h-[62%] rounded-[38%] bg-[#0a0a0c]/85 border border-white/15 flex flex-col items-center justify-center gap-[8%] px-[8%]">
          <div className="flex w-full items-center justify-between px-[6%]">
            {eye('tawasul-blink')}
            {eye('tawasul-blink-delay')}
          </div>
          {/* mouth */}
          {mood === 'calm' ? (
            <span className="w-[34%] h-[10%] rounded-full bg-indigo-200/80" />
          ) : (
            <span className="w-[42%] h-[20%] rounded-b-[999px] bg-gradient-to-b from-transparent to-white/85 border-b-4 border-white/85" />
          )}
        </div>

        {/* cheeks */}
        <span className={`absolute left-[16%] top-[56%] w-[14%] h-[9%] rounded-full ${palette.cheek} blur-[1px]`} />
        <span className={`absolute right-[16%] top-[56%] w-[14%] h-[9%] rounded-full ${palette.cheek} blur-[1px]`} />
      </div>
    </motion.button>
  );
}
````

## File: src/components/child/ChildAwniCompanion.jsx
````javascript
import { motion, AnimatePresence } from 'framer-motion';
import { useMeltdownPredictor } from '../../hooks/useMeltdownPredictor';

const CALM_LINES = {
  ar: ['أنا عوني 🌟', 'أنت بطل!', 'يلا نكمل!', 'رائع جداً!'],
  en: ['I am Awni 🌟', 'You are a champion!', 'Let us continue!', 'Amazing!'],
};

const SILENT_LINES = {
  ar: '🤫 … نتنفس بهدوء',
  en: '🤫 … calm breath',
};

export default function ChildAwniCompanion({ lang = 'ar', active = true, lineIndex = 0 }) {
  const { meltdownRisk, onPointerActivity } = useMeltdownPredictor({ active, lang });
  const lines = CALM_LINES[lang] ?? CALM_LINES.ar;
  const line = meltdownRisk ? (SILENT_LINES[lang] ?? SILENT_LINES.ar) : lines[lineIndex % lines.length];

  return (
    <div
      className="flex flex-col items-center gap-3"
      onPointerDown={() => onPointerActivity('down')}
      onPointerUp={() => onPointerActivity('up')}
    >
      <motion.div
        animate={
          meltdownRisk
            ? { scale: 0.92, rotate: 0 }
            : { scale: [1, 1.04, 1], rotate: [0, 2, -2, 0] }
        }
        transition={{ duration: meltdownRisk ? 0.4 : 2.5, repeat: meltdownRisk ? 0 : Infinity }}
        className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl border-4 ${
          meltdownRisk
            ? 'bg-[#12121a] border-[#c9a962]/30 shadow-none'
            : 'bg-gradient-to-br from-[#c9a962] to-emerald-500 border-[#e8c872]/40 shadow-[0_0_32px_rgba(52,211,153,0.3)]'
        }`}
      >
        {meltdownRisk ? '🤫' : '🤖'}
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={
            meltdownRisk
              ? 'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/60 border border-[#c9a962]/20 text-[#c9a962]/80 text-sm font-bold'
              : 'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/90 border border-emerald-400/30 text-emerald-100 text-lg font-bold'
          }
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
````

## File: src/components/child/ChildCalmOverlay.jsx
````javascript
/**
 * Calming Sensory Pulse — fires on the specialist's calm_pulse command.
 * The whole screen becomes a slow fluid blue/violet gradient with breathing
 * aurora blobs and a soft breathing orb, pulling the child into stillness.
 */
export default function ChildCalmOverlay({ show, lang = 'ar' }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[65] overflow-hidden" aria-hidden>
      <div className="tawasul-calm-fluid absolute inset-0" />

      {/* aurora blobs */}
      <div className="tawasul-aurora absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.5),transparent_60%)] blur-3xl" />
      <div className="tawasul-aurora-delay absolute -bottom-1/4 -right-1/4 w-[75vw] h-[75vw] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.45),transparent_60%)] blur-3xl" />
      <div className="tawasul-aurora absolute top-1/3 right-1/4 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.35),transparent_60%)] blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8 px-6">
        <div className="tawasul-breathe w-44 h-44 rounded-full bg-gradient-to-br from-indigo-300/80 to-violet-400/70 border border-white/30" />
        <p className="text-2xl font-black text-indigo-50/90 tracking-widest text-center drop-shadow">
          {lang === 'en' ? 'breathe…' : '…تنفّس'}
        </p>
      </div>
    </div>
  );
}
````

## File: src/components/child/ChildCelebration.jsx
````javascript
import { useMemo } from 'react';

const SPARK_COLORS = ['#e8c872', '#34d399', '#f59e0b', '#38bdf8', '#f472b6', '#a78bfa'];
const BALLOON_COLORS = [
  'from-rose-400 to-pink-500',
  'from-amber-300 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-indigo-500',
  'from-violet-400 to-fuchsia-500',
  'from-[#e8c872] to-amber-500',
];

function Firework({ x, y, delay }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 14;
        const radius = 70 + Math.random() * 60;
        return {
          id: i,
          fx: `${Math.cos(angle) * radius}px`,
          fy: `${Math.sin(angle) * radius}px`,
          color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        };
      }),
    []
  );
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {sparks.map((s) => (
        <span
          key={s.id}
          className="tawasul-fw-spark"
          style={{
            background: s.color,
            boxShadow: `0 0 10px ${s.color}`,
            // eslint-disable-next-line
            ['--fx']: s.fx,
            ['--fy']: s.fy,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Full-screen LOCKED reward burst — only fired when the specialist sends a
 * success/star command. Fireworks + flying balloons + confetti + big Ta-da.
 */
export default function ChildCelebration({ show, lang = 'ar' }) {
  const fireworks = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        x: 12 + Math.random() * 76,
        y: 12 + Math.random() * 50,
        delay: Math.random() * 0.9,
      })),
    [show]
  );
  const balloons = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 92,
        dur: 3 + Math.random() * 2.4,
        delay: Math.random() * 0.8,
        rot: `${-18 + Math.random() * 36}deg`,
        size: 40 + Math.random() * 36,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      })),
    [show]
  );
  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: 1.4 + Math.random() * 1.4,
        delay: Math.random() * 0.6,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
      })),
    [show]
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {/* soft flash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,200,114,0.18),transparent_65%)]" />

      {fireworks.map((f) => (
        <Firework key={f.id} x={f.x} y={f.y} delay={f.delay} />
      ))}

      {confetti.map((c) => (
        <span
          key={c.id}
          className="tawasul-confetti-piece"
          style={{ left: `${c.left}%`, background: c.color, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        />
      ))}

      {balloons.map((b) => (
        <div
          key={b.id}
          className="tawasul-balloon"
          style={{ left: `${b.left}%`, ['--dur']: `${b.dur}s`, ['--rot']: b.rot, animationDelay: `${b.delay}s` }}
        >
          <div
            className={`bg-gradient-to-br ${b.color} rounded-full shadow-lg`}
            style={{ width: b.size, height: b.size * 1.2 }}
          />
          <div className="mx-auto w-px h-10 bg-white/40" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="tawasul-tada text-center">
          <div className="text-8xl drop-shadow-[0_0_24px_rgba(232,200,114,0.6)]">🎉</div>
          <div className="mt-2 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#e8c872] via-amber-300 to-emerald-300">
            {lang === 'en' ? 'Ta-da! You did it!' : '!أحسنت! نجحت'}
          </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/child/ChildGoalSpeaker.jsx
````javascript
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles } from 'lucide-react';
import { enqueueAcademySpeech, unlockAcademyVoice, cancelAcademySpeech } from '../../lib/academyVoice';
import { playGoalEcho } from '../../lib/sovereignAudio';

const EQ_BARS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Textless goal delivery — the child taps a big glowing speaker and HEARS the
 * specialist's programmed goal instead of reading it. Friendly cheerful voice.
 */
export default function ChildGoalSpeaker({ lang = 'ar', goalText, studentName }) {
  const [speaking, setSpeaking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAcademySpeech();
    };
  }, []);

  const hasGoal = Boolean(goalText && goalText.trim());
  const firstName = studentName?.split?.(' ')?.[0] ?? studentName ?? '';

  const spoken = hasGoal
    ? `${firstName ? (lang === 'en' ? `${firstName}! ` : `${firstName}! `) : ''}${goalText.trim()}`
    : lang === 'en'
      ? `${firstName || 'Champion'}! Your challenge is coming very soon. Get ready!`
      : `${firstName || 'يا بطل'}! تحديك قادم قريباً جداً. استعد!`;

  const speak = () => {
    unlockAcademyVoice();
    playGoalEcho();
    setSpeaking(true);
    enqueueAcademySpeech(spoken, {
      lang,
      preferCloud: true,
      onEnd: () => {
        if (mountedRef.current) setSpeaking(false);
      },
    });
    // Safety: clear the speaking animation even if TTS silently no-ops.
    setTimeout(() => {
      if (mountedRef.current) setSpeaking(false);
    }, 12000);
  };

  const label = lang === 'en' ? 'Tap to hear your mission' : 'اضغط لتسمع مهمتك';

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <motion.button
        type="button"
        onClick={speak}
        aria-label={label}
        whileTap={{ scale: 0.92 }}
        animate={speaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: speaking ? Infinity : 0 }}
        className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#c9a962] via-amber-400 to-emerald-400 flex items-center justify-center shadow-[0_0_48px_rgba(232,200,114,0.5)] active:shadow-[0_0_24px_rgba(232,200,114,0.35)]"
      >
        <span className="tawasul-ring absolute inset-0 rounded-full border-2 border-amber-200/60" />
        <span className="tawasul-ring-delay absolute inset-0 rounded-full border-2 border-emerald-300/50" />

        {speaking ? (
          <div className="flex items-end gap-1.5 h-16">
            {EQ_BARS.map((i) => (
              <span
                key={i}
                className="tawasul-eq-bar w-2.5 rounded-full bg-[#0a0a0c]/85"
                style={{ height: '100%', animationDelay: `${i * 0.09}s`, animationDuration: `${0.55 + (i % 3) * 0.12}s` }}
              />
            ))}
          </div>
        ) : (
          <Volume2 className="w-20 h-20 text-[#0a0a0c] drop-shadow" strokeWidth={2.4} />
        )}

        <span className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-[#0a0a0c] border-2 border-amber-300/70 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </span>
      </motion.button>

      <p className="text-sm font-black text-[#e8c872] tracking-wide">{label}</p>
    </div>
  );
}
````

## File: src/components/GoalEngine.jsx
````javascript
import { useState } from "react";
import { Target, Shuffle, Loader2, BrainCircuit, ListChecks } from "lucide-react";
import { useAirtableSection } from "../hooks/useAirtableData";
import { useGoalEngine } from "../hooks/useGoalEngine";
import { ENGINE_ID } from "../lib/goalEngine";
import { LUX } from "../lib/luxTheme.js";

export default function GoalEngine({
  lang = "ar",
  student,
  sessionId,
  specialistEmail = "",
  patchSession,
  sessionAttemptsCache = [],
  showWeeklySummary = false,
}) {
  const { records: abcPlans } = useAirtableSection("abcData", { lang });
  const { records: learningRecords } = useAirtableSection("learningDifficulties", { lang });

  const {
    approvedGoals,
    activeGoal,
    activeGoalKey,
    switchGoal,
    attempts,
    sessionSummary,
    weeklySummary,
    advisory,
    loadingAttempts,
    recording,
    error,
    recordAttempt,
  } = useGoalEngine({
    lang,
    student,
    abcPlans,
    learningRecords,
    sessionId,
    specialistEmail,
    patchSession,
    sessionAttemptsCache,
  });

  const [successPercent, setSuccessPercent] = useState("70");
  const [attemptNotes, setAttemptNotes] = useState("");

  const t = {
    ar: {
      title: "محرك الأهداف — التدرج المرن",
      engine: `محرك ${ENGINE_ID}`,
      noGoals: "لا توجد أهداف معتمدة في خطة الطفل — أضف أهدافاً في Airtable.",
      switchHint: "تبديل فوري بين الأهداف المعتمدة (بدون قفل 80%)",
      successLabel: "نسبة النجاح %",
      notesLabel: "ملاحظات المحاولة",
      record: "تسجيل محاولة",
      recording: "جاري التسجيل…",
      sessionAttempts: "محاولات الجلسة",
      weeklyReport: "ملخص الأسبوع (للمشرف)",
      goal: "الهدف",
      attempts: "المحاولات",
      average: "متوسط النجاح",
      advisory: (label, avg) =>
        `${ENGINE_ID}: استجابة منخفضة (${avg}%) — يمكنك التبديل إلى «${label}» (إرشاد فقط)`,
      emptyAttempts: "لا محاولات مسجلة في هذه الجلسة بعد.",
    },
    en: {
      title: "Goal Engine — Dynamic Flow",
      engine: `Engine ${ENGINE_ID}`,
      noGoals: "No approved goals on the child plan — add goals in Airtable.",
      switchHint: "Instant switch between approved goals (no 80% lock)",
      successLabel: "Success %",
      notesLabel: "Attempt notes",
      record: "Record attempt",
      recording: "Recording…",
      sessionAttempts: "Session attempts",
      weeklyReport: "Weekly summary (supervisor)",
      goal: "Goal",
      attempts: "Attempts",
      average: "Avg success",
      advisory: (label, avg) =>
        `${ENGINE_ID}: low response (${avg}%) — consider switching to «${label}» (advisory only)`,
      emptyAttempts: "No attempts recorded in this session yet.",
    },
  };
  const copy = t[lang] ?? t.ar;

  const submitAttempt = async () => {
    const ok = await recordAttempt({
      successPercent: successPercent,
      notes: attemptNotes,
    });
    if (ok != null) setAttemptNotes("");
  };

  return (
    <div className="mt-6 pt-6 border-t border-[#c9a962]/15 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-md font-bold text-emerald-300 flex items-center gap-2">
          <Target className="w-5 h-5" /> {copy.title}
        </h4>
        <span className="text-[10px] font-mono text-slate-500">{copy.engine}</span>
      </div>
      <p className="text-xs text-slate-500">{copy.switchHint}</p>

      {approvedGoals.length === 0 ? (
        <p className="text-sm text-slate-400">{copy.noGoals}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {approvedGoals.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => switchGoal(g.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  g.key === activeGoalKey
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                    : "bg-[#0d0d10]/90 border-white/[0.08] text-slate-400 hover:border-emerald-400/30"
                }`}
              >
                <span className="opacity-60 me-1">{g.source}</span>
                {g.label}
              </button>
            ))}
          </div>

          {advisory?.suggestedGoal && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <BrainCircuit className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {copy.advisory(advisory.suggestedGoal.label, advisory.activeAverage)}
              </span>
              <button
                type="button"
                onClick={() => switchGoal(advisory.suggestedGoal.key)}
                className="ms-auto shrink-0 flex items-center gap-1 text-amber-100 underline"
              >
                <Shuffle className="w-3 h-3" />
              </button>
            </div>
          )}

          {activeGoal && (
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="sm:col-span-1 block">
                <span className="text-xs text-slate-500 block mb-1">{copy.successLabel}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={successPercent}
                  onChange={(e) => setSuccessPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] text-emerald-300 font-mono"
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="text-xs text-slate-500 block mb-1">{copy.notesLabel}</span>
                <input
                  value={attemptNotes}
                  onChange={(e) => setAttemptNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] text-slate-300"
                />
              </label>
            </div>
          )}

          <button
            type="button"
            disabled={recording || !activeGoal}
            onClick={submitAttempt}
            className={`${LUX.btnEmerald} w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {recording ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListChecks className="w-4 h-4" />}
            {recording ? copy.recording : copy.record}
          </button>
        </>
      )}

      {error && <p className="text-xs text-rose-300">{error}</p>}

      <div>
        <p className="text-xs font-bold text-slate-400 mb-2">{copy.sessionAttempts}</p>
        {loadingAttempts ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : attempts.length === 0 ? (
          <p className="text-xs text-slate-500">{copy.emptyAttempts}</p>
        ) : (
          <ul className="space-y-1 text-xs font-mono text-slate-400 max-h-32 overflow-y-auto">
            {attempts.map((a) => (
              <li key={a.id} className="flex justify-between gap-2 border-b border-white/[0.04] pb-1">
                <span className="truncate">{a.goalLabel}</span>
                <span className="text-emerald-400 shrink-0">
                  #{a.attemptNumber} · {a.successPercent}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showWeeklySummary && weeklySummary.length > 0 && (
        <div className="p-4 rounded-xl bg-[#0d0d10]/90 border border-[#c9a962]/15">
          <p className="text-xs font-bold text-[#e8c872] mb-3">{copy.weeklyReport}</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 text-start">
                <th className="pb-2 font-normal">{copy.goal}</th>
                <th className="pb-2 font-normal">{copy.attempts}</th>
                <th className="pb-2 font-normal">{copy.average}</th>
              </tr>
            </thead>
            <tbody>
              {weeklySummary.map((row) => (
                <tr key={row.goalLabel} className="border-t border-white/[0.04]">
                  <td className="py-1.5 text-slate-300 truncate max-w-[140px]">{row.goalLabel}</td>
                  <td className="py-1.5 text-slate-400">{row.attemptCount}</td>
                  <td className="py-1.5 text-emerald-400">
                    {row.averageSuccess != null ? `${row.averageSuccess}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
````

## File: src/components/parent/ParentBiometricGate.jsx
````javascript
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScanFace, ShieldCheck, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useBiometricScan } from '../../hooks/useBiometricScan';
import { SOVEREIGN_MATCH_CONFIDENCE } from '../../lib/biometricMatch';
import { tryParentMasterBypass, writeParentSession } from '../../lib/parentAccess';
import PlatformLogo from '../PlatformLogo';
import { LUX } from '../../lib/luxTheme';

export default function ParentBiometricGate({
  lang = 'ar',
  student,
  parentToken,
  onVerified,
}) {
  const [entering, setEntering] = useState(false);
  const matchHandledRef = useRef(false);

  const copy =
    lang === 'en'
      ? {
          title: 'Parent secure gate',
          subtitle: 'Face verification for your child only — no other records are shown',
          hint: 'Sovereign match ≥94.7% required',
          start: 'Start face verification',
          scanning: 'Scanning…',
          success: 'Verified — opening your dashboard',
          child: 'Child',
          tokenOk: 'Parent token accepted',
        }
      : {
          title: 'بوابة الأهل الآمنة',
          subtitle: 'تحقق بصمة الوجه لطفلك فقط — لا تُعرض سجلات أخرى',
          hint: 'مطلوب تطابق سيادي ≥94.7%',
          start: 'بدء التحقق بالوجه',
          scanning: 'جاري المسح…',
          success: 'تم التحقق — فتح لوحة الأهل',
          child: 'الطفل',
          tokenOk: 'رمز الأهل مقبول',
        };

  const handleMatch = useCallback(
    async (payload) => {
      if (matchHandledRef.current) return;
      if (payload.student?.id !== student?.id) return;
      matchHandledRef.current = true;
      setEntering(true);
      try {
        writeParentSession({
          token: parentToken,
          studentId: student.id,
          verified: true,
          verifiedAt: new Date().toISOString(),
          similarityPercent: payload.similarityPercent,
        });
        onVerified?.(payload);
      } finally {
        setEntering(false);
      }
    },
    [onVerified, parentToken, student?.id]
  );

  useEffect(() => {
    if (!student?.id || !parentToken || matchHandledRef.current) return;
    if (!tryParentMasterBypass({ token: parentToken, studentId: student.id })) return;
    matchHandledRef.current = true;
    onVerified?.({ masterBypass: true, similarityPercent: 100, student });
  }, [onVerified, parentToken, student]);

  const scan = useBiometricScan({
    lang,
    playChimeOnMatch: true,
    onSovereignMatch: handleMatch,
    selectedStudentId: student?.id ?? null,
    requireStudentSelection: true,
  });

  const busy = entering || scan.scanState === 'loading' || scan.scanState === 'scanning';

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={LUX.pageWrap}>
      <div className={LUX.pageWrapGradient} aria-hidden />
      <div className={`relative z-10 ${LUX.pageFlex} items-center justify-center p-6`}>
        <div className={`w-full max-w-lg ${LUX.glassCard} space-y-6`}>
          <div className="flex flex-col items-center text-center gap-3">
            <PlatformLogo lang={lang} className="w-16 h-16" iconClassName="w-14 h-14" />
            <h1 className={LUX.headingGold}>{copy.title}</h1>
            <p className={`${LUX.muted} text-sm max-w-md`}>{copy.subtitle}</p>
          </div>

          <div className={`rounded-2xl border ${LUX.borderGold} bg-[#0d0d10]/60 p-4 space-y-2`}>
            <div className={`flex items-center gap-2 text-xs ${LUX.emeraldAccent}`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {copy.tokenOk}
            </div>
            <p className="text-sm text-slate-300">
              {copy.child}:{' '}
              <span className="font-bold text-[#e8c872]">{student?.name ?? '—'}</span>
            </p>
            <p className={`text-xs font-mono ${LUX.muted}`}>{copy.hint}</p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.08] bg-black/40">
            <video
              ref={scan.videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {(scan.scanState === 'idle' || scan.scanState === 'error') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <ScanFace className="w-16 h-16 text-[#c9a962]/40" />
              </div>
            )}
            {scan.scanState === 'success' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/70 gap-2">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
                <p className="text-emerald-200 text-sm font-bold">{copy.success}</p>
              </div>
            )}
          </div>

          {scan.similarityPercent > 0 && scan.scanState !== 'success' && (
            <p className={`text-center text-sm font-mono ${LUX.goldMono}`}>
              {scan.similarityPercent.toFixed(1)}% / {SOVEREIGN_MATCH_CONFIDENCE}%
            </p>
          )}

          {scan.errorMsg && (
            <div className={`flex items-start gap-2 ${LUX.errorRose} text-sm`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{scan.errorMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {(scan.scanState === 'idle' || scan.scanState === 'error') && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  matchHandledRef.current = false;
                  scan.reset();
                  scan.startScan();
                }}
                className={LUX.btnGold}
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin inline" /> : copy.start}
              </button>
            )}
            {scan.scanState === 'error' && (
              <button type="button" onClick={scan.reset} className={LUX.btnGhost}>
                <RefreshCw className="w-4 h-4 inline" /> {lang === 'en' ? 'Reset' : 'إعادة'}
              </button>
            )}
            {busy && scan.scanState !== 'error' && (
              <div className={`flex items-center gap-2 ${LUX.goldMono} text-sm`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                {copy.scanning}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/parent/ParentDashboard.jsx
````javascript
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
````

## File: src/components/parent/ParentShell.jsx
````javascript
import { useCallback, useEffect, useState } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import {
  findStudentByParentToken,
  parseParentRouteToken,
  isParentSessionVerified,
  assertParentSubscription,
  clearParentSession,
  tryParentMasterBypass,
} from '../../lib/parentAccess';
import ParentBiometricGate from './ParentBiometricGate';
import ParentDashboard from './ParentDashboard';
import { LUX } from '../../lib/luxTheme';

export default function ParentShell({ lang: langProp = 'ar' }) {
  const [lang] = useState(langProp);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const routeToken = parseParentRouteToken();
    if (!routeToken) {
      setError(
        lang === 'en'
          ? 'Missing parent token in URL (?token=AUN-PRT-...)'
          : 'رمز الأهل مفقود في الرابط (?token=AUN-PRT-...)'
      );
      setLoading(false);
      return;
    }
    try {
      const row = await findStudentByParentToken(routeToken);
      if (!row) {
        setError(
          lang === 'en'
            ? 'Invalid or unregistered parent token'
            : 'رمز الأهل غير صالح أو غير مسجّل'
        );
        setLoading(false);
        return;
      }
      if (!assertParentSubscription(row)) {
        setError(
          lang === 'en'
            ? 'Subscription is not active — activate your plan first'
            : 'الاشتراك غير مفعّل — فعّل الباقة أولاً'
        );
        setLoading(false);
        return;
      }
      setToken(routeToken);
      setStudent(row);
      tryParentMasterBypass({ token: routeToken, studentId: row.id });
      setVerified(isParentSessionVerified(routeToken, row.id));
    } catch {
      setError(lang === 'en' ? 'Connection error' : 'خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    clearParentSession();
    setVerified(false);
  };

  const copy =
    lang === 'en'
      ? { loading: 'Verifying parent token…' }
      : { loading: 'جاري التحقق من رمز الأهل…' };

  if (loading) {
    return (
      <div className={`${LUX.page} flex flex-col items-center justify-center gap-4`}>
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
        <p className={LUX.muted}>{copy.loading}</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className={`${LUX.page} flex flex-col items-center justify-center p-6 text-center gap-4`}>
        <KeyRound className="w-12 h-12 text-rose-400/60" />
        <p className="text-rose-300 max-w-md">{error}</p>
        <p className={`text-xs ${LUX.muted} font-mono`}>?token=AUN-PRT-XXXXXXXX-XXXXXXXX</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <ParentBiometricGate
        lang={lang}
        student={student}
        parentToken={token}
        onVerified={() => setVerified(true)}
      />
    );
  }

  return (
    <ParentDashboard
      lang={lang}
      student={student}
      parentToken={token}
      onLogout={handleLogout}
    />
  );
}
````

## File: src/components/PaymentCheckoutButton.jsx
````javascript
import { useState, useEffect } from 'react';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { startTapCheckout } from '../lib/paymentClient';
import { CHECKOUT_PLAN_OPTIONS, getPlanPricing, DEFAULT_CHECKOUT_PLAN } from '../lib/paymentPlans';
import { PLAN_LABELS } from '../lib/plans';

/**
 * Secure Tap checkout trigger — plan/amount resolved server-side.
 */
export default function PaymentCheckoutButton({
  lang = 'ar',
  studentId,
  plan: initialPlan = DEFAULT_CHECKOUT_PLAN,
  flow = 'enrollment',
  customer,
  showPlanPicker = true,
  className = '',
  onError,
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    fetch('/api/payment/status', { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((d) => setMockMode(Boolean(d.mockPaymentsEnabled)))
      .catch(() => {});
  }, []);

  const copy =
    lang === 'en'
      ? {
          pay: 'Pay securely online',
          paying: 'Opening secure checkout…',
          plan: 'Choose plan',
          secured: 'Tap Payments · 3DS · PCI compliant',
          mockSecured: 'Mock Payment · Preview QA · no real charge',
          errConfig: 'Online payment not configured yet — use activation code or contact admin.',
        }
      : {
          pay: 'السداد الآمن عبر الإنترنت',
          paying: 'جاري فتح صفحة الدفع الآمنة…',
          plan: 'اختر الباقة',
          secured: 'Tap Payments · 3DS · متوافق PCI',
          mockSecured: 'Mock Payment · Preview QA · بدون خصم حقيقي',
          errConfig: 'الدفع الإلكتروني غير مفعّل بعد — استخدم كود التفعيل أو تواصل مع الإدارة.',
        };

  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;
  const pricing = getPlanPricing(plan);

  const handlePay = async () => {
    if (!studentId || busy) return;
    setBusy(true);
    setLocalError('');
    try {
      await startTapCheckout({ studentId, plan, flow, customer });
    } catch (err) {
      const msg = err?.message || copy.errConfig;
      const friendly = msg.includes('TAP_NOT_CONFIGURED') ? copy.errConfig : msg;
      setLocalError(friendly);
      onError?.(friendly);
      setBusy(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showPlanPicker && (
        <div>
          <p className="text-[10px] font-mono text-slate-500 mb-2 text-center">{copy.plan}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CHECKOUT_PLAN_OPTIONS.map((code) => {
              const p = getPlanPricing(code);
              const active = plan === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPlan(code)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'border-[#c9a962]/60 bg-[#c9a962]/15 text-[#e8c872]'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {labels[code]} · {p.amount} {p.currency}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={busy || !studentId}
        onClick={handlePay}
        className="w-full py-4 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white font-black text-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
        {busy ? copy.paying : `${copy.pay} · ${pricing.amount} ${pricing.currency}`}
      </button>

      <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500/80" /> {mockMode ? copy.mockSecured : copy.secured}
      </p>

      {localError && (
        <p className="text-xs text-amber-400/90 text-center bg-amber-500/10 border border-amber-400/25 rounded-lg py-2 px-3">
          {localError}
        </p>
      )}
    </div>
  );
}
````

## File: src/components/PaymentReturn.jsx
````javascript
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react';
import {
  readPaymentPending,
  verifyPaymentReturn,
  savePaymentComplete,
  clearPaymentPending,
} from '../lib/paymentClient';
import { PLAN_LABELS, landingForPlan } from '../lib/plans';
import { useAuth } from '../lib/auth';
import PlatformLogo from './PlatformLogo';

/**
 * /payment/return — post-Tap redirect handler.
 * Webhook activates first; this page verifies and stores session for enrollment resume.
 */
export default function PaymentReturn({ lang = 'ar' }) {
  const { patchSession } = useAuth();
  const [state, setState] = useState('loading');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const copy =
    lang === 'en'
      ? {
          title: 'Payment confirmation',
          verifying: 'Verifying secure payment…',
          success: 'Payment confirmed — subscription active',
          tokenNote: 'Parent access token issued automatically',
          continueEnrollment: 'Continue to biometric enrollment',
          continueApp: 'Return to Aunak',
          failed: 'Payment could not be verified',
          retry: 'Try again from activation gate',
        }
      : {
          title: 'تأكيد السداد',
          verifying: 'جاري التحقق من عملية الدفع الآمنة…',
          success: 'تم تأكيد السداد — الاشتراك Active',
          tokenNote: 'تم إصدار رمز ولي الأمر parent_access_token تلقائياً',
          continueEnrollment: 'متابعة تسجيل البصمة',
          continueApp: 'العودة إلى عونك',
          failed: 'تعذّر التحقق من عملية الدفع',
          retry: 'أعد المحاولة من بوابة التفعيل',
        };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get('studentId') || readPaymentPending()?.studentId;
      const plan = params.get('plan') || readPaymentPending()?.plan;
      const flow = params.get('flow') || readPaymentPending()?.flow || 'enrollment';
      const chargeId =
        params.get('tap_id') ||
        params.get('chargeId') ||
        params.get('charge_id') ||
        readPaymentPending()?.chargeId;

      if (!studentId) {
        if (!cancelled) {
          setState('error');
          setError('STUDENT_ID_MISSING');
        }
        return;
      }

      if (!chargeId) {
        if (!cancelled) {
          setState('error');
          setError(lang === 'en' ? 'Missing charge reference — wait for webhook or retry.' : 'مرجع الدفع مفقود — انتظر Webhook أو أعد المحاولة.');
        }
        return;
      }

      try {
        const data = await verifyPaymentReturn({ chargeId, studentId, plan, flow });
        if (cancelled) return;
        savePaymentComplete({ ...data, studentId, plan, flow, chargeId });
        clearPaymentPending();
        if (flow === 'gate') {
          patchSession({
            subscriptionActivated: true,
            subscriptionRaw: 'Active',
            plan: data.plan ?? plan,
            subscriptionPending: false,
            landingSection: data.landing ?? landingForPlan(data.plan ?? plan),
          });
        }
        setResult(data);
        setState('success');
      } catch (e) {
        if (cancelled) return;
        setState('error');
        setError(e?.message || copy.failed);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [lang, copy.failed, patchSession]);

  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;
  const flow = result?.flow || new URLSearchParams(window.location.search).get('flow') || 'enrollment';

  const continueHref = flow === 'enrollment' ? '/?enrollment=1&payment=done' : '/';

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0a0a0c] text-slate-300 flex flex-col items-center justify-center p-6"
    >
      <PlatformLogo lang={lang} className="w-16 h-20 mb-8 rounded-xl" />

      <div className="max-w-md w-full rounded-3xl bg-[#12121a]/95 border border-[#c9a962]/30 p-8 text-center shadow-[0_0_64px_rgba(201,169,98,0.15)]">
        <h1 className="text-xl font-bold text-[#e8c872] mb-6">{copy.title}</h1>

        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">{copy.verifying}</p>
          </>
        )}

        {state === 'success' && result && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-emerald-200 mb-2">{copy.success}</p>
            <p className="text-sm font-mono text-[#e8c872] mb-1">
              {labels[result.plan] ?? result.plan}
            </p>
            <p className="text-xs text-slate-500 mb-6">{copy.tokenNote}</p>
            <a
              href={continueHref}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white font-bold"
            >
              {flow === 'enrollment' ? copy.continueEnrollment : copy.continueApp}
              <ArrowRight className="w-4 h-4" />
            </a>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <p className="text-sm text-rose-300 mb-4">{error || copy.failed}</p>
            <a href="/" className="text-sm text-slate-400 hover:text-slate-200 underline">
              {copy.retry}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/PostActivationBiometric.jsx
````javascript
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ScanFace,
  ArrowLeft,
  Ban,
} from 'lucide-react';
import {
  fetchStudents,
  saveStudentFaceBiometric,
  createCameraAccessPermission,
  promoteStudentStatus,
} from '../lib/airtable';
import {
  captureStableDescriptor,
  descriptorToJson,
  ensureBiometricModels,
  assertFaceUniqueInRegistry,
  FACE_DUPLICATE_BLOCKED,
} from '../lib/biometricMatch';
import { useBiometricScan } from '../hooks/useBiometricScan';
import { activateSovereignBiometricLogin } from '../lib/sovereignLogin';
import { useAuth } from '../lib/auth';
import { LUX } from '../lib/luxTheme';
import SovereignMasterBypassPanel from './SovereignMasterBypassPanel';
import { isMasterBypassActive } from '../lib/sovereignMasterBypass';

function BiometricVerifyStep({ recordId, referenceDescriptorJson, lang, onVerified }) {
  const { login } = useAuth();
  const startedRef = useRef(false);

  const copy =
    lang === 'en'
      ? {
          title: 'Sovereign identity verification',
          hint: 'Full-registry anti-spoof check — face must match capture',
          scanning: 'Verifying against sovereign registry',
          retry: 'Retry',
        }
      : {
          title: 'التحقق السيادي من الهوية',
          hint: 'فحص anti-spoof على السجل الكامل — يجب مطابقة اللقطة',
          scanning: 'جاري التحقق مقابل السجل السيادي',
          retry: 'إعادة المحاولة',
        };

  const handleMatch = useCallback(
    async (payload) => {
      const session = await activateSovereignBiometricLogin(payload, login, lang);
      if (session) onVerified?.(session);
    },
    [lang, login, onVerified]
  );

  const scan = useBiometricScan({
    lang,
    selectedStudentId: recordId,
    requireStudentSelection: true,
    playChimeOnMatch: true,
    enrollmentMode: true,
    enrollmentReferenceDescriptor: referenceDescriptorJson,
    onSovereignMatch: handleMatch,
  });

  useEffect(() => {
    if (!recordId || !referenceDescriptorJson || startedRef.current) return;
    startedRef.current = true;
    const frame = requestAnimationFrame(() => scan.startScan());
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, referenceDescriptorJson]);

  return (
    <div className="max-w-lg mx-auto bg-[#12121a]/70 backdrop-blur-xl border border-emerald-400/25 rounded-3xl p-6">
      <div className="text-center mb-4">
        <ScanFace className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-emerald-300">{copy.title}</h2>
        <p className="text-sm text-slate-400 mt-2">{copy.hint}</p>
      </div>
      <div className="aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black mb-4 relative">
        <video ref={scan.videoRef} className="w-full h-full object-cover mirror" playsInline autoPlay muted />
        {scan.scanState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          </div>
        )}
      </div>
      {(scan.scanState === 'scanning' || scan.scanState === 'loading') && (
        <p className="text-center text-sm font-mono text-[#e8c872]">
          {copy.scanning} — {scan.similarityPercent.toFixed(1)}%
        </p>
      )}
      {scan.scanState === 'error' && (
        <>
          <p className="text-center text-rose-300 text-sm mb-3">{scan.errorMsg}</p>
          <button
            type="button"
            onClick={() => {
              startedRef.current = false;
              scan.reset();
              requestAnimationFrame(() => {
                startedRef.current = true;
                scan.startScan();
              });
            }}
            className="w-full py-2.5 rounded-xl border border-emerald-400/40 text-emerald-300 text-sm"
          >
            {copy.retry}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Post-payment biometric enrollment only — camera blocked until subscription active.
 * Anti-spoof: full Airtable registry scan before save.
 */
export default function PostActivationBiometric({
  lang = 'ar',
  recordId,
  studentName,
  onComplete,
  onBlocked,
}) {
  const [step, setStep] = useState('consent');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [descriptorJson, setDescriptorJson] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const copy =
    lang === 'en'
      ? {
          consentTitle: 'Biometric enrollment (post-payment)',
          consentBody:
            'After payment confirmation only — your face is scanned once and checked against the entire sovereign registry to prevent duplicate enrollment.',
          startCamera: 'Start secure camera',
          capture: 'Capture & verify uniqueness',
          saving: 'Scanning full registry...',
          blockedTitle: 'Registration blocked',
          back: 'Back',
          errCamera: 'Camera unavailable',
          errCapture: 'Could not capture stable face',
        }
      : {
          consentTitle: 'تسجيل البصمة (بعد السداد فقط)',
          consentBody:
            'بعد تأكيد السداد فقط — تُلتقط البصمة مرة واحدة وتُقارن بكامل السجل السيادي لمنع التسجيل المكرر والتحايل.',
          startCamera: 'تشغيل الكاميرا الآمنة',
          capture: 'التقاط والتحقق من عدم التكرار',
          saving: 'جاري فحص السجل الكامل...',
          blockedTitle: 'تم حظر التسجيل',
          back: 'رجوع',
          errCamera: 'تعذر تشغيل الكاميرا',
          errCapture: 'تعذر التقاط وجه مستقر',
        };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (step !== 'capture' || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => setError(copy.errCamera));
  }, [step, copy.errCamera]);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setStep('capture');
    } catch {
      setError(copy.errCamera);
    }
  };

  const captureAndValidate = async () => {
    if (!recordId || !videoRef.current) return;
    setBusy(true);
    setError('');
    try {
      await ensureBiometricModels();
      const stable = await captureStableDescriptor(videoRef.current);
      if (!stable?.descriptor) throw new Error(copy.errCapture);

      const registry = await fetchStudents();
      assertFaceUniqueInRegistry(registry, stable.descriptor, recordId, lang);

      const json = descriptorToJson(stable.descriptor);
      await saveStudentFaceBiometric(recordId, json);
      await createCameraAccessPermission(recordId, studentName?.trim() || '');
      try {
        await promoteStudentStatus(recordId);
      } catch {
        /* non-blocking */
      }

      setDescriptorJson(json);
      stopCamera();
      setStep('verify');
    } catch (e) {
      if (e?.code === FACE_DUPLICATE_BLOCKED) {
        setBlocked(true);
        setError(e.message);
        stopCamera();
        onBlocked?.(e);
      } else {
        setError(e?.message || copy.errCapture);
      }
    } finally {
      setBusy(false);
    }
  };

  if (blocked) {
    return (
      <div className="max-w-md mx-auto text-center rounded-3xl border-2 border-rose-500/50 bg-rose-950/30 p-8">
        <Ban className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-rose-300 mb-3">{copy.blockedTitle}</h2>
        <p className="text-sm text-rose-200/90 leading-relaxed">{error}</p>
        <ShieldAlert className="w-8 h-8 text-rose-400/60 mx-auto mt-6" />
        <SovereignMasterBypassPanel
          lang={lang}
          onUnlocked={() => {
            setBlocked(false);
            setError('');
            setStep('consent');
          }}
        />
      </div>
    );
  }

  if (step === 'verify' && descriptorJson) {
    return (
      <BiometricVerifyStep
        recordId={recordId}
        referenceDescriptorJson={descriptorJson}
        lang={lang}
        onVerified={onComplete}
      />
    );
  }

  if (step === 'capture') {
    return (
      <div className="max-w-lg mx-auto bg-[#12121a]/70 backdrop-blur-xl border border-emerald-400/25 rounded-3xl p-6">
        <div className="aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black mb-4">
          <video ref={videoRef} className="w-full h-full object-cover mirror" playsInline autoPlay muted />
        </div>
        <p className="text-xs text-amber-400/90 font-mono text-center mb-3">
          {lang === 'ar' ? '🔒 فحص anti-spoof — مقارنة بكامل قاعدة Airtable' : '🔒 Anti-spoof — full Airtable registry scan'}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={captureAndValidate}
          className={`${LUX.btnEmerald} w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
          {busy ? copy.saving : copy.capture}
        </button>
        {error && <p className="text-rose-300 text-sm mt-3 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center bg-[#12121a]/70 backdrop-blur-xl border border-emerald-400/25 rounded-3xl p-8">
      <ShieldCheck className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-emerald-300 mb-2">{copy.consentTitle}</h2>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{copy.consentBody}</p>
      {error && <p className="text-rose-300 text-sm mb-4">{error}</p>}
      <button type="button" onClick={startCamera} className={`${LUX.btnEmerald} px-8 py-3 rounded-xl font-bold`}>
        <Camera className="w-5 h-5 inline me-2" />
        {copy.startCamera}
      </button>
      {isMasterBypassActive() && (
        <p className="text-[10px] text-amber-400/80 font-mono mt-4">MASTER BYPASS · anti-spoof off</p>
      )}
      <SovereignMasterBypassPanel lang={lang} compact />
    </div>
  );
}
````

## File: src/components/SettlementConfirmModal.jsx
````javascript
import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchAccessControlByEmail } from '../lib/airtable';
import { verifySpecialistPin } from '../lib/settlementEngine';

export default function SettlementConfirmModal({
  lang = 'ar',
  open,
  onClose,
  onConfirm,
  reconciliation,
  sessionDate,
  specialistEmail,
  specialistName,
  studentName,
  sessionFee,
  saving,
  sovereign,
}) {
  const [pin, setPin] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [pinError, setPinError] = useState('');
  const [accessRecord, setAccessRecord] = useState(null);

  const claimCount = reconciliation?.claimCount ?? 0;
  const ledgerCount = reconciliation?.ledgerCount ?? 0;
  const afterSeal = claimCount + 1;
  const matched = ledgerCount === claimCount;

  const t = {
    ar: {
      title: 'تأكيد تسوية الجلسة',
      date: 'التاريخ',
      specialist: 'الأخصائي',
      student: 'الطالب',
      yourClaims: 'مطالباتك اليوم',
      centerLedger: 'دفتر المركز',
      afterThis: 'بعد إغلاق هذه الجلسة',
      fee: 'مستحقات الجلسة',
      match: 'متطابق',
      mismatch: 'فرق — سيُزامَن تلقائياً بعد الختم',
      confirmLabel: 'أؤكد أن العدد صحيح ولا يمكن تعديله لاحقاً',
      pinLabel: 'رمز PIN (آخر 4 أرقام من رمز الوصول أو رمز التسوية)',
      pinRequired: 'أدخل PIN صحيحاً للأخصائي',
      pinInvalid: 'PIN غير صحيح',
      seal: 'إنهاء وختم الجلسة (Sealed)',
      cancel: 'إلغاء',
      sovereignSkip: 'تخطي PIN — اعتماد سيادي',
      sealedNote: 'الجلسة ستُختم Sealed — غير قابلة للتعديل',
    },
    en: {
      title: 'Session Settlement Confirmation',
      date: 'Date',
      specialist: 'Specialist',
      student: 'Student',
      yourClaims: 'Your claims today',
      centerLedger: 'Center ledger',
      afterThis: 'After closing this session',
      fee: 'Session fee',
      match: 'Matched',
      mismatch: 'Difference — auto-sync after seal',
      confirmLabel: 'I confirm the count is correct and cannot be changed later',
      pinLabel: 'PIN (last 4 of access token or settlement PIN)',
      pinRequired: 'Enter a valid specialist PIN',
      pinInvalid: 'Invalid PIN',
      seal: 'End & Seal Session',
      cancel: 'Cancel',
      sovereignSkip: 'Skip PIN — sovereign override',
      sealedNote: 'Session will be Sealed — immutable',
    },
  };
  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (!open || !specialistEmail) return;
    setPin('');
    setConfirmed(false);
    setPinError('');
    fetchAccessControlByEmail(specialistEmail).then(setAccessRecord).catch(() => setAccessRecord(null));
  }, [open, specialistEmail]);

  if (!open) return null;

  const handleSeal = () => {
    if (!confirmed) return;
    if (!sovereign) {
      if (!pin.trim()) {
        setPinError(copy.pinRequired);
        return;
      }
      if (!verifySpecialistPin(accessRecord, pin)) {
        setPinError(copy.pinInvalid);
        return;
      }
    }
    setPinError('');
    onConfirm({ pinVerified: !sovereign, pin: pin.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full rounded-3xl bg-[#12121a] border border-[#c9a962]/25 shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4 border-b border-[#c9a962]/15 pb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-200">{copy.title}</h3>
        </div>

        <div className="space-y-2 text-sm mb-4 font-mono">
          <p className="text-slate-500">{copy.date}: <span className="text-slate-300">{sessionDate}</span></p>
          <p className="text-slate-500">{copy.specialist}: <span className="text-[#e8c872]">{specialistName || specialistEmail}</span></p>
          <p className="text-slate-500">{copy.student}: <span className="text-slate-200">{studentName}</span></p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10">
            <p className="text-[10px] text-slate-500">{copy.yourClaims}</p>
            <p className="text-xl font-bold text-[#e8c872]">{claimCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10">
            <p className="text-[10px] text-slate-500">{copy.centerLedger}</p>
            <p className="text-xl font-bold text-[#e8c872]">{ledgerCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10">
            <p className="text-[10px] text-slate-500">{copy.afterThis}</p>
            <p className="text-xl font-bold text-emerald-400">{afterSeal}</p>
          </div>
        </div>

        <p className={`text-xs mb-3 flex items-center gap-2 ${matched ? 'text-emerald-400' : 'text-amber-400'}`}>
          {matched ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {matched ? copy.match : copy.mismatch}
        </p>

        <p className="text-xs text-slate-500 mb-4">{copy.fee}: {sessionFee || '—'}</p>

        <label className="flex items-start gap-2 text-xs text-slate-300 mb-4 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
          {copy.confirmLabel}
        </label>

        {!sovereign && (
          <div className="mb-4">
            <label className="text-xs text-slate-400 block mb-1">{copy.pinLabel}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(''); }}
              className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 font-mono text-center tracking-widest"
              placeholder="••••"
            />
            {pinError && <p className="text-xs text-rose-400 mt-1">{pinError}</p>}
          </div>
        )}

        <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-4">
          <Lock className="w-3 h-3" /> {copy.sealedNote}
        </p>

        <div className="flex gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">
            {copy.cancel}
          </button>
          <button
            type="button"
            disabled={saving || !confirmed}
            onClick={handleSeal}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {copy.seal}
          </button>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/SovereignCommandBar.jsx
````javascript
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useSovereignVoice } from "../hooks/useSovereignVoice";
import { LUX } from "../lib/luxTheme.js";

export default function SovereignCommandBar({ lang = "ar", enabled, onNavigate, onManualOverride, onDictateNote }) {
  const copy = {
    ar: {
      ready: "جاهز للتخاطب السيادي",
      listen: "استماع",
      stop: "إيقاف",
      secured: "محمي بيومترياً",
    },
    en: {
      ready: "Sovereign voice ready",
      listen: "Listen",
      stop: "Stop",
      secured: "Biometric secured",
    },
  }[lang] ?? { ready: "", listen: "", stop: "", secured: "" };

  const handleCommand = (cmd) => {
    if (!cmd) return;
    if (cmd.type === "navigate") onNavigate?.(cmd.section);
    if (cmd.type === "manualOverride") onManualOverride?.();
    if (cmd.type === "dictateNote") onDictateNote?.(cmd.text);
  };

  const voice = useSovereignVoice({
    enabled,
    lang,
    onCommand: handleCommand,
  });

  if (!enabled) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-400/25 bg-emerald-950/30 ${LUX.muted}`}>
      <span className="text-[10px] font-mono text-emerald-300 hidden lg:inline">{copy.ready}</span>
      <button
        type="button"
        onClick={voice.listening ? voice.stopListening : voice.startListening}
        disabled={!voice.supported}
        className={`${LUX.sovereignIconBtn} ${voice.listening ? LUX.sovereignIconBtnActive : ""}`}
        title={copy.secured}
      >
        {voice.listening ? <Loader2 className="w-4 h-4 animate-spin" /> : voice.supported ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 opacity-50" />}
      </button>
      {voice.lastTranscript && (
        <span className="text-[10px] font-mono text-slate-400 max-w-[120px] truncate">{voice.lastTranscript}</span>
      )}
    </div>
  );
}
````

## File: src/components/SovereignMasterBypassPanel.jsx
````javascript
import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import {
  activateMasterBypass,
  isMasterBypassActive,
  clearMasterBypass,
} from '../lib/sovereignMasterBypass';

/**
 * Dev-only unlock when anti-spoof blocks duplicate face during QA.
 */
export default function SovereignMasterBypassPanel({ lang = 'ar', onUnlocked, compact = false }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [active, setActive] = useState(() => isMasterBypassActive());

  const copy =
    lang === 'en'
      ? {
          title: 'Sovereign dev bypass',
          hint: 'Authorized team only — skips duplicate-face block for UI testing',
          placeholder: 'AUNAK-MASTER-2026',
          activate: 'Activate bypass',
          active: 'Bypass active — anti-spoof skipped',
          clear: 'Disable bypass',
          invalid: 'Invalid master key',
        }
      : {
          title: 'تخطي التطوير السيادي',
          hint: 'للفريق المعتمد فقط — يتخطى حظر الوجه المكرر لفحص الواجهات',
          placeholder: 'AUNAK-MASTER-2026',
          activate: 'تفعيل التخطي',
          active: 'التخطي مفعّل — anti-spoof متوقف',
          clear: 'إيقاف التخطي',
          invalid: 'مفتاح غير صالح',
        };

  const submit = (e) => {
    e?.preventDefault();
    if (activateMasterBypass(key)) {
      setActive(true);
      setError('');
      onUnlocked?.();
    } else {
      setError(copy.invalid);
    }
  };

  const deactivate = () => {
    clearMasterBypass();
    setActive(false);
    setKey('');
  };

  if (active) {
    return (
      <div
        className={`rounded-xl border border-amber-400/35 bg-amber-950/25 ${
          compact ? 'p-3' : 'p-4 mt-4'
        }`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <p className="text-xs text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {copy.active}
        </p>
        <button
          type="button"
          onClick={deactivate}
          className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 underline"
        >
          {copy.clear}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-xl border border-white/[0.08] bg-black/30 ${
        compact ? 'p-3 mt-4' : 'p-4 mt-6'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {!compact && (
        <>
          <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mb-1">
            <KeyRound className="w-3.5 h-3.5" />
            {copy.title}
          </p>
          <p className="text-[10px] text-slate-600 mb-3">{copy.hint}</p>
        </>
      )}
      <div className="flex gap-2">
        <input
          type="password"
          dir="ltr"
          autoComplete="off"
          value={key}
          onChange={(e) => {
            setKey(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          placeholder={copy.placeholder}
          className="flex-1 px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-xs font-mono text-amber-200/90"
        />
        <button
          type="submit"
          disabled={!key.trim()}
          className="px-3 py-2 rounded-lg bg-amber-600/80 text-[#0a0a0c] text-xs font-bold disabled:opacity-40"
        >
          {copy.activate}
        </button>
      </div>
      {error && <p className="text-[10px] text-rose-400 mt-2">{error}</p>}
    </form>
  );
}
````

## File: src/components/summer-academy/AcademyAnimatedIcon.jsx
````javascript
import { motion } from 'framer-motion';
import { TRACK_EMOJI } from '../../lib/academyTheme';

export default function AcademyAnimatedIcon({ trackId, size = 'lg', active = false }) {
  const emoji = TRACK_EMOJI[trackId] ?? '⭐';
  const sizeClass = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-2xl';

  return (
    <motion.div
      className={`${sizeClass} select-none inline-flex items-center justify-center`}
      style={{ perspective: 400 }}
      whileHover={{ scale: 1.15, rotateY: 15, rotateX: -8 }}
      whileTap={{ scale: 0.92, rotateY: -10 }}
      animate={
        active
          ? { y: [0, -8, 0], rotateZ: [0, 5, -5, 0] }
          : { y: [0, -4, 0] }
      }
      transition={{
        repeat: Infinity,
        duration: active ? 0.8 : 2.5,
        ease: 'easeInOut',
      }}
    >
      <span className="drop-shadow-md" role="img" aria-hidden>
        {emoji}
      </span>
    </motion.div>
  );
}
````

## File: src/components/summer-academy/AcademyBrainWheel.jsx
````javascript
import { motion } from 'framer-motion';
import { ACADEMY } from '../../lib/academyTheme';
import { TRACKS } from '../../lib/summerAcademyEngine';
import AcademyAnimatedIcon from './AcademyAnimatedIcon';

export default function AcademyBrainWheel({ lang, onSpin, result, brainMedia }) {
  const copy = {
    ar: { title: 'عجلة تنشيط الدماغ 🎡', sub: 'فيديوهات · مواقف · ألغاز', spin: 'دوّر العجلة!' },
    en: { title: 'Brain Wheel 🎡', sub: 'Videos · situations · riddles', spin: 'Spin!' },
  }[lang] ?? { title: 'عجلة 🎡', sub: '', spin: 'Spin!' };

  return (
    <motion.div
      className={`${ACADEMY.card} border-violet-200`}
      whileHover={{ boxShadow: '0 12px 40px rgba(139,92,246,0.2)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <AcademyAnimatedIcon trackId="brain" size="md" />
        <div>
          <h3 className="font-black text-violet-700">{copy.title}</h3>
          <p className="text-xs text-slate-500">{copy.sub}</p>
        </div>
      </div>
      <motion.button
        type="button"
        onClick={onSpin}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-400 to-purple-500 text-white font-black shadow-lg"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95, rotate: 360 }}
        transition={{ type: 'spring' }}
      >
        {copy.spin}
      </motion.button>
      {result && (
        <motion.p
          className="mt-4 text-center font-black text-violet-700"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {lang === 'ar' ? TRACKS[result].labelAr : TRACKS[result].labelEn}{' '}
          {TRACKS[result].icon}
        </motion.p>
      )}
      {brainMedia.length > 0 && (
        <div className="mt-4 space-y-1">
          {brainMedia.slice(0, 2).map((m) => (
            <p key={m.id} className="text-xs text-slate-600 truncate">
              🎬 {m.title}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
````

## File: src/components/summer-academy/AcademyLeaderboard.jsx
````javascript
import { motion } from 'framer-motion';
import { ACADEMY } from '../../lib/academyTheme';

export default function AcademyLeaderboard({ lang, rows }) {
  const copy = {
    ar: { title: 'لوحة الصدارة 🏆', sub: 'ترتيب الجهد — لا نقص!', empty: 'كن أول مغامر!' },
    en: { title: 'Leaderboard 🏆', sub: 'Effort rank — no deficit!', empty: 'Be first!' },
  }[lang];

  return (
    <div className={ACADEMY.card}>
      <h3 className={`${ACADEMY.title} text-xl mb-1`}>{copy.title}</h3>
      <p className={`${ACADEMY.subtitle} mb-4`}>{copy.sub}</p>
      {rows.length === 0 ? (
        <p className="text-slate-500">{copy.empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, 6).map((row, i) => (
            <motion.li
              key={row.studentId ?? row.displayName}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-orange-100"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-xl font-black text-orange-500 w-8">{row.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-slate-800">{row.displayName}</p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {row.tasksCompleted} {lang === 'ar' ? 'مهمة' : 'tasks'} · {row.totalXp} XP · {row.badge}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
````

## File: src/components/summer-academy/AcademyLiveBackground.jsx
````javascript
import { MOOD_GLOW, MOOD_GRADIENTS } from '../../lib/academyTheme';

export default function AcademyLiveBackground({ mood = 'idle', calm = false }) {
  const effectiveMood = calm ? 'idle' : mood;
  const gradient = MOOD_GRADIENTS[effectiveMood] ?? MOOD_GRADIENTS.idle;
  const glow = MOOD_GLOW[effectiveMood] ?? MOOD_GLOW.idle;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-1000 ease-in-out academy-bg-shift`}
      />
      <div
        className="absolute -top-1/4 -start-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl academy-orb-float opacity-70"
        style={{ background: glow }}
      />
      <div
        className="absolute -bottom-1/4 -end-1/4 w-[50vw] h-[50vw] rounded-full blur-3xl academy-orb-float-delay opacity-60"
        style={{ background: glow }}
      />
      <div
        className={`absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vh] rounded-full blur-[100px] academy-glow-pulse opacity-40`}
        style={{ background: glow }}
      />
      {mood === 'celebrate' && !calm && (
        <div className="absolute inset-0 academy-celebrate-burst pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="academy-confetti-piece"
              style={{
                left: `${(i * 17) % 100}%`,
                animationDelay: `${(i % 8) * 0.08}s`,
                background: ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a78bfa'][i % 5],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
````

## File: src/components/summer-academy/AcademyMascot.jsx
````javascript
import { motion } from 'framer-motion';

const EXPRESSIONS = {
  idle: { eyeScaleY: 1, mouth: 'M 38 58 Q 50 64 62 58', browY: 32 },
  talking: { eyeScaleY: 0.85, mouth: 'M 36 56 Q 50 68 64 56', browY: 31 },
  happy: { eyeScaleY: 0.6, mouth: 'M 34 54 Q 50 72 66 54', browY: 30 },
  wink: { eyeScaleY: 1, mouth: 'M 38 58 Q 50 66 62 58', browY: 32, wink: true },
  cheer: { eyeScaleY: 0.5, mouth: 'M 32 52 Q 50 76 68 52', browY: 28 },
};

export default function AcademyMascot({ expression = 'idle', isSpeaking = false, lang = 'ar' }) {
  const exp = EXPRESSIONS[isSpeaking ? 'talking' : expression] ?? EXPRESSIONS.idle;
  const name = lang === 'en' ? 'Nova' : 'نورا';

  return (
    <motion.div
      className="fixed bottom-4 end-4 z-40 flex flex-col items-center gap-1 pointer-events-none academy-mascot-shadow"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <motion.div
        animate={
          expression === 'cheer'
            ? { y: [0, -12, 0], rotate: [0, -5, 5, 0] }
            : isSpeaking
              ? { y: [0, -4, 0] }
              : { y: [0, -6, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: expression === 'cheer' ? 0.6 : isSpeaking ? 0.35 : 2.5,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        <svg width="100" height="110" viewBox="0 0 100 110" aria-hidden>
          <ellipse cx="50" cy="105" rx="28" ry="6" fill="rgba(0,0,0,0.08)" />
          <motion.g
            animate={expression === 'cheer' ? { rotate: [0, 8, -8, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ transformOrigin: '50px 55px' }}
          >
            <ellipse cx="50" cy="55" rx="38" ry="40" fill="#FFB347" />
            <ellipse cx="50" cy="58" rx="32" ry="34" fill="#FFC966" />
            <ellipse cx="28" cy="70" rx="10" ry="14" fill="#FFB347" transform="rotate(-20 28 70)" />
            <ellipse cx="72" cy="70" rx="10" ry="14" fill="#FFB347" transform="rotate(20 72 70)" />
            <circle cx="38" cy="48" r="6" fill="#fff" />
            <circle cx="62" cy="48" r="6" fill="#fff" />
            <motion.ellipse
              cx="38"
              cy="48"
              rx="3"
              ry={3 * exp.eyeScaleY}
              fill="#2d3748"
              animate={{ scaleY: exp.eyeScaleY }}
            />
            {exp.wink ? (
              <path d="M 56 48 Q 62 48 68 48" stroke="#2d3748" strokeWidth="2.5" fill="none" />
            ) : (
              <motion.ellipse
                cx="62"
                cy="48"
                rx="3"
                ry={3 * exp.eyeScaleY}
                fill="#2d3748"
                animate={{ scaleY: exp.eyeScaleY }}
              />
            )}
            <path d={exp.mouth} stroke="#e53e3e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="30" cy="58" rx="6" ry="4" fill="#ffb8b8" opacity="0.5" />
            <ellipse cx="70" cy="58" rx="6" ry="4" fill="#ffb8b8" opacity="0.5" />
          </motion.g>
        </svg>
      </motion.div>
      <span className="text-xs font-black text-pink-600 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
        {name}
      </span>
    </motion.div>
  );
}
````

## File: src/components/summer-academy/AcademyParentZone.jsx
````javascript
import { ChevronLeft, FileBarChart } from 'lucide-react';
import { ACADEMY } from '../../lib/academyTheme';

function ReportSection({ title, summary, children }) {
  return (
    <section className={`${ACADEMY.parentCard} mb-4`}>
      <h3 className={`${ACADEMY.parentTitle} mb-2`}>{title}</h3>
      <p className="text-sm text-slate-600 mb-3">{summary}</p>
      {children}
    </section>
  );
}

function LeapCertificate({ lang, cert }) {
  if (!cert) return null;
  return (
    <div className={`${ACADEMY.parentCard} border-amber-200`}>
      <h3 className={`${ACADEMY.parentTitle} text-center mb-2`}>{cert.title}</h3>
      <p className="text-center text-sm text-slate-500 mb-4">{cert.subtitle}</p>
      {!cert.unlocked ? (
        <p className="text-center text-slate-500 text-sm">
          {lang === 'ar' ? 'تُفتح بعد شهرين أو 20 مغامرة' : 'Unlocks after 2 months or 20 adventures'}
        </p>
      ) : (
        <>
          <p className="text-center font-bold text-emerald-700 mb-4">{cert.heroMessage}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {cert.comparisons.map(({ track, entryStars, currentStars, message }) => (
              <div key={track.id} className="p-3 rounded-xl bg-white border border-slate-100">
                <p className="font-bold text-sm">{lang === 'ar' ? track.labelAr : track.labelEn}</p>
                <p className="text-xs text-slate-400">{lang === 'ar' ? 'دخول' : 'Entry'}: {entryStars}</p>
                <p className="text-xs text-slate-400">{lang === 'ar' ? 'اليوم' : 'Now'}: {currentStars}</p>
                <p className="text-sm text-amber-600 mt-1">{message}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AcademyParentZone({ lang, report, cert, onBack }) {
  const copy = {
    ar: { back: 'المغامرات', weekly: 'التقرير الأسبوعي', silent: 'للأهل فقط' },
    en: { back: 'Adventures', weekly: 'Weekly Report', silent: 'Parents only' },
  }[lang];

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className={ACADEMY.btnGhost}>
        <ChevronLeft className="w-4 h-4 inline" /> {copy.back}
      </button>
      {report && (
        <ReportSection title={`📊 ${copy.weekly}`} summary={report.summary}>
          <p className="text-xs text-amber-600 font-mono mb-3">{report.silentNote ?? copy.silent}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {report.trackInsights?.map(({ track, trend }) => (
              <div key={track.id} className="p-2 rounded-lg bg-slate-100 text-sm">
                <span className="font-bold">{lang === 'ar' ? track.labelAr : track.labelEn}</span>
                <span className="text-slate-500 block text-xs">{trend}</span>
              </div>
            ))}
          </div>
        </ReportSection>
      )}
      <LeapCertificate lang={lang} cert={cert} />
    </div>
  );
}

export function AcademyParentButton({ lang, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`${ACADEMY.btnGhost} flex items-center gap-2`}>
      <FileBarChart className="w-4 h-4" />
      {lang === 'ar' ? 'منطقة الأهل' : 'Parent Zone'}
    </button>
  );
}
````

## File: src/components/summer-academy/AcademyShell.jsx
````javascript
import { LogOut, Home } from 'lucide-react';
import PlatformLogo from '../PlatformLogo';
import AcademyLiveBackground from './AcademyLiveBackground';
import AcademyMascot from './AcademyMascot';
import { ACADEMY } from '../../lib/academyTheme';

export default function AcademyShell({
  lang,
  mood,
  calm = false,
  mascotExpression = 'idle',
  isSpeaking = false,
  showMascot = true,
  title,
  subtitle,
  onToggleLang,
  onLogout,
  children,
}) {
  return (
    <div className={ACADEMY.root} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <AcademyLiveBackground mood={mood} calm={calm} />
      {showMascot && !calm && (
        <AcademyMascot expression={mascotExpression} isSpeaking={isSpeaking} lang={lang} />
      )}

      <header className={ACADEMY.header}>
        <div className="flex items-center gap-3">
          <PlatformLogo lang={lang} className="h-9 w-auto" iconClassName="w-9 h-9" />
          <div>
            <h1 className={`${ACADEMY.title} text-lg md:text-xl`}>{title}</h1>
            <p className={ACADEMY.subtitle}>{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleLang} className={ACADEMY.btnGhost}>
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          <a href="/" className={`${ACADEMY.btnGhost} flex items-center gap-1`}>
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </a>
          <button type="button" onClick={onLogout} className={ACADEMY.btnGhost}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className={ACADEMY.main}>{children}</main>

      <footer className="relative z-10 text-center py-4 text-[10px] font-mono text-slate-500">
        /summer-academy · Live Experience
      </footer>
    </div>
  );
}
````

## File: src/components/summer-academy/AcademyTrackHub.jsx
````javascript
import { motion } from 'framer-motion';
import { ACADEMY, TRACK_ACADEMY_COLORS } from '../../lib/academyTheme';
import { TRACKS } from '../../lib/summerAcademyEngine';
import AcademyAnimatedIcon from './AcademyAnimatedIcon';

function TrackCard({ trackId, lang, done, onComplete, loading, onChallenge }) {
  const track = TRACKS[trackId];
  const colors = TRACK_ACADEMY_COLORS[trackId] ?? TRACK_ACADEMY_COLORS.arabic;

  return (
    <motion.div
      className={`rounded-2xl p-5 bg-gradient-to-br ${colors} border-2 bg-white/80 backdrop-blur-sm shadow-lg`}
      whileHover={{ scale: 1.03, y: -4 }}
      layout
    >
      <div className="flex items-center gap-3 mb-4">
        <AcademyAnimatedIcon trackId={trackId} active={!done} />
        <h4 className="font-black text-lg text-slate-800">
          {lang === 'ar' ? track.labelAr : track.labelEn}
        </h4>
      </div>
      {done ? (
        <p className="text-sm font-black text-emerald-600">⭐ {lang === 'ar' ? 'أنجزت!' : 'Done!'}</p>
      ) : (
        <motion.button
          type="button"
          disabled={loading}
          onClick={() => {
            onChallenge?.();
            onComplete(trackId);
          }}
          className={`${ACADEMY.btnPrimary} w-full text-sm py-3`}
          whileTap={{ scale: 0.95 }}
        >
          {lang === 'ar' ? '🎮 ابدأ!' : '🎮 Go!'}
        </motion.button>
      )}
    </motion.div>
  );
}

export default function AcademyTrackHub({ lang, trackIds, todayTasks, onComplete, loading, onChallenge }) {
  const copy = lang === 'ar' ? 'مسارات اليوم' : "Today's Tracks";

  return (
    <div className={`${ACADEMY.card} md:col-span-2`}>
      <h2 className={`${ACADEMY.title} text-xl mb-4`}>{copy}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {trackIds.map((id) => (
          <TrackCard
            key={id}
            trackId={id}
            lang={lang}
            done={todayTasks.includes(id)}
            onComplete={onComplete}
            loading={loading}
            onChallenge={onChallenge}
          />
        ))}
      </div>
    </div>
  );
}
````

## File: src/components/summer-academy/AcademyWelcomeMission.jsx
````javascript
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { ACADEMY } from '../../lib/academyTheme';

export default function AcademyWelcomeMission({
  lang,
  mission,
  question,
  onStart,
  onAnswer,
  lastMessage,
  onReplay,
}) {
  if (!question) {
    return (
      <motion.div
        className={`${ACADEMY.card} text-center max-w-lg mx-auto`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.span
          className="text-6xl block mb-4"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          🚀
        </motion.span>
        <h2 className={ACADEMY.title}>{mission.title}</h2>
        <p className={`${ACADEMY.subtitle} mb-6`}>{mission.subtitle}</p>
        {lastMessage && <p className="text-lg font-bold text-emerald-600 mb-4">{lastMessage}</p>}
        <button type="button" className={ACADEMY.btnPrimary} onClick={onStart}>
          {mission.start}
        </button>
      </motion.div>
    );
  }

  const step = mission.questions.indexOf(question);

  return (
    <motion.div
      className={`${ACADEMY.card} max-w-xl mx-auto`}
      key={step}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-pink-500">
          {lang === 'ar' ? `🎮 ${step + 1}/${mission.questions.length}` : `🎮 ${step + 1}/${mission.questions.length}`}
        </span>
        <button
          type="button"
          onClick={() => onReplay?.(question.prompt)}
          className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
          aria-label={lang === 'ar' ? 'أعد السؤال' : 'Replay question'}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xl font-black text-slate-700 mb-6 text-center">{question.prompt}</p>
      <div className="grid gap-3">
        {question.options.map((opt, i) => (
          <motion.button
            key={opt}
            type="button"
            onClick={() => onAnswer(i)}
            className={ACADEMY.btnOption}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
````

## File: src/components/tawasul/TawasulGate.jsx
````javascript
import { useState } from 'react';
import { KeyRound, Loader2, MessageCircle } from 'lucide-react';
import PlatformLogo from '../PlatformLogo';
import { useAuth } from '../../lib/auth';
import { verifyTawasulSpecialistToken } from '../../lib/tawasulAuth';
import { TAWASUL_COPY } from '../../lib/tawasulConfig';

export default function TawasulGate({ lang = 'ar' }) {
  const { login } = useAuth();
  const [token, setToken] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const copy = TAWASUL_COPY[lang] ?? TAWASUL_COPY.ar;

  const submit = async (e) => {
    e?.preventDefault();
    if (!token.trim() || state === 'verifying') return;
    setState('verifying');
    setError('');
    try {
      const session = await verifyTawasulSpecialistToken(token);
      if (session) login(session);
      else {
        setState('error');
        setError(copy.tokenInvalid);
      }
    } catch (err) {
      setState('error');
      setError(err?.message ?? copy.tokenInvalid);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1222] via-[#12121a] to-[#0a0a0c] flex items-center justify-center p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-[#12121a]/90 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <div className="flex flex-col items-center gap-3 mb-8">
          <MessageCircle className="w-10 h-10 text-cyan-400" />
          <PlatformLogo lang={lang} className="h-10 w-auto" />
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-300 to-teal-400">
            {copy.platform}
          </h1>
          <p className="text-xs text-slate-500 text-center">{copy.tagline}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-bold text-slate-300">{copy.specialistGate}</label>
          <div className="relative">
            <KeyRound className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 start-3" />
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={copy.tokenHint}
              className="w-full rounded-xl border border-white/10 bg-black/30 py-3 ps-10 pe-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={!token.trim() || state === 'verifying'}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-l from-cyan-500 to-teal-500 text-white disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {state === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {copy.specialistGate}
          </button>
        </form>
      </div>
    </div>
  );
}
````

## File: src/components/TriplePortalCards.jsx
````javascript
import { TRIPLE_PORTAL_META } from '../lib/tripleAccessProtocol';

export default function TriplePortalCards({ lang = 'ar', portalLinks, compact = false }) {
  if (!portalLinks) return null;

  const roles = ['parent', 'child', 'specialist'];

  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} mt-4`}>
      {roles.map((role) => {
        const meta = TRIPLE_PORTAL_META[role];
        const href = portalLinks[role];
        if (!href) return null;
        return (
          <a
            key={role}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-white/[0.06] border border-white/15 hover:border-[#c9a962]/40 transition-all text-center"
          >
            <span className="text-2xl block mb-1">{meta.emoji}</span>
            <span className="text-xs font-bold text-slate-200 block">
              {meta.label[lang] ?? meta.label.ar}
            </span>
            <span className="text-[9px] font-mono text-slate-500 break-all mt-1 block">
              {portalLinks.tokens?.[role]?.slice(0, 18)}…
            </span>
          </a>
        );
      })}
    </div>
  );
}
````

## File: src/hooks/useAcademyMood.js
````javascript
import { useCallback, useEffect, useRef, useState } from 'react';
import { ACADEMY_MOODS } from '../lib/academyTheme';
import { playSuccessChime, canPlaySovereignAudio } from '../lib/sovereignAudio';

const CELEBRATE_MS = 1500;

export function useAcademyMood({ initial = ACADEMY_MOODS.idle } = {}) {
  const [mood, setMoodState] = useState(initial);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const setMood = useCallback(
    (next, { autoIdleMs } = {}) => {
      clearTimer();
      setMoodState(next);
      if (autoIdleMs != null) {
        timerRef.current = setTimeout(() => setMoodState(ACADEMY_MOODS.idle), autoIdleMs);
      }
    },
    [clearTimer]
  );

  const toIdle = useCallback(() => setMood(ACADEMY_MOODS.idle), [setMood]);
  const toThinking = useCallback(() => setMood(ACADEMY_MOODS.thinking), [setMood]);
  const toChallenge = useCallback(() => setMood(ACADEMY_MOODS.challenge), [setMood]);

  const celebrate = useCallback(() => {
    setMood(ACADEMY_MOODS.celebrate, { autoIdleMs: CELEBRATE_MS });
    if (canPlaySovereignAudio()) playSuccessChime();
  }, [setMood]);

  return {
    mood,
    setMood,
    toIdle,
    toThinking,
    toChallenge,
    celebrate,
    isCelebrate: mood === ACADEMY_MOODS.celebrate,
  };
}
````

## File: src/hooks/useAcademyVoice.js
````javascript
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cancelAcademySpeech,
  enqueueAcademySpeech,
  isAcademyVoiceUnlocked,
  scriptAssessmentDone,
  scriptEncouragement,
  scriptTaskComplete,
  scriptWelcome,
  scriptWheelSpin,
  unlockAcademyVoice,
} from '../lib/academyVoice';

/**
 * Voice-First companion for Summer Academy (Nora / Nova).
 * Disabled in parent zone when muted=true.
 */
export function useAcademyVoice({ lang = 'ar', studentName, enabled = true, muted = false } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeRef = useRef(enabled && !muted);

  useEffect(() => {
    activeRef.current = enabled && !muted;
    if (muted) cancelAcademySpeech();
  }, [enabled, muted]);

  useEffect(() => () => cancelAcademySpeech(), []);

  const speak = useCallback(
    (text, opts = {}) => {
      if (!activeRef.current || !text) return;
      enqueueAcademySpeech(text, {
        lang,
        ...opts,
        onStart: () => {
          setIsSpeaking(true);
          opts.onStart?.();
        },
        onEnd: () => {
          setIsSpeaking(false);
          opts.onEnd?.();
        },
      });
    },
    [lang]
  );

  const unlock = useCallback(() => {
    unlockAcademyVoice();
  }, []);

  const onWelcomeStart = useCallback(() => {
    unlock();
    speak(scriptWelcome(studentName, lang));
  }, [studentName, lang, speak, unlock]);

  const onQuestionShown = useCallback(
    (question) => {
      if (question?.prompt) speak(question.prompt);
    },
    [speak]
  );

  const onAnswer = useCallback(() => {
    speak(scriptEncouragement(lang));
  }, [lang, speak]);

  const onTaskComplete = useCallback(() => {
    speak(scriptTaskComplete(lang));
  }, [lang, speak]);

  const onWheelSpin = useCallback(() => {
    speak(scriptWheelSpin(lang));
  }, [lang, speak]);

  const onAssessmentDone = useCallback(() => {
    speak(scriptAssessmentDone(lang));
  }, [lang, speak]);

  const replay = useCallback(
    (text) => {
      if (!isAcademyVoiceUnlocked()) unlock();
      speak(text);
    },
    [speak, unlock]
  );

  return {
    isSpeaking,
    unlock,
    speak,
    replay,
    cancel: cancelAcademySpeech,
    onWelcomeStart,
    onQuestionShown,
    onAnswer,
    onTaskComplete,
    onWheelSpin,
    onAssessmentDone,
  };
}
````

## File: src/hooks/useActiveStudentMetrics.js
````javascript
import { useEffect, useState } from "react";
import { loadStudentById } from "../hooks/useHarmonyEngine";
import { detectGazeNeutralityCondition } from "../lib/sovereignProtocol";

/** Active student row + gaze trigger for neural observers. */
export function useActiveStudentMetrics(user) {
  const studentId = user?.activeStudentId ?? user?.childId ?? null;
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setStudent(null);
      return undefined;
    }
    let cancelled = false;
    loadStudentById(studentId)
      .then((row) => {
        if (!cancelled) setStudent(row);
      })
      .catch(() => {
        if (!cancelled) setStudent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const gazeTrigger = detectGazeNeutralityCondition(student);

  const abcDefaults = {
    intensity: Number(student?.behaviorIntensity) || 1,
    frequency: 1,
    duration: 1,
  };

  return { student, gazeTrigger, abcDefaults };
}
````

## File: src/hooks/useBiometricScan.js
````javascript
import { useState, useRef, useCallback, useEffect } from "react";
import {
  fetchStudents,
  hasActiveCameraPermission,
  parseHarmonyScore,
  saveStudentFaceBiometric,
  createCameraAccessPermission,
  studentNeedsReferenceCapture,
  REFERENCE_CAPTURE_APPROVED_STATUS,
} from "../lib/airtable";
import {
  detectFaceDescriptor,
  ensureBiometricModels,
  matchStudentByFaceDescriptor,
  matchLiveToReference,
  captureStableDescriptor,
  descriptorToJson,
  getStudentFaceDescriptor,
  assertFaceUniqueInRegistry,
  FACE_DUPLICATE_BLOCKED,
  SOVEREIGN_MATCH_CONFIDENCE,
  ENROLLMENT_MATCH_CONFIDENCE,
} from "../lib/biometricMatch";
import { playSuccessChime } from "../lib/sovereignAudio";
import { deriveChildCode } from "../lib/auth";
import { resolveEnrollmentAccess } from "../lib/plans";
import { getStudentEnrollmentStatus } from "../lib/sovereignLogin";

const DETECT_INTERVAL_MS = 500;
const MAX_SCAN_MS = 45000;
const ENROLLMENT_MAX_SCAN_MS = 25000;
const MIN_FACE_SCORE = 0.5;

export function useBiometricScan({
  lang = "ar",
  onSovereignMatch,
  playChimeOnMatch = true,
  selectedStudentId = null,
  requireStudentSelection = false,
  /** JSON descriptor from same-session capture — skips Airtable round-trip. */
  enrollmentReferenceDescriptor = null,
  enrollmentMode = false,
} = {}) {
  const [scanState, setScanState] = useState("idle");
  const [similarityPercent, setSimilarityPercent] = useState(0);
  const [faceScore, setFaceScore] = useState(0);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const runningRef = useRef(false);
  const scanStartedAtRef = useRef(0);
  const studentsRef = useRef([]);
  const referenceCaptureRef = useRef(false);
  const referenceCaptureSavingRef = useRef(false);
  const enrollmentReferenceRef = useRef(enrollmentReferenceDescriptor);

  useEffect(() => {
    enrollmentReferenceRef.current = enrollmentReferenceDescriptor;
  }, [enrollmentReferenceDescriptor]);

  const messages = {
    ar: {
      errorCamera: "فشل في التعرف - الكاميرا مغلقة أو الطالب غير مسجل",
      errorModel: "فشل تحميل نماذج التعرف. تحقق من الاتصال بالإنترنت.",
      errorRegistryEmpty: "لا توجد سجلات طلاب في Airtable",
      errorNoBiometric: "لا توجد بصمات وجه مسجلة",
      errorTimeout: "انتهت مهلة المسح دون مطابقة سيادية",
      errorPermission: "صلاحية الكاميرا غير مفعلة لهذا الطالب",
      errorMatch: "لم تتحقق عتبة الثقة السيادية (94.7%)",
      errorMismatch: "بصمة الوجه لا تطابق اللقطة المرجعية — أعد المحاولة",
      errorDuplicate: "رفض — الوجه مسجّل لطالب آخر. تم حظر العملية.",
      errorEnrollmentTimeout: "انتهت مهلة التحقق — تأكد من الإضاءة وواجه الكاميرا ثم أعد المحاولة",
      errorNoSelection: "اختر اسم الطالب أولاً قبل المسح البيومتري",
      errorStatusBlocked: "حالة الطالب غير نشطة — تواصل مع المركز",
      referenceCapture: "جاري التقاط اللقطة المرجعية الأولى وحفظها...",
      referenceCaptureFailed: "تعذر حفظ اللقطة المرجعية — أعد المحاولة",
    },
    en: {
      errorCamera: "Recognition failed — camera closed or student not registered",
      errorModel: "Failed to load recognition models. Check your internet connection.",
      errorRegistryEmpty: "No student records in Airtable",
      errorNoBiometric: "No enrolled face biometrics",
      errorTimeout: "Scan timed out without sovereign match",
      errorPermission: "Camera permission is not active for this student",
      errorMatch: "Sovereign confidence threshold (94.7%) not met",
      errorMismatch: "Face does not match the reference capture — try again",
      errorDuplicate: "Denied — face already registered to another student. Blocked.",
      errorEnrollmentTimeout: "Verification timed out — face the camera with good lighting and retry",
      errorNoSelection: "Select a student name before starting the biometric scan",
      errorStatusBlocked: "Student status inactive — contact the center",
      referenceCapture: "Capturing first smart reference frame and saving...",
      referenceCaptureFailed: "Could not save reference capture — try again",
    },
  };

  const copy = messages[lang] ?? messages.ar;

  const stopCamera = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const failScan = useCallback(
    (message) => {
      stopCamera();
      setMatchedStudent(null);
      setScanState("error");
      setErrorMsg(message || copy.errorCamera);
    },
    [stopCamera, copy.errorCamera]
  );

  const isCameraLive = useCallback(() => {
    const track = streamRef.current?.getVideoTracks?.()?.[0];
    return Boolean(track && track.readyState === "live" && !track.muted);
  }, []);

  const reset = useCallback(() => {
    stopCamera();
    setScanState("idle");
    setSimilarityPercent(0);
    setFaceScore(0);
    setMatchedStudent(null);
    setErrorMsg("");
    setPermissionDenied(false);
    referenceCaptureRef.current = false;
    referenceCaptureSavingRef.current = false;
  }, [stopCamera]);

  const selectedStudentRef = useRef(selectedStudentId);

  useEffect(() => {
    selectedStudentRef.current = selectedStudentId;
  }, [selectedStudentId]);

  const startScan = useCallback(async () => {
    if (requireStudentSelection && !selectedStudentRef.current) {
      failScan(copy.errorNoSelection);
      return;
    }

    setScanState("loading");
    setSimilarityPercent(0);
    setFaceScore(0);
    setMatchedStudent(null);
    setErrorMsg("");
    setPermissionDenied(false);

    let registry;
    try {
      registry = await fetchStudents();
    } catch {
      registry = [];
    }
    const list = Array.isArray(registry) ? registry : [];
    studentsRef.current = list;
    if (!list.length) {
      failScan(copy.errorRegistryEmpty);
      return;
    }

    const scanPool =
      requireStudentSelection && selectedStudentRef.current
        ? list.filter((row) => row?.id === selectedStudentRef.current)
        : list;

    const targetStudent =
      requireStudentSelection && selectedStudentRef.current
        ? list.find((row) => row?.id === selectedStudentRef.current) ?? null
        : null;

    const localReference = enrollmentMode ? enrollmentReferenceRef.current : null;

    const needsReference =
      !localReference &&
      Boolean(targetStudent) &&
      studentNeedsReferenceCapture(targetStudent);

    referenceCaptureRef.current = needsReference;

    if (!needsReference && !localReference) {
      const enrolled = scanPool.filter(
        (row) => getStudentFaceDescriptor(row) || row?.faceBiometric
      );
      if (!enrolled.length) {
        failScan(requireStudentSelection ? copy.errorMismatch : copy.errorNoBiometric);
        return;
      }
    }

    if (enrollmentMode && !localReference && targetStudent) {
      const stored = getStudentFaceDescriptor(targetStudent) || targetStudent?.faceBiometric;
      if (stored) enrollmentReferenceRef.current = stored;
    }

    try {
      await ensureBiometricModels();
    } catch {
      failScan(copy.errorModel);
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch {
      failScan(copy.errorCamera);
      return;
    }

    streamRef.current = stream;

    const attachVideo = async () => {
      if (!videoRef.current) {
        await new Promise((r) => requestAnimationFrame(r));
      }
      if (!videoRef.current) return false;
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => false);
      return isCameraLive();
    };

    if (!(await attachVideo())) {
      failScan(copy.errorCamera);
      return;
    }

    if (!isCameraLive()) {
      failScan(copy.errorCamera);
      return;
    }

    setScanState("scanning");
    runningRef.current = true;
    scanStartedAtRef.current = Date.now();

    const completeMatch = async (match, { referenceCapture = false } = {}) => {
      const minConfidence = enrollmentMode ? ENROLLMENT_MATCH_CONFIDENCE : SOVEREIGN_MATCH_CONFIDENCE;

      if (!referenceCapture && match.similarityPercent < minConfidence) {
        failScan(enrollmentMode ? copy.errorMismatch : copy.errorMatch);
        return;
      }

      if (!enrollmentMode && !referenceCapture) {
        const allowed = await hasActiveCameraPermission(match.student);
        if (!allowed) {
          try {
            await createCameraAccessPermission(match.student.id, match.student.name);
          } catch {
            /* try gate anyway after reference capture */
          }
          const allowedAfter = await hasActiveCameraPermission(match.student);
          if (!allowedAfter && !referenceCapture) {
            setPermissionDenied(true);
            setSimilarityPercent(match.similarityPercent);
            failScan(copy.errorPermission);
            return;
          }
        }
      }

      const enrollmentAccess = resolveEnrollmentAccess(
        getStudentEnrollmentStatus(match.student)
      );
      if (!enrollmentAccess.allowed) {
        failScan(copy.errorStatusBlocked);
        return;
      }

      runningRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const harmony = parseHarmonyScore(match.student.harmonyScore);
      const payload = {
        student: match.student,
        similarityPercent: match.similarityPercent,
        harmonyScore: harmony,
        childCode: deriveChildCode(match.student),
        referenceCapture,
      };

      setSimilarityPercent(match.similarityPercent);
      setMatchedStudent(payload);
      setScanState("success");
      if (playChimeOnMatch) playSuccessChime();
      onSovereignMatch?.(payload);
    };

    const maxScanMs = enrollmentMode ? ENROLLMENT_MAX_SCAN_MS : MAX_SCAN_MS;

    timerRef.current = setInterval(async () => {
      if (!runningRef.current || !videoRef.current) return;
      if (!isCameraLive()) {
        failScan(copy.errorCamera);
        return;
      }
      if (Date.now() - scanStartedAtRef.current > maxScanMs) {
        failScan(
          referenceCaptureRef.current
            ? copy.referenceCaptureFailed
            : enrollmentMode
              ? copy.errorEnrollmentTimeout
              : requireStudentSelection
                ? copy.errorMismatch
                : copy.errorTimeout
        );
        return;
      }

      if (referenceCaptureRef.current) {
        if (referenceCaptureSavingRef.current) return;
        let face;
        try {
          face = await detectFaceDescriptor(videoRef.current, MIN_FACE_SCORE);
        } catch {
          return;
        }
        if (!face) {
          setFaceScore(0);
          return;
        }
        setFaceScore(face.score);
        setScanState("scanning");
        setErrorMsg(copy.referenceCapture);

        referenceCaptureSavingRef.current = true;
        try {
          const stable = await captureStableDescriptor(videoRef.current);
          if (!stable?.descriptor) {
            referenceCaptureSavingRef.current = false;
            return;
          }
          const student =
            studentsRef.current.find((s) => s.id === selectedStudentRef.current) ?? targetStudent;
          if (!student?.id) {
            referenceCaptureSavingRef.current = false;
            failScan(copy.referenceCaptureFailed);
            return;
          }
          const descriptorJson = descriptorToJson(stable.descriptor);
          try {
            assertFaceUniqueInRegistry(
              studentsRef.current,
              stable.descriptor,
              student.id,
              lang
            );
          } catch (dupErr) {
            referenceCaptureSavingRef.current = false;
            failScan(
              dupErr?.code === FACE_DUPLICATE_BLOCKED ? dupErr.message : copy.errorDuplicate
            );
            return;
          }
          await saveStudentFaceBiometric(student.id, descriptorJson, {
            captureStatus: REFERENCE_CAPTURE_APPROVED_STATUS,
          });
          await createCameraAccessPermission(student.id, student.name);
          student.faceBiometric = descriptorJson;
          referenceCaptureRef.current = false;
          referenceCaptureSavingRef.current = false;
          await completeMatch(
            { student, similarityPercent: 100 },
            { referenceCapture: true }
          );
        } catch {
          referenceCaptureSavingRef.current = false;
          failScan(copy.referenceCaptureFailed);
        }
        return;
      }

      let face;
      try {
        face = await detectFaceDescriptor(videoRef.current, MIN_FACE_SCORE);
      } catch {
        return;
      }
      if (!face) {
        setFaceScore(0);
        return;
      }
      setFaceScore(face.score);

      const localRef = enrollmentMode ? enrollmentReferenceRef.current : null;
      if (localRef) {
        const result = matchLiveToReference(face.descriptor, localRef);
        if (result?.similarityPercent != null) {
          setSimilarityPercent(result.similarityPercent);
        }
        if (!result?.matched) return;

        const student =
          studentsRef.current.find((s) => s.id === selectedStudentRef.current) ?? targetStudent;
        if (!student?.id) {
          failScan(copy.errorMismatch);
          return;
        }
        await completeMatch({ student, similarityPercent: result.similarityPercent });
        return;
      }

      const matchId = requireStudentSelection ? selectedStudentRef.current : null;
      const match = matchStudentByFaceDescriptor(studentsRef.current, face.descriptor, matchId);
      if (!match?.student) {
        setSimilarityPercent(0);
        return;
      }

      if (requireStudentSelection && match.student.id !== selectedStudentRef.current) {
        failScan(copy.errorMismatch);
        return;
      }

      await completeMatch(match);
    }, DETECT_INTERVAL_MS);
  }, [failScan, isCameraLive, onSovereignMatch, playChimeOnMatch, copy, requireStudentSelection, enrollmentMode]);

  return {
    videoRef,
    scanState,
    similarityPercent,
    faceScore,
    matchedStudent,
    errorMsg,
    permissionDenied,
    startScan,
    stopCamera,
    reset,
    sovereignThreshold: SOVEREIGN_MATCH_CONFIDENCE,
  };
}
````

## File: src/hooks/useCrisisAlerts.js
````javascript
import { useEffect, useRef } from 'react';
import { playWarningPulse } from '../lib/sovereignAudio';

/** ABC risk equation: (I×2) + (F×1.5) + D */
export function computeRiskScore(intensity, frequency, duration) {
  return intensity * 2 + frequency * 1.5 + duration;
}

export const CRISIS_RISK_THRESHOLD = 15;
const REPEAT_MS = 25000;

export function useCrisisAlerts(intensity, frequency, duration) {
  const riskScore = computeRiskScore(intensity, frequency, duration);
  const isCritical = riskScore > CRISIS_RISK_THRESHOLD;
  const criticalRef = useRef(isCritical);

  useEffect(() => {
    criticalRef.current = isCritical;
    if (!isCritical) return undefined;
    playWarningPulse();
    const interval = setInterval(() => {
      if (criticalRef.current) playWarningPulse();
    }, REPEAT_MS);
    return () => clearInterval(interval);
  }, [isCritical]);

  return { riskScore, isCritical };
}
````

## File: src/hooks/useGazeNeutralityObserver.js
````javascript
import { useEffect, useRef, useState } from "react";
import { playTypewriterEffect } from "../lib/sovereignAudio";
import { GAZE_HOLD_MS } from "../lib/sovereignProtocol";

const COPY = {
  ar: {
    alert: "تنبيه حياد النظرة",
    body: ">> رصد انخفاض في التتبع البصري... يُنصح بنشاط جذب انتباه فوري قبل استكمال المهمة الأكاديمية.",
  },
  en: {
    alert: "Gaze Neutrality Alert",
    body: ">> Visual tracking drop detected... immediate attention-capture activity recommended before resuming the academic task.",
  },
};

const GAZE_DIM_CLASS = "lux-gaze-dim";

function setGazeDim(on) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(GAZE_DIM_CLASS, Boolean(on));
}

/**
 * Gaze Neutrality observer — 5s hold + typewriter + ambient dim when triggered.
 */
export function useGazeNeutralityObserver({ active, triggerCondition, lang = "ar", disableDim = false }) {
  const copy = COPY[lang] ?? COPY.ar;
  const [visible, setVisible] = useState(false);
  const [typedAlert, setTypedAlert] = useState("");
  const armedRef = useRef(false);

  const shouldArm = Boolean(active) && Boolean(triggerCondition);

  useEffect(() => {
    if (!shouldArm) {
      armedRef.current = false;
      setVisible(false);
      setTypedAlert("");
      if (!disableDim) setGazeDim(false);
      return undefined;
    }

    if (armedRef.current) return undefined;

    const holdTimer = setTimeout(() => {
      if (armedRef.current) return;
      armedRef.current = true;
      setVisible(true);
      if (!disableDim) setGazeDim(true);
      playTypewriterEffect(Math.min(copy.body.length, 24));
      setTypedAlert("");
      let i = 0;
      const typer = setInterval(() => {
        i += 1;
        setTypedAlert(copy.body.slice(0, i));
        if (i >= copy.body.length) clearInterval(typer);
      }, 38);
    }, GAZE_HOLD_MS);

    return () => clearTimeout(holdTimer);
  }, [shouldArm, copy.body, disableDim]);

  useEffect(() => () => {
    if (!disableDim) setGazeDim(false);
  }, [disableDim]);

  return { visible, typedAlert, alertTitle: copy.alert };
}
````

## File: src/hooks/useGoalEngine.js
````javascript
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createGoalAttempt,
  fetchSessionGoalAttempts,
  fetchWeeklyGoalAttempts,
} from "../lib/airtable";
import { mapGoalAttempt } from "../lib/airtableMappers";
import {
  buildApprovedGoalList,
  canSwitchGoal,
  nextAttemptNumber,
  newDynamicSessionId,
  suggestAlternateGoal,
  summarizeSessionAttempts,
  summarizeWeeklyAttempts,
  weekRangeIso,
} from "../lib/goalEngine";

export function useGoalEngine({
  lang = "ar",
  student,
  abcPlans = [],
  learningRecords = [],
  sessionId: sessionIdProp,
  specialistEmail = "",
