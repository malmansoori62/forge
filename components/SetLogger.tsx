'use client';
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { suggestNext, checkPR } from '@/lib/progression';
import { useSession, useSettings } from '@/lib/store';
import { calcPlates } from '@/lib/utils';
import { primeRestAudio } from '@/lib/restAudio';
import { isMainLift, FIVE_THREE_ONE_WEEKS, round2_5 } from '@/lib/fiveThreeOne';
import { Check, Plus, Minus, Calculator, Sparkles, Timer, Flame, X, ChevronDown, Zap, Gauge } from 'lucide-react';
import Link from 'next/link';
import PlateCalculator from './PlateCalculator';
import PRBurst from './PRBurst';
import CardioLogger from './CardioLogger';
import type { Exercise } from '@/lib/types';

interface Props {
  exercise: Exercise;
  sessionId: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRIR: number;
  onDone: () => void;
}

export default function SetLogger({
  exercise, sessionId, targetSets, targetRepsMin, targetRepsMax, targetRIR, onDone
}: Props) {
  if (exercise.pattern === 'cardio') {
    return (
      <CardioLogger
        exercise={exercise}
        sessionId={sessionId}
        targetDurationMin={targetRepsMin}
        onDone={onDone}
      />
    );
  }

  const startRest = useSession(s => s.startRest);
  const { intensityMetric, barWeight, trainingMaxes, unit, exerciseUnits, setExerciseUnit } = useSettings();
  const useRPE = intensityMetric === 'rpe';
  const tm = trainingMaxes[exercise.slug] ?? 0;
  const showTMCard = isMainLift(exercise.slug);
  const exUnit = exerciseUnits[exercise.slug] ?? exercise.defaultUnit ?? unit;
  const weightStep = exUnit === 'lb' ? 5 : 2.5;

  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(targetRepsMin);
  const [rir, setRir] = useState<number>(targetRIR);
  const [rpe, setRpe] = useState<number>(8);
  const [calcOpen, setCalcOpen] = useState(false);
  const [pr, setPr] = useState(false);
  const [suggestion, setSuggestion] = useState<{ weight: number; message: string; reason: string } | null>(null);
  const [restSec, setRestSec] = useState<number>(exercise.defaultRestSec ?? 90);
  const [isWarmup, setIsWarmup] = useState(false);
  const [pendingDropParent, setPendingDropParent] = useState<number | null>(null);

  // Sets already logged in this session for this exercise
  const setsThisSession = useLiveQuery(
    () => db.sets.where('sessionId').equals(sessionId).filter(s => s.exerciseSlug === exercise.slug).sortBy('loggedAt'),
    [sessionId, exercise.slug]
  );

  // Last session's top set for diff display
  const lastTop = useLiveQuery(async () => {
    const prev = await db.sets
      .where('exerciseSlug').equals(exercise.slug)
      .filter(s => s.sessionId !== sessionId && !s.isWarmup)
      .reverse().sortBy('loggedAt');
    if (prev.length === 0) return null;
    const lastSid = prev[0].sessionId;
    const lastSets = prev.filter(p => p.sessionId === lastSid);
    return lastSets.reduce((m, s) => (s.weight > m.weight ? s : m), lastSets[0]);
  }, [exercise.slug, sessionId]);

  // Suggest starting weight based on history
  useEffect(() => {
    let alive = true;
    suggestNext(exercise, targetRepsMin, targetRepsMax, targetRIR).then(s => {
      if (!alive) return;
      setSuggestion({ weight: s.weight, message: s.message, reason: s.reason });
      if (weight === 0 && s.weight > 0) setWeight(s.weight);
    });
    return () => { alive = false; };
  }, [exercise.slug]);

  const workingSets = setsThisSession?.filter(s => !s.isWarmup && !s.parentSetId) ?? [];
  const warmupSets = setsThisSession?.filter(s => s.isWarmup) ?? [];
  const dropSets = setsThisSession?.filter(s => s.parentSetId) ?? [];
  const setsDone = workingSets.length;
  const nextSetIndex = setsDone + 1;
  const isLast = nextSetIndex >= targetSets;

  const dropsByParent = useMemo(() => {
    const m = new Map<number, typeof dropSets>();
    for (const d of dropSets) {
      if (!d.parentSetId) continue;
      const arr = m.get(d.parentSetId) ?? [];
      arr.push(d);
      m.set(d.parentSetId, arr);
    }
    return m;
  }, [dropSets]);

  async function logSet() {
    primeRestAudio();
    const inputRir = useRPE ? Math.max(0, 10 - rpe) : rir;
    const isPR = isWarmup || pendingDropParent ? false : await checkPR(exercise.slug, weight, reps);
    const id = await db.sets.add({
      sessionId,
      exerciseSlug: exercise.slug,
      setIndex: isWarmup
        ? -(warmupSets.length + 1)
        : pendingDropParent
          ? -1000 - dropSets.length
          : nextSetIndex,
      weight, reps,
      rir: inputRir,
      rpe: useRPE ? rpe : undefined,
      isPR,
      isWarmup,
      parentSetId: pendingDropParent ?? undefined,
      unit: exUnit,
      loggedAt: Date.now()
    });
    if (isPR) {
      setPr(true);
      setTimeout(() => setPr(false), 2200);
    }
    if (isWarmup) {
      startRest(45);
      setIsWarmup(false);
    } else if (pendingDropParent) {
      startRest(15);
      setPendingDropParent(null);
      setWeight(w => Math.max(0, +(w * 0.8).toFixed(1)));
    } else {
      startRest(restSec);
      if (isLast) setTimeout(onDone, 600);
    }
  }

  async function autoWarmup() {
    if (weight <= 0) {
      alert('Set your working weight first.');
      return;
    }
    const wm = (pct: number, r: number) => ({
      sessionId,
      exerciseSlug: exercise.slug,
      setIndex: -(warmupSets.length + 99),
      weight: Math.max(barWeight, Math.round((weight * pct) / 2.5) * 2.5),
      reps: r,
      rir: 5,
      isWarmup: true,
      loggedAt: Date.now()
    });
    const ws = [
      wm(0.4, 8),
      wm(0.6, 5),
      wm(0.8, 3)
    ];
    for (let i = 0; i < ws.length; i++) {
      await db.sets.add({ ...ws[i], setIndex: ws[i].setIndex + i, loggedAt: Date.now() + i });
    }
  }

  async function deleteSet(id: number) {
    if (!confirm('Delete this set?')) return;
    // Also delete any drop sets that reference this one
    await db.transaction('rw', db.sets, async () => {
      const drops = await db.sets.where('parentSetId').equals(id).toArray();
      for (const d of drops) await db.sets.delete(d.id!);
      await db.sets.delete(id);
    });
  }

  function addDropFor(parentId: number, parentWeight: number) {
    setPendingDropParent(parentId);
    setIsWarmup(false);
    setWeight(Math.max(0, +(parentWeight * 0.8).toFixed(1)));
  }

  const restPresets = [60, 90, 120, 180, 240];
  const plates = useMemo(() => calcPlates(weight, barWeight), [weight, barWeight]);
  const showsPlatesViz = weight >= barWeight && plates.perSide.length > 0;

  const diffChip = useMemo(() => {
    if (!lastTop || weight <= 0) return null;
    const delta = weight - lastTop.weight;
    if (delta === 0) return { text: `= last ${lastTop.weight}kg`, color: 'text-forge-ash' };
    if (delta > 0) return { text: `+${delta}kg vs last`, color: 'text-forge-lime' };
    return { text: `${delta}kg vs last`, color: 'text-yellow-400' };
  }, [lastTop, weight]);

  function adjustWeight(delta: number) {
    setWeight(w => Math.max(0, +(w + delta).toFixed(2)));
  }

  return (
    <div className="space-y-4">
      {/* Tempo */}
      {exercise.tempo && (
        <div className="text-[10px] text-forge-ash uppercase tracking-wider">
          Tempo <span className="text-forge-lime font-bold tabular ml-1">{exercise.tempo.split('').join('-')}</span>
          <span className="ml-1">(ecc-pause-con-lockout)</span>
        </div>
      )}

      {/* 5/3/1 TM card — main lifts only */}
      {showTMCard && (
        <div className="rounded-xl bg-forge-coal border border-forge-stone overflow-hidden">
          {tm === 0 ? (
            <Link href="/training-max" className="flex items-center gap-2 px-3 py-2 text-xs text-forge-ash hover:text-forge-lime">
              <Gauge className="w-4 h-4 text-forge-lime shrink-0" />
              <span className="flex-1">Set Training Max for 5/3/1 prescriptions</span>
              <span className="text-forge-lime font-bold">Setup →</span>
            </Link>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-forge-stone bg-forge-ink/40">
                <span className="text-[10px] uppercase tracking-wider text-forge-ash inline-flex items-center gap-1">
                  <Gauge className="w-3 h-3" /> 5/3/1 · TM {tm}kg
                </span>
                <Link href="/training-max" className="text-[10px] text-forge-lime font-bold">EDIT</Link>
              </div>
              <div className="divide-y divide-forge-stone">
                {FIVE_THREE_ONE_WEEKS.map(wk => (
                  <div key={wk.key} className="grid grid-cols-[5.5rem_1fr_1fr_1fr] gap-1 px-2 py-1 items-center">
                    <span className="text-[10px] text-forge-ash truncate">{wk.label.replace('Week ', 'W')}</span>
                    {wk.sets.map((s, i) => {
                      const w = round2_5(tm * s.pct);
                      const active = weight === w;
                      return (
                        <button
                          key={i}
                          onClick={() => { setWeight(w); if (typeof s.reps === 'number') setReps(s.reps); }}
                          className={`rounded px-1 py-0.5 text-center transition ${
                            active ? 'bg-forge-lime/20 text-forge-lime' : 'text-forge-bone hover:bg-forge-stone'
                          }`}
                        >
                          <div className="text-xs font-bold tabular leading-tight">{w}</div>
                          <div className="text-[9px] text-forge-ash tabular leading-tight">×{s.reps}</div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Suggestion chip */}
      {suggestion && (
        <button
          onClick={() => setWeight(suggestion.weight || weight)}
          className="w-full text-left rounded-xl bg-forge-lime/10 border border-forge-lime/30 px-3 py-2 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-forge-lime shrink-0" />
          <div className="text-xs text-forge-bone flex-1">{suggestion.message}</div>
          {suggestion.weight > 0 && (
            <span className="text-xs font-bold text-forge-lime tabular">{suggestion.weight}kg</span>
          )}
        </button>
      )}

      {/* Logged sets */}
      {(setsDone > 0 || warmupSets.length > 0 || dropSets.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {warmupSets.map(s => (
            <button
              key={s.id}
              onDoubleClick={() => deleteSet(s.id!)}
              className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40 text-xs font-semibold tabular flex items-center gap-1"
              title="Warmup — double-click to delete"
            >
              <Flame className="w-3 h-3 text-orange-400" />
              <span>{s.weight}{s.unit ?? 'kg'} × {s.reps}</span>
            </button>
          ))}
          {workingSets.map(s => {
            const drops = dropsByParent.get(s.id!) ?? [];
            return (
              <div key={s.id} className="inline-flex gap-1 items-center">
                <button
                  onDoubleClick={() => deleteSet(s.id!)}
                  className="px-2.5 py-1 rounded-lg bg-forge-stone text-xs font-semibold tabular flex items-center gap-1"
                  title="Double-click to delete"
                >
                  <span className="text-forge-ash">#{s.setIndex}</span>
                  <span>{s.weight}{s.unit ?? 'kg'} × {s.reps}</span>
                  {s.isPR && <span className="text-forge-lime">★</span>}
                </button>
                {drops.map(d => (
                  <span key={d.id} className="px-1.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/40 text-xs font-semibold tabular flex items-center gap-1">
                    <ChevronDown className="w-3 h-3 text-purple-400" />
                    {d.weight}{d.unit ?? 'kg'}×{d.reps}
                  </span>
                ))}
                <button
                  onClick={() => addDropFor(s.id!, s.weight)}
                  className="text-[10px] text-forge-ash hover:text-purple-400 px-1"
                  title="Add drop set"
                >
                  +drop
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode banner */}
      {pendingDropParent !== null && (
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/40 px-3 py-2 flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-purple-400" />
          <div className="text-xs text-forge-bone flex-1">Drop set — weight pre-filled at 80% of parent.</div>
          <button onClick={() => setPendingDropParent(null)} className="text-purple-300"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <Stepper
          label="Weight"
          value={weight}
          onChange={setWeight}
          step={weightStep}
          minValue={0}
          decimal
          unitChip={
            <div className="flex rounded overflow-hidden border border-forge-stone">
              {(['kg', 'lb'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setExerciseUnit(exercise.slug, u)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    exUnit === u ? 'bg-forge-lime text-forge-ink' : 'text-forge-ash'
                  }`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          }
        />
        <Stepper
          label="Reps"
          value={reps}
          onChange={setReps}
          step={1}
          minValue={0}
        />
      </div>

      {/* Plate strip + diff chip — only for kg + barbell exercises */}
      {exUnit === 'kg' && (showsPlatesViz || diffChip) && (
        <div className="flex items-center justify-between gap-2 -mt-2">
          <button onClick={() => setCalcOpen(true)} className="flex items-center gap-0.5 overflow-hidden">
            {showsPlatesViz && plates.perSide.map((p, i) => (
              Array.from({ length: p.count }).map((_, j) => (
                <span
                  key={`${i}-${j}`}
                  className="rounded-sm font-bold tabular text-forge-ink text-[9px] px-1"
                  style={{
                    background: plateColor(p.weight),
                    height: Math.min(28, 10 + p.weight),
                    minWidth: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={`${p.weight}kg`}
                >
                  {p.weight}
                </span>
              ))
            ))}
            {showsPlatesViz && plates.remainder > 0 && (
              <span className="text-[10px] text-yellow-400 ml-1">+{plates.remainder}kg</span>
            )}
          </button>
          {diffChip && (
            <span className={`text-[11px] font-bold tabular ${diffChip.color}`}>{diffChip.text}</span>
          )}
        </div>
      )}
      {exUnit === 'lb' && diffChip && (
        <div className="flex justify-end -mt-2">
          <span className={`text-[11px] font-bold tabular ${diffChip.color}`}>{diffChip.text}</span>
        </div>
      )}

      {/* RIR or RPE — segmented pill */}
      <div>
        <label className="text-[10px] uppercase tracking-wide text-forge-ash mb-1 block h-5">
          {useRPE ? 'RPE  ·  1 easy, 10 max effort' : 'RIR  ·  reps in reserve'}
        </label>
        <div className="flex items-stretch rounded-xl bg-forge-coal border border-forge-stone overflow-hidden h-12">
          {(useRPE ? [1,2,3,4,5,6,7,8,9,10] : [0,1,2,3,4,5]).map((n, i, arr) => {
            const active = useRPE ? rpe === n : rir === n;
            const setter = useRPE ? setRpe : setRir;
            return (
              <button
                key={n}
                onClick={() => setter(n)}
                className={`flex-1 min-w-0 text-sm font-bold tabular transition ${
                  active ? 'bg-forge-lime text-forge-ink' : 'text-forge-bone active:bg-forge-stone active:text-forge-lime'
                } ${i < arr.length - 1 ? 'border-r border-forge-stone' : ''}`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rest after set — stepper + presets */}
      <div>
        <label className="text-[10px] uppercase tracking-wide text-forge-ash flex items-center gap-1 mb-1 h-5">
          <Timer className="w-3 h-3" /> Rest after set
        </label>
        <div className="flex items-stretch rounded-xl bg-forge-coal border border-forge-stone overflow-hidden h-14">
          <button
            onClick={() => setRestSec(s => Math.max(0, s - 15))}
            className="px-3 flex items-center justify-center text-forge-ash active:bg-forge-stone active:text-forge-lime border-r border-forge-stone transition gap-0.5"
            aria-label="Decrease rest"
          >
            <Minus className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-[10px] font-bold">15</span>
          </button>
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
            <span className="font-bold tabular text-3xl text-forge-bone leading-none">
              {Math.floor(restSec / 60)}:{(restSec % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] text-forge-ash uppercase tracking-wider mt-0.5">m : ss</span>
          </div>
          <button
            onClick={() => setRestSec(s => s + 15)}
            className="px-3 flex items-center justify-center text-forge-ash active:bg-forge-stone active:text-forge-lime border-l border-forge-stone transition gap-0.5"
            aria-label="Increase rest"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-[10px] font-bold">15</span>
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5 mt-1.5">
          {restPresets.map(s => (
            <button
              key={s}
              onClick={() => setRestSec(s)}
              className={`py-1.5 rounded-lg text-xs font-bold tabular border transition ${
                restSec === s
                  ? 'bg-forge-lime text-forge-ink border-forge-lime'
                  : 'bg-forge-coal border-forge-stone text-forge-ash active:bg-forge-stone active:text-forge-bone'
              }`}
            >
              {s < 60 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Warmup toggle + auto warmup */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => { setIsWarmup(v => !v); setPendingDropParent(null); }}
          className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold uppercase tracking-wide ${
            isWarmup
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
              : 'bg-forge-coal border-forge-stone text-forge-ash hover:text-forge-bone'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          {isWarmup ? 'Warmup mode' : 'Warmup'}
        </button>
        <button
          onClick={autoWarmup}
          disabled={weight <= 0}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 text-xs font-bold uppercase tracking-wide py-2 disabled:opacity-40"
          title="Auto pyramid 40% × 8 → 60% × 5 → 80% × 3"
        >
          <Zap className="w-3.5 h-3.5" /> Auto
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setCalcOpen(true)}
          className="px-3 py-3 rounded-xl bg-forge-coal border border-forge-stone text-forge-ash hover:text-forge-lime"
          title="Plate calculator"
        >
          <Calculator className="w-5 h-5" />
        </button>
        <button
          onClick={() => startRest(restSec)}
          className="px-3 py-3 rounded-xl bg-forge-coal border border-forge-stone text-forge-ash hover:text-forge-lime"
          title="Start rest now"
        >
          <Timer className="w-5 h-5" />
        </button>
        <button
          onClick={logSet}
          disabled={weight <= 0 || reps <= 0}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold py-3 active:scale-[0.98] transition disabled:opacity-50 ${
            isWarmup
              ? 'bg-orange-500 text-forge-ink'
              : pendingDropParent !== null
                ? 'bg-purple-500 text-forge-ink'
                : 'bg-forge-lime text-forge-ink'
          }`}
        >
          {isWarmup ? <Flame className="w-5 h-5" /> : pendingDropParent ? <ChevronDown className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          {isWarmup
            ? `Log Warmup ${warmupSets.length + 1}`
            : pendingDropParent !== null
              ? 'Log Drop'
              : `Log Set ${nextSetIndex}/${targetSets}`}
        </button>
      </div>

      <PlateCalculator open={calcOpen} onClose={() => setCalcOpen(false)} initialTarget={weight} />
      <PRBurst show={pr} />
    </div>
  );
}

function plateColor(w: number): string {
  if (w >= 25) return '#ef4444';
  if (w >= 20) return '#3b82f6';
  if (w >= 15) return '#eab308';
  if (w >= 10) return '#22c55e';
  if (w >= 5) return '#e5e7eb';
  if (w >= 2.5) return '#94a3b8';
  return '#52525b';
}

function Stepper({
  label, value, onChange, step = 1, minValue, decimal = false, unitChip
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  minValue?: number;
  decimal?: boolean;
  unitChip?: React.ReactNode;
}) {
  const dec = () => {
    const next = +(value - step).toFixed(decimal ? 2 : 0);
    onChange(minValue !== undefined ? Math.max(minValue, next) : next);
  };
  const inc = () => {
    const next = +(value + step).toFixed(decimal ? 2 : 0);
    onChange(next);
  };
  return (
    <div>
      <div className="flex items-center justify-between h-5 mb-1">
        <label className="text-[10px] uppercase tracking-wide text-forge-ash">{label}</label>
        {unitChip}
      </div>
      <div className="flex items-stretch rounded-xl bg-forge-coal border border-forge-stone overflow-hidden h-14">
        <button
          onClick={dec}
          className="px-3 flex items-center justify-center text-forge-ash active:bg-forge-stone active:text-forge-lime border-r border-forge-stone transition"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <input
          type="number"
          inputMode={decimal ? 'decimal' : 'numeric'}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          onFocus={e => e.target.select()}
          className="flex-1 min-w-0 bg-transparent text-center font-bold tabular text-3xl outline-none focus:bg-forge-stone/40 transition"
        />
        <button
          onClick={inc}
          className="px-3 flex items-center justify-center text-forge-ash active:bg-forge-stone active:text-forge-lime border-l border-forge-stone transition"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
