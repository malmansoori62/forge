'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { e1RM, startOfDay, formatTimeOfDay, formatTime } from '@/lib/utils';
import { ArrowLeft, ChevronLeft, ChevronRight, Trophy, Flame, Activity, Clock, Calendar as CalIcon } from 'lucide-react';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface DayCellData {
  date: Date;
  dayOfMonth: number;
  inMonth: boolean;
  sessions: { id: number; ts: number; dayId: number; endedAt?: number }[];
  prCount: number;
  totalVolume: number;
}

export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedTs, setSelectedTs] = useState<number>(startOfDay(today.getTime()));

  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  const sets = useLiveQuery(() => db.sets.toArray(), []);
  const days = useLiveQuery(() => db.days.toArray(), []);

  const dayMap = useMemo(() => new Map((days ?? []).map(d => [d.id!, d])), [days]);

  const statsBySession = useMemo(() => {
    const m = new Map<number, { prs: number; volume: number; topE1RM: number; sets: number }>();
    if (!sets) return m;
    for (const s of sets) {
      if (s.isWarmup) continue;
      const cur = m.get(s.sessionId) ?? { prs: 0, volume: 0, topE1RM: 0, sets: 0 };
      cur.sets++;
      cur.volume += s.weight * s.reps;
      if (s.isPR) cur.prs++;
      cur.topE1RM = Math.max(cur.topE1RM, e1RM(s.weight, s.reps));
      m.set(s.sessionId, cur);
    }
    return m;
  }, [sets]);

  const cells: DayCellData[] = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    // Monday-first calendar: getDay() returns 0=Sun..6=Sat. Shift so Mon=0.
    const firstWeekday = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - firstWeekday);

    const grid: DayCellData[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayTs = startOfDay(d.getTime());
      const sessionsOnDay = (sessions ?? [])
        .filter(s => startOfDay(s.startedAt) === dayTs)
        .sort((a, b) => a.startedAt - b.startedAt);
      let prCount = 0;
      let totalVolume = 0;
      for (const s of sessionsOnDay) {
        const st = statsBySession.get(s.id!);
        if (st) { prCount += st.prs; totalVolume += st.volume; }
      }
      grid.push({
        date: d,
        dayOfMonth: d.getDate(),
        inMonth: d.getMonth() === view.month,
        sessions: sessionsOnDay.map(s => ({ id: s.id!, ts: s.startedAt, dayId: s.dayId, endedAt: s.endedAt })),
        prCount,
        totalVolume
      });
    }
    return grid;
  }, [view, sessions, statsBySession]);

  const monthStats = useMemo(() => {
    if (!sessions) return { sessions: 0, prs: 0, volume: 0 };
    const inMonth = sessions.filter(s => {
      const d = new Date(s.startedAt);
      return d.getFullYear() === view.year && d.getMonth() === view.month;
    });
    const prs = inMonth.reduce((sum, s) => sum + (statsBySession.get(s.id!)?.prs ?? 0), 0);
    const volume = inMonth.reduce((sum, s) => sum + (statsBySession.get(s.id!)?.volume ?? 0), 0);
    return { sessions: inMonth.length, prs, volume };
  }, [sessions, view, statsBySession]);

  const selectedDay = cells.find(c => startOfDay(c.date.getTime()) === selectedTs);

  function prevMonth() {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 });
  }
  function nextMonth() {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 });
  }
  function jumpToToday() {
    const t = new Date();
    setView({ year: t.getFullYear(), month: t.getMonth() });
    setSelectedTs(startOfDay(t.getTime()));
  }

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: 'long', year: 'numeric'
  });

  const todayTs = startOfDay(Date.now());

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <header className="flex items-center gap-2">
        <Link href="/" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Calendar</h1>
          <p className="text-xs text-forge-ash">All your training days at a glance</p>
        </div>
        <button onClick={jumpToToday} className="text-xs px-2.5 py-1 rounded-full bg-forge-coal border border-forge-stone text-forge-bone hover:border-forge-lime/50">
          Today
        </button>
      </header>

      {/* Month nav + stats */}
      <div className="flex items-center gap-2">
        <button onClick={prevMonth} className="p-2 rounded-lg bg-forge-coal border border-forge-stone text-forge-ash">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-sm font-bold tracking-wide">{monthLabel}</div>
          <div className="text-[10px] text-forge-ash tabular mt-0.5 inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><Activity className="w-2.5 h-2.5" />{monthStats.sessions}</span>
            {monthStats.prs > 0 && <span className="inline-flex items-center gap-1 text-forge-lime"><Trophy className="w-2.5 h-2.5" />{monthStats.prs}</span>}
            <span className="inline-flex items-center gap-1">{Math.round(monthStats.volume / 1000)}t volume</span>
          </div>
        </div>
        <button onClick={nextMonth} className="p-2 rounded-lg bg-forge-coal border border-forge-stone text-forge-ash">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl bg-forge-coal border border-forge-stone overflow-hidden">
        <div className="grid grid-cols-7 border-b border-forge-stone bg-forge-ink/40">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-1.5 text-center text-[10px] uppercase tracking-wider text-forge-ash font-bold">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const isToday = startOfDay(c.date.getTime()) === todayTs;
            const isSelected = startOfDay(c.date.getTime()) === selectedTs;
            const hasSessions = c.sessions.length > 0;
            return (
              <button
                key={i}
                onClick={() => setSelectedTs(startOfDay(c.date.getTime()))}
                className={`aspect-square border-b border-r border-forge-stone p-1 flex flex-col items-center justify-start gap-0.5 transition relative
                  ${(i + 1) % 7 === 0 ? '!border-r-0' : ''}
                  ${i >= 35 ? '!border-b-0' : ''}
                  ${!c.inMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-forge-lime/10 ring-1 ring-forge-lime ring-inset' : ''}
                  active:bg-forge-stone/50`}
              >
                <span className={`text-xs font-bold tabular leading-none ${
                  isToday ? 'text-forge-lime' : hasSessions ? 'text-forge-bone' : 'text-forge-ash'
                }`}>
                  {c.dayOfMonth}
                </span>
                {hasSessions && (
                  <div className="flex gap-0.5 items-center">
                    {c.sessions.slice(0, 3).map((_, j) => (
                      <span key={j} className="w-1 h-1 rounded-full bg-forge-lime" />
                    ))}
                    {c.sessions.length > 3 && (
                      <span className="text-[8px] text-forge-lime font-bold">+</span>
                    )}
                  </div>
                )}
                {c.prCount > 0 && (
                  <Trophy className="w-2 h-2 text-forge-lime absolute top-0.5 right-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div className="rounded-2xl bg-forge-coal border border-forge-stone overflow-hidden">
          <div className="px-3 py-2 border-b border-forge-stone flex items-center gap-2 bg-forge-ink/40">
            <CalIcon className="w-4 h-4 text-forge-lime" />
            <span className="text-sm font-bold">
              {selectedDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="ml-auto text-[10px] text-forge-ash tabular">
              {selectedDay.sessions.length} session{selectedDay.sessions.length !== 1 ? 's' : ''}
            </span>
          </div>
          {selectedDay.sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-forge-ash">
              {startOfDay(selectedDay.date.getTime()) <= todayTs
                ? 'No workout logged this day.'
                : 'Future day — '}
              {startOfDay(selectedDay.date.getTime()) >= todayTs && (
                <Link href="/plan" className="text-forge-lime underline">Pick a day to train</Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-forge-stone">
              {selectedDay.sessions.map(s => {
                const day = dayMap.get(s.dayId);
                const st = statsBySession.get(s.id) ?? { prs: 0, volume: 0, sets: 0, topE1RM: 0 };
                const dur = s.endedAt ? Math.floor((s.endedAt - s.ts) / 1000) : null;
                return (
                  <Link
                    key={s.id}
                    href={`/history/session?id=${s.id}`}
                    className="block px-3 py-2.5 active:bg-forge-stone/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular text-forge-lime min-w-[2.5rem]">
                        {formatTimeOfDay(s.ts)}
                      </span>
                      <span className="font-semibold text-sm flex-1 truncate">{day?.name ?? 'Workout'}</span>
                      {st.prs > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-forge-lime font-bold">
                          <Trophy className="w-2.5 h-2.5" />{st.prs}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-forge-ash tabular mt-1 flex items-center gap-3">
                      <span>{st.sets} sets</span>
                      <span>{Math.round(st.volume).toLocaleString()}kg volume</span>
                      {dur !== null && (
                        <span className="inline-flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatTime(dur)}</span>
                      )}
                      {!s.endedAt && (
                        <span className="px-1.5 py-0 rounded bg-yellow-500/15 text-yellow-300 font-bold uppercase">in progress</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] text-forge-ash text-center px-4 pt-2">
        Lime dots = sessions logged · Trophy = PR set that day · Tap any day to see details
      </div>
    </div>
  );
}
