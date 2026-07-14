import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react';
import {
  readPaymentPending,
  verifyPaymentReturn,
  savePaymentComplete,
  clearPaymentPending,
} from '../lib/paymentClient';
import { PLAN_LABELS, landingForPlan } from '../lib/plans';
import { useAuth } from '../lib/auth';
import PlatformLogo from './PlatformLogo';

/**
 * /payment/return — post-Tap redirect handler.
 * Webhook activates first; this page verifies and stores session for enrollment resume.
 */
export default function PaymentReturn({ lang = 'ar' }) {
  const { patchSession } = useAuth();
  const [state, setState] = useState('loading');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const copy =
    lang === 'en'
      ? {
          title: 'Consultative License confirmation',
          verifying: 'Verifying secure license activation…',
          success: 'License confirmed — subscription active',
          tokenNote: 'Parent access token issued automatically',
          continueEnrollment: 'Continue to biometric enrollment',
          continueApp: 'Return to Aunak',
          failed: 'Consultative License could not be verified',
          retry: 'Try again from activation gate',
        }
      : {
          title: 'تأكيد الرخصة الاستشارية',
          verifying: 'جاري التحقق من تفعيل الرخصة الاستشارية…',
          success: 'تم تأكيد الرخصة — الاشتراك Active',
          tokenNote: 'تم إصدار رمز ولي الأمر parent_access_token تلقائياً',
          continueEnrollment: 'متابعة تسجيل البصمة',
          continueApp: 'العودة إلى عونك',
          failed: 'تعذّر التحقق من الرخصة الاستشارية',
          retry: 'أعد المحاولة من بوابة التفعيل',
        };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get('studentId') || readPaymentPending()?.studentId;
      const plan = params.get('plan') || readPaymentPending()?.plan;
      const flow = params.get('flow') || readPaymentPending()?.flow || 'enrollment';
      const chargeId =
        params.get('tap_id') ||
        params.get('chargeId') ||
        params.get('charge_id') ||
        readPaymentPending()?.chargeId;

      if (!studentId) {
        if (!cancelled) {
          setState('error');
          setError('STUDENT_ID_MISSING');
        }
        return;
      }

      if (!chargeId) {
        if (!cancelled) {
          setState('error');
          setError(lang === 'en' ? 'Missing charge reference — wait for webhook or retry.' : 'مرجع الرخصة الاستشارية مفقود — انتظر Webhook أو أعد المحاولة.');
        }
        return;
      }

      try {
        const data = await verifyPaymentReturn({ chargeId, studentId, plan, flow });
        if (cancelled) return;
        savePaymentComplete({ ...data, studentId, plan, flow, chargeId });
        clearPaymentPending();
        if (flow === 'gate') {
          patchSession({
            subscriptionActivated: true,
            subscriptionRaw: 'Active',
            plan: data.plan ?? plan,
            subscriptionPending: false,
            landingSection: data.landing ?? landingForPlan(data.plan ?? plan),
          });
        }
        setResult(data);
        setState('success');
      } catch (e) {
        if (cancelled) return;
        setState('error');
        setError(e?.message || copy.failed);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [lang, copy.failed, patchSession]);

  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;
  const flow = result?.flow || new URLSearchParams(window.location.search).get('flow') || 'enrollment';

  const continueHref = flow === 'enrollment' ? '/?enrollment=1&payment=done' : '/';

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0a0a0c] text-slate-300 flex flex-col items-center justify-center p-6"
    >
      <PlatformLogo lang={lang} className="w-16 h-20 mb-8 rounded-xl" />

      <div className="max-w-md w-full rounded-3xl bg-[#12121a]/95 border border-[#c9a962]/30 p-8 text-center shadow-[0_0_64px_rgba(201,169,98,0.15)]">
        <h1 className="text-xl font-bold text-[#e8c872] mb-6">{copy.title}</h1>

        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">{copy.verifying}</p>
          </>
        )}

        {state === 'success' && result && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-emerald-200 mb-2">{copy.success}</p>
            <p className="text-sm font-mono text-[#e8c872] mb-1">
              {labels[result.plan] ?? result.plan}
            </p>
            <p className="text-xs text-slate-500 mb-6">{copy.tokenNote}</p>
            <a
              href={continueHref}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white font-bold"
            >
              {flow === 'enrollment' ? copy.continueEnrollment : copy.continueApp}
              <ArrowRight className="w-4 h-4" />
            </a>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <p className="text-sm text-rose-300 mb-4">{error || copy.failed}</p>
            <a href="/" className="text-sm text-slate-400 hover:text-slate-200 underline">
              {copy.retry}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
