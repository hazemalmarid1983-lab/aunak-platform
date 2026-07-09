import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import PlatformLogo from "./PlatformLogo";
import {
  createStudentRecord,
  buildStudentEnrollmentFields,
  generateUniqueStudentCode,
} from "../lib/airtable";
import {
  validateEnrollmentStep1,
  ENROLLMENT_AGE_MIN,
  ENROLLMENT_AGE_MAX,
} from "../lib/enrollmentValidation";
import { getDiagnosisOptions } from "../lib/diagnosisOptions";
import { getCountryOptions, DEFAULT_COUNTRY_ISO } from "../lib/countryDialCodes";
import FreeAssessmentFlow from "./assessment/FreeAssessmentFlow";
import AunakActivationGate from "./AunakActivationGate";
import PostActivationBiometric from "./PostActivationBiometric";
import { LUX } from "../lib/luxTheme.js";
import { getCountryByIso } from "../lib/countryDialCodes";
import { readPaymentComplete, clearPaymentComplete, readEnrollmentDraft, clearEnrollmentDraft, saveEnrollmentDraft } from "../lib/paymentClient";

/**
 * Sovereign enrollment — strict funnel:
 * Data → Free assessment → Promo → Payment/activation → Biometric (post-pay only)
 */
export default function AunakEnrollment({ lang = "ar", onEnrolled }) {
  const [phase, setPhase] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [parentPhone, setParentPhone] = useState("");
  const [preferredLanding, setPreferredLanding] = useState("media");
  const [recordId, setRecordId] = useState(null);
  const [studentCode, setStudentCode] = useState("");
  const [activationResult, setActivationResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const t = {
    ar: {
      title: "تسجيل الطالب السيادي",
      subtitle: "تسجيل → تقييم مجاني → تفعيل الاشتراك → البصمة (بعد السداد فقط)",
      phaseData: "التسجيل",
      phaseAssessment: "التقييم",
      phaseActivation: "التفعيل",
      phaseBiometric: "البصمة",
      name: "إسم الطالب",
      nameHint: "يرجى كتابة اسمين على الأقل (الاسم الأول واللقب)",
      namePlaceholder: "يرجى كتابة اسمين على الأقل (الاسم الأول واللقب)",
      age: "العمر",
      ageHint: `من ${ENROLLMENT_AGE_MIN} إلى ${ENROLLMENT_AGE_MAX} سنة`,
      diagnosis: "التشخيص",
      diagnosisPlaceholder: "— اختر التشخيص —",
      parentPhone: "هاتف ولي الامر",
      phoneHint: "اختر كود الدولة ثم أدخل رقم الجوال بدون الصفر الأول",
      preferredLanding: "الوجهة المفضلة",
      landingMedia: "عالم الجزر (media)",
      landingRegistry: "سجل الحالات (registry)",
      next: "التالي — التقييم المجاني",
      errField:
        "تعذر حفظ البيانات — عمود Airtable غير موجود أو اسمه مختلف. تحقق من أسماء الأعمدة في جدول الطلاب.",
      errSave: "فشل حفظ السجل",
      errValidation: "صحّح الحقول المظللة قبل المتابعة",
      activatedNote: "تم تفعيل الاشتراك — أكمل تسجيل البصمة الآن",
    },
    en: {
      title: "Sovereign Student Enrollment",
      subtitle: "Register → free assessment → activate plan → biometric (after payment only)",
      phaseData: "Register",
      phaseAssessment: "Assessment",
      phaseActivation: "Activation",
      phaseBiometric: "Biometric",
      name: "Student name",
      nameHint: "Enter at least two names (first name and family name)",
      namePlaceholder: "Enter at least two names (first and last name)",
      age: "Age",
      ageHint: `Ages ${ENROLLMENT_AGE_MIN}–${ENROLLMENT_AGE_MAX} only`,
      diagnosis: "Diagnosis",
      diagnosisPlaceholder: "— select diagnosis —",
      parentPhone: "Guardian phone",
      phoneHint: "Select country code, then enter mobile without leading zero",
      preferredLanding: "Preferred landing",
      landingMedia: "Digital islands (media)",
      landingRegistry: "Case registry (registry)",
      next: "Next — free assessment",
      errField: "Could not save — Airtable column mismatch.",
      errSave: "Failed to save record",
      errValidation: "Fix highlighted fields before continuing",
      activatedNote: "Subscription active — complete biometric enrollment now",
    },
  };
  const copy = t[lang] ?? t.ar;

  const phaseLabels = [copy.phaseData, copy.phaseAssessment, copy.phaseActivation, copy.phaseBiometric];

  const diagnosisOptions = useMemo(() => getDiagnosisOptions(lang), [lang]);
  const countryOptions = useMemo(() => getCountryOptions(lang), [lang]);

  const validation = useMemo(
    () => validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang }),
    [name, age, parentPhone, countryIso, diagnosis, lang]
  );

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const runValidation = useCallback(() => {
    const result = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
    setFieldErrors(result.errors);
    setTouched({ name: true, age: true, phone: true, diagnosis: true });
    return result;
  }, [name, age, parentPhone, countryIso, diagnosis, lang]);

  const showError = (field) => touched[field] && fieldErrors[field];

  /** Resume enrollment after Tap redirect (?enrollment=1&payment=done or sessionStorage). */
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const paymentDone = params.get('payment') === 'done' || params.get('enrollment') === '1';
    const complete = readPaymentComplete();
    const draft = readEnrollmentDraft();
    if (!complete?.studentId && !draft?.recordId) return;

    if (draft) {
      if (draft.name) setName(draft.name);
      if (draft.age) setAge(String(draft.age));
      if (draft.diagnosis) setDiagnosis(draft.diagnosis);
      if (draft.countryIso) setCountryIso(draft.countryIso);
      if (draft.parentPhone) setParentPhone(draft.parentPhone);
      if (draft.preferredLanding) setPreferredLanding(draft.preferredLanding);
      if (draft.studentCode) setStudentCode(draft.studentCode);
    }

    const sid = complete?.studentId || draft?.recordId;
    if (sid) setRecordId(sid);

    if (complete?.active || complete?.subscriptionRaw === 'active') {
      setActivationResult(complete);
      setPhase(4);
      clearPaymentComplete();
      clearEnrollmentDraft();
    }

    if (paymentDone && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('enrollment');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const assessmentCustomer = useMemo(() => {
    const country = getCountryByIso(countryIso);
    const national = parentPhone.replace(/\D/g, "").replace(/^0/, "");
    return {
      name: name.trim(),
      phoneCountryCode: country.dial,
      phoneNumber: national,
    };
  }, [name, parentPhone, countryIso]);

  const inputBorder = (field) => {
    if (showError(field)) return "border-rose-500/60 focus:border-rose-400";
    if (touched[field] && !fieldErrors[field]) return "border-emerald-400/40";
    return "border-white/[0.08] focus:border-emerald-400";
  };

  const submitData = async () => {
    const result = runValidation();
    if (!result.ok) {
      setError(result.firstError || copy.errValidation);
      return;
    }

    setBusy(true);
    setError("");
    const normalized = result.normalized;
    const code = generateUniqueStudentCode({
      name: normalized.name,
      parentPhone: normalized.parentPhone,
    });
    setStudentCode(code);
    try {
      const row = await createStudentRecord(
        buildStudentEnrollmentFields({
          name: normalized.name,
          age: normalized.age,
          diagnosis: normalized.diagnosis,
          parentPhone: normalized.parentPhone,
          parentCountryCode: normalized.parentCountryCode,
          preferredLanding,
        })
      );
      setRecordId(row.id);
      setStudentCode(row.studentCode ?? code);
      setName(normalized.name);
      setAge(String(normalized.age));
      saveEnrollmentDraft({
        recordId: row.id,
        name: normalized.name,
        age: normalized.age,
        diagnosis: normalized.diagnosis,
        countryIso,
        parentPhone: normalized.parentPhone,
        preferredLanding,
        studentCode: row.studentCode ?? code,
      });
      setPhase(2);
    } catch (e) {
      const msg = e?.message || "";
      const detail =
        msg.includes("UNKNOWN_FIELD_NAME") ||
        msg.includes("INVALID_SELECT") ||
        msg.includes("SELECT_OPTION")
          ? msg.replace(/^[^:]+:\s*/, "")
          : msg;
      setError(
        msg.includes("UNKNOWN_FIELD_NAME") || msg.includes("INVALID_SELECT") || msg.includes("SELECT_OPTION")
          ? `${copy.errField} (${detail})`
          : e?.message || copy.errSave
      );
    } finally {
      setBusy(false);
    }
  };

  if (phase === 3) {
    return (
      <AunakActivationGate
        lang={lang}
        studentId={recordId}
        childName={name.trim()}
        reason="pending"
        enrollmentFlow
        onActivated={(data) => {
          setActivationResult(data);
          setPhase(4);
        }}
      />
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
              {stepNum === 4 && phase < 4 && (lang === "ar" ? " 🔒" : " 🔒")}
            </div>
          );
        })}
      </div>

      {error && <p className="max-w-3xl mx-auto mb-4 text-rose-300 text-sm">{error}</p>}

      {phase === 1 ? (
        <div className="max-w-md mx-auto space-y-4 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] rounded-3xl p-8">
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
                const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                setFieldErrors(r.errors);
              }}
              placeholder={copy.namePlaceholder}
              autoComplete="off"
              name="aunak-student-full-name"
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("name")}`}
            />
            {showError("name") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.name}</p>
            )}
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
                const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                setFieldErrors(r.errors);
              }}
              type="text"
              inputMode="numeric"
              min={ENROLLMENT_AGE_MIN}
              max={ENROLLMENT_AGE_MAX}
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("age")}`}
            />
            {showError("age") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{copy.diagnosis}</label>
            <select
              value={diagnosis}
              onChange={(e) => {
                setDiagnosis(e.target.value);
                if (error) setError("");
              }}
              onBlur={() => {
                markTouched("diagnosis");
                const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                setFieldErrors(r.errors);
              }}
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("diagnosis")}`}
            >
              <option value="">{copy.diagnosisPlaceholder}</option>
              {diagnosisOptions.map((opt) => (
                <option key={opt.id} value={opt.airtableValue}>
                  {opt.label}
                </option>
              ))}
            </select>
            {showError("diagnosis") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.diagnosis}</p>
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
                  if (error) setError("");
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
                  setParentPhone(e.target.value.replace(/[^\d\s-]/g, ""));
                  if (error) setError("");
                }}
                onBlur={() => {
                  markTouched("phone");
                  const r = validateEnrollmentStep1({ name, age, parentPhone, countryIso, diagnosis, lang });
                  setFieldErrors(r.errors);
                }}
                dir="ltr"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="5xxxxxxxx"
                className={`flex-1 px-4 py-3 rounded-xl bg-[#0d0d10]/90 border outline-none ${inputBorder("phone")}`}
              />
            </div>
            {showError("phone") && (
              <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.phone}</p>
            )}
          </div>

          <label className="block text-sm text-slate-400">{copy.preferredLanding}</label>
          <select
            value={preferredLanding}
            onChange={(e) => setPreferredLanding(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] outline-none focus:border-emerald-400"
          >
            <option value="media">{copy.landingMedia}</option>
            <option value="registry">{copy.landingRegistry}</option>
          </select>

          <button
            type="button"
            disabled={busy || !validation.ok}
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
          studentName={name.trim()}
          recordId={recordId}
          customer={assessmentCustomer}
          onBack={() => setPhase(1)}
          onComplete={() => setPhase(3)}
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
            studentName={name.trim()}
            onComplete={(session) => onEnrolled?.(session)}
          />
        </>
      )}
    </div>
  );
}
