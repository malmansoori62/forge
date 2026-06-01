'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { db } from '@/lib/db';
import type { PlanDay, Session, WorkingSet } from '@/lib/types';
import { formatDateTime, formatTime, formatTimeOfDay, e1RM } from '@/lib/utils';
import { ArrowLeft, Calendar, Clock, Trophy, Flame, NotebookPen, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HistoryDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 animate-pulse text-forge-ash">Loading…</div>}>
      <HistoryDetailContent />
    </Suspense>
  );
}

function HistoryDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams?.get('id') ?? 0);

  const session = useLiveQuery(
    () => (id
      ? db.sessions.get(id)
      : Promise.resolve(undefined as Session | undefined)),
    [id]
  );
  const day = useLiveQuery(
    () => (session?.dayId
      ? db.days.get(session.dayId)
      : Promise.resolve(undefined as PlanDay | undefined)),
    [session?.dayId]
  );
  const sets = useLiveQuery(
    () => (id
      ? db.sets.where('sessionId').equals(id).sortBy('loggedAt')
      : Promise.resolve([] as WorkingSet[])),
    [id]
  );
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  const grouped = useMemo(() => {
    if (!sets || !exercises) return [];
    const exMap = new Map(exercises.map(e => [e.slug, e]));
    const map = new Map<string, typeof sets>();
    for (const s of sets) {
      const arr = map.get(s.exerciseSlug) ?? [];
      arr.push(s);
      map.set(s.exerciseSlug, arr);
    }
    return [...map.entries()].map(([slug, ss]) => ({
      slug,
      name: exMap.get(slug)?.name ?? slug,
      sets: ss.sort((a, b) => a.loggedAt - b.loggedAt),
    }));
  }, [sets, exercises]);

  async function deleteSession() {
    if (!session) return;
    if (!confirm('Delete this session and all its sets? Cannot be undone.')) return;
    await db.transaction('rw', db.sessions, db.sets, async () => {
      await db.sets.where('sessionId').equals(id).delete();
      await db.sessions.delete(id);
    });
    router.push('/history');
  }

  if (!session || !sets || !exercises) {
    return <div className="p-6 animate-pulse text-forge-ash">Loading…</div>;
  }

  const dur = session.endedAt ? Math.floor((session.endedAt - session.startedAt) / 1000) : null;
  const working = sets.filter(s => !s.isWarmup);
  const volume = working.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const prs = working.filter(s => s.isPR).length;
  const topE1RM = working.length > 0 ? Math.max(...working.map(s => e1RM(s.weight, s.reps))) : 0;

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <header className="flex items-center gap-2">
        <Link href="/history" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{day?.name ?? 'Session'}</h1>
          <p className="text-xs text-forge-ash inline-flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="text-forge-bone font-semibold">{formatDateTime(session.startedAt, true)}</span>
            </span>
            {session.endedAt && (
              <span className="text-forge-ash">→ {formatTimeOfDay(session.endedAt)}</span>
            )}
            {dur !== null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatTime(dur)}
              </span>
            )}
          </p>
        </div>
        <button onClick={deleteSession} className="p-2 -m-2 text-red-400">
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Sets" value={working.length.toString()} />
        <Stat label="Volume" value={`${Math.round(volume).toLocaleString()}`} sub="kg" />
        <Stat label="Top e1RM" value={topE1RM > 0 ? topE1RM.toFixed(1) : '—'} sub="kg" />
        <Stat label="PRs" value={prs.toString()} accent />
      </div>

      {session.note && (
        <div className="rounded-xl bg-forge-coal border border-forge-stone p-3">
          <div className="text-[10px] uppercase tracking-wide text-forge-ash inline-flex items-center gap-1 mb-1">
            <NotebookPen className="w-3 h-3" /> Note
          </div>
          <p className="text-sm whitespace-pre-wrap">{session.note}</p>
        </div>
      )}

      <div className="space-y-3">
        {grouped.map(g => {
          const w = g.sets.filter(s => !s.isWarmup);
          const top = w.length > 0 ? w.reduce((m, s) => (s.weight > m.weight ? s : m), w[0]) : null;
          return (
            <div key={g.slug} className="rounded-xl bg-forge-coal border border-forge-stone p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Link href={`/progress/exercise?slug=${g.slug}`} className="font-bold truncate flex-1 hover:text-forge-lime">
                  {g.name}
                </Link>
                {top && (
                  <span className="text-xs text-forge-lime font-bold tabular shrink-0">
                    top {top.weight}×{top.reps}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {g.sets.map(s => {
                  const isCardio = s.durationSec !== undefined && s.durationSec > 0;
                  const minutes = isCardio ? Math.floor(s.durationSec! / 60) : 0;
                  const seconds = isCardio ? s.durationSec! % 60 : 0;
                  const km = s.distanceM ? (s.distanceM / 1000).toFixed(2) : null;
                  return (
                    <div key={s.id} className={`flex items-center gap-2 text-xs tabular px-2 py-1 rounded ${
                      s.isWarmup ? 'bg-orange-500/10' : 'bg-forge-stone/60'
                    }`}>
                      {s.isWarmup ? (
                        <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                      ) : (
                        <span className="w-3 text-center text-forge-ash font-bold">{s.setIndex}</span>
                      )}
                      {isCardio ? (
                        <>
                          <span className="font-semibold">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                          {km && <span className="text-forge-ash">· {km}km</span>}
                          {s.rpe !== undefined && <span className="text-forge-ash">RPE {s.rpe}</span>}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{s.weight}{s.unit ?? 'kg'} × {s.reps}</span>
                          {s.rpe !== undefined ? (
                            <span className="text-forge-ash">RPE {s.rpe}</span>
                          ) : (
                            <span className="text-forge-ash">RIR {s.rir}</span>
                          )}
                        </>
                      )}
                      {s.isPR && <Trophy className="w-3 h-3 text-forge-lime ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {grouped.length === 0 && (
          <div className="rounded-xl border border-dashed border-forge-stone p-6 text-center text-forge-ash text-sm">
            No sets logged in this session.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-2.5 ${accent ? 'bg-forge-lime/5 border-forge-lime/30' : 'bg-forge-coal border-forge-stone'}`}>
      <div className="text-[9px] uppercase tracking-wide text-forge-ash">{label}</div>
      <div className={`text-base font-bold tabular leading-tight ${accent ? 'text-forge-lime' : ''}`}>
        {value}{sub && <span className="text-[10px] text-forge-ash ml-0.5 font-normal">{sub}</span>}
      </div>
    </div>
  );
}
