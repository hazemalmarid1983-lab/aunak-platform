import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowRight, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import PlatformLogo from "./PlatformLogo";
import {
  validateEnrollmentStep1,
  ENROLLMENT_AGE_MIN,
  ENROLLMENT_AGE_MAX,
} from "../lib/enrollmentValidation";
import {
  FUNNEL_PHASES,
  validateEnglishStudentName,
  validateNationalId,
} from "../lib/enrollmentFunnel";
import { getCountryOptions, DEFAULT_COUNTRY_ISO, getCountryByIso, splitStoredPhone } from "../lib/countryDialCodes";
import FreeAssessmentFlow from "./assessment/FreeAssessmentFlow";
import AdaptiveClinicalAssessment from "./assessment/AdaptiveClinicalAssessment";
import AunakActivationGate from "./AunakActivationGate";
import PostActivationBiometric from "./PostActivationBiometric";
import { LUX } from "../lib/luxTheme.js";
import {
  readPaymentComplete,
  clearPaymentComplete,
  readEnrollmentDraft,
  clearEnrollmentDraft,
  saveEnrollmentDraft,
} from "../lib/paymentClient";
import { useAuth } from "../lib/auth";
import { PLAN_CODES } from "../lib/plans";
import { updateStudentRecord } from "../lib/airtable";
import { STUDENT as SF } from "../lib/airtableFields";
import { assessmentScorePayload } from "../lib/initialAssessmentEngine";

/** Map funnel phase → UI step index (1–5) + live passage. */
function phaseToUiStep(phase) {
  switch (phase) {
    case FUNNEL_PHASES.DATA:
      return 1;
    case FUNNEL_PHASES.ASSESSMENT:
      return 2;
    case FUNNEL_PHASES.ACTIVATION:
      return 3;
    case FUNNEL_PHASES.BIOMETRIC:
      return 5;
    case FUNNEL_PHASES.ISLANDS:
    case FUNNEL_PHASES.CLASSROOMS:
    case FUNNEL_PHASES.COMPLETE:
      return 6;
    default:
      return 1;
  }
}

async function callEnrollApi(payload) {
  const res = await fetch("/api/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      data?.error ||
      data?.details?.message ||
      data?.student_name ||
      data?.national_id ||
      (res.status === 404 ? "API_ENROLL_UNAVAILABLE (restart npm run dev — /api/enroll missing)" : null) ||
      "ENROLL_FAILED";
    const err = new Error(detail);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

/**
 * Sovereign enrollment funnel (V1 clinical protocol):
 * national_id + English student_name (PK) · age · symptoms
 * → 12Q four-dimension weights + Dynamic Branching
 * → license → Adaptive Stimuli (66 fields) → biometric → landingSection: live
 */
export default function AunakEnrollment({ lang = "ar", onEnrolled }) {
  const { user, patchSession } = useAuth();
  const [phase, setPhase] = useState(1);
  const [name, setName] = useState(""); // English student_name (canonical)
  const [nameAr, setNameAr] = useState(""); // optional Arabic display
  const [nationalId, setNationalId] = useState("");
  const [age, setAge] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [parentPhone, setParentPhone] = useState("");
  const [primaryDimension, setPrimaryDimension] = useState("behavioral");
  const [recordId, setRecordId] = useState(null);
  const [studentCode, setStudentCode] = useState("");
  const [activationResult, setActivationResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [funnelMeta, setFunnelMeta] = useState(null);

  const t = {
    ar: {
      title: "تسجيل المستفيد السيادي",
      subtitle:
        "هوية وطنية + اسم إنجليزي → مسح الأبعاد الأربعة → تفعيل → مثيرات عيادية تكيفية → بصمة → البوابة الحية",
      phaseData: "التسجيل",
      phaseAssessment: "مسح الأوزان",
      phaseActivation: "تفعيل الرخص",
      phaseClinical: "تقييم تكيفي",
      phaseBiometric: "البصمة",
      name: "الاسم الإنجليزي (student_name)",
      nameHint: "حروف لاتينية — الاسم الأول واللقب (مركب مع الرقم المدني كمفتاح أساسي)",
      namePlaceholder: "Hussain Al Busaidi",
      nameAr: "الاسم بالعربية (يُحفظ في نفس السجل)",
      nameArPlaceholder: "الحسين البوسعيدي",
      nationalId: "الرقم المدني / الهوية الوطنية",
      nationalIdHint: "مفتاح أساسي مع الاسم الإنجليزي — يمنع التكرار وخطأ 422",
      nationalIdPlaceholder: "مثال: 12345678",
      age: "العمر",
      ageHint: `من ${ENROLLMENT_AGE_MIN} إلى ${ENROLLMENT_AGE_MAX} سنة`,
      symptoms: "الأعراض الملاحظة",
      symptomsHint: "صف ما تلاحظه فقط — لا تختار تشخيصاً (التشخيص سريري لاحقاً)",
      symptomsPlaceholder: "مثال: ضعف تواصل لفظي، تجنب نظر، حساسية من الضوضاء…",
      parentPhone: "هاتف ولي الامر",
      phoneHint: "اختر كود الدولة ثم أدخل رقم الجوال بدون الصفر الأول",
      next: "التالي — مسح الأوزان النسبية",
      resumeHint: "تم استئناف السجل من Airtable — آلة الحالة قابلة للاستئناف",
      bypassTitle: "العبور السيادي مكتمل",
      bypassLive: "التقييم والبصمة ناجحان — توجيه فوري للبوابة الحية (live)",
      enterPortal: "دخول البوابة الحية الآن",
      errField: "تعذر حفظ البيانات — تحقق من أعمدة Airtable (national_id / student_name / presenting_symptoms).",
      errSave: "فشل حفظ السجل",
      errValidation: "صحّح الحقول المظللة قبل المتابعة",
      errDuplicate: "تم العثور على السجل بالرقم المدني — جارٍ التحديث على نفس الصف",
      errIdentity422: "تعارض الهوية: الرقم المدني مرتبط باسم إنجليزي مختلف (422)",
      activatedNote: "تم تفعيل الرخصة — ادخل المثيرات العيادية التكيفية ثم البصمة",
    },
    en: {
      title: "Sovereign Beneficiary Enrollment",
      subtitle:
        "national_id + English name → 4-dimension weights → license → adaptive stimuli → biometric → live",
      phaseData: "Register",
      phaseAssessment: "Weight scan",
      phaseActivation: "License",
      phaseClinical: "Adaptive clinical",
      phaseBiometric: "Biometric",
      name: "English name (student_name)",
      nameHint: "Latin letters — first + family (composite PK with national ID)",
      namePlaceholder: "Hussain Al Busaidi",
      nameAr: "Arabic display name (optional)",
      nameArPlaceholder: "الحسين البوسعيدي",
      nationalId: "Civil / National ID",
      nationalIdHint: "Composite primary key with English student_name — blocks duplicates (422)",
      nationalIdPlaceholder: "e.g. 12345678",
      age: "Age",
      ageHint: `Ages ${ENROLLMENT_AGE_MIN}–${ENROLLMENT_AGE_MAX} only`,
      symptoms: "Observed symptoms",
      symptomsHint: "Describe what you observe only — no diagnosis picker",
      symptomsPlaceholder: "e.g. limited verbal communication, gaze avoidance, noise sensitivity…",
      parentPhone: "Guardian phone",
      phoneHint: "Select country code, then enter mobile without leading zero",
      next: "Next — relative-weight screening",
      resumeHint: "Resumed from Airtable — state machine is resumable",
      bypassTitle: "Sovereign passage complete",
      bypassLive: "Assessment + biometric matched — immediate live gate routing",
      enterPortal: "Enter live gate now",
      errField: "Could not save — check Airtable columns (national_id / student_name / presenting_symptoms).",
      errSave: "Failed to save record",
      errValidation: "Fix highlighted fields before continuing",
      errDuplicate: "Found by national_id — updating the same row",
      errIdentity422: "Identity conflict: national_id bound to a different English name (422)",
      activatedNote: "License active — complete adaptive clinical stimuli then biometric",
    },
  };
  const copy = t[lang] ?? t.ar;
  const phaseLabels = [
    copy.phaseData,
    copy.phaseAssessment,
    copy.phaseActivation,
    copy.phaseClinical,
    copy.phaseBiometric,
  ];

  const countryOptions = useMemo(() => getCountryOptions(lang), [lang]);

  const identityOk = useMemo(() => {
    const n = validateNationalId(nationalId, lang);
    const e = validateEnglishStudentName(name, lang);
    return n.ok && e.ok;
  }, [nationalId, name, lang]);

  const validation = useMemo(() => {
    const base = validateEnrollmentStep1({
      name: nameAr.trim() || name,
      age,
      parentPhone,
      countryIso,
      symptoms,
      lang,
    });
    const errors = { ...base.errors };
    const nid = validateNationalId(nationalId, lang);
    const en = validateEnglishStudentName(name, lang);
    if (!nid.ok) errors.nationalId = nid.message;
    if (!en.ok) errors.name = en.message;
    return {
      ...base,
      ok: base.ok && nid.ok && en.ok,
      errors,
      firstError: errors.nationalId || errors.name || base.firstError,
    };
  }, [name, nameAr, nationalId, age, parentPhone, countryIso, symptoms, lang]);

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /** Keep red errors in sync with live values (clear when fixed). */
  useEffect(() => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      let changed = false;
      const map = {
        name: validation.errors.name,
        age: validation.errors.age,
        phone: validation.errors.phone,
        symptoms: validation.errors.symptoms,
        nationalId: validation.errors.nationalId,
      };
      for (const [key, msg] of Object.entries(map)) {
        if (!touched[key]) continue;
        if (msg) {
          if (next[key] !== msg) {
            next[key] = msg;
            changed = true;
          }
        } else if (next[key]) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [validation.errors, touched]);

  const showError = (field) => touched[field] && fieldErrors[field];

  const inputBorder = (field) => {
    if (showError(field)) return "border-rose-500/60 focus:border-rose-400";
    if (touched[field] && !fieldErrors[field]) return "border-emerald-400/40";
    return "border-white/[0.08] focus:border-emerald-400";
  };

  const applyFunnelResult = useCallback(
    (data, { announceResume = false } = {}) => {
      if (!data?.recordId) return;
      setRecordId(data.recordId);
      setStudentCode(data.student_id || "");
      if (data.student_name) setName(data.student_name);
      if (data.student_name_ar) setNameAr(data.student_name_ar);
      else if (data.fields?.student_name_ar) setNameAr(String(data.fields.student_name_ar));
      if (data.national_id) setNationalId(data.national_id);
      setFunnelMeta(data.funnel);

      const f = data.fields || {};
      if (f.age != null) setAge(String(f.age));
      if (f.presenting_symptoms) setSymptoms(String(f.presenting_symptoms));
      if (f.screening_weights) {
        try {
          const w =
            typeof f.screening_weights === "string"
              ? JSON.parse(f.screening_weights)
              : f.screening_weights;
          if (w?.primaryDimension) setPrimaryDimension(w.primaryDimension);
        } catch {
          /* ignore */
        }
      }
      if (f.parent_phone) {
        const split = splitStoredPhone(f.parent_phone, countryIso);
        if (split.countryIso) setCountryIso(split.countryIso);
        setParentPhone(split.national);
      }
      setFieldErrors({});
      setTouched({});

      try {
        sessionStorage.setItem("student_record_id", data.recordId);
        sessionStorage.setItem("student_id", data.recordId);
        if (data.national_id) sessionStorage.setItem("national_id", data.national_id);
      } catch {
        /* private mode */
      }

      saveEnrollmentDraft({
        recordId: data.recordId,
        name: data.student_name || name,
        nameAr: data.student_name_ar || nameAr,
        nationalId: data.national_id || nationalId,
        age: f.age,
        symptoms: f.presenting_symptoms || symptoms,
        countryIso: f.parent_phone
          ? splitStoredPhone(f.parent_phone, countryIso).countryIso || countryIso
          : countryIso,
        parentPhone: f.parent_phone
          ? splitStoredPhone(f.parent_phone, countryIso).national
          : parentPhone,
        preferredLanding: "live",
        studentCode: data.student_id,
        primaryDimension,
      });

      const funnel = data.funnel || {};
      const ui = phaseToUiStep(funnel.phase);

      if (funnel.bypassAssessment || ui === 6) {
        setPhase(6);
        if (announceResume || data.resumed) setError("");
        return;
      }

      setPhase(ui);
      if (data.resumed && announceResume) {
        setError(copy.resumeHint);
      }
    },
    [name, nameAr, nationalId, countryIso, parentPhone, symptoms, primaryDimension, copy.resumeHint]
  );

  const sealLivePortal = useCallback(
    (sessionExtras = {}) => {
      const landing = "live";
      const session = {
        plan: funnelMeta?.plan || PLAN_CODES.TUTOR,
        landing,
        path: sessionExtras.path || "sovereign_live",
        studentId: recordId,
        childName: nameAr.trim() || name.trim(),
        landingSection: "live",
        ...sessionExtras,
      };
      if (!user || user.role === "parent") {
        patchSession({
          subscriptionActivated: true,
          subscriptionRaw: "Active",
          plan: session.plan,
          landingSection: "live",
          assessmentOnlyMode: false,
          childId: recordId,
          activeStudentId: recordId,
          childName: session.childName,
          role: user?.role ?? "parent",
          biometricSovereign: Boolean(sessionExtras.biometricSovereign),
        });
      }
      clearEnrollmentDraft();
      onEnrolled?.(session);
    },
    [funnelMeta, recordId, name, nameAr, user, patchSession, onEnrolled]
  );

  /** Resume after Tap redirect / draft. */
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const paymentDone = params.get("payment") === "done" || params.get("enrollment") === "1";
    const complete = readPaymentComplete();
    const draft = readEnrollmentDraft();

    if (draft) {
      if (draft.name) setName(draft.name);
      if (draft.nameAr) setNameAr(draft.nameAr);
      if (draft.nationalId) setNationalId(draft.nationalId);
      if (draft.age) setAge(String(draft.age));
      if (draft.symptoms) setSymptoms(draft.symptoms);
      if (draft.primaryDimension) setPrimaryDimension(draft.primaryDimension);
      if (draft.parentPhone) {
        const split = splitStoredPhone(draft.parentPhone, draft.countryIso || DEFAULT_COUNTRY_ISO);
        setCountryIso(draft.countryIso || split.countryIso || DEFAULT_COUNTRY_ISO);
        setParentPhone(split.national || String(draft.parentPhone).replace(/\D/g, "").replace(/^0/, ""));
      } else if (draft.countryIso) {
        setCountryIso(draft.countryIso);
      }
      if (draft.studentCode) setStudentCode(draft.studentCode);
      if (draft.recordId) setRecordId(draft.recordId);
    }

    const sid = complete?.studentId || draft?.recordId;
    if (sid) setRecordId(sid);

    if (complete?.active || complete?.subscriptionRaw === "active") {
      setActivationResult(complete);
      setPhase(4);
      clearPaymentComplete();
      clearEnrollmentDraft();
    }

    const nid = draft?.nationalId;
    const enName = draft?.name;
    if (nid && enName && !complete?.active) {
      callEnrollApi({
        action: "resume",
        national_id: nid,
        student_name: enName,
      })
        .then((data) => applyFunnelResult(data, { announceResume: true }))
        .catch((err) => {
          if (err?.status === 422) setError(copy.errIdentity422);
        });
    }

    if (paymentDone && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("enrollment");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assessmentCustomer = useMemo(() => {
    const country = getCountryByIso(countryIso);
    const national = parentPhone.replace(/\D/g, "").replace(/^0/, "");
    return {
      name: (nameAr.trim() || name).trim(),
      phoneCountryCode: country.dial,
      phoneNumber: national,
    };
  }, [name, nameAr, parentPhone, countryIso]);

  const submitData = async () => {
    const nid = validateNationalId(nationalId, lang);
    const en = validateEnglishStudentName(name, lang);
    const base = validateEnrollmentStep1({
      name: nameAr.trim() || name,
      age,
      parentPhone,
      countryIso,
      symptoms,
      lang,
    });
    const errors = { ...base.errors };
    if (!nid.ok) errors.nationalId = nid.message;
    if (!en.ok) errors.name = en.message;
    setFieldErrors(errors);
    setTouched({ name: true, nationalId: true, age: true, phone: true, symptoms: true });
    if (!nid.ok || !en.ok || !base.ok) {
      setError(errors.nationalId || errors.name || base.firstError || copy.errValidation);
      return;
    }

    setBusy(true);
    setError("");
    const normalized = base.normalized;
    try {
      const data = await callEnrollApi({
        action: "enroll",
        national_id: nid.value,
        student_name: en.value,
        student_name_ar: nameAr.trim() || undefined,
        age: normalized.age,
        presenting_symptoms: normalized.presenting_symptoms,
        parent_phone: normalized.parentPhone,
        parent_country_code: normalized.parentCountryCode,
        preferred_destination: "live",
      });

      if (data.resumed || data.updated) {
        setError(copy.errDuplicate);
      }
      applyFunnelResult(data, { announceResume: Boolean(data.resumed) });
    } catch (e) {
      const msg = e?.message || "";
      const detail = e?.payload?.details?.message || e?.payload?.error || msg;
      if (e?.status === 422 || detail === "IDENTITY_MISMATCH") {
        setError(copy.errIdentity422);
      } else {
        setError(
          msg.includes("UNKNOWN_FIELD_NAME") || detail.includes("national_id")
            ? `${copy.errField} (${detail})`
            : detail || copy.errSave
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const handleAssessmentComplete = useCallback(
    async (result) => {
      const dim = result?.primaryDimension || result?.dynamicBranch?.primaryDimension || "behavioral";
      setPrimaryDimension(dim);
      if (recordId && result) {
        try {
          await updateStudentRecord(recordId, {
            [SF.initial_assessment_score]: result.scorePercent,
            [SF.screening_weights]: assessmentScorePayload(result),
            [SF.preferred_destination]: "live",
          });
        } catch (e) {
          console.warn("[enrollment] screening weights:", e?.message);
        }
      }
      if (result?.path === "free") {
        setPhase(3);
        return;
      }
      setPhase(3);
    },
    [recordId]
  );

  if (phase === 3) {
    return (
      <AunakActivationGate
        lang={lang}
        studentId={recordId}
        childName={(nameAr.trim() || name).trim()}
        reason="pending"
        enrollmentFlow
        onActivated={(data) => {
          setActivationResult(data);
          setPhase(4);
        }}
      />
    );
  }

  if (phase === 4) {
    return (
      <AdaptiveClinicalAssessment
        lang={lang}
        recordId={recordId}
        studentName={(nameAr.trim() || name).trim()}
        primaryDimension={primaryDimension}
        onComplete={() => setPhase(5)}
        onBack={() => setPhase(3)}
      />
    );
  }

  if (phase === 6) {
    return (
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 md:p-10 font-sans flex flex-col items-center justify-center"
      >
        <div className="max-w-lg w-full bg-[#12121a]/90 border border-[#c9a962]/30 rounded-3xl p-8 text-center shadow-[0_0_48px_rgba(201,169,98,0.15)]">
          <Sparkles className="w-12 h-12 text-[#e8c872] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#e8c872] mb-2">{copy.bypassTitle}</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">{copy.bypassLive}</p>
          <p className="text-xs text-slate-500 font-mono mb-6">
            {name} · {nationalId} · {studentCode || recordId}
          </p>
          <button type="button" onClick={() => sealLivePortal({ path: "live_bypass" })} className={`${LUX.btnEmerald} w-full py-3 rounded-xl font-bold`}>
            {copy.enterPortal}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 md:p-10 font-sans"
    >
      <header className="max-w-3xl mx-auto mb-8 flex items-center gap-4 border-b border-[#c9a962]/15 pb-6">
        <PlatformLogo lang={lang} className="w-14 h-16 rounded-xl" />
        <div>
          <h1 className={LUX.titleGradient}>{copy.title}</h1>
          <p className="text-sm text-slate-400">{copy.subtitle}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto flex flex-wrap gap-2 mb-8 text-xs font-mono">
        {phaseLabels.map((label, i) => {
          const stepNum = i + 1;
          const locked = stepNum > phase;
          return (
            <div
              key={label}
              className={`flex-1 min-w-[4.5rem] py-2 px-2 rounded-lg border text-center ${
                phase === stepNum
                  ? "border-emerald-400 text-[#e8c872]"
                  : locked
                    ? "border-white/[0.04] text-slate-600 opacity-50"
                    : "border-[#c9a962]/15 text-slate-500"
              }`}
            >
              {stepNum}. {label}
              {stepNum === 5 && phase < 5 && (lang === "ar" ? " 🔒" : " 🔒")}
            </div>
          );
        })}
      </div>

      {error && (
        <p
          className={`max-w-3xl mx-auto mb-4 text-sm ${
            error === copy.resumeHint || error === copy.errDuplicate ? "text-amber-300" : "text-rose-300"
          }`}
        >
          {error}
        </p>
      )}

      {phase === 1 ? (
        <div className="max-w-md mx-auto space-y-4 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] rounded-3xl p-8">
          <div>
            <label htmlFor="enrollment-national-id" className="block text-sm font-medium text-[#e8c872]">
              {copy.nationalId}
            </label>
            <p className="text-[10px] text-slate-500 mb-1.5">{copy.nationalIdHint}</p>
            <input
              id="enrollment-national-id"
              name="national_id"
              value={nationalId}
              onChange={(e) => {
                setNationalId(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase());
                if (error) setError("");
              }}
              onBlur={() => {
                markTouched("nationalId");
                const r = validateNationalId(nationalId, lang);
                setFieldErrors((prev) => ({ ...prev, nationalId: r.ok ? undefined : r.message }));
              }}
              placeholder={copy.nationalIdPlaceholder}
              dir="ltr"
              inputMode="text"
              autoComplete="off"
              required
              aria-required="true"
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none font-mono tracking-wide ${inputBorder("nationalId")}`}
            />
            {showError("nationalId") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.nationalId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.name}</label>
            <p className="text-[10px] text-slate-600 mb-1.5">{copy.nameHint}</p>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onBlur={() => {
                markTouched("name");
                const r = validateEnglishStudentName(name, lang);
                setFieldErrors((prev) => ({ ...prev, name: r.ok ? undefined : r.message }));
              }}
              placeholder={copy.namePlaceholder}
              dir="ltr"
              autoComplete="off"
              name="aunak-student-name-en"
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("name")}`}
            />
            {showError("name") && <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.nameAr}</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={copy.nameArPlaceholder}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.age}</label>
            <p className="text-[10px] text-slate-600 mb-1.5">{copy.ageHint}</p>
            <input
              value={age}
              onChange={(e) => {
                setAge(e.target.value.replace(/[^\d]/g, "").slice(0, 2));
                if (error) setError("");
              }}
              onBlur={() => {
                markTouched("age");
                const r = validateEnrollmentStep1({
                  name: nameAr || name,
                  age,
                  parentPhone,
                  countryIso,
                  symptoms,
                  lang,
                });
                setFieldErrors((prev) => ({ ...prev, ...r.errors }));
              }}
              type="text"
              inputMode="numeric"
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("age")}`}
            />
            {showError("age") && <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.age}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.symptoms}</label>
            <p className="text-[10px] text-slate-600 mb-1.5">{copy.symptomsHint}</p>
            <textarea
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                markTouched("symptoms");
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.symptoms;
                  return next;
                });
                if (error) setError("");
              }}
              onBlur={() => markTouched("symptoms")}
              rows={4}
              placeholder={copy.symptomsPlaceholder}
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none resize-y min-h-[96px] ${inputBorder("symptoms")}`}
            />
            {showError("symptoms") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.symptoms}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.parentPhone}</label>
            <p className="text-[10px] text-slate-600 mb-1.5">{copy.phoneHint}</p>
            <div className="flex gap-2">
              <select
                value={countryIso}
                onChange={(e) => {
                  setCountryIso(e.target.value);
                  markTouched("phone");
                }}
                dir="ltr"
                className="w-[42%] min-w-[8rem] px-2 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] outline-none focus:border-emerald-400 text-sm"
              >
                {countryOptions.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                value={parentPhone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d\s-]/g, "");
                  if (String(e.target.value).includes("+") || raw.length > 10) {
                    const split = splitStoredPhone(e.target.value, countryIso);
                    if (split.national) {
                      setCountryIso(split.countryIso || countryIso);
                      setParentPhone(split.national);
                    } else {
                      setParentPhone(raw);
                    }
                  } else {
                    setParentPhone(raw);
                  }
                  markTouched("phone");
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                  if (error) setError("");
                }}
                onBlur={() => markTouched("phone")}
                dir="ltr"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="7xxxxxxx"
                className={`flex-1 px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("phone")}`}
              />
            </div>
            {showError("phone") && <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.phone}</p>}
          </div>

          <button
            type="button"
            disabled={busy || !validation.ok || !identityOk}
            onClick={submitData}
            className={`${LUX.btnEmerald} w-full py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2`.trim()}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}{" "}
            {copy.next}
          </button>
        </div>
      ) : phase === 2 ? (
        <FreeAssessmentFlow
          lang={lang}
          studentName={(nameAr.trim() || name).trim()}
          recordId={recordId}
          customer={assessmentCustomer}
          onBack={() => setPhase(1)}
          onComplete={handleAssessmentComplete}
        />
      ) : (
        <>
          {activationResult && (
            <p className="max-w-lg mx-auto text-center text-emerald-300 text-sm mb-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {copy.activatedNote}
            </p>
          )}
          <PostActivationBiometric
            lang={lang}
            recordId={recordId}
            studentName={(nameAr.trim() || name).trim()}
            onComplete={(session) => {
              sealLivePortal({
                path: "biometric_live",
                biometricSovereign: true,
                ...session,
              });
            }}
          />
        </>
      )}
    </div>
  );
}
