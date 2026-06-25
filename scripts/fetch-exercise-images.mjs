// Fetches one illustration per exercise from the public-domain Free Exercise DB
// (https://github.com/yuhonas/free-exercise-db, Unlicense) and saves it as
// forge/public/exercises/<slug>.jpg so each exercise in the FORGE library has a
// default picture. Re-runnable: existing files are skipped unless --force.
//
// Usage:  node scripts/fetch-exercise-images.mjs [--force]
import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FORCE = process.argv.includes('--force');
const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'public', 'exercises');

// FORGE slug -> Free Exercise DB id (folder name). Picked the clearest match
// for each movement. Slugs left out (pendulum-squat, bird-dog, hollow-hold)
// have no good dataset match and keep the dumbbell fallback icon.
const MAP = {
  // push
  'bench-press': 'Barbell_Bench_Press_-_Medium_Grip',
  'incline-bench-press': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'incline-db-press': 'Incline_Dumbbell_Press',
  'db-bench-press': 'Dumbbell_Bench_Press',
  'machine-chest-press': 'Leverage_Chest_Press',
  'cable-chest-fly': 'Cable_Crossover',
  'pec-deck': 'Butterfly',
  'weighted-dips': 'Dips_-_Chest_Version',
  'smith-bench-press': 'Smith_Machine_Bench_Press',
  'ohp-barbell': 'Standing_Military_Press',
  'db-shoulder-press': 'Dumbbell_Shoulder_Press',
  'machine-shoulder-press': 'Machine_Shoulder_Military_Press',
  'smith-ohp': 'Smith_Machine_Overhead_Shoulder_Press',
  'arnold-press': 'Arnold_Dumbbell_Press',
  'landmine-press': 'Landmine_Linear_Jammer',
  'db-lateral-raise': 'Side_Lateral_Raise',
  'cable-lateral-raise': 'Cable_Seated_Lateral_Raise',
  'machine-lateral-raise': 'Side_Lateral_Raise',
  'tricep-pushdown': 'Triceps_Pushdown',
  'overhead-tricep-extension': 'Standing_Dumbbell_Triceps_Extension',
  'skull-crusher': 'EZ-Bar_Skullcrusher',
  'cable-overhead-extension': 'Cable_Rope_Overhead_Triceps_Extension',
  'close-grip-bench': 'Close-Grip_Barbell_Bench_Press',
  // pull
  'pull-up': 'Pullups',
  'chin-up': 'Chin-Up',
  'lat-pulldown': 'Wide-Grip_Lat_Pulldown',
  'machine-pulldown': 'Full_Range-Of-Motion_Lat_Pulldown',
  'assisted-pull-up': 'Band_Assisted_Pull-Up',
  'barbell-row': 'Bent_Over_Barbell_Row',
  'single-arm-db-row': 'One-Arm_Dumbbell_Row',
  'bent-over-db-row': 'Bent_Over_Two-Dumbbell_Row',
  'seated-cable-row': 'Seated_Cable_Rows',
  't-bar-row': 'T-Bar_Row_with_Handle',
  'chest-supported-row': 'Leverage_Iso_Row',
  'machine-row': 'Leverage_High_Row',
  'power-clean': 'Power_Clean',
  'push-press': 'Push_Press',
  // hinge
  'conventional-deadlift': 'Barbell_Deadlift',
  'sumo-deadlift': 'Sumo_Deadlift',
  'romanian-deadlift': 'Romanian_Deadlift',
  'db-romanian-deadlift': 'Stiff-Legged_Dumbbell_Deadlift',
  'trap-bar-deadlift': 'Trap_Bar_Deadlift',
  'good-morning': 'Good_Morning',
  'hyperextension': 'Hyperextensions_Back_Extensions',
  // arms
  'db-bicep-curl': 'Dumbbell_Bicep_Curl',
  'hammer-curl': 'Hammer_Curls',
  'incline-db-curl': 'Incline_Dumbbell_Curl',
  'preacher-curl': 'Preacher_Curl',
  'cable-bicep-curl': 'Standing_Biceps_Cable_Curl',
  'ez-bar-curl': 'EZ-Bar_Curl',
  'spider-curl': 'Spider_Curl',
  // rear delt / lats
  'face-pull': 'Face_Pull',
  'rear-delt-fly-db': 'Reverse_Flyes',
  'rear-delt-machine': 'Reverse_Machine_Flyes',
  'cable-pullover': 'Straight-Arm_Pulldown',
  // legs
  'back-squat': 'Barbell_Squat',
  'front-squat': 'Front_Barbell_Squat',
  'leg-press': 'Leg_Press',
  'hack-squat': 'Hack_Squat',
  'bulgarian-split-squat': 'Split_Squat_with_Dumbbells',
  'smith-squat': 'Smith_Machine_Squat',
  'walking-lunge': 'Dumbbell_Lunges',
  'reverse-lunge': 'Dumbbell_Rear_Lunge',
  'step-up': 'Dumbbell_Step_Ups',
  'lying-leg-curl': 'Lying_Leg_Curls',
  'seated-leg-curl': 'Seated_Leg_Curl',
  'nordic-curl': 'Natural_Glute_Ham_Raise',
  'leg-extension': 'Leg_Extensions',
  'hip-thrust': 'Barbell_Hip_Thrust',
  'glute-kickback': 'Glute_Kickback',
  'cable-pull-through': 'Pull_Through',
  'standing-calf-raise': 'Standing_Calf_Raises',
  'seated-calf-raise': 'Seated_Calf_Raise',
  'leg-press-calf-raise': 'Calf_Press_On_The_Leg_Press_Machine',
  // core
  'hanging-knee-raise': 'Hanging_Leg_Raise',
  'hanging-leg-raise': 'Hanging_Leg_Raise',
  'toes-to-bar': 'Hanging_Leg_Raise',
  'cable-crunch': 'Cable_Crunch',
  'plank': 'Plank',
  'side-plank': 'Side_Bridge',
  'ab-wheel': 'Ab_Roller',
  'crunch': 'Crunches',
  'sit-up': 'Sit-Up',
  'decline-sit-up': 'Decline_Crunch',
  'bicycle-crunch': 'Air_Bike',
  'russian-twist': 'Russian_Twist',
  'dead-bug': 'Dead_Bug',
  'pallof-press': 'Pallof_Press',
  'mountain-climber': 'Mountain_Climbers',
  // cardio
  'treadmill': 'Running_Treadmill',
  'stationary-bike': 'Bicycling_Stationary',
  'rowing-machine': 'Rowing_Stationary',
  'elliptical': 'Elliptical_Trainer',
  'stair-master': 'Stairmaster',
  'jump-rope': 'Rope_Jumping',
  'outdoor-run': 'Trail_Running_Walking',
  'outdoor-walk': 'Walking_Treadmill'
};

const exists = (p) => access(p).then(() => true, () => false);

async function main() {
  await mkdir(OUT, { recursive: true });
  const entries = Object.entries(MAP);
  const ok = [], fail = [], skipped = [];

  for (const [slug, id] of entries) {
    const dest = join(OUT, `${slug}.jpg`);
    if (!FORCE && (await exists(dest))) { skipped.push(slug); continue; }
    const url = `${RAW}/exercises/${id}/0.jpg`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error(`too small (${buf.length}b)`);
      await writeFile(dest, buf);
      ok.push(slug);
      process.stdout.write(`OK  ${slug}\n`);
    } catch (e) {
      fail.push(`${slug} (${id}): ${e.message}`);
      process.stdout.write(`ERR ${slug} - ${e.message}\n`);
    }
  }

  console.log(`\nDone. ${ok.length} downloaded, ${skipped.length} skipped, ${fail.length} failed.`);
  if (fail.length) console.log('Failures:\n  ' + fail.join('\n  '));
}

main().catch((e) => { console.error(e); process.exit(1); });
