'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Session, PlanDay } from '@/lib/types';
import { useSession } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import { Play, X, Activity, Clock } from 'lucide-react';

/**
 * Surfaces an in-progress session on the home page so the user can resume
 * with one tap. If the underlying session has actually finished (or was
 * deleted), clean up the store reference silently.
 */
export default function ResumeSessionBanner() {
  const { activeSessionId, activeDayId, clearActive } = useSession();
  const session = useLiveQuery(
    () => (activeSessionId
      ? db.sessions.get(activeSessionId)
      : Promise.resolve(undefined as Session | undefined)),
    [activeSessionId]
  );
  const day = useLiveQuery(
    () => (activeDayId
      ? db.days.get(activeDayId)
      : Promise.resolve(undefined as PlanDay | undefined)),
    [activeDayId]
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (activeSessionId && session === null) {
      clearActive();
    }
  }, [activeSessionId, session, clearActive]);

  if (!activeSessionId || !session || session.endedAt) return null;

  const elapsed = Math.max(0, Math.floor((now - session.startedAt) / 1000));

  return (
    <Link
      href="/session"
      className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-forge-lime/20 to-forge-coal border border-forge-lime/40 p-3 shadow-glow"
    >
      <div className="w-10 h-10 rounded-full bg-forge-lime/20 flex items-center justify-center shrink-0 animate-pulse">
        <Activity className="w-5 h-5 text-forge-lime" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-forge-lime font-bold">In progress</div>
        <div className="font-bold truncate">{day?.name ?? 'Workout'}</div>
        <div className="text-[11px] text-forge-ash inline-flex items-center gap-1 tabular">
          <Clock className="w-3 h-3" /> {formatTime(elapsed)} elapsed
        </div>
      </div>
      <div className="rounded-xl bg-forge-lime text-forge-ink px-3 py-2 font-bold text-sm inline-flex items-center gap-1.5 shrink-0">
        <Play className="w-3.5 h-3.5 fill-current" /> Resume
      </div>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); if (confirm('End this session?')) { db.sessions.update(activeSessionId, { endedAt: Date.now() }); clearActive(); } }}
        className="p-1.5 text-forge-ash"
        title="End session"
      >
        <X className="w-4 h-4" />
      </button>
    </Link>
  );
}
