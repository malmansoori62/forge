'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { Suspense, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { compressImageToDataURL } from '@/lib/utils';
import { ArrowLeft, Search, Plus, ImagePlus, X, Wand2, Trash2, Camera } from 'lucide-react';
import ExerciseImage from '@/components/ExerciseImage';
import type { Exercise, Muscle, MovementPattern, Equipment, DayExercise, PlanDay } from '@/lib/types';

const MUSCLES: { key: Muscle; label: string; pattern: MovementPattern }[] = [
  { key: 'chest', label: 'Chest', pattern: 'horizontal-push' },
  { key: 'front-delt', label: 'Front Delts', pattern: 'vertical-push' },
  { key: 'side-delt', label: 'Side Delts', pattern: 'lateral-raise' },
  { key: 'rear-delt', label: 'Rear Delts', pattern: 'rear-delt-fly' },
  { key: 'lats', label: 'Lats', pattern: 'vertical-pull' },
  { key: 'upper-back', label: 'Upper Back', pattern: 'horizontal-pull' },
  { key: 'traps', label: 'Traps', pattern: 'vertical-pull' },
  { key: 'lower-back', label: 'Lower Back', pattern: 'hip-hinge' },
  { key: 'biceps', label: 'Biceps', pattern: 'bicep-curl' },
  { key: 'triceps', label: 'Triceps', pattern: 'tricep-extension' },
  { key: 'forearms', label: 'Forearms', pattern: 'bicep-curl' },
  { key: 'quads', label: 'Quads', pattern: 'knee-dominant' },
  { key: 'hamstrings', label: 'Hamstrings', pattern: 'hip-hinge' },
  { key: 'glutes', label: 'Glutes', pattern: 'hip-hinge' },
  { key: 'calves', label: 'Calves', pattern: 'calf-raise' },
  { key: 'abs', label: 'Abs', pattern: 'core' }
];

const EQUIPMENT: { key: Equipment; label: string }[] = [
  { key: 'barbell', label: 'Barbell' },
  { key: 'dumbbell', label: 'Dumbbell' },
  { key: 'cable', label: 'Cable' },
  { key: 'machine', label: 'Machine' },
  { key: 'smith', label: 'Smith' },
  { key: 'bodyweight', label: 'Bodyweight' },
  { key: 'kettlebell', label: 'Kettlebell' },
  { key: 'band', label: 'Band' }
];

function slugify(name: string): string {
  return 'custom-' + name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AddExercisePage() {
  return (
    <Suspense fallback={<div className="p-6 text-forge-ash">Loading…</div>}>
      <AddExercisePageContent />
    </Suspense>
  );
}

function AddExercisePageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') ?? '';
  const router = useRouter();
  const day = useLiveQuery(
    () => (slug
      ? db.days.where('slug').equals(slug).first()
      : Promise.resolve(undefined as PlanDay | undefined)),
    [slug]
  );
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), []);
  const dayExercises = useLiveQuery(
    () => (day?.id
      ? db.dayExercises.where('dayId').equals(day.id).toArray()
      : Promise.resolve([] as DayExercise[])),
    [day?.id]
  );

  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyImg, setBusyImg] = useState<number | null>(null);

  const existing = useMemo(() => new Set((dayExercises ?? []).map(d => d.exerciseSlug)), [dayExercises]);

  async function setExerciseImage(ex: Exercise, file: File) {
    if (!ex.id) return;
    setBusyImg(ex.id);
    try {
      const dataUrl = await compressImageToDataURL(file, 800, 0.82);
      await db.exercises.update(ex.id, { image: dataUrl });
    } catch (e: any) {
      alert(e.message || 'Image processing failed');
    } finally {
      setBusyImg(null);
    }
  }

  async function clearExerciseImage(ex: Exercise) {
    if (!ex.id) return;
    if (!confirm(`Remove the photo for "${ex.name}"?`)) return;
    await db.exercises.update(ex.id, { image: undefined });
  }

  const filtered = useMemo(() => {
    if (!exercises) return [];
    const ql = q.toLowerCase();
    return exercises.filter(e =>
      !ql ||
      e.name.toLowerCase().includes(ql) ||
      e.pattern.includes(ql) ||
      e.equipment.some(eq => eq.includes(ql))
    );
  }, [exercises, q]);

  async function add(exSlug: string) {
    if (!day?.id) return;
    const order = dayExercises?.length ?? 0;
    await db.dayExercises.add({
      dayId: day.id,
      exerciseSlug: exSlug,
      order,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      targetRIR: 1
    });
    router.push(`/plan/day?slug=${slug}`);
  }

  async function deleteCustomExercise(ex: Exercise) {
    if (!ex.id) return;
    if (!confirm(`Delete "${ex.name}"? Any past sets you logged for this exercise are preserved.`)) return;
    await db.transaction('rw', db.exercises, db.dayExercises, async () => {
      await db.dayExercises.where('exerciseSlug').equals(ex.slug).delete();
      await db.exercises.delete(ex.id!);
    });
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-3">
      <header className="flex items-center gap-2">
        <Link href={`/plan/day?slug=${slug}`} className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold flex-1">Add exercise</h1>
        <button
          onClick={() => setCreating(c => !c)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
            creating
              ? 'bg-forge-lime text-forge-ink border-forge-lime'
              : 'bg-forge-coal border-forge-lime/40 text-forge-lime hover:bg-forge-lime/10'
          }`}
        >
          <Wand2 className="w-3 h-3" /> Custom
        </button>
      </header>

      {creating && (
        <CreateCustomExercise
          onCancel={() => setCreating(false)}
          onCreated={created => {
            setCreating(false);
            add(created.slug);
          }}
        />
      )}

      <div className="relative">
        <Search className="absolute top-3 left-3 w-4 h-4 text-forge-ash" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search exercises, patterns, equipment…"
          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-forge-coal border border-forge-stone focus:border-forge-lime outline-none"
        />
      </div>

      <ul className="space-y-1">
        {filtered.map(ex => {
          const used = existing.has(ex.slug);
          return (
            <li key={ex.slug}>
              <div className={`w-full p-3 rounded-xl border flex items-center gap-3 ${
                used ? 'bg-forge-stone/30 border-forge-stone opacity-50' : 'bg-forge-coal border-forge-stone'
              }`}>
                <ImageThumbButton
                  exercise={ex}
                  busy={busyImg === ex.id}
                  onPick={f => setExerciseImage(ex, f)}
                  onClear={() => clearExerciseImage(ex)}
                />
                <button
                  onClick={() => !used && add(ex.slug)}
                  disabled={used}
                  className="flex-1 min-w-0 text-left active:opacity-80"
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="truncate">{ex.name}</span>
                    {ex.custom && (
                      <span className="text-[9px] uppercase tracking-wider px-1 py-0 rounded bg-forge-lime/15 text-forge-lime font-bold">custom</span>
                    )}
                  </div>
                  <div className="text-xs text-forge-ash mt-0.5 capitalize truncate">
                    {ex.pattern.replace(/-/g, ' ')} · {ex.equipment.join(', ')}
                  </div>
                </button>
                {ex.custom && !used && (
                  <button
                    onClick={() => deleteCustomExercise(ex)}
                    className="p-1.5 text-forge-ash hover:text-red-300 shrink-0"
                    title="Delete custom exercise"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {used ? (
                  <span className="text-[10px] uppercase text-forge-ash shrink-0">Used</span>
                ) : (
                  <button onClick={() => add(ex.slug)} className="shrink-0 p-1.5">
                    <Plus className="w-4 h-4 text-forge-lime" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-forge-stone p-6 text-center text-forge-ash text-sm">
            No match. Tap <span className="text-forge-lime font-bold">Custom</span> at the top to add your own.
          </li>
        )}
      </ul>
    </div>
  );
}

function ImageThumbButton({
  exercise, busy, onPick, onClear
}: {
  exercise: Exercise;
  busy: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="w-10 h-10 rounded-lg overflow-hidden bg-forge-stone flex items-center justify-center relative group disabled:opacity-50"
        title={exercise.image ? 'Replace photo' : 'Add photo'}
      >
        <ExerciseImage src={exercise.image} alt={exercise.name} className="w-full h-full" />
        <span className="absolute inset-0 bg-forge-ink/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <Camera className="w-4 h-4 text-forge-lime" />
        </span>
      </button>
      {exercise.image && !busy && (
        <button
          onClick={onClear}
          className="absolute -top-1 -right-1 bg-forge-ink rounded-full p-0.5 border border-forge-stone hover:border-red-400 text-forge-ash hover:text-red-300"
          title="Remove photo"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function CreateCustomExercise({
  onCancel, onCreated
}: {
  onCancel: () => void;
  onCreated: (ex: Exercise) => void;
}) {
  const [name, setName] = useState('');
  const [muscleKey, setMuscleKey] = useState<Muscle>('chest');
  const [equipKey, setEquipKey] = useState<Equipment>('machine');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickImage(file: File) {
    try {
      setImage(await compressImageToDataURL(file, 800, 0.82));
    } catch (e: any) {
      alert(e.message || 'Image processing failed');
    }
  }

  async function save() {
    if (!name.trim()) return;
    const muscle = MUSCLES.find(m => m.key === muscleKey)!;
    const slug = slugify(name);
    const existing = await db.exercises.where('slug').equals(slug).first();
    if (existing) {
      alert('An exercise with this name already exists. Pick a different name.');
      return;
    }
    setBusy(true);
    try {
      const ex = {
        slug,
        name: name.trim(),
        primary: [muscleKey] as Muscle[],
        secondary: [] as Muscle[],
        pattern: muscle.pattern,
        equipment: [equipKey] as Equipment[],
        isolation: false,
        image,
        defaultRestSec: 90,
        custom: true
      };
      const id = await db.exercises.add(ex);
      onCreated({ ...ex, id: id as number });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-forge-coal border border-forge-lime/40 p-3 space-y-3">
      <div className="flex gap-3 items-start">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-16 h-16 rounded-xl bg-forge-stone border border-forge-mist overflow-hidden flex items-center justify-center text-forge-ash hover:text-forge-lime shrink-0 relative"
        >
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6" />
          )}
          {image && (
            <span
              onClick={e => { e.stopPropagation(); setImage(undefined); }}
              className="absolute top-0.5 right-0.5 bg-forge-ink/80 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-forge-bone" />
            </span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) pickImage(f);
            e.target.value = '';
          }}
        />
        <input
          placeholder="Exercise name (e.g. Hammer Strength Row)"
          value={name} onChange={e => setName(e.target.value)}
          className="flex-1 p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-forge-ash mb-1 block">Muscle</label>
        <select
          value={muscleKey}
          onChange={e => setMuscleKey(e.target.value as Muscle)}
          className="w-full p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-sm"
        >
          {MUSCLES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-forge-ash mb-1 block">Equipment</label>
        <select
          value={equipKey}
          onChange={e => setEquipKey(e.target.value as Equipment)}
          className="w-full p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-sm"
        >
          {EQUIPMENT.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={!name.trim() || busy}
          className="flex-1 rounded-lg bg-forge-lime text-forge-ink py-2 font-bold disabled:opacity-40"
        >
          {busy ? 'Saving…' : 'Create & Add'}
        </button>
        <button onClick={onCancel} className="px-4 rounded-lg bg-forge-stone text-forge-ash">Cancel</button>
      </div>
      <p className="text-[10px] text-forge-ash">Saves to your library so you can reuse it on any day.</p>
    </div>
  );
}
