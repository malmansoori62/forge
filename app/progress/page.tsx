'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useMemo } from 'react';
import { db } from '@/lib/db';
import { useSettings } from '@/lib/store';
import { e1RM, formatDate, startOfDay } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceArea, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, ChevronRight, Target } from 'lucide-react';
import type { Muscle } from '@/lib/types';

const MUSCLE_GROUPS: { key: Muscle; label: string }[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'front-delt', label: 'Front Delts' },
  { key: 'side-delt', label: 'Side Delts' },
  { key: 'rear-delt', label: 'Rear Delts' },
  { key: 'lats', label: 'Lats' },
  { key: 'upper-back', label: 'Upper Back' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'calves', label: 'Calves' }
];

export default function ProgressPage() {
  const sets = useLiveQuery(() => db.sets.toArray(), []);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const { volumeGoals, setVolumeGoal } = useSettings();

  const exMap = useMemo(() => new Map((exercises ?? []).map(e => [e.slug, e])), [exercises]);

  // Volume per muscle this week
  const weekVolume = useMemo(() => {
    if (!sets || !exercises) return [];
    const weekStart = startOfDay(Date.now()) - 6 * 86400000;
    const recent = sets.filter(s => s.loggedAt >= weekStart && !s.isWarmup);
    const counts = new Map<Muscle, number>();
    for (const s of recent) {
      const ex = exMap.get(s.exerciseSlug);
      if (!ex) continue;
      for (const m of ex.primary) counts.set(m, (counts.get(m) ?? 0) + 1);
      for (const m of ex.secondary) counts.set(m, (counts.get(m) ?? 0) + 0.5);
    }
    return MUSCLE_GROUPS.map(g => ({
      muscle: g.label,
      sets: counts.get(g.key) ?? 0,
      goal: volumeGoals[g.key] ?? 12,
      key: g.key
    }));
  }, [sets, exercises, exMap, volumeGoals]);

  function editGoal(key: Muscle, current: number) {
    const next = prompt(`Weekly set goal for ${key.replace(/-/g, ' ')}:`, String(current));
    const n = next === null ? null : Number(next);
    if (n !== null && Number.isFinite(n) && n >= 0) setVolumeGoal(key, n);
  }

  // Per-exercise summary (top e1RM history)
  const exerciseStats = useMemo(() => {
    if (!sets || !exercises) return [];
    const byEx = new Map<string, { last: number; bestE1RM: number; sets: number; lastWeight: number; lastReps: number }>();
    for (const s of sets) {
      const cur = byEx.get(s.exerciseSlug) ?? { last: 0, bestE1RM: 0, sets: 0, lastWeight: 0, lastReps: 0 };
      const e = e1RM(s.weight, s.reps);
      cur.bestE1RM = Math.max(cur.bestE1RM, e);
      cur.sets += 1;
      if (s.loggedAt > cur.last) {
        cur.last = s.loggedAt;
        cur.lastWeight = s.weight;
        cur.lastReps = s.reps;
      }
      byEx.set(s.exerciseSlug, cur);
    }
    return [...byEx.entries()]
      .map(([slug, v]) => ({ slug, name: exMap.get(slug)?.name ?? slug, ...v }))
      .sort((a, b) => b.last - a.last);
  }, [sets, exercises, exMap]);

  if (!sets || !exercises) {
    return <div className="p-6 animate-pulse text-forge-ash">Loading…</div>;
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Progress</h1>

      {/* Weekly volume vs goals */}
      <section className="rounded-2xl bg-forge-coal border border-forge-stone p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Weekly Volume</h2>
          <span className="text-xs text-forge-ash inline-flex items-center gap-1">
            <Target className="w-3 h-3" /> tap to set goal
          </span>
        </div>
        <div className="space-y-1.5">
          {weekVolume.map(d => {
            const pct = d.goal > 0 ? Math.min(100, (d.sets / d.goal) * 100) : 0;
            const overshoot = d.goal > 0 && d.sets > d.goal * 1.4;
            const undershoot = d.goal > 0 && d.sets < d.goal * 0.5;
            return (
              <button
                key={d.key}
                onClick={() => editGoal(d.key, d.goal)}
                className="w-full text-left"
              >
                <div className="flex items-baseline justify-between text-xs mb-0.5">
                  <span className="text-forge-bone">{d.muscle}</span>
                  <span className="tabular text-forge-ash">
                    <span className={overshoot ? 'text-yellow-400 font-bold' : undershoot ? 'text-red-300 font-bold' : 'text-forge-bone font-bold'}>{d.sets}</span> / {d.goal}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-forge-stone overflow-hidden">
                  <div
                    className={`h-full transition-all ${overshoot ? 'bg-yellow-400' : undershoot ? 'bg-red-400' : 'bg-forge-lime'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Per-exercise */}
      <section>
        <h2 className="font-semibold mb-2 px-1">By Exercise</h2>
        <div className="space-y-1.5">
          {exerciseStats.map(stat => (
            <Link
              key={stat.slug}
              href={`/progress/${stat.slug}`}
              className="flex items-center gap-3 rounded-xl bg-forge-coal border border-forge-stone p-3 active:scale-[0.99]"
            >
              <TrendingUp className="w-4 h-4 text-forge-lime" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{stat.name}</div>
                <div className="text-xs text-forge-ash tabular">
                  e1RM {stat.bestE1RM.toFixed(1)}kg · last {stat.lastWeight}×{stat.lastReps} · {formatDate(stat.last)}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-forge-ash" />
            </Link>
          ))}
          {exerciseStats.length === 0 && (
            <p className="text-sm text-forge-ash p-4 text-center">Log a session to see your progress.</p>
          )}
        </div>
      </section>
    </div>
  );
}
