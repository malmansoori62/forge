'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useMemo } from 'react';
import { db } from '@/lib/db';
import { formatDate, formatDateTime, formatTime, daysAgo, e1RM } from '@/lib/utils';
import { ArrowLeft, Calendar, Clock, Dumbbell, TrendingUp, Trophy } from 'lucide-react';

export default function HistoryPage() {
  const sessions = useLiveQuery(
    () => db.sessions.orderBy('startedAt').reverse().toArray(),
    []
  );
  const days = useLiveQuery(() => db.days.toArray(), []);
  const sets = useLiveQuery(() => db.sets.toArray(), []);

  const dayMap = useMemo(
    () => new Map((days ?? []).map(d => [d.id!, d])),
    [days]
  );

  const stats = useMemo(() => {
    if (!sessions || !sets) return new Map();
    const m = new Map<number, { sets: number; warmups: number; volume: number; prs: number; topE1RM: number }>();
    for (const s of sets) {
      const cur = m.get(s.sessionId) ?? { sets: 0, warmups: 0, volume: 0, prs: 0, topE1RM: 0 };
      if (s.isWarmup) cur.warmups++;
      else {
        cur.sets++;
        cur.volume += s.weight * s.reps;
        if (s.isPR) cur.prs++;
        cur.topE1RM = Math.max(cur.topE1RM, e1RM(s.weight, s.reps));
      }
      m.set(s.sessionId, cur);
    }
    return m;
  }, [sessions, sets]);

  if (!sessions) {
    return <div className="p-6 animate-pulse text-forge-ash">Loading…</div>;
  }

  const completed = sessions.filter(s => s.endedAt);
  const totalVolume = [...stats.values()].reduce((sum, v) => sum + v.volume, 0);
  const totalSets = [...stats.values()].reduce((sum, v) => sum + v.sets, 0);
  const totalPRs = [...stats.values()].reduce((sum, v) => sum + v.prs, 0);

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <header className="flex items-center gap-2">
        <Link href="/" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">History</h1>
          <p className="text-xs text-forge-ash">{completed.length} sessions logged</p>
        </div>
      </header>

      {/* Lifetime summary */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={<Dumbbell className="w-3 h-3" />} label="Sets" value={totalSets.toString()} />
        <Stat icon={<TrendingUp className="w-3 h-3" />} label="Volume" value={`${Math.round(totalVolume / 1000)}t`} />
        <Stat icon={<Trophy className="w-3 h-3" />} label="PRs" value={totalPRs.toString()} accent />
      </div>

      {/* Sessions list */}
      <div className="space-y-2">
        {sessions.length === 0 && (
          <div className="rounded-xl border border-dashed border-forge-stone p-8 text-center text-forge-ash text-sm">
            No sessions yet. Start one from <Link href="/plan" className="text-forge-lime underline">Plan</Link>.
          </div>
        )}
        {sessions.map(s => {
          const st = stats.get(s.id!) ?? { sets: 0, warmups: 0, volume: 0, prs: 0, topE1RM: 0 };
          const day = dayMap.get(s.dayId);
          const dur = s.endedAt ? Math.floor((s.endedAt - s.startedAt) / 1000) : null;
          return (
            <Link
              key={s.id}
              href={`/history/session?id=${s.id}`}
              className="block rounded-xl bg-forge-coal border border-forge-stone p-3 active:scale-[0.99] transition"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold truncate">{day?.name ?? 'Unknown day'}</h3>
                    {!s.endedAt && (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300 font-bold">
                        in progress
                      </span>
                    )}
                    {st.prs > 0 && (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-forge-lime/15 text-forge-lime font-bold inline-flex items-center gap-0.5">
                        <Trophy className="w-2.5 h-2.5" /> {st.prs} PR{st.prs > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-forge-ash mt-1 flex items-center gap-3 flex-wrap tabular">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-forge-bone font-semibold">{formatDateTime(s.startedAt)}</span>
                      <span className="text-forge-ash">· {daysAgo(s.startedAt)}</span>
                    </span>
                    {dur !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(dur)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-forge-bone mt-1.5 tabular">
                    {st.sets} sets · {Math.round(st.volume).toLocaleString()}kg volume
                    {st.topE1RM > 0 && <> · top e1RM {st.topE1RM.toFixed(1)}kg</>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? 'bg-forge-lime/5 border-forge-lime/30' : 'bg-forge-coal border-forge-stone'}`}>
      <div className="text-[10px] uppercase tracking-wide text-forge-ash inline-flex items-center gap-1">{icon}{label}</div>
      <div className={`text-xl font-bold tabular ${accent ? 'text-forge-lime' : ''}`}>{value}</div>
    </div>
  );
}
