export type Muscle =
  | 'chest' | 'front-delt' | 'side-delt' | 'rear-delt'
  | 'lats' | 'upper-back' | 'traps' | 'lower-back'
  | 'biceps' | 'triceps' | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'abs' | 'obliques';

export type MovementPattern =
  | 'horizontal-push' | 'vertical-push'
  | 'horizontal-pull' | 'vertical-pull'
  | 'hip-hinge' | 'knee-dominant' | 'lunge'
  | 'calf-raise'
  | 'bicep-curl' | 'tricep-extension'
  | 'lateral-raise' | 'rear-delt-fly'
  | 'core' | 'carry'
  | 'cardio';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'smith' | 'bodyweight' | 'kettlebell' | 'band';

export interface Exercise {
  id?: number;
  slug: string;
  name: string;
  primary: Muscle[];
  secondary: Muscle[];
  pattern: MovementPattern;
  equipment: Equipment[];
  isolation: boolean;
  image?: string;
  defaultRestSec?: number;
  cues?: string[];
  /** Tempo notation "eccentric-pause-concentric-lockout", e.g. "3110" */
  tempo?: string;
  /** Short overview of the exercise — what it trains, when to use it. */
  description?: string;
  /** Step-by-step setup before the rep. */
  setup?: string[];
  /** Step-by-step execution of the rep itself. */
  execution?: string[];
  /** Most common form mistakes to avoid. */
  commonMistakes?: string[];
  /** One game-changing coaching cue. */
  proTip?: string;
  /** Default unit when unset in settings (kg for most, may be lb for some imported plans). */
  defaultUnit?: 'kg' | 'lb';
  custom?: boolean;
}

export interface PlanDay {
  id?: number;
  planId: number;
  slug: string;
  name: string;
  order: number;
  illustration?: string;
}

export interface DayExercise {
  id?: number;
  dayId: number;
  exerciseSlug: string;
  order: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRIR: number;
  /** For cardio exercises: prescribed duration in minutes. */
  targetDurationMin?: number;
  /**
   * Superset id. Consecutive day-exercises sharing the same value are performed
   * back-to-back as a superset (minimal rest between them). Undefined = solo.
   */
  supersetGroup?: number;
}

export interface Plan {
  id?: number;
  name: string;
  description?: string;
  active: boolean;
  templateSlug?: string;
  createdAt: number;
}

export interface Session {
  id?: number;
  dayId: number;
  startedAt: number;
  endedAt?: number;
  bodyweight?: number;
  feelings?: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface WorkingSet {
  id?: number;
  sessionId: number;
  exerciseSlug: string;
  setIndex: number;
  weight: number;
  reps: number;
  rir: number;
  /** RPE 1-10 — optional, mutually exclusive with rir for the user but stored together */
  rpe?: number;
  isWarmup?: boolean;
  isPR?: boolean;
  /** Set id this drops down from (for drop sets) */
  parentSetId?: number;
  /** Unit the weight was logged in. Defaults to user setting if unset. */
  unit?: 'kg' | 'lb';
  /** Cardio: duration of the bout in seconds. */
  durationSec?: number;
  /** Cardio: distance covered in meters. */
  distanceM?: number;
  loggedAt: number;
}

export interface ExerciseNote {
  id?: number;
  exerciseSlug: string;
  body: string;
  updatedAt: number;
}

export interface BodyMeasurement {
  id?: number;
  takenAt: number;
  weightKg?: number;
  chestCm?: number;
  armCm?: number;
  waistCm?: number;
  thighCm?: number;
  hipCm?: number;
  note?: string;
}

export interface ProgressPhoto {
  id?: number;
  takenAt: number;
  angle: 'front' | 'side' | 'back';
  dataUrl: string;
  note?: string;
}

export interface AppMeta {
  key: string;
  value: any;
}
