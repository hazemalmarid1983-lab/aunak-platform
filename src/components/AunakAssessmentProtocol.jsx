import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  Lock,
  Sparkles,
  Target,
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../lib/auth';
import { LUX } from '../lib/luxTheme';
import { getField } from '../lib/airtable';
import { STUDENT as SF } from '../lib/airtableFields';
import {
  OBSERVATION_SCALE,
  PROTOCOL_GUIDE_STEPS,
  PROTOCOL_ITEMS,
  PROTOCOL_PHASES,
  PROTOCOL_STATUS,
  WEAKNESS_TAGS,
  aggregateProtocol,
  composeProtocolReport,
  countAnswered,
  createProtocolSession,
  getItemsByDomain,
  isProtocolComplete,
  listProtocolDomains,
  suggestGoalsFromProtocol,
} from '../lib/assessmentProtocol';
import {
  hydrateProtocolFromStudentFields,
  pushProtocolToCloud,
  saveProtocolSession,
  sha256Hex,
} from '../lib/assessmentProtocolStore';
import { assignBankGoals } from '../lib/iepGoalAssignment';

const SCALE_ORDER = Object.values(OBSERVATION_SCALE);

export default function AunakAssessmentProtocol({ lang = 'ar' }) {
  const { students } = useStudents(lang);
  const { user } = useAuth();
  const ar = lang !== 'en';

  const activeId = user?.activeStudentId ?? user?.childId ?? null;
  const student = useMemo(
    () => (students || []).find((s) => s.id === activeId) ?? students?.[0] ?? null,
    [students, activeId]
  );

  const [session, setSession] = useState(null);
  const [domainIdx, setDomainIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [guideStep, setGuideStep] = useState(0);

  const domains = listProtocolDomains();
  const currentDomain = domains[domainIdx] || domains[0];
  const domainItems = currentDomain ? getItemsByDomain(currentDomain.id) : [];

  const copy = ar
    ? {
        title: 'بروتوكول التقييم الإجرائي الموحّد',
        subtitle:
          'دليل + استمارة اختيارية + تجميع ذكي + تقرير معتمد — مستقل عن التشخيص الطبي المرخّص',
        noStudent: 'اختر مستفيداً نشطاً من لوحة المتابعة أولاً',
        start: 'بدء / استئناف التقييم',
        guide: 'الدليل الإجرائي',
        assess: 'الاستمارة',
        report: 'التقرير',
        next: 'التالي',
        prev: 'السابق',
        toAssess: 'الانتقال للاستمارة',
        buildReport: 'تجميع النتائج وإعداد التقرير',
        seal: 'اعتماد التقرير (ختم المقيم)',
        sealed: 'معتمد — غير قابل للتعديل الرجعي',
        progress: 'التقدم',
        weaknesses: 'نقاط ضعف ظاهرة (اختياري)',
        itemNote: 'ملاحظة البند (اختياري)',
        assessorNotes: 'ملاحظات المقيم العامة',
        suggestGoals: 'اقتراح أهداف من البنك حسب الأولويات',
        applyGoals: 'اعتماد الأهداف المقترحة في الخطة',
        cloudOk: '· وُثّق مركزياً',
        cloudFail: '· حُفظ محلياً',
        incomplete: 'أكمل جميع البنود قبل التجميع',
        disclaimer:
          'هذا مسار تشغيلي موحّد للمراكز لسد فجوة غياب بروتوكول وزاري واضح. ليس بديلاً عن المقاييس السريرية المرخّصة.',
      }
    : {
        title: 'Unified Operational Assessment Protocol',
        subtitle:
          'Guide + choice form + smart aggregation + sealed report — independent of licensed medical diagnosis',
        noStudent: 'Select an active beneficiary from the follow-up board first',
        start: 'Start / resume assessment',
        guide: 'Procedural guide',
        assess: 'Observation form',
        report: 'Report',
        next: 'Next',
        prev: 'Previous',
        toAssess: 'Go to form',
        buildReport: 'Aggregate results & draft report',
        seal: 'Seal report (assessor certify)',
        sealed: 'Sealed — no retroactive edit',
        progress: 'Progress',
        weaknesses: 'Observed weaknesses (optional)',
        itemNote: 'Item note (optional)',
        assessorNotes: 'General assessor notes',
        suggestGoals: 'Suggest goals from bank by priorities',
        applyGoals: 'Approve suggested goals on the IEP',
        cloudOk: '· synced centrally',
        cloudFail: '· saved locally',
        incomplete: 'Complete all items before aggregation',
        disclaimer:
          'Unified operational pathway for centers to fill the MoSD protocol gap. Not a substitute for licensed clinical instruments.',
      };

  const flash = (ok, text) => {
    setErr(ok ? '' : text);
    setMsg(ok ? text : '');
  };

  const persist = useCallback((next) => {
    setSession(next);
    saveProtocolSession(next);
  }, []);

  useEffect(() => {
    if (!student) {
      setSession(null);
      return;
    }
    const existing = hydrateProtocolFromStudentFields(student);
    if (existing) {
      setSession(existing);
      return;
    }
    const age = Number(getField(student, SF.age) ?? student.age);
    setSession(
      createProtocolSession({
        studentId: student.id,
        studentName: student.name,
        age: Number.isFinite(age) ? age : null,
        assessorName: user?.name || user?.email || '',
        assessorId: user?.email || '',
      })
    );
  }, [student?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const answered = session ? countAnswered(session.answers) : 0;
  const total = PROTOCOL_ITEMS.length;
  const complete = session ? isProtocolComplete(session.answers) : false;
  const aggregation = useMemo(
    () => (session ? aggregateProtocol(session.answers) : null),
    [session]
  );

  const setAnswer = (itemId, patch) => {
    if (!session || session.status === PROTOCOL_STATUS.sealed) return;
    const prev = session.answers[itemId] || { scale: null, weaknesses: [], note: '' };
    const answers = {
      ...session.answers,
      [itemId]: { ...prev, ...patch },
    };
    persist({
      ...session,
      answers,
      status: PROTOCOL_STATUS.in_progress,
      phase: PROTOCOL_PHASES.assess,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleWeakness = (itemId, tagId) => {
    const prev = session?.answers?.[itemId]?.weaknesses || [];
    const weaknesses = prev.includes(tagId) ? prev.filter((x) => x !== tagId) : [...prev, tagId];
    setAnswer(itemId, { weaknesses });
  };

  const goAssess = () => {
    if (!session) return;
    persist({
      ...session,
      phase: PROTOCOL_PHASES.assess,
      status: PROTOCOL_STATUS.in_progress,
    });
  };

  const buildReport = () => {
    if (!session) return;
    if (!isProtocolComplete(session.answers)) {
      flash(false, copy.incomplete);
      return;
    }
    const report = composeProtocolReport({
      lang,
      studentName: session.studentName,
      age: session.age,
      assessorName: session.assessorName,
      answers: session.answers,
      assessorNotes: session.assessorNotes,
    });
    persist({
      ...session,
      report,
      aggregation: report.aggregation,
      phase: PROTOCOL_PHASES.report,
      status: PROTOCOL_STATUS.draft_report,
    });
    flash(true, ar ? 'تم تجميع النتائج وإعداد مسودة التقرير' : 'Results aggregated into draft report');
  };

  const sealReport = async () => {
    if (!session?.report) return;
    setBusy(true);
    try {
      const payload = {
        studentId: session.studentId,
        report: session.report.bodyAr,
        aggregation: session.aggregation,
        answers: session.answers,
        sealedAt: new Date().toISOString(),
      };
      const immutableHash = await sha256Hex(JSON.stringify(payload));
      const next = {
        ...session,
        status: PROTOCOL_STATUS.sealed,
        phase: PROTOCOL_PHASES.sealed,
        sealedAt: payload.sealedAt,
        immutableHash,
      };
      saveProtocolSession(next);
      setSession(next);
      const cloud = await pushProtocolToCloud(next);
      flash(
        true,
        copy.sealed + (cloud.ok ? copy.cloudOk : cloud.error ? copy.cloudFail : '')
      );
    } finally {
      setBusy(false);
    }
  };

  const applySuggestedGoals = async () => {
    if (!session?.aggregation || !student) return;
    setBusy(true);
    try {
      const goals = suggestGoalsFromProtocol({
        age: session.age,
        aggregation: session.aggregation,
        limit: 6,
      });
      const res = await assignBankGoals({
        studentId: student.id,
        goalIds: goals.map((g) => g.id),
        teacherId: user?.email || '',
        teacherName: user?.name || '',
        severity: session.aggregation.supportNeedHint,
      });
      if (!res.ok) {
        flash(false, res.error);
        return;
      }
      flash(
        true,
        (ar ? 'اعتُمدت أهداف مقترحة من نتيجة التقييم' : 'Suggested goals approved from assessment') +
          (res.cloudSynced ? copy.cloudOk : '')
      );
    } finally {
      setBusy(false);
    }
  };

  if (!student) {
    return (
      <div className={`${LUX.card} p-8 text-center text-slate-400`}>
        <ClipboardList className="w-10 h-10 mx-auto mb-3 text-[#c9a962]/70" />
        <p>{copy.noStudent}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
      </div>
    );
  }

  const phase = session.phase || PROTOCOL_PHASES.guide;
  const sealed = session.status === PROTOCOL_STATUS.sealed;

  return (
    <div className="space-y-6" dir={ar ? 'rtl' : 'ltr'}>
      <header className="space-y-2">
        <h2 className="text-xl font-bold text-[#e8c872] flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5" /> {copy.title}
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl">{copy.subtitle}</p>
        <p className="text-sm text-slate-300 font-medium">{student.name}</p>
        <p className="text-[11px] text-amber-200/80 border border-amber-500/20 rounded-xl px-3 py-2 bg-amber-500/5">
          {copy.disclaimer}
        </p>
      </header>

      {(msg || err) && (
        <div
          className={`text-sm rounded-xl px-4 py-3 border ${
            err
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          }`}
        >
          {err || msg}
        </div>
      )}

      {/* Phase tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          [PROTOCOL_PHASES.guide, copy.guide, BookOpenCheck],
          [PROTOCOL_PHASES.assess, copy.assess, ClipboardList],
          [PROTOCOL_PHASES.report, copy.report, FileText],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (sealed && id !== PROTOCOL_PHASES.report) {
                persist({ ...session, phase: PROTOCOL_PHASES.sealed });
                return;
              }
              if (id === PROTOCOL_PHASES.report && !session.report) {
                flash(false, copy.incomplete);
                return;
              }
              persist({
                ...session,
                phase: sealed && id === PROTOCOL_PHASES.report ? PROTOCOL_PHASES.sealed : id,
              });
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${
              phase === id || (sealed && id === PROTOCOL_PHASES.report && phase === PROTOCOL_PHASES.sealed)
                ? 'bg-[#c9a962]/15 border-[#c9a962]/50 text-[#e8c872]'
                : 'bg-white/[0.03] border-white/10 text-slate-400'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
        <span className="ms-auto text-[11px] font-mono text-slate-500 self-center">
          {copy.progress}: {answered}/{total}
        </span>
      </div>

      {/* GUIDE */}
      {(phase === PROTOCOL_PHASES.guide) && (
        <section className={`${LUX.card} p-5 space-y-4`}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PROTOCOL_GUIDE_STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setGuideStep(i)}
                className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold border ${
                  guideStep === i
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/10 text-slate-400'
                }`}
              >
                {i + 1}. {ar ? s.ar : s.en}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 min-h-[10rem]">
            <h3 className="text-base font-bold text-[#e8c872] mb-2">
              {ar ? PROTOCOL_GUIDE_STEPS[guideStep].ar : PROTOCOL_GUIDE_STEPS[guideStep].en}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {ar ? PROTOCOL_GUIDE_STEPS[guideStep].bodyAr : PROTOCOL_GUIDE_STEPS[guideStep].bodyEn}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={guideStep === 0}
              onClick={() => setGuideStep((n) => Math.max(0, n - 1))}
              className={`${LUX.btnGhost} text-xs px-3 py-2 rounded-xl disabled:opacity-40`}
            >
              <ChevronRight className={`w-4 h-4 inline ${ar ? '' : 'rotate-180'}`} /> {copy.prev}
            </button>
            {guideStep < PROTOCOL_GUIDE_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setGuideStep((n) => n + 1)}
                className={`${LUX.btnGold} text-xs px-4 py-2 rounded-xl`}
              >
                {copy.next} <ChevronLeft className={`w-4 h-4 inline ${ar ? '' : 'rotate-180'}`} />
              </button>
            ) : (
              <button type="button" onClick={goAssess} className={`${LUX.btnEmerald} text-xs px-4 py-2 rounded-xl`}>
                {copy.toAssess}
              </button>
            )}
          </div>
        </section>
      )}

      {/* ASSESS */}
      {phase === PROTOCOL_PHASES.assess && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {domains.map((d, i) => {
              const items = getItemsByDomain(d.id);
              const done = items.filter((it) => session.answers[it.id]?.scale).length;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDomainIdx(i)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold border ${
                    domainIdx === i
                      ? 'border-[#c9a962]/50 bg-[#c9a962]/15 text-[#e8c872]'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  {ar ? d.ar : d.en}{' '}
                  <span className="font-mono opacity-60">
                    {done}/{items.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {domainItems.map((item, idx) => {
              const ans = session.answers[item.id] || { scale: null, weaknesses: [], note: '' };
              return (
                <article
                  key={item.id}
                  className={`${LUX.card} p-4 space-y-3 border ${
                    ans.scale ? 'border-emerald-500/20' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-mono text-slate-500">
                        {idx + 1}/{domainItems.length}
                      </p>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">{ar ? item.ar : item.en}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{ar ? item.hintAr : item.hintEn}</p>
                    </div>
                    {ans.scale && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SCALE_ORDER.map((s) => {
                      const on = ans.scale === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={sealed}
                          onClick={() => setAnswer(item.id, { scale: s.id })}
                          className={`rounded-xl px-2.5 py-2 text-[11px] font-bold border transition-all ${
                            on
                              ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100 scale-[1.02]'
                              : 'border-white/10 text-slate-400 hover:border-white/25'
                          }`}
                        >
                          {ar ? s.ar : s.en}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 mb-1.5">{copy.weaknesses}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {WEAKNESS_TAGS.map((t) => {
                        const on = (ans.weaknesses || []).includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={sealed}
                            onClick={() => toggleWeakness(item.id, t.id)}
                            className={`rounded-lg px-2 py-1 text-[10px] border ${
                              on
                                ? 'border-amber-400/40 bg-amber-500/15 text-amber-100'
                                : 'border-white/10 text-slate-500'
                            }`}
                          >
                            {ar ? t.ar : t.en}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <input
                    disabled={sealed}
                    value={ans.note || ''}
                    onChange={(e) => setAnswer(item.id, { note: e.target.value.slice(0, 300) })}
                    placeholder={copy.itemNote}
                    className="w-full rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-xs text-slate-200"
                  />
                </article>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 sticky bottom-2 z-10 bg-[#0d0d10]/90 backdrop-blur rounded-2xl border border-white/10 p-3">
            <button
              type="button"
              disabled={domainIdx === 0}
              onClick={() => setDomainIdx((i) => Math.max(0, i - 1))}
              className={`${LUX.btnGhost} text-xs px-3 py-2 rounded-xl disabled:opacity-40`}
            >
              {copy.prev}
            </button>
            {domainIdx < domains.length - 1 ? (
              <button
                type="button"
                onClick={() => setDomainIdx((i) => i + 1)}
                className={`${LUX.btnGold} text-xs px-4 py-2 rounded-xl`}
              >
                {copy.next}
              </button>
            ) : (
              <button
                type="button"
                disabled={!complete || sealed}
                onClick={buildReport}
                className={`${LUX.btnEmerald} text-xs px-4 py-2 rounded-xl disabled:opacity-40 inline-flex items-center gap-1.5`}
              >
                <Sparkles className="w-3.5 h-3.5" /> {copy.buildReport}
              </button>
            )}
            <span className="ms-auto text-[11px] font-mono text-slate-500 self-center">
              {answered}/{total}
              {aggregation?.overallPercent != null ? ` · ~${aggregation.overallPercent}%` : ''}
            </span>
          </div>
        </section>
      )}

      {/* REPORT */}
      {(phase === PROTOCOL_PHASES.report || phase === PROTOCOL_PHASES.sealed) && session.report && (
        <section className="space-y-4">
          {aggregation && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className={`${LUX.card} p-4 text-center`}>
                <p className="text-3xl font-mono text-[#e8c872]">{aggregation.overallPercent ?? '—'}%</p>
                <p className="text-[10px] text-slate-500">{ar ? 'الملخص العام' : 'Overall'}</p>
              </div>
              <div className={`${LUX.card} p-4`}>
                <p className="text-[10px] text-slate-500 mb-2">{ar ? 'أولويات التدخل' : 'Priorities'}</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {aggregation.priorities.map((p) => (
                    <li key={p.domainId}>
                      {ar ? p.labelAr : p.labelEn} · {p.percent}%
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${LUX.card} p-4`}>
                <p className="text-[10px] text-slate-500 mb-2">{ar ? 'ضعف متكرر' : 'Top weaknesses'}</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {aggregation.topWeaknesses.length ? (
                    aggregation.topWeaknesses.map((w) => (
                      <li key={w.id}>
                        {ar ? w.ar : w.en} ×{w.count}
                      </li>
                    ))
                  ) : (
                    <li>—</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {!sealed && (
            <label className="block text-xs text-slate-400 space-y-1">
              <span>{copy.assessorNotes}</span>
              <textarea
                value={session.assessorNotes || ''}
                onChange={(e) => {
                  const assessorNotes = e.target.value;
                  const report = composeProtocolReport({
                    lang,
                    studentName: session.studentName,
                    age: session.age,
                    assessorName: session.assessorName,
                    answers: session.answers,
                    assessorNotes,
                  });
                  persist({ ...session, assessorNotes, report, aggregation: report.aggregation });
                }}
                rows={3}
                className="w-full rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-sm"
              />
            </label>
          )}

          <div className={`${LUX.card} p-5`}>
            <pre className="whitespace-pre-wrap text-xs text-slate-200 font-sans leading-relaxed">
              {ar ? session.report.bodyAr : session.report.bodyEn}
            </pre>
          </div>

          {sealed ? (
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
              <Lock className="w-4 h-4" /> {copy.sealed}
              {session.immutableHash && (
                <span className="font-mono text-[10px] text-slate-500">
                  {session.immutableHash.slice(0, 16)}…
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={sealReport}
              className={`${LUX.btnEmerald} px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2`}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {copy.seal}
            </button>
          )}

          {sealed && (
            <div className={`${LUX.card} p-4 space-y-3 border border-[#c9a962]/25`}>
              <p className="text-xs font-bold text-[#e8c872] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> {copy.suggestGoals}
              </p>
              <ul className="text-xs text-slate-300 space-y-1">
                {suggestGoalsFromProtocol({
                  age: session.age,
                  aggregation: session.aggregation,
                  limit: 6,
                }).map((g) => (
                  <li key={g.id}>• {ar ? g.ar : g.en}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={busy}
                onClick={applySuggestedGoals}
                className={`${LUX.btnGold} text-xs px-4 py-2 rounded-xl`}
              >
                {copy.applyGoals}
              </button>
            </div>
          )}
        </section>
      )}

      {(phase === PROTOCOL_PHASES.report || phase === PROTOCOL_PHASES.sealed) && !session.report && (
        <div className={`${LUX.card} p-6 text-center text-slate-400 text-sm`}>
          <p>{copy.incomplete}</p>
          <button type="button" onClick={goAssess} className={`${LUX.btnGold} mt-3 text-xs px-4 py-2 rounded-xl`}>
            {copy.toAssess}
          </button>
        </div>
      )}
    </div>
  );
}
