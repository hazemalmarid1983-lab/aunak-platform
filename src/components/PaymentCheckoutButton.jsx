import { useState, useEffect } from 'react';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { startTapCheckout } from '../lib/paymentClient';
import { CHECKOUT_PLAN_OPTIONS, getPlanPricing, DEFAULT_CHECKOUT_PLAN } from '../lib/paymentPlans';
import { PLAN_LABELS } from '../lib/plans';

/**
 * Secure Tap checkout trigger — plan/amount resolved server-side.
 */
export default function PaymentCheckoutButton({
  lang = 'ar',
  studentId,
  plan: initialPlan = DEFAULT_CHECKOUT_PLAN,
  flow = 'enrollment',
  customer,
  showPlanPicker = true,
  className = '',
  onError,
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    fetch('/api/payment/status', { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((d) => setMockMode(Boolean(d.mockPaymentsEnabled)))
      .catch(() => {});
  }, []);

  const copy =
    lang === 'en'
      ? {
          pay: 'Pay securely online',
          paying: 'Opening secure checkout…',
          plan: 'Choose plan',
          secured: 'Tap Payments · 3DS · PCI compliant',
          mockSecured: 'Mock Payment · Preview QA · no real charge',
          errConfig: 'Online payment not configured yet — use activation code or contact admin.',
        }
      : {
          pay: 'السداد الآمن عبر الإنترنت',
          paying: 'جاري فتح صفحة الدفع الآمنة…',
          plan: 'اختر الباقة',
          secured: 'Tap Payments · 3DS · متوافق PCI',
          mockSecured: 'Mock Payment · Preview QA · بدون خصم حقيقي',
          errConfig: 'الدفع الإلكتروني غير مفعّل بعد — استخدم كود التفعيل أو تواصل مع الإدارة.',
        };

  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;
  const pricing = getPlanPricing(plan);

  const handlePay = async () => {
    if (!studentId || busy) return;
    setBusy(true);
    setLocalError('');
    try {
      await startTapCheckout({ studentId, plan, flow, customer });
    } catch (err) {
      const msg = err?.message || copy.errConfig;
      const friendly = msg.includes('TAP_NOT_CONFIGURED') ? copy.errConfig : msg;
      setLocalError(friendly);
      onError?.(friendly);
      setBusy(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showPlanPicker && (
        <div>
          <p className="text-[10px] font-mono text-slate-500 mb-2 text-center">{copy.plan}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CHECKOUT_PLAN_OPTIONS.map((code) => {
              const p = getPlanPricing(code);
              const active = plan === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPlan(code)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'border-[#c9a962]/60 bg-[#c9a962]/15 text-[#e8c872]'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {labels[code]} · {p.amount} {p.currency}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={busy || !studentId}
        onClick={handlePay}
        className="w-full py-4 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white font-black text-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
        {busy ? copy.paying : `${copy.pay} · ${pricing.amount} ${pricing.currency}`}
      </button>

      <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500/80" /> {mockMode ? copy.mockSecured : copy.secured}
      </p>

      {localError && (
        <p className="text-xs text-amber-400/90 text-center bg-amber-500/10 border border-amber-400/25 rounded-lg py-2 px-3">
          {localError}
        </p>
      )}
    </div>
  );
}
