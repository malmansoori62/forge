'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useMemo, useState } from 'react';
import { Search, Pencil, Save, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function NotesPage() {
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const notes = useLiveQuery(() => db.notes.toArray(), []);
  const sessionsWithNote = useLiveQuery(
    () => db.sessions.filter(s => !!s.note).reverse().sortBy('startedAt'),
    []
  );
  const days = useLiveQuery(() => db.days.toArray(), []);

  const [q, setQ] = useState('');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const exMap = useMemo(() => new Map((exercises ?? []).map(e => [e.slug, e])), [exercises]);
  const dayMap = useMemo(() => new Map((days ?? []).map(d => [d.id!, d.name])), [days]);

  const filteredEx = useMemo(() => {
    if (!exercises) return [];
    const ql = q.toLowerCase();
    return exercises.filter(e => !ql || e.name.toLowerCase().includes(ql));
  }, [exercises, q]);

  const noteFor = (slug: string) => notes?.find(n => n.exerciseSlug === slug);

  async function saveNote(slug: string) {
    const existing = noteFor(slug);
    if (existing) {
      await db.notes.update(existing.id!, { body: draft, updatedAt: Date.now() });
    } else if (draft.trim()) {
      await db.notes.add({ exerciseSlug: slug, body: draft, updatedAt: Date.now() });
    }
    setEditingSlug(null);
    setDraft('');
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Notes</h1>

      <div className="relative">
        <Search className="absolute top-3 left-3 w-4 h-4 text-forge-ash" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search exercises…"
          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-forge-coal border border-forge-stone focus:border-forge-lime outline-none"
        />
      </div>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-forge-ash mb-2 px-1">Exercise notes (form cues)</h2>
        <ul className="space-y-1.5">
          {filteredEx.map(ex => {
            const n = noteFor(ex.slug);
            const editing = editingSlug === ex.slug;
            return (
              <li key={ex.slug} className="rounded-xl bg-forge-coal border border-forge-stone p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{ex.name}</div>
                    {editing ? (
                      <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        rows={3}
                        placeholder="Form cue, weight notes, anything…"
                        className="mt-2 w-full p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-sm"
                      />
                    ) : n?.body ? (
                      <p className="text-sm text-forge-bone whitespace-pre-wrap mt-1">{n.body}</p>
                    ) : (
                      <p className="text-xs text-forge-ash mt-1 italic">No notes</p>
                    )}
                  </div>
                  {editing ? (
                    <div className="flex flex-col gap-1">
                      <button onClick={() => saveNote(ex.slug)} className="p-2 rounded-lg bg-forge-lime text-forge-ink">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditingSlug(null); setDraft(''); }} className="p-2 rounded-lg bg-forge-stone text-forge-ash">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingSlug(ex.slug); setDraft(n?.body ?? ''); }}
                      className="p-2 text-forge-ash hover:text-forge-lime"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {sessionsWithNote && sessionsWithNote.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-forge-ash mb-2 px-1">Session notes</h2>
          <ul className="space-y-1.5">
            {sessionsWithNote.map(s => (
              <li key={s.id} className="rounded-xl bg-forge-coal border border-forge-stone p-3">
                <div className="text-xs text-forge-ash flex justify-between">
                  <span>{dayMap.get(s.dayId) ?? 'Session'}</span>
                  <span>{formatDate(s.startedAt)}</span>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{s.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
