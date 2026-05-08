'use client';

import type { OrderStatus } from '@/store/orderStore';

interface Step {
  label: string;
  status: OrderStatus;
  timestamp?: string;
}

const STEPS: Step[] = [
  { label: 'Order Placed', status: 'PENDING' },
  { label: 'Confirmed', status: 'CONFIRMED' },
  { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY' },
  { label: 'Delivered', status: 'DELIVERED' },
  { label: 'Completed', status: 'COMPLETED' },
];

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];

function formatTime(ts?: string) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function StatusTimeline({
  currentStatus,
  timestamps,
}: {
  currentStatus: OrderStatus;
  timestamps: {
    createdAt: string;
    confirmedAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    completedAt?: string;
  };
}) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isDisputed = currentStatus === 'DISPUTED';
  const isCancelled = currentStatus === 'CANCELLED';
  const tsMap: Record<string, string | undefined> = {
    PENDING: timestamps.createdAt,
    CONFIRMED: timestamps.confirmedAt,
    OUT_FOR_DELIVERY: timestamps.outForDeliveryAt,
    DELIVERED: timestamps.deliveredAt,
    COMPLETED: timestamps.completedAt,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {(isDisputed || isCancelled) && (
        <div
          className={`alert ${isDisputed ? 'alert-error' : 'alert-warning'}`}
          style={{ marginBottom: '1rem' }}
        >
          <span>{isDisputed ? '⚠️ This order is under dispute.' : '❌ This order was cancelled.'}</span>
        </div>
      )}
      {STEPS.map((step, i) => {
        const done = currentIdx >= i && !isDisputed && !isCancelled;
        const isActive = currentIdx === i && !isDisputed && !isCancelled;
        return (
          <div key={step.status} style={{ display: 'flex', gap: '1rem', minHeight: i < STEPS.length - 1 ? '3.5rem' : '2rem' }}>
            {/* Dot + Line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '1.5rem' }}>
              <div style={{
                width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0,
                background: done ? 'var(--green-900)' : isActive ? 'var(--green-600)' : 'var(--border)',
                border: isActive ? '3px solid var(--green-100)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                boxShadow: isActive ? '0 0 0 4px rgba(27,67,50,0.15)' : 'none',
              }}>
                {done ? '✓' : ''}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, width: '2px', minHeight: '1.5rem',
                  background: done ? 'var(--green-900)' : 'var(--border)',
                }} />
              )}
            </div>
            {/* Text */}
            <div style={{ paddingBottom: '0.5rem' }}>
              <div style={{
                fontSize: '0.9rem', fontWeight: done || isActive ? 600 : 400,
                color: done ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
                {step.label}
              </div>
              {tsMap[step.status] && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatTime(tsMap[step.status])}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
