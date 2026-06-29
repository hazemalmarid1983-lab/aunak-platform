import { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { findStudentByChildToken, parseChildRouteToken } from '../../lib/childAccess';
import { CHILD } from '../../lib/childTheme';
import ChildPlayZone from './ChildPlayZone';
import PlatformLogo from '../PlatformLogo';

export default function ChildInteractiveShell({ lang: langProp = 'ar' }) {
  const [lang, setLang] = useState(langProp);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = parseChildRouteToken();
      if (!token) {
        setError(lang === 'en' ? 'Missing child token in URL (?token=AUN-CHD-...)' : 'رمز الطفل مفقود في الرابط (?token=AUN-CHD-...)');
        setLoading(false);
        return;
      }
      try {
        const row = await findStudentByChildToken(token);
        if (cancelled) return;
        if (!row) {
          setError(lang === 'en' ? 'Invalid or inactive child token' : 'رمز الطفل غير صالح أو غير مفعّل');
        } else {
          setStudent(row);
        }
      } catch {
        if (!cancelled) setError(lang === 'en' ? 'Connection error' : 'خطأ في الاتصال');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const copy =
    lang === 'en'
      ? {
          title: 'Awni Play World',
          subtitle: 'Play · Learn · Smile',
          loading: 'Opening your world...',
        }
      : {
          title: 'عالم عوني',
          subtitle: 'لعب · تعلّم · ابتسام',
          loading: 'جاري فتح عالمك...',
        };

  if (loading) {
    return (
      <div className={CHILD.root}>
        <div className={CHILD.sky} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
          <p className="font-bold text-orange-600">{copy.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className={CHILD.root}>
        <div className={CHILD.sky} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <span className="text-6xl mb-4">🧸</span>
          <p className="text-lg font-bold text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={CHILD.root} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={CHILD.sky} />
      <div className={CHILD.bubbles} />
      {celebrate && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <Star className="w-24 h-24 text-yellow-400 animate-ping opacity-80" />
        </div>
      )}

      <header className={CHILD.header}>
        <PlatformLogo lang={lang} className="h-8 w-auto" iconClassName="w-8 h-8" />
        <div className="text-center">
          <h1 className={CHILD.title}>{copy.title}</h1>
          <p className="text-xs font-bold text-pink-500">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
          className="px-3 py-1 rounded-full bg-white/80 font-bold text-sm text-orange-500"
        >
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
      </header>

      <main className={CHILD.main}>
        <ChildPlayZone
          lang={lang}
          studentName={student.name?.split(' ')?.[0] ?? student.name}
          studentId={student.id}
          onCelebrate={() => {
            setCelebrate(true);
            setTimeout(() => setCelebrate(false), 600);
          }}
        />
      </main>
    </div>
  );
}
