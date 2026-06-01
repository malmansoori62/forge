'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Muscle } from './types';

export type IntensityMetric = 'rir' | 'rpe';

interface UnitState {
  unit: 'kg' | 'lb';
  barWeight: number;
  intensityMetric: IntensityMetric;
  volumeGoals: Partial<Record<Muscle, number>>;
  notificationsEnabled: boolean;
  /** Training Max (kg) per exercise slug — used by 5/3/1, GZCLP, etc. */
  trainingMaxes: Record<string, number>;
  /** Per-exercise unit override (when the gym has kg and lb equipment mixed). */
  exerciseUnits: Record<string, 'kg' | 'lb'>;
  /** Speak "Get ready / Go" voice cues when rest is about to end. */
  voiceCuesEnabled: boolean;
  setUnit: (u: 'kg' | 'lb') => void;
  setBar: (w: number) => void;
  setIntensityMetric: (m: IntensityMetric) => void;
  setVolumeGoal: (muscle: Muscle, sets: number) => void;
  setNotificationsEnabled: (b: boolean) => void;
  setTrainingMax: (slug: string, kg: number) => void;
  setExerciseUnit: (slug: string, unit: 'kg' | 'lb') => void;
  setVoiceCuesEnabled: (b: boolean) => void;
}

const DEFAULT_VOLUME_GOALS: Partial<Record<Muscle, number>> = {
  chest: 12, 'front-delt': 8, 'side-delt': 12, 'rear-delt': 10,
  lats: 14, 'upper-back': 12, traps: 6, 'lower-back': 6,
  biceps: 12, triceps: 12, forearms: 4,
  quads: 14, hamstrings: 12, glutes: 12, calves: 10,
  abs: 8
};

export const useSettings = create<UnitState>()(
  persist(
    set => ({
      unit: 'kg',
      barWeight: 20,
      intensityMetric: 'rir',
      volumeGoals: DEFAULT_VOLUME_GOALS,
      notificationsEnabled: false,
      trainingMaxes: {},
      exerciseUnits: {},
      voiceCuesEnabled: true,
      setUnit: u => set({ unit: u }),
      setBar: w => set({ barWeight: w }),
      setIntensityMetric: m => set({ intensityMetric: m }),
      setVolumeGoal: (muscle, sets) =>
        set(state => ({ volumeGoals: { ...state.volumeGoals, [muscle]: sets } })),
      setNotificationsEnabled: b => set({ notificationsEnabled: b }),
      setTrainingMax: (slug, kg) =>
        set(state => ({ trainingMaxes: { ...state.trainingMaxes, [slug]: kg } })),
      setExerciseUnit: (slug, unit) =>
        set(state => ({ exerciseUnits: { ...state.exerciseUnits, [slug]: unit } })),
      setVoiceCuesEnabled: b => set({ voiceCuesEnabled: b })
    }),
    { name: 'forge-settings' }
  )
);

interface SessionState {
  activeSessionId: number | null;
  activeDayId: number | null;
  currentExerciseIndex: number;
  restEndsAt: number | null;
  setActive: (sessionId: number, dayId: number) => void;
  clearActive: () => void;
  setExerciseIndex: (i: number) => void;
  startRest: (sec: number) => void;
  extendRest: (deltaSec: number) => void;
  cancelRest: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    set => ({
      activeSessionId: null,
      activeDayId: null,
      currentExerciseIndex: 0,
      restEndsAt: null,
      setActive: (sessionId, dayId) =>
        set({ activeSessionId: sessionId, activeDayId: dayId, currentExerciseIndex: 0 }),
      clearActive: () =>
        set({ activeSessionId: null, activeDayId: null, currentExerciseIndex: 0, restEndsAt: null }),
      setExerciseIndex: i => set({ currentExerciseIndex: i }),
      startRest: sec => set({ restEndsAt: Date.now() + sec * 1000 }),
      extendRest: deltaSec => set(state => ({
        restEndsAt: state.restEndsAt
          ? state.restEndsAt + deltaSec * 1000
          : Date.now() + Math.max(0, deltaSec) * 1000
      })),
      cancelRest: () => set({ restEndsAt: null })
    }),
    { name: 'forge-active-session' }
  )
);
