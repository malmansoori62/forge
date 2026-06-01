'use client';
import Sheet from './Sheet';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { DayExercise } from '@/lib/types';
import { findSwaps } from '@/lib/exercises';
import { useMemo } from 'react';
import { Repeat, Check } from 'lucide-react';

export default function SwapSheet({
  dayExerciseId,
  onClose
}: {
  dayExerciseId: number | null;
  onClose: () => void;
}) {
  const de = useLiveQuery(
    () => (dayExerciseId
      ? db.dayExercises.get(dayExerciseId)
      : Promise.resolve(undefined as DayExercise | undefined)),
    [dayExerciseId]
  );
  const allEx = useLiveQuery(() => db.exercises.toArray(), []);

  const current = useMemo(
    () => allEx?.find(e => e.slug === de?.exerciseSlug),
    [allEx, de]
  );
  const alternatives = useMemo(() => {
    if (!current || !allEx) return [];
    return findSwaps(current.slug, allEx);
  }, [current, allEx]);

  async function pick(slug: string) {
    if (!de?.id) return;
    await db.dayExercises.update(de.id, { exerciseSlug: slug });
    onClose();
  }

  return (
    <Sheet
      open={dayExerciseId !== null}
      onClose={onClose}
      title={`Swap: ${current?.name ?? ''}`}
    >
      {current && (
        <div className="mb-3 rounded-xl bg-forge-stone/50 p-3">
          <div className="text-[10px] uppercase tracking-wide text-forge-ash">Pattern</div>
          <div className="font-semibold capitalize">{current.pattern.replace('-', ' ')}</div>
          <div className="text-xs text-forge-ash mt-1">
            Targets: {current.primary.join(', ')}
          </div>
        </div>
      )}
      <p className="text-xs text-forge-ash mb-2 px-1">
        Alternatives — same movement pattern, sorted by muscle overlap.
      </p>
      <ul className="space-y-1.5">
        {alternatives.map(alt => {
          const overlap = alt.primary.filter(m => current?.primary.includes(m)).length;
          return (
            <li key={alt.slug}>
              <button
                onClick={() => pick(alt.slug)}
                className="w-full text-left p-3 rounded-xl bg-forge-coal border border-forge-stone hover:border-forge-lime/40 transition flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{alt.name}</div>
                  <div className="text-xs text-forge-ash mt-0.5">
                    {alt.equipment.join(' · ')} · {alt.isolation ? 'isolation' : 'compound'}
                  </div>
                </div>
                {overlap > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-forge-lime/15 text-forge-lime">
                    {overlap} match
                  </span>
                )}
                <Repeat className="w-4 h-4 text-forge-ash" />
              </button>
            </li>
          );
        })}
        {alternatives.length === 0 && (
          <li className="text-sm text-forge-ash p-4 text-center">No alternatives indexed for this pattern.</li>
        )}
      </ul>
    </Sheet>
  );
}
