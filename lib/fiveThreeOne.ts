/**
 * Jim Wendler 5/3/1 percentage tables and helpers.
 *
 * TM (Training Max) = 90% of true 1RM. After each 4-week cycle, add
 *   +2.5 kg to upper-body lifts (Bench, OHP)
 *   +5 kg to lower-body lifts (Squat, Deadlift)
 *
 * Each weekly set uses a percentage of TM. The final set of each week
 * is an AMRAP (As Many Reps As Possible, "+" set).
 */

export const FIVE_THREE_ONE_WEEKS = [
  {
    key: 'wk1',
    label: 'Week 1 — 5s',
    sets: [
      { pct: 0.65, reps: 5 },
      { pct: 0.75, reps: 5 },
      { pct: 0.85, reps: '5+' }
    ]
  },
  {
    key: 'wk2',
    label: 'Week 2 — 3s',
    sets: [
      { pct: 0.70, reps: 3 },
      { pct: 0.80, reps: 3 },
      { pct: 0.90, reps: '3+' }
    ]
  },
  {
    key: 'wk3',
    label: 'Week 3 — 5/3/1',
    sets: [
      { pct: 0.75, reps: 5 },
      { pct: 0.85, reps: 3 },
      { pct: 0.95, reps: '1+' }
    ]
  },
  {
    key: 'deload',
    label: 'Week 4 — Deload',
    sets: [
      { pct: 0.40, reps: 5 },
      { pct: 0.50, reps: 5 },
      { pct: 0.60, reps: 5 }
    ]
  }
] as const;

/** Round to nearest 2.5kg (typical barbell increment). */
export function round2_5(kg: number): number {
  return Math.round(kg / 2.5) * 2.5;
}

/** Exercise slugs treated as the four 5/3/1 main lifts. */
export const MAIN_LIFTS = [
  { slug: 'bench-press', name: 'Bench Press', tmStep: 2.5 },
  { slug: 'back-squat', name: 'Back Squat', tmStep: 5 },
  { slug: 'conventional-deadlift', name: 'Deadlift', tmStep: 5 },
  { slug: 'ohp-barbell', name: 'Overhead Press', tmStep: 2.5 }
] as const;

export function isMainLift(slug: string): boolean {
  return MAIN_LIFTS.some(l => l.slug === slug);
}

/**
 * Estimate a Training Max from logged sets: 90% of the best Epley e1RM
 * across all logged working sets for that exercise.
 */
export function estimateTMFromHistory(bestE1RM: number): number {
  if (bestE1RM <= 0) return 0;
  return round2_5(bestE1RM * 0.9);
}
