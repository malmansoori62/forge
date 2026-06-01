import type { Exercise } from './types';

export const EXERCISE_LIBRARY: Omit<Exercise, 'id'>[] = [
  // ───────── HORIZONTAL PUSH ─────────
  {
    slug: 'bench-press', name: 'Barbell Bench Press',
    pattern: 'horizontal-push', primary: ['chest'], secondary: ['front-delt', 'triceps'],
    equipment: ['barbell'], isolation: false, defaultRestSec: 180,
    cues: ['Feet flat', 'Shoulder blades pinched', 'Bar touches mid-chest'],
    description: 'The king of upper-body pressing — recruits chest, triceps and front delts under heavy load. Built for absolute strength and chest hypertrophy.',
    setup: [
      'Lie back so eyes are directly under the bar',
      'Grip bar slightly wider than shoulder-width (forearms vertical at bottom)',
      'Plant feet flat, drive knees out, squeeze glutes',
      'Retract shoulder blades — pin them down into the bench',
      'Create a slight natural arch in the lower back'
    ],
    execution: [
      'Unrack and bring the bar over your nipple line',
      'Lower under control to mid-chest, elbows ~45° from torso',
      'Lightly touch chest — do not bounce',
      'Drive bar up and back toward face, finish with elbows locked'
    ],
    commonMistakes: [
      'Flaring elbows to 90° — wrecks the shoulder over time',
      'Butt rising off the bench — disqualifies the lift, leaks force',
      'Bouncing the bar off the chest — robs tension and risks injury',
      'Half-repping — only counts when the bar touches your chest'
    ],
    proTip: 'Break the bar in half — try to physically pull it apart as you press. Locks in shoulder packing and recruits more lat/tricep drive.'
  },
  { slug: 'incline-bench-press', name: 'Incline Barbell Press', pattern: 'horizontal-push', primary: ['chest', 'front-delt'], secondary: ['triceps'], equipment: ['barbell'], isolation: false, defaultRestSec: 180, cues: ['Bench at 30°', 'Bar to upper chest'] },
  {
    slug: 'incline-db-press', name: 'Incline Dumbbell Press',
    pattern: 'horizontal-push', primary: ['chest', 'front-delt'], secondary: ['triceps'],
    equipment: ['dumbbell'], isolation: false, defaultRestSec: 120,
    cues: ['Bench at 30°', 'Stretch at bottom'],
    description: 'Best upper-chest builder — dumbbells let each side work independently and allow a fuller stretch at the bottom than a barbell.',
    setup: [
      'Set bench to 30° (not steeper — 45°+ turns it into a shoulder press)',
      'Sit, dumbbells on knees, kick them up one at a time as you lie back',
      'Plant feet, retract shoulder blades, dumbbells stacked over lower chest line'
    ],
    execution: [
      'Lower under control to chest level — feel deep chest stretch',
      'Press up AND slightly in, dumbbells meet (don\'t clang) at the top',
      'Squeeze chest hard at lockout — don\'t fully lock elbows'
    ],
    commonMistakes: [
      'Bench too steep — recruits front delts, not chest',
      'Dropping weight at the bottom — control the stretch',
      'Not pressing the dumbbells inward — you miss the chest peak contraction'
    ],
    proTip: 'Hold a 2-second pause at the bottom on your last set. Brutal stretch overload that drives chest growth.'
  },
  { slug: 'db-bench-press', name: 'Dumbbell Bench Press', pattern: 'horizontal-push', primary: ['chest'], secondary: ['front-delt', 'triceps'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 120, cues: ['Full stretch', 'Press in arc'] },
  { slug: 'machine-chest-press', name: 'Machine Chest Press', pattern: 'horizontal-push', primary: ['chest'], secondary: ['triceps', 'front-delt'], equipment: ['machine'], isolation: false, defaultRestSec: 90, cues: ['Squeeze chest at lockout'] },
  {
    slug: 'cable-chest-fly', name: 'Cable Chest Fly',
    pattern: 'horizontal-push', primary: ['chest'], secondary: [],
    equipment: ['cable'], isolation: true, defaultRestSec: 75,
    cues: ['Slight elbow bend', 'Squeeze at midline'],
    description: 'Cable isolation for the chest. Constant tension at every angle — best for hammering the inner chest and getting a deep stretch.',
    setup: [
      'Set both cables to chest height (mid-pulley)',
      'Grab handles, stagger your stance (one foot forward) for stability',
      'Take a step forward into the working position — slight forward lean'
    ],
    execution: [
      'Soft 15° bend in the elbows — lock them there for the whole set',
      'Open arms wide, feel a deep chest stretch',
      'Bring hands together in front of chest in a hugging arc',
      'Cross hands slightly past midline — squeeze the chest hard'
    ],
    commonMistakes: [
      'Bending and straightening elbows — turns into a pressing motion',
      'Stopping at hands-meet — push past for the full chest squeeze',
      'Going too heavy and rounding the back — drop the weight, own the contraction'
    ],
    proTip: 'Vary pulley height across the workout — high-to-low (lower chest), mid (mid-chest), low-to-high (upper chest). Hits every chest fiber direction.'
  },
  { slug: 'pec-deck', name: 'Pec Deck', pattern: 'horizontal-push', primary: ['chest'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 75 },
  { slug: 'weighted-dips', name: 'Weighted Dips', pattern: 'horizontal-push', primary: ['chest', 'triceps'], secondary: ['front-delt'], equipment: ['bodyweight'], isolation: false, defaultRestSec: 120, cues: ['Lean forward for chest'] },
  { slug: 'smith-bench-press', name: 'Smith Bench Press', pattern: 'horizontal-push', primary: ['chest'], secondary: ['front-delt', 'triceps'], equipment: ['smith'], isolation: false, defaultRestSec: 150 },

  // ───────── VERTICAL PUSH ─────────
  {
    slug: 'ohp-barbell', name: 'Barbell Overhead Press',
    pattern: 'vertical-push', primary: ['front-delt'], secondary: ['triceps', 'side-delt'],
    equipment: ['barbell'], isolation: false, defaultRestSec: 180,
    cues: ['Glutes tight', 'Bar over mid-foot at lockout'],
    description: 'Standing barbell press — the gold standard for shoulder and upper-back strength. Forces total-body tension because nothing supports you.',
    setup: [
      'Bar in rack at upper-chest height',
      'Grip just outside shoulder-width — wrists stacked over forearms',
      'Step under, elbows slightly in front of bar, bar resting on front delts',
      'Brace abs hard, squeeze glutes, feet hip-width'
    ],
    execution: [
      'Press bar straight up, moving head back slightly as it passes face',
      'Drive head "through the window" as bar locks out overhead',
      'Bar finishes stacked over mid-foot, shoulders shrugged into bar',
      'Lower under control back to front delts'
    ],
    commonMistakes: [
      'Pressing the bar forward instead of straight up',
      'Loose core / leaning back excessively (turns it into a standing incline press)',
      'Soft glutes — leaks force and bends the lower back',
      'Stopping short of full lockout'
    ],
    proTip: 'Inhale → brace → press. Hold breath through the rep (Valsalva) for max stability on heavy sets.'
  },
  { slug: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', pattern: 'vertical-push', primary: ['front-delt'], secondary: ['triceps', 'side-delt'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 120 },
  { slug: 'machine-shoulder-press', name: 'Machine Shoulder Press', pattern: 'vertical-push', primary: ['front-delt'], secondary: ['triceps'], equipment: ['machine'], isolation: false, defaultRestSec: 90 },
  { slug: 'smith-ohp', name: 'Smith Machine Overhead Press', pattern: 'vertical-push', primary: ['front-delt'], secondary: ['triceps'], equipment: ['smith'], isolation: false, defaultRestSec: 150 },
  { slug: 'arnold-press', name: 'Arnold Press', pattern: 'vertical-push', primary: ['front-delt', 'side-delt'], secondary: ['triceps'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 120 },
  { slug: 'landmine-press', name: 'Landmine Press', pattern: 'vertical-push', primary: ['front-delt'], secondary: ['chest', 'triceps'], equipment: ['barbell'], isolation: false, defaultRestSec: 90 },

  // ───────── LATERAL RAISE ─────────
  {
    slug: 'db-lateral-raise', name: 'Dumbbell Lateral Raise',
    pattern: 'lateral-raise', primary: ['side-delt'], secondary: [],
    equipment: ['dumbbell'], isolation: true, defaultRestSec: 60,
    cues: ['Lead with elbows', 'Stop at shoulder height'],
    description: 'The exercise for shoulder width. Trains the side delts in isolation — the muscle that makes shoulders pop and the waist look smaller.',
    setup: [
      'Stand or sit upright with light dumbbells',
      'Soft bend at elbows, palms facing in (or tilted slightly down at top — "pour the water")',
      'Slight forward lean (~10°)'
    ],
    execution: [
      'Lead with the ELBOWS — raise the dumbbells out and slightly forward',
      'Stop when upper arm is parallel to the floor (shoulder height)',
      'Pause briefly, then lower under control over 2–3 seconds'
    ],
    commonMistakes: [
      'Swinging the weights up with momentum — use lighter dumbbells',
      'Going above shoulder height — recruits traps, not side delts',
      'Locking elbows straight — overloads the joint, kills the delts',
      'Shrugging the shoulders up — actively depress them'
    ],
    proTip: 'Light weight, slow eccentric (3 seconds down), full ROM, no momentum. 12–20 reps. Treat it like rehab, not a strength lift.'
  },
  { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', pattern: 'lateral-raise', primary: ['side-delt'], secondary: [], equipment: ['cable'], isolation: true, defaultRestSec: 60 },
  { slug: 'machine-lateral-raise', name: 'Machine Lateral Raise', pattern: 'lateral-raise', primary: ['side-delt'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 60 },

  // ───────── TRICEP EXTENSION ─────────
  {
    slug: 'tricep-pushdown', name: 'Tricep Cable Pushdown',
    pattern: 'tricep-extension', primary: ['triceps'], secondary: [],
    equipment: ['cable'], isolation: true, defaultRestSec: 75,
    cues: ['Elbows pinned', 'Full lockout'],
    description: 'The simplest, most effective tricep isolation. Cables keep constant tension across the full range — great for finishing pump and lockout strength.',
    setup: [
      'High pulley with straight bar or rope attachment',
      'Stand close to the stack, slight forward lean (~10°)',
      'Elbows pinned to ribs throughout the entire set'
    ],
    execution: [
      'Start with elbows at 90°, attachment at chest height',
      'Push down by extending elbows ONLY — upper arms don\'t move',
      'Lock out fully, squeeze triceps at the bottom',
      'Control the return — don\'t let the stack pull the weight up'
    ],
    commonMistakes: [
      'Elbows flaring forward — turns it into a chest exercise',
      'Using body weight to push the bar down — pick lighter weight',
      'Not fully locking out — that\'s where the tricep peak contraction lives'
    ],
    proTip: 'Try a "split rope" finisher — at the bottom of every rep, pull the rope ends apart as wide as possible. Maximal tricep lockout pump.'
  },
  { slug: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', pattern: 'tricep-extension', primary: ['triceps'], secondary: [], equipment: ['dumbbell'], isolation: true, defaultRestSec: 75 },
  { slug: 'skull-crusher', name: 'EZ-Bar Skull Crusher', pattern: 'tricep-extension', primary: ['triceps'], secondary: [], equipment: ['barbell'], isolation: true, defaultRestSec: 90 },
  { slug: 'cable-overhead-extension', name: 'Cable Overhead Extension', pattern: 'tricep-extension', primary: ['triceps'], secondary: [], equipment: ['cable'], isolation: true, defaultRestSec: 75 },
  { slug: 'close-grip-bench', name: 'Close-Grip Bench Press', pattern: 'tricep-extension', primary: ['triceps'], secondary: ['chest', 'front-delt'], equipment: ['barbell'], isolation: false, defaultRestSec: 120 },

  // ───────── VERTICAL PULL ─────────
  {
    slug: 'pull-up', name: 'Pull-Up',
    pattern: 'vertical-pull', primary: ['lats', 'upper-back'], secondary: ['biceps'],
    equipment: ['bodyweight'], isolation: false, defaultRestSec: 150,
    cues: ['Drive elbows down', 'Chest to bar'],
    description: 'The ultimate vertical pull. Builds the widest, thickest lats and a powerful upper back. Bodyweight is just the starting point — load it with a belt.',
    setup: [
      'Grip slightly wider than shoulder-width, overhand grip',
      'Hang at full stretch — arms straight, shoulders depressed (NOT shrugged up)',
      'Engage core, slight hollow body position (feet in front of hips)'
    ],
    execution: [
      'Drive elbows DOWN and BACK toward the floor',
      'Pull chest to bar (not chin) — squeeze upper back at the top',
      'Lower under control until arms are fully extended',
      'Reset the shoulder packing before the next rep'
    ],
    commonMistakes: [
      'Kipping or swinging — counts as a CrossFit movement, not a strict pull-up',
      'Stopping at chin level — you miss the best part (back contraction at top)',
      'Half reps from the bottom — go to full hang or you\'re shorting yourself',
      'Pulling with arms first — lead with the lats'
    ],
    proTip: 'Imagine snapping a pencil between your shoulder blades at the top of every rep. Forces full upper-back retraction.'
  },
  { slug: 'chin-up', name: 'Chin-Up', pattern: 'vertical-pull', primary: ['lats', 'biceps'], secondary: ['upper-back'], equipment: ['bodyweight'], isolation: false, defaultRestSec: 150 },
  {
    slug: 'lat-pulldown', name: 'Lat Pulldown',
    pattern: 'vertical-pull', primary: ['lats'], secondary: ['biceps', 'upper-back'],
    equipment: ['cable'], isolation: false, defaultRestSec: 90,
    cues: ['Bar to upper chest', 'Lean back slight'],
    description: 'The pull-up substitute that scales infinitely. Best for building lat width when you can\'t hit enough volume on pull-ups yet.',
    setup: [
      'Set thigh pad to lock you in — feet flat',
      'Grip bar wider than shoulder-width, overhand',
      'Sit tall, slight (~15°) backward lean — don\'t turn it into a row'
    ],
    execution: [
      'Initiate by depressing shoulder blades (pull shoulders away from ears)',
      'Drive elbows DOWN and slightly back toward your ribs',
      'Pull bar to upper chest / collarbone',
      'Squeeze lats hard, then control bar back up to full stretch'
    ],
    commonMistakes: [
      'Leaning back to 45° — that\'s a seated cable row, not a pulldown',
      'Pulling with biceps — focus on elbows, not hands',
      'Behind-the-neck pulldowns — high shoulder injury risk for almost no extra benefit'
    ],
    proTip: 'Try a single-arm version with a D-handle. Each arm works independently — exposes and fixes left/right imbalances.'
  },
  { slug: 'machine-pulldown', name: 'Machine Pulldown', pattern: 'vertical-pull', primary: ['lats'], secondary: ['biceps'], equipment: ['machine'], isolation: false, defaultRestSec: 90 },
  { slug: 'assisted-pull-up', name: 'Assisted Pull-Up', pattern: 'vertical-pull', primary: ['lats'], secondary: ['biceps'], equipment: ['machine'], isolation: false, defaultRestSec: 120 },

  // ───────── HORIZONTAL PULL ─────────
  {
    slug: 'barbell-row', name: 'Bent-Over Barbell Row',
    pattern: 'horizontal-pull', primary: ['upper-back', 'lats'], secondary: ['biceps', 'rear-delt'],
    equipment: ['barbell'], isolation: false, defaultRestSec: 150,
    cues: ['Torso parallel', 'Pull to lower ribs'],
    description: 'The standard for building back thickness. Trains the entire posterior chain to hold position while the upper back does the work.',
    setup: [
      'Deadlift the bar to standing first',
      'Feet hip-width, knees slightly bent',
      'Hinge at hips until torso is ~15–45° above horizontal',
      'Grip overhand, just outside shoulder-width',
      'Bar hangs at mid-shin, lats engaged'
    ],
    execution: [
      'Brace core, hold the torso angle locked',
      'Pull bar toward lower ribs / belly button',
      'Drive elbows BACK, not out — squeeze shoulder blades together',
      'Lower under control without losing torso position'
    ],
    commonMistakes: [
      'Standing up with the bar to "row" — turns it into a half-deadlift',
      'Pulling to the chest with elbows flared — hits rear delts but loses lats',
      'Bouncing the weight — use the muscles you came to train',
      'Rounding the lower back under load — lighten up and re-anchor your hips'
    ],
    proTip: 'Pendlay variation: start each rep from a dead stop on the floor. Eliminates momentum and forces explosive concentric strength.'
  },
  { slug: 'single-arm-db-row', name: 'Single-Arm Dumbbell Row', pattern: 'horizontal-pull', primary: ['lats', 'upper-back'], secondary: ['biceps'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 90 },
  { slug: 'bent-over-db-row', name: 'Bent-Over Dumbbell Row', pattern: 'horizontal-pull', primary: ['upper-back', 'lats'], secondary: ['biceps'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 120 },
  { slug: 'seated-cable-row', name: 'Seated Cable Row', pattern: 'horizontal-pull', primary: ['upper-back'], secondary: ['lats', 'biceps'], equipment: ['cable'], isolation: false, defaultRestSec: 90, cues: ['Chest up', 'Squeeze shoulder blades'] },
  { slug: 't-bar-row', name: 'T-Bar Row', pattern: 'horizontal-pull', primary: ['upper-back', 'lats'], secondary: ['biceps'], equipment: ['barbell'], isolation: false, defaultRestSec: 120 },
  { slug: 'chest-supported-row', name: 'Chest-Supported Row', pattern: 'horizontal-pull', primary: ['upper-back'], secondary: ['lats', 'biceps'], equipment: ['machine'], isolation: false, defaultRestSec: 90 },
  { slug: 'machine-row', name: 'Machine Row', pattern: 'horizontal-pull', primary: ['upper-back'], secondary: ['lats', 'biceps'], equipment: ['machine'], isolation: false, defaultRestSec: 90 },

  // ───────── OLYMPIC / EXPLOSIVE ─────────
  { slug: 'power-clean', name: 'Power Clean', pattern: 'hip-hinge', primary: ['hamstrings', 'glutes', 'traps'], secondary: ['quads', 'lower-back'], equipment: ['barbell'], isolation: false, defaultRestSec: 180, cues: ['Sweep the bar', 'Triple extension', 'Catch above parallel'] },
  { slug: 'push-press', name: 'Push Press', pattern: 'vertical-push', primary: ['front-delt'], secondary: ['triceps', 'quads'], equipment: ['barbell'], isolation: false, defaultRestSec: 150, cues: ['Quarter dip', 'Drive through legs', 'Lock out overhead'] },

  // ───────── HIP HINGE / DEADLIFT ─────────
  {
    slug: 'conventional-deadlift', name: 'Conventional Deadlift',
    pattern: 'hip-hinge', primary: ['hamstrings', 'glutes', 'lower-back'], secondary: ['lats', 'traps'],
    equipment: ['barbell'], isolation: false, defaultRestSec: 240,
    cues: ['Bar over mid-foot', 'Wedge into bar', 'Push the floor away'],
    description: 'The truest test of full-body strength — picks up the most weight of any lift. Builds traps, lats, hamstrings, glutes, and a bulletproof back.',
    setup: [
      'Bar over middle of feet (laces) — should almost touch shins',
      'Feet hip-width, toes slightly out',
      'Bend at hips, grip bar just outside legs (mixed or hook grip for heavy)',
      'Hips down, chest up, lats squeezed (think: armpits over the bar)',
      'Bar should pull against your shins'
    ],
    execution: [
      'Take a huge breath into your belly, brace HARD',
      'Push the floor away with your legs first — bar stays glued to legs',
      'Once bar passes knees, drive hips through to stand tall',
      'Lockout: glutes squeezed, bar against thighs — do NOT hyperextend',
      'Reverse the motion: hips back first, then bend knees once bar clears knees'
    ],
    commonMistakes: [
      'Bar drifts away from body — you lose 20%+ of your strength instantly',
      'Hips shoot up first — turns it into a stiff-leg with horrible leverage',
      'Rounded lower back under load — main injury risk; lighten the bar',
      'Hyperextending at the top — adds nothing, stresses the spine'
    ],
    proTip: 'Before you pull, pull the slack out of the bar. Tighten your grip and rotate elbow pits forward until you hear the plates "click" against the collars — then pull.'
  },
  { slug: 'sumo-deadlift', name: 'Sumo Deadlift', pattern: 'hip-hinge', primary: ['glutes', 'quads'], secondary: ['hamstrings', 'lower-back'], equipment: ['barbell'], isolation: false, defaultRestSec: 240, cues: ['Wide stance', 'Knees track over toes'] },
  {
    slug: 'romanian-deadlift', name: 'Romanian Deadlift',
    pattern: 'hip-hinge', primary: ['hamstrings', 'glutes'], secondary: ['lower-back'],
    equipment: ['barbell'], isolation: false, defaultRestSec: 150,
    cues: ['Soft knees', 'Push hips back', 'Bar slides down thighs'],
    description: 'The single best hamstring builder. Trains the hip hinge pattern under heavy load with a long eccentric — pure size and posterior-chain strength.',
    setup: [
      'Start standing tall with the bar at hip level (unrack or deadlift it up)',
      'Feet hip-width, soft bend in the knees (~15°) — keep them there',
      'Squeeze bar against thighs, lats engaged'
    ],
    execution: [
      'Push hips back as if closing a car door with your butt',
      'Bar slides DOWN the thighs and over the knees',
      'Stop when you feel a deep stretch in the hamstrings (usually mid-shin)',
      'Drive hips forward to return — squeeze glutes hard at the top'
    ],
    commonMistakes: [
      'Bending the knees through the rep — that\'s a deadlift, not an RDL',
      'Letting the bar drift forward — saw it travels straight down',
      'Going too low and rounding the back — stop where the hamstrings stop you'
    ],
    proTip: 'Pretend you have an orange between your hands and you have to squeeze the juice out. Keeps lats engaged and bar tight to body.'
  },
  { slug: 'db-romanian-deadlift', name: 'Dumbbell Romanian Deadlift', pattern: 'hip-hinge', primary: ['hamstrings', 'glutes'], secondary: [], equipment: ['dumbbell'], isolation: false, defaultRestSec: 120 },
  { slug: 'trap-bar-deadlift', name: 'Trap-Bar Deadlift', pattern: 'hip-hinge', primary: ['glutes', 'quads', 'hamstrings'], secondary: ['lower-back'], equipment: ['barbell'], isolation: false, defaultRestSec: 180 },
  { slug: 'good-morning', name: 'Good Morning', pattern: 'hip-hinge', primary: ['hamstrings', 'lower-back'], secondary: ['glutes'], equipment: ['barbell'], isolation: false, defaultRestSec: 120 },
  { slug: 'hyperextension', name: 'Back Extension', pattern: 'hip-hinge', primary: ['lower-back', 'glutes'], secondary: ['hamstrings'], equipment: ['bodyweight'], isolation: false, defaultRestSec: 75 },

  // ───────── BICEP CURL ─────────
  {
    slug: 'db-bicep-curl', name: 'Dumbbell Bicep Curl',
    pattern: 'bicep-curl', primary: ['biceps'], secondary: ['forearms'],
    equipment: ['dumbbell'], isolation: true, defaultRestSec: 60,
    cues: ['No body english', 'Squeeze at top'],
    description: 'Classic bicep builder. Free range of motion lets each arm move independently and allows full supination (palm turn) at the top.',
    setup: [
      'Stand tall, dumbbells at sides, palms facing thighs',
      'Elbows pinned to ribs',
      'Brace core, no momentum'
    ],
    execution: [
      'Curl one or both dumbbells up — rotate palm to face up as you go',
      'Squeeze biceps HARD at the top, no rest at lockout',
      'Lower under control over 2 seconds, full elbow extension at bottom'
    ],
    commonMistakes: [
      'Swinging the weight — lighten the load and earn the reps',
      'Elbows drifting forward — turns into a front raise',
      'Not fully extending at the bottom — you skip the longest part of the muscle',
      'Forgetting to supinate — you lose the bicep peak contraction'
    ],
    proTip: 'Try a "21" set: 7 partial reps bottom-to-middle, 7 middle-to-top, 7 full reps. Cooks the biceps from every angle.'
  },
  { slug: 'hammer-curl', name: 'Hammer Curl', pattern: 'bicep-curl', primary: ['biceps', 'forearms'], secondary: [], equipment: ['dumbbell'], isolation: true, defaultRestSec: 60 },
  { slug: 'incline-db-curl', name: 'Incline Dumbbell Curl', pattern: 'bicep-curl', primary: ['biceps'], secondary: [], equipment: ['dumbbell'], isolation: true, defaultRestSec: 75, cues: ['Full stretch', '45° bench'] },
  { slug: 'preacher-curl', name: 'Preacher Curl', pattern: 'bicep-curl', primary: ['biceps'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 60 },
  { slug: 'cable-bicep-curl', name: 'Cable Bicep Curl', pattern: 'bicep-curl', primary: ['biceps'], secondary: [], equipment: ['cable'], isolation: true, defaultRestSec: 60 },
  { slug: 'ez-bar-curl', name: 'EZ-Bar Curl', pattern: 'bicep-curl', primary: ['biceps'], secondary: ['forearms'], equipment: ['barbell'], isolation: true, defaultRestSec: 75 },
  { slug: 'spider-curl', name: 'Spider Curl', pattern: 'bicep-curl', primary: ['biceps'], secondary: [], equipment: ['dumbbell'], isolation: true, defaultRestSec: 60 },

  // ───────── REAR-DELT FLY ─────────
  {
    slug: 'face-pull', name: 'Face Pull',
    pattern: 'rear-delt-fly', primary: ['rear-delt'], secondary: ['upper-back'],
    equipment: ['cable'], isolation: true, defaultRestSec: 60,
    cues: ['Elbows high', 'Pull to forehead'],
    description: 'The shoulder-saver. Builds rear delts and rotator cuff — single best prehab/posture exercise for anyone who benches.',
    setup: [
      'Cable at upper-chest height, rope attachment',
      'Step back so cable has tension at full reach',
      'Grip rope with thumbs pointing back (palms facing each other)'
    ],
    execution: [
      'Pull rope toward your FACE, hands going to either side of your ears',
      'Elbows stay HIGH and OUT (same height as wrists)',
      'Squeeze rear delts and rhomboids at the end position',
      'Slowly return to start, fully stretched'
    ],
    commonMistakes: [
      'Pulling to chest — turns it into a row, kills rear delt isolation',
      'Elbows dropping — recruits lats, misses the rear delts',
      'Going too heavy — your shoulders will internally rotate. Use lighter weight + perfect form'
    ],
    proTip: 'Do 2–4 sets of 15–20 reps at the end of EVERY upper-body session. It will save your shoulders for life.'
  },
  { slug: 'rear-delt-fly-db', name: 'Rear Delt Fly (Dumbbell)', pattern: 'rear-delt-fly', primary: ['rear-delt'], secondary: ['upper-back'], equipment: ['dumbbell'], isolation: true, defaultRestSec: 60 },
  { slug: 'rear-delt-machine', name: 'Rear Delt Machine', pattern: 'rear-delt-fly', primary: ['rear-delt'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 60 },
  { slug: 'cable-pullover', name: 'Cable Pullover', pattern: 'horizontal-pull', primary: ['lats'], secondary: ['triceps'], equipment: ['cable'], isolation: true, defaultRestSec: 75, cues: ['Slight elbow bend', 'Pull with lats'] },

  // ───────── KNEE DOMINANT ─────────
  {
    slug: 'back-squat', name: 'Barbell Back Squat',
    pattern: 'knee-dominant', primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lower-back'],
    equipment: ['barbell'], isolation: false, defaultRestSec: 240,
    cues: ['Brace 360°', 'Knees track toes', 'Below parallel'],
    description: 'The king of all lifts. Builds total-body strength, quad mass, glute size and core integrity like nothing else.',
    setup: [
      'Bar at upper-chest height in rack',
      'Get under bar — bar sits on upper traps (high bar) or rear delts (low bar)',
      'Grip just outside shoulder-width, squeeze bar to lock upper back tight',
      'Unrack with both feet under hips, walk back in 2–3 steps',
      'Feet shoulder-width, toes ~20° out'
    ],
    execution: [
      'Big breath, brace 360° around your spine',
      'Sit back AND down — break at knees and hips together',
      'Descend until hip crease is below the top of the knee',
      'Drive feet through the floor — chest up, knees out, exhale at lockout'
    ],
    commonMistakes: [
      'Knees caving in (valgus collapse) — push them outward through the rep',
      'Heels lifting — sit back more, work on ankle mobility, or use lifters',
      'Forward "good morning" out of the hole — keep chest up, drive hips and chest as one',
      'High squats — half reps lie to you. Get to depth or reduce weight'
    ],
    proTip: 'Spread the floor — actively push your feet apart as you descend. Lights up glutes and stops knees caving.'
  },
  { slug: 'front-squat', name: 'Front Squat', pattern: 'knee-dominant', primary: ['quads'], secondary: ['glutes', 'upper-back'], equipment: ['barbell'], isolation: false, defaultRestSec: 240, cues: ['Elbows high', 'Upright torso'] },
  {
    slug: 'leg-press', name: 'Leg Press',
    pattern: 'knee-dominant', primary: ['quads', 'glutes'], secondary: ['hamstrings'],
    equipment: ['machine'], isolation: false, defaultRestSec: 150,
    description: 'High-volume quad and glute builder without spinal loading. Lets you push huge weight safely — great for hypertrophy and as a squat backup.',
    setup: [
      'Sit deep in the seat with lower back FLAT against the pad',
      'Feet shoulder-width on the platform, mid-foot pressing through',
      'Foot position controls emphasis: lower = quads, higher = glutes/hams'
    ],
    execution: [
      'Unrack the safeties, brace core',
      'Lower the sled until knees are at ~90° (or knees track toward chest)',
      'Stop just before your lower back rounds off the pad',
      'Drive through mid-foot — don\'t fully lock the knees at the top'
    ],
    commonMistakes: [
      'Lower back rounding (butt-wink) at the bottom — short the ROM or lighter weight',
      'Locking knees out at the top — pops the spine, ends careers',
      'Knees caving in — push knees out, same as squats',
      'Bouncing the weight off the safeties to "rep"'
    ],
    proTip: 'Try 1.5 reps: full rep, then half rep from the bottom, that = 1. Brutal quad pump with the same weight.'
  },
  { slug: 'hack-squat', name: 'Hack Squat Machine', pattern: 'knee-dominant', primary: ['quads'], secondary: ['glutes'], equipment: ['machine'], isolation: false, defaultRestSec: 150 },
  { slug: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', pattern: 'knee-dominant', primary: ['quads', 'glutes'], secondary: ['hamstrings'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 90 },
  { slug: 'pendulum-squat', name: 'Pendulum Squat', pattern: 'knee-dominant', primary: ['quads'], secondary: ['glutes'], equipment: ['machine'], isolation: false, defaultRestSec: 150 },
  { slug: 'smith-squat', name: 'Smith Squat', pattern: 'knee-dominant', primary: ['quads', 'glutes'], secondary: [], equipment: ['smith'], isolation: false, defaultRestSec: 150 },

  // ───────── LUNGE ─────────
  { slug: 'walking-lunge', name: 'Walking Lunge', pattern: 'lunge', primary: ['quads', 'glutes'], secondary: ['hamstrings'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 120 },
  { slug: 'reverse-lunge', name: 'Reverse Lunge', pattern: 'lunge', primary: ['glutes', 'quads'], secondary: ['hamstrings'], equipment: ['dumbbell'], isolation: false, defaultRestSec: 90 },
  { slug: 'step-up', name: 'Dumbbell Step-Up', pattern: 'lunge', primary: ['quads', 'glutes'], secondary: [], equipment: ['dumbbell'], isolation: false, defaultRestSec: 90 },

  // ───────── HAMSTRING CURL ─────────
  { slug: 'lying-leg-curl', name: 'Lying Leg Curl', pattern: 'hip-hinge', primary: ['hamstrings'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 75, cues: ['Heels to glutes'] },
  { slug: 'seated-leg-curl', name: 'Seated Leg Curl', pattern: 'hip-hinge', primary: ['hamstrings'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 75 },
  { slug: 'nordic-curl', name: 'Nordic Hamstring Curl', pattern: 'hip-hinge', primary: ['hamstrings'], secondary: [], equipment: ['bodyweight'], isolation: true, defaultRestSec: 90 },

  // ───────── QUAD EXTENSION ─────────
  { slug: 'leg-extension', name: 'Leg Extension', pattern: 'knee-dominant', primary: ['quads'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 75 },

  // ───────── GLUTE ─────────
  {
    slug: 'hip-thrust', name: 'Hip Thrust',
    pattern: 'hip-hinge', primary: ['glutes'], secondary: ['hamstrings'],
    equipment: ['barbell'], isolation: false, defaultRestSec: 120,
    cues: ['Chin tucked', 'Squeeze glutes at top'],
    description: 'The single best glute-builder ever programmed. Trains hip extension under heavy load with the glutes at their strongest mechanical position.',
    setup: [
      'Sit on floor with upper back against a bench (just under shoulder blades)',
      'Roll loaded barbell over your hips — use a thick pad or Airex',
      'Feet flat, shins vertical at the top position (so adjust foot distance)',
      'Hands on bar for stability'
    ],
    execution: [
      'Tuck chin slightly, brace core',
      'Drive HIPS UP through your heels — knees track over toes',
      'At top: thighs parallel to floor, full glute squeeze, ribs down (don\'t arch)',
      'Lower under control, hips just kiss the floor before the next rep'
    ],
    commonMistakes: [
      'Hyperextending the lower back instead of squeezing glutes',
      'Feet too close — turns it into a quad exercise',
      'Feet too far — loses tension at the top',
      'Not getting full hip extension — leaves the best part on the table'
    ],
    proTip: 'Pause for 2 full seconds at lockout on every rep, squeezing glutes as hard as possible. Beats heavier weight every time for hypertrophy.'
  },
  { slug: 'glute-kickback', name: 'Glute Kickback Machine', pattern: 'hip-hinge', primary: ['glutes'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 60 },
  { slug: 'cable-pull-through', name: 'Cable Pull-Through', pattern: 'hip-hinge', primary: ['glutes', 'hamstrings'], secondary: [], equipment: ['cable'], isolation: false, defaultRestSec: 75 },

  // ───────── CALF ─────────
  { slug: 'standing-calf-raise', name: 'Standing Calf Raise', pattern: 'calf-raise', primary: ['calves'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 60, cues: ['Full stretch at bottom', 'Pause at top'] },
  { slug: 'seated-calf-raise', name: 'Seated Calf Raise', pattern: 'calf-raise', primary: ['calves'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 60 },
  { slug: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', pattern: 'calf-raise', primary: ['calves'], secondary: [], equipment: ['machine'], isolation: true, defaultRestSec: 60 },

  // ───────── CORE ─────────
  {
    slug: 'hanging-knee-raise', name: 'Hanging Knee Raise',
    pattern: 'core', primary: ['abs'], secondary: ['obliques'],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 60,
    cues: ['No swing', 'Pull knees to chest'],
    description: 'Entry-level hanging core movement. Builds grip, lat tension, and lower abs.',
    setup: ['Dead hang from a pull-up bar, hands shoulder-width', 'Engage lats — pull shoulders down away from ears'],
    execution: ['Pull knees up to chest by tilting pelvis under', 'Pause at the top, control the descent over 2–3 seconds'],
    commonMistakes: ['Swinging the body for momentum', 'Only raising the knees (no pelvic tilt) — abs don\'t fire'],
    proTip: 'Curl your pelvis under like you\'re trying to touch your hips to your chest, not knees to ceiling. That\'s where the abs work.'
  },
  {
    slug: 'hanging-leg-raise', name: 'Hanging Leg Raise',
    pattern: 'core', primary: ['abs'], secondary: ['obliques'],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 75,
    description: 'The hardcore version of the knee raise. Straight-leg version that demands serious lower-ab and hip-flexor strength.',
    setup: ['Dead hang, lats engaged, shoulders packed'],
    execution: ['Keep legs straight, raise them to parallel (or higher)', 'Tilt pelvis at the top — touch toes to the bar if you can', 'Lower under control'],
    commonMistakes: ['Bending knees on the way up — you\'re doing knee raises again', 'Rocking — start a few small swings before each rep to test'],
    proTip: 'Master the L-sit hold first — 10s straight-leg hold at parallel. The raise will feel easy after.'
  },
  {
    slug: 'toes-to-bar', name: 'Toes to Bar',
    pattern: 'core', primary: ['abs'], secondary: ['lats', 'obliques'],
    equipment: ['bodyweight'], isolation: false, defaultRestSec: 90,
    description: 'Hanging full-range ab movement. Touch your toes to the pull-up bar each rep — brutal lower abs and hip flexor builder.',
    proTip: 'Initiate by pulling DOWN on the bar with your lats — converts the hang into a rigid lever. Reps fly up faster.'
  },
  {
    slug: 'cable-crunch', name: 'Cable Crunch',
    pattern: 'core', primary: ['abs'], secondary: [],
    equipment: ['cable'], isolation: true, defaultRestSec: 60,
    cues: ['Crunch from upper abs', 'Hips stay back'],
    description: 'The ab equivalent of bicep curls — load it heavy, hit it for 8–15 reps. Best for upper-ab development.',
    setup: ['High pulley with rope', 'Kneel facing the stack, rope held against forehead or behind neck', 'Sit back so hips are over heels'],
    execution: ['Crunch ribs toward hips — bring elbows toward thighs', 'Squeeze abs hard at the bottom', 'Slowly return to full extension'],
    commonMistakes: ['Bowing at the hips — that\'s a hip flexor exercise', 'Pulling with arms — keep them locked, abs do the work'],
    proTip: 'Pause for 2 seconds at peak contraction. Treat it like the world\'s most painful crunch.'
  },
  {
    slug: 'plank', name: 'Plank',
    pattern: 'core', primary: ['abs'], secondary: ['obliques'],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 45,
    description: 'Isometric anti-extension hold. Builds core stability — foundation of every other lift.',
    setup: ['Forearms on floor, elbows under shoulders', 'Feet hip-width, body in a straight line'],
    execution: ['Brace abs HARD, squeeze glutes, tuck pelvis under', 'Push the floor away with elbows', 'Hold for time — quality over duration'],
    commonMistakes: ['Hips sagging — drops most of the load off your abs', 'Hips high in the air — turns it into a rest position', 'Holding for minutes — drop to 20–40s of perfect form instead'],
    proTip: 'If you can hold a perfect plank for 30 seconds, switch to weighted variations (plate on back) or harder variants (RKC plank, long-arm plank). Don\'t chase 5-minute planks — quality first.'
  },
  {
    slug: 'side-plank', name: 'Side Plank',
    pattern: 'core', primary: ['obliques'], secondary: ['abs'],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 45,
    description: 'Anti-lateral flexion hold — builds oblique strength and bulletproofs the QL and lower back.',
    proTip: 'Stack feet, hips high, top arm reaching for the ceiling. Hold 20–45s each side.'
  },
  {
    slug: 'ab-wheel', name: 'Ab Wheel Rollout',
    pattern: 'core', primary: ['abs'], secondary: ['lats'],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 75,
    description: 'The hardest core exercise that exists. Trains anti-extension under enormous lever arm. Build up slowly.',
    setup: ['Knees on a pad, ab wheel under shoulders', 'Brace abs hard, ribs locked DOWN'],
    execution: ['Roll wheel forward slowly, keeping a SLIGHT round in upper back', 'Stop before your lower back arches', 'Pull yourself back using the abs — not the lats'],
    commonMistakes: ['Lower back arching at full extension — that\'s where injuries happen', 'Going too far too soon — use a wall to set safe range first'],
    proTip: 'Start with wall rollouts — face a wall, roll until you touch it. Move 1 foot back per week as you get stronger. Builds the rollout the safe way.'
  },
  {
    slug: 'crunch', name: 'Floor Crunch',
    pattern: 'core', primary: ['abs'], secondary: [],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 30,
    description: 'Basic upper-ab isolation — short range, high reps, used as a finisher.',
    proTip: 'Slow tempo — 2 sec up, 2 sec hold, 2 sec down. Forget chasing rep counts.'
  },
  {
    slug: 'sit-up', name: 'Sit-Up',
    pattern: 'core', primary: ['abs'], secondary: ['hip-flexor' as any],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 30
  },
  {
    slug: 'decline-sit-up', name: 'Decline Sit-Up',
    pattern: 'core', primary: ['abs'], secondary: [],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 60,
    description: 'Sit-up on a decline bench — gravity-loaded for full-range ab work. Can be weighted with a plate held to chest.'
  },
  {
    slug: 'bicycle-crunch', name: 'Bicycle Crunch',
    pattern: 'core', primary: ['abs', 'obliques'], secondary: [],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 45,
    description: 'Rotational crunch — hits upper abs and obliques simultaneously.',
    proTip: 'Slow it down. Touch elbow to opposite knee. Pause for a count at each rotation. That\'s 1 rep, not 20.'
  },
  {
    slug: 'russian-twist', name: 'Russian Twist',
    pattern: 'core', primary: ['obliques'], secondary: ['abs'],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 45,
    description: 'Seated rotational core. Hold a plate, kettlebell, or dumbbell across chest. Rotate fully each rep.',
    proTip: 'Lean back to ~45°. Touch the weight to the floor on each side, fully — no half-rotations.'
  },
  {
    slug: 'dead-bug', name: 'Dead Bug',
    pattern: 'core', primary: ['abs'], secondary: [],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 30,
    description: 'Anti-extension stability — the safest, most underrated core exercise. Bulletproofs the lower back.',
    setup: ['Lie on back, arms straight up, knees bent at 90°', 'Lower back PRESSED into floor'],
    execution: ['Lower opposite arm and leg slowly to just above the floor', 'Keep lower back glued to floor the entire time', 'Return to start, alternate sides'],
    commonMistakes: ['Lower back arching off the floor — slow down or shorten the range', 'Holding breath — exhale forcefully on extension'],
    proTip: 'Exhale hard on every extension. Should feel rib cage pulling DOWN — that\'s the anterior core firing.'
  },
  {
    slug: 'bird-dog', name: 'Bird Dog',
    pattern: 'core', primary: ['lower-back', 'abs'], secondary: ['glutes'],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 30,
    description: 'Anti-rotation stability on all fours. Excellent for lower-back health and core endurance.',
    proTip: 'Extend opposite arm and leg, hold for a 3-count at the top. Don\'t let hips rotate. Slow is better than reps.'
  },
  {
    slug: 'hollow-hold', name: 'Hollow Body Hold',
    pattern: 'core', primary: ['abs'], secondary: ['hip-flexor' as any],
    equipment: ['bodyweight'], isolation: true, defaultRestSec: 60,
    description: 'Gymnastics fundamental. Total-body abdominal isometric — feels easy until it isn\'t.',
    proTip: 'Lower back PRESSED into floor. Shoulders and feet off the floor. Hold for 20–45s. If your back arches, bring knees in until it doesn\'t.'
  },
  {
    slug: 'pallof-press', name: 'Pallof Press',
    pattern: 'core', primary: ['obliques', 'abs'], secondary: [],
    equipment: ['cable'], isolation: true, defaultRestSec: 45,
    description: 'Anti-rotation cable press — the gold standard for functional core strength. Trains the core to RESIST twisting.',
    setup: ['Cable at chest height, stand sideways to the stack', 'Hold handle with both hands at sternum'],
    execution: ['Press handle straight out from chest', 'Resist the cable\'s pull to rotate you toward the stack', 'Hold extension for 2 seconds, return to chest under control'],
    commonMistakes: ['Letting the torso rotate — that defeats the entire point', 'Going too heavy — pick weight you can resist with rigid form'],
    proTip: 'Press 3 ways: out and back, then add a small overhead press at the end of each rep, then add a 5-second hold at full extension. Multiplies the difficulty without changing the weight.'
  },
  {
    slug: 'mountain-climber', name: 'Mountain Climber',
    pattern: 'core', primary: ['abs'], secondary: ['obliques', 'quads'],
    equipment: ['bodyweight'], isolation: false, defaultRestSec: 45,
    description: 'Dynamic plank with alternating knee drives. Builds endurance and conditioning while training the core.'
  },

  // ───────── CARDIO ─────────
  {
    slug: 'treadmill', name: 'Treadmill',
    pattern: 'cardio', primary: ['quads', 'calves'], secondary: ['glutes', 'hamstrings'],
    equipment: ['machine'], isolation: false, defaultRestSec: 0,
    description: 'Steady-state or interval cardio. Perfect 5–10 min warmup before lifting or a 20–40 min Zone-2 finisher.',
    proTip: 'For a warmup: start at 5 km/h walk, ramp to easy jog. For Zone-2: keep heart rate at 60–70% max — nose breathing only.'
  },
  {
    slug: 'stationary-bike', name: 'Stationary Bike',
    pattern: 'cardio', primary: ['quads'], secondary: ['glutes', 'hamstrings', 'calves'],
    equipment: ['machine'], isolation: false, defaultRestSec: 0,
    description: 'Joint-friendly cardio. Excellent low-impact warmup for leg day and a great Zone-2 option.',
    proTip: 'Set the seat so your knee has a slight 5–10° bend at full leg extension. Saves the knees.'
  },
  {
    slug: 'rowing-machine', name: 'Rowing Erg',
    pattern: 'cardio', primary: ['lats', 'upper-back', 'quads'], secondary: ['glutes', 'hamstrings', 'biceps'],
    equipment: ['machine'], isolation: false, defaultRestSec: 0,
    description: 'Full-body cardio — drives heart rate hard while strengthening posterior chain and grip. Perfect post-lift conditioning.',
    proTip: 'Drive sequence: legs → back → arms. Reverse on the return: arms → back → legs. 60% of the power comes from the legs.'
  },
  {
    slug: 'elliptical', name: 'Elliptical',
    pattern: 'cardio', primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'],
    equipment: ['machine'], isolation: false, defaultRestSec: 0,
    description: 'Low-impact cardio that uses arms too — great for active recovery days.'
  },
  {
    slug: 'stair-master', name: 'StairMaster',
    pattern: 'cardio', primary: ['glutes', 'quads'], secondary: ['calves', 'hamstrings'],
    equipment: ['machine'], isolation: false, defaultRestSec: 0,
    description: 'Glute-and-leg torture in cardio form. Brutal but effective — burns serious calories.',
    proTip: 'Don\'t lean on the handrails. If you have to, slow the machine down.'
  },
  {
    slug: 'jump-rope', name: 'Jump Rope',
    pattern: 'cardio', primary: ['calves'], secondary: ['quads', 'side-delt'],
    equipment: ['bodyweight'], isolation: false, defaultRestSec: 30,
    description: 'High-intensity, low-equipment cardio. Excellent for ankle stiffness, coordination and warming up.'
  },
  {
    slug: 'outdoor-run', name: 'Outdoor Run',
    pattern: 'cardio', primary: ['quads', 'calves'], secondary: ['glutes', 'hamstrings'],
    equipment: ['bodyweight'], isolation: false, defaultRestSec: 0,
    description: 'Free, effective, hits everything. Log distance and time to track Zone-2 base building.'
  },
  {
    slug: 'outdoor-walk', name: 'Walking',
    pattern: 'cardio', primary: ['quads'], secondary: ['glutes', 'calves'],
    equipment: ['bodyweight'], isolation: false, defaultRestSec: 0,
    description: 'The most underrated tool. 30–60 min walks daily are pure fat-loss and recovery fuel.'
  }
];

export function findSwaps(slug: string, all: Exercise[]): Exercise[] {
  const current = all.find(e => e.slug === slug);
  if (!current) return [];
  return all
    .filter(e => e.slug !== slug && e.pattern === current.pattern)
    .sort((a, b) => {
      const overlapA = a.primary.filter(m => current.primary.includes(m)).length;
      const overlapB = b.primary.filter(m => current.primary.includes(m)).length;
      return overlapB - overlapA;
    });
}
