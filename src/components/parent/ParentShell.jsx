import { useCallback, useEffect, useState } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import {
  findStudentByParentToken,
  parseParentRouteToken,
  isParentSessionVerified,
  assertParentSubscription,
  clearParentSession,
  tryParentMasterBypass,
} from '../../lib/parentAccess';
import ParentBiometricGate from './ParentBiometricGate';
import ParentDashboard from './ParentDashboard';
import { LUX } from '../../lib/luxTheme';

export default function ParentShell({ lang: langProp = 'ar' }) {
  const [lang] = useState(langProp);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const routeToken = parseParentRouteToken();
    if (!routeToken) {
      setError(
        lang === 'en'
          ? 'Missing parent token in URL (?token=AUN-PRT-...)'
          : 'رمز الأهل مفقود في الرابط (?token=AUN-PRT-...)'
      );
      setLoading(false);
      return;
    }
    try {
      const row = await findStudentByParentToken(routeToken);
      if (!row) {
        setError(
          lang === 'en'
            ? 'Invalid or unregistered parent token'
            : 'رمز الأهل غير صالح أو غير مسجّل'
        );
        setLoading(false);
        return;
      }
      if (!assertParentSubscription(row)) {
        setError(
          lang === 'en'
            ? 'Subscription is not active — activate your plan first'
            : 'الاشتراك غير مفعّل — فعّل الباقة أولاً'
        );
        setLoading(false);
        return;
      }
      setToken(routeToken);
      setStudent(row);
      tryParentMasterBypass({ token: routeToken, studentId: row.id });
      setVerified(isParentSessionVerified(routeToken, row.id));
    } catch {
      setError(lang === 'en' ? 'Connection error' : 'خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    clearParentSession();
    setVerified(false);
  };

  const copy =
    lang === 'en'
      ? { loading: 'Verifying parent token…' }
      : { loading: 'جاري التحقق من رمز الأهل…' };

  if (loading) {
    return (
      <div className={`${LUX.page} flex flex-col items-center justify-center gap-4`}>
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
        <p className={LUX.muted}>{copy.loading}</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className={`${LUX.page} flex flex-col items-center justify-center p-6 text-center gap-4`}>
        <KeyRound className="w-12 h-12 text-rose-400/60" />
        <p className="text-rose-300 max-w-md">{error}</p>
        <p className={`text-xs ${LUX.muted} font-mono`}>?token=AUN-PRT-XXXXXXXX-XXXXXXXX</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <ParentBiometricGate
        lang={lang}
        student={student}
        parentToken={token}
        onVerified={() => setVerified(true)}
      />
    );
  }

  return (
    <ParentDashboard
      lang={lang}
      student={student}
      parentToken={token}
      onLogout={handleLogout}
    />
  );
}
