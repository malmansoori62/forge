'use client';
import { db } from '@/lib/db';
import { useSettings } from '@/lib/store';
import Link from 'next/link';
import { useRef } from 'react';
import { Download, Upload, Activity, Trash2, RotateCcw, ChevronRight, LayoutGrid, Bell, Gauge, History, Volume2 } from 'lucide-react';
import { useSession } from '@/lib/store';

export default function SettingsPage() {
  const {
    unit, barWeight, intensityMetric, notificationsEnabled, voiceCuesEnabled,
    setUnit, setBar, setIntensityMetric, setNotificationsEnabled, setVoiceCuesEnabled
  } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  async function toggleNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications not supported on this device.');
      return;
    }
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return;
    }
    if (Notification.permission === 'denied') {
      alert('Notifications were blocked. Enable them in your browser settings.');
      return;
    }
    const r = await Notification.requestPermission();
    setNotificationsEnabled(r === 'granted');
  }

  async function exportData() {
    const dump = {
      exportedAt: Date.now(),
      version: 1,
      exercises: await db.exercises.toArray(),
      plans: await db.plans.toArray(),
      days: await db.days.toArray(),
      dayExercises: await db.dayExercises.toArray(),
      sessions: await db.sessions.toArray(),
      sets: await db.sets.toArray(),
      notes: await db.notes.toArray(),
      measurements: await db.measurements.toArray(),
      photos: await db.photos.toArray()
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file: File) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!confirm('This will REPLACE all your current data. Continue?')) return;
      await db.transaction('rw', db.tables, async () => {
        for (const t of db.tables) await t.clear();
        if (data.exercises) await db.exercises.bulkAdd(data.exercises);
        if (data.plans) await db.plans.bulkAdd(data.plans);
        if (data.days) await db.days.bulkAdd(data.days);
        if (data.dayExercises) await db.dayExercises.bulkAdd(data.dayExercises);
        if (data.sessions) await db.sessions.bulkAdd(data.sessions);
        if (data.sets) await db.sets.bulkAdd(data.sets);
        if (data.notes) await db.notes.bulkAdd(data.notes);
        if (data.measurements) await db.measurements.bulkAdd(data.measurements);
        if (data.photos) await db.photos.bulkAdd(data.photos);
        await db.meta.put({ key: 'seeded', value: 'v1' });
      });
      alert('Restored. Reloading…');
      location.reload();
    } catch (e: any) {
      alert('Import failed: ' + e.message);
    }
  }

  async function wipeAll() {
    if (!confirm('Delete ALL your training data? This is irreversible.')) return;
    if (!confirm('Really? Last chance.')) return;
    await db.transaction('rw', db.tables, async () => {
      for (const t of db.tables) await t.clear();
    });
    location.reload();
  }

  const clearActive = useSession.getState().clearActive;
  async function resetSessions() {
    if (!confirm('Clear all workout sessions and logged sets? Your plans, exercises, photos, measurements and settings stay.')) return;
    await db.transaction('rw', db.sessions, db.sets, async () => {
      await db.sets.clear();
      await db.sessions.clear();
    });
    clearActive();
    location.reload();
  }

  async function reseed() {
    if (!confirm('Reset FORGE PPL plan to defaults? Your sessions/sets are preserved.')) return;
    await db.transaction('rw', db.tables, async () => {
      await db.plans.clear();
      await db.days.clear();
      await db.dayExercises.clear();
      await db.exercises.clear();
      await db.meta.delete('seeded');
    });
    location.reload();
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <section className="rounded-2xl bg-forge-coal border border-forge-stone divide-y divide-forge-stone">
        <Link href="/plans" className="flex items-center gap-3 p-4">
          <LayoutGrid className="w-5 h-5 text-forge-lime" />
          <div className="flex-1">
            <div className="font-semibold">Workout Plans</div>
            <div className="text-xs text-forge-ash">Install templates, switch active plan</div>
          </div>
          <ChevronRight className="w-4 h-4 text-forge-ash" />
        </Link>
        <Link href="/training-max" className="flex items-center gap-3 p-4">
          <Gauge className="w-5 h-5 text-forge-lime" />
          <div className="flex-1">
            <div className="font-semibold">Training Max</div>
            <div className="text-xs text-forge-ash">5/3/1, GZCLP & %-based program calculator</div>
          </div>
          <ChevronRight className="w-4 h-4 text-forge-ash" />
        </Link>
        <Link href="/measurements" className="flex items-center gap-3 p-4">
          <Activity className="w-5 h-5 text-forge-lime" />
          <div className="flex-1">
            <div className="font-semibold">Body & Photos</div>
            <div className="text-xs text-forge-ash">Weight, measurements, progress photos</div>
          </div>
          <ChevronRight className="w-4 h-4 text-forge-ash" />
        </Link>
      </section>

      <section className="rounded-2xl bg-forge-coal border border-forge-stone p-4 space-y-3">
        <h2 className="font-semibold">Lifting</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm">Unit</span>
          <div className="flex rounded-lg overflow-hidden border border-forge-stone">
            {(['kg', 'lb'] as const).map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-4 py-1.5 text-sm font-semibold ${unit === u ? 'bg-forge-lime text-forge-ink' : 'text-forge-ash'}`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Barbell weight</span>
          <input
            type="number" step="0.5" value={barWeight}
            onChange={e => setBar(Number(e.target.value))}
            className="w-24 px-3 py-1.5 text-right rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none font-bold tabular"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Intensity metric</span>
          <div className="flex rounded-lg overflow-hidden border border-forge-stone">
            {(['rir', 'rpe'] as const).map(m => (
              <button
                key={m}
                onClick={() => setIntensityMetric(m)}
                className={`px-4 py-1.5 text-xs font-semibold ${intensityMetric === m ? 'bg-forge-lime text-forge-ink' : 'text-forge-ash'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={toggleNotifications}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm inline-flex items-center gap-2">
            <Bell className="w-4 h-4 text-forge-ash" /> Rest-done notifications
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            notificationsEnabled ? 'bg-forge-lime text-forge-ink' : 'bg-forge-stone text-forge-ash'
          }`}>
            {notificationsEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
        <button
          onClick={() => setVoiceCuesEnabled(!voiceCuesEnabled)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm inline-flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-forge-ash" /> Voice cues ("Get ready · Go")
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            voiceCuesEnabled ? 'bg-forge-lime text-forge-ink' : 'bg-forge-stone text-forge-ash'
          }`}>
            {voiceCuesEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </section>

      <section className="rounded-2xl bg-forge-coal border border-forge-stone divide-y divide-forge-stone">
        <button onClick={exportData} className="w-full flex items-center gap-3 p-4 text-left">
          <Download className="w-5 h-5 text-forge-lime" />
          <div className="flex-1">
            <div className="font-semibold">Export backup</div>
            <div className="text-xs text-forge-ash">JSON file with all your data</div>
          </div>
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 p-4 text-left">
          <Upload className="w-5 h-5 text-forge-lime" />
          <div className="flex-1">
            <div className="font-semibold">Import backup</div>
            <div className="text-xs text-forge-ash">Replace data from JSON</div>
          </div>
          <input
            ref={fileRef} type="file" accept="application/json" className="hidden"
            onChange={e => e.target.files?.[0] && importData(e.target.files[0])}
          />
        </button>
        <button onClick={resetSessions} className="w-full flex items-center gap-3 p-4 text-left">
          <History className="w-5 h-5 text-yellow-400" />
          <div className="flex-1">
            <div className="font-semibold">Reset sessions only</div>
            <div className="text-xs text-forge-ash">Clear workout history — keep plans, exercises, photos, settings</div>
          </div>
        </button>
        <button onClick={reseed} className="w-full flex items-center gap-3 p-4 text-left">
          <RotateCcw className="w-5 h-5 text-yellow-400" />
          <div className="flex-1">
            <div className="font-semibold">Reset plan to defaults</div>
            <div className="text-xs text-forge-ash">Restore original FORGE PPL — keeps sessions</div>
          </div>
        </button>
        <button onClick={wipeAll} className="w-full flex items-center gap-3 p-4 text-left">
          <Trash2 className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <div className="font-semibold text-red-400">Delete all data</div>
            <div className="text-xs text-forge-ash">Cannot be undone</div>
          </div>
        </button>
      </section>

      <p className="text-[10px] text-forge-ash text-center pt-4 pb-2">
        FORGE · Local-first PWA · v0.1
      </p>
    </div>
  );
}
