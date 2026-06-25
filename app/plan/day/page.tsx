'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { DayExercise, PlanDay } from '@/lib/types';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, Repeat, Plus, Trash2, Link2, Unlink, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import ExerciseImage from '@/components/ExerciseImage';
import SwapSheet from '@/components/SwapSheet';
import { useSession } from '@/lib/store';

export default function DayPage() {
  return (
    <Suspense fallback={<div className="p-6 text-forge-ash">Loading day…</div>}>
      <DayPageContent />
    </Suspense>
  );
}

function DayPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') ?? '';
  const router = useRouter();
  const setActive = useSession(s => s.setActive);

  const day = useLiveQuery(
    () => (slug
      ? db.days.where('slug').equals(slug).first()
      : Promise.resolve(undefined as PlanDay | undefined)),
    [slug]
  );
  const dayExercises = useLiveQuery(
    () => (day?.id
      ? db.dayExercises.where('dayId').equals(day.id).sortBy('order')
      : Promise.resolve([] as DayExercise[])),
    [day?.id]
  );
  const allExercises = useLiveQuery(() => db.exercises.toArray(), []);

  const [swapFor, setSwapFor] = useState<number | null>(null);

  const enriched = useMemo(() => {
    if (!dayExercises || !allExercises) return [];
    const map = new Map(allExercises.map(e => [e.slug, e]));
    return dayExercises.map(de => ({ ...de, exercise: map.get(de.exerciseSlug) }));
  }, [dayExercises, allExercises]);

  async function start() {
    if (!day?.id) return;
    const sessionId = (await db.sessions.add({
      dayId: day.id,
      startedAt: Date.now()
    })) as number;
    setActive(sessionId, day.id);
    router.push('/session');
  }

  async function removeExercise(deId: number) {
    if (!confirm('Remove this exercise from the day?')) return;
    await db.dayExercises.delete(deId);
  }

  /** Move an exercise up (dir -1) or down (dir +1) by swapping order with its neighbour. */
  async function move(idx: number, dir: -1 | 1) {
    const a = enriched[idx];
    const b = enriched[idx + dir];
    if (!a?.id || !b?.id) return;
    await db.transaction('rw', db.dayExercises, async () => {
      await db.dayExercises.update(a.id!, { order: b.order });
      await db.dayExercises.update(b.id!, { order: a.order });
    });
  }

  /** Join an exercise into a superset with the one above it. */
  async function linkWithPrev(idx: number) {
    const cur = enriched[idx];
    const prev = enriched[idx - 1];
    if (!cur?.id || !prev?.id) return;
    const group = prev.supersetGroup ?? Date.now();
    await db.transaction('rw', db.dayExercises, async () => {
      if (prev.supersetGroup == null) await db.dayExercises.update(prev.id!, { supersetGroup: group });
      await db.dayExercises.update(cur.id!, { supersetGroup: group });
    });
  }

  /** Split an exercise out of its superset (tidies up a now-solo partner). */
  async function unlinkFromPrev(idx: number) {
    const cur = enriched[idx];
    const prev = enriched[idx - 1];
    if (!cur?.id) return;
    const group = cur.supersetGroup;
    await db.dayExercises.update(cur.id!, { supersetGroup: undefined });
    // If the previous exercise is now the only member left in the group, clear it too.
    if (prev?.id && group != null) {
      const remaining = enriched.filter((r, i) => i !== idx && r.supersetGroup === group);
      if (remaining.length <= 1) await db.dayExercises.update(prev.id!, { supersetGroup: undefined });
    }
  }

  if (!day) return <div className="p-6 text-forge-ash">Loading day…</div>;

  return (
    <div className="pb-32">
      <header className="px-4 pt-4 pb-3 flex items-center gap-2">
        <Link href="/plan" className="p-2 -m-2 text-forge-ash hover:text-forge-bone">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold flex-1">{day.name}</h1>
      </header>

      {day.illustration && (
        <div className="px-4">
          <ExerciseImage src={day.illustration} alt={day.name} className="w-full aspect-[2/1]" />
        </div>
      )}

      <ul className="px-4 mt-4 space-y-2">
        {enriched.map((row, idx) => {
          const prev = enriched[idx - 1];
          const nextRow = enriched[idx + 1];
          const g = row.supersetGroup;
          const linkedPrev = idx > 0 && g != null && prev?.supersetGroup === g;
          const linkedNext = g != null && nextRow?.supersetGroup === g;
          const groupStart = linkedNext && !linkedPrev;
          return (
            <li key={row.id} className={linkedPrev ? '-mt-1' : ''}>
              {groupStart && (
                <div className="flex items-center gap-1.5 px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-forge-lime">
                  <Link2 className="w-3 h-3" /> Superset · do back-to-back
                </div>
              )}
              <div className={`rounded-xl bg-forge-coal border p-3 flex items-center gap-2 ${
                linkedPrev || linkedNext
                  ? 'border-forge-lime/40 border-l-2 border-l-forge-lime'
                  : 'border-forge-stone'
              }`}>
                <div className="w-7 h-7 rounded-full bg-forge-stone flex items-center justify-center text-xs font-bold tabular text-forge-ash shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{row.exercise?.name ?? row.exerciseSlug}</div>
                  <div className="text-xs text-forge-ash mt-0.5 tabular">
                    {row.targetSets} × {row.targetRepsMin}–{row.targetRepsMax} @ RIR {row.targetRIR}
                  </div>
                </div>
                <div className="flex flex-col shrink-0">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-0.5 text-forge-ash disabled:opacity-20 hover:text-forge-lime"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === enriched.length - 1}
                    className="p-0.5 text-forge-ash disabled:opacity-20 hover:text-forge-lime"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {idx > 0 && (
                  <button
                    onClick={() => (linkedPrev ? unlinkFromPrev(idx) : linkWithPrev(idx))}
                    className={`p-1.5 ${linkedPrev ? 'text-forge-lime' : 'text-forge-ash hover:text-forge-lime'}`}
                    title={linkedPrev ? 'Unlink from superset' : 'Superset with exercise above'}
                  >
                    {linkedPrev ? <Unlink className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => setSwapFor(row.id!)}
                  className="p-1.5 text-forge-ash hover:text-forge-lime"
                  title="Swap exercise"
                >
                  <Repeat className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeExercise(row.id!)}
                  className="p-1.5 text-forge-ash hover:text-red-400"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-4 mt-3">
        <Link
          href={`/plan/day/add?slug=${slug}`}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-forge-stone text-forge-ash py-3 hover:border-forge-lime/50 hover:text-forge-lime transition"
        >
          <Plus className="w-4 h-4" /> Add exercise
        </Link>
      </div>

      <div className="fixed bottom-20 inset-x-0 px-4 z-20">
        <div className="mx-auto max-w-md">
          <button
            onClick={start}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-forge-lime text-forge-ink font-bold py-4 shadow-glow active:scale-[0.98] transition"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Session
          </button>
        </div>
      </div>

      <SwapSheet
        dayExerciseId={swapFor}
        onClose={() => setSwapFor(null)}
      />
    </div>
  );
}
