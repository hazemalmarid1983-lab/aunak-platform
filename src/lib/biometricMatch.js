import * as faceapi from "@vladmandic/face-api";
import { getField } from "./airtable";
import { STUDENT as SF } from "./airtableFields";
import { isMasterBypassActive } from "./sovereignMasterBypass";

/**
 * Model load order (no env vars required for face recognition):
 * 1) Local Vite/public assets — works offline / when CDNs are blocked
 * 2) unpkg fallback
 * 3) jsDelivr last resort
 */
const MODEL_URL_CANDIDATES = [
  "/models",
  "https://unpkg.com/@vladmandic/face-api@1.7.15/model",
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model",
];

const DEFAULT_MATCH_DISTANCE = 0.6;

export const SOVEREIGN_MATCH_CONFIDENCE = 94.7;
/** Same-session enrollment verify — lighting/angle differ from capture. */
export const ENROLLMENT_MATCH_CONFIDENCE = 82;
/** Anti-spoof: minimum similarity to treat as duplicate identity across registry. */
export const ANTI_SPOOF_DUPLICATE_CONFIDENCE = SOVEREIGN_MATCH_CONFIDENCE;

export const FACE_DUPLICATE_BLOCKED = 'FACE_DUPLICATE_BLOCKED';

let modelsLoaded = false;
let modelsLoadPromise = null;

async function loadNetsFromUri(baseUrl) {
  const root = String(baseUrl || "").replace(/\/$/, "");
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(root),
    faceapi.nets.faceLandmark68Net.loadFromUri(root),
    faceapi.nets.faceRecognitionNet.loadFromUri(root),
  ]);
}

export async function ensureBiometricModels() {
  if (modelsLoaded) return;
  if (modelsLoadPromise) return modelsLoadPromise;

  modelsLoadPromise = (async () => {
    const errors = [];
    for (const url of MODEL_URL_CANDIDATES) {
      try {
        await loadNetsFromUri(url);
        modelsLoaded = true;
        return;
      } catch (err) {
        errors.push(`${url}: ${err?.message || err}`);
      }
    }
    modelsLoadPromise = null;
    throw new Error(
      `BIOMETRIC_MODELS_LOAD_FAILED — could not load face models. Tried: ${errors.join(" | ")}`
    );
  })();

  return modelsLoadPromise;
}

/** Parse Airtable face biometric — JSON array or comma-separated 128 floats. */
export function parseFaceDescriptor(raw) {
  if (raw == null || raw === "") return null;

  try {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.startsWith("[")) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr) && arr.length === 128) {
          return new Float32Array(arr);
        }
      }
      const parts = trimmed.split(",").map((v) => Number(v.trim()));
      if (parts.length === 128 && parts.every(Number.isFinite)) {
        return new Float32Array(parts);
      }
    }
    if (Array.isArray(raw) && raw.length === 128) {
      return new Float32Array(raw);
    }
  } catch {
    return null;
  }

  return null;
}

export function descriptorToJson(descriptor) {
  if (!descriptor) return "";
  return JSON.stringify(Array.from(descriptor));
}

export function distanceToSimilarityPercent(distance, maxDistance = DEFAULT_MATCH_DISTANCE) {
  if (!Number.isFinite(distance)) return 0;
  const pct = (1 - distance / maxDistance) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function meetsSovereignThreshold(similarityPercent) {
  return similarityPercent >= SOVEREIGN_MATCH_CONFIDENCE;
}

/** Compare live scan to a known reference (enrollment verify). */
export function matchLiveToReference(
  liveDescriptor,
  referenceRaw,
  minConfidence = ENROLLMENT_MATCH_CONFIDENCE
) {
  const enrolled =
    referenceRaw instanceof Float32Array ? referenceRaw : parseFaceDescriptor(referenceRaw);
  if (!liveDescriptor || !enrolled) return null;
  const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
  const similarityPercent = distanceToSimilarityPercent(distance);
  if (similarityPercent < minConfidence) {
    return { distance, similarityPercent, matched: false };
  }
  return { distance, similarityPercent, matched: true };
}

export function getStudentFaceDescriptor(student) {
  const f = student?.fields ?? {};
  const raw =
    student?.faceBiometric ??
    getField(f, SF.face_biometric) ??
    null;
  return parseFaceDescriptor(raw);
}

/** Resolve Airtable record id or Student_ID code to a student row. */
export function resolveStudentByIdentifier(students, identifier) {
  if (!identifier || !Array.isArray(students)) return null;
  const key = String(identifier).trim();
  if (!key) return null;
  return (
    students.find((s) => s?.id === key) ||
    students.find((s) => String(s?.studentCode ?? "").trim() === key) ||
    students.find((s) => {
      const raw =
        s?.studentCode ??
        getField(s?.fields, SF.id);
      return raw != null && String(raw).trim() === key;
    }) ||
    null
  );
}

function matchDescriptorToStudent(student, liveDescriptor) {
  const enrolled = getStudentFaceDescriptor(student);
  if (!enrolled) return null;
  const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
  const similarityPercent = distanceToSimilarityPercent(distance);
  if (!meetsSovereignThreshold(similarityPercent)) return null;
  return { student, distance, similarityPercent };
}

/**
 * Match live descriptor against enrolled students.
 * Returns match only when sovereign confidence (≥94.7%) is met.
 */
export function matchStudentByFaceDescriptor(students, liveDescriptor, selectedStudentId = null) {
  if (!liveDescriptor || !Array.isArray(students) || students.length === 0) return null;

  if (selectedStudentId) {
    const target = resolveStudentByIdentifier(students, selectedStudentId);
    if (!target) return null;
    return matchDescriptorToStudent(target, liveDescriptor);
  }

  let bestStudent = null;
  let bestDistance = Infinity;

  for (const student of students) {
    const enrolled = getStudentFaceDescriptor(student);
    if (!enrolled) continue;

    const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestStudent = student;
    }
  }

  if (!bestStudent) return null;

  const similarityPercent = distanceToSimilarityPercent(bestDistance);
  if (!meetsSovereignThreshold(similarityPercent)) return null;

  return { student: bestStudent, distance: bestDistance, similarityPercent };
}

/**
 * Scan entire student registry for a duplicate face (anti-spoof / anti multi-enrollment).
 * Returns the first conflicting student at or above sovereign threshold.
 */
export function findDuplicateFaceInRegistry(students, liveDescriptor, excludeStudentId = null) {
  if (!liveDescriptor || !Array.isArray(students)) return null;

  let best = null;

  for (const student of students) {
    if (excludeStudentId && student?.id === excludeStudentId) continue;
    const enrolled = getStudentFaceDescriptor(student);
    if (!enrolled) continue;

    const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
    const similarityPercent = distanceToSimilarityPercent(distance);
    if (similarityPercent < ANTI_SPOOF_DUPLICATE_CONFIDENCE) continue;

    if (!best || similarityPercent > best.similarityPercent) {
      best = { student, distance, similarityPercent };
    }
  }

  return best;
}

/** Throws FACE_DUPLICATE_BLOCKED if live face matches another student in Airtable. */
export function assertFaceUniqueInRegistry(students, liveDescriptor, excludeStudentId = null, lang = 'ar') {
  if (isMasterBypassActive()) return;

  const dup = findDuplicateFaceInRegistry(students, liveDescriptor, excludeStudentId);
  if (!dup) return;

  const name = dup.student?.name ?? dup.student?.id ?? '—';
  const msg =
    lang === 'en'
      ? `Registration denied — this face is already registered to "${name}" (${dup.similarityPercent.toFixed(1)}% match). Operation blocked.`
      : `رفض التسجيل — هذا الوجه مسجّل مسبقاً للطالب «${name}» (تطابق ${dup.similarityPercent.toFixed(1)}%). تم حظر العملية لمنع التحايل.`;

  const err = new Error(msg);
  err.code = FACE_DUPLICATE_BLOCKED;
  err.duplicateStudent = dup.student;
  err.similarityPercent = dup.similarityPercent;
  throw err;
}

export function studentHasFaceBiometric(student) {
  const raw = student?.faceBiometric ?? getField(student?.fields, SF.face_biometric);
  return raw != null && String(raw).trim().length > 8;
}

export async function detectFaceDescriptor(videoEl, minDetectionScore = 0.5) {
  if (!videoEl) return null;

  const result = await faceapi
    .detectSingleFace(
      videoEl,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result?.descriptor) return null;
  if ((result.detection?.score ?? 0) < minDetectionScore) return null;

  return {
    descriptor: result.descriptor,
    score: result.detection.score,
  };
}

/** Average several stable frames into one enrollment descriptor. */
export async function captureStableDescriptor(videoEl, { samples = 5, minScore = 0.5, maxAttempts = 30 } = {}) {
  const vectors = [];
  for (let attempt = 0; attempt < maxAttempts && vectors.length < samples; attempt += 1) {
    const face = await detectFaceDescriptor(videoEl, minScore);
    if (face?.descriptor) vectors.push(face.descriptor);
    await new Promise((r) => setTimeout(r, 120));
  }
  if (vectors.length < samples) return null;

  const avg = new Float32Array(128);
  for (let j = 0; j < 128; j += 1) {
    avg[j] = vectors.reduce((sum, v) => sum + v[j], 0) / vectors.length;
  }

  return { descriptor: avg, samples: vectors.length };
}
