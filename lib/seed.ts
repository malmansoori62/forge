import type Dexie from 'dexie';
import { EXERCISE_LIBRARY } from './exercises';
import { PLAN_TEMPLATES, getTemplate, type PlanTemplate } from './templates';
import type { Plan, PlanDay, DayExercise, Exercise } from './types';

const DEFAULT_TEMPLATE_SLUG = 'ppl-6';

/**
 * Initial seed: exercises + install the default plan (PPL) as active.
 */
export async function seed(db: Dexie) {
  await db.transaction('rw', db.tables, async () => {
    const existingExercises = await db.table('exercises').count();
    if (existingExercises === 0) await db.table('exercises').bulkAdd(EXERCISE_LIBRARY);

    const tpl = getTemplate(DEFAULT_TEMPLATE_SLUG);
    if (tpl) await installTemplateInTx(db, tpl, true);
  });
}

/**
 * Install a plan template. Adds a Plan row and all its days/dayExercises.
 * Throws if a plan with the same name already exists.
 */
export async function installTemplate(
  db: Dexie,
  templateSlug: string,
  makeActive = false
): Promise<number> {
  const tpl = getTemplate(templateSlug);
  if (!tpl) throw new Error(`Unknown template: ${templateSlug}`);
  return db.transaction('rw', db.tables, async () => {
    const existing = await db.table('plans').where('name').equals(tpl.name).first();
    if (existing) throw new Error(`Plan "${tpl.name}" already installed.`);
    return installTemplateInTx(db, tpl, makeActive);
  });
}

async function installTemplateInTx(
  db: Dexie,
  tpl: PlanTemplate,
  makeActive: boolean
): Promise<number> {
  if (makeActive) {
    const all = await db.table('plans').toArray();
    for (const p of all) {
      if (p.active) await db.table('plans').update(p.id!, { active: false });
    }
  }

  const planId = (await db.table('plans').add({
    name: tpl.name,
    description: tpl.description,
    active: makeActive,
    templateSlug: tpl.slug,
    createdAt: Date.now()
  } as Plan)) as number;

  for (let i = 0; i < tpl.days.length; i++) {
    const d = tpl.days[i];
    const dayId = (await db.table('days').add({
      planId,
      slug: `${tpl.slug}-${d.slug}`,
      name: d.name,
      order: i,
      illustration: d.illustration
    } as PlanDay)) as number;

    for (let j = 0; j < d.exercises.length; j++) {
      const ex = d.exercises[j];
      await db.table('dayExercises').add({
        dayId,
        exerciseSlug: ex.slug,
        order: j,
        targetSets: ex.sets,
        targetRepsMin: ex.repsMin,
        targetRepsMax: ex.repsMax,
        targetRIR: ex.rir ?? 1
      } as DayExercise);
    }
  }

  return planId;
}

/** Set a plan as the active one; deactivates all others. */
export async function setActivePlan(db: Dexie, planId: number): Promise<void> {
  await db.transaction('rw', db.table('plans'), async () => {
    const all = await db.table('plans').toArray();
    for (const p of all) {
      const shouldBe = p.id === planId;
      if (p.active !== shouldBe) {
        await db.table('plans').update(p.id!, { active: shouldBe });
      }
    }
  });
}

/**
 * Delete a plan and all its days + dayExercises.
 * Sessions and sets are preserved (they reference dayId but stand on their own).
 */
export async function uninstallPlan(db: Dexie, planId: number): Promise<void> {
  await db.transaction('rw', [db.table('plans'), db.table('days'), db.table('dayExercises')], async () => {
    const dayIds = await db.table('days').where('planId').equals(planId).primaryKeys();
    for (const id of dayIds as number[]) {
      await db.table('dayExercises').where('dayId').equals(id).delete();
    }
    await db.table('days').where('planId').equals(planId).delete();
    await db.table('plans').delete(planId);

    // If we just deleted the active plan, promote another one
    const remaining = await db.table('plans').toArray();
    if (remaining.length > 0 && !remaining.some(p => p.active)) {
      await db.table('plans').update(remaining[0].id!, { active: true });
    }
  });
}

/** Returns the currently active plan, or the first plan if none are flagged active. */
export async function getActivePlan(db: Dexie): Promise<Plan | undefined> {
  const all = await db.table('plans').toArray();
  return all.find(p => p.active) ?? all[0];
}

/** Create an empty custom plan. */
export async function createCustomPlan(
  db: Dexie,
  name: string,
  description?: string,
  makeActive = true
): Promise<number> {
  return db.transaction('rw', db.table('plans'), async () => {
    const exists = await db.table('plans').where('name').equals(name).first();
    if (exists) throw new Error(`A plan called "${name}" already exists.`);
    if (makeActive) {
      const all = await db.table('plans').toArray();
      for (const p of all) {
        if (p.active) await db.table('plans').update(p.id!, { active: false });
      }
    }
    return (await db.table('plans').add({
      name,
      description,
      active: makeActive,
      createdAt: Date.now()
    } as Plan)) as number;
  });
}

/**
 * One-time migration: tag the original FORGE PPL plan with templateSlug='ppl-6'
 * so it shows as "installed" in the Plans browser.
 */
export async function migrateLegacyPlan(db: Dexie): Promise<void> {
  const ppl = await db.table('plans').where('name').equals('FORGE PPL').first();
  if (ppl && !ppl.templateSlug) {
    await db.table('plans').update(ppl.id!, { templateSlug: DEFAULT_TEMPLATE_SLUG });
  }
}

/**
 * Sync the exercises table with EXERCISE_LIBRARY:
 *   - adds any new library exercises that aren't in the DB
 *   - refreshes coach notes / cues / metadata for non-custom exercises
 *     so existing users get new content
 *   - preserves id, `custom` flag, and any user-uploaded `image`
 *     (so personal photos survive library updates)
 */
export async function syncExerciseLibrary(db: Dexie): Promise<void> {
  const existing = await db.table('exercises').toArray();
  const bySlug = new Map(existing.map((e: Exercise) => [e.slug, e]));

  await db.transaction('rw', db.table('exercises'), async () => {
    for (const tpl of EXERCISE_LIBRARY) {
      const cur = bySlug.get(tpl.slug);
      if (!cur) {
        await db.table('exercises').add(tpl);
      } else if (!cur.custom) {
        await db.table('exercises').update(cur.id!, {
          ...tpl,
          id: cur.id,
          image: cur.image ?? tpl.image
        });
      }
    }
  });
}
