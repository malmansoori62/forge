'use client';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { db } from '@/lib/db';
import { useSettings } from '@/lib/store';
import { e1RM } from '@/lib/utils';
import {
  MAIN_LIFTS, FIVE_THREE_ONE_WEEKS, round2_5, estimateTMFromHistory
} from '@/lib/fiveThreeOne';
import { ArrowLeft, Calculator, Sparkles, Plus } from 'lucide-react';

export default function TrainingMaxPage() {
  const { trainingMaxes, setTrainingMax } = useSettings();
  const sets = useLiveQuery(() => db.sets.toArray(), []);

  // best e1RM per lift from history
  const bestE1RM = useMemo(() => {
    const m = new Map<string, number>();
    if (!sets) return m;
    for (const s of sets) {
      if (s.isWarmup || s.parentSetId) continue;
      const e = e1RM(s.weight, s.reps);
      m.set(s.exerciseSlug, Math.max(m.get(s.exerciseSlug) ?? 0, e));
    }
    return m;
  }, [sets]);

  function bumpCycle(slug: string, step: number) {
    const cur = trainingMaxes[slug] ?? 0;
    if (cur === 0) return;
    setTrainingMax(slug, round2_5(cur + step));
  }

  function autoEstimate(slug: string) {
    const best = bestE1RM.get(slug) ?? 0;
    if (best <= 0) {
      alert('Log at least one working set for this lift first.');
      return;
    }
    setTrainingMax(slug, estimateTMFromHistory(best));
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <header className="flex items-center gap-2">
        <Link href="/settings" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Training Max</h1>
          <p className="text-xs text-forge-ash">Used by 5/3/1, GZCLP and other %-based programs</p>
        </div>
      </header>

      <div className="rounded-xl bg-forge-coal border border-forge-stone p-3 text-xs text-forge-bone leading-snug">
        <p>
          <span className="text-forge-lime font-bold">TM = 90% of your true 1RM.</span>{' '}
          You should be able to hit 3–5 solid reps at your TM with good form.
        </p>
        <p className="mt-1 text-forge-ash">
          After each 4-week cycle, bump by <span className="text-forge-bone">+2.5 kg</span> on upper-body lifts and{' '}
          <span className="text-forge-bone">+5 kg</span> on lower-body lifts.
        </p>
      </div>

      <section className="space-y-3">
        {MAIN_LIFTS.map(lift => {
          const tm = trainingMaxes[lift.slug] ?? 0;
          const best = bestE1RM.get(lift.slug) ?? 0;
          return (
            <div key={lift.slug} className="rounded-2xl bg-forge-coal border border-forge-stone p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{lift.name}</h3>
                {best > 0 && (
                  <span className="text-[10px] text-forge-ash tabular">est 1RM {best.toFixed(1)}kg</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <NumberInput value={tm} onChange={n => setTrainingMax(lift.slug, n)} step={2.5} />
                <button
                  onClick={() => autoEstimate(lift.slug)}
                  className="px-2.5 py-2 rounded-lg bg-forge-stone text-forge-lime text-xs font-bold inline-flex items-center gap-1"
                  title="Estimate from history (90% of best e1RM)"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Est
                </button>
                <button
                  onClick={() => bumpCycle(lift.slug, lift.tmStep)}
                  disabled={tm <= 0}
                  className="px-2.5 py-2 rounded-lg bg-forge-stone text-forge-bone text-xs font-bold inline-flex items-center gap-1 disabled:opacity-40"
                  title={`+${lift.tmStep}kg cycle bump`}
                >
                  <Plus className="w-3.5 h-3.5" /> {lift.tmStep}
                </button>
              </div>

              {tm > 0 && <FiveThreeOneGrid tm={tm} />}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function FiveThreeOneGrid({ tm }: { tm: number }) {
  return (
    <div className="rounded-xl bg-forge-ink/40 border border-forge-stone overflow-hidden">
      <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-forge-ash border-b border-forge-stone inline-flex items-center gap-1">
        <Calculator className="w-3 h-3" /> 5/3/1 prescription
      </div>
      <div className="divide-y divide-forge-stone">
        {FIVE_THREE_ONE_WEEKS.map(wk => (
          <div key={wk.key} className="grid grid-cols-[6.5rem_1fr_1fr_1fr] gap-1 px-2 py-1.5 text-xs items-center">
            <span className="text-forge-ash truncate">{wk.label}</span>
            {wk.sets.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-forge-bone font-bold tabular">{round2_5(tm * s.pct)}<span className="text-[9px] text-forge-ash">kg</span></div>
                <div className="text-[9px] text-forge-ash tabular">×{s.reps}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberInput({
  value, onChange, step = 2.5
}: {
  value: number; onChange: (n: number) => void; step?: number;
}) {
  const [str, setStr] = useState(value > 0 ? String(value) : '');
  return (
    <input
      type="number" inputMode="decimal" step={step}
      value={str}
      onChange={e => {
        setStr(e.target.value);
        const n = Number(e.target.value);
        if (Number.isFinite(n) && n >= 0) onChange(n);
      }}
      onBlur={() => setStr(value > 0 ? String(value) : '')}
      placeholder="0"
      className="flex-1 px-3 py-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-center font-bold tabular text-xl"
    />
  );
}
