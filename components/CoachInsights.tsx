'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/lib/db';
import { useSettings } from '@/lib/store';
import { startOfDay } from '@/lib/utils';
import { Sparkles, AlertCircle, TrendingUp, Flame } from 'lucide-react';
import type { Muscle, WorkingSet } from '@/lib/types';

interface Insight {
  level: 'good' | 'warn' | 'info';
  icon: React.ReactNode;
  text: string;
}

export default function CoachInsights() {
  const sets = useLiveQuery(() => db.sets.toArray(), []);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').reverse().limit(20).toArray(), []);
  const { volumeGoals } = useSettings();

  const insights = useMemo<Insight[]>(() => {
    if (!sets || !exercises || !sessions) return [];
    const out: Insight[] = [];
    const exMap = new Map(exercises.map(e => [e.slug, e]));

    // 1. Weekly volume vs goals
    const weekAgo = startOfDay(Date.now()) - 6 * 86400000;
    const recent = sets.filter(s => s.loggedAt >= weekAgo && !s.isWarmup);
    const vol = new Map<Muscle, number>();
    for (const s of recent) {
      const ex = exMap.get(s.exerciseSlug);
      if (!ex) continue;
      for (const m of ex.primary) vol.set(m, (vol.get(m) ?? 0) + 1);
      for (const m of ex.secondary) vol.set(m, (vol.get(m) ?? 0) + 0.5);
    }
    const under: { muscle: string; sets: number; goal: number }[] = [];
    const over: { muscle: string; sets: number; goal: number }[] = [];
    for (const [m, goal] of Object.entries(volumeGoals)) {
      if (!goal) continue;
      const got = vol.get(m as Muscle) ?? 0;
      if (got < goal * 0.5 && recent.length > 0) under.push({ muscle: m, sets: got, goal });
      else if (got > goal * 1.5) over.push({ muscle: m, sets: got, goal });
    }
    if (under.length >= 2) {
      const list = under.slice(0, 3).map(u => `${u.muscle.replace(/-/g, ' ')} (${u.sets}/${u.goal})`).join(', ');
      out.push({ level: 'warn', icon: <AlertCircle className="w-4 h-4 text-yellow-400" />, text: `Undertrained this week: ${list}` });
    } else if (under.length === 1) {
      const u = under[0];
      out.push({ level: 'warn', icon: <AlertCircle className="w-4 h-4 text-yellow-400" />, text: `${u.muscle.replace(/-/g, ' ')} only ${u.sets} sets this week (goal ${u.goal})` });
    }
    if (over.length >= 1 && recent.length > 30) {
      const o = over[0];
      out.push({ level: 'info', icon: <Flame className="w-4 h-4 text-orange-400" />, text: `${o.muscle.replace(/-/g, ' ')} at ${o.sets} sets — well past ${o.goal} target` });
    }

    // 2. Stall detection — per exercise (top set across last 3 sessions)
    const stalled: string[] = [];
    const byEx = new Map<string, Map<number, WorkingSet[]>>();
    for (const s of sets) {
      if (s.isWarmup || s.parentSetId) continue;
      const sm = byEx.get(s.exerciseSlug) ?? new Map<number, WorkingSet[]>();
      const arr = sm.get(s.sessionId) ?? [];
      arr.push(s);
      sm.set(s.sessionId, arr);
      byEx.set(s.exerciseSlug, sm);
    }
    for (const [slug, sm] of byEx) {
      const sessionList = [...sm.entries()]
        .map(([sid, ss]) => ({ sid, top: ss.reduce((m, x) => (x.weight > m.weight ? x : m), ss[0]) }))
        .sort((a, b) => b.top.loggedAt - a.top.loggedAt);
      if (sessionList.length < 3) continue;
      const [a, b, c] = sessionList;
      if (a.top.weight === b.top.weight && b.top.weight === c.top.weight && a.top.reps <= b.top.reps) {
        const ex = exMap.get(slug);
        if (ex) stalled.push(ex.name);
      }
    }
    if (stalled.length > 0) {
      out.push({
        level: 'warn',
        icon: <AlertCircle className="w-4 h-4 text-yellow-400" />,
        text: stalled.length === 1
          ? `${stalled[0]} stalled 3+ sessions — consider deload`
          : `${stalled.length} lifts stalled — consider a deload week`
      });
    }

    // 3. Recent PR streak
    const recentPRs = recent.filter(s => s.isPR).length;
    if (recentPRs >= 3) {
      out.push({ level: 'good', icon: <TrendingUp className="w-4 h-4 text-forge-lime" />, text: `${recentPRs} PRs this week — momentum strong` });
    }

    // 4. Session frequency
    const last7 = sessions.filter(s => s.startedAt >= weekAgo).length;
    if (last7 === 0 && sessions.length > 0) {
      out.push({ level: 'warn', icon: <AlertCircle className="w-4 h-4 text-yellow-400" />, text: 'No sessions in the last 7 days' });
    } else if (last7 >= 5) {
      out.push({ level: 'good', icon: <Flame className="w-4 h-4 text-forge-lime" />, text: `${last7} sessions this week — keep it up` });
    }

    return out.slice(0, 3);
  }, [sets, exercises, sessions, volumeGoals]);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-forge-coal to-forge-stone border border-forge-mist p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-forge-lime" />
        <span className="text-[10px] uppercase tracking-wider text-forge-lime font-bold">Coach</span>
      </div>
      {insights.map((i, idx) => (
        <div key={idx} className="flex items-start gap-2 text-sm">
          <span className="shrink-0 mt-0.5">{i.icon}</span>
          <span className="text-forge-bone leading-snug">{i.text}</span>
        </div>
      ))}
    </div>
  );
}
