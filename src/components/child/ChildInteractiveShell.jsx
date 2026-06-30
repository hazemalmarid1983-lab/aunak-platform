import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { findStudentByChildToken, parseChildRouteToken } from '../../lib/childAccess';
import { isTawasulMvp } from '../../lib/tawasulConfig';
import { CHILD } from '../../lib/childTheme';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';
import { MIRROR_COMMANDS, mirrorFingerprint, parseMirrorState } from '../../lib/tawasulMirror';
import { useTawasulIdleGaze } from '../../hooks/useTawasulIdleGaze';
import ChildPlayZone from './ChildPlayZone';
import ChildBottomNav from './ChildBottomNav';
import ChildHomePanel from './ChildHomePanel';
import ChildCalmZone from './ChildCalmZone';
import ChildStarsPanel from './ChildStarsPanel';
import ChildAwniCompanion from './ChildAwniCompanion';
import PlatformLogo from '../PlatformLogo';

export default function ChildInteractiveShell({ lang: langProp = 'ar' }) {
  const tawasul = isTawasulMvp();
  const theme = tawasul ? TAWASUL_CHILD : CHILD;
  const [lang, setLang] = useState(langProp);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [tab, setTab] = useState('home');
  const [starCount, setStarCount] = useState(0);
  const [gazeAlert, setGazeAlert] = useState('');
  const [companionIdx, setCompanionIdx] = useState(0);
  const mirrorSeenRef = useRef('');

  const reloadStudent = useCallback(async () => {
    const token = parseChildRouteToken();
    if (!token) return null;
    const row = await findStudentByChildToken(token);
    if (row) setStudent(row);
    return row;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = parseChildRouteToken();
      if (!token) {
        setError(
          lang === 'en'
            ? 'Missing child token in URL (?token=AUN-CHD-...)'
            : 'رمز الطفل مفقود في الرابط (?token=AUN-CHD-...)'
        );
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

  useEffect(() => {
    if (!tawasul || !student) return undefined;
    const t = setInterval(() => {
      reloadStudent().then((row) => {
        if (!row?.fields) return;
        const mirror = parseMirrorState(row.fields);
        const fp = mirrorFingerprint(mirror);
        if (!mirror.command || fp === mirrorSeenRef.current) return;
        mirrorSeenRef.current = fp;
        if (mirror.command === MIRROR_COMMANDS.DROP_STAR || mirror.command === MIRROR_COMMANDS.DROP_REWARD) {
          setStarCount((n) => n + 1);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 800);
        }
        if (mirror.command === MIRROR_COMMANDS.ECHO_GOAL) {
          setTab('home');
        }
        if (mirror.command === MIRROR_COMMANDS.CALM_PULSE) {
          setTab('calm');
        }
      });
    }, 3500);
    return () => clearInterval(t);
  }, [tawasul, student, reloadStudent]);

  useTawasulIdleGaze({
    active: tawasul && tab === 'play',
    onTrigger: () => {
      setGazeAlert(
        lang === 'en'
          ? '>> Gaze drift — typewriter cue activated…'
          : '>> شرد بصري — تفعيل صوت الآلة الكاتبة…'
      );
      setTimeout(() => setGazeAlert(''), 6000);
    },
  });

  const copy =
    lang === 'en'
      ? {
          title: tawasul ? 'Sovereign Island' : 'Awni Play World',
          subtitle: tawasul ? 'Gold · Emerald · Neural' : 'Play · Learn · Smile',
          loading: 'Opening your world...',
        }
      : {
          title: tawasul ? 'جزر السيادة' : 'عالم عوني',
          subtitle: tawasul ? 'ذهب · زمرد · عصبي' : 'لعب · تعلّم · ابتسام',
          loading: 'جاري فتح عالمك...',
        };

  const onStarEarned = () => {
    setStarCount((n) => n + 1);
    setCompanionIdx((i) => i + 1);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 600);
  };

  if (loading) {
    return (
      <div className={theme.root}>
        {tawasul && <div className={TAWASUL_CHILD.sky} />}
        {!tawasul && <div className={CHILD.sky} />}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className={`w-12 h-12 animate-spin ${tawasul ? 'text-emerald-400' : 'text-orange-400'}`} />
          <p className={`font-bold ${tawasul ? 'text-[#e8c872]' : 'text-orange-600'}`}>{copy.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className={theme.root}>
        {tawasul ? <div className={TAWASUL_CHILD.sky} /> : <div className={CHILD.sky} />}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <span className="text-6xl mb-4">🧸</span>
          <p className="text-lg font-bold text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  const firstName = student.name?.split(' ')?.[0] ?? student.name;

  return (
    <div className={theme.root} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {tawasul ? (
        <>
          <div className={TAWASUL_CHILD.sky} />
          <div className={TAWASUL_CHILD.grid} />
        </>
      ) : (
        <>
          <div className={CHILD.sky} />
          <div className={CHILD.bubbles} />
        </>
      )}
      {celebrate && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <Star className={`w-24 h-24 animate-ping opacity-80 ${tawasul ? 'text-[#e8c872]' : 'text-yellow-400'}`} />
        </div>
      )}
      {gazeAlert && (
        <div className="fixed top-20 inset-x-4 z-40 mx-auto max-w-md rounded-xl border border-emerald-400/40 bg-[#0d0d10]/95 px-4 py-3 text-xs font-mono text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.2)]">
          {gazeAlert}
        </div>
      )}

      <header className={theme.header}>
        <PlatformLogo lang={lang} className="h-8 w-auto" iconClassName="w-8 h-8" />
        <div className="text-center">
          <h1 className={theme.title}>{copy.title}</h1>
          <p className={`text-xs font-bold ${tawasul ? 'text-emerald-400/90' : 'text-pink-500'}`}>{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
          className={`px-3 py-1 rounded-full font-bold text-sm ${
            tawasul ? 'bg-[#12121a]/80 border border-[#c9a962]/30 text-[#e8c872]' : 'bg-white/80 text-orange-500'
          }`}
        >
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
      </header>

      <main className={theme.main}>
        {tab === 'home' && (
          <div className={tawasul ? TAWASUL_CHILD.card : CHILD.card}>
            {tawasul && (
              <div className="mb-4">
                <ChildAwniCompanion lang={lang} active lineIndex={companionIdx} />
              </div>
            )}
            <ChildHomePanel
              lang={lang}
              studentName={firstName}
              programmedGoal={student.programmedGoal}
              sovereign={tawasul}
            />
          </div>
        )}
        {tab === 'play' && (
          <ChildPlayZone
            lang={lang}
            studentName={firstName}
            studentId={student.id}
            onCelebrate={onStarEarned}
            sovereignIsland={tawasul}
          />
        )}
        {tab === 'calm' && <ChildCalmZone lang={lang} sovereign={tawasul} />}
        {tab === 'stars' && <ChildStarsPanel lang={lang} starCount={starCount} sovereign={tawasul} />}
      </main>

      <ChildBottomNav lang={lang} active={tab} onChange={setTab} sovereign={tawasul} />
    </div>
  );
}
