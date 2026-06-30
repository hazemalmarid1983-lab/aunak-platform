import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CHILD, CHILD_GREETINGS, BUBBLE_COLORS } from '../../lib/childTheme';
import { TAWASUL_CHILD, TAWASUL_BUBBLE_COLORS } from '../../lib/tawasulChildTheme';
import {
  triggerChildIslandSeal,
  CHILD_ISLAND_SEAL_THRESHOLD,
} from '../../lib/childSessionBridge';

function randomBubble(colors) {
  return {
    id: Math.random().toString(36).slice(2),
    x: 10 + Math.random() * 70,
    y: 10 + Math.random() * 50,
    size: 48 + Math.random() * 40,
    color: colors[Math.floor(Math.random() * colors.length)],
    emoji: ['⭐', '🎈', '🌈', '💫', '🦋'][Math.floor(Math.random() * 5)],
  };
}

export default function ChildPlayZone({
  lang = 'ar',
  studentName,
  studentId,
  onCelebrate,
  sovereignIsland = false,
  starCap = null,
  globalStarCount = 0,
}) {
  const theme = sovereignIsland ? TAWASUL_CHILD : CHILD;
  const bubbleColors = sovereignIsland ? TAWASUL_BUBBLE_COLORS : BUBBLE_COLORS;
  const greetings = CHILD_GREETINGS[lang] ?? CHILD_GREETINGS.ar;
  const cap = starCap ?? Infinity;
  const atCap = sovereignIsland && globalStarCount >= cap;
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [bubbles, setBubbles] = useState(() => Array.from({ length: 6 }, () => randomBubble(bubbleColors)));
  const [popped, setPopped] = useState(0);
  const [targetColor, setTargetColor] = useState(0);
  const [mode, setMode] = useState('bubbles');
  const sealTriggeredRef = useRef(false);

  const maybeSealSession = useCallback(
    (nextCount) => {
      if (sealTriggeredRef.current || nextCount < CHILD_ISLAND_SEAL_THRESHOLD) return;
      sealTriggeredRef.current = true;
      triggerChildIslandSeal({
        studentId,
        studentName,
        interactionCount: nextCount,
        source: 'child_play_zone',
        interactionType: mode,
      }).catch(() => {
        sealTriggeredRef.current = false;
      });
    },
    [studentId, studentName, mode]
  );

  const colors =
    lang === 'en'
      ? ['Pink', 'Blue', 'Orange', 'Green', 'Purple']
      : ['وردي', 'أزرق', 'برتقالي', 'أخضر', 'بنفسجي'];

  const rewardPop = useCallback(() => {
    if (atCap) return;
    setGreetingIdx((i) => (i + 1) % greetings.length);
    onCelebrate?.();
  }, [atCap, greetings.length, onCelebrate]);

  const pop = useCallback(
    (id) => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
      setPopped((n) => {
        const next = n + 1;
        maybeSealSession(next);
        return next;
      });
      rewardPop();
      if (bubbles.length <= 2) {
        setTimeout(() => setBubbles(Array.from({ length: 6 }, () => randomBubble(bubbleColors))), 400);
      }
    },
    [bubbles.length, maybeSealSession, bubbleColors, rewardPop]
  );

  useEffect(() => {
    const t = setInterval(() => setTargetColor((c) => (c + 1) % bubbleColors.length), 8000);
    return () => clearInterval(t);
  }, [bubbleColors.length]);

  const displayScore = sovereignIsland ? globalStarCount : popped;
  const scoreLabel =
    sovereignIsland && cap !== Infinity
      ? lang === 'en'
        ? `Stars ${displayScore}/${cap}`
        : `نجوم ${displayScore}/${cap}`
      : `${lang === 'en' ? 'Stars' : 'نجوم'}: ${displayScore} ⭐`;

  const copy =
    lang === 'en'
      ? {
          bubbles: sovereignIsland ? 'Pop neural stars — sovereign cap 5' : 'Pop the stars!',
          colors: 'Tap the matching color!',
          switchBubbles: 'Neural',
          switchColors: 'Spectrum',
          capped: 'Five stars sealed — session complete!',
        }
      : {
          bubbles: sovereignIsland ? 'فقّ النجوم العصبية — سقف 5' : 'فقّ الفقاعات!',
          colors: 'اضغط اللون المطلوب!',
          switchBubbles: 'عصبي',
          switchColors: 'طيف',
          capped: 'خُتمت الخمس نجوم — الجلسة مكتملة!',
        };

  const modeBtn = (on, activeClass, idleClass) =>
    `flex-1 py-2 rounded-xl font-bold text-sm ${on ? activeClass : idleClass}`;

  return (
    <div className={theme.card}>
      <div className={theme.mascotWrap}>
        <div className={theme.mascotFace}>{sovereignIsland ? '⚡' : '🤖'}</div>
        <motion.p
          key={greetingIdx}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={theme.speech}
        >
          {atCap
            ? copy.capped
            : greetingIdx === 0 && studentName
              ? `${lang === 'en' ? 'Hi' : 'مرحباً'} ${studentName}! ${greetings[0]}`
              : greetings[greetingIdx]}
        </motion.p>
      </div>

      <div className="flex gap-2 my-4">
        <button
          type="button"
          onClick={() => setMode('bubbles')}
          className={modeBtn(
            mode === 'bubbles',
            sovereignIsland ? 'bg-[#c9a962] text-[#0a0a0c]' : 'bg-orange-400 text-white',
            sovereignIsland
              ? 'bg-[#12121a]/60 text-emerald-300/80 border border-emerald-400/20'
              : 'bg-white/60 text-slate-600'
          )}
        >
          {copy.switchBubbles}
        </button>
        <button
          type="button"
          onClick={() => setMode('colors')}
          className={modeBtn(
            mode === 'colors',
            sovereignIsland ? 'bg-emerald-500 text-[#0a0a0c]' : 'bg-teal-400 text-white',
            sovereignIsland
              ? 'bg-[#12121a]/60 text-[#e8c872]/80 border border-[#c9a962]/20'
              : 'bg-white/60 text-slate-600'
          )}
        >
          {copy.switchColors}
        </button>
      </div>

      <p className={`${theme.subtitle} text-center mb-4`}>
        {mode === 'bubbles' ? copy.bubbles : `${copy.colors} — ${colors[targetColor]}`}
      </p>

      {mode === 'bubbles' ? (
        <div
          className={
            sovereignIsland
              ? theme.islandArena
              : 'relative h-64 rounded-3xl bg-gradient-to-b from-sky-100 to-pink-50 overflow-hidden border-4 border-white'
          }
        >
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              type="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`${theme.btnBubble} bg-gradient-to-br ${b.color}`}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                fontSize: b.size * 0.35,
              }}
              onClick={() => pop(b.id)}
            >
              {b.emoji}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {bubbleColors.map((c, i) => (
            <motion.button
              key={c}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (i === targetColor) {
                  setPopped((n) => {
                    const next = n + 1;
                    maybeSealSession(next);
                    return next;
                  });
                  setTargetColor((t) => (t + 1) % bubbleColors.length);
                  rewardPop();
                }
              }}
              className={`h-24 rounded-3xl bg-gradient-to-br ${c} border-4 ${
                i === targetColor
                  ? sovereignIsland
                    ? 'border-[#e8c872] ring-4 ring-emerald-400/40'
                    : 'border-yellow-300 ring-4 ring-yellow-200'
                  : sovereignIsland
                    ? 'border-[#c9a962]/30'
                    : 'border-white'
              } shadow-lg`}
            />
          ))}
        </div>
      )}

      <p
        className={`text-center mt-4 text-2xl font-black ${
          sovereignIsland ? 'text-[#e8c872]' : 'text-amber-500'
        }`}
      >
        {scoreLabel}
      </p>
    </div>
  );
}
