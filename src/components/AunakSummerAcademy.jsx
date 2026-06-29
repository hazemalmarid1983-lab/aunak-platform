import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth, ROLES } from '../lib/auth';
import { useSummerAcademy } from '../hooks/useSummerAcademy';
import { useAcademyVoice } from '../hooks/useAcademyVoice';
import { useAcademyMood } from '../hooks/useAcademyMood';
import { ACADEMY, ACADEMY_MOODS } from '../lib/academyTheme';
import AcademyShell from './summer-academy/AcademyShell';
import AcademyLiveBackground from './summer-academy/AcademyLiveBackground';
import AcademyWelcomeMission from './summer-academy/AcademyWelcomeMission';
import AcademyTrackHub from './summer-academy/AcademyTrackHub';
import AcademyBrainWheel from './summer-academy/AcademyBrainWheel';
import AcademyLeaderboard from './summer-academy/AcademyLeaderboard';
import AcademyParentZone, { AcademyParentButton } from './summer-academy/AcademyParentZone';

export default function AunakSummerAcademy({ lang: langProp = 'ar' }) {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState(langProp);
  const [taskLoading, setTaskLoading] = useState(false);
  const [mascotExpression, setMascotExpression] = useState('idle');
  const role = user?.role ?? ROLES.PARENT;
  const isParent = role === ROLES.PARENT || role === ROLES.ADMIN;
  const prevAnswersLen = useRef(0);
  const prevView = useRef('welcome');

  const sa = useSummerAcademy({ lang });
  const isParentView = sa.view === 'parent';
  const moodCtrl = useAcademyMood();
  const voice = useAcademyVoice({
    lang,
    studentName: sa.studentName,
    enabled: !isParentView,
    muted: isParentView,
  });

  const copy = {
    ar: {
      hubTitle: 'الأكاديمية الصيفية',
      hubSub: 'مغامرة حية · نورا معك!',
      xpToday: 'نقاط الجهد',
      streak: 'سلسلة',
    },
    en: {
      hubTitle: 'Summer Academy',
      hubSub: 'Live adventure · Nova is with you!',
      xpToday: 'Effort XP',
      streak: 'Streak',
    },
  }[lang];

  const handleStartWelcome = useCallback(() => {
    moodCtrl.toThinking();
    voice.onWelcomeStart();
    sa.startWelcome();
  }, [moodCtrl, voice, sa]);

  const handleAnswer = useCallback(
    (optionIndex) => {
      voice.onAnswer();
      setMascotExpression('happy');
      moodCtrl.celebrate();
      setTimeout(() => setMascotExpression('idle'), 800);
      sa.answerWelcome(optionIndex);
    },
    [voice, moodCtrl, sa]
  );

  const handleCompleteTask = useCallback(
    async (trackId) => {
      setTaskLoading(true);
      moodCtrl.toChallenge();
      const result = await sa.completeTask(trackId);
      if (!result.alreadyDone) {
        voice.onTaskComplete();
        moodCtrl.celebrate();
        setMascotExpression('cheer');
        setTimeout(() => setMascotExpression('idle'), 1200);
      }
      setTaskLoading(false);
    },
    [sa, voice, moodCtrl]
  );

  const handleWheelSpin = useCallback(() => {
    voice.onWheelSpin();
    moodCtrl.toThinking();
    setMascotExpression('wink');
    sa.spinWheel();
    setTimeout(() => setMascotExpression('idle'), 1000);
  }, [voice, moodCtrl, sa]);

  useEffect(() => {
    if (sa.currentQuestion) {
      moodCtrl.toThinking();
      voice.onQuestionShown(sa.currentQuestion);
    }
  }, [sa.currentQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const len = sa.welcomeAnswers?.length ?? 0;
    if (len > prevAnswersLen.current && len < (sa.mission?.questions?.length ?? 0)) {
      moodCtrl.toThinking();
    }
    prevAnswersLen.current = len;
  }, [sa.welcomeAnswers?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevView.current === 'welcome' && sa.view === 'hub' && sa.progress?.welcomeComplete) {
      voice.onAssessmentDone();
      moodCtrl.celebrate();
      setMascotExpression('cheer');
      setTimeout(() => setMascotExpression('idle'), 2000);
    }
    prevView.current = sa.view;
  }, [sa.view, sa.progress?.welcomeComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isParentView) {
      moodCtrl.toIdle();
      voice.cancel();
    }
  }, [isParentView]); // eslint-disable-line react-hooks/exhaustive-deps

  if (sa.loading) {
    return (
      <div className={`${ACADEMY.root} flex items-center justify-center`}>
        <AcademyLiveBackground mood={ACADEMY_MOODS.idle} />
        <motion.span
          className="text-5xl relative z-10"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          🎡
        </motion.span>
      </div>
    );
  }

  return (
    <AcademyShell
      lang={lang}
      mood={moodCtrl.mood}
      calm={isParentView}
      mascotExpression={mascotExpression}
      isSpeaking={voice.isSpeaking}
      showMascot={!isParentView}
      title={copy.hubTitle}
      subtitle={copy.hubSub}
      onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
      onLogout={logout}
    >
      {sa.view === 'welcome' && (
        <AcademyWelcomeMission
          lang={lang}
          mission={sa.mission}
          question={sa.currentQuestion}
          onStart={handleStartWelcome}
          onAnswer={handleAnswer}
          lastMessage={sa.lastMessage}
          onReplay={voice.replay}
        />
      )}

      {sa.view === 'hub' && (
        <>
          {sa.lastMessage && (
            <motion.div
              className={`${ACADEMY.cardCelebrate} text-center font-black text-lg text-amber-700`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {sa.lastMessage}
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <AcademyTrackHub
              lang={lang}
              trackIds={sa.trackIds}
              todayTasks={sa.todayTasks}
              onComplete={handleCompleteTask}
              loading={taskLoading}
              onChallenge={moodCtrl.toChallenge}
            />

            <div className="space-y-4">
              <div className={`${ACADEMY.card} text-center`}>
                <p className="text-xs font-bold text-slate-500 mb-1">{copy.xpToday}</p>
                <p className={ACADEMY.xpBadge}>{sa.progress?.dailyXp ?? 0}</p>
                <p className="text-xs font-bold text-orange-500 mt-2">
                  {copy.streak}: {sa.progress?.streak ?? 0} 🔥
                </p>
              </div>
              <AcademyBrainWheel
                lang={lang}
                onSpin={handleWheelSpin}
                result={sa.wheelTrack}
                brainMedia={sa.brainMedia}
              />
            </div>
          </div>

          <AcademyLeaderboard lang={lang} rows={sa.positiveLeaderboard} />

          {isParent && <AcademyParentButton lang={lang} onClick={() => sa.setView('parent')} />}
        </>
      )}

      {isParentView && isParent && (
        <AcademyParentZone
          lang={lang}
          report={sa.weeklyReport}
          cert={sa.leapCertificate}
          onBack={() => sa.setView('hub')}
        />
      )}
    </AcademyShell>
  );
}
