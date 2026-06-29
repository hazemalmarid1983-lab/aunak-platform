import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ScanFace,
  ArrowLeft,
  Ban,
} from 'lucide-react';
import {
  fetchStudents,
  saveStudentFaceBiometric,
  createCameraAccessPermission,
  promoteStudentStatus,
} from '../lib/airtable';
import {
  captureStableDescriptor,
  descriptorToJson,
  ensureBiometricModels,
  assertFaceUniqueInRegistry,
  FACE_DUPLICATE_BLOCKED,
} from '../lib/biometricMatch';
import { useBiometricScan } from '../hooks/useBiometricScan';
import { activateSovereignBiometricLogin } from '../lib/sovereignLogin';
import { useAuth } from '../lib/auth';
import { LUX } from '../lib/luxTheme';
import SovereignMasterBypassPanel from './SovereignMasterBypassPanel';
import { isMasterBypassActive } from '../lib/sovereignMasterBypass';

function BiometricVerifyStep({ recordId, referenceDescriptorJson, lang, onVerified }) {
  const { login } = useAuth();
  const startedRef = useRef(false);

  const copy =
    lang === 'en'
      ? {
          title: 'Sovereign identity verification',
          hint: 'Full-registry anti-spoof check — face must match capture',
          scanning: 'Verifying against sovereign registry',
          retry: 'Retry',
        }
      : {
          title: 'التحقق السيادي من الهوية',
          hint: 'فحص anti-spoof على السجل الكامل — يجب مطابقة اللقطة',
          scanning: 'جاري التحقق مقابل السجل السيادي',
          retry: 'إعادة المحاولة',
        };

  const handleMatch = useCallback(
    async (payload) => {
      const session = await activateSovereignBiometricLogin(payload, login, lang);
      if (session) onVerified?.(session);
    },
    [lang, login, onVerified]
  );

  const scan = useBiometricScan({
    lang,
    selectedStudentId: recordId,
    requireStudentSelection: true,
    playChimeOnMatch: true,
    enrollmentMode: true,
    enrollmentReferenceDescriptor: referenceDescriptorJson,
    onSovereignMatch: handleMatch,
  });

  useEffect(() => {
    if (!recordId || !referenceDescriptorJson || startedRef.current) return;
    startedRef.current = true;
    const frame = requestAnimationFrame(() => scan.startScan());
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, referenceDescriptorJson]);

  return (
    <div className="max-w-lg mx-auto bg-[#12121a]/70 backdrop-blur-xl border border-emerald-400/25 rounded-3xl p-6">
      <div className="text-center mb-4">
        <ScanFace className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-emerald-300">{copy.title}</h2>
        <p className="text-sm text-slate-400 mt-2">{copy.hint}</p>
      </div>
      <div className="aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black mb-4 relative">
        <video ref={scan.videoRef} className="w-full h-full object-cover mirror" playsInline autoPlay muted />
        {scan.scanState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          </div>
        )}
      </div>
      {(scan.scanState === 'scanning' || scan.scanState === 'loading') && (
        <p className="text-center text-sm font-mono text-[#e8c872]">
          {copy.scanning} — {scan.similarityPercent.toFixed(1)}%
        </p>
      )}
      {scan.scanState === 'error' && (
        <>
          <p className="text-center text-rose-300 text-sm mb-3">{scan.errorMsg}</p>
          <button
            type="button"
            onClick={() => {
              startedRef.current = false;
              scan.reset();
              requestAnimationFrame(() => {
                startedRef.current = true;
                scan.startScan();
              });
            }}
            className="w-full py-2.5 rounded-xl border border-emerald-400/40 text-emerald-300 text-sm"
          >
            {copy.retry}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Post-payment biometric enrollment only — camera blocked until subscription active.
 * Anti-spoof: full Airtable registry scan before save.
 */
export default function PostActivationBiometric({
  lang = 'ar',
  recordId,
  studentName,
  onComplete,
  onBlocked,
}) {
  const [step, setStep] = useState('consent');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [descriptorJson, setDescriptorJson] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const copy =
    lang === 'en'
      ? {
          consentTitle: 'Biometric enrollment (post-payment)',
          consentBody:
            'After payment confirmation only — your face is scanned once and checked against the entire sovereign registry to prevent duplicate enrollment.',
          startCamera: 'Start secure camera',
          capture: 'Capture & verify uniqueness',
          saving: 'Scanning full registry...',
          blockedTitle: 'Registration blocked',
          back: 'Back',
          errCamera: 'Camera unavailable',
          errCapture: 'Could not capture stable face',
        }
      : {
          consentTitle: 'تسجيل البصمة (بعد السداد فقط)',
          consentBody:
            'بعد تأكيد السداد فقط — تُلتقط البصمة مرة واحدة وتُقارن بكامل السجل السيادي لمنع التسجيل المكرر والتحايل.',
          startCamera: 'تشغيل الكاميرا الآمنة',
          capture: 'التقاط والتحقق من عدم التكرار',
          saving: 'جاري فحص السجل الكامل...',
          blockedTitle: 'تم حظر التسجيل',
          back: 'رجوع',
          errCamera: 'تعذر تشغيل الكاميرا',
          errCapture: 'تعذر التقاط وجه مستقر',
        };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (step !== 'capture' || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => setError(copy.errCamera));
  }, [step, copy.errCamera]);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setStep('capture');
    } catch {
      setError(copy.errCamera);
    }
  };

  const captureAndValidate = async () => {
    if (!recordId || !videoRef.current) return;
    setBusy(true);
    setError('');
    try {
      await ensureBiometricModels();
      const stable = await captureStableDescriptor(videoRef.current);
      if (!stable?.descriptor) throw new Error(copy.errCapture);

      const registry = await fetchStudents();
      assertFaceUniqueInRegistry(registry, stable.descriptor, recordId, lang);

      const json = descriptorToJson(stable.descriptor);
      await saveStudentFaceBiometric(recordId, json);
      await createCameraAccessPermission(recordId, studentName?.trim() || '');
      try {
        await promoteStudentStatus(recordId);
      } catch {
        /* non-blocking */
      }

      setDescriptorJson(json);
      stopCamera();
      setStep('verify');
    } catch (e) {
      if (e?.code === FACE_DUPLICATE_BLOCKED) {
        setBlocked(true);
        setError(e.message);
        stopCamera();
        onBlocked?.(e);
      } else {
        setError(e?.message || copy.errCapture);
      }
    } finally {
      setBusy(false);
    }
  };

  if (blocked) {
    return (
      <div className="max-w-md mx-auto text-center rounded-3xl border-2 border-rose-500/50 bg-rose-950/30 p-8">
        <Ban className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-rose-300 mb-3">{copy.blockedTitle}</h2>
        <p className="text-sm text-rose-200/90 leading-relaxed">{error}</p>
        <ShieldAlert className="w-8 h-8 text-rose-400/60 mx-auto mt-6" />
        <SovereignMasterBypassPanel
          lang={lang}
          onUnlocked={() => {
            setBlocked(false);
            setError('');
            setStep('consent');
          }}
        />
      </div>
    );
  }

  if (step === 'verify' && descriptorJson) {
    return (
      <BiometricVerifyStep
        recordId={recordId}
        referenceDescriptorJson={descriptorJson}
        lang={lang}
        onVerified={onComplete}
      />
    );
  }

  if (step === 'capture') {
    return (
      <div className="max-w-lg mx-auto bg-[#12121a]/70 backdrop-blur-xl border border-emerald-400/25 rounded-3xl p-6">
        <div className="aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black mb-4">
          <video ref={videoRef} className="w-full h-full object-cover mirror" playsInline autoPlay muted />
        </div>
        <p className="text-xs text-amber-400/90 font-mono text-center mb-3">
          {lang === 'ar' ? '🔒 فحص anti-spoof — مقارنة بكامل قاعدة Airtable' : '🔒 Anti-spoof — full Airtable registry scan'}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={captureAndValidate}
          className={`${LUX.btnEmerald} w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
          {busy ? copy.saving : copy.capture}
        </button>
        {error && <p className="text-rose-300 text-sm mt-3 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center bg-[#12121a]/70 backdrop-blur-xl border border-emerald-400/25 rounded-3xl p-8">
      <ShieldCheck className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-emerald-300 mb-2">{copy.consentTitle}</h2>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{copy.consentBody}</p>
      {error && <p className="text-rose-300 text-sm mb-4">{error}</p>}
      <button type="button" onClick={startCamera} className={`${LUX.btnEmerald} px-8 py-3 rounded-xl font-bold`}>
        <Camera className="w-5 h-5 inline me-2" />
        {copy.startCamera}
      </button>
      {isMasterBypassActive() && (
        <p className="text-[10px] text-amber-400/80 font-mono mt-4">MASTER BYPASS · anti-spoof off</p>
      )}
      <SovereignMasterBypassPanel lang={lang} compact />
    </div>
  );
}
