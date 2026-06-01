'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/db';
import type { DayExercise, WorkingSet, PlanDay, Session } from '@/lib/types';
import { useSession } from '@/lib/store';
import { daysAgo } from '@/lib/utils';
import SetLogger from '@/components/SetLogger';
import RestTimer from '@/components/RestTimer';
import SwapSheet from '@/components/SwapSheet';
import ExerciseImage from '@/components/ExerciseImage';
import CoachPanel from '@/components/CoachPanel';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Repeat, NotebookPen, Save, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export default function SessionPage() {
  const router = useRouter();
  const { activeSessionId, activeDayId, currentExerciseIndex, setExerciseIndex, clearActive } = useSession();

  const day = useLiveQuery(
    () => (activeDayId
      ? db.days.get(activeDayId)
      : Promise.resolve(undefined as PlanDay | undefined)),
    [activeDayId]
  );
  const dayExercises = useLiveQuery(
    () => (activeDayId
      ? db.dayExercises.where('dayId').equals(activeDayId).sortBy('order')
      : Promise.resolve([] as DayExercise[])),
    [activeDayId]
  );
  const allEx = useLiveQuery(() => db.exercises.toArray(), []);
  const session = useLiveQuery(
    () => (activeSessionId
      ? db.sessions.get(activeSessionId)
      : Promise.resolve(undefined as Session | undefined)),
    [activeSessionId]
  );
  const setsLogged = useLiveQuery(
    () => (activeSessionId
      ? db.sets.where('sessionId').equals(activeSessionId).toArray()
      : Promise.resolve([] as WorkingSet[])),
    [activeSessionId]
  );

  const [swapFor, setSwapFor] = useState<number | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (session?.note) setNoteText(session.note);
  }, [session?.note]);

  useEffect(() => {
    if (!session?.startedAt || session.endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session?.startedAt, session?.endedAt]);

  const elapsedSec = session?.startedAt
    ? Math.max(0, Math.floor((now - session.startedAt) / 1000))
    : 0;

  const enriched = useMemo(() => {
    if (!dayExercises || !allEx) return [];
    const map = new Map(allEx.map(e => [e.slug, e]));
    return dayExercises.map(de => ({ ...de, exercise: map.get(de.exerciseSlug) }));
  }, [dayExercises, allEx]);

  const current = enriched[currentExerciseIndex];

  // Last session stats for this exercise (excluding this one)
  const lastStats = useLiveQuery(async () => {
    if (!current?.exercise) return null;
    const sets = await db.sets
      .where('exerciseSlug').equals(current.exercise.slug)
      .filter(s => s.sessionId !== activeSessionId)
      .reverse().sortBy('loggedAt');
    if (sets.length === 0) return null;
    const lastSessionId = sets[0].sessionId;
    const lastSets = sets.filter(s => s.sessionId === lastSessionId);
    const top = lastSets.reduce((m, s) => (s.weight > m.weight ? s : m), lastSets[0]);
    return { top, count: lastSets.length, when: lastSets[0].loggedAt };
  }, [current?.exercise?.slug, activeSessionId]);

  if (!activeSessionId || !activeDayId) {
    return (
      <div className="p-6 text-center">
        <p className="text-forge-ash mb-4">No active session.</p>
        <Link href="/plan" className="text-forge-lime underline">Start one from the Plan</Link>
      </div>
    );
  }
  if (!day || !current || !current.exercise) {
    return <div className="p-6 text-forge-ash animate-pulse">Loading session…</div>;
  }

  const workingLogged = setsLogged?.filter(s => !s.isWarmup) ?? [];
  const setsForCurrent = workingLogged.filter(s => s.exerciseSlug === current.exerciseSlug).length;
  const totalSets = enriched.reduce((s, e) => s + e.targetSets, 0);
  const doneSets = workingLogged.length;
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  // Time since the most recent set was logged for the current exercise — counts up
  const lastSetForCurrent = (setsLogged ?? [])
    .filter(s => s.exerciseSlug === current.exerciseSlug)
    .reduce<WorkingSet | null>((m, s) => (!m || s.loggedAt > m.loggedAt ? s : m), null);
  const sinceLastSetSec = lastSetForCurrent
    ? Math.max(0, Math.floor((now - lastSetForCurrent.loggedAt) / 1000))
    : 0;
  const targetRestSec = current.exercise.defaultRestSec ?? 90;

  async function endSession() {
    if (!activeSessionId) return;
    if (!confirm('End this session?')) return;
    const finishedId = activeSessionId;
    await db.sessions.update(finishedId, { endedAt: Date.now(), note: noteText || undefined });
    clearActive();
    router.push(`/session/complete?id=${finishedId}`);
  }

  async function saveNote() {
    if (!activeSessionId) return;
    await db.sessions.update(activeSessionId, { note: noteText });
    setNoteOpen(false);
  }

  function next() {
    if (currentExerciseIndex < enriched.length - 1) {
      setExerciseIndex(currentExerciseIndex + 1);
    }
  }
  function prev() {
    if (currentExerciseIndex > 0) setExerciseIndex(currentExerciseIndex - 1);
  }

  return (
    <div className="pb-40">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-forge-ink/95 backdrop-blur px-4 pt-3 pb-2 border-b border-forge-stone">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.push('/')} className="p-2 -m-2 text-forge-ash">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center leading-tight">
            <div className="text-xs font-semibold text-forge-bone">{day.name}</div>
            <div className="text-[10px] text-forge-lime tabular flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTime(elapsedSec)}
            </div>
          </div>
          <button onClick={() => setNoteOpen(true)} className="p-2 -m-2 text-forge-ash hover:text-forge-lime">
            <NotebookPen className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-forge-stone overflow-hidden">
            <div className="h-full bg-forge-lime transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-forge-ash tabular">{doneSets}/{totalSets}</span>
        </div>
      </header>

      {/* Exercise pager dots */}
      <div className="flex items-center gap-1 px-4 pt-3 overflow-x-auto">
        {enriched.map((e, i) => {
          const exDone = workingLogged.filter(s => s.exerciseSlug === e.exerciseSlug).length;
          const isFull = exDone >= e.targetSets;
          return (
            <button
              key={e.id}
              onClick={() => setExerciseIndex(i)}
              className={`flex flex-col items-center min-w-[44px] py-2 ${
                i === currentExerciseIndex ? 'text-forge-lime' : isFull ? 'text-forge-ash' : 'text-forge-ash/50'
              }`}
            >
              {isFull ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
              <span className="text-[10px] mt-0.5 tabular">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Current exercise */}
      <div className="px-4 mt-2 space-y-3">
        <div className="flex items-start gap-3">
          {current.exercise.image && (
            <ExerciseImage src={current.exercise.image} alt={current.exercise.name} className="w-14 h-14 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold leading-tight">{current.exercise.name}</h2>
            <p className="text-xs text-forge-ash mt-0.5 tabular">
              {current.exercise.pattern === 'cardio' ? (
                <>Target {current.targetRepsMin === current.targetRepsMax ? current.targetRepsMin : `${current.targetRepsMin}–${current.targetRepsMax}`} min</>
              ) : (
                <>Set {Math.min(setsForCurrent + 1, current.targetSets)} of {current.targetSets} · {current.targetRepsMin}–{current.targetRepsMax} reps · RIR {current.targetRIR}</>
              )}
            </p>
          </div>
          <button onClick={() => setSwapFor(current.id!)} className="p-2 -m-2 text-forge-ash hover:text-forge-lime" title="Swap">
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {lastStats && (
            <div className="rounded-xl bg-forge-coal border border-forge-stone p-3">
              <div className="text-[10px] uppercase tracking-wide text-forge-ash">Last time · {daysAgo(lastStats.when)}</div>
              <div className="font-bold tabular mt-0.5 text-sm">
                {lastStats.top.weight}kg × {lastStats.top.reps} <span className="text-forge-ash font-normal">({lastStats.count}set{lastStats.count !== 1 ? 's' : ''})</span>
              </div>
            </div>
          )}
          {lastSetForCurrent ? (
            <div className={`rounded-xl border p-3 ${
              sinceLastSetSec < 30
                ? 'bg-forge-coal border-forge-stone'
                : sinceLastSetSec < targetRestSec
                  ? 'bg-yellow-500/5 border-yellow-500/30'
                  : 'bg-forge-lime/5 border-forge-lime/40'
            }`}>
              <div className="text-[10px] uppercase tracking-wide text-forge-ash inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Since last set
              </div>
              <div className={`font-bold tabular mt-0.5 text-sm ${
                sinceLastSetSec >= targetRestSec ? 'text-forge-lime' : 'text-forge-bone'
              }`}>
                {formatTime(sinceLastSetSec)}
                <span className="text-forge-ash font-normal ml-1">/ {formatTime(targetRestSec)}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-forge-coal border border-forge-stone p-3">
              <div className="text-[10px] uppercase tracking-wide text-forge-ash inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Set #1
              </div>
              <div className="font-bold tabular mt-0.5 text-sm text-forge-bone">Get to work</div>
            </div>
          )}
        </div>

        <CoachPanel exercise={current.exercise} />

        <SetLogger
          key={current.id /* reset when exercise changes */}
          exercise={current.exercise}
          sessionId={activeSessionId}
          targetSets={current.targetSets}
          targetRepsMin={current.targetRepsMin}
          targetRepsMax={current.targetRepsMax}
          targetRIR={current.targetRIR}
          onDone={next}
        />

        <div className="flex items-center justify-between pt-2">
          <button onClick={prev} disabled={currentExerciseIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-forge-ash disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button onClick={next} disabled={currentExerciseIndex >= enriched.length - 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-forge-ash disabled:opacity-30">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={endSession}
          className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-forge-stone bg-forge-coal py-3 font-semibold text-forge-bone hover:border-forge-lime/50"
        >
          End Session
        </button>
      </div>

      <RestTimer />
      <SwapSheet dayExerciseId={swapFor} onClose={() => setSwapFor(null)} />

      {noteOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-end" onClick={() => setNoteOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md mx-auto bg-forge-coal rounded-t-2xl p-4 safe-bottom">
            <div className="text-xs uppercase tracking-wide text-forge-ash mb-2">Session note</div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Sleep, energy, mood, anything to remember…"
              rows={4}
              className="w-full p-3 rounded-xl bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none resize-none"
            />
            <button onClick={saveNote} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forge-lime text-forge-ink py-3 font-bold">
              <Save className="w-4 h-4" /> Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
