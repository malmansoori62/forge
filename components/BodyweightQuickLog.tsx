'use client';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { daysAgo } from '@/lib/utils';
import { Scale, Check } from 'lucide-react';

export default function BodyweightQuickLog() {
  const last = useLiveQuery(
    () => db.measurements.orderBy('takenAt').reverse().limit(1).first(),
    []
  );
  const [val, setVal] = useState<string>('');
  const [saved, setSaved] = useState(false);

  async function save() {
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) return;
    await db.measurements.add({ takenAt: Date.now(), weightKg: n });
    setVal('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  }

  const lastWeight = last?.weightKg;
  const trend = lastWeight && val ? Number(val) - lastWeight : null;

  return (
    <div className="rounded-xl bg-forge-coal border border-forge-stone p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-forge-stone flex items-center justify-center shrink-0">
        <Scale className="w-5 h-5 text-forge-lime" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-forge-ash">Bodyweight</div>
        {lastWeight ? (
          <div className="text-xs text-forge-bone tabular truncate">
            Last: {lastWeight}kg <span className="text-forge-ash">· {daysAgo(last!.takenAt)}</span>
          </div>
        ) : (
          <div className="text-xs text-forge-ash">No measurement yet</div>
        )}
      </div>
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={lastWeight ? String(lastWeight) : '75'}
        className="w-16 px-2 py-1.5 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-center font-bold tabular text-sm"
      />
      {trend !== null && Math.abs(trend) > 0.05 && (
        <span className={`text-[10px] font-bold tabular ${trend > 0 ? 'text-yellow-400' : 'text-forge-lime'}`}>
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}
        </span>
      )}
      <button
        onClick={save}
        disabled={!val || Number(val) <= 0}
        className={`p-2 rounded-lg font-bold disabled:opacity-30 transition ${saved ? 'bg-forge-lime text-forge-ink' : 'bg-forge-stone text-forge-lime'}`}
      >
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}
