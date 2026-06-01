'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { DayExercise, PlanDay } from '@/lib/types';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, Repeat, Plus, Trash2 } from 'lucide-react';
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
        {enriched.map((row, idx) => (
          <li
            key={row.id}
            className="rounded-xl bg-forge-coal border border-forge-stone p-3 flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-forge-stone flex items-center justify-center text-xs font-bold tabular text-forge-ash">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{row.exercise?.name ?? row.exerciseSlug}</div>
              <div className="text-xs text-forge-ash mt-0.5 tabular">
                {row.targetSets} × {row.targetRepsMin}–{row.targetRepsMax} @ RIR {row.targetRIR}
              </div>
            </div>
            <button
              onClick={() => setSwapFor(row.id!)}
              className="p-2 text-forge-ash hover:text-forge-lime"
              title="Swap exercise"
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeExercise(row.id!)}
              className="p-2 text-forge-ash hover:text-red-400"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
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
