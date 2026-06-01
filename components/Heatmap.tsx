'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { startOfDay, formatTimeOfDay } from '@/lib/utils';

const WEEKS = 12;

export default function Heatmap() {
  const router = useRouter();
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  if (!sessions) return <div className="h-20 rounded-xl bg-forge-coal animate-pulse" />;

  const byDay = new Map<number, { id: number; ts: number }[]>();
  for (const s of sessions) {
    const d = startOfDay(s.startedAt);
    const arr = byDay.get(d) ?? [];
    arr.push({ id: s.id!, ts: s.startedAt });
    byDay.set(d, arr);
  }
  const today = startOfDay(Date.now());
  const start = today - (WEEKS * 7 - 1) * 86400000;

  const cells: { ts: number; sessions: { id: number; ts: number }[] }[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const ts = start + i * 86400000;
    cells.push({ ts, sessions: byDay.get(ts) ?? [] });
  }
  const cols: typeof cells[] = Array.from({ length: WEEKS }, () => []);
  cells.forEach((c, i) => cols[Math.floor(i / 7)].push(c));

  function tap(c: { ts: number; sessions: { id: number; ts: number }[] }) {
    if (c.sessions.length === 0) return;
    if (c.sessions.length === 1) router.push(`/history/${c.sessions[0].id}`);
    else router.push('/history');
  }

  function tooltipFor(c: { ts: number; sessions: { id: number; ts: number }[] }) {
    const date = new Date(c.ts).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    if (c.sessions.length === 0) return date;
    const times = c.sessions
      .sort((a, b) => a.ts - b.ts)
      .map(s => formatTimeOfDay(s.ts))
      .join(', ');
    return `${date}\n${c.sessions.length} session${c.sessions.length > 1 ? 's' : ''} @ ${times}`;
  }

  return (
    <div className="rounded-xl bg-forge-coal border border-forge-stone p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-forge-ash">Last 12 weeks</span>
        <span className="text-xs text-forge-ash">{sessions.length} sessions · tap a day</span>
      </div>
      <div className="flex gap-1">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((c, ri) => {
              const intensity = c.sessions.length;
              const cls = intensity === 0
                ? 'bg-forge-stone'
                : intensity === 1
                  ? 'bg-forge-lime/60'
                  : 'bg-forge-lime';
              return (
                <button
                  key={ri}
                  onClick={() => tap(c)}
                  title={tooltipFor(c)}
                  className={`w-3 h-3 rounded-sm ${cls} ${intensity ? 'hover:ring-1 hover:ring-forge-lime' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
