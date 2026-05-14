'use client';

import { RFQProvider } from '@/store/rfqStore';
import { StandingOrderProvider } from '@/store/standingOrderStore';

export function WholesalerProviders({ children }: { children: React.ReactNode }) {
  return (
    <StandingOrderProvider>
      <RFQProvider>
        {children}
      </RFQProvider>
    </StandingOrderProvider>
  );
}
