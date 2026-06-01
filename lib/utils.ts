import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Epley 1RM estimate: weight * (1 + reps/30) */
export function e1RM(weight: number, reps: number): number {
  if (reps < 1) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Plate calc — returns plate multiset per side */
const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export interface PlateBreakdown {
  perSide: { weight: number; count: number }[];
  achievable: number;
  remainder: number;
}

export function calcPlates(target: number, barWeight = 20, plates = STANDARD_PLATES): PlateBreakdown {
  const loadPerSide = Math.max(0, (target - barWeight) / 2);
  let remaining = loadPerSide;
  const perSide: { weight: number; count: number }[] = [];
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    if (count > 0) {
      perSide.push({ weight: p, count });
      remaining = +(remaining - count * p).toFixed(3);
    }
  }
  const achievablePerSide = perSide.reduce((s, p) => s + p.weight * p.count, 0);
  return {
    perSide,
    achievable: barWeight + 2 * achievablePerSide,
    remainder: +(loadPerSide - achievablePerSide).toFixed(3)
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(ts: number, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return new Date(ts).toLocaleDateString(undefined, opts);
}

/** "Mon, May 31 · 18:42" — full session timestamp. */
export function formatDateTime(ts: number, withYear = false): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {})
  });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
}

/** "18:42" — time only. */
export function formatTimeOfDay(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function daysAgo(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Read a user-picked image File, downscale it so the longest edge is
 * `maxDim` px, and return a JPEG data URL. Keeps DB size manageable.
 */
export async function compressImageToDataURL(
  file: File,
  maxDim = 800,
  quality = 0.8
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }
  const originalDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = originalDataUrl;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');
  ctx.fillStyle = '#0d0f0c';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}
