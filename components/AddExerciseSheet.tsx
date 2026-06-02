'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { db } from '@/lib/db';
import type { DayExercise } from '@/lib/types';
import Sheet from './Sheet';
import ExerciseImage from './ExerciseImage';
import { Search, Plus } from 'lucide-react';

interface Props {
  dayId: number | null;
  open: boolean;
  onClose: () => void;
}

/** Mid-session "add exercise" picker — adds to the current day's exercise list. */
export default function AddExerciseSheet({ dayId, open, onClose }: Props) {
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), []);
  const dayExercises = useLiveQuery(
    () => (dayId
      ? db.dayExercises.where('dayId').equals(dayId).toArray()
      : Promise.resolve([] as DayExercise[])),
    [dayId]
  );
  const [q, setQ] = useState('');

  const existing = useMemo(
    () => new Set((dayExercises ?? []).map(d => d.exerciseSlug)),
    [dayExercises]
  );

  const filtered = useMemo(() => {
    if (!exercises) return [];
    const ql = q.toLowerCase();
    return exercises.filter(e =>
      !ql ||
      e.name.toLowerCase().includes(ql) ||
      e.pattern.includes(ql) ||
      e.equipment.some(eq => eq.includes(ql))
    );
  }, [exercises, q]);

  async function add(exSlug: string) {
    if (!dayId) return;
    const order = (dayExercises?.length ?? 0);
    await db.dayExercises.add({
      dayId,
      exerciseSlug: exSlug,
      order,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      targetRIR: 1
    });
    setQ('');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add exercise to today">
      <div className="space-y-3 pb-4">
        <div className="relative">
          <Search className="absolute top-3 left-3 w-4 h-4 text-forge-ash" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search exercises…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none"
            autoFocus
          />
        </div>
        <p className="text-[10px] text-forge-ash px-1">
          Adds to this day's exercises right away. Default: 3 sets × 8-12 reps @ RIR 1.
          Tap the exercise on the session pager to navigate to it.
        </p>
        <ul className="space-y-1">
          {filtered.map(ex => {
            const used = existing.has(ex.slug);
            return (
              <li key={ex.slug}>
                <button
                  onClick={() => !used && add(ex.slug)}
                  disabled={used}
                  className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left ${
                    used
                      ? 'bg-forge-stone/30 border-forge-stone opacity-50'
                      : 'bg-forge-coal border-forge-stone active:bg-forge-stone/60'
                  }`}
                >
                  <ExerciseImage src={ex.image} alt={ex.name} className="w-9 h-9 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center gap-1.5 truncate">
                      {ex.name}
                      {ex.custom && (
                        <span className="text-[9px] uppercase tracking-wider px-1 py-0 rounded bg-forge-lime/15 text-forge-lime font-bold shrink-0">
                          custom
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-forge-ash mt-0.5 capitalize truncate">
                      {ex.pattern.replace(/-/g, ' ')} · {ex.equipment.join(', ')}
                    </div>
                  </div>
                  {used ? (
                    <span className="text-[10px] uppercase text-forge-ash shrink-0">Used</span>
                  ) : (
                    <Plus className="w-4 h-4 text-forge-lime shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="rounded-xl border border-dashed border-forge-stone p-6 text-center text-forge-ash text-sm">
              No matches.
            </li>
          )}
        </ul>
      </div>
    </Sheet>
  );
}
