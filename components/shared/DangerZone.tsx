'use client';

import { useState } from 'react';

interface DangerZoneProps {
  title?: string;
  description?: string;
  confirmText: string;
  buttonLabel?: string;
  onConfirm: () => Promise<void>;
}

/**
 * Danger zone — delete account / irreversible action component.
 * Requires typing confirm text before enabling the action.
 * Used on: /profile/danger, /wholesaler/settings/danger
 */
export function DangerZone({
  title = 'Danger Zone',
  description = 'This action is irreversible. Your account and all data will be deactivated.',
  confirmText,
  buttonLabel = 'Delete My Account',
  onConfirm,
}: DangerZoneProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canConfirm = input === confirmText;

  const handleAction = async () => {
    if (!canConfirm) return;
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError((err as Error).message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: '1.5px solid #FECACA',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        background: '#FEF2F2',
      }}
    >
      <h3
        style={{
          color: '#991B1B',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          marginBottom: '0.5rem',
          fontSize: '1rem',
        }}
      >
        ⚠️ {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: '#7F1D1D', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        {description}
      </p>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="label" htmlFor="danger-confirm-input">
          Type <strong style={{ fontFamily: 'monospace' }}>{confirmText}</strong> to confirm
        </label>
        <input
          id="danger-confirm-input"
          className={`input ${canConfirm ? '' : ''}`}
          placeholder={confirmText}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ borderColor: canConfirm ? '#DC2626' : undefined }}
        />
      </div>

      {error && <p className="field-error" style={{ marginBottom: '0.75rem' }}>{error}</p>}

      <button
        id="danger-confirm-btn"
        className="btn btn-danger"
        onClick={handleAction}
        disabled={!canConfirm || loading}
      >
        {loading ? (
          <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff' }} />
        ) : (
          buttonLabel
        )}
      </button>
    </div>
  );
}
