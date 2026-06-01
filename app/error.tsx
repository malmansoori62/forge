'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== 'undefined') console.error('FORGE error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-forge-ink text-forge-bone p-4 flex items-center justify-center">
      <div className="max-w-md w-full rounded-2xl bg-forge-coal border border-red-500/40 p-5 space-y-3">
        <div className="text-xl font-black text-red-400">Something went wrong</div>
        <p className="text-sm text-forge-bone leading-snug">
          FORGE hit an unexpected error. Tap below to retry, or go home and try again.
        </p>
        <details open className="text-xs text-forge-ash">
          <summary className="cursor-pointer text-forge-lime font-bold">Error details — tap to share</summary>
          <pre className="mt-2 p-2 rounded bg-forge-ink whitespace-pre-wrap break-all text-[10px] leading-snug max-h-64 overflow-auto">
            {error.message}
            {error.stack && '\n\n' + error.stack}
            {error.digest && '\n\nDigest: ' + error.digest}
          </pre>
        </details>
        <div className="flex gap-2 pt-2">
          <button
            onClick={reset}
            className="flex-1 rounded-xl bg-forge-lime text-forge-ink font-bold py-3"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 rounded-xl bg-forge-stone text-forge-bone text-center font-bold py-3 inline-flex items-center justify-center"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
