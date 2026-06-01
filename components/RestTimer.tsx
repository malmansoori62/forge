'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession, useSettings } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import {
  scheduleRestCues, cancelRestCues, resumeRestAudio
} from '@/lib/restAudio';
import { Timer, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RestTimer() {
  const { restEndsAt, cancelRest, startRest } = useSession();
  const { notificationsEnabled, voiceCuesEnabled } = useSettings();
  const [now, setNow] = useState(Date.now());
  const lastScheduledFor = useRef<number | null>(null);

  // Visible countdown ticks (JS-based — may pause when backgrounded, that's fine)
  useEffect(() => {
    if (!restEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [restEndsAt]);

  // Whenever a new rest target is set, schedule all audio + voice cues at
  // their exact future times via Web Audio. These play even if the JS
  // thread is throttled by Android backgrounding it.
  useEffect(() => {
    if (!restEndsAt) {
      cancelRestCues();
      lastScheduledFor.current = null;
      return;
    }
    if (lastScheduledFor.current === restEndsAt) return;
    lastScheduledFor.current = restEndsAt;
    scheduleRestCues(restEndsAt, {
      voice: voiceCuesEnabled,
      vibrate: true,
      notify: notificationsEnabled
    });
  }, [restEndsAt, voiceCuesEnabled, notificationsEnabled]);

  // Resume the AudioContext when the user comes back to the app
  // (e.g. after a call ends or they unlock the screen).
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') resumeRestAudio();
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  // Stop everything when this component unmounts
  useEffect(() => () => { cancelRestCues(); }, []);

  const totalSec = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;
  const expired = restEndsAt !== null && totalSec === 0;

  if (!restEndsAt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-20 inset-x-0 z-30 px-3"
      >
        <div className="mx-auto max-w-md">
          <div className={`rounded-2xl border backdrop-blur shadow-xl flex items-stretch overflow-hidden ${
            expired ? 'bg-forge-lime border-forge-lime text-forge-ink animate-pulse' : 'bg-forge-coal/95 border-forge-stone'
          }`}>
            <div className="flex items-center gap-3 pl-3 pr-2 py-2.5 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${expired ? 'bg-forge-ink/10' : 'bg-forge-stone'}`}>
                <Timer className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wide opacity-70 leading-none">
                  {expired ? 'Go!' : totalSec <= 3 ? 'Get ready' : 'Rest'}
                </div>
                <div className="text-2xl font-bold tabular leading-none mt-1">{formatTime(totalSec)}</div>
              </div>
            </div>
            <button
              onClick={() => startRest(Math.max(15, totalSec - 15))}
              className={`px-3 flex flex-col items-center justify-center border-l text-xs font-bold transition active:bg-forge-stone/60 ${
                expired ? 'border-forge-ink/20 text-forge-ink' : 'border-forge-stone text-forge-ash'
              }`}
              aria-label="−15 seconds"
            >
              <Minus className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-[10px] mt-0.5 tabular">15</span>
            </button>
            <button
              onClick={() => startRest(totalSec + 30)}
              className={`px-3 flex flex-col items-center justify-center border-l text-xs font-bold transition active:bg-forge-stone/60 ${
                expired ? 'border-forge-ink/20 text-forge-ink' : 'border-forge-stone text-forge-ash'
              }`}
              aria-label="+30 seconds"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-[10px] mt-0.5 tabular">30</span>
            </button>
            <button
              onClick={cancelRest}
              className={`px-3 flex items-center justify-center border-l transition active:bg-forge-stone/60 ${
                expired ? 'border-forge-ink/20 text-forge-ink' : 'border-forge-stone text-forge-ash'
              }`}
              aria-label="Cancel rest"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
