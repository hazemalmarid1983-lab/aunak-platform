import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { findStudentByChildToken, parseChildRouteToken } from '../../lib/childAccess';
import { isTawasulExperience } from '../../lib/tawasulConfig';
import { CHILD } from '../../lib/childTheme';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';
import { MIRROR_COMMANDS, mirrorFingerprint, parseMirrorState } from '../../lib/tawasulMirror';
import { subscribeMirrorChannel } from '../../lib/mirrorBus';
import {
  clampSovereignStars,
  SOVEREIGN_CHILD_MAX_STARS,
} from '../../lib/childSessionBridge';
import {
  playCalmPulse,
  playGoalEcho,
  playStarDrop,
  playSuccessChime,
  playTaDaFanfare,
  playTypewriterEffect,
  startCalmDrone,
  startProcessingHum,
} from '../../lib/sovereignAudio';
import {
  enqueueAcademySpeech,
  scriptEncouragement,
  scriptWelcome,
  unlockAcademyVoice,
} from '../../lib/academyVoice';
import { useTawasulIdleGaze } from '../../hooks/useTawasulIdleGaze';
import ChildPlayZone from './ChildPlayZone';
import ChildBottomNav from './ChildBottomNav';
import ChildHomePanel from './ChildHomePanel';
import ChildCalmZone from './ChildCalmZone';
import ChildStarsPanel from './ChildStarsPanel';
import ChildAssessmentPanel from './ChildAssessmentPanel';
import ChildAvatar from './ChildAvatar';
import ChildCelebration from './ChildCelebration';
import ChildCalmOverlay from './ChildCalmOverlay';
import AunakChildEcosystem from './AunakChildEcosystem';
import PlatformLogo from '../PlatformLogo';

function readChildViewParam() {
  if (typeof window === 'undefined') return '';
  try {
    const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
    if (path === '/islands' || path.startsWith('/islands/')) return 'islands';
    return String(new URLSearchParams(window.location.search).get('view') || '').trim().toLowerCase();
  } catch {
    return '';
  }
}

export default function ChildInteractiveShell({ lang: langProp = 'ar' }) {
  const tawasul = isTawasulExperience();
  const theme = tawasul ? TAWASUL_CHILD : CHILD;
  const [lang, setLang] = useState(langProp);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [tab, setTab] = useState('home');
  const [starCount, setStarCount] = useState(0);
  const [gazeAlert, setGazeAlert] = useState('');
  const [rewardBurst, setRewardBurst] = useState(false);
  const [calmActive, setCalmActive] = useState(false);
  /** After 5/5 stars — open interactive islands map (AunakChildEcosystem) */
  const [world, setWorld] = useState(() => (readChildViewParam() === 'islands' ? 'islands' : 'shell'));
  const mirrorSeenRef = useRef('');
  const welcomeSpokenRef = useRef(false);
  const humRef = useRef(null);
  const rewardTimerRef = useRef(null);
  const calmTimerRef = useRef(null);
  const calmDroneRef = useRef(null);
  const islandsNavRef = useRef(false);

  const reloadStudent = useCallback(async () => {
    const token = parseChildRouteToken();
    if (!token) return null;
    const row = await findStudentByChildToken(token);
    if (row) setStudent(row);
    return row;
  }, []);

  const addStar = useCallback(() => {
    setStarCount((n) => {
      const next = clampSovereignStars(n + 1);
      if (next > n) {
        if (tawasul) playStarDrop();
        else playSuccessChime();
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 600);
      }
      return next;
    });
  }, [tawasul]);

  // Locked reward burst — only the specialist's success command unleashes it.
  const fireReward = useCallback(() => {
    setRewardBurst(true);
    playTaDaFanfare();
    if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
    rewardTimerRef.current = setTimeout(() => setRewardBurst(false), 4200);
  }, []);

  // Calming sensory pulse — fluid gradient takeover + soothing drone.
  const enterCalm = useCallback(() => {
    setTab('calm');
    setCalmActive(true);
    calmDroneRef.current?.stop?.();
    calmDroneRef.current = startCalmDrone();
    playCalmPulse();
    if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
    calmTimerRef.current = setTimeout(() => {
      setCalmActive(false);
      calmDroneRef.current?.stop?.();
      calmDroneRef.current = null;
    }, 30000);
  }, []);

  useEffect(
    () => () => {
      if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
      if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
      calmDroneRef.current?.stop?.();
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = parseChildRouteToken();
      if (!token) {
        setError(
          lang === 'en'
            ? 'Missing beneficiary token in URL (?token=AUN-CHD-...)'
            : 'رمز المستفيد مفقود في الرابط (?token=AUN-CHD-...)'
        );
        setLoading(false);
        return;
      }
      try {
        const row = await findStudentByChildToken(token);
        if (cancelled) return;
        if (!row) {
          setError(lang === 'en' ? 'Invalid or inactive beneficiary token' : 'رمز المستفيد غير صالح أو غير مفعّل');
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
    humRef.current = startProcessingHum();
    const unlock = () => unlockAcademyVoice();
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    return () => {
      humRef.current?.stop?.();
      document.removeEventListener('pointerdown', unlock);
    };
  }, [tawasul, student]);

  useEffect(() => {
    if (!tawasul || !student || welcomeSpokenRef.current) return;
    welcomeSpokenRef.current = true;
    const firstName = student.name?.split(' ')?.[0] ?? student.name ?? '';
    unlockAcademyVoice();
    enqueueAcademySpeech(scriptWelcome(firstName, lang), { lang, preferCloud: true });
  }, [tawasul, student, lang]);

  useEffect(() => {
    if (!tawasul || !student) return undefined;
    let stopped = false;
    let ablyStop = () => {};

    const handleMirrorCommand = (mirror, row = {}) => {
      if (stopped || !mirror?.command) return;
      const fp = mirrorFingerprint(mirror);
      if (fp === mirrorSeenRef.current) return;
      mirrorSeenRef.current = fp;

      if (mirror.command === MIRROR_COMMANDS.DROP_STAR || mirror.command === MIRROR_COMMANDS.DROP_REWARD) {
        addStar();
        fireReward();
      }
      if (mirror.command === MIRROR_COMMANDS.ECHO_GOAL) {
        setTab('home');
        playGoalEcho();
        const payloadGoal = mirror.payload?.trim();
        const spokenGoal =
          (payloadGoal && payloadGoal !== 'live' ? payloadGoal : '') ||
          row.programmedGoal?.trim() ||
          student?.programmedGoal?.trim() ||
          (lang === 'en' ? 'Your behavior therapist set a new IEP goal.' : 'هدف IEP جديد من المعالج السلوكي.');
        unlockAcademyVoice();
        enqueueAcademySpeech(spokenGoal, { lang, preferCloud: true });
      }
      if (mirror.command === MIRROR_COMMANDS.CALM_PULSE) {
        enterCalm();
      }
    };

    const applyMirrorFromRow = (row) => {
      if (stopped || !row?.fields) return;
      handleMirrorCommand(parseMirrorState(row.fields), row);
    };

    let ablyConnected = false;
    subscribeMirrorChannel(student.id, (msg) => {
      handleMirrorCommand(
        { command: msg.command, payload: msg.payload ?? '' },
        { programmedGoal: msg.goalEcho }
      );
    }).then((bus) => {
      ablyConnected = bus.connected;
      ablyStop = bus.stop;
      if (!ablyConnected && !stopped) startFallbackPoll();
    });

    let pollTimer = null;
    const FALLBACK_POLL_MS = 3500;
    const startFallbackPoll = () => {
      const tick = () => {
        if (stopped || ablyConnected) return;
        reloadStudent()
          .then(applyMirrorFromRow)
          .catch((err) => {
            if (import.meta.env?.DEV) console.warn('[child mirror] poll fallback:', err?.message);
          })
          .finally(() => {
            if (!stopped && !ablyConnected) pollTimer = setTimeout(tick, FALLBACK_POLL_MS);
          });
      };
      tick();
    };

    return () => {
      stopped = true;
      if (pollTimer) clearTimeout(pollTimer);
      ablyStop();
    };
  }, [tawasul, student, reloadStudent, addStar, fireReward, enterCalm, lang]);

  useTawasulIdleGaze({
    active: tawasul && tab === 'play',
    onTrigger: () => {
      playTypewriterEffect(18);
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
          title: tawasul ? 'Aunak Neural Empire' : 'Sensory Intervention Environment',
          subtitle: tawasul ? 'Gold · Emerald · Sovereign flow' : 'Sense · Empower · Grow',
          loading: 'Initializing neural island…',
        }
      : {
          title: tawasul ? 'عونك · الإمبراطورية العصبية' : 'بيئة التدخل الحسي والتمكين النمائي',
          subtitle: tawasul ? 'ذهب · زمرد · نهر سيادي' : 'حسّ · تمكين · نمو',
          loading: 'تهيئة الجزيرة العصبية…',
        };

  const onStarEarned = () => {
    addStar();
    if (tawasul) {
      unlockAcademyVoice();
      enqueueAcademySpeech(scriptEncouragement(lang), { lang, preferCloud: false });
    }
  };

  const handleAssessmentComplete = () => {
    reloadStudent().then(() => setTab('home'));
  };

  const openIslandsWorld = useCallback(() => {
    if (islandsNavRef.current || world === 'islands') return;
    islandsNavRef.current = true;
    playTaDaFanfare();
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('view', 'islands');
      const qs = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
    } catch {
      /* ignore */
    }
    // Brief celebration then hand off to islands map
    window.setTimeout(() => setWorld('islands'), 700);
  }, [world]);

  // Auto-navigate when star bar hits 5/5 (play zone or mirror rewards)
  useEffect(() => {
    if (starCount < SOVEREIGN_CHILD_MAX_STARS) return;
    openIslandsWorld();
  }, [starCount, openIslandsWorld]);

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
          <span className="text-6xl mb-4">{tawasul ? '⚡' : '🧸'}</span>
          <p className={`text-lg font-bold ${tawasul ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  const firstName = student.name?.split(' ')?.[0] ?? student.name;

  // After 5/5 stars (or ?view=islands) — interactive islands map for the active child
  if (world === 'islands') {
    return (
      <AunakChildEcosystem
        studentId={student.id}
        studentName={student.name || firstName}
        programmedGoal={student.programmedGoal}
        reloadStudent={reloadStudent}
        initialStep="map"
        onBackToGate={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  // Sovereign child path — full sensory island ecosystem (non-Tawasul)
  if (!tawasul) {
    return (
      <AunakChildEcosystem
        studentId={student.id}
        studentName={student.name || firstName}
        programmedGoal={student.programmedGoal}
        reloadStudent={reloadStudent}
        onBackToGate={() => {
          window.location.href = '/';
        }}
      />
    );
  }

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
      {tawasul && <ChildCalmOverlay show={calmActive} lang={lang} />}
      {tawasul && <ChildCelebration show={rewardBurst} lang={lang} />}
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
          {tawasul && (
            <p className="text-[10px] font-mono text-[#c9a962]/70 mt-0.5">
              {lang === 'en' ? `Stars ${starCount}/${SOVEREIGN_CHILD_MAX_STARS}` : `نجوم ${starCount}/${SOVEREIGN_CHILD_MAX_STARS}`}
            </p>
          )}
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
            {tawasul ? (
              <div className="flex flex-col items-center gap-6">
                <ChildAvatar
                  mood={calmActive ? 'calm' : rewardBurst ? 'celebrate' : 'happy'}
                  onTap={() => {
                    unlockAcademyVoice();
                    enqueueAcademySpeech(scriptEncouragement(lang), { lang, preferCloud: false });
                  }}
                />
                <ChildHomePanel
                  lang={lang}
                  studentName={firstName}
                  programmedGoal={student.programmedGoal}
                  sovereign={tawasul}
                />
              </div>
            ) : (
              <ChildHomePanel
                lang={lang}
                studentName={firstName}
                programmedGoal={student.programmedGoal}
                sovereign={tawasul}
              />
            )}
          </div>
        )}
        {tab === 'play' && (
          <ChildPlayZone
            lang={lang}
            studentName={firstName}
            studentId={student.id}
            onCelebrate={onStarEarned}
            onCapReached={openIslandsWorld}
            sovereignIsland={tawasul}
            starCap={tawasul ? SOVEREIGN_CHILD_MAX_STARS : null}
            globalStarCount={starCount}
          />
        )}
        {tab === 'assessment' && tawasul && (
          <ChildAssessmentPanel
            lang={lang}
            studentName={firstName}
            recordId={student.id}
            onComplete={handleAssessmentComplete}
            onGoalSynced={reloadStudent}
          />
        )}
        {tab === 'calm' && <ChildCalmZone lang={lang} sovereign={tawasul} />}
        {tab === 'stars' && (
          <ChildStarsPanel lang={lang} starCount={starCount} sovereign={tawasul} maxStars={SOVEREIGN_CHILD_MAX_STARS} />
        )}
      </main>

      <ChildBottomNav lang={lang} active={tab} onChange={setTab} sovereign={tawasul} />
    </div>
  );
}
