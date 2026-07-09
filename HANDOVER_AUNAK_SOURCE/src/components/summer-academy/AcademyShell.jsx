import { LogOut, Home } from 'lucide-react';
import PlatformLogo from '../PlatformLogo';
import AcademyLiveBackground from './AcademyLiveBackground';
import AcademyMascot from './AcademyMascot';
import { ACADEMY } from '../../lib/academyTheme';

export default function AcademyShell({
  lang,
  mood,
  calm = false,
  mascotExpression = 'idle',
  isSpeaking = false,
  showMascot = true,
  title,
  subtitle,
  onToggleLang,
  onLogout,
  children,
}) {
  return (
    <div className={ACADEMY.root} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <AcademyLiveBackground mood={mood} calm={calm} />
      {showMascot && !calm && (
        <AcademyMascot expression={mascotExpression} isSpeaking={isSpeaking} lang={lang} />
      )}

      <header className={ACADEMY.header}>
        <div className="flex items-center gap-3">
          <PlatformLogo lang={lang} className="h-9 w-auto" iconClassName="w-9 h-9" />
          <div>
            <h1 className={`${ACADEMY.title} text-lg md:text-xl`}>{title}</h1>
            <p className={ACADEMY.subtitle}>{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleLang} className={ACADEMY.btnGhost}>
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          <a href="/" className={`${ACADEMY.btnGhost} flex items-center gap-1`}>
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </a>
          <button type="button" onClick={onLogout} className={ACADEMY.btnGhost}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className={ACADEMY.main}>{children}</main>

      <footer className="relative z-10 text-center py-4 text-[10px] font-mono text-slate-500">
        /summer-academy · Live Experience
      </footer>
    </div>
  );
}
