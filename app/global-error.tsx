'use client';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#0d0f0c', color: '#e9ebe5', fontFamily: 'system-ui, sans-serif', padding: 16 }}>
        <div style={{ maxWidth: 480, margin: '20vh auto', padding: 20, background: '#17191a', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f87171', marginBottom: 8 }}>App failed to load</div>
          <p style={{ fontSize: 14, marginBottom: 12 }}>A top-level error stopped FORGE from starting.</p>
          <details open style={{ fontSize: 11, color: '#9aa19a', marginBottom: 12 }}>
            <summary style={{ cursor: 'pointer', color: '#d4ff3f', fontWeight: 700 }}>Error details</summary>
            <pre style={{ marginTop: 8, padding: 8, background: '#0d0f0c', borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 240, overflow: 'auto' }}>
{error.message}{error.stack ? '\n\n' + error.stack : ''}{error.digest ? '\n\nDigest: ' + error.digest : ''}
            </pre>
          </details>
          <button onClick={reset} style={{ width: '100%', padding: '12px 0', background: '#d4ff3f', color: '#0d0f0c', fontWeight: 800, border: 'none', borderRadius: 12, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
