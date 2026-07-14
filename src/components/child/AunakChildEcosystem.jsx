import { useState, useEffect, useRef, useCallback } from 'react';
import { MIRROR_COMMANDS, mirrorFingerprint, parseMirrorState } from '../../lib/tawasulMirror';
import { subscribeMirrorChannel } from '../../lib/mirrorBus';
import { triggerChildIslandSeal } from '../../lib/childSessionBridge';

/** Sensory-friendly calming audio (synth — no external URLs). */
const playCalmingBeep = (frequency = 440, duration = 0.15, type = 'sine') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play blocked by browser autoplay policy until user interaction.', e);
  }
};

const playNudgeSound = () => {
  playCalmingBeep(600, 0.05, 'triangle');
  setTimeout(() => playCalmingBeep(450, 0.04, 'triangle'), 60);
};

const playMagicalStarSound = () => {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, idx) => {
    setTimeout(() => playCalmingBeep(freq, 0.25, 'sine'), idx * 100);
  });
};

const playCalmingHum = () => {
  playCalmingBeep(120, 1.2, 'sine');
};

const ISLAND_IDS = ['sensory_motor', 'attention', 'emotional', 'language', 'academic'];

/** Map free-text Active IEP goal → island id. */
export function resolveIslandGoal(raw) {
  const v = String(raw ?? '').trim().toLowerCase();
  if (ISLAND_IDS.includes(v)) return v;
  if (/sensory|حسي|حرك|motor|تآزر/.test(v)) return 'sensory_motor';
  if (/attention|انتباه|تركيز|focus|بصر/.test(v)) return 'attention';
  if (/emotion|عاطف|انفعال|تعبير/.test(v)) return 'emotional';
  if (/language|لغ|تواصل|pecs|كلام|نطق/.test(v)) return 'language';
  if (/academic|أكاديم|حروف|أرقام|إدراك/.test(v)) return 'academic';
  return 'sensory_motor';
}

const islandsData = [
  {
    id: 'sensory_motor',
    name: 'جزيرة التآزر الحسي والحركي',
    englishName: 'Sensory-Motor Island',
    description: 'تمارين تفاعلية لتنمية التآزر البصري الحركي وتتبع الأشكال الدقيقة.',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40',
    glowColor: 'shadow-emerald-500/20',
    icon: '🏝️',
    games: ['تتبع الأشكال الهندسية', 'تلوين الفواكه التفاعلي', 'توازن اللوح الافتراضي'],
  },
  {
    id: 'attention',
    name: 'جزيرة الانتباه والتركيز البصري',
    englishName: 'Attention & Focus Island',
    description: 'أنشطة تدخلية معززة لزيادة التتبع البصري المشترك وتجنب الشرود والانحراف.',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40',
    glowColor: 'shadow-amber-500/20',
    icon: '👁️',
    games: ['البحث عن الأزواج المتطابقة', 'قراءة الوقت البصري', 'حارس المرمى البطل'],
  },
  {
    id: 'emotional',
    name: 'جزيرة التعبير والانفعال العاطفي',
    englishName: 'Emotional Expression Island',
    description: 'محاكاة وقراءة تعبيرات الوجه وفهم الانفعالات النفسية المختلفة.',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40',
    glowColor: 'shadow-rose-500/20',
    icon: '🎭',
    games: ['وحوش التعبيرات الودودة', 'تطابق تعابير الوجه الحية', 'مختبر ألحان المشاعر'],
  },
  {
    id: 'language',
    name: 'جزيرة التمكين اللغوي والتواصل',
    englishName: 'Language & Communication Island',
    description: 'كروت التواصل البديل PECS ثلاثية الأبعاد لتعزيز النطق والطلب التلقائي.',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40',
    glowColor: 'shadow-purple-500/20',
    icon: '💬',
    games: ['نظام تبادل الصور ثلاثي الأبعاد', 'سياق الجمل والطلب التلقائي', 'صدى الحروف التفاعلي'],
  },
  {
    id: 'academic',
    name: 'جزيرة المهارات الإدراكية والأكاديمية',
    englishName: 'Early Academic Island',
    description: 'تعليم الحروف والأرقام بطرق شيقة متمركزة حول اهتمامات البطل المفضلة.',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40',
    glowColor: 'shadow-blue-500/20',
    icon: '🎓',
    games: ['تتبع الحروف العربية والإنجليزية', 'تعداد المجموعات والكميات', 'سراج الألوان والأشكال'],
  },
];

function queueLocalMirror(studentId, command, payload = null) {
  if (!studentId) return;
  try {
    localStorage.setItem(
      `mirror_command_${studentId}`,
      JSON.stringify({ command, payload, executed: false, at: Date.now() })
    );
  } catch {
    /* private mode */
  }
}

/**
 * Child-facing sensory intervention ecosystem — calibrator → island map → activities.
 * Ghost Mirror: Ably/Airtable + localStorage demo bus.
 */
export default function AunakChildEcosystem({
  studentId,
  studentName = 'البطل',
  programmedGoal = 'sensory_motor',
  onBackToGate,
  reloadStudent,
  /** Skip calibrator when child arrives from completed 5/5 star session */
  initialStep = 'calibrator',
}) {
  const islandGoal = resolveIslandGoal(programmedGoal);

  const [currentStep, setCurrentStep] = useState(
    initialStep === 'map' || initialStep === 'game' ? initialStep : 'calibrator'
  );
  const [calibrationCount, setCalibrationCount] = useState(0);
  const [calibrationStart, setCalibrationStart] = useState(null);
  const [calibrationMetrics, setCalibrationMetrics] = useState({ reactionTimes: [] });

  const [selectedIsland, setSelectedIsland] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  const [isGazeNeutral, setIsGazeNeutral] = useState(true);
  const [gazeSecondsAway, setGazeSecondsAway] = useState(0);
  const [showScreenDimmer, setShowScreenDimmer] = useState(false);
  const [gazeAlertCount, setGazeAlertCount] = useState(0);

  const [droppedStars, setDroppedStars] = useState([]);
  const [activeCalmHum, setActiveCalmHum] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(40 * 60);
  const [sessionSealed, setSessionSealed] = useState(false);

  const trackerInterval = useRef(null);
  const mockGazeTimer = useRef(null);
  const mirrorSeenRef = useRef('');
  const sealedRef = useRef(false);

  const generateCalibratorBubbles = useCallback(() => {
    const newBubbles = Array.from({ length: 3 }).map((_, idx) => ({
      id: idx,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 50,
      size: 70 + Math.random() * 40,
      popped: false,
      color: idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-emerald-400' : 'bg-cyan-400',
    }));
    setBubbles(newBubbles);
  }, []);

  useEffect(() => {
    if (currentStep === 'calibrator') {
      setCalibrationStart(Date.now());
      generateCalibratorBubbles();
    }
  }, [currentStep, generateCalibratorBubbles]);

  const handleSealSession = useCallback(async () => {
    if (sealedRef.current) return;
    sealedRef.current = true;
    setSessionSealed(true);
    playCalmingBeep(330, 0.4, 'triangle');
    try {
      localStorage.setItem(`session_status_${studentId}`, 'Locked');
    } catch {
      /* ignore */
    }
    setAdminMessage('🔒 تم ختم هذه الجلسة العلاجية بنجاح ومزامنتها محاسبياً.');
    try {
      await triggerChildIslandSeal({
        studentId,
        studentName,
        interactionCount: Math.max(score, 5),
        source: 'aunak_child_ecosystem',
        interactionType: selectedIsland?.id || 'island_session',
      });
    } catch (err) {
      console.warn('[child ecosystem] seal:', err?.message);
    }
  }, [studentId, studentName, score, selectedIsland?.id]);

  const handleAdminCommand = useCallback(
    (command, payload) => {
      const cmd = String(command ?? '')
        .trim()
        .toLowerCase()
        .replace(/-/g, '_');

      if (cmd === 'drop_star' || cmd === MIRROR_COMMANDS.DROP_STAR || cmd === MIRROR_COMMANDS.DROP_REWARD) {
        playMagicalStarSound();
        const newStar = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 10 + Math.random() * 20,
        };
        setDroppedStars((prev) => [...prev, newStar]);
        setScore((s) => s + 15);
        setAdminMessage('⭐ أرسل لك المعالج السلوكي نجمة تشجيعية!');
        setTimeout(() => setAdminMessage(''), 5000);
        return;
      }

      if (cmd === 'trigger_calm' || cmd === MIRROR_COMMANDS.CALM_PULSE || cmd === 'calm_pulse') {
        playCalmingHum();
        setActiveCalmHum(true);
        setAdminMessage('🧘 وضع التهدئة مفعل الآن حسياً...');
        setTimeout(() => {
          setActiveCalmHum(false);
          setAdminMessage('');
        }, 6000);
        return;
      }

      if (cmd === 'force_island' || cmd === MIRROR_COMMANDS.ECHO_GOAL) {
        const targetId = resolveIslandGoal(payload || islandGoal);
        const targetIsland = islandsData.find((i) => i.id === targetId);
        if (targetIsland) {
          setSelectedIsland(targetIsland);
          setActiveGame(targetIsland.games[0]);
          setCurrentStep('game');
          setAdminMessage(`🚀 وجهك المعالج السلوكي فوراً إلى: ${targetIsland.name}`);
          setTimeout(() => setAdminMessage(''), 5000);
        }
        return;
      }

      if (cmd === 'seal_session') {
        void handleSealSession();
      }
    },
    [handleSealSession, islandGoal]
  );

  const handlePopCalibratorBubble = (bubbleId) => {
    playCalmingBeep(440 + bubbleId * 100, 0.1, 'sine');
    const popTime = Date.now();
    const reactTime = popTime - (calibrationStart || popTime);

    setCalibrationMetrics((prev) => ({
      ...prev,
      reactionTimes: [...prev.reactionTimes, reactTime],
    }));

    setBubbles((prev) => prev.map((b) => (b.id === bubbleId ? { ...b, popped: true } : b)));
    setCalibrationCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setTimeout(() => {
          setCurrentStep('map');
          playMagicalStarSound();
        }, 500);
      }
      return next;
    });
    setCalibrationStart(Date.now());
  };

  // Session timer (40 min clinical)
  useEffect(() => {
    trackerInterval.current = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          void handleSealSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(trackerInterval.current);
  }, [handleSealSession]);

  // Gaze monitor simulation (AUN-4611-style nudge)
  useEffect(() => {
    if (currentStep !== 'map' && currentStep !== 'game') return undefined;

    mockGazeTimer.current = setInterval(() => {
      if (!isGazeNeutral) {
        setGazeSecondsAway((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            setShowScreenDimmer(true);
            playNudgeSound();
            setGazeAlertCount((g) => g + 1);
          }
          return next;
        });
      } else {
        setGazeSecondsAway(0);
        setShowScreenDimmer(false);
      }
    }, 1000);

    return () => {
      if (mockGazeTimer.current) clearInterval(mockGazeTimer.current);
    };
  }, [currentStep, isGazeNeutral]);

  // LocalStorage Ghost Mirror demo bus
  useEffect(() => {
    if (!studentId) return undefined;
    const commandPoller = setInterval(() => {
      try {
        const cachedCommand = localStorage.getItem(`mirror_command_${studentId}`);
        if (!cachedCommand) return;
        const parsed = JSON.parse(cachedCommand);
        if (parsed && !parsed.executed) {
          handleAdminCommand(parsed.command, parsed.payload);
          parsed.executed = true;
          localStorage.setItem(`mirror_command_${studentId}`, JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Mirror command polling error: ', err);
      }
    }, 2500);

    return () => clearInterval(commandPoller);
  }, [studentId, handleAdminCommand]);

  // Live Ghost Mirror — Ably + Airtable fallback
  useEffect(() => {
    if (!studentId) return undefined;
    let stopped = false;
    let ablyStop = () => {};
    let pollTimer = null;
    let ablyConnected = false;

    const applyMirror = (mirror, row = {}) => {
      if (stopped || !mirror?.command) return;
      const fp = mirrorFingerprint(mirror);
      if (fp === mirrorSeenRef.current) return;
      mirrorSeenRef.current = fp;
      handleAdminCommand(mirror.command, mirror.payload || row.programmedGoal);
    };

    subscribeMirrorChannel(studentId, (msg) => {
      applyMirror({ command: msg.command, payload: msg.payload ?? '' });
    }).then((bus) => {
      ablyConnected = bus.connected;
      ablyStop = bus.stop;
      if (!ablyConnected && !stopped) startFallbackPoll();
    });

    const startFallbackPoll = () => {
      const tick = () => {
        if (stopped || ablyConnected) return;
        const run = reloadStudent
          ? reloadStudent()
          : Promise.resolve(null);
        run
          .then((row) => {
            if (row?.fields) applyMirror(parseMirrorState(row.fields), row);
          })
          .catch(() => {})
          .finally(() => {
            if (!stopped && !ablyConnected) pollTimer = setTimeout(tick, 3500);
          });
      };
      tick();
    };

    return () => {
      stopped = true;
      if (pollTimer) clearTimeout(pollTimer);
      ablyStop();
    };
  }, [studentId, handleAdminCommand, reloadStudent]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getActiveIslands = () => {
    if (islandGoal === 'sensory_motor') {
      return islandsData.filter((i) => i.id === 'sensory_motor' || i.id === 'attention');
    }
    if (islandGoal === 'language') {
      return islandsData.filter((i) => i.id === 'language' || i.id === 'academic');
    }
    if (islandGoal === 'attention') {
      return islandsData.filter((i) => i.id === 'attention' || i.id === 'sensory_motor');
    }
    if (islandGoal === 'emotional') {
      return islandsData.filter((i) => i.id === 'emotional' || i.id === 'language');
    }
    if (islandGoal === 'academic') {
      return islandsData.filter((i) => i.id === 'academic' || i.id === 'language');
    }
    return islandsData;
  };

  const activeIslands = getActiveIslands();
  const heroLabel = studentName?.trim() || 'البطل';

  return (
    <div
      dir="rtl"
      className={`min-h-screen bg-[#0B0F19] text-gray-100 font-sans flex flex-col relative overflow-hidden transition-all duration-700 ${
        showScreenDimmer ? 'brightness-50 saturate-50' : 'brightness-100 saturate-100'
      }`}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <header className="border-b border-gray-800 bg-[#111625]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#C5A880] to-yellow-100">
              بيئة التدخل الحسي والتمكين النمائي
            </h1>
            <p className="text-[10px] text-gray-400">منصة عونك للتربية الخاصة والسيادة الرقمية</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#151B2B] px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-2">
            <span className="text-gray-500">البطل:</span>
            <span className="text-amber-400 font-bold">{heroLabel}</span>
          </div>

          <div className="bg-[#151B2B] px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-2">
            <span className="text-gray-500">الجلسة:</span>
            <span className="text-emerald-400 font-bold">{formatTime(gameTimeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={onBackToGate}
            className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-800 transition-all text-xs font-semibold"
          >
            خروج من النظام
          </button>
        </div>
      </header>

      {adminMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-amber-500/10 border border-[#C5A880] text-amber-300 text-xs md:text-sm px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce backdrop-blur-sm">
          <span className="animate-ping w-2 h-2 rounded-full bg-amber-400" />
          <span>{adminMessage}</span>
        </div>
      )}

      {showScreenDimmer && (
        <div className="absolute inset-0 bg-[#070A12]/40 z-30 pointer-events-none flex items-center justify-center transition-all duration-500">
          <div className="text-center p-6 rounded-2xl bg-[#111625]/90 border border-amber-500/20 backdrop-blur-sm max-w-sm pointer-events-auto">
            <p className="text-amber-400 text-sm font-bold mb-1">انتباه {heroLabel} مشتت</p>
            <p className="text-gray-400 text-xs leading-normal">
              لقد خفضنا الإضاءة وصنعنا صوتاً خفيفاً لمساعدتك على العودة والتركيز معنا.
            </p>
            <button
              type="button"
              onClick={() => setIsGazeNeutral(true)}
              className="mt-3 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full hover:bg-amber-500/30 transition-all"
            >
              لقد عدت للشاشة (محاكاة النظر)
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col p-6 relative">
        {currentStep === 'calibrator' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-8 max-w-md">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C5A880] bg-[#C5A880]/15 px-3 py-1 rounded">
                مقياس الجاهزية الحسية واللمسية
              </span>
              <h2 className="text-xl md:text-2xl font-bold mt-4 text-white">مرحباً بك في عالم الجزر الرائع!</h2>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                فرقع الفقاعات الملونة الطائرة لتهيئة مستشعرات الجهاز ومعايرة سرعة استجابة أصابعك اللطيفة.
              </p>
              {calibrationMetrics.reactionTimes.length > 0 && (
                <p className="text-[10px] text-gray-600 mt-2 font-mono">
                  متوسط الاستجابة:{' '}
                  {Math.round(
                    calibrationMetrics.reactionTimes.reduce((a, b) => a + b, 0) /
                      calibrationMetrics.reactionTimes.length
                  )}{' '}
                  ms
                </p>
              )}
            </div>

            <div className="w-full max-w-xl h-[350px] bg-[#111625] border border-gray-800 rounded-2xl relative overflow-hidden shadow-2xl">
              {bubbles.map(
                (bubble) =>
                  !bubble.popped && (
                    <button
                      key={bubble.id}
                      type="button"
                      onClick={() => handlePopCalibratorBubble(bubble.id)}
                      style={{
                        left: `${bubble.x}%`,
                        top: `${bubble.y}%`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                      }}
                      className={`absolute rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer ${bubble.color} bg-opacity-20 border border-white/30`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white/40 absolute top-2 right-2 blur-[1px]" />
                      <span className="text-base">🎈</span>
                    </button>
                  )
              )}

              {calibrationCount < 3 && (
                <div className="absolute bottom-4 left-4 text-[11px] text-gray-500 font-mono">
                  تم فرقعة {calibrationCount} من أصل 3
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep('map')}
              className="mt-6 text-[11px] text-gray-600 hover:text-[#C5A880] underline transition-colors"
            >
              تخطي المعايرة والدخول المباشر لخريطة الجزر
            </button>
          </div>
        )}

        {currentStep === 'map' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#C5A880]">عالم الجزر العلاجي والتمكيني</h2>
              <p className="text-xs text-gray-400 mt-1">
                اختر جزيرتك المفضلة لتبدأ بيئة التدخل والتمكين النمائي. الجزر المفتوحة مُعيَّنة تلقائياً بناءً على
                الخطة التربوية الفردية النشطة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
              {activeIslands.map((island) => {
                const isProgrammed = island.id === islandGoal;
                return (
                  <div
                    key={island.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedIsland(island);
                      setActiveGame(island.games[0]);
                      setCurrentStep('game');
                      playCalmingBeep(523, 0.1, 'sine');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedIsland(island);
                        setActiveGame(island.games[0]);
                        setCurrentStep('game');
                      }
                    }}
                    className={`group cursor-pointer rounded-2xl border bg-[#111625]/90 p-6 shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden bg-gradient-to-br ${island.color} ${island.glowColor} hover:shadow-2xl`}
                  >
                    {isProgrammed && (
                      <span className="absolute top-3 left-3 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        الهدف النشط بالخطة الفردية
                      </span>
                    )}

                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {island.icon}
                    </div>

                    <h3 className="text-base font-bold text-gray-100 group-hover:text-[#C5A880] transition-colors">
                      {island.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{island.englishName}</p>
                    <p className="text-xs text-gray-400 mt-3 leading-normal line-clamp-2">{island.description}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-800/60 pt-3 text-[11px] text-[#C5A880]">
                      <span>دخول الجزيرة</span>
                      <span className="group-hover:translate-x-1 transition-transform">←</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-[#111625]/80 border border-gray-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-right md:text-left">
                <span className="text-[9px] uppercase font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded">
                  لوحة تحكم رصد النظرة
                </span>
                <p className="text-[11px] text-gray-400 mt-1">
                  محاكاة تشتت عين المستفيد لـ 5 ثوانٍ لاختبار مرصد النظرة اللحظي وتدخلات الصوت والإضاءة.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsGazeNeutral(!isGazeNeutral)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isGazeNeutral
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
                  }`}
                >
                  {isGazeNeutral ? 'وضع النظر السليم' : 'البطل مشتت (ينظر بعيداً)'}
                </button>

                <div className="text-xs font-mono text-gray-500">
                  التنبيهات المفعّلة: <span className="text-amber-400 font-bold">{gazeAlertCount}</span>
                  {gazeSecondsAway > 0 && (
                    <span className="text-gray-600 ms-2">({gazeSecondsAway}ث)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'game' && selectedIsland && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-4 mb-4">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('map');
                    setSelectedIsland(null);
                    setActiveGame(null);
                  }}
                  className="text-xs text-gray-400 hover:text-[#C5A880] mb-2 flex items-center gap-1"
                >
                  <span>→</span>
                  <span>العودة لخريطة الجزر</span>
                </button>
                <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                  <span>{selectedIsland.icon}</span>
                  <span>{selectedIsland.name}</span>
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedIsland.games.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setActiveGame(g);
                      setScore(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      activeGame === g
                        ? 'bg-[#C5A880]/15 text-[#C5A880] border-[#C5A880]/40'
                        : 'bg-[#111625] text-gray-400 border-gray-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-[#111625] border border-gray-800 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner min-h-[350px]">
              {droppedStars.map((star) => (
                <div
                  key={star.id}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                  className="absolute text-3xl animate-bounce z-20 pointer-events-none drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]"
                >
                  ⭐
                </div>
              ))}

              {activeCalmHum && (
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none z-10 animate-pulse border-4 border-blue-500/20 rounded-2xl" />
              )}

              <div className="text-center z-10 max-w-md">
                <span className="text-[10px] uppercase font-bold bg-[#C5A880]/15 text-[#C5A880] px-2 py-0.5 rounded">
                  النشاط: {activeGame}
                </span>

                <div className="my-6">
                  {activeGame === 'تتبع الأشكال الهندسية' ||
                  activeGame === 'تتبع الحروف العربية والإنجليزية' ? (
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-400 mb-4">تتبع الخط الذهبي المتقطع بإصبعك برفق:</p>
                      <svg className="w-48 h-48 text-[#C5A880]/40" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-spin"
                          style={{ animationDuration: '20s' }}
                        />
                        <path
                          d="M 50 10 L 50 90 M 10 50 L 90 50"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                      </svg>
                    </div>
                  ) : activeGame === 'تلوين الفواكه التفاعلي' ||
                    activeGame === 'سراج الألوان والأشكال' ? (
                    <div className="grid grid-cols-3 gap-3">
                      {['🍎', '🍌', '🍇'].map((item, idx) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            playCalmingBeep(300 + idx * 80, 0.12, 'sine');
                            setScore((s) => s + 10);
                          }}
                          className="w-16 h-16 bg-gray-800/40 border border-gray-700/50 hover:border-[#C5A880]/50 rounded-xl text-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-400 mb-4">اضغط على الكرات النيون لكسب نقاط التناغم:</p>
                      <div className="flex gap-4">
                        {[0, 1, 2].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              playCalmingBeep(400 + val * 100, 0.08, 'sine');
                              setScore((s) => s + 5);
                            }}
                            className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-lg"
                          >
                            🟢
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400 font-mono mt-4">
                  مؤشر إنجاز البطل:{' '}
                  <span className="text-emerald-400 font-bold">{score} نقطة</span>
                </div>
              </div>

              {sessionSealed && (
                <div className="absolute inset-0 bg-[#0B0F19]/95 z-40 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-5xl mb-4">🔒</span>
                  <h3 className="text-base font-bold text-amber-400">تم ختم الجلسة بنجاح (Immutable Seal)</h3>
                  <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                    تم توثيق وتوقيع مصفوفة ABC وإغلاق إمكانية تعديلها لحوكمة مستحقات المعالجين السلوكيين بالتطابق مع
                    حضور البطل.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      sealedRef.current = false;
                      setSessionSealed(false);
                      setGameTimeLeft(40 * 60);
                      setCurrentStep('map');
                    }}
                    className="mt-6 bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/40 px-4 py-2 rounded-xl text-xs hover:bg-[#C5A880]/25 transition-all"
                  >
                    تأسيس جلسة جديدة
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 bg-[#111625]/80 border border-gray-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-right md:text-left">
                <span className="text-[9px] uppercase font-bold bg-[#C5A880]/15 text-[#C5A880] px-2 py-0.5 rounded">
                  محاكي لوحة القائد الخفي (Ghost Mirror)
                </span>
                <p className="text-[11px] text-gray-400 mt-1">
                  تماثل أفعال المعالج السلوكي عن بُعد لتؤثر حياً على شاشة المستفيد (WebSockets / Airtable).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => queueLocalMirror(studentId, 'DROP_STAR')}
                  className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  ⭐ إلقاء نجمة للبطل
                </button>

                <button
                  type="button"
                  onClick={() => queueLocalMirror(studentId, 'TRIGGER_CALM')}
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  🧘 تفعيل التهدئة الحسية
                </button>

                <button
                  type="button"
                  onClick={() => queueLocalMirror(studentId, 'SEAL_SESSION')}
                  className="bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  🔒 ختم الجلسة محاسبياً
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 bg-[#111625]/40 px-6 py-4 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-500 gap-2">
        <div>منظومة عونك للسيادة العصبية والتربية الخاصة © 2026</div>
        <div className="flex gap-4">
          <span>
            حالة الاتصال: <span className="text-emerald-500 font-bold">نشط (WebSockets Bus)</span>
          </span>
          <span>
            درجة المعايرة: <span className="text-[#C5A880] font-bold">مستقرة (Sensory Active)</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
