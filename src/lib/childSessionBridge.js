/**
 * Client trigger — child island engagement → session seal API.
 */

/** Max stars on child island + seal trigger — sovereign neural cap. */
export const CHILD_ISLAND_SEAL_THRESHOLD = 5;
export const SOVEREIGN_CHILD_MAX_STARS = CHILD_ISLAND_SEAL_THRESHOLD;

export function clampSovereignStars(count) {
  return Math.min(Math.max(0, Number(count) || 0), SOVEREIGN_CHILD_MAX_STARS);
}

let sealInFlight = false;

export async function triggerChildIslandSeal({
  studentId,
  studentName,
  interactionCount = CHILD_ISLAND_SEAL_THRESHOLD,
  source = 'island_world',
  interactionType = 'play_engagement',
}) {
  if (sealInFlight) return { skipped: true, reason: 'in_flight' };
  if (!studentName && !studentId) return { skipped: true, reason: 'no_student' };

  sealInFlight = true;
  try {
    const res = await fetch('/api/session/child-seal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        studentId,
        studentName,
        interactionCount,
        source,
        interactionType,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'CHILD_SEAL_FAILED');
    return data;
  } finally {
    sealInFlight = false;
  }
}
