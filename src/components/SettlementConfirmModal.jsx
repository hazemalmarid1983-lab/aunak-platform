import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchAccessControlByEmail } from '../lib/airtable';
import { verifySpecialistPin } from '../lib/settlementEngine';

export default function SettlementConfirmModal({
  lang = 'ar',
  open,
  onClose,
  onConfirm,
  reconciliation,
  sessionDate,
  specialistEmail,
  specialistName,
  studentName,
  sessionFee,
  saving,
  sovereign,
}) {
  const [pin, setPin] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [pinError, setPinError] = useState('');
  const [accessRecord, setAccessRecord] = useState(null);

  const claimCount = reconciliation?.claimCount ?? 0;
  const ledgerCount = reconciliation?.ledgerCount ?? 0;
  const afterSeal = claimCount + 1;
  const matched = ledgerCount === claimCount;

  const t = {
    ar: {
      title: 'تأكيد تسوية الجلسة',
      date: 'التاريخ',
      specialist: 'الأخصائي',
      student: 'الطالب',
      yourClaims: 'مطالباتك اليوم',
      centerLedger: 'دفتر المركز',
      afterThis: 'بعد إغلاق هذه الجلسة',
      fee: 'مستحقات الجلسة',
      match: 'متطابق',
      mismatch: 'فرق — سيُزامَن تلقائياً بعد الختم',
      confirmLabel: 'أؤكد أن العدد صحيح ولا يمكن تعديله لاحقاً',
      pinLabel: 'رمز PIN (آخر 4 أرقام من رمز الوصول أو رمز التسوية)',
      pinRequired: 'أدخل PIN صحيحاً للأخصائي',
      pinInvalid: 'PIN غير صحيح',
      seal: 'إنهاء وختم الجلسة (Sealed)',
      cancel: 'إلغاء',
      sovereignSkip: 'تخطي PIN — اعتماد سيادي',
      sealedNote: 'الجلسة ستُختم Sealed — غير قابلة للتعديل',
    },
    en: {
      title: 'Session Settlement Confirmation',
      date: 'Date',
      specialist: 'Specialist',
      student: 'Student',
      yourClaims: 'Your claims today',
      centerLedger: 'Center ledger',
      afterThis: 'After closing this session',
      fee: 'Session fee',
      match: 'Matched',
      mismatch: 'Difference — auto-sync after seal',
      confirmLabel: 'I confirm the count is correct and cannot be changed later',
      pinLabel: 'PIN (last 4 of access token or settlement PIN)',
      pinRequired: 'Enter a valid specialist PIN',
      pinInvalid: 'Invalid PIN',
      seal: 'End & Seal Session',
      cancel: 'Cancel',
      sovereignSkip: 'Skip PIN — sovereign override',
      sealedNote: 'Session will be Sealed — immutable',
    },
  };
  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (!open || !specialistEmail) return;
    setPin('');
    setConfirmed(false);
    setPinError('');
    fetchAccessControlByEmail(specialistEmail).then(setAccessRecord).catch(() => setAccessRecord(null));
  }, [open, specialistEmail]);

  if (!open) return null;

  const handleSeal = () => {
    if (!confirmed) return;
    if (!sovereign) {
      if (!pin.trim()) {
        setPinError(copy.pinRequired);
        return;
      }
      if (!verifySpecialistPin(accessRecord, pin)) {
        setPinError(copy.pinInvalid);
        return;
      }
    }
    setPinError('');
    onConfirm({ pinVerified: !sovereign, pin: pin.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full rounded-3xl bg-[#12121a] border border-[#c9a962]/25 shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4 border-b border-[#c9a962]/15 pb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-200">{copy.title}</h3>
        </div>

        <div className="space-y-2 text-sm mb-4 font-mono">
          <p className="text-slate-500">{copy.date}: <span className="text-slate-300">{sessionDate}</span></p>
          <p className="text-slate-500">{copy.specialist}: <span className="text-[#e8c872]">{specialistName || specialistEmail}</span></p>
          <p className="text-slate-500">{copy.student}: <span className="text-slate-200">{studentName}</span></p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10">
            <p className="text-[10px] text-slate-500">{copy.yourClaims}</p>
            <p className="text-xl font-bold text-[#e8c872]">{claimCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10">
            <p className="text-[10px] text-slate-500">{copy.centerLedger}</p>
            <p className="text-xl font-bold text-[#e8c872]">{ledgerCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10">
            <p className="text-[10px] text-slate-500">{copy.afterThis}</p>
            <p className="text-xl font-bold text-emerald-400">{afterSeal}</p>
          </div>
        </div>

        <p className={`text-xs mb-3 flex items-center gap-2 ${matched ? 'text-emerald-400' : 'text-amber-400'}`}>
          {matched ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {matched ? copy.match : copy.mismatch}
        </p>

        <p className="text-xs text-slate-500 mb-4">{copy.fee}: {sessionFee || '—'}</p>

        <label className="flex items-start gap-2 text-xs text-slate-300 mb-4 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
          {copy.confirmLabel}
        </label>

        {!sovereign && (
          <div className="mb-4">
            <label className="text-xs text-slate-400 block mb-1">{copy.pinLabel}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(''); }}
              className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 font-mono text-center tracking-widest"
              placeholder="••••"
            />
            {pinError && <p className="text-xs text-rose-400 mt-1">{pinError}</p>}
          </div>
        )}

        <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-4">
          <Lock className="w-3 h-3" /> {copy.sealedNote}
        </p>

        <div className="flex gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">
            {copy.cancel}
          </button>
          <button
            type="button"
            disabled={saving || !confirmed}
            onClick={handleSeal}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {copy.seal}
          </button>
        </div>
      </div>
    </div>
  );
}
