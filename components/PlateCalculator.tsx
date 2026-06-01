'use client';
import { useState } from 'react';
import Sheet from './Sheet';
import { calcPlates } from '@/lib/utils';
import { useSettings } from '@/lib/store';

export default function PlateCalculator({
  open, onClose, initialTarget
}: { open: boolean; onClose: () => void; initialTarget?: number }) {
  const barWeight = useSettings(s => s.barWeight);
  const [target, setTarget] = useState<number>(initialTarget ?? 60);

  const result = calcPlates(target, barWeight);

  return (
    <Sheet open={open} onClose={onClose} title="Plate Calculator">
      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-wide text-forge-ash">Target weight (kg)</label>
          <input
            type="number"
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            inputMode="decimal"
            step="2.5"
            className="mt-1 w-full px-4 py-3 rounded-xl bg-forge-stone border border-forge-mist text-2xl font-bold tabular focus:border-forge-lime outline-none"
          />
        </div>

        <div className="rounded-xl bg-forge-stone/50 p-4">
          <div className="text-xs text-forge-ash mb-2">Bar {barWeight}kg + each side:</div>
          {result.perSide.length === 0 ? (
            <div className="text-forge-ash text-sm">Just the bar.</div>
          ) : (
            <div className="space-y-1.5">
              {result.perSide.map(p => (
                <div key={p.weight} className="flex items-center justify-between">
                  <span className="font-bold tabular text-lg">{p.weight}kg</span>
                  <div className="flex gap-1">
                    {Array.from({ length: p.count }).map((_, i) => (
                      <div key={i} className="px-2.5 py-1 rounded bg-forge-lime/15 text-forge-lime text-xs font-bold tabular">
                        {p.weight}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-forge-mist text-xs text-forge-ash">
            Achievable: <span className="text-forge-lime font-bold tabular">{result.achievable}kg</span>
            {result.remainder > 0 && <span className="ml-2 text-yellow-400">⚠ {result.remainder}kg short</span>}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
