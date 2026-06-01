'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { installTemplate, setActivePlan, uninstallPlan, createCustomPlan } from '@/lib/seed';
import { PLAN_TEMPLATES } from '@/lib/templates';
import { ArrowLeft, CheckCircle2, Download, Star, Trash2, Plus, Wand2 } from 'lucide-react';

export default function PlansPage() {
  const router = useRouter();
  const plans = useLiveQuery(() => db.plans.toArray(), []);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!plans) {
    return <div className="px-4 pt-6 animate-pulse h-screen bg-forge-coal/30" />;
  }

  async function createPlan() {
    try {
      await createCustomPlan(db, newName.trim(), newDesc.trim() || undefined, true);
      setCreating(false);
      setNewName('');
      setNewDesc('');
      router.push('/plan/edit');
    } catch (e: any) {
      alert(e.message || 'Create failed');
    }
  }

  const installedSlugs = new Set(plans.map(p => p.templateSlug).filter(Boolean) as string[]);

  async function install(slug: string) {
    try {
      await installTemplate(db, slug, plans!.length === 0);
    } catch (e: any) {
      alert(e.message || 'Install failed');
    }
  }

  async function activate(planId: number) {
    await setActivePlan(db, planId);
  }

  async function remove(planId: number, name: string) {
    if (!confirm(`Delete "${name}"? Your past sessions and sets are preserved.`)) return;
    await uninstallPlan(db, planId);
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-5">
      <header className="flex items-center gap-2">
        <Link href="/plan" className="p-2 -m-2 text-forge-ash"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Workout Plans</h1>
          <p className="text-xs text-forge-ash">Install templates · switch active plan</p>
        </div>
      </header>

      {/* Create custom */}
      {creating ? (
        <div className="rounded-xl bg-forge-coal border border-forge-stone p-3 space-y-2">
          <div className="text-xs uppercase tracking-wider text-forge-lime font-bold mb-1">Create Custom Plan</div>
          <input
            placeholder="Plan name (e.g. My Hybrid Split)"
            value={newName} onChange={e => setNewName(e.target.value)}
            className="w-full p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={newDesc} onChange={e => setNewDesc(e.target.value)}
            rows={2}
            className="w-full p-2 rounded-lg bg-forge-stone border border-forge-mist focus:border-forge-lime outline-none text-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={createPlan}
              disabled={!newName.trim()}
              className="flex-1 rounded-lg bg-forge-lime text-forge-ink py-2 font-bold disabled:opacity-40"
            >
              Create & Edit
            </button>
            <button onClick={() => setCreating(false)} className="px-4 rounded-lg bg-forge-stone text-forge-ash">Cancel</button>
          </div>
          <p className="text-[10px] text-forge-ash">Empty plan — you'll add days & exercises next.</p>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-forge-lime/40 bg-forge-lime/5 text-forge-lime py-3 font-bold"
        >
          <Wand2 className="w-4 h-4" /> Create Custom Plan
        </button>
      )}

      <section className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-forge-ash px-1">Installed</h2>
        {plans.length === 0 && (
          <div className="text-sm text-forge-ash rounded-xl border border-dashed border-forge-stone p-4 text-center">
            No plans installed. Pick one from the templates below.
          </div>
        )}
        {plans.map(p => (
          <div key={p.id} className={`rounded-xl border p-3 ${p.active ? 'bg-forge-lime/5 border-forge-lime/40' : 'bg-forge-coal border-forge-stone'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{p.name}</h3>
                  {p.active && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-forge-lime">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                {p.description && <p className="text-xs text-forge-ash mt-0.5">{p.description}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {!p.active && (
                <button
                  onClick={() => activate(p.id!)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-forge-lime text-forge-ink text-sm font-bold py-2"
                >
                  <Star className="w-3.5 h-3.5" /> Set Active
                </button>
              )}
              <button
                onClick={() => remove(p.id!, p.name)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-forge-stone text-red-300 text-sm font-semibold px-3 py-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-forge-ash px-1">Templates</h2>
        {PLAN_TEMPLATES.map(t => {
          const installed = installedSlugs.has(t.slug);
          return (
            <div key={t.slug} className="rounded-xl bg-forge-coal border border-forge-stone p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{t.name}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-forge-stone text-forge-ash">
                      {t.level}
                    </span>
                    <span className="text-[10px] font-semibold text-forge-ash tabular">{t.daysPerWeek}d/wk</span>
                  </div>
                  {t.source && (
                    <div className="text-[11px] text-forge-lime font-semibold mt-0.5">
                      by {t.source}
                    </div>
                  )}
                  <p className="text-xs text-forge-ash mt-1">{t.description}</p>
                  {t.notes && (
                    <p className="text-[11px] text-forge-bone/80 italic mt-1 border-l-2 border-forge-stone pl-2">
                      {t.notes}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => install(t.slug)}
                disabled={installed}
                className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-bold py-2 ${
                  installed
                    ? 'bg-forge-stone text-forge-ash cursor-not-allowed'
                    : 'bg-forge-lime/20 text-forge-lime border border-forge-lime/40 hover:bg-forge-lime/30'
                }`}
              >
                {installed ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Installed</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Install</>
                )}
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
