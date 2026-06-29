import { ChevronLeft, FileBarChart } from 'lucide-react';
import { ACADEMY } from '../../lib/academyTheme';

function ReportSection({ title, summary, children }) {
  return (
    <section className={`${ACADEMY.parentCard} mb-4`}>
      <h3 className={`${ACADEMY.parentTitle} mb-2`}>{title}</h3>
      <p className="text-sm text-slate-600 mb-3">{summary}</p>
      {children}
    </section>
  );
}

function LeapCertificate({ lang, cert }) {
  if (!cert) return null;
  return (
    <div className={`${ACADEMY.parentCard} border-amber-200`}>
      <h3 className={`${ACADEMY.parentTitle} text-center mb-2`}>{cert.title}</h3>
      <p className="text-center text-sm text-slate-500 mb-4">{cert.subtitle}</p>
      {!cert.unlocked ? (
        <p className="text-center text-slate-500 text-sm">
          {lang === 'ar' ? 'تُفتح بعد شهرين أو 20 مغامرة' : 'Unlocks after 2 months or 20 adventures'}
        </p>
      ) : (
        <>
          <p className="text-center font-bold text-emerald-700 mb-4">{cert.heroMessage}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {cert.comparisons.map(({ track, entryStars, currentStars, message }) => (
              <div key={track.id} className="p-3 rounded-xl bg-white border border-slate-100">
                <p className="font-bold text-sm">{lang === 'ar' ? track.labelAr : track.labelEn}</p>
                <p className="text-xs text-slate-400">{lang === 'ar' ? 'دخول' : 'Entry'}: {entryStars}</p>
                <p className="text-xs text-slate-400">{lang === 'ar' ? 'اليوم' : 'Now'}: {currentStars}</p>
                <p className="text-sm text-amber-600 mt-1">{message}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AcademyParentZone({ lang, report, cert, onBack }) {
  const copy = {
    ar: { back: 'المغامرات', weekly: 'التقرير الأسبوعي', silent: 'للأهل فقط' },
    en: { back: 'Adventures', weekly: 'Weekly Report', silent: 'Parents only' },
  }[lang];

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className={ACADEMY.btnGhost}>
        <ChevronLeft className="w-4 h-4 inline" /> {copy.back}
      </button>
      {report && (
        <ReportSection title={`📊 ${copy.weekly}`} summary={report.summary}>
          <p className="text-xs text-amber-600 font-mono mb-3">{report.silentNote ?? copy.silent}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {report.trackInsights?.map(({ track, trend }) => (
              <div key={track.id} className="p-2 rounded-lg bg-slate-100 text-sm">
                <span className="font-bold">{lang === 'ar' ? track.labelAr : track.labelEn}</span>
                <span className="text-slate-500 block text-xs">{trend}</span>
              </div>
            ))}
          </div>
        </ReportSection>
      )}
      <LeapCertificate lang={lang} cert={cert} />
    </div>
  );
}

export function AcademyParentButton({ lang, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`${ACADEMY.btnGhost} flex items-center gap-2`}>
      <FileBarChart className="w-4 h-4" />
      {lang === 'ar' ? 'منطقة الأهل' : 'Parent Zone'}
    </button>
  );
}
