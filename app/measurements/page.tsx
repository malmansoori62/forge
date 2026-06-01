'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Camera, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const FIELDS = [
  { key: 'weightKg', label: 'Weight', unit: 'kg' },
  { key: 'chestCm', label: 'Chest', unit: 'cm' },
  { key: 'armCm', label: 'Arm', unit: 'cm' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'thighCm', label: 'Thigh', unit: 'cm' },
  { key: 'hipCm', label: 'Hip', unit: 'cm' }
] as const;

export default function MeasurementsPage() {
  const measurements = useLiveQuery(() => db.measurements.orderBy('takenAt').toArray(), []);
  const photos = useLiveQuery(() => db.photos.orderBy('takenAt').reverse().toArray(), []);
  const [form, setForm] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [photoAngle, setPhotoAngle] = useState<'front' | 'side' | 'back'>('front');

  async function saveMeasurement() {
    if (Object.keys(form).length === 0) return;
    const entry: any = { takenAt: Date.now() };
    for (const [k, v] of Object.entries(form)) {
      if (Number.isFinite(v) && v > 0) entry[k] = v;
    }
    await db.measurements.add(entry);
    setForm({});
    setOpen(false);
  }

  async function uploadPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      await db.photos.add({
        takenAt: Date.now(),
        angle: photoAngle,
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  }

  async function deletePhoto(id: number) {
    if (!confirm('Delete this photo?')) return;
    await db.photos.delete(id);
  }

  const series = (measurements ?? []).map(m => ({
    date: m.takenAt,
    label: formatDate(m.takenAt, { month: 'short', day: 'numeric' }),
    ...m
  }));

  return (
    <div className="px-4 pt-4 pb-2 space-y-5">
      <header className="flex items-center gap-2">
        <Link href="/settings" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold tracking-tight flex-1">Body & Photos</h1>
        <button onClick={() => setOpen(true)} className="p-2 rounded-full bg-forge-lime text-forge-ink">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {FIELDS.map(f => {
        const data = series.filter(s => (s as any)[f.key]);
        if (data.length === 0) return null;
        const latest = data[data.length - 1] as any;
        return (
          <section key={f.key} className="rounded-2xl bg-forge-coal border border-forge-stone p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">{f.label}</h2>
              <span className="text-sm font-bold tabular text-forge-lime">{latest[f.key]} {f.unit}</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid stroke="#2c2f2a" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#9aa19a" fontSize={9} />
                  <YAxis stroke="#9aa19a" fontSize={9} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ background: '#17191a', border: '1px solid #2c2f2a', borderRadius: 8 }} />
                  <Line type="monotone" dataKey={f.key} stroke="#d4ff3f" strokeWidth={2} dot={{ r: 2, fill: '#d4ff3f' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        );
      })}

      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs uppercase tracking-wide text-forge-ash">Progress photos</h2>
          <div className="flex gap-1 text-[10px]">
            {(['front', 'side', 'back'] as const).map(a => (
              <button
                key={a}
                onClick={() => setPhotoAngle(a)}
                className={`px-2 py-1 rounded ${photoAngle === a ? 'bg-forge-lime text-forge-ink' : 'bg-forge-stone text-forge-ash'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <label className="block rounded-xl border border-dashed border-forge-stone p-4 text-center text-forge-ash hover:border-forge-lime/50 hover:text-forge-lime cursor-pointer">
          <Camera className="w-6 h-6 mx-auto" />
          <span className="text-xs mt-1 block">Add {photoAngle} photo</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
            className="hidden"
          />
        </label>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {(photos ?? []).map(p => (
            <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
              <img src={p.dataUrl} alt={p.angle} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <div className="text-[10px] font-semibold capitalize">{p.angle}</div>
                <div className="text-[9px] text-forge-ash">{formatDate(p.takenAt)}</div>
              </div>
              <button
                onClick={() => deletePhoto(p.id!)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-red-400 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-end" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md mx-auto bg-forge-coal rounded-t-2xl p-4 safe-bottom">
            <h3 className="font-semibold mb-3">Log measurements</h3>
            <div className="grid grid-cols-2 gap-2">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-[10px] uppercase tracking-wide text-forge-ash">{f.label} ({f.unit})</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={(form as any)[f.key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-base font-bold tabular"
                  />
                </div>
              ))}
            </div>
            <button onClick={saveMeasurement} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forge-lime text-forge-ink py-3 font-bold">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
