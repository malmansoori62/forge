'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'forge-install-dismissed';

export default function InstallPrompt() {
  const [event, setEvent] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISSED_KEY) === '1') {
      setDismissed(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BIPEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (dismissed || !event) return null;

  async function install() {
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') setEvent(null);
    else dismiss();
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-24 inset-x-0 z-30 px-3">
      <div className="mx-auto max-w-md rounded-2xl bg-forge-coal/95 border border-forge-lime/40 backdrop-blur shadow-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-forge-lime/15 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-forge-lime" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">Install FORGE</div>
          <div className="text-[11px] text-forge-ash">Works offline · feels native</div>
        </div>
        <button
          onClick={install}
          className="px-3 py-1.5 rounded-lg bg-forge-lime text-forge-ink text-xs font-bold"
        >
          Install
        </button>
        <button onClick={dismiss} className="p-1 text-forge-ash">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
