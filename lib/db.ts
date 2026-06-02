import Dexie, { Table } from 'dexie';
import type {
  Exercise, Plan, PlanDay, DayExercise, Session, WorkingSet,
  ExerciseNote, BodyMeasurement, ProgressPhoto, AppMeta
} from './types';

class ForgeDB extends Dexie {
  exercises!: Table<Exercise, number>;
  plans!: Table<Plan, number>;
  days!: Table<PlanDay, number>;
  dayExercises!: Table<DayExercise, number>;
  sessions!: Table<Session, number>;
  sets!: Table<WorkingSet, number>;
  notes!: Table<ExerciseNote, number>;
  measurements!: Table<BodyMeasurement, number>;
  photos!: Table<ProgressPhoto, number>;
  meta!: Table<AppMeta, string>;

  constructor() {
    super('forge');
    this.version(1).stores({
      exercises: '++id, &slug, pattern, *primary, custom',
      plans: '++id, &name, active',
      days: '++id, planId, &slug, order',
      dayExercises: '++id, dayId, exerciseSlug, order',
      sessions: '++id, dayId, startedAt, endedAt',
      sets: '++id, sessionId, exerciseSlug, loggedAt, isPR',
      notes: '++id, &exerciseSlug, updatedAt',
      measurements: '++id, takenAt',
      photos: '++id, takenAt, angle',
      meta: '&key'
    });
    // v2: add `name` index on exercises so we can orderBy('name') in the picker.
    this.version(2).stores({
      exercises: '++id, &slug, name, pattern, *primary, custom'
    });
  }
}

export const db = new ForgeDB();

export async function ensureSeeded() {
  const { seed, migrateLegacyPlan, syncExerciseLibrary } = await import('./seed');
  const seeded = await db.meta.get('seeded');
  if (seeded?.value !== 'v1') {
    await seed(db);
    await db.meta.put({ key: 'seeded', value: 'v1' });
  }
  await migrateLegacyPlan(db);
  await syncExerciseLibrary(db);
}
