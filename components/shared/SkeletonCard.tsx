export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '12rem', borderRadius: 'var(--radius-md)' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: '0.875rem',
            borderRadius: 'var(--radius-sm)',
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonText({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 'var(--radius-sm)' }}
    />
  );
}

export function SkeletonGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1.25rem',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Skeleton for an order row (order page) */
export function SkeletonOrderRow() {
  return (
    <div className="card-flat" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="flex justify-between items-center">
        <SkeletonText width="8rem" height="0.85rem" />
        <SkeletonText width="5rem" height="0.85rem" />
      </div>
      <SkeletonText width="100%" height="0.75rem" />
      <div className="flex justify-between items-center">
        <SkeletonText width="6rem" height="0.75rem" />
        <SkeletonText width="4rem" height="1.5rem" />
      </div>
    </div>
  );
}

/** Skeleton for a cart item row (cart page) */
export function SkeletonCartRow() {
  return (
    <div className="flex items-center gap-4" style={{ padding: '1rem 1.25rem' }}>
      <div className="skeleton" style={{ width: '4.5rem', height: '4.5rem', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonText width="60%" height="0.9rem" />
        <SkeletonText width="40%" height="0.75rem" />
        <SkeletonText width="30%" height="0.85rem" />
      </div>
      <div className="skeleton" style={{ width: '6rem', height: '2.2rem', borderRadius: 'var(--radius-md)' }} />
    </div>
  );
}

/** Skeleton for a farmer store card (marketplace) */
export function SkeletonFarmerStore() {
  return (
    <div className="farmer-store-card">
      <div className="farmer-store-header">
        <div className="skeleton" style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)' }} />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonText width="50%" height="1rem" />
          <SkeletonText width="70%" height="0.75rem" />
        </div>
      </div>
      {[1, 2].map(i => (
        <div key={i} className="item-card">
          <div className="skeleton" style={{ width: '6rem', height: '4.5rem', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonText width="50%" height="0.9rem" />
            <SkeletonText width="70%" height="0.75rem" />
            <SkeletonText width="30%" height="0.85rem" />
          </div>
          <div className="skeleton" style={{ width: '6.5rem', height: '2.2rem', borderRadius: 'var(--radius-md)' }} />
        </div>
      ))}
    </div>
  );
}
