'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { db } from '@/lib/db';
import type { PlanDay } from '@/lib/types';
import { compressImageToDataURL } from '@/lib/utils';
import { ArrowLeft, Plus, ImagePlus, X, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import ExerciseImage from '@/components/ExerciseImage';

export default function EditPlanPage() {
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

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [newImg, setNewImg] = useState<string | undefined>(undefined);
  const [busyDay, setBusyDay] = useState<number | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);

  async function addDay() {
    if (!name || !slug) return;
    const all = await db.plans.toArray();
    const plan = all.find(p => p.active) ?? all[0];
    if (!plan) return;
    const order = (days?.length ?? 0);
    await db.days.add({
      planId: plan.id!,
      name,
      slug: slug.toLowerCase(),
      order,
      illustration: newImg
    });
    setName('');
    setSlug('');
    setNewImg(undefined);
    setAdding(false);
  }

  async function deleteDay(id: number) {
    if (!confirm('Delete this day and all its exercises? Sessions and sets are preserved.')) return;
    await db.transaction('rw', db.days, db.dayExercises, async () => {
      await db.dayExercises.where('dayId').equals(id).delete();
      await db.days.delete(id);
    });
  }

  async function renameDay(id: number, current: string) {
    const next = prompt('Day name:', current);
    if (!next || next === current) return;
    await db.days.update(id, { name: next });
  }

  async function pickImage(file: File, onResult: (dataUrl: string) => void) {
    try {
      const dataUrl = await compressImageToDataURL(file, 800, 0.82);
      onResult(dataUrl);
    } catch (e: any) {
      alert(e.message || 'Image processing failed');
    }
  }

  async function setDayImage(id: number, file: File) {
    setBusyDay(id);
    try {
      const dataUrl = await compressImageToDataURL(file, 800, 0.82);
      await db.days.update(id, { illustration: dataUrl });
    } catch (e: any) {
      alert(e.message || 'Image processing failed');
    } finally {
      setBusyDay(null);
    }
  }

  async function clearDayImage(id: number) {
    if (!confirm('Remove this day\'s image?')) return;
    await db.days.update(id, { illustration: undefined });
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <header className="flex items-center gap-2">
        <Link href="/plan" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">Edit Plan</h1>
          {activePlan && <p className="text-xs text-forge-ash truncate">{activePlan.name}</p>}
        </div>
      </header>

      <ul className="space-y-2">
        {(days ?? []).map(d => (
          <li key={d.id} className="rounded-xl bg-forge-coal border border-forge-stone p-3 flex items-center gap-3">
            <DayImagePicker
              busy={busyDay === d.id}
              illustration={d.illustration}
              onPick={f => setDayImage(d.id!, f)}
              onClear={() => clearDayImage(d.id!)}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{d.name}</div>
              <div className="text-[10px] text-forge-ash truncate font-mono">{d.slug}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => renameDay(d.id!, d.name)} className="text-xs px-2 py-1 rounded bg-forge-stone text-forge-bone">Rename</button>
              <Link href={`/plan/${d.slug}`} className="text-xs px-2 py-1 rounded bg-forge-stone text-forge-bone">Edit</Link>
              <button onClick={() => deleteDay(d.id!)} className="text-xs p-1 rounded bg-red-900/40 text-red-300">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="rounded-xl bg-forge-coal border border-forge-stone p-3 space-y-3">
          <div className="flex gap-3 items-start">
            <button
              onClick={() => newFileRef.current?.click()}
              className="w-16 h-16 rounded-xl bg-forge-stone border border-forge-mist overflow-hidden flex items-center justify-center text-forge-ash hover:text-forge-lime shrink-0 relative"
            >
              {newImg ? (
                <img src={newImg} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="w-6 h-6" />
              )}
              {newImg && (
                <span
                  onClick={e => { e.stopPropagation(); setNewImg(undefined); }}
                  className="absolute top-0.5 right-0.5 bg-forge-ink/80 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-forge-bone" />
                </span>
              )}
            </button>
            <input
              ref={newFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) pickImage(f, setNewImg);
                e.target.value = '';
              }}
            />
            <div className="flex-1 space-y-2">
              <input
                placeholder="Day name (e.g. Arms Day)"
                value={name} onChange={e => setName(e.target.value)}
                className="w-full p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none"
              />
              <input
                placeholder="Slug (e.g. arms-day)"
                value={slug} onChange={e => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase())}
                className="w-full p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addDay} disabled={!name || !slug} className="flex-1 rounded-lg bg-forge-lime text-forge-ink py-2 font-bold disabled:opacity-40">Add</button>
            <button onClick={() => { setAdding(false); setNewImg(undefined); }} className="px-4 rounded-lg bg-forge-stone text-forge-ash">Cancel</button>
          </div>
          <p className="text-[10px] text-forge-ash">Tap the square to upload an image (optional).</p>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-forge-stone py-3 text-forge-ash hover:text-forge-lime hover:border-forge-lime/50">
          <Plus className="w-4 h-4" /> Add new day
        </button>
      )}
    </div>
  );
}

function DayImagePicker({
  busy, illustration, onPick, onClear
}: {
  busy: boolean;
  illustration?: string;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="w-14 h-14 rounded-xl overflow-hidden bg-forge-stone border border-forge-mist flex items-center justify-center text-forge-ash hover:text-forge-lime disabled:opacity-50"
        title={illustration ? 'Replace image' : 'Upload image'}
      >
        {illustration ? (
          <ExerciseImage src={illustration} alt="" className="w-full h-full" />
        ) : (
          <ImagePlus className="w-5 h-5" />
        )}
      </button>
      {illustration && !busy && (
        <button
          onClick={onClear}
          className="absolute -top-1 -right-1 bg-forge-ink rounded-full p-0.5 border border-forge-stone hover:border-red-400 text-forge-ash hover:text-red-300"
          title="Remove image"
        >
          <X className="w-3 h-3" />
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
