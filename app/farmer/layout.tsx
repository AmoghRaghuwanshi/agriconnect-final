'use client';

import MicFAB from '@/components/farmer/MicFAB';
import VoiceTutorial from '@/components/farmer/VoiceTutorial';

/**
 * Farmer Layout — wraps ALL /farmer/* pages.
 * Injects MicFAB (floating voice button) + VoiceTutorial overlay globally
 * so the voice agent is available on every farmer page, not just the dashboard.
 */
export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MicFAB />
      <VoiceTutorial />
    </>
  );
}
