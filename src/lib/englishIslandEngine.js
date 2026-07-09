/**
 * English Talk Island engine — pronunciation scoring + live phrase bank.
 *
 * Speech is captured with the Web Speech API in EnglishTalkIsland, the recognized
 * transcript is scored against the target phrase here, and the result is streamed
 * back to Airtable (last_spoken_text + pronunciation_accuracy) each attempt.
 */

import { updateStudentRecord } from './airtable';
import { STUDENT as SF } from './airtableFields';

/** Graded speaking targets — word → sentence, ascending difficulty. */
export const ENGLISH_PHRASE_BANK = [
  { id: 'p1', text: 'Hello', hint: 'A friendly greeting', level: 1 },
  { id: 'p2', text: 'Thank you', hint: 'Say it with a smile', level: 1 },
  { id: 'p3', text: 'My name is Nova', hint: 'Introduce yourself', level: 2 },
  { id: 'p4', text: 'I love learning English', hint: 'Speak with energy', level: 2 },
  { id: 'p5', text: 'The sun is shining today', hint: 'Nice and clear', level: 3 },
  { id: 'p6', text: 'Practice makes perfect', hint: 'A little faster', level: 3 },
];

/** Strip punctuation/case and collapse whitespace for fair comparison. */
export function normalizeSpoken(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance between two strings. */
export function levenshtein(a, b) {
  const s = String(a);
  const t = String(b);
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;

  let prev = Array.from({ length: t.length + 1 }, (_, i) => i);
  let curr = new Array(t.length + 1);

  for (let i = 1; i <= s.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[t.length];
}

/**
 * Pronunciation accuracy 0–100 for a spoken transcript vs the target phrase.
 * Blends character-level similarity (70%) with word-hit ratio (30%) so a
 * mostly-correct sentence with one wrong word still scores generously.
 */
export function scorePronunciation(spoken, target) {
  const said = normalizeSpoken(spoken);
  const want = normalizeSpoken(target);
  if (!want) return 0;
  if (!said) return 0;

  const dist = levenshtein(said, want);
  const charScore = Math.max(0, 1 - dist / Math.max(want.length, said.length));

  const wantWords = want.split(' ');
  const saidWords = new Set(said.split(' '));
  const hits = wantWords.filter((w) => saidWords.has(w)).length;
  const wordScore = wantWords.length ? hits / wantWords.length : 0;

  const blended = charScore * 0.7 + wordScore * 0.3;
  return Math.round(Math.min(100, Math.max(0, blended * 100)));
}

/** Encouragement tier for a given accuracy score. */
export function accuracyTier(score) {
  if (score >= 90) return { key: 'excellent', ar: 'ممتاز!', en: 'Excellent!', star: true };
  if (score >= 70) return { key: 'great', ar: 'أحسنت!', en: 'Great job!', star: true };
  if (score >= 45) return { key: 'good', ar: 'جيد، حاول مرة أخرى', en: 'Good — try once more', star: false };
  return { key: 'retry', ar: 'لنجرب من جديد', en: "Let's try again", star: false };
}

/**
 * Persist a live speaking attempt to Airtable — last spoken text + accuracy.
 * Non-blocking by design: returns null on failure so the island keeps flowing.
 */
export async function saveEnglishSpokenResult(recordId, { spokenText, accuracy } = {}) {
  if (!recordId) return null;
  const fields = {};
  if (spokenText != null) fields[SF.last_spoken_text] = String(spokenText).slice(0, 2000);
  if (accuracy != null && Number.isFinite(Number(accuracy))) {
    fields[SF.pronunciation_accuracy] = Number(accuracy);
  }
  if (Object.keys(fields).length === 0) return null;
  try {
    return await updateStudentRecord(recordId, fields);
  } catch (err) {
    if (import.meta.env?.DEV) console.warn('[englishIsland] save failed:', err?.message);
    return null;
  }
}

/** True when the browser exposes the Web Speech recognition API. */
export function isSpeechRecognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

/** Construct a configured en-US recognizer, or null when unsupported. */
export function createEnglishRecognizer() {
  if (!isSpeechRecognitionSupported()) return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Ctor();
  rec.lang = 'en-US';
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 3;
  return rec;
}
