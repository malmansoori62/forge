import type { Exercise, WorkingSet, Session } from './types';
import { e1RM } from './utils';

export interface CoachFeedback {
  level: 'good' | 'warn' | 'info' | 'pr';
  text: string;
}

export interface SessionAnalysis {
  durationSec: number;
  workingSets: number;
  warmupSets: number;
  totalVolume: number;
  topE1RM: number;
  prCount: number;
  prDetails: { exercise: string; weight: number; reps: number; unit: 'kg' | 'lb' }[];
  avgRestSec: number;
  feedback: CoachFeedback[];
  recovery: { icon: string; title: string; detail: string }[];
}

interface AnalysisInput {
  session: Session;
  sets: WorkingSet[];
  exercises: Map<string, Exercise>;
  /** All sets the user has ever logged for the relevant exercises — used to compare vs previous session. */
  historicalSets: Map<string, WorkingSet[]>;
}

/** Build the post-workout summary. Pure data → no side effects. */
export function analyzeSession({ session, sets, exercises, historicalSets }: AnalysisInput): SessionAnalysis {
  const working = sets.filter(s => !s.isWarmup);
  const warmups = sets.filter(s => s.isWarmup);
  const durationSec = session.endedAt
    ? Math.max(0, Math.floor((session.endedAt - session.startedAt) / 1000))
    : Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000));

  const totalVolume = working.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const topE1RM = working.reduce((m, s) => Math.max(m, e1RM(s.weight, s.reps)), 0);
  const prSets = working.filter(s => s.isPR);
  const prDetails = prSets.map(s => ({
    exercise: exercises.get(s.exerciseSlug)?.name ?? s.exerciseSlug,
    weight: s.weight,
    reps: s.reps,
    unit: (s.unit ?? 'kg') as 'kg' | 'lb'
  }));

  // Average rest between consecutive working sets in the same session
  const restGaps: number[] = [];
  const sorted = [...working].sort((a, b) => a.loggedAt - b.loggedAt);
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.floor((sorted[i].loggedAt - sorted[i - 1].loggedAt) / 1000);
    if (gap > 15 && gap < 900) restGaps.push(gap); // ignore micro and huge gaps
  }
  const avgRestSec = restGaps.length > 0
    ? Math.round(restGaps.reduce((a, b) => a + b, 0) / restGaps.length)
    : 0;

  const feedback = buildFeedback({
    working, warmups, durationSec, totalVolume, prDetails, avgRestSec, exercises, historicalSets, session
  });

  const recovery = buildRecovery();

  return {
    durationSec,
    workingSets: working.length,
    warmupSets: warmups.length,
    totalVolume,
    topE1RM,
    prCount: prSets.length,
    prDetails,
    avgRestSec,
    feedback,
    recovery
  };
}

function buildFeedback(args: {
  working: WorkingSet[];
  warmups: WorkingSet[];
  durationSec: number;
  totalVolume: number;
  prDetails: SessionAnalysis['prDetails'];
  avgRestSec: number;
  exercises: Map<string, Exercise>;
  historicalSets: Map<string, WorkingSet[]>;
  session: Session;
}): CoachFeedback[] {
  const out: CoachFeedback[] = [];

  // 1. PR celebration first
  if (args.prDetails.length > 0) {
    const first = args.prDetails[0];
    out.push({
      level: 'pr',
      text: args.prDetails.length === 1
        ? `New PR on ${first.exercise}: ${first.weight}${first.unit} × ${first.reps}. Eat, sleep, repeat — that\'s how it grows.`
        : `${args.prDetails.length} PRs today — momentum is real. Top hit: ${first.exercise} ${first.weight}${first.unit} × ${first.reps}.`
    });
  }

  // 2. Per-exercise progression vs last session
  const byExercise = new Map<string, WorkingSet[]>();
  for (const s of args.working) {
    const arr = byExercise.get(s.exerciseSlug) ?? [];
    arr.push(s);
    byExercise.set(s.exerciseSlug, arr);
  }

  let progressionInsights = 0;
  for (const [slug, todays] of byExercise) {
    if (progressionInsights >= 3) break;
    const ex = args.exercises.get(slug);
    if (!ex || ex.pattern === 'cardio') continue;

    const todayTop = todays.reduce((m, s) => (s.weight > m.weight ? s : m), todays[0]);
    const history = (args.historicalSets.get(slug) ?? [])
      .filter(s => s.sessionId !== args.session.id && !s.isWarmup);
    if (history.length === 0) continue;

    // Find previous session
    const prevSessionId = history.sort((a, b) => b.loggedAt - a.loggedAt)[0].sessionId;
    const prevSets = history.filter(s => s.sessionId === prevSessionId);
    if (prevSets.length === 0) continue;
    const prevTop = prevSets.reduce((m, s) => (s.weight > m.weight ? s : m), prevSets[0]);

    const unit = todayTop.unit ?? 'kg';
    if (todayTop.weight > prevTop.weight) {
      out.push({
        level: 'good',
        text: `${ex.name}: ${todayTop.weight}${unit} × ${todayTop.reps} → up ${(todayTop.weight - prevTop.weight).toFixed(1)}${unit} from last time. Progressive overload working.`
      });
      progressionInsights++;
    } else if (todayTop.weight === prevTop.weight && todayTop.reps > prevTop.reps) {
      out.push({
        level: 'good',
        text: `${ex.name}: +${todayTop.reps - prevTop.reps} reps at ${todayTop.weight}${unit}. One more session like this and you\'ll add weight.`
      });
      progressionInsights++;
    } else if (todayTop.weight === prevTop.weight && todayTop.reps <= prevTop.reps) {
      out.push({
        level: 'warn',
        text: `${ex.name}: matched ${prevTop.weight}${unit} × ${prevTop.reps}. Push for +1 rep or +${ex.isolation ? '1' : '2.5'}${unit} next session.`
      });
      progressionInsights++;
    } else if (todayTop.weight < prevTop.weight) {
      const delta = prevTop.weight - todayTop.weight;
      out.push({
        level: 'warn',
        text: `${ex.name}: dropped ${delta.toFixed(1)}${unit} vs last. Could be fatigue, sleep, or stress — check recovery this week.`
      });
      progressionInsights++;
    }
  }

  // 3. Rest analysis
  if (args.avgRestSec > 0) {
    if (args.avgRestSec < 60) {
      out.push({ level: 'info', text: `Average rest ${formatRest(args.avgRestSec)} — short rests, great for conditioning but heavy strength suffers. Push to 2-3 min between hard compounds.` });
    } else if (args.avgRestSec < 120) {
      out.push({ level: 'good', text: `Average rest ${formatRest(args.avgRestSec)} — in the hypertrophy sweet spot for accessory work.` });
    } else if (args.avgRestSec <= 240) {
      out.push({ level: 'good', text: `Average rest ${formatRest(args.avgRestSec)} — good for the heavy compounds. Plenty for max strength.` });
    } else {
      out.push({ level: 'info', text: `Average rest ${formatRest(args.avgRestSec)} — quite long. Make sure each work set is hard enough to justify it.` });
    }
  }

  // 4. Total volume + sets context
  if (args.working.length >= 20) {
    out.push({ level: 'good', text: `${args.working.length} working sets, ${Math.round(args.totalVolume).toLocaleString()}kg total volume. Heavy session — prioritize recovery tonight.` });
  } else if (args.working.length >= 12) {
    out.push({ level: 'info', text: `${args.working.length} working sets, ${Math.round(args.totalVolume).toLocaleString()}kg volume. Solid moderate session.` });
  } else if (args.working.length >= 4) {
    out.push({ level: 'info', text: `${args.working.length} working sets logged. Quality over quantity — make sure each one was hard.` });
  }

  // 5. Warmup commentary
  if (args.warmups.length === 0 && args.working.some(s => s.weight > 60)) {
    out.push({ level: 'warn', text: `No warmup sets logged. Build the habit — even 2 sets at 50%/70% before heavy work cuts injury risk dramatically.` });
  }

  // 6. Duration
  if (args.durationSec > 90 * 60) {
    out.push({ level: 'info', text: `Session was ${Math.round(args.durationSec / 60)} min. Long sessions can leak into fatigue — aim for 60-75 min of focused work next time.` });
  } else if (args.durationSec < 25 * 60 && args.working.length >= 6) {
    out.push({ level: 'good', text: `In and out in ${Math.round(args.durationSec / 60)} min — efficient.` });
  }

  return out;
}

function buildRecovery(): SessionAnalysis['recovery'] {
  return [
    {
      icon: '💧',
      title: 'Hydrate now',
      detail: '500ml water + a pinch of salt or electrolytes. Replaces what you sweated out and helps protein synthesis kick in.'
    },
    {
      icon: '🍗',
      title: 'Protein within 2 hours',
      detail: 'Aim for 30–50g (1.6–2.2g/kg bodyweight per day total). Chicken, fish, eggs, Greek yoghurt or a shake — whatever you can eat.'
    },
    {
      icon: '🛏️',
      title: 'Sleep 7–9 hours tonight',
      detail: 'This is when your muscle repairs and your nervous system recovers. Lift hard, sleep harder. No screens for the last 30 min.'
    },
    {
      icon: '🤸',
      title: '5–10 min stretch + foam roll',
      detail: 'Cooldown stretch the muscles you worked. Hits parasympathetic recovery and reduces next-day soreness.'
    },
    {
      icon: '🚶',
      title: '10–15 min walk later',
      detail: 'Light walk a few hours later boosts blood flow without adding fatigue. Great for sore legs.'
    },
    {
      icon: '📅',
      title: 'Next session for these muscles in 48–72h',
      detail: 'Big compound lifts need that window to fully recover. Hit other muscle groups, do cardio, or rest tomorrow.'
    }
  ];
}

function formatRest(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
