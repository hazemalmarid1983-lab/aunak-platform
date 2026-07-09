/**
 * Summer Academy — Silent Assessment & Positive Pedagogy Engine
 * الأكاديمية الصيفية: تقييم صامت · 4 مسارات · لوحة إيجابية · تقارير الأهل
 */

export const ACADEMY_DURATION_DAYS = 60;

export const TRACKS = {
  arabic: {
    id: 'arabic',
    labelAr: 'اللغة العربية',
    labelEn: 'Arabic',
    icon: '📖',
    color: 'emerald',
  },
  math: {
    id: 'math',
    labelAr: 'الرياضيات',
    labelEn: 'Mathematics',
    icon: '🔢',
    color: 'amber',
  },
  english: {
    id: 'english',
    labelAr: 'اللغة الإنجليزية',
    labelEn: 'English',
    icon: '🌍',
    color: 'sky',
  },
  brain: {
    id: 'brain',
    labelAr: 'تفكّر وتنشّط',
    labelEn: 'Think & Activate',
    icon: '🧠',
    color: 'violet',
    feedsFromSafeMedia: true,
  },
};

export const TRACK_IDS = Object.keys(TRACKS);

/** Encouragement only — never expose numeric weakness to the child. */
export const SILENT_ENCOURAGEMENT = {
  ar: [
    'أنت جاهز لبدء المغامرة! 🚀',
    'مغامر حقيقي — لننطلق! ⭐',
    'عقلك يتألق — استمر! ✨',
    'أبطال المغامرة يبدأون هكذا! 🏆',
    'كل خطوة تقربك من الكنز! 🗺️',
    'روحك الفضولية رائعة! 🔭',
    'المغامرة تنتظرك — هيا! 🎯',
  ],
  en: [
    'You are ready for the adventure! 🚀',
    'True explorer — let us go! ⭐',
    'Your mind shines — keep going! ✨',
    'Adventure heroes start like this! 🏆',
    'Every step brings you closer to the treasure! 🗺️',
    'Your curiosity is amazing! 🔭',
    'The adventure awaits — let us go! 🎯',
  ],
};

export const WELCOME_MISSION = {
  ar: {
    title: 'مهمة الترحيب — مغامرة الاستكشاف',
    subtitle: 'لعبة ممتعة لاكتشاف عالمك الأكاديمي',
    start: 'ابدأ المغامرة',
    next: 'التالي',
    finish: 'انطلق للمسارات!',
    questions: [
      {
        track: 'arabic',
        prompt: 'أي كلمة تصف هذا؟ 🍎',
        options: ['تفاحة', 'سيارة', 'شمس'],
        answer: 0,
      },
      {
        track: 'arabic',
        prompt: 'اختر الحرف الأول في «بحر»',
        options: ['ب', 'ح', 'ر'],
        answer: 0,
      },
      {
        track: 'math',
        prompt: 'كم عدد النجوم؟ ⭐⭐⭐',
        options: ['2', '3', '4'],
        answer: 1,
      },
      {
        track: 'math',
        prompt: '3 + 2 = ؟',
        options: ['4', '5', '6'],
        answer: 1,
      },
      {
        track: 'english',
        prompt: 'What color is the sky? ☁️',
        options: ['Blue', 'Red', 'Green'],
        answer: 0,
      },
      {
        track: 'english',
        prompt: 'Cat means…',
        options: ['قطة', 'كلب', 'طائر'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'إذا كان أحمد أكبر من سارة، وسارة أكبر من علي — من الأصغر؟',
        options: ['علي', 'أحمد', 'سارة'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'أي شكل مختلف؟ 🔺 🔺 🔴',
        options: ['الأول', 'الثاني', 'الثالث'],
        answer: 2,
      },
    ],
  },
  en: {
    title: 'Welcome Mission — Exploration Game',
    subtitle: 'A fun game to discover your academic world',
    start: 'Start Adventure',
    next: 'Next',
    finish: 'Go to Tracks!',
    questions: [
      {
        track: 'arabic',
        prompt: 'Which word describes this? 🍎',
        options: ['Apple', 'Car', 'Sun'],
        answer: 0,
      },
      {
        track: 'arabic',
        prompt: 'First letter of «sea» in Arabic (بحر)',
        options: ['ب', 'ح', 'ر'],
        answer: 0,
      },
      {
        track: 'math',
        prompt: 'How many stars? ⭐⭐⭐',
        options: ['2', '3', '4'],
        answer: 1,
      },
      {
        track: 'math',
        prompt: '3 + 2 = ?',
        options: ['4', '5', '6'],
        answer: 1,
      },
      {
        track: 'english',
        prompt: 'What color is the sky? ☁️',
        options: ['Blue', 'Red', 'Green'],
        answer: 0,
      },
      {
        track: 'english',
        prompt: 'Cat means…',
        options: ['قطة', 'Dog', 'Bird'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'If Ahmed is older than Sara, and Sara is older than Ali — who is youngest?',
        options: ['Ali', 'Ahmed', 'Sara'],
        answer: 0,
      },
      {
        track: 'brain',
        prompt: 'Which shape is different? 🔺 🔺 🔴',
        options: ['First', 'Second', 'Third'],
        answer: 2,
      },
    ],
  },
};

export const DAILY_TASKS = {
  arabic: {
    ar: ['اقرأ جملة بصوت عالٍ', 'اكتب حرفاً جميلاً', 'اختر كلمة من الصورة'],
    en: ['Read a sentence aloud', 'Write a beautiful letter', 'Pick a word from the picture'],
  },
  math: {
    ar: ['عدّ الأشياء حولك', 'حل لغز أرقام', 'ارسم أشكالاً'],
    en: ['Count objects around you', 'Solve a number puzzle', 'Draw shapes'],
  },
  english: {
    ar: ['Repeat 3 English words', 'Match word to picture', 'Sing an English song'],
    en: ['Repeat 3 English words', 'Match word to picture', 'Sing an English song'],
  },
  brain: {
    ar: ['شاهد فيديو تفكير', 'حل لغز يومي', 'فكّر في موقف حقيقي'],
    en: ['Watch a thinking video', 'Solve daily riddle', 'Reflect on a real situation'],
  },
};

export const XP_PER_TASK = 25;
export const XP_DAILY_BONUS = 50;

function pickEncouragement(lang) {
  const list = SILENT_ENCOURAGEMENT[lang] ?? SILENT_ENCOURAGEMENT.ar;
  return list[Math.floor(Math.random() * list.length)];
}

/** Compute internal silent levels per track — NEVER show to child. */
export function computeSilentAssessment(answers = [], questions = []) {
  const byTrack = {};
  for (const id of TRACK_IDS) {
    byTrack[id] = { correct: 0, total: 0 };
  }

  questions.forEach((q, i) => {
    const track = q.track;
    if (!byTrack[track]) return;
    byTrack[track].total += 1;
    if (answers[i] === q.answer) byTrack[track].correct += 1;
  });

  const levels = {};
  const weakPoints = {};

  for (const id of TRACK_IDS) {
    const { correct, total } = byTrack[id];
    const pct = total > 0 ? Math.round((correct / total) * 100) : 50;
    levels[id] = Math.max(1, Math.min(5, Math.ceil(pct / 20)));
    if (pct < 60) {
      weakPoints[id] = DAILY_TASKS[id]?.ar?.[0] ?? 'تمرين يومي';
    }
  }

  return {
    levels,
    weakPoints,
    rawScores: Object.fromEntries(
      TRACK_IDS.map((id) => [id, byTrack[id].total ? Math.round((byTrack[id].correct / byTrack[id].total) * 100) : 50])
    ),
    encouragement: pickEncouragement('ar'),
  };
}

export function getEncouragement(lang = 'ar') {
  return pickEncouragement(lang);
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function daysSinceEnrollment(enrolledAt) {
  if (!enrolledAt) return 0;
  const start = new Date(enrolledAt);
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function isProgramComplete(enrolledAt) {
  return daysSinceEnrollment(enrolledAt) >= ACADEMY_DURATION_DAYS;
}

/** Positive leaderboard — effort (tasks + XP), never academic deficit. */
export function buildPositiveLeaderboard(entries = [], lang = 'ar') {
  return [...entries]
    .map((e) => ({
      studentId: e.studentId,
      displayName: e.displayName ?? (lang === 'en' ? 'Explorer' : 'مغامر'),
      tasksCompleted: e.tasksCompleted ?? 0,
      dailyXp: e.dailyXp ?? 0,
      totalXp: (e.totalXp ?? 0) + (e.dailyXp ?? 0),
      streak: e.streak ?? 0,
      effortScore: (e.tasksCompleted ?? 0) * XP_PER_TASK + (e.dailyXp ?? 0),
    }))
    .sort((a, b) => b.effortScore - a.effortScore)
    .map((row, idx) => ({
      ...row,
      rank: idx + 1,
      badge:
        idx === 0
          ? lang === 'en'
            ? '🏆 Top Explorer'
            : '🏆 بطل المغامرة'
          : idx < 3
            ? lang === 'en'
              ? '⭐ Star Effort'
              : '⭐ نجم الجهد'
            : lang === 'en'
              ? '🎯 On Track'
              : '🎯 في المسار',
    }));
}

/** Weekly parent report — knowledge stability/improvement, no shame language. */
export function composeWeeklyParentReport(progress, lang = 'ar') {
  const isAr = lang === 'ar';
  const baseline = progress?.baselineLevels ?? {};
  const current = progress?.currentLevels ?? {};
  const tasksWeek = progress?.tasksThisWeek ?? 0;
  const xpWeek = progress?.xpThisWeek ?? 0;

  const trackInsights = TRACK_IDS.map((id) => {
    const b = baseline[id] ?? 1;
    const c = current[id] ?? b;
    const delta = c - b;
    let trend;
    if (delta > 0) {
      trend = isAr ? 'تحسّن ملحوظ' : 'Noticeable improvement';
    } else if (delta === 0 && tasksWeek > 0) {
      trend = isAr ? 'ثبات إيجابي' : 'Positive stability';
    } else if (tasksWeek === 0) {
      trend = isAr ? 'يُنصح بتنشيط المسار' : 'Track activation recommended';
    } else {
      trend = isAr ? 'استمرار في البناء' : 'Continued building';
    }
    return {
      track: TRACKS[id],
      baseline: b,
      current: c,
      trend,
    };
  });

  const summary =
    tasksWeek >= 5
      ? isAr
        ? `أسبوع نشط: ${tasksWeek} مهمة و ${xpWeek} نقطة جهد. المعرفة العلمية تظهر ${trackInsights.some((t) => t.current > t.baseline) ? 'تحسناً' : 'ثباتاً'} عبر المسارات.`
        : `Active week: ${tasksWeek} tasks and ${xpWeek} effort XP. Scientific knowledge shows ${trackInsights.some((t) => t.current > t.baseline) ? 'improvement' : 'stability'} across tracks.`
      : isAr
        ? `أسبوع هادئ — ${tasksWeek} مهمة. التقرير يشجّع على مغامرة يومية خفيفة.`
        : `Quiet week — ${tasksWeek} tasks. Report encourages light daily adventures.`;

  return {
    generatedAt: new Date().toISOString(),
    studentName: progress?.studentName ?? '',
    periodLabel: isAr ? 'أسبوعي' : 'Weekly',
    summary,
    trackInsights,
    effort: { tasksWeek, xpWeek },
    silentNote: isAr
      ? 'هذا التقرير للأهل فقط — لا يُعرض على الطفل.'
      : 'This report is for parents only — not shown to the child.',
  };
}

/** Leap Adventure Certificate — entry vs current comparison at program end. */
export function composeLeapCertificate(progress, lang = 'ar') {
  const isAr = lang === 'ar';
  const baseline = progress?.baselineLevels ?? {};
  const current = progress?.currentLevels ?? {};
  const totalTasks = progress?.totalTasksCompleted ?? 0;
  const totalXp = progress?.totalXp ?? 0;

  const comparisons = TRACK_IDS.map((id) => {
    const b = baseline[id] ?? 1;
    const c = current[id] ?? b;
    const growth = Math.max(0, c - b);
    return {
      track: TRACKS[id],
      entryStars: '⭐'.repeat(b),
      currentStars: '⭐'.repeat(Math.max(b, c)),
      growth,
      message:
        growth > 0
          ? isAr
            ? `قفزة رائعة في ${TRACKS[id].labelAr}!`
            : `Amazing leap in ${TRACKS[id].labelEn}!`
          : isAr
            ? `ثبات قوي في ${TRACKS[id].labelAr}!`
            : `Strong stability in ${TRACKS[id].labelEn}!`,
    };
  });

  const totalGrowth = comparisons.reduce((s, c) => s + c.growth, 0);

  return {
    title: isAr ? 'شهادة قفزة المغامر 🏅' : 'Adventure Leap Certificate 🏅',
    subtitle: isAr ? 'رحلتك من البداية إلى اليوم' : 'Your journey from start to today',
    studentName: progress?.studentName ?? '',
    enrolledAt: progress?.enrolledAt ?? null,
    totalTasks,
    totalXp,
    comparisons,
    heroMessage:
      totalGrowth > 0
        ? isAr
          ? `أنجزت ${totalTasks} مغامرة و ${totalXp} نقطة جهد — وها أنت تتألق!`
          : `You completed ${totalTasks} adventures and ${totalXp} effort XP — you shine!`
        : isAr
          ? `أكملت ${totalTasks} مغامرة — بطل حقيقي!`
          : `You completed ${totalTasks} adventures — a true hero!`,
    unlocked: isProgramComplete(progress?.enrolledAt) || totalTasks >= 20,
  };
}

/** Filter safe media for brain activation track. */
export function filterBrainMedia(mediaItems = []) {
  const brainRe =
    /تفك|دماغ|ذك|فكر|لغز|منطق|brain|think|logic|riddle|puzzle|iq|smart|حياة|واقع|موقف/i;
  return mediaItems.filter((m) => {
    const text = `${m?.title ?? ''} ${m?.category ?? ''} ${m?.summary ?? ''} ${m?.tags ?? ''}`;
    return brainRe.test(text);
  });
}

export function spinBrainWheel(tracks = TRACK_IDS) {
  const idx = Math.floor(Math.random() * tracks.length);
  return tracks[idx];
}

export function defaultProgress(studentId, studentName) {
  const now = new Date().toISOString();
  return {
    studentId,
    studentName,
    enrolledAt: now,
    welcomeComplete: false,
    baselineLevels: Object.fromEntries(TRACK_IDS.map((id) => [id, 1])),
    currentLevels: Object.fromEntries(TRACK_IDS.map((id) => [id, 1])),
    weakPoints: {},
    dailyLog: {},
    tasksCompleted: 0,
    totalTasksCompleted: 0,
    dailyXp: 0,
    totalXp: 0,
    streak: 0,
    lastActiveDate: null,
  };
}

export function completeDailyTask(progress, trackId, lang = 'ar') {
  const day = todayKey();
  const log = { ...(progress.dailyLog ?? {}) };
  if (!log[day]) log[day] = { tasks: [], xp: 0 };

  const taskList = DAILY_TASKS[trackId]?.[lang] ?? DAILY_TASKS[trackId]?.ar ?? ['مهمة'];
  const taskLabel = taskList[log[day].tasks.length % taskList.length];

  if (log[day].tasks.includes(trackId)) {
    return { progress, alreadyDone: true, encouragement: getEncouragement(lang) };
  }

  log[day].tasks.push(trackId);
  const xpGain = XP_PER_TASK + (log[day].tasks.length >= TRACK_IDS.length ? XP_DAILY_BONUS : 0);
  log[day].xp += xpGain;

  const lastDate = progress.lastActiveDate;
  let streak = progress.streak ?? 0;
  if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = todayKey(yesterday);
    if (lastDate === yKey) streak += 1;
    else if (lastDate !== day) streak = 1;
  } else {
    streak = 1;
  }

  const currentLevels = { ...progress.currentLevels };
  currentLevels[trackId] = Math.min(5, (currentLevels[trackId] ?? 1) + (Math.random() > 0.6 ? 1 : 0));

  const updated = {
    ...progress,
    dailyLog: log,
    dailyXp: log[day].xp,
    totalXp: (progress.totalXp ?? 0) + xpGain,
    tasksCompleted: log[day].tasks.length,
    totalTasksCompleted: (progress.totalTasksCompleted ?? 0) + 1,
    currentLevels,
    streak,
    lastActiveDate: day,
  };

  return {
    progress: updated,
    alreadyDone: false,
    xpGain,
    taskLabel,
    encouragement: getEncouragement(lang),
  };
}
