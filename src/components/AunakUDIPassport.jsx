import { useEffect, useState } from 'react';
import { Activity, ClipboardCheck, Gauge, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { LUX } from '../lib/luxTheme';
import PlatformLogo from './PlatformLogo';
import { MOCK_DATA_MODE, mockB2gChildCode, mockFindStudentByUdiCode } from '../lib/airtable';
import { mapStudentToB2GView } from '../lib/b2gAnonymization';

const STATUS_LABELS = {
  not_started: 'لم يبدأ',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
};

function MetricCard({ icon: Icon, label, value, suffix = '' }) {
  const display = value == null || value === '' ? '—' : `${value}${suffix}`;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d10]/75 p-5">
      <Icon className="w-5 h-5 text-emerald-400 mb-3" aria-hidden />
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-mono text-[#e8c872]">{display}</p>
    </div>
  );
}

export default function AunakUDIPassport() {
  const [passport, setPassport] = useState(null);
  const code =
    typeof window === 'undefined'
      ? ''
      : decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] ?? '')
          .trim()
          .toUpperCase();
  const validCode = /^CHD-[A-F0-9]{4}$/.test(code);
  const [state, setState] = useState(validCode ? 'loading' : 'invalid');

  useEffect(() => {
    if (!validCode) return;

    let cancelled = false;

    if (MOCK_DATA_MODE) {
      const record = mockFindStudentByUdiCode(code);
      if (!record) {
        setState('not_found');
        return undefined;
      }
      const view = mapStudentToB2GView({
        ...record,
        fields: { ...record.fields, b2g_child_code: mockB2gChildCode(record.id) },
      });
      setPassport({
        b2gCode: view.b2gCode,
        harmonyScore: view.harmonyScore,
        riskScore: view.riskScore,
        comprehensiveAssessmentStatus: view.comprehensiveAssessmentStatus ?? null,
        initialAssessmentScore: view.initialAssessmentScore,
      });
      setState('ready');
      return undefined;
    }

    fetch(`/api/udi/${encodeURIComponent(code)}`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || 'UDI_LOOKUP_FAILED');
        if (!cancelled) {
          setPassport(body);
          setState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setState('not_found');
      });
    return () => {
      cancelled = true;
    };
  }, [code, validCode]);

  return (
    <div dir="rtl" className={LUX.pageWrap}>
      <div className={LUX.pageWrapGradient} aria-hidden />
      <main className="relative z-10 min-h-screen max-w-5xl mx-auto p-5 md:p-10 flex flex-col justify-center">
        <header className="flex flex-col items-center text-center mb-8">
          <PlatformLogo lang="ar" className="w-28 h-20" />
          <span className={LUX.emeraldBadge}>
            <ShieldCheck className="w-4 h-4" />
            عرض سيادي مجهّل الهوية · للقراءة فقط
          </span>
          <h1 className={`${LUX.titleGradient} mt-4`}>الجواز النمائي الموحد</h1>
          <p className={LUX.subtitle}>Unified Developmental Identity · UDI</p>
        </header>

        {state === 'loading' ? (
          <div className={`${LUX.glassCard} flex items-center justify-center py-20`}>
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
          </div>
        ) : state !== 'ready' ? (
          <div className={`${LUX.glassCard} text-center py-14`}>
            <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className={LUX.headingGold}>تعذر فتح الجواز النمائي</h2>
            <p className="text-sm text-slate-500 mt-2">
              {state === 'invalid' ? 'رمز UDI في الرابط غير صالح.' : 'الرمز غير موجود أو تعذر الوصول إليه حالياً.'}
            </p>
          </div>
        ) : (
          <article className={`${LUX.glassCard} space-y-7`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-[#c9a962]/15">
              <div>
                <p className="text-xs text-slate-500">الرمز السيادي للمستفيد</p>
                <p className="text-3xl font-mono font-bold text-[#e8c872] tracking-widest" dir="ltr">
                  {passport.b2gCode}
                </p>
              </div>
              <span className={LUX.emeraldBadge}>UDI VERIFIED</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <MetricCard
                icon={Activity}
                label="مؤشر المتابعة والتناغم"
                value={passport.harmonyScore}
                suffix="%"
              />
              <MetricCard
                icon={Gauge}
                label="درجة الملاحظة"
                value={passport.riskScore}
                suffix="%"
              />
              <MetricCard
                icon={ClipboardCheck}
                label="حالة التقييم الشامل"
                value={
                  STATUS_LABELS[passport.comprehensiveAssessmentStatus] ??
                  passport.comprehensiveAssessmentStatus
                }
              />
              <MetricCard
                icon={Sparkles}
                label="النتيجة المبدئية"
                value={passport.initialAssessmentScore}
                suffix="%"
              />
            </div>

            <p className="text-[11px] text-slate-600 text-center leading-relaxed">
              لا يعرض هذا الجواز الاسم الحقيقي أو بيانات التواصل. المؤشرات المعروضة مجهّلة الهوية
              ومخصصة لاستمرارية المتابعة المهنية.
            </p>
          </article>
        )}
      </main>
    </div>
  );
}
