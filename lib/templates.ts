/**
 * Workout plan templates.
 *
 * A template is a recipe for a Plan + its days + exercises. Users can install
 * any number of templates and switch between them (one active at a time).
 */

export interface TemplateExercise {
  slug: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  rir?: number;
}

export interface TemplateDay {
  slug: string;
  name: string;
  illustration?: string;
  exercises: TemplateExercise[];
}

export interface PlanTemplate {
  slug: string;
  name: string;
  description: string;
  daysPerWeek: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Author / origin of the program — e.g. "Mark Rippetoe" or "Jim Wendler" */
  source?: string;
  /** Short program-specific notes shown on the plan card (intensity, progression rule, etc.) */
  notes?: string;
  days: TemplateDay[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  // ───────── PPL 6-DAY (FORGE original) ─────────
  {
    slug: 'ppl-6',
    name: 'FORGE PPL',
    description: 'Push / Pull / Legs — 6-day rotation with A/B variants',
    daysPerWeek: 6,
    level: 'intermediate',
    source: 'FORGE default',
    days: [
      {
        slug: 'push-a', name: 'Push Day A', illustration: '/illustrations/push-a.jpg',
        exercises: [
          { slug: 'bench-press', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'incline-db-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'cable-chest-fly', sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
          { slug: 'ohp-barbell', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'db-lateral-raise', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'pull-a', name: 'Pull Day A', illustration: '/illustrations/pull-a.jpg',
        exercises: [
          { slug: 'conventional-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'barbell-row', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-bicep-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'legs-a', name: 'Legs Day A', illustration: '/illustrations/legs-a.jpg',
        exercises: [
          { slug: 'back-squat', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'leg-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'lying-leg-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'hip-thrust', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'standing-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'push-b', name: 'Push Day B', illustration: '/illustrations/push-b.jpg',
        exercises: [
          { slug: 'db-bench-press', sets: 4, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'machine-chest-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'db-shoulder-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'cable-lateral-raise', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'smith-ohp', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'overhead-tricep-extension', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'pull-b', name: 'Pull Day B', illustration: '/illustrations/pull-b.jpg',
        exercises: [
          { slug: 'sumo-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'cable-pullover', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'single-arm-db-row', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'face-pull', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'incline-db-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'hammer-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'legs-b', name: 'Legs Day B', illustration: '/illustrations/legs-b.jpg',
        exercises: [
          { slug: 'front-squat', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'hack-squat', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'walking-lunge', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'seated-leg-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'glute-kickback', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'leg-extension', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── UPPER / LOWER 4-DAY ─────────
  {
    slug: 'upper-lower-4',
    name: 'Upper / Lower',
    description: '4-day classic Upper / Lower split with A/B variants',
    daysPerWeek: 4,
    level: 'intermediate',
    source: 'Classic generic split',
    days: [
      {
        slug: 'upper-a', name: 'Upper A',
        exercises: [
          { slug: 'bench-press', sets: 4, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'barbell-row', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'incline-db-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-lateral-raise', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'ez-bar-curl', sets: 3, repsMin: 8, repsMax: 12, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 10, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'lower-a', name: 'Lower A',
        exercises: [
          { slug: 'back-squat', sets: 4, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'leg-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'lying-leg-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'standing-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'upper-b', name: 'Upper B',
        exercises: [
          { slug: 'ohp-barbell', sets: 4, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'db-bench-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'face-pull', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'incline-db-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'overhead-tricep-extension', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'lower-b', name: 'Lower B',
        exercises: [
          { slug: 'conventional-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'front-squat', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'walking-lunge', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'hip-thrust', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── FULL BODY 3-DAY (Beginner) ─────────
  {
    slug: 'full-body-3',
    name: 'Full Body 3-Day',
    description: 'Beginner-friendly full body, 3 sessions per week',
    daysPerWeek: 3,
    level: 'beginner',
    source: 'Generic beginner template',
    days: [
      {
        slug: 'fb-a', name: 'Full Body A',
        exercises: [
          { slug: 'back-squat', sets: 3, repsMin: 5, repsMax: 8, rir: 2 },
          { slug: 'bench-press', sets: 3, repsMin: 5, repsMax: 8, rir: 2 },
          { slug: 'barbell-row', sets: 3, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'db-lateral-raise', sets: 2, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'standing-calf-raise', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'fb-b', name: 'Full Body B',
        exercises: [
          { slug: 'conventional-deadlift', sets: 3, repsMin: 5, repsMax: 6, rir: 2 },
          { slug: 'ohp-barbell', sets: 3, repsMin: 5, repsMax: 8, rir: 2 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'incline-db-press', sets: 2, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-bicep-curl', sets: 2, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'fb-c', name: 'Full Body C',
        exercises: [
          { slug: 'front-squat', sets: 3, repsMin: 6, repsMax: 8, rir: 2 },
          { slug: 'db-bench-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'tricep-pushdown', sets: 2, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── BRO SPLIT 5-DAY ─────────
  {
    slug: 'bro-split-5',
    name: 'Bro Split',
    description: 'One body part per day — Chest / Back / Shoulders / Arms / Legs',
    daysPerWeek: 5,
    level: 'intermediate',
    source: 'Classic gym standard',
    days: [
      {
        slug: 'chest-day', name: 'Chest Day',
        exercises: [
          { slug: 'bench-press', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'incline-db-press', sets: 4, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'machine-chest-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'cable-chest-fly', sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
          { slug: 'weighted-dips', sets: 3, repsMin: 8, repsMax: 12, rir: 1 }
        ]
      },
      {
        slug: 'back-day', name: 'Back Day',
        exercises: [
          { slug: 'conventional-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'hammer-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'shoulders-day', name: 'Shoulders Day',
        exercises: [
          { slug: 'ohp-barbell', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'db-shoulder-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-lateral-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'cable-lateral-raise', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'rear-delt-fly-db', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'face-pull', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'arms-day', name: 'Arms Day',
        exercises: [
          { slug: 'ez-bar-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'skull-crusher', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'incline-db-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 10, repsMax: 15, rir: 0 },
          { slug: 'hammer-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'overhead-tricep-extension', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'legs-day', name: 'Legs Day',
        exercises: [
          { slug: 'back-squat', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'leg-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'lying-leg-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'leg-extension', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'standing-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── ARNOLD SPLIT 6-DAY ─────────
  {
    slug: 'arnold-6',
    name: 'Arnold Split',
    description: 'Chest+Back / Shoulders+Arms / Legs — twice per week',
    daysPerWeek: 6,
    level: 'advanced',
    source: 'Arnold Schwarzenegger',
    notes: 'From The Encyclopedia of Modern Bodybuilding — Arnold\'s competition split',
    days: [
      {
        slug: 'chest-back-a', name: 'Chest & Back A',
        exercises: [
          { slug: 'bench-press', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'incline-db-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'cable-chest-fly', sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
          { slug: 'cable-pullover', sets: 3, repsMin: 10, repsMax: 12, rir: 1 }
        ]
      },
      {
        slug: 'shoulders-arms-a', name: 'Shoulders & Arms A',
        exercises: [
          { slug: 'ohp-barbell', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'db-lateral-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'rear-delt-fly-db', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'ez-bar-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'tricep-pushdown', sets: 4, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'hammer-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'legs-arnold-a', name: 'Legs A',
        exercises: [
          { slug: 'back-squat', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'leg-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'lying-leg-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'standing-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'chest-back-b', name: 'Chest & Back B',
        exercises: [
          { slug: 'incline-bench-press', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'lat-pulldown', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-bench-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'pec-deck', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'face-pull', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'shoulders-arms-b', name: 'Shoulders & Arms B',
        exercises: [
          { slug: 'db-shoulder-press', sets: 4, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'cable-lateral-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'rear-delt-machine', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'preacher-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'overhead-tricep-extension', sets: 4, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'spider-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'legs-arnold-b', name: 'Legs B',
        exercises: [
          { slug: 'front-squat', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'sumo-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'hack-squat', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-leg-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'walking-lunge', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'seated-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── PPL 3-DAY (compressed) ─────────
  {
    slug: 'ppl-3',
    name: 'PPL 3-Day',
    description: 'Push / Pull / Legs once per week — minimal time commitment',
    daysPerWeek: 3,
    level: 'beginner',
    source: 'Generic compressed PPL',
    days: [
      {
        slug: 'push-3', name: 'Push',
        exercises: [
          { slug: 'bench-press', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'ohp-barbell', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'incline-db-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-lateral-raise', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'pull-3', name: 'Pull',
        exercises: [
          { slug: 'conventional-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'face-pull', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'db-bicep-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'legs-3', name: 'Legs',
        exercises: [
          { slug: 'back-squat', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'leg-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'lying-leg-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'standing-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── STARTING STRENGTH (Mark Rippetoe) ─────────
  {
    slug: 'starting-strength',
    name: 'Starting Strength',
    description: 'The classic novice barbell strength program — squat every session, alternate A/B',
    daysPerWeek: 3,
    level: 'beginner',
    source: 'Mark Rippetoe',
    notes: 'Linear progression: add 2.5kg per session to squat/deadlift, 1.25kg to upper-body lifts',
    days: [
      {
        slug: 'ss-a', name: 'Workout A',
        exercises: [
          { slug: 'back-squat', sets: 3, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'bench-press', sets: 3, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'conventional-deadlift', sets: 1, repsMin: 5, repsMax: 5, rir: 1 }
        ]
      },
      {
        slug: 'ss-b', name: 'Workout B',
        exercises: [
          { slug: 'back-squat', sets: 3, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'ohp-barbell', sets: 3, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'power-clean', sets: 5, repsMin: 3, repsMax: 3, rir: 1 }
        ]
      }
    ]
  },

  // ───────── STRONGLIFTS 5×5 (Mehdi) ─────────
  {
    slug: 'stronglifts-5x5',
    name: 'StrongLifts 5×5',
    description: 'Simplest beginner barbell program — 5 sets of 5 across two alternating workouts',
    daysPerWeek: 3,
    level: 'beginner',
    source: 'Mehdi / StrongLifts.com',
    notes: 'Add 2.5kg every session you hit all 5×5. Deload 10% after 3 failed attempts.',
    days: [
      {
        slug: 'sl-a', name: 'Workout A',
        exercises: [
          { slug: 'back-squat', sets: 5, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'bench-press', sets: 5, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'barbell-row', sets: 5, repsMin: 5, repsMax: 5, rir: 1 }
        ]
      },
      {
        slug: 'sl-b', name: 'Workout B',
        exercises: [
          { slug: 'back-squat', sets: 5, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'ohp-barbell', sets: 5, repsMin: 5, repsMax: 5, rir: 1 },
          { slug: 'conventional-deadlift', sets: 1, repsMin: 5, repsMax: 5, rir: 1 }
        ]
      }
    ]
  },

  // ───────── GZCLP (Cody Lefever) ─────────
  {
    slug: 'gzclp',
    name: 'GZCLP',
    description: 'Beginner-to-intermediate strength using GZCL T1/T2/T3 tier system — 4 days',
    daysPerWeek: 4,
    level: 'beginner',
    source: 'Cody Lefever',
    notes: 'T1: 5×3+ (heavy, AMRAP last set). T2: 3×10. T3: 3×15+. Add weight every session, deload when you miss reps.',
    days: [
      {
        slug: 'gzclp-1', name: 'Squat / Bench / Lat Pulldown',
        exercises: [
          { slug: 'back-squat', sets: 5, repsMin: 3, repsMax: 3, rir: 0 },
          { slug: 'bench-press', sets: 3, repsMin: 10, repsMax: 10, rir: 1 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 15, repsMax: 20, rir: 0 }
        ]
      },
      {
        slug: 'gzclp-2', name: 'OHP / Deadlift / Barbell Row',
        exercises: [
          { slug: 'ohp-barbell', sets: 5, repsMin: 3, repsMax: 3, rir: 0 },
          { slug: 'conventional-deadlift', sets: 3, repsMin: 10, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 3, repsMin: 15, repsMax: 20, rir: 0 }
        ]
      },
      {
        slug: 'gzclp-3', name: 'Bench / Squat / Lat Pulldown',
        exercises: [
          { slug: 'bench-press', sets: 5, repsMin: 3, repsMax: 3, rir: 0 },
          { slug: 'back-squat', sets: 3, repsMin: 10, repsMax: 10, rir: 1 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 15, repsMax: 20, rir: 0 }
        ]
      },
      {
        slug: 'gzclp-4', name: 'Deadlift / OHP / Barbell Row',
        exercises: [
          { slug: 'conventional-deadlift', sets: 5, repsMin: 3, repsMax: 3, rir: 0 },
          { slug: 'ohp-barbell', sets: 3, repsMin: 10, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 3, repsMin: 15, repsMax: 20, rir: 0 }
        ]
      }
    ]
  },

  // ───────── 5/3/1 BBB (Jim Wendler) ─────────
  {
    slug: '531-bbb',
    name: '5/3/1 BBB',
    description: 'Wendler\'s 5/3/1 with "Boring But Big" 5×10 supplemental — 4 days, monthly cycle',
    daysPerWeek: 4,
    level: 'intermediate',
    source: 'Jim Wendler',
    notes: 'Main lift uses % of Training Max: Wk1 5/5/5+, Wk2 3/3/3+, Wk3 5/3/1+, Wk4 deload. BBB 5×10 at 50–60% TM.',
    days: [
      {
        slug: '531-press', name: 'Press Day',
        exercises: [
          { slug: 'ohp-barbell', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'ohp-barbell', sets: 5, repsMin: 10, repsMax: 10, rir: 2 },
          { slug: 'pull-up', sets: 5, repsMin: 8, repsMax: 12, rir: 1 }
        ]
      },
      {
        slug: '531-deadlift', name: 'Deadlift Day',
        exercises: [
          { slug: 'conventional-deadlift', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'conventional-deadlift', sets: 5, repsMin: 10, repsMax: 10, rir: 2 },
          { slug: 'hyperextension', sets: 5, repsMin: 10, repsMax: 15, rir: 1 }
        ]
      },
      {
        slug: '531-bench', name: 'Bench Day',
        exercises: [
          { slug: 'bench-press', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'bench-press', sets: 5, repsMin: 10, repsMax: 10, rir: 2 },
          { slug: 'barbell-row', sets: 5, repsMin: 8, repsMax: 12, rir: 1 }
        ]
      },
      {
        slug: '531-squat', name: 'Squat Day',
        exercises: [
          { slug: 'back-squat', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'back-squat', sets: 5, repsMin: 10, repsMax: 10, rir: 2 },
          { slug: 'hanging-knee-raise', sets: 5, repsMin: 10, repsMax: 15, rir: 1 }
        ]
      }
    ]
  },

  // ───────── PHUL (Brandon Campbell) ─────────
  {
    slug: 'phul',
    name: 'PHUL',
    description: 'Power Hypertrophy Upper Lower — 4-day, mixes 3–5 rep strength and 8–12 rep volume',
    daysPerWeek: 4,
    level: 'intermediate',
    source: 'Brandon Campbell, MD',
    notes: 'Mon: Upper Power · Tue: Lower Power · Thu: Upper Hyper · Fri: Lower Hyper',
    days: [
      {
        slug: 'phul-up', name: 'Upper Power',
        exercises: [
          { slug: 'bench-press', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'incline-db-press', sets: 3, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'ohp-barbell', sets: 2, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'ez-bar-curl', sets: 3, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'skull-crusher', sets: 3, repsMin: 6, repsMax: 10, rir: 1 }
        ]
      },
      {
        slug: 'phul-lp', name: 'Lower Power',
        exercises: [
          { slug: 'back-squat', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'conventional-deadlift', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'leg-press', sets: 5, repsMin: 10, repsMax: 15, rir: 1 },
          { slug: 'lying-leg-curl', sets: 3, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'standing-calf-raise', sets: 4, repsMin: 6, repsMax: 10, rir: 1 }
        ]
      },
      {
        slug: 'phul-uh', name: 'Upper Hypertrophy',
        exercises: [
          { slug: 'incline-bench-press', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'cable-chest-fly', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'single-arm-db-row', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-lateral-raise', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'preacher-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'tricep-pushdown', sets: 4, repsMin: 8, repsMax: 12, rir: 1 }
        ]
      },
      {
        slug: 'phul-lh', name: 'Lower Hypertrophy',
        exercises: [
          { slug: 'front-squat', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'hack-squat', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'walking-lunge', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-leg-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-calf-raise', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'standing-calf-raise', sets: 3, repsMin: 8, repsMax: 12, rir: 1 }
        ]
      }
    ]
  },

  // ───────── PHAT (Layne Norton) ─────────
  {
    slug: 'phat',
    name: 'PHAT',
    description: 'Power Hypertrophy Adaptive Training — 5-day powerbuilding hybrid from Dr. Layne Norton',
    daysPerWeek: 5,
    level: 'advanced',
    source: 'Dr. Layne Norton',
    notes: 'Mon: Upper Power · Tue: Lower Power · Thu: Back/Shoulders Hyper · Fri: Lower Hyper · Sat: Chest/Arms Hyper',
    days: [
      {
        slug: 'phat-up', name: 'Upper Body Power',
        exercises: [
          { slug: 'pull-up', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'barbell-row', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'bench-press', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'weighted-dips', sets: 2, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'ohp-barbell', sets: 3, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'ez-bar-curl', sets: 3, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'skull-crusher', sets: 3, repsMin: 6, repsMax: 10, rir: 1 }
        ]
      },
      {
        slug: 'phat-lp', name: 'Lower Body Power',
        exercises: [
          { slug: 'back-squat', sets: 3, repsMin: 3, repsMax: 5, rir: 0 },
          { slug: 'hack-squat', sets: 2, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'leg-extension', sets: 2, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'lying-leg-curl', sets: 2, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'standing-calf-raise', sets: 3, repsMin: 6, repsMax: 10, rir: 1 }
        ]
      },
      {
        slug: 'phat-bsh', name: 'Back & Shoulders Hyper',
        exercises: [
          { slug: 'barbell-row', sets: 6, repsMin: 3, repsMax: 3, rir: 2 },
          { slug: 'pull-up', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'lat-pulldown', sets: 2, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'db-shoulder-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-lateral-raise', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'rear-delt-fly-db', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'phat-lh', name: 'Lower Body Hyper',
        exercises: [
          { slug: 'back-squat', sets: 6, repsMin: 3, repsMax: 3, rir: 2 },
          { slug: 'hack-squat', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'leg-press', sets: 2, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'leg-extension', sets: 3, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'romanian-deadlift', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'lying-leg-curl', sets: 2, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'seated-calf-raise', sets: 4, repsMin: 10, repsMax: 15, rir: 1 }
        ]
      },
      {
        slug: 'phat-ca', name: 'Chest & Arms Hyper',
        exercises: [
          { slug: 'incline-bench-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'cable-chest-fly', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'weighted-dips', sets: 2, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'ez-bar-curl', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'incline-db-curl', sets: 2, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'overhead-tricep-extension', sets: 2, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── JEFF NIPPARD PPL (Jeff Nippard) ─────────
  {
    slug: 'nippard-ppl-6',
    name: 'Nippard Fundamentals PPL',
    description: 'Push / Pull / Legs built around evidence-based hypertrophy — 6 days, A/B variants',
    daysPerWeek: 6,
    level: 'intermediate',
    source: 'Jeff Nippard (Fundamentals PPL)',
    notes: 'Heavy compound first, then high-rep isolation. 10-min treadmill warmup before every session.',
    days: [
      {
        slug: 'push-a', name: 'Push A — Chest Focus',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'bench-press', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'incline-db-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'machine-chest-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'cable-chest-fly', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'db-lateral-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'pull-a', name: 'Pull A — Back Width',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'face-pull', sets: 3, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'incline-db-curl', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'cable-bicep-curl', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'legs-a', name: 'Legs A — Quad Focus',
        exercises: [
          { slug: 'stationary-bike', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'back-squat', sets: 4, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'leg-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'walking-lunge', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'leg-extension', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'standing-calf-raise', sets: 4, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'push-b', name: 'Push B — Shoulder Focus',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'ohp-barbell', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'db-shoulder-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'incline-bench-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'cable-lateral-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'rear-delt-fly-db', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'overhead-tricep-extension', sets: 3, repsMin: 10, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'pull-b', name: 'Pull B — Back Thickness',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'conventional-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'chest-supported-row', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'single-arm-db-row', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'cable-pullover', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'preacher-curl', sets: 4, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'hammer-curl', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'legs-b', name: 'Legs B — Posterior Focus',
        exercises: [
          { slug: 'stationary-bike', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'romanian-deadlift', sets: 4, repsMin: 6, repsMax: 8, rir: 1 },
          { slug: 'hip-thrust', sets: 4, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'front-squat', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'lying-leg-curl', sets: 4, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'seated-calf-raise', sets: 4, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      }
    ]
  },

  // ───────── COOLCICADA PPL (Coolcicada) ─────────
  {
    slug: 'coolcicada-ppl',
    name: 'Coolcicada PPL',
    description: 'The most upvoted PPL on /r/Fitness — minimalist, high-volume bodybuilding split',
    daysPerWeek: 6,
    level: 'intermediate',
    source: 'Coolcicada (/r/Fitness)',
    notes: 'Run as PPL Mon-Wed-Fri / PPL Tue-Thu-Sat. Hit working sets to 1–2 RIR, last set push for AMRAP.',
    days: [
      {
        slug: 'push', name: 'Push Day',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'bench-press', sets: 4, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'ohp-barbell', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'incline-db-press', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-lateral-raise', sets: 4, repsMin: 8, repsMax: 12, rir: 0 },
          { slug: 'tricep-pushdown', sets: 4, repsMin: 8, repsMax: 12, rir: 0 },
          { slug: 'overhead-tricep-extension', sets: 4, repsMin: 8, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'pull', name: 'Pull Day',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'conventional-deadlift', sets: 4, repsMin: 5, repsMax: 5, rir: 2 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'barbell-row', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'face-pull', sets: 4, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'ez-bar-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 0 },
          { slug: 'hammer-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 0 }
        ]
      },
      {
        slug: 'legs', name: 'Legs Day',
        exercises: [
          { slug: 'stationary-bike', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'back-squat', sets: 4, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'romanian-deadlift', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'leg-press', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'lying-leg-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 0 },
          { slug: 'standing-calf-raise', sets: 5, repsMin: 8, repsMax: 12, rir: 0 }
        ]
      }
    ]
  },

  // ───────── NATURAL HYPERTROPHY PPL (Natural Hypertrophy / YouTube) ─────────
  {
    slug: 'nat-hyp-ppl',
    name: 'Natural Hypertrophy PPL',
    description: 'High-volume, full-ROM PPL — built for natural lifters chasing size, run 5–6× per week',
    daysPerWeek: 6,
    level: 'advanced',
    source: 'Natural Hypertrophy',
    notes: 'Slow eccentrics on every rep. Push last set to failure. Aim for 15-min walk/treadmill cooldown post-workout.',
    days: [
      {
        slug: 'push-a', name: 'Push A',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'incline-bench-press', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'weighted-dips', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'db-shoulder-press', sets: 3, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'cable-chest-fly', sets: 3, repsMin: 12, repsMax: 20, rir: 0 },
          { slug: 'db-lateral-raise', sets: 4, repsMin: 12, repsMax: 20, rir: 0 },
          { slug: 'skull-crusher', sets: 3, repsMin: 8, repsMax: 12, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'pull-a', name: 'Pull A',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'pull-up', sets: 4, repsMin: 6, repsMax: 12, rir: 1 },
          { slug: 'barbell-row', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'lat-pulldown', sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
          { slug: 'seated-cable-row', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'rear-delt-fly-db', sets: 3, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'incline-db-curl', sets: 4, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'hammer-curl', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'legs-a', name: 'Legs A',
        exercises: [
          { slug: 'stationary-bike', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'back-squat', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'romanian-deadlift', sets: 4, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'bulgarian-split-squat', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'lying-leg-curl', sets: 3, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'leg-extension', sets: 3, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'standing-calf-raise', sets: 5, repsMin: 10, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'push-b', name: 'Push B',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'bench-press', sets: 4, repsMin: 5, repsMax: 8, rir: 1 },
          { slug: 'ohp-barbell', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'machine-chest-press', sets: 3, repsMin: 10, repsMax: 15, rir: 1 },
          { slug: 'cable-lateral-raise', sets: 4, repsMin: 12, repsMax: 20, rir: 0 },
          { slug: 'overhead-tricep-extension', sets: 3, repsMin: 10, repsMax: 12, rir: 0 },
          { slug: 'tricep-pushdown', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'pull-b', name: 'Pull B',
        exercises: [
          { slug: 'treadmill', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'conventional-deadlift', sets: 3, repsMin: 4, repsMax: 6, rir: 2 },
          { slug: 'chest-supported-row', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'cable-pullover', sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
          { slug: 'face-pull', sets: 3, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'preacher-curl', sets: 4, repsMin: 8, repsMax: 12, rir: 0 },
          { slug: 'spider-curl', sets: 3, repsMin: 12, repsMax: 15, rir: 0 }
        ]
      },
      {
        slug: 'legs-b', name: 'Legs B',
        exercises: [
          { slug: 'stationary-bike', sets: 1, repsMin: 10, repsMax: 10, rir: 5 },
          { slug: 'front-squat', sets: 4, repsMin: 6, repsMax: 10, rir: 1 },
          { slug: 'hip-thrust', sets: 4, repsMin: 8, repsMax: 12, rir: 1 },
          { slug: 'walking-lunge', sets: 3, repsMin: 10, repsMax: 15, rir: 1 },
          { slug: 'seated-leg-curl', sets: 4, repsMin: 12, repsMax: 15, rir: 0 },
          { slug: 'leg-extension', sets: 3, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'seated-calf-raise', sets: 5, repsMin: 12, repsMax: 20, rir: 0 }
        ]
      }
    ]
  },

  // ───────── CORE CRUSHER (Abs program) ─────────
  {
    slug: 'core-crusher',
    name: 'Core Crusher',
    description: 'Dedicated 3-day ab program covering all four core functions — anti-extension, anti-rotation, anti-lateral flexion, and flexion',
    daysPerWeek: 3,
    level: 'beginner',
    source: 'FORGE expert template',
    notes: 'Quick 15–20 min ab sessions. Run as standalone or as a finisher to your main lift days.',
    days: [
      {
        slug: 'abs-stability', name: 'Day 1 — Stability',
        exercises: [
          { slug: 'plank', sets: 3, repsMin: 30, repsMax: 45, rir: 1 },
          { slug: 'dead-bug', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'bird-dog', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'side-plank', sets: 2, repsMin: 20, repsMax: 30, rir: 1 },
          { slug: 'hollow-hold', sets: 3, repsMin: 20, repsMax: 30, rir: 1 }
        ]
      },
      {
        slug: 'abs-six-pack', name: 'Day 2 — Six Pack',
        exercises: [
          { slug: 'hanging-knee-raise', sets: 4, repsMin: 10, repsMax: 15, rir: 1 },
          { slug: 'cable-crunch', sets: 4, repsMin: 10, repsMax: 15, rir: 1 },
          { slug: 'bicycle-crunch', sets: 3, repsMin: 15, repsMax: 20, rir: 0 },
          { slug: 'decline-sit-up', sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
          { slug: 'russian-twist', sets: 3, repsMin: 20, repsMax: 30, rir: 0 }
        ]
      },
      {
        slug: 'abs-power', name: 'Day 3 — Power Core',
        exercises: [
          { slug: 'ab-wheel', sets: 4, repsMin: 6, repsMax: 10, rir: 2 },
          { slug: 'hanging-leg-raise', sets: 4, repsMin: 6, repsMax: 12, rir: 1 },
          { slug: 'pallof-press', sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
          { slug: 'plank', sets: 2, repsMin: 45, repsMax: 60, rir: 1 },
          { slug: 'mountain-climber', sets: 3, repsMin: 30, repsMax: 45, rir: 0 }
        ]
      }
    ]
  },

  // ───────── ARNOLD'S GOLDEN SIX (Arnold Schwarzenegger) ─────────
  {
    slug: 'arnold-golden-six',
    name: 'Arnold\'s Golden Six',
    description: 'Arnold\'s original beginner full-body program from the 1960s — six lifts, three days',
    daysPerWeek: 3,
    level: 'beginner',
    source: 'Arnold Schwarzenegger',
    notes: 'Run identically Mon/Wed/Fri. Add weight when you can finish the top of each rep range.',
    days: [
      {
        slug: 'golden-six', name: 'Golden Six',
        exercises: [
          { slug: 'back-squat', sets: 4, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'bench-press', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'pull-up', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'ohp-barbell', sets: 4, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'ez-bar-curl', sets: 3, repsMin: 8, repsMax: 10, rir: 1 },
          { slug: 'sit-up', sets: 4, repsMin: 15, repsMax: 25, rir: 1 }
        ]
      }
    ]
  }
];

export function getTemplate(slug: string): PlanTemplate | undefined {
  return PLAN_TEMPLATES.find(t => t.slug === slug);
}
