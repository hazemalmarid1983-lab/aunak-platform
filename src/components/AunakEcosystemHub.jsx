import { useState } from 'react';
import { ScanFace, MessageSquare, ShieldAlert, ShieldCheck, Globe, Music, Target, Activity, FileText, ClipboardList, Video, TrendingDown, BookOpen, Database, Stethoscope, FolderOpen } from 'lucide-react';
import PlatformLogo from './PlatformLogo';
import AunakAccessControl from './AunakAccessControl';
import AunakResources from './AunakResources';
import AunakSpecialists from './AunakSpecialists';
import AunakScientificItems from './AunakScientificItems';
import AunakBehaviorMod from './AunakBehaviorMod';
import AunakClassrooms from './AunakClassrooms';
import AunakSafeMedia from './AunakSafeMedia';
import AunakDiagnostics from './AunakDiagnostics';
import AunakBiometrics from './AunakBiometrics';
import AunakCommunityChat from './AunakCommunityChat';
import AunakCrisisManagement from './AunakCrisisManagement';
import AunakEmotionalLab from './AunakEmotionalLab';
import AunakLearningCenter from './AunakLearningCenter';
import AunakLiveDashboard from './AunakLiveDashboard';
import AunakSessionRegistry from './AunakSessionRegistry';

const TABS = {
  live: { ar: 'السجل الحي', en: 'Live Registry' },
  crisis: { ar: 'الدرع الذكي', en: 'Smart Shield' },
  learning: { ar: 'صعوبات التعلم', en: 'Learning Center' },
  emotion: { ar: 'مختبر الألحان', en: 'Melodies Lab' },
  biometrics: { ar: 'البصمة الحيوية', en: 'Biometrics ID' },
  community: { ar: 'مجتمع عونك', en: 'Aunak Community' },
};

/** Extra English/Arabic labels that may appear as activeTab values. */
const TAB_ALIASES = {
  live: ['Live Registry', 'السجل الحي'],
  crisis: ['Smart Shield', 'الدرع الذكي'],
  learning: ['Learning Center', 'صعوبات التعلم'],
  emotion: ['Melodies Lab', 'مختبر الألحان'],
  biometrics: ['Biometrics ID', 'البصمة الحيوية'],
  community: ['Aunak Community', 'Community', 'مجتمع عونك'],
};

const NAV_ITEMS = [
  { id: 'live', icon: Activity, activeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg' },
  { id: 'crisis', icon: ShieldAlert, activeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-lg' },
  { id: 'learning', icon: Target, activeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-lg' },
  { id: 'emotion', icon: Music, activeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg' },
  { id: 'biometrics', icon: ScanFace, activeClass: 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-lg' },
  { id: 'community', icon: MessageSquare, activeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg' },
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
  registry: AunakSessionRegistry,
  diagnostics: AunakDiagnostics,
  media: AunakSafeMedia,
  behavior: AunakBehaviorMod,
  classrooms: AunakClassrooms,
  scientific: AunakScientificItems,
  specialists: AunakSpecialists,
  resources: AunakResources,
  access: AunakAccessControl,
};

function normalizeTab(value) {
  if (TAB_IDS.includes(value)) return value;

  for (const [id, labels] of Object.entries(TABS)) {
    if (value === labels.ar || value === labels.en) return id;
    if (TAB_ALIASES[id]?.includes(value)) return id;
  }

  return 'live';
}

export default function AunakEcosystemHub() {
  const [activeTab, setActiveTab] = useState('live');
  const [lang, setLang] = useState('ar');

  const tabId = normalizeTab(activeTab);
  const ActivePanel = TAB_PANELS[tabId] || AunakLiveDashboard;
  const MainSection = MAIN_SECTIONS[activeTab] ?? null;

  const t = {
    ar: {
      title: 'بوابة عونك',
      subtitle: 'النسخة السيادية الموحدة',
      live: TABS.live.ar,
      crisis: TABS.crisis.ar,
      learning: TABS.learning.ar,
      emotion: TABS.emotion.ar,
      biometrics: TABS.biometrics.ar,
      community: TABS.community.ar,
      registry: 'سجل الجلسات',
      diagnostics: 'مقاييس التشخيص',
      media: 'مكتبة الوسائط',
      behavior: 'تعديل السلوك',
      classrooms: 'الفصول الدراسية',
      scientific: 'المكتبة العلمية',
      specialists: 'إدارة الأخصائيين',
      resources: 'موارد المجتمع',
      access: 'التحكم السيادي',
      secured: 'AES-256 SECURED',
      online: 'متصل',
    },
    en: {
      title: 'Aunak Hub',
      subtitle: 'Sovereign Unified Edition',
      live: TABS.live.en,
      crisis: TABS.crisis.en,
      learning: TABS.learning.en,
      emotion: TABS.emotion.en,
      biometrics: TABS.biometrics.en,
      community: TABS.community.en,
      registry: 'Session Registry',
      diagnostics: 'Diagnostics',
      media: 'Safe Media',
      behavior: 'Behavior Mod',
      classrooms: 'Classrooms',
      scientific: 'Scientific Lib',
      specialists: 'Specialists',
      resources: 'Resources',
      access: 'Access Control',
      secured: 'AES-256 SECURED',
      online: 'ONLINE',
    },
  };

  const copy = t[lang] ?? t.ar;

  const selectTab = (id) => setActiveTab(id);

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const asideBorderClass = lang === 'ar' ? 'border-l border-slate-800' : 'border-r border-slate-800';

  return (
    <div className="flex h-screen bg-[#050508] text-slate-200 font-sans overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <aside className={`w-72 bg-slate-950 ${asideBorderClass} flex flex-col z-10 shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-900/30">
          <PlatformLogo lang={lang} />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-l from-amber-400 to-cyan-400 bg-clip-text text-transparent">{copy.title}</h1>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">{copy.subtitle}</p>
          </div>
        </div>

        <div className="px-6 pt-6">
          <button
            type="button"
            onClick={toggleLang}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-bold text-sm shadow-md"
          >
            <Globe className="w-4 h-4" /> {lang === 'ar' ? 'English Version' : 'النسخة العربية'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-2">
          <button onClick={() => setActiveTab('registry')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'registry' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <FileText className="w-5 h-5" /> {copy.registry} </button>
          <button onClick={() => setActiveTab('diagnostics')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'diagnostics' ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <ClipboardList className="w-5 h-5" /> {copy.diagnostics} </button>
          <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'media' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <Video className="w-5 h-5" /> {copy.media} </button>
          <button onClick={() => setActiveTab('behavior')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'behavior' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <TrendingDown className="w-5 h-5" /> {copy.behavior} </button>
          <button onClick={() => setActiveTab('classrooms')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'classrooms' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <BookOpen className="w-5 h-5" /> {copy.classrooms} </button>
          <button onClick={() => setActiveTab('scientific')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'scientific' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <Database className="w-5 h-5" /> {copy.scientific} </button>
          <button onClick={() => setActiveTab('specialists')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'specialists' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <Stethoscope className="w-5 h-5" /> {copy.specialists} </button>
          <button onClick={() => setActiveTab('resources')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'resources' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <FolderOpen className="w-5 h-5" /> {copy.resources} </button>
          <button onClick={() => setActiveTab('access')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${activeTab === 'access' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg' : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}> <ShieldCheck className="w-5 h-5" /> {copy.access} </button>
          {NAV_ITEMS.map(({ id, icon: Icon, activeClass }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-md ${tabId === id ? activeClass : 'text-slate-400 hover:bg-slate-900 border border-transparent'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{copy[id]}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono bg-slate-950">
          <span>{copy.secured}</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {copy.online}
          </span>
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto bg-[#050508] ${tabId === 'live' && !MainSection ? 'p-0' : 'p-6'}`}>
        {MainSection ? (
          <MainSection lang={lang} />
        ) : (
          <ActivePanel lang={lang} />
        )}
      </main>
    </div>
  );
}
