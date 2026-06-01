'use client';
import { useState } from 'react';
import type { Exercise } from '@/lib/types';
import { ChevronDown, ListChecks, AlertTriangle, Lightbulb, BookOpen, Play } from 'lucide-react';

/**
 * Rich expert-notes panel for an exercise.
 * Shows what's available: description, setup steps, execution steps,
 * common mistakes, pro tip, plus short form cues.
 */
export default function CoachPanel({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  const hasRichNotes =
    exercise.description ||
    (exercise.setup && exercise.setup.length > 0) ||
    (exercise.execution && exercise.execution.length > 0) ||
    (exercise.commonMistakes && exercise.commonMistakes.length > 0) ||
    exercise.proTip;

  const cuesOnly = exercise.cues && exercise.cues.length > 0 && !hasRichNotes;

  if (!hasRichNotes && !cuesOnly) return null;

  if (cuesOnly) {
    return (
      <details className="rounded-xl bg-forge-coal border border-forge-stone p-3">
        <summary className="text-xs text-forge-ash cursor-pointer">Form cues</summary>
        <ul className="mt-2 space-y-1 text-sm">
          {exercise.cues!.map((c, i) => (
            <li key={i} className="flex gap-2"><span className="text-forge-lime">→</span>{c}</li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <div className="rounded-xl bg-forge-coal border border-forge-stone overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <BookOpen className="w-4 h-4 text-forge-lime shrink-0" />
        <span className="text-xs uppercase tracking-wider text-forge-lime font-bold">Coach notes</span>
        {exercise.proTip && !open && (
          <span className="text-[10px] text-forge-ash truncate flex-1">{exercise.proTip}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-forge-ash ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-forge-stone pt-3">
          {exercise.description && (
            <p className="text-sm text-forge-bone leading-relaxed">{exercise.description}</p>
          )}

          {exercise.proTip && (
            <div className="rounded-lg bg-forge-lime/10 border border-forge-lime/30 px-3 py-2 flex gap-2">
              <Lightbulb className="w-4 h-4 text-forge-lime shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-forge-lime font-bold mb-0.5">Pro tip</div>
                <p className="text-xs text-forge-bone leading-snug">{exercise.proTip}</p>
              </div>
            </div>
          )}

          {exercise.setup && exercise.setup.length > 0 && (
            <Section icon={<ListChecks className="w-3.5 h-3.5 text-forge-lime" />} title="Setup" items={exercise.setup} />
          )}
          {exercise.execution && exercise.execution.length > 0 && (
            <Section icon={<Play className="w-3.5 h-3.5 text-forge-lime" />} title="Execution" items={exercise.execution} />
          )}
          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <Section icon={<AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />} title="Avoid" items={exercise.commonMistakes} accent="yellow" />
          )}

          {exercise.cues && exercise.cues.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {exercise.cues.map((c, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-forge-stone text-forge-bone">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  icon, title, items, accent = 'lime'
}: {
  icon: React.ReactNode; title: string; items: string[]; accent?: 'lime' | 'yellow';
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-forge-ash font-bold mb-1 inline-flex items-center gap-1">
        {icon} {title}
      </div>
      <ul className="space-y-1">
        {items.map((s, i) => (
          <li key={i} className="text-xs text-forge-bone leading-snug flex gap-2">
            <span className={accent === 'yellow' ? 'text-yellow-400' : 'text-forge-lime'}>{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
