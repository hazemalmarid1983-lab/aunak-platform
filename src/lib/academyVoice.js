/**
 * Academy Voice — child-friendly hybrid TTS (Web Speech + optional cloud).
 * Separate from sovereignVoice (supervisor commands).
 */

import { isSpeechSynthesisSupported } from './sovereignVoice';

const CHILD_RATE = 0.92;
const CHILD_PITCH = 1.15;

const ENCOURAGEMENT_SCRIPTS = {
  ar: [
    'رائع! استمر يا بطل!',
    'واو! أنت نجم حقيقي!',
    'ههه! هذا ممتع جداً!',
    'عقلك يتألق! هيا للتالي!',
    'مغامرة رائعة! أحببتها!',
  ],
  en: [
    'Awesome! Keep going, hero!',
    'Wow! You are a real star!',
    'Haha! That was so fun!',
    'Your mind shines! Next one!',
    'Great adventure! I loved it!',
  ],
};

const WELCOME_SCRIPTS = {
  ar: (name) => `مرحباً ${name}! أنا نورا! جاهز للمغامرة؟`,
  en: (name) => `Hi ${name}! I am Nova! Ready for adventure?`,
};

const TASK_COMPLETE_SCRIPTS = {
  ar: 'بطل! كسبت نقاط جهد! هيا للمزيد!',
  en: 'Hero! You earned effort points! Let us go for more!',
};

const WHEEL_SCRIPTS = {
  ar: 'هيا ندوّر العجلة! أي مسار اليوم؟',
  en: 'Let us spin the wheel! Which track today?',
};

const ASSESSMENT_DONE_SCRIPTS = {
  ar: 'أنت جاهز لبدء المغامرة! هيا ننطلق!',
  en: 'You are ready for the adventure! Let us go!',
};

let speechQueue = [];
let speaking = false;
let unlocked = false;
let currentAudio = null;

export function unlockAcademyVoice() {
  unlocked = true;
}

export function isAcademyVoiceUnlocked() {
  return unlocked;
}

function speechLang(lang) {
  return lang === 'en' ? 'en-US' : 'ar-SA';
}

function pickChildVoice(lang) {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const target = speechLang(lang);
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith(target.slice(0, 2)) &&
      (/female|child|zira|hoda|google.*arabic|microsoft.*arabic/i.test(v.name) || v.default)
  );
  return (
    preferred ??
    voices.find((v) => v.lang.startsWith(target.slice(0, 2))) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

function processQueue(onStart, onEnd) {
  if (speaking || speechQueue.length === 0) return;
  const item = speechQueue.shift();
  speaking = true;
  onStart?.();

  const finish = () => {
    speaking = false;
    onEnd?.();
    processQueue(onStart, onEnd);
  };

  if (item.type === 'cloud') {
    playCloudAudio(item.url)
      .then(finish)
      .catch(() => speakWeb(item.text, item.lang, finish));
    return;
  }

  speakWeb(item.text, item.lang, finish);
}

function speakWeb(text, lang, onDone) {
  if (!isSpeechSynthesisSupported() || !text) {
    onDone?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.lang = speechLang(lang);
  utter.rate = CHILD_RATE;
  utter.pitch = CHILD_PITCH;
  const voice = pickChildVoice(lang);
  if (voice) utter.voice = voice;
  utter.onend = () => onDone?.();
  utter.onerror = () => onDone?.();
  window.speechSynthesis.speak(utter);
}

async function playCloudAudio(url) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      reject(new Error('Cloud TTS playback failed'));
    };
    audio.play().catch(reject);
  });
}

async function fetchCloudTts(text, lang) {
  try {
    const res = await fetch('/api/academy/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg,audio/*' },
      body: JSON.stringify({ text, lang }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function cancelAcademySpeech() {
  speechQueue = [];
  speaking = false;
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export async function enqueueAcademySpeech(text, { lang = 'ar', preferCloud = true, onStart, onEnd } = {}) {
  if (!text || !unlocked) return;

  if (preferCloud) {
    const url = await fetchCloudTts(text, lang);
    if (url) {
      speechQueue.push({ type: 'cloud', url, text, lang });
      processQueue(onStart, onEnd);
      return;
    }
  }

  speechQueue.push({ type: 'web', text, lang });
  processQueue(onStart, onEnd);
}

export function scriptWelcome(name, lang) {
  const fn = WELCOME_SCRIPTS[lang] ?? WELCOME_SCRIPTS.ar;
  return fn(name || (lang === 'en' ? 'Explorer' : 'مغامر'));
}

export function scriptEncouragement(lang) {
  const list = ENCOURAGEMENT_SCRIPTS[lang] ?? ENCOURAGEMENT_SCRIPTS.ar;
  return list[Math.floor(Math.random() * list.length)];
}

export function scriptTaskComplete(lang) {
  return TASK_COMPLETE_SCRIPTS[lang] ?? TASK_COMPLETE_SCRIPTS.ar;
}

export function scriptWheelSpin(lang) {
  return WHEEL_SCRIPTS[lang] ?? WHEEL_SCRIPTS.ar;
}

export function scriptAssessmentDone(lang) {
  return ASSESSMENT_DONE_SCRIPTS[lang] ?? ASSESSMENT_DONE_SCRIPTS.ar;
}

if (typeof window !== 'undefined' && isSpeechSynthesisSupported()) {
  window.speechSynthesis.onvoiceschanged = () => pickChildVoice('ar');
}
