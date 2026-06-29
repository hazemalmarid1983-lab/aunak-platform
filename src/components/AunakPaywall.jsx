import { useState } from 'react';
import { Lock, Sparkles, Check, Minus, Zap, PlayCircle, X, Film, KeyRound } from 'lucide-react';
import { PLAN_CODES, PLAN_LABELS, planAllows, planRank, normalizePlanCode } from '../lib/plans';
import { LUX } from '../lib/luxTheme.js';

const FEATURE_ROWS = [
  { id: 'community', ar: 'مجتمع عونك', en: 'Aunak Community', min: PLAN_CODES.FREE },
  { id: 'resources', ar: 'الموارد العامة', en: 'Public Resources', min: PLAN_CODES.FREE },
  { id: 'media', ar: 'الوسائط الآمنة', en: 'Safe Media', min: PLAN_CODES.TUTOR },
  { id: 'biometrics', ar: 'البصمة الحيوية', en: 'Biometrics', min: PLAN_CODES.TUTOR },
  { id: 'emotion', ar: 'مختبر الألحان', en: 'Melodies Lab', min: PLAN_CODES.TUTOR },
  { id: 'learning', ar: 'صعوبات التعلم', en: 'Learning Center', min: PLAN_CODES.TUTOR },
  { id: 'diagnostics', ar: 'التشخيص + تقرير نقطة الصفر', en: 'Diagnostics + Zero-Point', min: PLAN_CODES.MEDICAL },
  { id: 'crisis', ar: 'الدرع الذكي', en: 'Smart Shield', min: PLAN_CODES.MEDICAL },
  { id: 'live', ar: 'الرصد الحي', en: 'Live Monitoring', min: PLAN_CODES.MEDICAL },
  { id: 'registry', ar: 'سجل الجلسات', en: 'Session Registry', min: PLAN_CODES.INSTITUTION },
  { id: 'research', ar: 'مركز الأبحاث', en: 'Research Center', min: PLAN_CODES.INSTITUTION },
  { id: 'access', ar: 'التحكم السيادي', en: 'Sovereign Control', min: PLAN_CODES.INSTITUTION },
  { id: 'assessment', ar: 'التقييم الشامل (معزول)', en: 'Full Assessment (isolated)', min: PLAN_CODES.ASSESSMENT_ONLY, assessmentOnly: true },
].map((row) => ({ ...row, video: `/videos/promo-${row.id}.mp4` }));

const PLAN_COLUMNS = [
  { code: PLAN_CODES.FREE, accent: 'text-slate-300' },
  { code: PLAN_CODES.TUTOR, accent: 'text-[#e8c872]' },
  { code: PLAN_CODES.MEDICAL, accent: 'text-cyan-300' },
  { code: PLAN_CODES.INSTITUTION, accent: 'text-[#e8c872]', featured: true },
  { code: PLAN_CODES.ASSESSMENT_ONLY, accent: 'text-blue-300' },
];

function rowAllowedForPlan(row, planCode) {
  const p = normalizePlanCode(planCode);
  if (row.assessmentOnly) return p === PLAN_CODES.ASSESSMENT_ONLY;
  if (p === PLAN_CODES.ASSESSMENT_ONLY) return row.id === 'diagnostics' || row.id === 'assessment';
  return planAllows(p, row.id === 'assessment' ? 'diagnostics' : row.id);
}

export default function AunakPaywall({ lang = 'ar', featureName, currentPlan = PLAN_CODES.FREE, onActivate }) {
  const [promoRow, setPromoRow] = useState(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const t = {
    ar: {
      locked: (f) => `"${f}" خارج نطاق باقتك الحالية`,
      hint: 'المصفوفة الخماسية السيادية — انقر على ميزة مقفلة أو فعّل اشتراكك:',
      currentPlan: 'باقتك الحالية:',
      feature: 'الميزة',
      upgrade: 'إدخال كود التفعيل',
      featured: 'الأكثر قيمة',
      you: 'أنت هنا',
      promoTitle: 'عرض توضيحي قصير',
      promoFallback: 'العرض قيد الإنتاج — تفعّل فوراً بكود من الإدارة',
      close: 'إغلاق',
      watch: 'مشاهدة العرض',
    },
    en: {
      locked: (f) => `"${f}" is outside your current plan`,
      hint: 'Sovereign five-tier matrix — click a locked feature or activate:',
      currentPlan: 'Your current plan:',
      feature: 'Feature',
      upgrade: 'Enter Activation Code',
      featured: 'Best Value',
      you: 'You are here',
      promoTitle: 'Promotional Micro-Video',
      promoFallback: 'Video in production — activate with admin code',
      close: 'Close',
      watch: 'Watch promo',
    },
  };
  const copy = t[lang] ?? t.ar;
  const labels = PLAN_LABELS[lang] ?? PLAN_LABELS.ar;
  const current = normalizePlanCode(currentPlan);

  const openPromo = (row) => {
    setVideoFailed(false);
    setPromoRow(row);
  };

  return (
    <div className={`relative min-h-full rounded-3xl overflow-hidden min-h-full bg-[#0a0a0c] text-slate-300`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[#0a0a0c]">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-full backdrop-blur-2xl bg-[#0d0d10]/90/55 border border-white/10 p-6 md:p-10 flex items-center justify-center">
        <div className="max-w-5xl w-full">
          <header className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-400" strokeWidth={1.4} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-300 mb-2">{copy.locked(featureName)}</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{copy.hint}</p>
            <p className="mt-3 text-xs font-mono text-[#e8c872]">
              {copy.currentPlan}{' '}
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-500/30">
                {labels[current] ?? current}
              </span>
            </p>
          </header>

          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-start p-3 text-slate-400 font-bold text-xs">{copy.feature}</th>
                    {PLAN_COLUMNS.map(({ code, accent, featured }) => (
                      <th key={code} className={`p-3 text-center font-bold whitespace-nowrap text-xs ${accent} ${featured ? 'bg-gradient-to-r from-[#c9a962] to-[#d4af37]/[0.06]' : ''}`}>
                        {labels[code]}
                        {code === current && <span className="block text-[9px] text-slate-500">({copy.you})</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row) => {
                    const rowLocked = !rowAllowedForPlan(row, current);
                    return (
                      <tr key={row.id} className="border-b border-white/5 last:border-0">
                        <td className="p-3 text-slate-300 font-medium text-xs">
                          {rowLocked ? (
                            <button type="button" onClick={() => openPromo(row)} className="inline-flex items-center gap-2 hover:text-[#e8c872]">
                              <PlayCircle className="w-4 h-4 shrink-0" />
                              {lang === 'ar' ? row.ar : row.en}
                            </button>
                          ) : (
                            lang === 'ar' ? row.ar : row.en
                          )}
                        </td>
                        {PLAN_COLUMNS.map(({ code, featured }) => (
                          <td key={code} className={`p-3 text-center ${featured ? 'bg-gradient-to-r from-[#c9a962] to-[#d4af37]/[0.06]' : ''}`}>
                            {rowAllowedForPlan(row, code) ? (
                              <Check className="w-4 h-4 text-emerald-400 inline" strokeWidth={2.5} />
                            ) : (
                              <Minus className="w-4 h-4 text-slate-700 inline" />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-5 bg-white/[0.03] border-t border-white/10 flex justify-center">
              <button
                type="button"
                onClick={onActivate}
                className="px-10 py-3.5 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-black text-base hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <KeyRound className="w-5 h-5" /> {copy.upgrade}
              </button>
            </div>
          </div>
        </div>
      </div>

      {promoRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-[#0d0d10]/90/70" onClick={() => setPromoRow(null)}>
          <div className="max-w-2xl w-full rounded-3xl bg-white/[0.06] border border-white/15 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-300 mb-4">{copy.promoTitle}</h3>
            <p className="text-sm text-slate-400">{copy.promoFallback}</p>
            <button type="button" onClick={() => setPromoRow(null)} className="mt-4 text-xs text-slate-500">{copy.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
