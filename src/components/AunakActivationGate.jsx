import { useState, useMemo } from 'react';
import { KeyRound, Shield, Loader2, CheckCircle2, ArrowRight, Lock, Clock, AlertTriangle } from 'lucide-react';
import PlatformLogo, { GATE_LOGO_CLASS } from './PlatformLogo';
import PaymentCheckoutButton from './PaymentCheckoutButton';
import TriplePortalCards from './TriplePortalCards';
import { buildTriplePortalLinks } from '../lib/tripleAccessProtocol';
import { useAuth } from '../lib/auth';
import { redeemActivationCodeWithApi } from '../lib/subscriptionEngine';
import { PLAN_LABELS, landingForPlan, PLAN_CODES } from '../lib/plans';
import { normalizeActivationCode, validateCodeFormat } from '../lib/activationCodes';
import { LUX } from '../lib/luxTheme.js';

/**
 * Sovereign activation gate — Value Lock overlay for Pending / expired subscriptions.
 * Redeems manual code via /api/activation/redeem → Active + plan landing.
 */
export default function AunakActivationGate({
  lang = 'ar',
  studentId,
  childName,
  reason = 'pending',
  enrollmentFlow = false,
  onActivated,
  onSkip,
}) {
  const { patchSession } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);

  const t = {
    ar: {
      title: 'بوابة التفعيل السيادية',
      subtitle: 'أدخل كود التفعيل الذي منحته الإدارة بعد السداد',
      student: 'الطالب',
      placeholder: 'AUN-TUTOR-XXXX-2026',
      activate: 'تعميد وتفعيل',
      activating: 'جاري التعميد...',
      success: 'تم التعميد — حالة الاشتراك Active',
      invalid: 'كود غير صالح أو منتهي',
      hint: 'FREE · TUTOR · MEDICAL · INST · ASSESS',
      enterGate: 'الدخول للبوابة المفضلة',
      valueLock: 'Value Lock — الوصول مقفل حتى التفعيل',
      pendingNote: 'حسابك في انتظار التفعيل',
      expiredNote: 'انتهى اشتراكك — أدخل كوداً جديداً للتجديد',
      formatHint: 'الصيغة: AUN-{PLAN}-XXXX-YYYY',
      assessNote: 'باقة ASSESS تفتح التقييم الشامل المعزول فقط',
      enterBiometric: 'متابعة تسجيل البصمة (بعد السداد)',
      orPay: 'أو السداد الإلكتروني الآمن',
      manualCode: 'كود التفعيل اليدوي',
      tripleTitle: 'بوابات السيادة الثلاث — احفظ روابط الأجهزة',
    },
    en: {
      title: 'Sovereign Activation Gate',
      subtitle: 'Enter the activation code issued by admin after payment',
      student: 'Student',
      placeholder: 'AUN-TUTOR-XXXX-2026',
      activate: 'Seal & Activate',
      activating: 'Sealing...',
      success: 'Sealed — subscription Active',
      invalid: 'Invalid or expired code',
      hint: 'FREE · TUTOR · MEDICAL · INST · ASSESS',
      enterGate: 'Enter preferred portal',
      valueLock: 'Value Lock — access blocked until activation',
      pendingNote: 'Your account is pending activation',
      expiredNote: 'Subscription expired — enter a renewal code',
      formatHint: 'Format: AUN-{PLAN}-XXXX-YYYY',
      assessNote: 'ASSESS plan opens isolated full assessment only',
      enterBiometric: 'Continue to biometric enrollment (post-payment)',
      orPay: 'Or pay securely online',
      manualCode: 'Manual activation code',
      tripleTitle: 'Triple sovereign portals — save device links',
    },
  };
  const copy = t[lang] ?? t.ar;
  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;

  const codeValid = useMemo(() => validateCodeFormat(normalizeActivationCode(code)), [code]);
  const reasonNote = reason === 'expired' ? copy.expiredNote : copy.pendingNote;
  const ReasonIcon = reason === 'expired' ? Clock : AlertTriangle;

  const handleCodeChange = (raw) => {
    const cleaned = String(raw ?? '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setCode(cleaned);
    if (error) setError('');
  };

  const enterPortal = (data) => {
    const plan = data?.plan ?? PLAN_CODES.TUTOR;
    const landing = data?.landing ?? landingForPlan(plan);
    patchSession({
      subscriptionActivated: true,
      subscriptionRaw: 'Active',
      plan,
      subscriptionPending: false,
      landingSection: landing,
      assessmentOnlyMode: plan === PLAN_CODES.ASSESSMENT_ONLY,
    });
    onSkip?.(data);
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!code.trim() || busy || !studentId) return;
    if (!codeValid) {
      setError(copy.invalid);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await redeemActivationCodeWithApi({ code: code.trim(), studentId });
      setResult(data);
      setSuccess(true);
      patchSession({
        subscriptionRaw: 'Active',
        plan: data.plan,
        subscriptionPending: false,
        landingSection: data.landing ?? landingForPlan(data.plan),
        assessmentOnlyMode: data.plan === PLAN_CODES.ASSESSMENT_ONLY,
      });
      onActivated?.(data);
    } catch (err) {
      setError(err?.message === 'INVALID_CODE_FORMAT' ? copy.invalid : err?.message || copy.invalid);
    } finally {
      setBusy(false);
    }
  };

  const backdrop = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#0a0a0c]/92 backdrop-blur-md" />
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-blue-600/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,#3b82f6_0px,#3b82f6_1px,transparent_1px,transparent_48px),repeating-linear-gradient(90deg,#3b82f6_0px,#3b82f6_1px,transparent_1px,transparent_48px)]" />
    </div>
  );

  if (success && result) {
    const isAssess = result.plan === PLAN_CODES.ASSESSMENT_ONLY;
    const portalLinks =
      result.portalLinks ??
      buildTriplePortalLinks(typeof window !== 'undefined' ? window.location.origin : '', result.deviceTokens);
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${LUX.pageWrap} fixed inset-0 z-[100] flex items-center justify-center p-6`}>
        {backdrop}
        <div className="relative z-10 max-w-md w-full rounded-3xl bg-[#12121a]/95 border border-blue-500/40 shadow-[0_0_64px_rgba(59,130,246,0.25)] p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-blue-200 mb-2">{copy.success}</h2>
          <p className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/50 text-blue-100 font-mono text-sm mb-3">
            Active · {labels[result.plan] ?? result.plan}
          </p>
          {portalLinks && (
            <>
              <p className="text-xs text-blue-300/80 mb-2 font-mono">{copy.tripleTitle}</p>
              <TriplePortalCards lang={lang} portalLinks={portalLinks} compact />
            </>
          )}
          {isAssess && (
            <p className="text-xs text-blue-300/80 mb-4 font-mono">{copy.assessNote}</p>
          )}
          <button
            type="button"
            onClick={() => {
              if (enrollmentFlow) {
                onActivated?.(result);
                return;
              }
              enterPortal(result);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_32px_rgba(59,130,246,0.35)] transition-all"
          >
            {enrollmentFlow ? copy.enterBiometric : copy.enterGate}{' '}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${LUX.pageWrap} fixed inset-0 z-[100] flex items-center justify-center p-6`}>
      {backdrop}

      <div className="relative z-10 max-w-md w-full">
        <div className="flex justify-center mb-5">
          <PlatformLogo lang={lang} className={GATE_LOGO_CLASS} />
        </div>

        <div className="rounded-3xl bg-[#12121a]/95 border border-blue-500/30 shadow-[0_0_48px_rgba(59,130,246,0.18)] overflow-hidden">
          <div className="px-6 py-4 bg-blue-600/10 border-b border-blue-500/25 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-400/30">
              <Lock className="w-5 h-5 text-blue-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-blue-400/80 uppercase tracking-wider">{copy.valueLock}</p>
              <p className="text-xs text-blue-200/90 flex items-center gap-1.5 mt-0.5">
                <ReasonIcon className="w-3.5 h-3.5 shrink-0" />
                {reasonNote}
              </p>
            </div>
            <Shield className="w-6 h-6 text-blue-400/60 shrink-0" />
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <KeyRound className="w-11 h-11 text-blue-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold bg-gradient-to-l from-blue-200 to-blue-400 bg-clip-text text-transparent">
                {copy.title}
              </h2>
              <p className="text-sm text-slate-400 mt-2">{copy.subtitle}</p>
              {childName && (
                <p className="text-xs font-mono text-slate-500 mt-2">{copy.student}: {childName}</p>
              )}
            </div>

            {studentId && (
              <div className="mb-6 pb-6 border-b border-white/[0.06]">
                <PaymentCheckoutButton
                  lang={lang}
                  studentId={studentId}
                  flow={enrollmentFlow ? 'enrollment' : 'gate'}
                  customer={{ name: childName }}
                />
              </div>
            )}

            <p className="text-[10px] font-mono text-slate-500 text-center mb-4 uppercase tracking-wider">
              {copy.manualCode}
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={copy.placeholder}
                  className={`w-full bg-[#0d0d10] border rounded-xl px-4 py-3.5 font-mono text-center tracking-wider transition-colors ${
                    code && !codeValid
                      ? 'border-rose-500/40 text-rose-300'
                      : codeValid
                        ? 'border-blue-400/50 text-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.12)]'
                        : 'border-white/10 text-blue-100'
                  }`}
                />
                {codeValid && (
                  <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-blue-400" />
                )}
              </div>

              <p className="text-[10px] text-slate-500 text-center font-mono">{copy.formatHint}</p>
              <p className="text-[10px] text-blue-400/70 text-center font-mono">{copy.hint}</p>

              {error && (
                <p className="text-xs text-rose-400 text-center bg-rose-500/10 border border-rose-400/25 rounded-lg py-2 px-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !code.trim() || !codeValid}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_32px_rgba(59,130,246,0.35)] transition-all"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {busy ? copy.activating : copy.activate}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
