import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  Play,
  Sparkles,
  Target,
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../lib/auth';
import { getField } from '../lib/airtable';
import { STUDENT as SF } from '../lib/airtableFields';
import { LUX } from '../lib/luxTheme';
import {
  ASSESSMENT_PATHWAYS,
  CLINICAL_DOMAINS,
  CLINICAL_QUESTIONS,
  filterQuestions,
} from '../lib/clinicalQuestionBank';
import {
  composeClinicalReport,
  createClinicalSession,
  getFrequencyOptions,
  saveClinicalAnswer,
  sessionProgress,
} from '../lib/clinicalQuestionnaireEngine';
import {
  hydrateClinicalFromStudentFields,
  pushClinicalToCloud,
  upsertClinicalSession,
} from '../lib/clinicalQuestionnaireStore';

const TABS = ['review', 'questionnaire', 'progress', 'report'];

export default function AunakClinicalAssessment({ lang = 'ar' }) {
  const ar = lang !== 'en';
  const { students } = useStudents(lang);
  const { user } = useAuth();

  const activeId = user?.activeStudentId ?? user?.childId ?? null;
  const student = useMemo(
    () => (students || []).find((s) => s.id === activeId) ?? students?.[0] ?? null,
    [students, activeId]
  );

  const [tab, setTab] = useState('review');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [pathway, setPathway] = useState(ASSESSMENT_PATHWAYS.both);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const studentAge = student ? Number(getField(student.fields ?? {}, SF.age)) || null : null;
  const studentName = student?.name || '';

  const questions = useMemo(() => {
    if (!activeSession) return [];
    return CLINICAL_QUESTIONS.filter((q) => activeSession.questionIds.includes(q.id));
  }, [activeSession]);

  const currentQuestion = questions[questionIdx] ?? null;
  const freqOptions = getFrequencyOptions(lang);
  const progress = activeSession ? sessionProgress(activeSession) : { total: 0, answered: 0, pct: 0 };

  const copy = ar
    ? {
        title: 'الاستبيان السريري الشامل',
        subtitle: '36 بنداً · 8 مجالات · مسارات توحد / صعوبات تعلم / شامل',
        noStudent: 'اختر مستفيداً نشطاً من لوحة المتابعة أولاً',
        review: 'المراجعة',
        questionnaire: 'الاستبيان',
        progress: 'التقدم',
        report: 'التقرير',
        newSession: 'بدء تقييم جديد',
        resume: 'استكمال الجلسة',
        pathway: 'مسار التقييم',
        asd: 'طيف التوحد',
        ld: 'صعوبات التعلم',
        both: 'تقييم شامل',
        sessions: 'الجلسات',
        answers: 'إجابات',
        completion: 'الإكمال',
        generateReport: 'توليد التقرير',
        saveCloud: 'حفظ في السحابة',
        saved: 'تم الحفظ',
        next: 'التالي',
        prev: 'السابق',
        finish: 'إكمال الجلسة',
        selectAnswer: 'اختر إجابة قبل المتابعة',
        notes: 'ملاحظات سريرية',
        baseline: 'خط الأساس',
        current: 'الحالي',
        improvement: 'معدل التحسن',
        goals: 'الأهداف المحققة',
        bestDomain: 'أفضل مجال',
        domainScores: 'درجات المجالات',
        noSessions: 'لا توجد جلسات بعد — ابدأ تقييماً جديداً',
      }
    : {
        title: 'Comprehensive Clinical Questionnaire',
        subtitle: '36 items · 8 domains · ASD / LD / comprehensive pathways',
        noStudent: 'Select an active beneficiary from the follow-up board first',
        review: 'Review',
        questionnaire: 'Questionnaire',
        progress: 'Progress',
        report: 'Report',
        newSession: 'Start new assessment',
        resume: 'Resume session',
        pathway: 'Assessment pathway',
        asd: 'Autism spectrum',
        ld: 'Learning difficulties',
        both: 'Comprehensive',
        sessions: 'Sessions',
        answers: 'Answers',
        completion: 'Completion',
        generateReport: 'Generate report',
        saveCloud: 'Save to cloud',
        saved: 'Saved',
        next: 'Next',
        prev: 'Previous',
        finish: 'Complete session',
        selectAnswer: 'Select an answer before continuing',
        notes: 'Clinical notes',
        baseline: 'Baseline',
        current: 'Current',
        improvement: 'Improvement rate',
        goals: 'Goals achieved',
        bestDomain: 'Best domain',
        domainScores: 'Domain scores',
        noSessions: 'No sessions yet — start a new assessment',
      };

  useEffect(() => {
    if (!student?.id) return;
    setSessions(hydrateClinicalFromStudentFields(student));
  }, [student?.id]);

  const flash = useCallback((ok, text) => {
    if (ok) {
      setMsg(text);
      setErr('');
    } else {
      setErr(text);
      setMsg('');
    }
    window.setTimeout(() => {
      setMsg('');
      setErr('');
    }, 4000);
  }, []);

  const persistSession = useCallback(
    (session) => {
      upsertClinicalSession(session);
      setSessions((prev) => {
        const has = prev.some((s) => s.id === session.id);
        return has ? prev.map((s) => (s.id === session.id ? session : s)) : [session, ...prev];
      });
      setActiveSession(session);
    },
    []
  );

  const startSession = () => {
    if (!student?.id) return;
    const session = createClinicalSession({
      studentId: student.id,
      studentName,
      age: studentAge,
      assessmentType: pathway,
      language: lang,
      assessorName: user?.name || user?.email || '',
      assessorId: user?.email || '',
    });
    persistSession(session);
    setQuestionIdx(0);
    setReport(null);
    setTab('questionnaire');
    flash(true, ar ? `تم إنشاء جلسة (${session.questionIds.length} بند)` : `Session created (${session.questionIds.length} items)`);
  };

  const resumeSession = (session) => {
    setActiveSession(session);
    setQuestionIdx(Math.min(Object.keys(session.answers || {}).length, (session.questionIds?.length ?? 1) - 1));
    setTab('questionnaire');
  };

  const saveCurrentAnswer = (value) => {
    if (!activeSession || !currentQuestion) return;
    const res = saveClinicalAnswer(activeSession, {
      questionId: currentQuestion.id,
      value,
      note: clinicalNotes,
    });
    if (!res.ok) {
      flash(false, res.error);
      return;
    }
    persistSession(res.session);
  };

  const goNext = () => {
    const val = activeSession?.answers?.[currentQuestion?.id];
    if (val == null) {
      flash(false, copy.selectAnswer);
      return;
    }
    setQuestionIdx((i) => Math.min(i + 1, questions.length - 1));
    setClinicalNotes('');
  };

  const goPrev = () => setQuestionIdx((i) => Math.max(i - 1, 0));

  const finishSession = async () => {
    if (!activeSession || !student?.id) return;
    setBusy(true);
    try {
      const generated = composeClinicalReport({
        session: activeSession,
        questions,
        lang,
        clinicalNotes,
      });
      setReport(generated);
      const latest = upsertClinicalSession(activeSession).sessions ?? sessions;
      await pushClinicalToCloud(student.id, latest);
      setSessions(latest);
      setTab('report');
      flash(true, ar ? 'اكتملت الجلسة — التقرير جاهز' : 'Session complete — report ready');
    } finally {
      setBusy(false);
    }
  };

  const buildReport = () => {
    if (!activeSession) return;
    const generated = composeClinicalReport({
      session: activeSession,
      questions,
      lang,
      clinicalNotes,
    });
    setReport(generated);
    setTab('report');
  };

  const saveToCloud = async () => {
    if (!student?.id) return;
    setBusy(true);
    try {
      const res = await pushClinicalToCloud(student.id, sessions);
      flash(res.ok, res.ok ? copy.saved : res.error || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const progressChartData = useMemo(() => {
    const initial = Number(getField(student?.fields ?? {}, SF.initial_assessment_score)) || 35;
    const completed = sessions.filter((s) => s.status === 'completed');
    const latest = completed[0];
    if (!latest) {
      return { domains: [], improvement: 0, goalsAchieved: '0/0', bestDomain: '—' };
    }
    const qs = CLINICAL_QUESTIONS.filter((q) => latest.questionIds?.includes(q.id));
    const rep = composeClinicalReport({ session: latest, questions: qs, lang });
    const domains = Object.entries(rep.scores || {}).map(([id, score]) => ({
      id,
      label: ar ? CLINICAL_DOMAINS[id]?.ar : CLINICAL_DOMAINS[id]?.en,
      baseline: initial,
      current: 100 - (score ?? 0),
    }));
    const improvement =
      domains.length > 0
        ? Math.round(
            domains.reduce((s, d) => s + Math.max(0, d.current - d.baseline), 0) / domains.length
          )
        : 0;
    const best = [...domains].sort((a, b) => b.current - a.current)[0];
    return {
      domains,
      improvement,
      goalsAchieved: `${Math.min(completed.length * 2, 12)}/12`,
      bestDomain: best?.label ?? '—',
    };
  }, [sessions, student, lang, ar]);

  if (!student) {
    return (
      <div dir={ar ? 'rtl' : 'ltr'} className={`${LUX.page} p-8`}>
        <div className={`${LUX.card} p-8 text-center text-slate-400`}>
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-400" />
          {copy.noStudent}
        </div>
      </div>
    );
  }

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className={`${LUX.page} p-4 md:p-8`}>
      <header className={`${LUX.headerBar} rounded-2xl mb-6`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#e8c872]" />
            <div>
              <h1 className={LUX.titleGradient}>{copy.title}</h1>
              <p className={LUX.subtitle}>{copy.subtitle}</p>
              <p className="text-xs text-slate-500 mt-1">
                {studentName}
                {studentAge != null ? ` · ${studentAge}` : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {(msg || err) && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm ${err ? 'bg-rose-500/10 text-rose-200 border border-rose-400/30' : 'bg-emerald-500/10 text-emerald-200 border border-emerald-400/30'}`}
        >
          {err || msg}
        </div>
      )}

      <nav className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? LUX.navActiveGold : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {copy[t]}
          </button>
        ))}
      </nav>

      {tab === 'review' && (
        <section className={`${LUX.glassCard} p-5 space-y-4`}>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            <label className="block space-y-1.5">
              <span className="text-xs text-slate-500">{copy.pathway}</span>
              <select
                value={pathway}
                onChange={(e) => setPathway(e.target.value)}
                className={LUX.input}
              >
                <option value={ASSESSMENT_PATHWAYS.both}>{copy.both}</option>
                <option value={ASSESSMENT_PATHWAYS.asd}>{copy.asd}</option>
                <option value={ASSESSMENT_PATHWAYS.learning_difficulties}>{copy.ld}</option>
              </select>
            </label>
            <div className="flex items-end">
              <button type="button" onClick={startSession} className={`${LUX.btnGold} w-full`}>
                <Play className="w-4 h-4 inline me-2" />
                {copy.newSession}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {ar ? 'البنود المطابقة:' : 'Matching items:'}{' '}
            {filterQuestions({ assessmentType: pathway, ageInMonths: (studentAge ?? 6) * 12 }).length}
          </p>

          {sessions.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">{copy.noSessions}</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => {
                const p = sessionProgress(s);
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0d0d10] border border-white/10"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {s.createdAt?.slice(0, 16).replace('T', ' ')} · {s.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.answered}/{p.total} · {Math.round(p.pct)}%
                      </p>
                    </div>
                    <button type="button" onClick={() => resumeSession(s)} className={LUX.btnOutline}>
                      {copy.resume}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <button type="button" onClick={saveToCloud} disabled={busy} className={LUX.backLink}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null} {copy.saveCloud}
          </button>
        </section>
      )}

      {tab === 'questionnaire' && activeSession && currentQuestion && (
        <section className={`${LUX.glassCard} p-5 space-y-5`}>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {CLINICAL_DOMAINS[currentQuestion.domain]?.[ar ? 'ar' : 'en']}
            </span>
            <span>
              {questionIdx + 1} / {questions.length} · {Math.round(progress.pct)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#e8c872] transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 leading-relaxed">
            {ar ? currentQuestion.ar : currentQuestion.en}
          </h2>
          {(currentQuestion.hintAr || currentQuestion.hintEn) && (
            <p className="text-xs text-slate-500">
              {ar ? currentQuestion.hintAr : currentQuestion.hintEn}
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {freqOptions.map((opt) => {
              const selected = activeSession.answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => saveCurrentAnswer(opt.value)}
                  className={`p-3 rounded-xl border text-start text-sm transition-all ${selected ? 'border-[#e8c872]/60 bg-[#e8c872]/10 text-[#e8c872]' : 'border-white/10 bg-[#0d0d10] text-slate-300 hover:border-white/20'}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-500">{copy.notes}</span>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className={`${LUX.input} min-h-[80px]`}
              maxLength={500}
            />
          </label>
          <div className="flex flex-wrap gap-3 justify-between">
            <button type="button" onClick={goPrev} disabled={questionIdx === 0} className={LUX.btnOutline}>
              <ChevronRight className="w-4 h-4 inline rtl:rotate-180" /> {copy.prev}
            </button>
            {questionIdx < questions.length - 1 ? (
              <button type="button" onClick={goNext} className={LUX.btnGold}>
                {copy.next} <ChevronLeft className="w-4 h-4 inline rtl:rotate-180" />
              </button>
            ) : (
              <button type="button" onClick={finishSession} disabled={busy} className={LUX.btnGold}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <CheckCircle2 className="w-4 h-4 inline" />}{' '}
                {copy.finish}
              </button>
            )}
          </div>
        </section>
      )}

      {tab === 'progress' && (
        <section className={`${LUX.glassCard} p-5 space-y-6`}>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className={`${LUX.card} p-4`}>
              <BarChart3 className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-emerald-300">+{progressChartData.improvement}%</p>
              <p className="text-xs text-slate-500">{copy.improvement}</p>
            </div>
            <div className={`${LUX.card} p-4`}>
              <Target className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-blue-300">{progressChartData.goalsAchieved}</p>
              <p className="text-xs text-slate-500">{copy.goals}</p>
            </div>
            <div className={`${LUX.card} p-4`}>
              <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-lg font-bold text-purple-300">{progressChartData.bestDomain}</p>
              <p className="text-xs text-slate-500">{copy.bestDomain}</p>
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-400">{copy.domainScores}</h3>
          <div className="space-y-4">
            {progressChartData.domains.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{d.label}</span>
                  <span className="text-slate-500">
                    {copy.baseline} {d.baseline}% → {copy.current} {d.current}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
                  <div className="h-full bg-slate-600" style={{ width: `${d.baseline}%` }} />
                  <div className="h-full bg-[#e8c872]" style={{ width: `${Math.max(0, d.current - d.baseline)}%` }} />
                </div>
              </div>
            ))}
            {progressChartData.domains.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">{copy.noSessions}</p>
            )}
          </div>
        </section>
      )}

      {tab === 'report' && (
        <section className={`${LUX.glassCard} p-5 space-y-4`}>
          {!report && activeSession && (
            <button type="button" onClick={buildReport} className={LUX.btnGold}>
              <FileText className="w-4 h-4 inline me-2" />
              {copy.generateReport}
            </button>
          )}
          {report && (
            <>
              <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans max-h-[60vh] overflow-y-auto p-4 rounded-xl bg-[#0d0d10] border border-white/10">
                {ar ? report.bodyAr : report.bodyEn}
              </pre>
              {report.smartGoals?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#e8c872]">SMART</h3>
                  {report.smartGoals.map((g, i) => (
                    <div key={g.domain} className="p-3 rounded-xl bg-white/5 text-xs text-slate-400">
                      <strong className="text-slate-200">{i + 1}. </strong>
                      {ar ? g.goal : g.goalEn}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
