/**
 * Sovereign Audio Layer — synthesized intelligence/spy-aesthetic feedback.
 *
 * No audio assets: every cue is generated with the Web Audio API and
 * scheduled on the AudioContext clock, so cues keep firing precisely even
 * when the tab is throttled in the background (alerting busy specialists).
 */

const STORAGE_KEY = 'aunak.audio.enabled';
const STEALTH_KEY = 'aunak.stealth.enabled';

let ctx = null;
let noiseBuffer = null;
const activeHums = new Set();

export function isAudioEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setAudioEnabled(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
  if (!on) {
    for (const stop of [...activeHums]) stop();
  }
}
export function isStealthMode() {
  try {
    return localStorage.getItem(STEALTH_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setStealthMode(on) {
  try {
    localStorage.setItem(STEALTH_KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
}

export function canPlaySovereignAudio() {
  return isAudioEnabled() && !isStealthMode();
}

function getCtx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    // Autoplay policy: resume on the first user gesture anywhere.
    const unlock = () => {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function getNoiseBuffer(ac) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** Schedule one enveloped oscillator tone on the audio clock. */
function tone(ac, { freq, endFreq, type = 'sine', start, dur, gain = 0.08 }) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/* ------------------------------------------------------------------ */
/* Cues                                                                 */
/* ------------------------------------------------------------------ */

/** Success Chime — ascending crystalline triad (biometric face match). */
export function playSuccessChime() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  const notes = [659.25, 987.77, 1318.51]; // E5 → B5 → E6
  notes.forEach((freq, i) => {
    tone(ac, { freq, type: 'sine', start: t + i * 0.09, dur: 0.55, gain: 0.07 });
    tone(ac, { freq: freq * 2, type: 'triangle', start: t + i * 0.09, dur: 0.3, gain: 0.015 });
  });
}

/**
 * Data Processing Hum — faint server-room drone for the AI terminal.
 * Returns a handle: call .stop() on unmount.
 */
export function startProcessingHum() {
  if (!canPlaySovereignAudio()) return { stop() {} };
  const ac = getCtx();
  if (!ac) return { stop() {} };

  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);

  const oscA = ac.createOscillator();
  oscA.type = 'sine';
  oscA.frequency.value = 48;
  const oscB = ac.createOscillator();
  oscB.type = 'sine';
  oscB.frequency.value = 96.5;
  const gB = ac.createGain();
  gB.gain.value = 0.35;

  const noise = ac.createBufferSource();
  noise.buffer = getNoiseBuffer(ac);
  noise.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 240;
  const gN = ac.createGain();
  gN.gain.value = 0.18;

  // Slow LFO so the hum subtly "breathes" instead of droning flat.
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.12;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.004;
  lfo.connect(lfoGain).connect(master.gain);

  oscA.connect(master);
  oscB.connect(gB).connect(master);
  noise.connect(lp).connect(gN).connect(master);

  const t = ac.currentTime;
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.013, t + 1.2);

  oscA.start(t);
  oscB.start(t);
  noise.start(t);
  lfo.start(t);

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    activeHums.delete(stop);
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value || 0.013, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    [oscA, oscB, noise, lfo].forEach((n) => n.stop(now + 0.7));
  };
  activeHums.add(stop);
  return { stop };
}

/** Warning Pulse — descending tactical alarm tied to the ABC risk equation. */
export function playWarningPulse() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  for (let i = 0; i < 4; i += 1) {
    const start = t + i * 0.24;
    tone(ac, { freq: 233, endFreq: 155, type: 'triangle', start, dur: 0.16, gain: 0.09 });
    tone(ac, { freq: 58, type: 'sine', start, dur: 0.16, gain: 0.06 });
  }
}

/** Star drop — crystalline ping when mirror or play awards a star (capped at 5). */
export function playStarDrop() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  tone(ac, { freq: 880, endFreq: 1174.66, type: 'sine', start: t, dur: 0.35, gain: 0.08 });
  tone(ac, { freq: 1760, type: 'triangle', start: t + 0.06, dur: 0.2, gain: 0.02 });
}

/** Calm pulse — soft descending breath cue (mirror CALM_PULSE). */
export function playCalmPulse() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  tone(ac, { freq: 392, endFreq: 261.63, type: 'sine', start: t, dur: 1.8, gain: 0.06 });
  tone(ac, { freq: 196, type: 'sine', start: t + 0.4, dur: 1.4, gain: 0.04 });
}

/** Goal echo — resonant triad when specialist mirrors programmed goal. */
export function playGoalEcho() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    tone(ac, { freq, type: 'sine', start: t + i * 0.12, dur: 0.7, gain: 0.06 });
  });
}

/**
 * Ta-da Fanfare — joyful celebratory burst for a specialist reward.
 * Rising major arpeggio + shimmer sparkle so the child gets instant dopamine.
 */
export function playTaDaFanfare() {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;

  // "Ta-" quick lift then "-da!" bright landing.
  tone(ac, { freq: 523.25, endFreq: 659.25, type: 'triangle', start: t, dur: 0.18, gain: 0.09 });
  const chord = [659.25, 830.61, 987.77, 1318.51]; // E5 · G#5 · B5 · E6 (E major)
  chord.forEach((freq, i) => {
    tone(ac, { freq, type: 'triangle', start: t + 0.2 + i * 0.015, dur: 0.9, gain: 0.07 });
    tone(ac, { freq: freq * 2, type: 'sine', start: t + 0.2, dur: 0.5, gain: 0.012 });
  });

  // Shimmer sparkle tail.
  for (let i = 0; i < 8; i += 1) {
    tone(ac, {
      freq: 1500 + Math.random() * 1800,
      type: 'sine',
      start: t + 0.35 + i * 0.055,
      dur: 0.18,
      gain: 0.02,
    });
  }
}

/**
 * Calm Sensory Drone — warm sustained pad that soothes on calm_pulse.
 * Returns a handle: call .stop() to fade out.
 */
export function startCalmDrone() {
  if (!canPlaySovereignAudio()) return { stop() {} };
  const ac = getCtx();
  if (!ac) return { stop() {} };

  const master = ac.createGain();
  master.gain.value = 0;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  master.connect(lp).connect(ac.destination);

  // Soft consonant chord (A2 · E3 · A3 · C#4) — gentle, non-alerting.
  const freqs = [110, 164.81, 220, 277.18];
  const oscs = freqs.map((f, i) => {
    const osc = ac.createOscillator();
    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.value = f;
    const g = ac.createGain();
    g.gain.value = i === 0 ? 0.5 : 0.22;
    osc.connect(g).connect(master);
    return osc;
  });

  // Slow shimmer LFO on the filter for a breathing, watery texture.
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.14;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 320;
  lfo.connect(lfoGain).connect(lp.frequency);

  const t = ac.currentTime;
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.05, t + 1.5);

  oscs.forEach((o) => o.start(t));
  lfo.start(t);

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    activeHums.delete(stop);
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value || 0.05, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    [...oscs, lfo].forEach((n) => n.stop(now + 1.6));
  };
  activeHums.add(stop);
  return { stop };
}

/** Typewriter Effect — rapid intel-teletype ticks (gaze-neutrality alert). */
export function playTypewriterEffect(ticks = 16) {
  if (!canPlaySovereignAudio()) return;
  const ac = getCtx();
  if (!ac) return;
  let t = ac.currentTime + 0.02;
  for (let i = 0; i < ticks; i += 1) {
    const src = ac.createBufferSource();
    src.buffer = getNoiseBuffer(ac);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2100 + Math.random() * 900;
    bp.Q.value = 8;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(t, Math.random() * 0.5, 0.03);
    t += 0.045 + Math.random() * 0.05;
  }
}
