export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1.5rem' }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>Loading…</p>
      </div>
    </main>
  );
}
