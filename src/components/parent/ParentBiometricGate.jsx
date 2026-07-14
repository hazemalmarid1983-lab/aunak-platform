import { useCallback, useEffect, useRef, useState } from 'react';
import { ScanFace, ShieldCheck, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useBiometricScan } from '../../hooks/useBiometricScan';
import { SOVEREIGN_MATCH_CONFIDENCE } from '../../lib/biometricMatch';
import { tryParentMasterBypass, writeParentSession } from '../../lib/parentAccess';
import { shouldAutoApproveBiometric } from '../../lib/sovereignMasterBypass';
import PlatformLogo from '../PlatformLogo';
import { LUX } from '../../lib/luxTheme';

export default function ParentBiometricGate({
  lang = 'ar',
  student,
  parentToken,
  onVerified,
}) {
  const [entering, setEntering] = useState(false);
  const matchHandledRef = useRef(false);

  const copy =
    lang === 'en'
      ? {
          title: 'Parent secure gate',
          subtitle: 'Face verification for your beneficiary only — no other records are shown',
          hint: 'Sovereign match ≥94.7% required',
          start: 'Start face verification',
          scanning: 'Scanning…',
          success: 'Verified — opening your dashboard',
          child: 'Beneficiary',
          tokenOk: 'Parent token accepted',
        }
      : {
          title: 'بوابة الأهل الآمنة',
          subtitle: 'تحقق بصمة الوجه للمستفيد فقط — لا تُعرض سجلات أخرى',
          hint: 'مطلوب تطابق سيادي ≥94.7%',
          start: 'بدء التحقق بالوجه',
          scanning: 'جاري المسح…',
          success: 'تم التحقق — فتح لوحة الأهل',
          child: 'المستفيد',
          tokenOk: 'رمز الأهل مقبول',
        };

  const handleMatch = useCallback(
    async (payload) => {
      if (matchHandledRef.current) return;
      if (payload.student?.id !== student?.id) return;
      matchHandledRef.current = true;
      setEntering(true);
      try {
        writeParentSession({
          token: parentToken,
          studentId: student.id,
          verified: true,
          verifiedAt: new Date().toISOString(),
          similarityPercent: payload.similarityPercent,
        });
        onVerified?.(payload);
      } finally {
        setEntering(false);
      }
    },
    [onVerified, parentToken, student?.id]
  );

  useEffect(() => {
    if (!student?.id || !parentToken || matchHandledRef.current) return;

    const viaMaster = tryParentMasterBypass({ token: parentToken, studentId: student.id });
    const viaDev = shouldAutoApproveBiometric();
    if (!viaMaster && !viaDev) return;

    if (!viaMaster) {
      writeParentSession({
        token: parentToken,
        studentId: student.id,
        verified: true,
        verifiedAt: new Date().toISOString(),
        similarityPercent: 100,
        masterBypass: true,
      });
    }

    matchHandledRef.current = true;
    onVerified?.({ masterBypass: true, similarityPercent: 100, student });
  }, [onVerified, parentToken, student]);

  const scan = useBiometricScan({
    lang,
    playChimeOnMatch: true,
    onSovereignMatch: handleMatch,
    selectedStudentId: student?.id ?? null,
    requireStudentSelection: true,
  });

  const busy = entering || scan.scanState === 'loading' || scan.scanState === 'scanning';

  if (shouldAutoApproveBiometric()) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={LUX.pageWrap}>
        <div className={LUX.pageWrapGradient} aria-hidden />
        <div className={`relative z-10 ${LUX.pageFlex} items-center justify-center p-6`}>
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <p className="text-emerald-300 text-sm font-bold">
              {lang === 'en' ? 'Auto-approve (DEV) — opening dashboard' : 'عبور تلقائي (DEV) — فتح اللوحة'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={LUX.pageWrap}>
      <div className={LUX.pageWrapGradient} aria-hidden />
      <div className={`relative z-10 ${LUX.pageFlex} items-center justify-center p-6`}>
        <div className={`w-full max-w-lg ${LUX.glassCard} space-y-6`}>
          <div className="flex flex-col items-center text-center gap-3">
            <PlatformLogo lang={lang} className="w-16 h-16" iconClassName="w-14 h-14" />
            <h1 className={LUX.headingGold}>{copy.title}</h1>
            <p className={`${LUX.muted} text-sm max-w-md`}>{copy.subtitle}</p>
          </div>

          <div className={`rounded-2xl border ${LUX.borderGold} bg-[#0d0d10]/60 p-4 space-y-2`}>
            <div className={`flex items-center gap-2 text-xs ${LUX.emeraldAccent}`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {copy.tokenOk}
            </div>
            <p className="text-sm text-slate-300">
              {copy.child}:{' '}
              <span className="font-bold text-[#e8c872]">{student?.name ?? '—'}</span>
            </p>
            <p className={`text-xs font-mono ${LUX.muted}`}>{copy.hint}</p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.08] bg-black/40">
            <video
              ref={scan.videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {(scan.scanState === 'idle' || scan.scanState === 'error') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <ScanFace className="w-16 h-16 text-[#c9a962]/40" />
              </div>
            )}
            {scan.scanState === 'success' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/70 gap-2">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
                <p className="text-emerald-200 text-sm font-bold">{copy.success}</p>
              </div>
            )}
          </div>

          {scan.similarityPercent > 0 && scan.scanState !== 'success' && (
            <p className={`text-center text-sm font-mono ${LUX.goldMono}`}>
              {scan.similarityPercent.toFixed(1)}% / {SOVEREIGN_MATCH_CONFIDENCE}%
            </p>
          )}

          {scan.errorMsg && (
            <div className={`flex items-start gap-2 ${LUX.errorRose} text-sm`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{scan.errorMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {(scan.scanState === 'idle' || scan.scanState === 'error') && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  matchHandledRef.current = false;
                  scan.reset();
                  scan.startScan();
                }}
                className={LUX.btnGold}
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin inline" /> : copy.start}
              </button>
            )}
            {scan.scanState === 'error' && (
              <button type="button" onClick={scan.reset} className={LUX.btnGhost}>
                <RefreshCw className="w-4 h-4 inline" /> {lang === 'en' ? 'Reset' : 'إعادة'}
              </button>
            )}
            {busy && scan.scanState !== 'error' && (
              <div className={`flex items-center gap-2 ${LUX.goldMono} text-sm`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                {copy.scanning}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
