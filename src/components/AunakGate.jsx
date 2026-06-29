import { useState, useRef } from "react";
import { KeyRound, ShieldCheck, Loader2, AlertTriangle, ArrowLeft, UserPlus } from "lucide-react";
import PlatformLogo, { GATE_LOGO_CLASS } from "./PlatformLogo";
import AunakBiometrics from "./AunakBiometrics";
import { toggleAppStealth } from "../lib/studentPrivacy";
import AunakEnrollment from "./AunakEnrollment";
import { useAuth, verifyAccessToken } from "../lib/auth";
import { isEnrollmentDeepLink, buildEnrollmentUrl, setEnrollmentUrl } from "../lib/enrollmentLink";
import { LUX } from "../lib/luxTheme.js";

export default function AunakGate({ lang = "ar" }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(() => (isEnrollmentDeepLink() ? "enrollment" : "biometric"));
  const [token, setToken] = useState("");
  const [tokenState, setTokenState] = useState("idle");
  const [tokenError, setTokenError] = useState("");

  const t = {
    ar: {
      title: "بوابة عونك",
      subtitle: "النسخة السيادية الموحدة — دخول بيومتري مباشر",
      encrypted: "اتصال مشفر AES-256",
      enrollmentGate: "تسجيل طالب جديد",
      enrollmentDesc: "معالج التسجيل السيادي — بيانات وبصمة وجه في Airtable",
      specialistGate: "بوابة الأخصائيين والإدارة",
      specialistDesc: "أدخل رمز الوصول الخاص (Private Access Token) المسجل في سجل الصلاحيات",
      tokenPlaceholder: "رمز الوصول الخاص...",
      verify: "تحقق ودخول",
      verifying: "جاري التحقق من سجل الصلاحيات...",
      tokenInvalid: "رمز الوصول غير صحيح أو غير مسجل في AunakAccessControl",
      back: "رجوع",
      shareEnrollmentLink: "رابط التسجيل للمشاركة",
      specialistLink: "دخول الأخصائيين",
      enrollmentLink: "تسجيل طالب",
    },
    en: {
      title: "Aunak Gate",
      subtitle: "Sovereign Unified Edition — biometric-first access",
      encrypted: "AES-256 encrypted connection",
      enrollmentGate: "New student enrollment",
      enrollmentDesc: "Sovereign enrollment wizard — data and face biometric in Airtable",
      specialistGate: "Specialists & Admin Gate",
      specialistDesc: "Enter the Private Access Token registered in the access control registry",
      tokenPlaceholder: "Private Access Token...",
      verify: "Verify & Enter",
      verifying: "Verifying against access registry...",
      tokenInvalid: "Invalid token — not registered in AunakAccessControl",
      back: "Back",
      shareEnrollmentLink: "Shareable enrollment link",
      specialistLink: "Specialist login",
      enrollmentLink: "Enroll student",
    },
  };
  const copy = t[lang] ?? t.ar;

  const submitToken = async (e) => {
    e?.preventDefault();
    if (!token.trim() || tokenState === "verifying") return;
    setTokenState("verifying");
    setTokenError("");
    try {
      const session = await verifyAccessToken(token);
      if (session) login(session);
      else {
        setTokenState("error");
        setTokenError(copy.tokenInvalid);
      }
    } catch (err) {
      setTokenState("error");
      setTokenError(err?.message ?? copy.tokenInvalid);
    }
  };

  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  const onLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => {
      logoTapCount.current = 0;
    }, 800);
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
      toggleAppStealth();
    }
  };

  const openEnrollment = () => {
    setMode("enrollment");
    setEnrollmentUrl(true);
  };

  const resetMode = () => {
    setEnrollmentUrl(false);
    setMode("biometric");
    setToken("");
    setTokenState("idle");
    setTokenError("");
  };

  if (mode === "enrollment") {
    const enrollmentUrl = buildEnrollmentUrl();
    return (
      <div dir={lang === "ar" ? "rtl" : "ltr"} className={LUX.pageWrap}>
        <div className={LUX.pageWrapGradient} aria-hidden />
        <div className={`relative z-10 ${LUX.page}`}>
          <div className={LUX.enrollmentBar}>
            <button type="button" onClick={resetMode} className={LUX.backMuted}>
              <ArrowLeft className="w-4 h-4" /> {copy.back}
            </button>
            <label className={`block text-xs ${LUX.muted}`}>{copy.shareEnrollmentLink}</label>
            <input
              type="text"
              readOnly
              dir="ltr"
              value={enrollmentUrl}
              onFocus={(e) => e.target.select()}
              className={LUX.enrollmentInput}
            />
          </div>
          <AunakEnrollment
            lang={lang}
            onEnrolled={() => {
              setEnrollmentUrl(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className={LUX.pageWrap}>
      <div className={LUX.pageWrapGradient} aria-hidden />
      <div className={`relative z-10 ${LUX.pageFlex}`}>
        <header className={LUX.header}>
          <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto w-full">
            <div className="flex flex-col items-center gap-3 text-center w-full">
              <button
                type="button"
                onClick={onLogoTap}
                className={LUX.logoFocus}
                aria-label={lang === "ar" ? "شعار عونك" : "Aunak logo"}
              >
                <PlatformLogo lang={lang} className={GATE_LOGO_CLASS} iconClassName="w-20 h-20 sm:w-28 sm:h-28" />
              </button>
              <div>
                <h1 className={LUX.titleGradient}>{copy.title}</h1>
                <p className={LUX.subtitle}>{copy.subtitle}</p>
              </div>
            </div>
            <div className={LUX.encryptedBadge}>
              <ShieldCheck className="w-4 h-4" /> {copy.encrypted}
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {mode === "biometric" && (
            <AunakBiometrics lang={lang} gateMode autoEnterOnMatch />
          )}

          {mode === "token" && (
            <form onSubmit={submitToken} className={LUX.formGlass}>
              <div className="text-center mb-6">
                <KeyRound className={`w-12 h-12 mx-auto mb-4 ${LUX.goldText}`} />
                <h2 className={LUX.formHeading}>{copy.specialistGate}</h2>
                <p className={`${LUX.muted} text-sm mt-2`}>{copy.specialistDesc}</p>
              </div>
              <input
                type="password"
                dir="ltr"
                value={token}
                disabled={tokenState === "verifying"}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (tokenState === "error") {
                    setTokenState("idle");
                    setTokenError("");
                  }
                }}
                placeholder={copy.tokenPlaceholder}
                className={LUX.inputGlass}
              />
              {tokenState === "error" && tokenError && (
                <div className="flex items-start gap-2 text-rose-300 text-sm mb-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{tokenError}</span>
                </div>
              )}
              {tokenState === "verifying" && (
                <div className={`flex items-center gap-2 ${LUX.goldMono} text-sm mb-4 justify-center`}>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{copy.verifying}</span>
                </div>
              )}
              <button type="submit" disabled={tokenState === "verifying"} className={LUX.submitGold}>
                {copy.verify}
              </button>
              <button type="button" onClick={resetMode} className={`${LUX.backLink} block mx-auto`}>
                {copy.back}
              </button>
            </form>
          )}

          {mode === "biometric" && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <button type="button" onClick={() => setMode("token")} className={LUX.backLink}>
                <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                {copy.specialistLink}
              </button>
              <button type="button" onClick={openEnrollment} className={LUX.backLink}>
                <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                {copy.enrollmentLink}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
