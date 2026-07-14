import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { UserPlus, ScanFace, MessageSquare, ShieldAlert, ShieldCheck, Music, Target, Activity, FileText, ClipboardList, Video, TrendingDown, BookOpen, Database, Stethoscope, FolderOpen, LogOut, UserCircle2, Lock, Volume2, VolumeX, FlaskConical, Eye, PanelLeftClose, PanelLeftOpen, FileBarChart, ClipboardCheck, BookOpenCheck, Loader2, Globe } from 'lucide-react';
import PlatformLogo, { HEADER_LOGO_CLASS } from './PlatformLogo';
import AunakPaywall from './AunakPaywall';
import { useAuth, ROLES, canAccessSection, isSovereignOwner, isSubscriptionActive } from '../lib/auth';
import { getField } from '../lib/airtable';
import { STUDENT as SF } from '../lib/airtableFields';
import { planAllows, PLAN_CODES, PLAN_LABELS } from '../lib/plans';
import { isAudioEnabled, setAudioEnabled } from '../lib/sovereignAudio';
import {
  isAppStealthActive,
  isSectionHiddenInStealth,
  subscribeStealthChanges,
  toggleAppStealth,
  handleSovereignKeyInput,
} from '../lib/studentPrivacy';
/** Core product path — always loaded */
import AunakAccessControl from './AunakAccessControl';
import AunakSpecialists from './AunakSpecialists';
import AunakBiometrics from './AunakBiometrics';
import AunakLiveDashboard from './AunakLiveDashboard';
import AunakSessionRegistry from './AunakSessionRegistry';
import AunakReportsDashboard from './AunakReportsDashboard';
import AunakEnrollment from './AunakEnrollment';
import AunakChildGovernance from './AunakChildGovernance';
import AunakAssessmentProtocol from './AunakAssessmentProtocol';
import SovereignCommandBar from './SovereignCommandBar';
/** Theatrical / legacy — lazy (only used in ?full=1) */
const AunakResources = lazy(() => import('./AunakResources'));
const AunakScientificItems = lazy(() => import('./AunakScientificItems'));
const AunakBehaviorMod = lazy(() => import('./AunakBehaviorMod'));
const AunakClassrooms = lazy(() => import('./AunakClassrooms'));
const AunakSafeMedia = lazy(() => import('./AunakSafeMedia'));
const AunakDiagnostics = lazy(() => import('./AunakDiagnostics'));
const AunakCommunityChat = lazy(() => import('./AunakCommunityChat'));
const AunakCrisisManagement = lazy(() => import('./AunakCrisisManagement'));
const AunakEmotionalLab = lazy(() => import('./AunakEmotionalLab'));
const AunakLearningCenter = lazy(() => import('./AunakLearningCenter'));
const AunakResearchHub = lazy(() => import('./AunakResearchHub'));
import { useGazeNeutralityObserver } from '../hooks/useGazeNeutralityObserver';
import { useMeltdownPredictor } from '../hooks/useMeltdownPredictor';
import { useHarmonyEngine } from '../hooks/useHarmonyEngine';
import { useActiveStudentMetrics } from '../hooks/useActiveStudentMetrics';
import { useRoadmapStats } from '../hooks/useRoadmapStats';
import { isStealthMode, setStealthMode } from '../lib/sovereignAudio';
import { filterHubNavItems, hubSensorsEnabled, isHubFullMode, HUB_THEATRICAL } from '../lib/hubNavConfig';
import { LUX } from '../lib/luxTheme.js';
import { DEFAULT_LANG, getStoredLang, setStoredLang, applyDocumentLang } from '../lib/locale';


const TABS = {
  live: { ar: 'لوحة المتابعة', en: 'Follow-up Board' },
  crisis: { ar: 'الدرع الذكي', en: 'Smart Shield' },
  learning: { ar: 'البرامج التربوية', en: 'Educational Programs' },
  emotion: { ar: 'مختبر الألحان', en: 'Melodies Lab' },
  biometrics: { ar: 'التحقق من الحضور', en: 'Attendance Verify' },
  community: { ar: 'منتدى الدعم الأسري', en: 'Family Support Forum' },
};

/** Extra English/Arabic labels that may appear as activeTab values. */
const TAB_ALIASES = {
  live: ['Live Registry', 'السجل الحي', 'Follow-up Board', 'لوحة المتابعة'],
  crisis: ['Smart Shield', 'الدرع الذكي'],
  learning: ['Learning Center', 'صعوبات التعلم', 'Educational Programs', 'البرامج التربوية'],
  emotion: ['Melodies Lab', 'مختبر الألحان'],
  biometrics: ['Biometrics ID', 'البصمة الحيوية', 'Attendance Verify', 'التحقق من الحضور'],
  community: ['Family Support Forum', 'Aunak Community', 'Community', 'منتدى الدعم الأسري', 'مجتمع عونك'],
};

const MAIN_NAV_ITEMS = [
  { id: 'governance', icon: ClipboardCheck, activeClass: LUX.navActiveGold },
  { id: 'assessmentProtocol', icon: BookOpenCheck, activeClass: LUX.navActiveGold },
  { id: 'enrollment', icon: UserPlus, activeClass: LUX.navActiveGold },
  { id: 'registry', icon: FileText, activeClass: LUX.navActiveGold },
  { id: 'diagnostics', icon: ClipboardList, activeClass: LUX.navActiveGold },
  { id: 'media', icon: Video, activeClass: LUX.navActiveGold },
  { id: 'behavior', icon: TrendingDown, activeClass: LUX.navActiveGold },
  { id: 'classrooms', icon: BookOpen, activeClass: LUX.navActiveGold },
  { id: 'scientific', icon: Database, activeClass: LUX.navActiveGold },
  { id: 'specialists', icon: Stethoscope, activeClass: LUX.navActiveGold },
  { id: 'resources', icon: FolderOpen, activeClass: LUX.navActiveGold },
  { id: 'research', icon: FlaskConical, activeClass: LUX.navActiveGold },
  { id: 'reports', icon: FileBarChart, activeClass: LUX.navActiveGold },
  { id: 'access', icon: ShieldCheck, activeClass: LUX.navActiveGold },
];

const NAV_ITEMS = [
  { id: 'live', icon: Activity, activeClass: LUX.navActiveLive },
  { id: 'crisis', icon: ShieldAlert, activeClass: LUX.navActiveGold },
  { id: 'learning', icon: Target, activeClass: LUX.navActiveGold },
  { id: 'emotion', icon: Music, activeClass: LUX.navActiveGold },
  { id: 'biometrics', icon: ScanFace, activeClass: LUX.navActiveGold },
  { id: 'community', icon: MessageSquare, activeClass: LUX.navActiveGold },
];

const TAB_PANELS = {
  live: AunakLiveDashboard,
  crisis: AunakCrisisManagement,
  learning: AunakLearningCenter,
  emotion: AunakEmotionalLab,
  biometrics: AunakBiometrics,
  community: AunakCommunityChat,
};

const TAB_IDS = Object.keys(TABS);

const MAIN_SECTIONS = {
  governance: AunakChildGovernance,
  assessmentProtocol: AunakAssessmentProtocol,
  enrollment: AunakEnrollment,
  registry: AunakSessionRegistry,
  diagnostics: AunakDiagnostics,
  media: AunakSafeMedia,
  behavior: AunakBehaviorMod,
  classrooms: AunakClassrooms,
  scientific: AunakScientificItems,
  specialists: AunakSpecialists,
  resources: AunakResources,
  research: AunakResearchHub,
  reports: AunakReportsDashboard,
  access: AunakAccessControl,
};

const PREMIUM_SECTIONS = new Set(['emotion', 'crisis']);

const DEFAULT_TAB_BY_ROLE = {
  [ROLES.ADMIN]: 'governance',
  [ROLES.SPECIALIST]: 'governance',
  [ROLES.PARENT]: 'reports',
};

function LazyPanel({ Component, ...props }) {
  if (!Component) return null;
  const isLazy = Component.$$typeof === Symbol.for('react.lazy');
  if (!isLazy) return <Component {...props} />;
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  );
}

function sectionCanAccess(user, role, sectionId) {
  const plan = user?.plan ?? PLAN_CODES.FREE;
  if (plan === PLAN_CODES.ASSESSMENT_ONLY || user?.assessmentOnlyMode) {
    if (!['assessmentProtocol', 'enrollment', 'diagnostics'].includes(sectionId)) return false;
  }
  return canAccessSection(user, role, sectionId) && !isSectionHiddenInStealth(sectionId);
}

function normalizeTab(value) {
  if (TAB_IDS.includes(value)) return value;

  for (const [id, labels] of Object.entries(TABS)) {
    if (value === labels.ar || value === labels.en) return id;
    if (TAB_ALIASES[id]?.includes(value)) return id;
  }

  return 'live';
}

export default function AunakEcosystemHub() {
  const { user, logout, subscriptionActive, patchSession } = useAuth();
  const role = user?.role ?? ROLES.PARENT;
  // كود الباقة المخزن في الجلسة منذ الدخول الأول من AunakGate (sessionStorage).
  const plan =
    user?.plan ??
    (role === ROLES.ADMIN ? PLAN_CODES.INSTITUTION : role === ROLES.SPECIALIST ? PLAN_CODES.INSTITUTION : PLAN_CODES.FREE);

  const [activeTab, setActiveTab] = useState(() => user?.landingSection ?? DEFAULT_TAB_BY_ROLE[role] ?? 'live');
  const [lang, setLang] = useState(() => getStoredLang() || DEFAULT_LANG);

  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);
  const [audioOn, setAudioOn] = useState(() => isAudioEnabled());
  const [stealthActive, setStealthActive] = useState(() => isAppStealthActive());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const landingAppliedRef = useRef(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  useEffect(() => {
    if (!user?.landingSection) return;

    if (user?.biometricSovereign) {
      setActiveTab(user.landingSection);
      landingAppliedRef.current = true;
      return;
    }

    if (landingAppliedRef.current) return;
    landingAppliedRef.current = true;
    setActiveTab(user.landingSection);
  }, [user?.landingSection, user?.biometricSovereign, user?.dynamicSessionId, user?.enrollmentStatus]);

  const isAssessmentOnly = plan === PLAN_CODES.ASSESSMENT_ONLY || Boolean(user?.assessmentOnlyMode);

  useEffect(() => {
    if (!isAssessmentOnly) return;
    setActiveTab('assessmentProtocol');
    setAudioEnabled(false);
    setAudioOn(false);
    setStealthMode(true);
    setStealthActive(true);
  }, [isAssessmentOnly]);

  useEffect(() => subscribeStealthChanges(setStealthActive), []);

  useEffect(() => {
    const onKeyDown = (e) => handleSovereignKeyInput(e.key);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  /** Kick user off theatrical sections when lean mode */
  useEffect(() => {
    if (isHubFullMode()) return;
    if (HUB_THEATRICAL.has(activeTab)) setActiveTab('governance');
  }, [activeTab]);

  const sovereign = isSovereignOwner(user);
  const manualOverride = Boolean(user?.manualOverride);
  const { stats: roadmapStats } = useRoadmapStats({ enabled: sovereign });
  useHarmonyEngine();
  const { gazeTrigger, abcDefaults, student: activeStudent } = useActiveStudentMetrics(user);

  useEffect(() => {
    const sectionId = MAIN_SECTIONS[activeTab] ? activeTab : normalizeTab(activeTab);
    if (!isSectionHiddenInStealth(sectionId)) return;
    if (user?.biometricSovereign && user?.landingSection === sectionId) return;
    setActiveTab('governance');
  }, [stealthActive, activeTab, user?.biometricSovereign, user?.landingSection]);

  const onLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 800);
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
      toggleAppStealth();
    }
  };

  const toggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    setAudioEnabled(next);
  };

  const requestedAllowed = MAIN_SECTIONS[activeTab]
    ? sectionCanAccess(user, role, activeTab)
    : sectionCanAccess(user, role, normalizeTab(activeTab));
  const requestedTab = requestedAllowed ? activeTab : DEFAULT_TAB_BY_ROLE[role] ?? 'governance';

  const tabId = normalizeTab(requestedTab);
  const ActivePanel = TAB_PANELS[tabId] || AunakLiveDashboard;
  const MainSection = MAIN_SECTIONS[requestedTab] ?? null;

  const sectionKey = MainSection ? requestedTab : tabId;

  const sensorsOn = hubSensorsEnabled();

  const gaze = useGazeNeutralityObserver({
    active: sensorsOn && Boolean(user?.gazeObserverActive),
    triggerCondition: gazeTrigger,
    lang,
  });

  const neuralLiveActive = Boolean(
    user?.neuralEngineActive ||
      user?.sessionRegistryOpen ||
      user?.gazeObserverActive ||
      user?.biometricSovereign
  );

  const meltdownLive = sectionKey === 'registry' || sectionKey === 'live' || sectionKey === 'crisis';

  const meltdown = useMeltdownPredictor({
    active: sensorsOn && neuralLiveActive && meltdownLive,
    lang,
    abc: abcDefaults,
  });

  // Value Lock: اعتراض أي مسار أعلى من باقة المستخدم بجدار الدفع الزجاجي.
  const planLocked = user?.manualOverride ? false : !planAllows(plan, sectionKey);

  const studentSubscriptionActive = useMemo(() => {
    if (user?.subscriptionRaw != null) {
      return isSubscriptionActive(user.subscriptionRaw);
    }
    if (activeStudent?.fields) {
      const raw =
        getField(activeStudent.fields, SF.subscription_status);
      return isSubscriptionActive(raw);
    }
    return subscriptionActive;
  }, [user?.subscriptionRaw, activeStudent?.fields, subscriptionActive]);

  // Subscription paywall: مختبر الألحان والدرع الذكي للمشتركين فقط (المدير يتجاوز).
  const isPaywalled =
    planLocked ||
    (PREMIUM_SECTIONS.has(sectionKey) && role !== ROLES.ADMIN && studentSubscriptionActive === false);

  /** Live field session — collapse chrome for eye-tracking & goal engine */
  const isFieldSession = Boolean(
    user?.sessionRegistryOpen && (sectionKey === 'registry' || sectionKey === 'live')
  );

  useEffect(() => {
    if (isFieldSession) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isFieldSession]);

  const toggleManualOverride = () => {
    patchSession({ manualOverride: !manualOverride });
  };

  const toggleStealthHeader = () => {
    const next = !isStealthMode();
    setStealthMode(next);
    setStealthActive(next);
  };

  const handleVoiceNavigate = (section) => {
    if (section) setActiveTab(section);
  };

  const t = {
    ar: {
      title: 'بوابة عونك',
      subtitle: 'منصة متابعة التربية الخاصة',
      live: TABS.live.ar,
      crisis: TABS.crisis.ar,
      learning: TABS.learning.ar,
      emotion: TABS.emotion.ar,
      biometrics: TABS.biometrics.ar,
      community: TABS.community.ar,
      governance: 'الحضور والأهداف الفردية',
      assessmentProtocol: 'بروتوكول التقييم الإجرائي',
      enrollment: 'تسجيل المستفيدين',
      registry: 'سجل الجلسات اليومية',
      diagnostics: 'مقاييس التقييم',
      media: 'مكتبة الوسائط الآمنة',
      behavior: 'تعديل السلوك',
      classrooms: 'الفصول والمجموعات',
      scientific: 'المكتبة العلمية',
      specialists: 'المعلمون والأخصائيون',
      resources: 'موارد الدعم الأسري',
      research: 'مركز الأبحاث',
      reports: 'تقارير التقدم التربوي',
      access: 'صلاحيات الدخول',
      secured: 'AES-256 SECURED',
      online: 'متصل',
      logout: 'تسجيل الخروج',
      roleLabels: { admin: 'إدارة المركز', specialist: 'معلم / أخصائي تربية خاصة', parent: 'ولي الأمر' },
      childLabel: 'المستفيد:',
      fieldSession: 'جلسة ميدانية',
      showControls: 'أدوات التحكم',
      expandNav: 'فتح القائمة',
      collapseNav: 'طي القائمة',
      roadmapNew: 'جديد → مسح نمائي أولي',
      roadmapActive: 'نشط → متابعة',
      manualOverride: 'تحكم يدوي',
      stealth: 'تخفي',
    },
    en: {
      title: 'Aunak Hub',
      subtitle: 'Special education follow-up platform',
      live: TABS.live.en,
      crisis: TABS.crisis.en,
      learning: TABS.learning.en,
      emotion: TABS.emotion.en,
      biometrics: TABS.biometrics.en,
      community: TABS.community.en,
      governance: 'Attendance & IEP Goals',
      assessmentProtocol: 'Operational Assessment Protocol',
      enrollment: 'Beneficiary Registration',
      registry: 'Daily Session Register',
      diagnostics: 'Assessment Scales',
      media: 'Safe Media Library',
      behavior: 'Behavior Support',
      classrooms: 'Classes & Groups',
      scientific: 'Resource Library',
      specialists: 'Teachers & Specialists',
      resources: 'Family Support Resources',
      research: 'Research Center',
      reports: 'Educational Progress Reports',
      access: 'Access Permissions',
      secured: 'AES-256 SECURED',
      online: 'ONLINE',
      logout: 'Logout',
      roleLabels: { admin: 'Center Admin', specialist: 'Special Education Teacher / Specialist', parent: 'Parent / Guardian' },
      childLabel: 'Beneficiary:',
      fieldSession: 'Field session',
      showControls: 'Controls',
      expandNav: 'Expand menu',
      collapseNav: 'Collapse menu',
      roadmapNew: 'New → Initial screening',
      roadmapActive: 'Active → Follow-up',
      manualOverride: 'Manual override',
      stealth: 'Stealth',
    },
  };

  const copy = t[lang] ?? t.ar;

  const selectTab = (id) => setActiveTab(id);

  const toggleLang = () => {
    setLang((prev) => setStoredLang(prev === 'ar' ? 'en' : 'ar'));
  };

  const asideBorderClass = lang === 'ar' ? LUX.asideBorderAr : LUX.asideBorderEn;

  const navButtonClass = (active, locked) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
      active ? '' : locked ? LUX.navLocked : LUX.navIdle
    }`;

  const renderNavButton = ({ id, icon: Icon, activeClass, active, locked, onClick, label }) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      title={sidebarCollapsed ? label : undefined}
      className={`${navButtonClass(active, locked)} ${active ? activeClass : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!sidebarCollapsed && (
        <>
          <span className="flex-1 text-start truncate">{label}</span>
          {locked && <Lock className={`w-3.5 h-3.5 shrink-0 ${LUX.lockIcon}`} />}
        </>
      )}
    </button>
  );

  const sovereignControls = (
    <div className={LUX.sovereignControls}>
      {sovereign && (
        <span className={`hidden lg:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono border border-emerald-400/25 text-emerald-300 bg-emerald-950/30`}>
          <Map className="w-3 h-3" />
          New:{roadmapStats.new} · Active:{roadmapStats.active}
        </span>
      )}
      {sovereign && (
        <SovereignCommandBar
          lang={lang}
          enabled={Boolean(user?.biometricSovereign || user?.fieldInspection)}
          onNavigate={handleVoiceNavigate}
          onManualOverride={toggleManualOverride}
        />
      )}
      {sovereign && (
        <button
          type="button"
          onClick={toggleManualOverride}
          title={copy.manualOverride}
          className={`${LUX.sovereignIconBtn} ${manualOverride ? 'border-amber-400/50 text-amber-300 bg-amber-500/10' : ''}`}
        >
          <HandMetal className="w-4 h-4" />
        </button>
      )}
      {sovereign && (
        <button
          type="button"
          onClick={toggleStealthHeader}
          title={copy.stealth}
          className={`${LUX.sovereignIconBtn} ${stealthActive ? LUX.sovereignIconBtnActive : ''}`}
        >
          <EyeOff className="w-4 h-4" />
        </button>
      )}
      <span className={`hidden sm:inline-flex ${LUX.sovereignOnlineBadge}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {copy.online}
      </span>
      <button
        type="button"
        onClick={toggleLang}
        title={lang === 'ar' ? 'English' : 'العربية'}
        className={LUX.sovereignIconBtn}
        aria-label={lang === 'ar' ? 'English Version' : 'النسخة العربية'}
      >
        <Globe className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={toggleAudio}
        title={audioOn ? 'Sovereign Audio: ON' : 'Sovereign Audio: OFF'}
        className={`${LUX.sovereignIconBtn} ${audioOn ? LUX.sovereignIconBtnActive : ''}`}
        aria-label={audioOn ? 'Mute audio' : 'Enable audio'}
      >
        {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
      <button type="button" onClick={logout} className={LUX.sovereignLogoutBtn}>
        <LogOut className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{copy.logout}</span>
      </button>
    </div>
  );

  return (
    <div className={LUX.root} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={LUX.pageWrapGradient} aria-hidden />

      <aside
        className={`${LUX.asideShell} ${asideBorderClass} ${sidebarCollapsed ? LUX.asideShellCollapsed : ''} transition-[width] duration-300`}
      >
        <div className={sidebarCollapsed ? LUX.headerSectionCompact : LUX.headerSection}>
          <div className={`flex w-full items-center ${sidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className={LUX.sovereignIconBtn}
              title={sidebarCollapsed ? copy.expandNav : copy.collapseNav}
              aria-label={sidebarCollapsed ? copy.expandNav : copy.collapseNav}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          {!sidebarCollapsed && (
            <>
              <button type="button" onClick={onLogoTap} className={LUX.logoFocus} aria-label="Platform logo">
                <PlatformLogo lang={lang} className={HEADER_LOGO_CLASS} iconClassName="w-14 h-14" />
              </button>
              <div>
                <h1 className={`${LUX.hubTitleGradient} text-lg`}>{copy.title}</h1>
                <p className={`${LUX.subtitle} text-[10px]`}>{copy.subtitle}</p>
              </div>
            </>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className={LUX.userCardCompact}>
            <UserCircle2 className={`w-8 h-8 shrink-0 ${LUX.goldText}`} strokeWidth={1.4} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold truncate ${LUX.goldText}`}>{user?.name}</p>
              <p className={`text-[9px] font-mono ${LUX.goldMono}`}>
                {copy.roleLabels[role] ?? role} • {(PLAN_LABELS[lang] ?? PLAN_LABELS.ar)[plan]}
              </p>
              {isSovereignOwner(user) && (
                <span className={LUX.sovereignBadge}>{lang === 'ar' ? 'سيادي' : 'Sovereign'}</span>
              )}
              {role === ROLES.PARENT && user?.childCode && (
                <p className={`text-[9px] font-mono truncate ${LUX.muted}`}>
                  {copy.childLabel} {user.childName} • {user.childCode}
                </p>
              )}
            </div>
          </div>
        )}

        <nav className={`${LUX.navArea} ${LUX.navScroll}`} aria-label={lang === 'ar' ? 'قائمة المواضيع' : 'Topics menu'}>
          {filterHubNavItems(MAIN_NAV_ITEMS)
            .filter(({ id }) => sectionCanAccess(user, role, id))
            .map(({ id, icon, activeClass }) => {
            const locked = !planAllows(plan, id);
            return renderNavButton({
              id,
              icon,
              activeClass,
              active: requestedTab === id,
              locked,
              onClick: () => setActiveTab(id),
              label: copy[id],
            });
          })}
          {filterHubNavItems(NAV_ITEMS)
            .filter(({ id }) => sectionCanAccess(user, role, id))
            .map(({ id, icon, activeClass }) => {
            const locked = !planAllows(plan, id);
            return renderNavButton({
              id,
              icon,
              activeClass,
              active: !MainSection && tabId === id,
              locked,
              onClick: () => selectTab(id),
              label: copy[id],
            });
          })}
        </nav>
      </aside>

      <div className={LUX.contentColumn}>
        <header className={`${LUX.sovereignTopBar} ${isFieldSession ? LUX.sovereignTopBarCompact : ''}`}>
          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {isFieldSession && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-400/30 animate-pulse">
                  <Activity className="w-3 h-3" /> {copy.fieldSession}
                </span>
              )}
              <span className={`hidden md:inline text-[10px] font-mono ${LUX.muted}`}>{copy.secured}</span>
            </div>
            {sovereign && (
              <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <span className="text-emerald-400/90">{copy.roadmapNew}: {roadmapStats.new}</span>
                <span className="text-[#c9a962]/90">{copy.roadmapActive}: {roadmapStats.active}</span>
              </div>
            )}
          </div>
          {sovereignControls}
        </header>

        <main className={`${LUX.main} lux-main-scroll ${tabId === 'live' && !MainSection ? 'p-0' : 'p-6'}`}>
          {gaze.visible && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-100 text-sm font-mono flex items-start gap-2 relative z-10">
              <Eye className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-amber-300" />
              <div>
                <p className="font-bold text-amber-200 mb-1">{gaze.alertTitle}</p>
                <p>{gaze.typedAlert}</p>
              </div>
            </div>
          )}
          {meltdown.meltdownRisk && (
            <div className={`mb-4 p-4 rounded-2xl border text-sm font-mono flex items-start gap-2 relative z-10 ${meltdown.fusedCritical ? 'bg-rose-950/50 border-rose-500/45 text-rose-100' : 'bg-rose-950/40 border-rose-500/35 text-rose-100'}`}>
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-rose-300" />
              <div>
                <p className="font-bold text-rose-200 mb-1">{meltdown.alertTitle}</p>
                <p>{meltdown.alertBody}</p>
              </div>
            </div>
          )}
          {isPaywalled ? (
            <AunakPaywall
              lang={lang}
              featureName={copy[sectionKey] ?? sectionKey}
              currentPlan={plan}
              onActivate={() => patchSession({ subscriptionActivated: false })}
            />
          ) : MainSection ? (
            <LazyPanel Component={MainSection} lang={lang} role={role} defaultStealth={isSovereignOwner(user)} />
          ) : (
            <LazyPanel Component={ActivePanel} lang={lang} role={role} />
          )}
        </main>
      </div>
    </div>
  );
}
