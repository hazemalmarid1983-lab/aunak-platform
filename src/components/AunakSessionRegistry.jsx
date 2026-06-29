import { useMemo, useState, useEffect, useCallback } from "react";
import { FileText, BrainCircuit, ShieldCheck, Lock, Loader2, AlertTriangle } from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { useAuth, isSovereignOwner } from "../lib/auth";
import GoalEngine from "./GoalEngine";
import { newDynamicSessionId, verifyAun4611SessionAttestation } from "../lib/goalEngine";
import {
  updateStudentRecord,
  getDailyReconciliation,
  approveDailyReconciliation,
  setCenterLedgerCount,
  getField,
} from "../lib/airtable";
import { STUDENT as SF } from "../lib/airtableFields";
import { sealSessionClaim } from "../lib/settlementEngine";
import SettlementConfirmModal from "./SettlementConfirmModal";
import { playWarningPulse } from "../lib/sovereignAudio";
import { isAppStealthActive } from "../lib/studentPrivacy";
import { encryptSessionPayload } from "../lib/sovereignCrypto";
import { LUX } from '../lib/luxTheme.js';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AunakSessionRegistry({ lang = "ar" }) {
  const { students } = useStudents(lang);
  const { user, patchSession } = useAuth();
  const sovereign = isSovereignOwner(user);
  const specialistEmail = user?.email ?? "";
  const sessionDate = todayIsoDate();

  const activeId = user?.activeStudentId ?? user?.childId ?? null;
  const activeStudent = useMemo(
    () => (students || []).find((s) => s.id === activeId) ?? students?.[0] ?? null,
    [students, activeId]
  );

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [sessionFee, setSessionFee] = useState("");
  const [reconciliation, setReconciliation] = useState(null);
  const [ledgerInput, setLedgerInput] = useState("");
  const [ledgerSaving, setLedgerSaving] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const reloadReconciliation = useCallback(async () => {
    if (!specialistEmail) {
      setReconciliation(null);
      return;
    }
    const data = await getDailyReconciliation(sessionDate, specialistEmail, user?.name);
    setReconciliation(data);
    setLedgerInput(String(data?.ledgerCount ?? 0));
  }, [sessionDate, specialistEmail]);

  useEffect(() => {
    reloadReconciliation().catch(() => setReconciliation(null));
  }, [reloadReconciliation]);

  const aiReportFromStudent = useMemo(() => {
    const f = activeStudent?.fields ?? {};
    return getField(f, SF.ai_session_report) || null;
  }, [activeStudent]);

  const paymentFromStudent = useMemo(() => {
    const f = activeStudent?.fields ?? {};
    return getField(f, SF.payment_status) || null;
  }, [activeStudent]);

  useEffect(() => {
    const f = activeStudent?.fields ?? {};
    const feeRaw = getField(f, SF.session_fee);
    if (feeRaw != null && feeRaw !== "") {
      const n = Number(feeRaw);
      setSessionFee(Number.isFinite(n) ? String(n) : "");
    } else {
      setSessionFee("");
    }
  }, [activeStudent?.id, activeStudent?.fields]);

  const t = {
    ar: {
      title: "سجل الجلسات الذكي",
      subtitle: "القلب النابض للمنصة - إدارة 66 حقل بيانات سريرية ومالية مع التشفير السيادي",
      liveSession: "الجلسة السريرية الحية",
      liveRec: "● LIVE REC",
      beneficiary: "الطالب المستفيد",
      connecting: "جاري الاتصال بـ Airtable...",
      startTime: "وقت البدء التلقائي",
      notesLabel: "ملاحظات الجلسة السريرية (نص حر)",
      notesPlaceholder: "قم بتوثيق أحداث الجلسة، الاستجابات، وأي تغيرات سلوكية هنا...",
      aiReport: "التقرير المختصر بالذكاء الاصطناعي",
      aiReportEmpty: "لا يوجد تقرير AI في سجل الطالب — يُولَّد بعد حفظ الجلسة في Airtable.",
      security: "بروتوكولات الأمان السيادية",
      attachmentEncryption: "تشفير المرفقات",
      hiddenFields: "الحقول المالية والمخفية",
      stealthMode: "تم تفعيل \"وضع التخفي\"\nالبيانات محجوبة عن الأخصائي",
      sessionFee: "مستحقات الجلسة",
      paymentStatus: "حالة الدفع",
      paid: "مكتمل",
      encryptButton: "حفظ الملاحظات",
      endSession: "إنهاء الجلسة وتسويتها",
      sealed: "تم ختم الجلسة Sealed — غير قابلة للتعديل",
      saved: "تم حفظ الملاحظات",
      saveErr: "تعذر حفظ الملاحظات",
      reconciliation: "التسوية اليومية",
      specialistClaims: "مطالبات الأخصائي",
      centerLedger: "دفتر المركز",
      difference: "الفرق",
      mismatch: "تنبيه: عدم تطابق بين المطالبات ودفتر المركز",
      sovereignApproved: "معتمد سيادياً",
      pendingApproval: "بانتظار الاعتماد السيادي",
      ledgerCount: "عدد جلسات المركز",
      saveLedger: "حفظ العدد",
      approveReconciliation: "اعتماد التسوية",
      mismatchBlock: "لا يمكن التشفير حتى اعتماد التسوية السيادية",
      biometricRequired: "اعتراض مالي: محرك AUN-4611 لم يثبت حضور الطفل بيومترية حية",
    },
    en: {
      title: "Smart Session Registry",
      subtitle: "Platform core — 66 clinical and financial fields with sovereign encryption",
      liveSession: "Live Clinical Session",
      liveRec: "● LIVE REC",
      beneficiary: "Beneficiary Student",
      connecting: "Connecting to Airtable...",
      startTime: "Auto Start Time",
      notesLabel: "Clinical Session Notes (free text)",
      notesPlaceholder: "Document session events, responses, and behavioral changes here...",
      aiReport: "AI Executive Summary",
      aiReportEmpty: "No AI report on the student record — generated after saving the session in Airtable.",
      security: "Sovereign Security Protocols",
      attachmentEncryption: "Attachment Encryption",
      hiddenFields: "Financial & Hidden Fields",
      stealthMode: "Stealth mode active\nData hidden from specialist",
      sessionFee: "Session Fee",
      paymentStatus: "Payment Status",
      paid: "Completed",
      encryptButton: "Save Notes",
      endSession: "End Session & Settle",
      sealed: "Session Sealed — immutable",
      saved: "Notes saved",
      saveErr: "Could not save session notes",
      reconciliation: "Daily Reconciliation",
      specialistClaims: "Specialist Claims",
      centerLedger: "Center Ledger",
      difference: "Difference",
      mismatch: "Alert: claims vs center ledger mismatch",
      sovereignApproved: "Sovereign approved",
      pendingApproval: "Pending sovereign approval",
      ledgerCount: "Center session count",
      saveLedger: "Save count",
      approveReconciliation: "Approve reconciliation",
      mismatchBlock: "Encryption blocked until sovereign reconciliation approval",
      biometricRequired: "Financial intercept: AUN-4611 engine did not verify live child biometric presence",
    },
  };

  const copy = t[lang] ?? t.ar;
  const hasMismatch = Boolean(reconciliation?.hasMismatch);
  const sovereignApproved = Boolean(reconciliation?.sovereignApproved);
  const attestation = useMemo(
    () => verifyAun4611SessionAttestation({ user, activeStudent }),
    [user, activeStudent]
  );
  const biometricBlocked = !attestation.verified && !sovereign;
  const stealthOn = isAppStealthActive();
  const hideFinancial = stealthOn && !sovereign;
  const encryptBlocked = (hasMismatch && !sovereignApproved) || biometricBlocked;
  const liveSessionActive = Boolean(user?.sessionRegistryOpen);

  useEffect(() => {
    if (!user || user.dynamicSessionId || !patchSession) return;
    patchSession({ dynamicSessionId: newDynamicSessionId() });
  }, [user, user?.dynamicSessionId, patchSession]);

  const dynamicSessionId = user?.dynamicSessionId ?? null;

  const sessionStartDisplay = useMemo(() => {
    if (!user?.sessionStartedAt) return null;
    try {
      return new Date(user.sessionStartedAt).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [user?.sessionStartedAt, lang]);

  const approveSession = async () => {
    if (!activeStudent?.id) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const encryptedNotes = notes ? await encryptSessionPayload(notes, user) : "";
      await updateStudentRecord(activeStudent.id, {
        [SF.clinical_session_notes]: encryptedNotes || notes,
      });
      setSaveMsg(copy.saved);
    } catch (e) {
      setSaveMsg(e?.message || copy.saveErr);
    } finally {
      setSaving(false);
    }
  };

  const openSettlement = () => {
    const liveAttestation = verifyAun4611SessionAttestation({ user, activeStudent });
    if (!liveAttestation.verified && !sovereign) {
      playWarningPulse();
      setSaveMsg(copy.biometricRequired);
      return;
    }
    if (hasMismatch && !sovereignApproved && !sovereign) {
      playWarningPulse();
      setSaveMsg(copy.mismatchBlock);
      return;
    }
    setSettleOpen(true);
  };

  const confirmSettlement = async ({ pinVerified }) => {
    if (!activeStudent?.id) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const encryptedNotes = notes ? await encryptSessionPayload(notes, user) : "";
      await updateStudentRecord(activeStudent.id, {
        [SF.biometric_attendance_verified]: true,
      });
      const next = await sealSessionClaim({
        user,
        activeStudent,
        specialistEmail,
        sessionDate,
        sessionFee,
        notes,
        pinVerified,
      });
      setReconciliation(next);
      setLedgerInput(String(next?.ledgerCount ?? 0));
      setSettleOpen(false);
      patchSession?.({ sessionRegistryOpen: false });
      setSaveMsg(copy.sealed);
      try {
        await fetch("/api/settlement/seal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sealed: true, claimStatus: "Sealed" }),
        });
      } catch {
        /* non-blocking */
      }
    } catch (e) {
      setSaveMsg(e?.message || copy.saveErr);
    } finally {
      setSaving(false);
    }
  };

  const saveLedgerCount = async () => {
    setLedgerSaving(true);
    try {
      await setCenterLedgerCount(sessionDate, specialistEmail, ledgerInput);
      await reloadReconciliation();
    } finally {
      setLedgerSaving(false);
    }
  };

  const approveReconciliation = async () => {
    setLedgerSaving(true);
    try {
      await approveDailyReconciliation(sessionDate, specialistEmail);
      await reloadReconciliation();
    } finally {
      setLedgerSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-3">
          <FileText className="w-10 h-10" /> {copy.title}
        </h2>
        <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
              <h3 className="text-xl font-bold text-slate-300">{copy.liveSession}</h3>
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${liveSessionActive ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                {liveSessionActive ? copy.liveRec : "—"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-xs text-slate-500 mb-1 font-mono">{copy.beneficiary}</p>
                <p className="font-bold text-slate-200 text-lg">{activeStudent?.name || copy.connecting}</p>
                {activeId && <p className="text-[10px] text-slate-600 font-mono mt-1">{activeId}</p>}
              </div>
              <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-xs text-slate-500 mb-1 font-mono">{copy.startTime}</p>
                <p className="font-mono text-emerald-400 text-lg">
                  {sessionStartDisplay || (liveSessionActive ? copy.connecting : "—")}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.notesLabel}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 bg-[#0d0d10]/90 border border-[#c9a962]/15 rounded-xl p-4 text-slate-300 focus:border-indigo-500 outline-none"
                placeholder={copy.notesPlaceholder}
              />
              {saveMsg && <p className="text-xs mt-2 text-emerald-400 font-mono">{saveMsg}</p>}
            </div>

            {(liveSessionActive || activeStudent?.id) && dynamicSessionId && (
              <GoalEngine
                lang={lang}
                student={activeStudent}
                sessionId={dynamicSessionId}
                specialistEmail={specialistEmail}
                patchSession={patchSession}
                sessionAttemptsCache={user?.goalAttempts}
                showWeeklySummary={sovereign}
              />
            )}
          </div>

          <div className="bg-indigo-900/10 p-8 rounded-3xl border border-indigo-500/20">
            <h3 className="text-xl font-bold text-[#e8c872] mb-4 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6" /> {copy.aiReport}
            </h3>
            <p className="text-md text-indigo-200/80 leading-relaxed bg-indigo-950/50 p-5 rounded-xl border border-indigo-500/30">
              {aiReportFromStudent || copy.aiReportEmpty}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
            <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> {copy.security}
            </h3>
            <div className="space-y-3">
              {!hideFinancial && (
                <>
              <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <span className="text-sm text-slate-400">{copy.sessionFee}</span>
                <input
                  type="number"
                  min={0}
                  value={sessionFee}
                  onChange={(e) => setSessionFee(e.target.value)}
                  className="w-24 text-end bg-slate-900 border border-white/[0.08] rounded-lg px-2 py-1 text-emerald-300 font-mono text-sm"
                />
              </div>
              <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <span className="text-sm text-slate-400">{copy.paymentStatus}</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  {paymentFromStudent || "—"}
                </span>
              </div>
                </>
              )}
              <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <span className="text-sm text-slate-400">{copy.attachmentEncryption}</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">AES-256 SECURED</span>
              </div>
            </div>
          </div>

          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
            <h3 className="text-md font-bold text-slate-300 mb-4">{copy.reconciliation}</h3>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-[10px] text-slate-500 font-mono">{copy.specialistClaims}</p>
                <p className="text-lg font-bold text-[#e8c872]">{reconciliation?.claimCount ?? "—"}</p>
              </div>
              <div className="p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-[10px] text-slate-500 font-mono">{copy.centerLedger}</p>
                <p className="text-lg font-bold text-[#e8c872]">{reconciliation?.ledgerCount ?? "—"}</p>
              </div>
              <div className="p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-[10px] text-slate-500 font-mono">{copy.difference}</p>
                <p className={`text-lg font-bold ${hasMismatch ? "text-rose-400" : "text-emerald-400"}`}>{reconciliation?.difference ?? "—"}</p>
              </div>
            </div>
            {hasMismatch && (
              <div className="flex items-start gap-2 p-3 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{copy.mismatch}</span>
              </div>
            )}
            <p className="text-[10px] font-mono text-slate-500 mb-3">
              {sovereignApproved ? copy.sovereignApproved : copy.pendingApproval}
            </p>
            {sovereign && (
              <div className="space-y-2 pt-2 border-t border-[#c9a962]/15">
                <label className="text-xs text-slate-400 block">{copy.ledgerCount}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={ledgerInput}
                    onChange={(e) => setLedgerInput(e.target.value)}
                    className="flex-1 bg-[#0d0d10]/90 border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono"
                  />
                  <button
                    type="button"
                    disabled={ledgerSaving || !specialistEmail}
                    onClick={saveLedgerCount}
                    className="px-3 py-2 rounded-lg bg-[#12121a]/70 hover:bg-[#12121a]/90 text-xs font-bold disabled:opacity-50"
                  >
                    {ledgerSaving ? "…" : copy.saveLedger}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={ledgerSaving || !specialistEmail}
                  onClick={approveReconciliation}
                  className="w-full py-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-200 text-sm font-bold hover:bg-amber-600/30 disabled:opacity-50"
                >
                  {copy.approveReconciliation}
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
            <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3">
              <Lock className="w-5 h-5 text-[#d4af37]" /> {copy.hiddenFields}
            </h3>
            <div className="p-5 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15 relative overflow-hidden">
              {stealthOn && (
              <div className="absolute inset-0 bg-[#0d0d10]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-white/[0.08] rounded-xl">
                <Lock className="w-6 h-6 text-slate-500 mb-2" />
                <span className="text-xs font-bold text-slate-400 text-center px-4 whitespace-pre-line">{copy.stealthMode}</span>
              </div>
              )}
              <div className={`h-24 font-mono text-xs text-slate-600 p-2 ${stealthOn ? "opacity-20" : ""}`}>
                {copy.sessionFee}: {hideFinancial ? "—" : sessionFee || "—"} · {copy.paymentStatus}: {hideFinancial ? "—" : paymentFromStudent || "—"}
              </div>
            </div>
          </div>

          {encryptBlocked && (
            <p className="text-xs text-rose-400 font-mono text-center px-2">
              {biometricBlocked ? copy.biometricRequired : copy.mismatchBlock}
            </p>
          )}

          <button
            type="button"
            disabled={saving || !activeStudent?.id}
            onClick={approveSession}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {copy.encryptButton}
          </button>

          <button
            type="button"
            disabled={saving || !activeStudent?.id || encryptBlocked}
            onClick={openSettlement}
            className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {copy.endSession}
          </button>

          <SettlementConfirmModal
            lang={lang}
            open={settleOpen}
            onClose={() => setSettleOpen(false)}
            onConfirm={confirmSettlement}
            reconciliation={reconciliation}
            sessionDate={sessionDate}
            specialistEmail={specialistEmail}
            specialistName={user?.name}
            studentName={activeStudent?.name}
            sessionFee={sessionFee}
            saving={saving}
            sovereign={sovereign}
          />
        </div>
      </div>
    </div>
  );
}