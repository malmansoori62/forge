'use client';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { suggestNext } from '@/lib/progression';
import { AlertTriangle } from 'lucide-react';

export default function DeloadBanner() {
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const sets = useLiveQuery(() => db.sets.toArray(), []);
  const dayExercises = useLiveQuery(() => db.dayExercises.toArray(), []);

  const [deloadList, setDeloadList] = useState<string[]>([]);

  useEffect(() => {
    if (!exercises || !sets || !dayExercises) return;
    let cancelled = false;
    (async () => {
      const checked: string[] = [];
      const exMap = new Map(exercises.map(e => [e.slug, e]));
      const seen = new Set<string>();
      for (const de of dayExercises) {
        if (seen.has(de.exerciseSlug)) continue;
        seen.add(de.exerciseSlug);
        const ex = exMap.get(de.exerciseSlug);
        if (!ex) continue;
        const slugSets = sets.filter(s => s.exerciseSlug === de.exerciseSlug);
        if (slugSets.length < 6) continue; // need at least ~3 sessions of data
        const sug = await suggestNext(ex, de.targetRepsMin, de.targetRepsMax, de.targetRIR);
        if (sug.reason === 'deload') checked.push(ex.name);
      }
      if (!cancelled) setDeloadList(checked);
    })();
    return () => { cancelled = true; };
  }, [exercises, sets, dayExercises]);

  if (deloadList.length === 0) return null;
  return (
    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-yellow-300">Deload recommended</div>
        <div className="text-xs text-yellow-200/80 mt-0.5">
          Stalled 2+ sessions on: {deloadList.slice(0, 3).join(', ')}
          {deloadList.length > 3 && ` and ${deloadList.length - 3} more`}.
          Try 90% of current weight this week.
        </div>
      </div>
    </div>
  );
}
