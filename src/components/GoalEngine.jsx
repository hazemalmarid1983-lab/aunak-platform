import { useState } from "react";
import { Target, Shuffle, Loader2, BrainCircuit, ListChecks } from "lucide-react";
import { useAirtableSection } from "../hooks/useAirtableData";
import { useGoalEngine } from "../hooks/useGoalEngine";
import { ENGINE_ID } from "../lib/goalEngine";
import { LUX } from "../lib/luxTheme.js";
import {
  SovereignTable,
  SovereignTableShell,
  SovereignTd,
  SovereignTh,
  SovereignThead,
  SovereignTr,
  TruncateTooltip,
} from "./ui/SovereignTable";

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
        <div className="p-4 rounded-xl bg-neutral-950 border border-slate-800/60">
          <p className="text-xs font-bold text-amber-500/80 uppercase tracking-[0.14em] mb-3">{copy.weeklyReport}</p>
          <SovereignTableShell>
            <SovereignTable className="text-xs">
              <SovereignThead>
                <tr>
                  <SovereignTh>{copy.goal}</SovereignTh>
                  <SovereignTh>{copy.attempts}</SovereignTh>
                  <SovereignTh>{copy.average}</SovereignTh>
                </tr>
              </SovereignThead>
              <tbody>
                {weeklySummary.map((row, i) => (
                  <SovereignTr key={row.goalLabel} index={i}>
                    <SovereignTd>
                      <TruncateTooltip text={row.goalLabel} maxWidthClass="max-w-[140px]" />
                    </SovereignTd>
                    <SovereignTd muted>{row.attemptCount}</SovereignTd>
                    <SovereignTd className="text-emerald-400">
                      {row.averageSuccess != null ? `${row.averageSuccess}%` : "—"}
                    </SovereignTd>
                  </SovereignTr>
                ))}
              </tbody>
            </SovereignTable>
          </SovereignTableShell>
        </div>
      )}
    </div>
  );
}
