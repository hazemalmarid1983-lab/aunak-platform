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
