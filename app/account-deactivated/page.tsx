import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Account Deactivated — AgriConnect',
};

export default function AccountDeactivatedPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#991B1B' }}>Account Deactivated</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Your account has been deactivated. This may be due to a violation of our Terms of Service or your own request.
          If you believe this is a mistake, please contact our support team.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">← Back to Home</Link>
          <a href="mailto:support@agriconnect.app" className="btn btn-outline">Contact Support</a>
        </div>
      </div>
    </main>
  );
}
