'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { db } from '@/lib/db';
import { analyzeSession, type CoachFeedback } from '@/lib/postWorkoutCoach';
import type { PlanDay, WorkingSet } from '@/lib/types';
import { formatTime, formatDateTime } from '@/lib/utils';
import {
  CheckCircle2, Trophy, Activity, Clock, Dumbbell, Sparkles,
  AlertCircle, Flame, BookOpen, ChevronRight, Calendar
} from 'lucide-react';

const FEELINGS: { v: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { v: 1, emoji: '😵', label: 'Wrecked' },
  { v: 2, emoji: '😐', label: 'Tired' },
  { v: 3, emoji: '🙂', label: 'OK' },
  { v: 4, emoji: '💪', label: 'Strong' },
  { v: 5, emoji: '🔥', label: 'Crushed it' }
];

export default function SessionCompletePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = Number(params.id);

  const session = useLiveQuery(() => db.sessions.get(id), [id]);
  const sets = useLiveQuery(() => db.sets.where('sessionId').equals(id).toArray(), [id]);
  const day = useLiveQuery(
    () => (session?.dayId
      ? db.days.get(session.dayId)
      : Promise.resolve(undefined as PlanDay | undefined)),
    [session?.dayId]
  );
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  // Pull every previous logged set for the exercises in this session, for diff analysis.
  const sessionSlugs = useMemo(() => new Set((sets ?? []).map(s => s.exerciseSlug)), [sets]);
  const historicalSets = useLiveQuery(async () => {
    const m = new Map<string, any[]>();
    for (const slug of sessionSlugs) {
      const all = await db.sets.where('exerciseSlug').equals(slug).toArray();
      m.set(slug, all);
    }
    return m;
  }, [sessionSlugs]);

  const analysis = useMemo(() => {
    if (!session || !sets || !exercises || !historicalSets) return null;
    const exMap = new Map(exercises.map(e => [e.slug, e]));
    return analyzeSession({ session, sets, exercises: exMap, historicalSets });
  }, [session, sets, exercises, historicalSets]);

  const [completedChecklist, setCompletedChecklist] = useState<Set<number>>(new Set());

  async function setFeeling(v: 1 | 2 | 3 | 4 | 5) {
    if (!session) return;
    await db.sessions.update(id, { feelings: v });
  }

  if (!session || !analysis || !day) {
    return <div className="p-6 animate-pulse text-forge-ash">Loading summary…</div>;
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forge-lime/15 border-2 border-forge-lime">
          <CheckCircle2 className="w-9 h-9 text-forge-lime" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter">Session Complete<span className="text-forge-lime">.</span></h1>
        <p className="text-sm text-forge-bone font-semibold">{day.name}</p>
        <p className="text-[11px] text-forge-ash tabular inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {formatDateTime(session.startedAt)}
        </p>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-4 gap-2">
        <Stat icon={<Clock className="w-3 h-3" />} label="Time" value={formatTime(analysis.durationSec)} />
        <Stat icon={<Dumbbell className="w-3 h-3" />} label="Sets" value={analysis.workingSets.toString()} />
        <Stat icon={<Activity className="w-3 h-3" />} label="Volume" value={`${Math.round(analysis.totalVolume).toLocaleString()}`} sub="kg" />
        <Stat icon={<Trophy className="w-3 h-3" />} label="PRs" value={analysis.prCount.toString()} accent={analysis.prCount > 0} />
      </div>

      {/* PR celebration */}
      {analysis.prCount > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-forge-lime/20 to-forge-coal border border-forge-lime/40 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-forge-lime" />
            <h2 className="font-bold text-forge-lime">
              {analysis.prCount} New Personal Record{analysis.prCount > 1 ? 's' : ''}
            </h2>
          </div>
          {analysis.prDetails.map((pr, i) => (
            <div key={i} className="text-sm text-forge-bone tabular pl-7">
              ★ <span className="font-semibold">{pr.exercise}</span> · {pr.weight}{pr.unit} × {pr.reps}
            </div>
          ))}
        </div>
      )}

      {/* Coach feedback */}
      <section className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-forge-lime font-bold flex items-center gap-1 px-1">
          <BookOpen className="w-3.5 h-3.5" /> Coach notes
        </h2>
        <div className="space-y-1.5">
          {analysis.feedback.length === 0 ? (
            <div className="rounded-xl bg-forge-coal border border-forge-stone p-3 text-sm text-forge-ash">
              Log a few sessions and your coach feedback will start comparing weights, rest, and progression for you.
            </div>
          ) : (
            analysis.feedback.map((f, i) => <CoachLine key={i} feedback={f} />)
          )}
        </div>
      </section>

      {/* Feeling rating */}
      <section className="rounded-2xl bg-forge-coal border border-forge-stone p-3 space-y-2">
        <div className="text-xs uppercase tracking-wider text-forge-ash font-bold">How did it feel?</div>
        <div className="grid grid-cols-5 gap-1.5">
          {FEELINGS.map(f => {
            const active = session.feelings === f.v;
            return (
              <button
                key={f.v}
                onClick={() => setFeeling(f.v)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg border transition ${
                  active
                    ? 'bg-forge-lime/15 border-forge-lime text-forge-lime'
                    : 'bg-forge-coal border-forge-stone text-forge-bone active:bg-forge-stone'
                }`}
              >
                <span className="text-2xl leading-none">{f.emoji}</span>
                <span className="text-[9px] uppercase tracking-wider">{f.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recovery checklist */}
      <section className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-forge-lime font-bold flex items-center gap-1 px-1">
          <Sparkles className="w-3.5 h-3.5" /> Recovery checklist
        </h2>
        <div className="rounded-2xl bg-forge-coal border border-forge-stone divide-y divide-forge-stone overflow-hidden">
          {analysis.recovery.map((r, i) => {
            const done = completedChecklist.has(i);
            return (
              <button
                key={i}
                onClick={() => setCompletedChecklist(s => {
                  const next = new Set(s);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })}
                className={`w-full text-left p-3 flex gap-3 items-start transition ${
                  done ? 'opacity-50' : ''
                }`}
              >
                <span className="text-2xl shrink-0 leading-none">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm ${done ? 'line-through' : ''}`}>{r.title}</div>
                  <p className="text-xs text-forge-ash mt-0.5 leading-snug">{r.detail}</p>
                </div>
                <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                  done ? 'bg-forge-lime border-forge-lime' : 'border-forge-stone'
                }`}>
                  {done && <CheckCircle2 className="w-4 h-4 text-forge-ink" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <Link
          href={`/history/${id}`}
          className="flex items-center justify-between rounded-xl bg-forge-coal border border-forge-stone p-3 active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-forge-lime" />
            <span className="text-sm font-semibold">View full session detail</span>
          </div>
          <ChevronRight className="w-4 h-4 text-forge-ash" />
        </Link>
        <button
          onClick={() => router.push('/')}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forge-lime text-forge-ink font-bold py-4 active:scale-[0.98] transition text-base"
        >
          <CheckCircle2 className="w-5 h-5" />
          Done
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-2.5 ${accent ? 'bg-forge-lime/10 border-forge-lime/40' : 'bg-forge-coal border-forge-stone'}`}>
      <div className="text-[9px] uppercase tracking-wide text-forge-ash inline-flex items-center gap-0.5">{icon}{label}</div>
      <div className={`text-base font-bold tabular leading-tight ${accent ? 'text-forge-lime' : ''}`}>
        {value}{sub && <span className="text-[10px] text-forge-ash ml-0.5 font-normal">{sub}</span>}
      </div>
    </div>
  );
}

function CoachLine({ feedback }: { feedback: CoachFeedback }) {
  const cfg = {
    good: { ring: 'border-forge-lime/30 bg-forge-lime/5', icon: <Sparkles className="w-4 h-4 text-forge-lime" /> },
    pr:   { ring: 'border-forge-lime/50 bg-forge-lime/10', icon: <Trophy className="w-4 h-4 text-forge-lime" /> },
    warn: { ring: 'border-yellow-500/30 bg-yellow-500/5', icon: <AlertCircle className="w-4 h-4 text-yellow-400" /> },
    info: { ring: 'border-forge-stone bg-forge-coal', icon: <Flame className="w-4 h-4 text-forge-ash" /> }
  }[feedback.level];
  return (
    <div className={`rounded-xl border p-3 flex gap-2 items-start ${cfg.ring}`}>
      <span className="shrink-0 mt-0.5">{cfg.icon}</span>
      <p className="text-sm text-forge-bone leading-snug flex-1">{feedback.text}</p>
    </div>
  );
}
