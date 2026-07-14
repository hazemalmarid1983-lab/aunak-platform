import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../lib/auth';
import { getField, updateStudentRecord } from '../lib/airtable';
import { STUDENT as SF } from '../lib/airtableFields';
import { hasB2BPremiumTag, B2B_PREMIUM_TAG } from '../lib/plans';
import {
  buildZeroPointReport,
  fieldsForScale,
  parseZeroPointReport,
  saveZeroPointReport,
  serializeZeroPointReport,
} from '../lib/zeroPointSchema';
import { ClipboardList, BrainCircuit, Activity, CheckCircle, AlertTriangle, Lock, Loader2 } from 'lucide-react';
import { StatusBadge, TruncateTooltip } from './ui/SovereignTable';

export default function AunakDiagnostics({ lang = 'ar' }) {
  const { students, refetch } = useStudents(lang);
  const { user } = useAuth();
  const [activeScale, setActiveScale] = useState('CARS-2');
  const [reportRequested, setReportRequested] = useState(false);
  const [rawNotes, setRawNotes] = useState('');
  const [finalScore, setFinalScore] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  const activeStudent = useMemo(() => {
    const activeId = user?.activeStudentId ?? user?.childId ?? null;
    const list = Array.isArray(students) ? students : [];
    return list.find((s) => s.id === activeId) ?? list[0] ?? null;
  }, [students, user]);

  const existingReport = useMemo(() => {
    const raw = getField(activeStudent?.fields ?? {}, SF.zero_point_report);
    return parseZeroPointReport(raw);
  }, [activeStudent]);

  useEffect(() => {
    const prior = existingReport?.fields ?? {};
    setFieldValues(prior);
    if (existingReport?.fields?.meta_raw_notes) {
      setRawNotes(String(existingReport.fields.meta_raw_notes));
    }
    if (existingReport?.fields?.meta_final_score != null) {
      setFinalScore(String(existingReport.fields.meta_final_score));
    }
    if (existingReport?.active_scale) setActiveScale(existingReport.active_scale);
  }, [activeStudent?.id, existingReport]);

  const scaleFields = useMemo(() => fieldsForScale(activeScale), [activeScale]);

  const premiumVerified = useMemo(() => {
    const fields = activeStudent?.fields ?? {};
    const raw = getField(fields, SF.subscription_status);
    return hasB2BPremiumTag(raw);
  }, [activeStudent]);

  const zeroReportFromAirtable = useMemo(() => {
    if (existingReport) return serializeZeroPointReport(existingReport);
    return null;
  }, [existingReport]);

  const t = {
    ar: {
      title: 'مقاييس التشخيص والتقييم',
      subtitle: 'إدارة مقاييس (CARS-2, GARS-3, VB-MAPP) وتقرير نقطة الصفر الذكي',
      selectedStudent: 'المستفيد المحدد للمسح النمائي:',
      scaleTitle: 'مقياس',
      inProgress: 'قيد المسح النمائي',
      clinicalItems: 'بنود المقياس السريرية (0–4)',
      rawData: 'البيانات الخام (Raw Data)',
      rawPlaceholder: 'أدخل الملاحظات السريرية التكميلية…',
      finalScore: 'مؤشر التناغم النفس-عصبي وقياس خط الأساس',
      points: 'درجة',
      saveScore: 'حفظ تقرير نقطة الصفر (66 حقل)',
      saving: 'جاري الحفظ إلى Students.zero_point_report…',
      saved: 'تم حفظ الـ 66 حقلاً وتحديث programmed_goal',
      saveFailed: 'فشل الحفظ — تحقق من الاتصال',
      zeroReport: 'تقرير نقطة الصفر (AI Zero-Point Report)',
      generateReport: 'توليد التشخيص العام',
      reportLocked: `توليد التقرير يتطلب وسم ${B2B_PREMIUM_TAG} في حقل subscription_status بسجل المستفيد`,
      zeroReportEmpty: 'لا يوجد تقرير نقطة صفر — أدخل البنود السريرية واحفظ.',
      noStudent: 'لم يُحدد مستفيد — اختر مستفيداً من البوابة أو سجل المستفيدين.',
    },
    en: {
      title: 'Diagnostics & Assessment Scales',
      subtitle: 'Manage CARS-2, GARS-3, VB-MAPP scales and AI zero-point report',
      selectedStudent: 'Selected beneficiary for developmental screening:',
      scaleTitle: 'Scale',
      inProgress: 'Screening in progress',
      clinicalItems: 'Clinical scale items (0–4)',
      rawData: 'Raw Data',
      rawPlaceholder: 'Enter supplemental clinical notes…',
      finalScore: 'Neuro-psych harmony index & baseline',
      points: 'points',
      saveScore: 'Save zero-point report (66 fields)',
      saving: 'Saving to Students.zero_point_report…',
      saved: 'All 66 fields saved — programmed_goal updated',
      saveFailed: 'Save failed — check connection',
      zeroReport: 'AI Zero-Point Report',
      generateReport: 'Generate General Diagnosis',
      reportLocked: `Report generation requires the ${B2B_PREMIUM_TAG} tag in the beneficiary's subscription_status field`,
      zeroReportEmpty: 'No zero-point report — enter clinical items and save.',
      noStudent: 'No beneficiary selected — choose a beneficiary from the gate or registry.',
    },
  };

  const copy = t[lang] ?? t.ar;

  const setClinicalScore = useCallback((fieldId, value) => {
    const n = value === '' ? null : Math.max(0, Math.min(4, Number(value)));
    setFieldValues((prev) => ({ ...prev, [fieldId]: Number.isFinite(n) ? n : null }));
  }, []);

  const persistReport = useCallback(async () => {
    if (!activeStudent?.id) return;
    setSaving(true);
    setSaveError('');
    setSaveOk(false);
    try {
      await saveZeroPointReport(
        activeStudent.id,
        {
          activeScale,
          rawNotes,
          finalScore: finalScore === '' ? null : Number(finalScore),
          assessor: user?.name ?? user?.email ?? '',
          fieldValues,
          existingReport,
        },
        updateStudentRecord
      );
      setSaveOk(true);
      setReportRequested(true);
      refetch?.();
    } catch (err) {
      setSaveError(err?.message ?? copy.saveFailed);
    } finally {
      setSaving(false);
    }
  }, [
    activeStudent?.id,
    activeScale,
    rawNotes,
    finalScore,
    fieldValues,
    existingReport,
    user,
    refetch,
    copy.saveFailed,
  ]);

  const previewReport = useMemo(() => {
    if (!rawNotes && finalScore === '' && !Object.keys(fieldValues).length) return null;
    return buildZeroPointReport({
      activeScale,
      rawNotes,
      finalScore: finalScore === '' ? null : Number(finalScore),
      assessor: user?.name ?? '',
      fieldValues,
      existingReport,
    });
  }, [activeScale, rawNotes, finalScore, fieldValues, existingReport, user?.name]);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-3">
            <ClipboardList className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 p-5 rounded-2xl">
            <h3 className="text-sm text-slate-500 mb-2 font-bold">{copy.selectedStudent}</h3>
            <p className="text-xl font-bold text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> {activeStudent?.name || copy.noStudent}
            </p>
          </div>

          <nav className="space-y-2">
            {['CARS-2', 'GARS-3', 'VB-MAPP'].map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => setActiveScale(scale)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border font-bold transition-all ${activeScale === scale ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-[#e8c872] shadow-lg' : 'bg-[#12121a]/70 border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/90'}`}
              >
                {scale}
                {activeScale === scale && <Activity className="w-4 h-4" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
              <h3 className="text-2xl font-bold text-slate-300">
                {copy.scaleTitle} {activeScale}
              </h3>
              <StatusBadge variant="draft" label={copy.inProgress} />
            </div>

            <p className="text-xs uppercase tracking-widest text-fuchsia-300/80 font-mono mb-3">
              {copy.clinicalItems}
            </p>
            <div className="max-h-64 overflow-y-auto overflow-x-auto w-full border border-slate-800/50 rounded-xl scrollbar-thin scrollbar-thumb-amber-500/20 grid sm:grid-cols-2 gap-2 mb-6 p-2">
              {scaleFields.map((def, i) => (
                <label
                  key={def.id}
                  className={`flex items-center justify-between gap-2 py-4 px-6 rounded-lg border border-slate-800/60 text-xs transition-all duration-200 ease-in-out hover:bg-neutral-900/80 hover:border-amber-500/30 ${i % 2 === 1 ? 'bg-neutral-900/40' : 'bg-neutral-950'}`}
                >
                  <TruncateTooltip
                    text={lang === 'ar' ? def.labelAr : def.labelEn}
                    muted
                    maxWidthClass="max-w-[10rem]"
                  />
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={fieldValues[def.id] ?? ''}
                    onChange={(e) => setClinicalScore(def.id, e.target.value)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-md p-1 text-center text-neutral-200 font-mono shrink-0"
                  />
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.rawData}</label>
                <textarea
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  className="w-full h-32 bg-[#0d0d10]/90 border border-white/[0.08] rounded-xl p-4 text-slate-300 focus:border-fuchsia-500 outline-none font-mono text-sm"
                  placeholder={copy.rawPlaceholder}
                />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-white/[0.08]">
                  <p className="text-xs text-slate-500 mb-1 font-mono">{copy.finalScore}</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={finalScore}
                      onChange={(e) => setFinalScore(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-600 rounded-lg p-2 text-xl font-bold text-white text-center outline-none focus:border-fuchsia-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-slate-400">{copy.points}</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!activeStudent?.id || saving}
                  onClick={persistReport}
                  className="w-full py-3 bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? copy.saving : copy.saveScore}
                </button>
                {saveOk && <p className="text-xs text-emerald-400 font-bold">{copy.saved}</p>}
                {saveError && <p className="text-xs text-rose-400">{saveError}</p>}
              </div>
            </div>
          </div>

          <div className="bg-fuchsia-900/10 p-8 rounded-3xl border border-fuchsia-500/20">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-xl font-bold text-[#e8c872] flex items-center gap-2">
                <BrainCircuit className="w-6 h-6" /> {copy.zeroReport}
              </h3>
              <button
                type="button"
                disabled={!premiumVerified || saving}
                onClick={() => {
                  if (!premiumVerified) return;
                  persistReport();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${premiumVerified ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : 'bg-[#12121a]/70 text-slate-500 cursor-not-allowed border border-white/[0.08]'}`}
              >
                {!premiumVerified && <Lock className="w-3.5 h-3.5" />} {copy.generateReport}
              </button>
            </div>

            {!premiumVerified && (
              <p className="mb-4 text-xs text-[#e8c872] bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" /> {copy.reportLocked}
              </p>
            )}

            <div className="relative">
              <p
                className={`text-md text-fuchsia-200/80 leading-relaxed bg-fuchsia-950/50 p-5 rounded-xl border border-fuchsia-500/30 flex gap-4 items-start whitespace-pre-wrap font-mono text-xs ${premiumVerified && reportRequested ? '' : 'blur-[8px] select-none pointer-events-none'}`}
              >
                <AlertTriangle className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                {zeroReportFromAirtable ||
                  (previewReport ? serializeZeroPointReport(previewReport) : copy.zeroReportEmpty)}
              </p>
              {!(premiumVerified && reportRequested) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-4 py-1.5 rounded-full bg-[#0d0d10]/90 border border-fuchsia-500/40 text-[#e8c872] text-xs font-bold flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> {B2B_PREMIUM_TAG}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
