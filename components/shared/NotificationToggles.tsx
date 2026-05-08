'use client';

interface NotificationToggle {
  id: string;
  label: string;
  description: string;
  key: string;
}

interface NotificationTogglesProps {
  toggles: NotificationToggle[];
  values: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
  loading?: boolean;
}

/**
 * Notification preference toggles.
 * Used on: /profile/notifications, /farmer/settings, /wholesaler/settings/notifications
 */
export function NotificationToggles({
  toggles,
  values,
  onChange,
  loading = false,
}: NotificationTogglesProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {toggles.map((toggle) => (
        <div
          key={toggle.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {toggle.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {toggle.description}
            </div>
          </div>

          {/* Toggle switch */}
          <button
            id={`toggle-${toggle.id}`}
            type="button"
            role="switch"
            aria-checked={values[toggle.key] ?? false}
            disabled={loading}
            onClick={() => onChange(toggle.key, !(values[toggle.key] ?? false))}
            style={{
              width: '2.75rem',
              height: '1.5rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: values[toggle.key] ? 'var(--green-900)' : 'var(--border)',
              transition: 'background 0.2s ease',
              position: 'relative',
              flexShrink: 0,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '0.1875rem',
                left: values[toggle.key] ? '1.3125rem' : '0.1875rem',
                width: '1.125rem',
                height: '1.125rem',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
