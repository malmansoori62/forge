/**
 * Pre-scheduled rest-timer audio + voice cues.
 *
 * The browser throttles `setInterval`/`setTimeout` heavily when the page
 * is backgrounded (Android PWA during a phone call, screen off, etc.).
 * To get reliable "3-2-1 Go" cues we schedule them in advance using:
 *
 *   1. Web Audio API beeps via `osc.start(scheduledTime)` — runs on the
 *      audio thread and plays at the exact moment regardless of the main
 *      JS thread being paused.
 *   2. SpeechSynthesisUtterance for the voice cues — best-effort, fires
 *      via setTimeout; speech may be skipped during a real call but
 *      resumes when the call ends.
 *   3. Vibration burst at the end via setTimeout.
 *
 * All scheduled events are tracked so they can be cancelled atomically if
 * the user resets/cancels the rest.
 */

let ctx: AudioContext | null = null;
const scheduledOscillators: OscillatorNode[] = [];
let scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Resume the shared AudioContext — call this on visibility change. */
export function resumeRestAudio(): void {
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function scheduleBeep(when: number, freq: number, dur: number, gainLevel: number): void {
  const c = ctx!;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(gainLevel, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(when);
  osc.stop(when + dur + 0.02);
  scheduledOscillators.push(osc);
}

function speakLater(text: string, delayMs: number): void {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;
  const fire = () => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = 1.0;
      u.volume = 1.0;
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  };
  if (delayMs <= 0) fire();
  else scheduledTimeouts.push(setTimeout(fire, delayMs));
}

interface ScheduleOptions {
  voice?: boolean;
  vibrate?: boolean;
  notify?: boolean;
}

/**
 * Cancel any previously scheduled cues and schedule new ones to fire at
 * `restEndsAt`. Idempotent — call again any time the rest target changes.
 */
export function scheduleRestCues(restEndsAt: number, opts: ScheduleOptions = {}): void {
  cancelRestCues();
  const c = getAudioCtx();
  if (!c) return;

  const nowMs = Date.now();
  const remainingMs = restEndsAt - nowMs;
  const audioNow = c.currentTime;
  const goAt = audioNow + Math.max(0, remainingMs) / 1000;

  // 3-2-1 tick beeps
  for (const offset of [-3, -2, -1]) {
    const at = goAt + offset;
    if (at > audioNow + 0.01) scheduleBeep(at, 660, 0.08, 0.16);
  }
  // "Go" chime — two ascending tones
  scheduleBeep(goAt, 880, 0.18, 0.25);
  scheduleBeep(goAt + 0.18, 1175, 0.22, 0.25);

  // Voice cues
  if (opts.voice !== false) {
    speakLater('Get ready', Math.max(0, remainingMs - 3000));
    speakLater('Go!', Math.max(0, remainingMs));
  }

  // Vibration
  if (opts.vibrate !== false) {
    scheduledTimeouts.push(setTimeout(() => {
      try { navigator.vibrate?.([200, 80, 200]); } catch { /* ignore */ }
    }, Math.max(0, remainingMs)));
  }

  // Notification (best effort) when page hidden
  if (opts.notify) {
    scheduledTimeouts.push(setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible'
          && typeof window !== 'undefined' && 'Notification' in window
          && Notification.permission === 'granted') {
        try {
          const n = new Notification('Rest complete', {
            body: 'Time for your next set.',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'forge-rest',
            silent: false
          });
          setTimeout(() => n.close(), 8000);
        } catch { /* ignore */ }
      }
    }, Math.max(0, remainingMs)));
  }
}

/** Stop any pending beeps, timeouts, and speech. Safe to call any time. */
export function cancelRestCues(): void {
  for (const osc of scheduledOscillators) {
    try { osc.stop(); osc.disconnect(); } catch { /* ignore */ }
  }
  scheduledOscillators.length = 0;
  for (const t of scheduledTimeouts) clearTimeout(t);
  scheduledTimeouts = [];
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  }
}

/** Force-initialize the AudioContext on a user gesture so future scheduling works. */
export function primeRestAudio(): void {
  getAudioCtx();
}
