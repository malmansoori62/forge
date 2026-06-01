import { db } from './db';
import { e1RM } from './utils';
import type { Exercise, WorkingSet } from './types';

export interface ProgressionSuggestion {
  weight: number;
  reason: 'progress' | 'hold' | 'deload' | 'first-time';
  delta: number;
  message: string;
}

/**
 * Auto-progression engine.
 *  - All sets at top of rep range with target RIR met → +2.5kg compound, +1kg isolation
 *  - Sets in range → +1.25kg / +0.5kg
 *  - Missed reps below min → hold weight
 *  - 2+ consecutive stalls → suggest deload (90% of last weight)
 */
export async function suggestNext(
  exercise: Exercise,
  targetRepsMin: number,
  targetRepsMax: number,
  targetRIR: number
): Promise<ProgressionSuggestion> {
  const sets = await db.sets
    .where('exerciseSlug').equals(exercise.slug)
    .reverse().sortBy('loggedAt');

  if (sets.length === 0) {
    return { weight: 0, reason: 'first-time', delta: 0, message: 'Pick a starting weight you can hit for the lower rep range with 2 RIR.' };
  }

  // group by session
  const sessions = groupBySession(sets);
  const lastSession = sessions[0];
  const lastTopSet = lastSession.reduce((m, s) => (s.weight > m.weight ? s : m), lastSession[0]);

  const stepUp = exercise.isolation ? 1 : 2.5;
  const stepMicro = exercise.isolation ? 0.5 : 1.25;

  const hitTop = lastTopSet.reps >= targetRepsMax && lastTopSet.rir <= targetRIR;
  const inRange = lastTopSet.reps >= targetRepsMin && lastTopSet.reps <= targetRepsMax;
  const missed = lastTopSet.reps < targetRepsMin;

  // Stall detection — last 2 sessions
  if (sessions.length >= 2) {
    const prev = sessions[1];
    const prevTop = prev.reduce((m, s) => (s.weight > m.weight ? s : m), prev[0]);
    const stalledA = lastTopSet.weight === prevTop.weight && lastTopSet.reps <= prevTop.reps;
    let prevPrev: WorkingSet | null = null;
    if (sessions.length >= 3) {
      prevPrev = sessions[2].reduce((m, s) => (s.weight > m.weight ? s : m), sessions[2][0]);
    }
    const stalledB = prevPrev && prevTop.weight === prevPrev.weight && prevTop.reps <= prevPrev.reps;
    if (stalledA && stalledB) {
      const deload = Math.round(lastTopSet.weight * 0.9 * 4) / 4;
      return { weight: deload, reason: 'deload', delta: deload - lastTopSet.weight, message: `Stalled 2+ sessions. Deload to ${deload}kg, rebuild.` };
    }
  }

  if (hitTop) {
    const next = lastTopSet.weight + stepUp;
    return { weight: next, reason: 'progress', delta: stepUp, message: `Crushed last session — try ${next}kg (+${stepUp}).` };
  }
  if (inRange) {
    const next = lastTopSet.weight + stepMicro;
    return { weight: next, reason: 'progress', delta: stepMicro, message: `In range — micro-load to ${next}kg (+${stepMicro}).` };
  }
  if (missed) {
    return { weight: lastTopSet.weight, reason: 'hold', delta: 0, message: `Held at ${lastTopSet.weight}kg until you hit ${targetRepsMin}+ reps.` };
  }
  return { weight: lastTopSet.weight, reason: 'hold', delta: 0, message: `Repeat ${lastTopSet.weight}kg.` };
}

function groupBySession(sets: WorkingSet[]): WorkingSet[][] {
  const map = new Map<number, WorkingSet[]>();
  for (const s of sets) {
    const arr = map.get(s.sessionId) ?? [];
    arr.push(s);
    map.set(s.sessionId, arr);
  }
  return [...map.values()];
}

export async function checkPR(slug: string, weight: number, reps: number): Promise<boolean> {
  const prev = await db.sets.where('exerciseSlug').equals(slug).toArray();
  if (prev.length === 0) return weight > 0 && reps > 0;
  const bestE1RM = Math.max(...prev.map(s => e1RM(s.weight, s.reps)));
  return e1RM(weight, reps) > bestE1RM + 0.5;
}
