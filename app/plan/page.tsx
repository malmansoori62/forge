'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { db } from '@/lib/db';
import type { PlanDay } from '@/lib/types';
import ExerciseImage from '@/components/ExerciseImage';
import { Pencil, LayoutGrid } from 'lucide-react';

export default function PlanPage() {
  const activePlan = useLiveQuery(async () => {
    const all = await db.plans.toArray();
    return all.find(p => p.active) ?? all[0];
  }, []);
  const days = useLiveQuery(
    () => (activePlan?.id
      ? db.days.where('planId').equals(activePlan.id).sortBy('order')
      : Promise.resolve([] as PlanDay[])),
    [activePlan?.id]
  );

  if (!days || !activePlan) return <div className="px-4 pt-6 animate-pulse h-screen bg-forge-coal/30" />;

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{activePlan.name}</h1>
          <p className="text-xs text-forge-ash truncate">{activePlan.description ?? `${days.length} training days`}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/plans" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-forge-coal border border-forge-stone text-forge-bone hover:border-forge-lime/50">
            <LayoutGrid className="w-3 h-3" /> Plans
          </Link>
          <Link href="/plan/edit" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-forge-coal border border-forge-stone text-forge-bone hover:border-forge-lime/50">
            <Pencil className="w-3 h-3" /> Edit
          </Link>
        </div>
      </header>

      {days.length === 0 ? (
        <div className="rounded-xl border border-dashed border-forge-stone p-6 text-center text-forge-ash text-sm">
          No training days yet. <Link href="/plan/edit" className="text-forge-lime underline">Add one</Link>.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {days.map(d => {
            const tag = /push/i.test(d.name) ? 'Push'
              : /pull/i.test(d.name) ? 'Pull'
              : /legs?/i.test(d.name) ? 'Legs'
              : /upper/i.test(d.name) ? 'Upper'
              : /lower/i.test(d.name) ? 'Lower'
              : /chest/i.test(d.name) ? 'Chest'
              : /back/i.test(d.name) ? 'Back'
              : /shoulder/i.test(d.name) ? 'Shoulders'
              : /arms?/i.test(d.name) ? 'Arms'
              : /full/i.test(d.name) ? 'Full Body'
              : 'Day';
            return (
              <Link
                key={d.id}
                href={`/plan/day?slug=${d.slug}`}
                className="group rounded-2xl bg-forge-coal border border-forge-stone overflow-hidden active:scale-[0.98] transition"
              >
                <ExerciseImage src={d.illustration} alt={d.name} className="w-full aspect-square" />
                <div className="p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-forge-lime font-semibold">{tag}</div>
                  <div className="text-sm font-bold mt-0.5 truncate">{d.name}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
