'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { db } from '@/lib/db';
import type { PlanDay } from '@/lib/types';
import { daysAgo, startOfDay, formatDateTime } from '@/lib/utils';
import { Flame, ChevronRight, Play, History, Calendar as CalendarIcon, Zap } from 'lucide-react';
import Heatmap from '@/components/Heatmap';
import ExerciseImage from '@/components/ExerciseImage';
import DeloadBanner from '@/components/DeloadBanner';
import BodyweightQuickLog from '@/components/BodyweightQuickLog';
import CoachInsights from '@/components/CoachInsights';
import ResumeSessionBanner from '@/components/ResumeSessionBanner';

export default function HomePage() {
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
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').reverse().limit(60).toArray(), []);

  if (!days || !sessions) {
    return <div className="px-4 pt-6 space-y-4 animate-pulse">
      <div className="h-12 bg-forge-coal rounded-xl" />
      <div className="h-48 bg-forge-coal rounded-2xl" />
      <div className="h-24 bg-forge-coal rounded-xl" />
    </div>;
  }

  const lastByDay = new Map<number, number>();
  for (const s of sessions) {
    if (s.dayId && !lastByDay.has(s.dayId)) lastByDay.set(s.dayId, s.startedAt);
  }

  // Suggest next: day with oldest last-trained timestamp (or never)
  const today = startOfDay(Date.now());
  const sorted = [...days].sort((a, b) => {
    const la = lastByDay.get(a.id!) ?? 0;
    const lb = lastByDay.get(b.id!) ?? 0;
    return la - lb;
  });
  const recommended = sorted[0];
  const streak = calcStreak(sessions.map(s => startOfDay(s.startedAt)));
  const sessionsThisWeek = sessions.filter(s => Date.now() - s.startedAt < 7 * 86400000).length;

  return (
    <div className="px-4 pt-4 pb-2 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">
            FORGE<span className="text-forge-lime">.</span>
          </h1>
          <p className="text-xs text-forge-ash mt-0.5">{activePlan?.name ?? 'Train. Track. Forge.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/calendar" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-forge-coal border border-forge-stone text-forge-ash hover:text-forge-lime" title="Calendar">
            <CalendarIcon className="w-4 h-4" />
          </Link>
          <Link href="/history" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-forge-coal border border-forge-stone text-forge-ash hover:text-forge-lime" title="History">
            <History className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5 text-forge-lime">
            <Flame className="w-4 h-4" />
            <span className="font-semibold tabular">{streak}d</span>
          </div>
        </div>
      </header>

      {/* Resume in-progress session */}
      <ResumeSessionBanner />

      {/* Quick-start: 3 most-recently-trained days */}
      {(() => {
        const recent = [...days]
          .filter(d => lastByDay.has(d.id!))
          .sort((a, b) => (lastByDay.get(b.id!) ?? 0) - (lastByDay.get(a.id!) ?? 0))
          .slice(0, 3);
        if (recent.length === 0) return null;
        return (
          <div>
            <h3 className="text-[10px] uppercase tracking-wider text-forge-ash mb-1.5 px-1 inline-flex items-center gap-1">
              <Zap className="w-3 h-3 text-forge-lime" /> Quick start
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {recent.map(d => (
                <Link
                  key={d.id}
                  href={`/plan/day?slug=${d.slug}`}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-forge-coal border border-forge-stone px-3 py-1.5 text-xs font-semibold hover:border-forge-lime/50 active:scale-95 transition"
                >
                  <Play className="w-3 h-3 text-forge-lime fill-current" />
                  <span className="truncate max-w-[10rem]">{d.name}</span>
                  <span className="text-forge-ash">· {daysAgo(lastByDay.get(d.id!)!)}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Today recommended */}
      {recommended && (
        <Link
          href={`/plan/day?slug=${recommended.slug}`}
          className="block rounded-2xl bg-gradient-to-br from-forge-lime/15 to-forge-coal border border-forge-lime/30 shadow-glow overflow-hidden"
        >
          <div className="p-4">
            <span className="text-[10px] uppercase tracking-widest text-forge-lime font-bold">Today's pick</span>
            <h2 className="text-2xl font-extrabold mt-1">{recommended.name}</h2>
            <p className="text-xs text-forge-ash mt-1 tabular">
              {lastByDay.has(recommended.id!)
                ? <>Last <span className="text-forge-bone font-semibold">{formatDateTime(lastByDay.get(recommended.id!)!)}</span> · {daysAgo(lastByDay.get(recommended.id!)!)}</>
                : <>Never trained</>
              }
            </p>
            <button className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forge-lime text-forge-ink font-bold py-3 active:scale-95 transition">
              <Play className="w-4 h-4 fill-current" />
              Start Session
            </button>
          </div>
          {recommended.illustration && (
            <div className="relative h-32">
              <ExerciseImage
                src={recommended.illustration}
                alt={recommended.name}
                className="w-full h-full"
              />
            </div>
          )}
        </Link>
      )}

      {/* This week stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="This week" value={`${sessionsThisWeek}/6`} />
        <Stat label="Streak" value={`${streak}d`} accent />
        <Stat label="Total" value={sessions.length.toString()} />
      </div>

      <DeloadBanner />

      <CoachInsights />

      <BodyweightQuickLog />

      <Heatmap />

      {/* All days quick access */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-forge-ash mb-2 px-1">All days</h3>
        <div className="space-y-2">
          {days.map(d => (
            <Link key={d.id} href={`/plan/day?slug=${d.slug}`}
              className="flex items-center gap-3 rounded-xl bg-forge-coal border border-forge-stone p-3 active:scale-[0.99] transition">
              <ExerciseImage src={d.illustration} alt={d.name} className="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{d.name}</div>
                <div className="text-xs text-forge-ash tabular truncate">
                  {lastByDay.has(d.id!)
                    ? <><span className="text-forge-bone">{formatDateTime(lastByDay.get(d.id!)!)}</span> · {daysAgo(lastByDay.get(d.id!)!)}</>
                    : 'Never trained'
                  }
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-forge-ash" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? 'bg-forge-lime/5 border-forge-lime/30' : 'bg-forge-coal border-forge-stone'}`}>
      <div className="text-[10px] uppercase tracking-wide text-forge-ash">{label}</div>
      <div className={`text-xl font-bold tabular ${accent ? 'text-forge-lime' : ''}`}>{value}</div>
    </div>
  );
}

function calcStreak(daySet: number[]): number {
  const unique = [...new Set(daySet)].sort((a, b) => b - a);
  if (unique.length === 0) return 0;
  let streak = 0;
  const today = startOfDay(Date.now());
  let cursor = today;
  for (const d of unique) {
    if (d === cursor) { streak++; cursor -= 86400000; continue; }
    if (d === cursor + 86400000) continue;
    if (d < cursor) break;
  }
  // alt: count consecutive days from most recent
  if (streak === 0) {
    let prev = unique[0];
    streak = 1;
    for (let i = 1; i < unique.length; i++) {
      if (prev - unique[i] <= 86400000 * 2) { streak++; prev = unique[i]; } else break;
    }
  }
  return streak;
}
