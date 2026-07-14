import { useCallback, useEffect, useRef, useState } from "react";
import { ScanFace, ShieldCheck, AlertTriangle, Camera, RefreshCw, Fingerprint, Loader2 } from "lucide-react";
import PlatformLogo from "./PlatformLogo";
import { fetchStudents, STUDENTS_TABLE, getField } from "../lib/airtable";
import { useBiometricScan } from "../hooks/useBiometricScan";
import { SOVEREIGN_MATCH_CONFIDENCE } from "../lib/biometricMatch";
import { useAuth, ROLES, isSubscriptionActive } from "../lib/auth";
import { PLAN_CODES } from "../lib/plans";
import { activateSovereignBiometricLogin } from "../lib/sovereignLogin";
import { subscribeEmergencyLogin } from "../lib/studentPrivacy";
import { shouldAutoApproveBiometric } from "../lib/sovereignMasterBypass";
import { STUDENT as SF } from "../lib/airtableFields";
import { LUX } from "../lib/luxTheme.js";

function pickQaBypassStudent(students) {
  const list = Array.isArray(students) ? students : [];
  const alHusain = list.find((s) => {
    const blob = `${s.name ?? ""} ${s.nameAr ?? ""} ${s.studentCode ?? ""} ${getField(s.fields, SF.national_id) ?? ""}`;
    return /al[\s-]?hussein|الحسين|ALHUSAIN|AUN-ALHS/i.test(blob);
  });
  if (alHusain) return alHusain;
  const active = list.find((s) =>
    isSubscriptionActive(getField(s.fields, SF.subscription_status) ?? s.subscriptionStatus)
  );
  return active || list[0] || null;
}

export default function AunakBiometrics({
  lang = "ar",
  gateMode = false,
  onBiometricSuccess,
  autoEnterOnMatch = false,
}) {
  const { login, setActiveStudent } = useAuth();
  const [registryCount, setRegistryCount] = useState(null);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [bypassNote, setBypassNote] = useState("");
  const matchHandledRef = useRef(false);

  const t = {
    ar: {
      title: "نظام البصمة الحيوية",
      subtitle: "مطابقة سيادية ≥94.7% مع فحص صلاحية الكاميرا",
      gateSubtitle: "مسح الوجه البيومتري — لا تُعرض أي أسماء قبل التحقق",
      gatePrivacyHint: "خصوصية سيادية: التعرف بالوجه فقط — بدون قائمة أسماء عامة",
      startScan: "بدء المسح البيومتري",
      scanning: "جاري المسح...",
      matching: "مطابقة الهوية عبر قواعد البيانات المشفرة...",
      threshold: "عتبة الثقة السيادية",
      permission: "بوابة صلاحية الكاميرا",
      permissionBlocked: "صلاحية الكاميرا غير مفعلة في سجل الوصول",
      studentId: "إسم المستفيد",
      selectStudent: "اختر المستفيد (الحالة المستهدفة)",
      selectPlaceholder: "— اختر من السجل الحي —",
      verifyHint: "المطابقة المزدوجة 1:1 — الوجه يجب أن يطابق الاسم المختار",
      harmonyIndex: "درجة التناغم",
      retry: "إعادة المحاولة",
      refreshRegistry: "تحديث السجل",
      liveRegistry: "السجل الحي",
      entering: "جاري تفعيل الجلسة السيادية...",
      scanSuccess: "تم التعرف بنجاح",
      autoBypass: "عبور تلقائي (DEV) — بدون كاميرا",
    },
    en: {
      title: "Biometric ID System",
      subtitle: "Sovereign match ≥94.7% with camera permission gate",
      gateSubtitle: "Biometric face scan — no names shown before verification",
      gatePrivacyHint: "Sovereign privacy: face-only match — no public name list",
      startScan: "Start Biometric Scan",
      scanning: "Scanning...",
      matching: "Matching identity across encrypted databases...",
      threshold: "Sovereign confidence",
      permission: "Camera permission gate",
      permissionBlocked: "Camera permission inactive in access registry",
      studentId: "Beneficiary name",
      selectStudent: "Select beneficiary (target case)",
      selectPlaceholder: "— choose from live registry —",
      verifyHint: "1:1 dual verification — face must match selected name",
      harmonyIndex: "Harmony score",
      retry: "Retry",
      refreshRegistry: "Refresh registry",
      liveRegistry: "Live registry",
      entering: "Activating sovereign session...",
      scanSuccess: "Recognition successful",
      autoBypass: "Auto-approve (DEV) — camera skipped",
    },
  };
  const copy = t[lang] ?? t.ar;

  const handleEmergencyLogin = useCallback(() => {
    login({
      role: ROLES.ADMIN,
      plan: PLAN_CODES.INSTITUTION,
      name: lang === "ar" ? "فحص ميداني" : "Field Inspection",
      fieldInspection: true,
      landingSection: "live",
    });
  }, [lang, login]);

  const handleSovereignMatch = useCallback(
    async (payload) => {
      setActiveStudent(payload.student?.id);
      if (matchHandledRef.current) return;
      matchHandledRef.current = true;

      if (onBiometricSuccess) {
        await onBiometricSuccess(payload);
        return;
      }

      if (autoEnterOnMatch || gateMode) {
        setEntering(true);
        try {
          await activateSovereignBiometricLogin(payload, login, lang);
        } finally {
          setEntering(false);
        }
      }
    },
    [autoEnterOnMatch, gateMode, lang, login, onBiometricSuccess, setActiveStudent]
  );

  /** DEV QA: skip camera timeout — enter live dashboard immediately. */
  useEffect(() => {
    if (!gateMode || !shouldAutoApproveBiometric()) return undefined;
    if (matchHandledRef.current) return undefined;
    let cancelled = false;

    (async () => {
      setEntering(true);
      setBypassNote(copy.autoBypass);
      try {
        const students = await fetchStudents();
        if (cancelled) return;
        const student = pickQaBypassStudent(students);
        if (!student?.id) {
          setBypassNote(lang === "ar" ? "لا يوجد سجل للعبور التلقائي" : "No student for auto-bypass");
          return;
        }
        matchHandledRef.current = true;
        setActiveStudent(student.id);
        await activateSovereignBiometricLogin(
          {
            student,
            similarityPercent: 100,
            childCode: student.studentCode,
            masterBypass: true,
          },
          login,
          lang
        );
      } catch (e) {
        if (!cancelled) {
          matchHandledRef.current = false;
          setBypassNote(e?.message || "AUTO_BYPASS_FAILED");
        }
      } finally {
        if (!cancelled) setEntering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gateMode, lang, login, setActiveStudent, copy.autoBypass]);

  useEffect(() => {
    if (!gateMode) return undefined;
    return subscribeEmergencyLogin(handleEmergencyLogin);
  }, [gateMode, handleEmergencyLogin]);

  const scan = useBiometricScan({
    lang,
    playChimeOnMatch: true,
    onSovereignMatch: handleSovereignMatch,
    selectedStudentId: null,
    requireStudentSelection: false,
  });

  const loadLiveRegistry = useCallback(async () => {
    if (gateMode) return;
    setRegistryLoading(true);
    try {
      const rows = await fetchStudents();
      const list = Array.isArray(rows) ? rows : [];
      setRegistryCount(list.length);
    } catch {
      setRegistryCount(0);
    } finally {
      setRegistryLoading(false);
    }
  }, [gateMode]);

  useEffect(() => {
    if (gateMode) return;
    loadLiveRegistry();
  }, [gateMode, loadLiveRegistry]);

  useEffect(() => {
    if (shouldAutoApproveBiometric() && gateMode) return;
    if (scan.scanState === "idle" || scan.scanState === "error") {
      matchHandledRef.current = false;
    }
  }, [scan.scanState, gateMode]);

  // While DEV auto-bypass runs, show a compact entering state (no camera wait)
  if (gateMode && shouldAutoApproveBiometric() && (entering || matchHandledRef.current)) {
    return (
      <div className="w-full max-w-md mx-auto text-center p-8">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
        <p className="text-emerald-300 text-sm font-bold">{copy.entering}</p>
        {bypassNote ? <p className="text-[11px] text-amber-400/90 font-mono mt-2">{bypassNote}</p> : null}
      </div>
    );
  }

  const student = scan.matchedStudent?.student;
  const harmony = scan.matchedStudent?.harmonyScore;

  const rootClass = gateMode
    ? "w-full max-w-4xl mx-auto"
    : "min-h-screen bg-[#0a0a0c] text-slate-300 p-4 md:p-8 font-sans";

  const panelClass = gateMode
    ? `${LUX.panelGlass} border-emerald-400/20 shadow-[0_0_48px_rgba(52,211,153,0.08)] p-6`
    : "rounded-3xl border border-[#c9a962]/15 bg-[#12121a]/70 backdrop-blur-xl shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6";

  const videoFrameClass = gateMode
    ? `${LUX.videoFrame} ${scan.scanState === "scanning" ? "border-emerald-400/45 shadow-[0_0_24px_rgba(52,211,153,0.2)]" : ""}`
    : "aspect-video rounded-2xl bg-black border border-white/[0.08] overflow-hidden relative mb-4";

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className={rootClass}>
      {!gateMode && (
        <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#c9a962]/15">
          <div className="flex items-center gap-4">
            <PlatformLogo lang={lang} className="w-16 h-20 rounded-2xl" />
            <div>
              <h1 className={LUX.titleGradient}>{copy.title}</h1>
              <p className="text-sm text-slate-400 mt-1">{copy.subtitle}</p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-500">
            {copy.liveRegistry}: {STUDENTS_TABLE} — {registryLoading ? "..." : registryCount}
            <button type="button" onClick={loadLiveRegistry} className="ml-2 text-emerald-400 inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {copy.refreshRegistry}
            </button>
          </div>
        </header>
      )}

      <div className={gateMode ? "" : "max-w-4xl mx-auto grid md:grid-cols-2 gap-8"}>
        <div className={panelClass}>
          {gateMode && (
            <>
              <p className={`${LUX.muted} text-sm text-center mb-2 font-mono`}>{copy.gateSubtitle}</p>
              <p className={`text-[10px] text-center mb-4 font-mono ${LUX.emeraldAccent}`}>{copy.gatePrivacyHint}</p>
            </>
          )}

          <div className={videoFrameClass}>
            {(scan.scanState === "scanning" || scan.scanState === "loading" || scan.scanState === "success") && (
              <video
                ref={scan.videoRef}
                className={gateMode ? "absolute inset-0 w-full h-full object-cover" : "w-full h-full object-cover"}
                playsInline
                muted
              />
            )}
            {scan.scanState === "idle" && (
              <div className={`${gateMode ? "flex items-center justify-center h-full" : "h-full flex items-center justify-center"}`}>
                {gateMode ? (
                  <ScanFace className="w-20 h-20 text-slate-500" />
                ) : (
                  <Camera className="w-16 h-16 text-slate-600" />
                )}
              </div>
            )}
            {scan.scanState === "error" && gateMode && (
              <div className="flex items-center justify-center h-full">
                <AlertTriangle className="w-20 h-20 text-rose-400" />
              </div>
            )}
          </div>

          {scan.scanState === "idle" && (
            <button
              type="button"
              onClick={scan.startScan}
              className={gateMode ? `${LUX.scanBtnEmerald} w-full mt-4` : `${LUX.btnEmerald} w-full py-3 rounded-xl font-bold`.trim()}
            >
              {copy.startScan}
            </button>
          )}

          {(scan.scanState === "scanning" || scan.scanState === "loading") && (
            <p className={`text-center text-sm font-mono mt-4 ${gateMode ? LUX.scanProgress : "text-[#e8c872]"}`}>
              {scan.scanState === "loading" ? copy.matching : copy.scanning} — {scan.similarityPercent.toFixed(1)}% / {SOVEREIGN_MATCH_CONFIDENCE}%
            </p>
          )}

          {entering && (
            <div className={`flex items-center justify-center gap-2 mt-4 ${LUX.emeraldValue} text-sm`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              {copy.entering}
            </div>
          )}

          {scan.scanState === "success" && student && !entering && !gateMode && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mt-4">
              <ScanFace className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-500">{copy.studentId}</p>
              <p className="text-xl font-bold text-slate-300">{student.name}</p>
              <p className="text-xs text-slate-500 mt-3">{copy.harmonyIndex}</p>
              <p className="text-2xl font-black text-[#d4af37]">{harmony != null ? `${harmony}%` : "—"}</p>
              <p className="text-xs font-mono text-emerald-400 mt-2">{scan.similarityPercent.toFixed(1)}%</p>
            </div>
          )}

          {scan.scanState === "success" && student && gateMode && !entering && !autoEnterOnMatch && (
            <p className={`${LUX.emeraldValue} font-bold text-center mt-4`}>{copy.scanSuccess}</p>
          )}

          {scan.scanState === "error" && (
            <div className="text-center mt-4">
              <p className="text-rose-300 text-sm mb-3">{scan.errorMsg}</p>
              {scan.permissionDenied && (
                <p className="text-[#e8c872] text-xs mb-3 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> {copy.permissionBlocked}
                </p>
              )}
              <button
                type="button"
                onClick={scan.reset}
                className={gateMode ? LUX.backLink : "px-4 py-2 rounded-lg bg-[#12121a]/70 text-sm"}
              >
                {copy.retry}
              </button>
            </div>
          )}
        </div>

        {!gateMode && (
          <div className="rounded-3xl border border-[#c9a962]/15 bg-[#12121a]/70 backdrop-blur-xl shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#d4af37] text-sm font-mono">
              <Fingerprint className="w-4 h-4" /> {copy.threshold}: {SOVEREIGN_MATCH_CONFIDENCE}%
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <ShieldCheck className="w-4 h-4" /> {copy.permission}
            </div>

            {scan.scanState === "success" && student && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <ScanFace className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs text-slate-500">{copy.studentId}</p>
                <p className="text-xl font-bold text-slate-300">{student.name}</p>
                <p className="text-xs text-slate-500 mt-3">{copy.harmonyIndex}</p>
                <p className="text-2xl font-black text-[#d4af37]">{harmony != null ? `${harmony}%` : "—"}</p>
                <p className="text-xs font-mono text-emerald-400 mt-2">{scan.similarityPercent.toFixed(1)}%</p>
              </div>
            )}

            {scan.scanState !== "success" && (
              <div className="p-4 rounded-2xl bg-[#0d0d10]/90 border border-[#c9a962]/15 text-slate-500 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{copy.subtitle}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
