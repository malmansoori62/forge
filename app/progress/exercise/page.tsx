'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import type { WorkingSet, Exercise } from '@/lib/types';
import { e1RM, formatDate } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function ExerciseProgressPage() {
  return (
    <Suspense fallback={<div className="p-6 text-forge-ash animate-pulse">Loading…</div>}>
      <ExerciseProgressContent />
    </Suspense>
  );
}

function ExerciseProgressContent() {
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') ?? '';

  const exercise = useLiveQuery(
    () => (slug
      ? db.exercises.where('slug').equals(slug).first()
      : Promise.resolve(undefined as Exercise | undefined)),
    [slug]
  );
  const sets = useLiveQuery(
    () => (slug
      ? db.sets.where('exerciseSlug').equals(slug).sortBy('loggedAt')
      : Promise.resolve([] as WorkingSet[])),
    [slug]
  );

  const sessionStats = useMemo(() => {
    if (!sets) return [];
    const map = new Map<number, typeof sets>();
    for (const s of sets) {
      const arr = map.get(s.sessionId) ?? [];
      arr.push(s); map.set(s.sessionId, arr);
    }
    return [...map.values()].map(setsInSession => {
      const top = setsInSession.reduce((m, s) => (s.weight > m.weight ? s : m), setsInSession[0]);
      const best1rm = Math.max(...setsInSession.map(s => e1RM(s.weight, s.reps)));
      return {
        date: top.loggedAt,
        label: formatDate(top.loggedAt, { month: 'short', day: 'numeric' }),
        topWeight: top.weight,
        topReps: top.reps,
        e1RM: +best1rm.toFixed(1),
        volume: setsInSession.reduce((s, x) => s + x.weight * x.reps, 0)
      };
    });
  }, [sets]);

  const bestE1RM = useMemo(() => Math.max(0, ...sessionStats.map(s => s.e1RM)), [sessionStats]);

  if (!exercise) return <div className="p-6 text-forge-ash animate-pulse">Loading…</div>;

  return (
    <div className="pb-8">
      <header className="px-4 pt-4 pb-3 flex items-center gap-2">
        <Link href="/progress" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold flex-1 truncate">{exercise.name}</h1>
      </header>

      <div className="px-4 grid grid-cols-3 gap-2">
        <Stat label="Best e1RM" value={`${bestE1RM.toFixed(1)}kg`} accent />
        <Stat label="Sessions" value={sessionStats.length.toString()} />
        <Stat label="Total sets" value={(sets?.length ?? 0).toString()} />
      </div>

      <section className="px-4 mt-4">
        <h2 className="text-xs uppercase tracking-wide text-forge-ash mb-2">e1RM over time</h2>
        <div className="h-56 rounded-2xl bg-forge-coal border border-forge-stone p-2">
          {sessionStats.length === 0 ? (
            <div className="h-full flex items-center justify-center text-forge-ash text-sm">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionStats}>
                <CartesianGrid stroke="#2c2f2a" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#9aa19a" fontSize={10} />
                <YAxis stroke="#9aa19a" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: '#17191a', border: '1px solid #2c2f2a', borderRadius: 8 }}
                  labelStyle={{ color: '#e9ebe5' }}
                />
                <Line type="monotone" dataKey="e1RM" stroke="#d4ff3f" strokeWidth={2} dot={{ fill: '#d4ff3f', r: 3 }} />
                {bestE1RM > 0 && <ReferenceLine y={bestE1RM} stroke="#d4ff3f" strokeDasharray="2 4" opacity={0.5} />}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="px-4 mt-4">
        <h2 className="text-xs uppercase tracking-wide text-forge-ash mb-2">Top set per session</h2>
        <ul className="space-y-1.5">
          {[...sessionStats].reverse().map((s, i) => (
            <li key={i} className="rounded-xl bg-forge-coal border border-forge-stone p-3 flex items-center gap-3">
              <div className="text-xs text-forge-ash w-16 shrink-0 tabular">{s.label}</div>
              <div className="flex-1 font-semibold tabular">
                {s.topWeight}kg × {s.topReps}
                <span className="ml-2 text-xs font-normal text-forge-ash">e1RM {s.e1RM}</span>
              </div>
              {s.e1RM === bestE1RM && bestE1RM > 0 && (
                <Trophy className="w-4 h-4 text-forge-lime" />
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? 'bg-forge-lime/5 border-forge-lime/30' : 'bg-forge-coal border-forge-stone'}`}>
      <div className="text-[10px] uppercase tracking-wide text-forge-ash">{label}</div>
      <div className={`text-base font-bold tabular ${accent ? 'text-forge-lime' : ''}`}>{value}</div>
    </div>
  );
}
