'use client';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useSession } from '@/lib/store';
import { Check, Plus, Minus, Activity, Footprints } from 'lucide-react';
import type { Exercise } from '@/lib/types';

interface Props {
  exercise: Exercise;
  sessionId: number;
  targetDurationMin?: number;
  onDone: () => void;
}

/** UI for logging a cardio bout (treadmill, bike, etc.). */
export default function CardioLogger({ exercise, sessionId, targetDurationMin, onDone }: Props) {
  const startRest = useSession(s => s.startRest);
  const [minutes, setMinutes] = useState<number>(targetDurationMin ?? 10);
  const [seconds, setSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [rpe, setRpe] = useState<number>(6);

  const previousBouts = useLiveQuery(
    () => db.sets.where('sessionId').equals(sessionId).filter(s => s.exerciseSlug === exercise.slug).sortBy('loggedAt'),
    [sessionId, exercise.slug]
  );

  useEffect(() => {
    if (targetDurationMin && minutes === 0) setMinutes(targetDurationMin);
  }, [targetDurationMin]);

  async function logCardio() {
    const durSec = minutes * 60 + seconds;
    if (durSec <= 0) return;
    await db.sets.add({
      sessionId,
      exerciseSlug: exercise.slug,
      setIndex: (previousBouts?.length ?? 0) + 1,
      weight: 0,
      reps: minutes,
      rir: Math.max(0, 10 - rpe),
      rpe,
      durationSec: durSec,
      distanceM: distanceKm > 0 ? Math.round(distanceKm * 1000) : undefined,
      loggedAt: Date.now()
    });
    setTimeout(onDone, 600);
  }

  async function deleteSet(id: number) {
    if (!confirm('Delete this bout?')) return;
    await db.sets.delete(id);
  }

  return (
    <div className="space-y-4">
      {/* Logged bouts */}
      {previousBouts && previousBouts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {previousBouts.map(s => {
            const min = Math.floor((s.durationSec ?? s.reps * 60) / 60);
            const sec = (s.durationSec ?? s.reps * 60) % 60;
            const km = s.distanceM ? (s.distanceM / 1000).toFixed(2) : null;
            return (
              <button
                key={s.id}
                onDoubleClick={() => deleteSet(s.id!)}
                className="px-2.5 py-1 rounded-lg bg-forge-stone text-xs font-semibold tabular flex items-center gap-1"
                title="Double-click to delete"
              >
                <Activity className="w-3 h-3 text-forge-lime" />
                <span>{min}:{sec.toString().padStart(2, '0')}</span>
                {km && <span className="text-forge-ash">· {km}km</span>}
              </button>
            );
          })}
        </div>
      )}

      {targetDurationMin && (
        <div className="rounded-xl bg-forge-lime/10 border border-forge-lime/30 px-3 py-2 text-xs text-forge-bone inline-flex items-center gap-2">
          <Activity className="w-4 h-4 text-forge-lime" />
          Target <span className="font-bold tabular text-forge-lime">{targetDurationMin} min</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <TimeInput label="Minutes" value={minutes} onChange={setMinutes} step={1} />
        <TimeInput label="Seconds" value={seconds} onChange={setSeconds} step={15} max={59} />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-forge-ash inline-flex items-center gap-1">
          <Footprints className="w-3 h-3" /> Distance (km, optional)
        </label>
        <input
          type="number" inputMode="decimal" step="0.1" min={0}
          value={distanceKm || ''}
          onChange={e => setDistanceKm(Number(e.target.value) || 0)}
          placeholder="0.0"
          className="mt-1 w-full px-3 py-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-center font-bold tabular"
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-forge-ash">RPE (1=walking, 10=max effort)</label>
        <div className="mt-1.5 grid grid-cols-10 gap-1.5">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              onClick={() => setRpe(n)}
              className={`py-2 rounded-lg text-sm font-bold tabular border ${
                rpe === n ? 'bg-forge-lime text-forge-ink border-forge-lime' : 'bg-forge-coal border-forge-stone text-forge-bone'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={logCardio}
        disabled={minutes <= 0 && seconds <= 0}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forge-lime text-forge-ink font-bold py-3 active:scale-[0.98] transition disabled:opacity-50"
      >
        <Check className="w-5 h-5" /> Log Cardio Bout
      </button>
    </div>
  );
}

function TimeInput({
  label, value, onChange, step = 1, max
}: {
  label: string; value: number; onChange: (n: number) => void; step?: number; max?: number;
}) {
  const dec = () => onChange(Math.max(0, value - step));
  const inc = () => onChange(max !== undefined ? Math.min(max, value + step) : value + step);
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wide text-forge-ash mb-1 block h-5">{label}</label>
      <div className="flex items-stretch rounded-xl bg-forge-coal border border-forge-stone overflow-hidden h-14">
        <button
          onClick={dec}
          className="px-3 flex items-center justify-center text-forge-ash active:bg-forge-stone active:text-forge-lime border-r border-forge-stone transition"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <input
          type="number" inputMode="numeric" step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          onFocus={e => e.target.select()}
          className="flex-1 min-w-0 bg-transparent text-center font-bold tabular text-3xl outline-none focus:bg-forge-stone/40 transition"
        />
        <button
          onClick={inc}
          className="px-3 flex items-center justify-center text-forge-ash active:bg-forge-stone active:text-forge-lime border-l border-forge-stone transition"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
