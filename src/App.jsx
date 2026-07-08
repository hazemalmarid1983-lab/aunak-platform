import { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import AunakEcosystemHub from './components/AunakEcosystemHub';
import AunakGate from './components/AunakGate';
import AunakActivationGate from './components/AunakActivationGate';
import AunakSummerAcademy from './components/AunakSummerAcademy';
import ChildInteractiveShell from './components/child/ChildInteractiveShell';
import ParentShell from './components/parent/ParentShell';
import PostActivationBiometric from './components/PostActivationBiometric';
import { AuthProvider, useAuth, isSubscriptionActive, isMinistryAuditor } from './lib/auth';
import { fetchStudents } from './lib/airtable';
import { needsActivationGate, activationGateReason } from './lib/subscriptionEngine';
import { landingForPlan, PLAN_CODES } from './lib/plans';
import { studentHasFaceBiometric } from './lib/biometricMatch';
import { Loader2 } from 'lucide-react';
import PaymentReturn from './components/PaymentReturn';
import { shouldShowTawasulShell } from './lib/tawasulConfig';
import TawasulGate from './components/tawasul/TawasulGate';
import TawasulHub from './components/tawasul/TawasulHub';
import AunakMinistryDashboard from './components/AunakMinistryDashboard';

function isSummerAcademyRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/summer-academy' || path.startsWith('/summer-academy/');
}

function isChildPlayRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/child' || path.startsWith('/child/');
}

function isParentDashboardRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/parent' || path.startsWith('/parent/');
}

function isPaymentReturnRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/payment/return' || path.startsWith('/payment/return');
}

function isMinistryRoute() {
  const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\/$/, '') || '/';
  return path === '/ministry' || path.startsWith('/ministry/');
}

function MinistryShell() {
  const { user, logout } = useAuth();
  if (!user) return <AunakGate />;
  if (!isMinistryAuditor(user)) {
    return <AunakGate />;
  }
  return <AunakMinistryDashboard lang="ar" user={user} onLogout={logout} />;
}

function SummerAcademyShell() {
  const { user } = useAuth();
  if (!user) return <AunakGate />;
  return <AunakSummerAcademy />;
}

function GatedPlatform() {
  const { user, patchSession, logout } = useAuth();
  const [biometricGate, setBiometricGate] = useState(null);

  useEffect(() => {
    if (!user?.childId) {
      setBiometricGate('skip');
      return;
    }
    if (!isSubscriptionActive(user.subscriptionRaw) && !user.subscriptionActivated) {
      setBiometricGate('skip');
      return;
    }
    let cancelled = false;
    fetchStudents()
      .then((students) => {
        if (cancelled) return;
        const row = students.find((s) => s.id === user.childId);
        setBiometricGate(studentHasFaceBiometric(row) ? 'done' : 'required');
      })
      .catch(() => {
        if (!cancelled) setBiometricGate('skip');
      });
    return () => {
      cancelled = true;
    };
  }, [user?.childId, user?.subscriptionRaw, user?.subscriptionActivated]);

  if (user?.tawasulMvp) {
    if (user?.sovereignFullView) {
      return (
        <>
          <AunakEcosystemHub />
          <button
            type="button"
            onClick={() => patchSession({ sovereignFullView: false })}
            className="fixed bottom-4 inset-x-0 mx-auto z-[60] w-fit flex items-center gap-2 px-4 py-2 rounded-full bg-[#12121a]/90 border border-cyan-500/40 text-cyan-200 text-xs font-bold backdrop-blur-md shadow-[0_0_24px_rgba(34,211,238,0.25)] hover:bg-[#12121a]"
          >
            ↩ العودة إلى تواصل
          </button>
        </>
      );
    }
    return (
      <TawasulHub
        lang="ar"
        onOpenSovereign={() => patchSession({ sovereignFullView: true })}
      />
    );
  }

  if (!user) return <AunakGate />;

  if (isMinistryAuditor(user)) {
    if (typeof window !== 'undefined' && !isMinistryRoute()) {
      window.history.replaceState({}, '', '/ministry');
    }
    return <AunakMinistryDashboard lang="ar" user={user} onLogout={logout} />;
  }

  if (needsActivationGate(user)) {
    return (
      <>
        <div className="fixed inset-0 z-0 bg-[#0a0a0c]" aria-hidden>
          <div className="absolute inset-0 opacity-30 blur-xl bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.12)_0%,transparent_55%),radial-gradient(ellipse_at_70%_80%,rgba(201,169,98,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-4 rounded-3xl border border-white/[0.04] bg-[#12121a]/40" />
        </div>
        <AunakActivationGate
          studentId={user.childId ?? user.activeStudentId}
          childName={user.childName}
          reason={activationGateReason(user)}
          onActivated={(data) => {
            patchSession({
              subscriptionActivated: true,
              subscriptionRaw: 'Active',
              plan: data?.plan ?? user.plan,
              landingSection: data?.landing ?? landingForPlan(data?.plan),
              assessmentOnlyMode: data?.plan === PLAN_CODES.ASSESSMENT_ONLY,
            });
            setBiometricGate('required');
          }}
          onSkip={(data) => {
            patchSession({
              subscriptionActivated: true,
              subscriptionRaw: 'Active',
              plan: data?.plan ?? user.plan,
              landingSection: data?.landing ?? landingForPlan(data?.plan),
              assessmentOnlyMode: data?.plan === PLAN_CODES.ASSESSMENT_ONLY,
            });
            setBiometricGate('required');
          }}
        />
      </>
    );
  }

  if (biometricGate === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (biometricGate === 'required') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] p-6 flex flex-col items-center justify-center">
        <PostActivationBiometric
          lang="ar"
          recordId={user.childId ?? user.activeStudentId}
          studentName={user.childName}
          onComplete={() => setBiometricGate('done')}
        />
      </div>
    );
  }

  return <AunakEcosystemHub />;
}

function TawasulPlatform() {
  const { user } = useAuth();
  if (!user) return <TawasulGate lang="ar" />;
  return <TawasulHub lang="ar" />;
}

export default function App() {
  const tawasul = shouldShowTawasulShell();
  const summerRoute = isSummerAcademyRoute();
  const childRoute = isChildPlayRoute();
  const parentRoute = isParentDashboardRoute();
  const paymentReturnRoute = isPaymentReturnRoute();
  const ministryRoute = isMinistryRoute();

  return (
    <ErrorBoundary>
      <AuthProvider>
        {paymentReturnRoute ? (
          <PaymentReturn lang="ar" />
        ) : childRoute ? (
          <ChildInteractiveShell />
        ) : ministryRoute ? (
          <MinistryShell />
        ) : tawasul ? (
          <TawasulPlatform />
        ) : parentRoute ? (
          <ParentShell />
        ) : summerRoute ? (
          <SummerAcademyShell />
        ) : (
          <GatedPlatform />
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}
