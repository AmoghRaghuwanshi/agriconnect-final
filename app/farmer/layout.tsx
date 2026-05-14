'use client';

import { usePathname } from 'next/navigation';
import MicFAB from '@/components/farmer/MicFAB';
import VoiceTutorial from '@/components/farmer/VoiceTutorial';

/**
 * Farmer Layout — wraps ALL /farmer/* pages.
 * Injects MicFAB (floating voice button) + VoiceTutorial overlay globally
 * so the voice agent is available on every farmer page, not just the dashboard.
 *
 * Exception: Weather page has its own Krishi Mitra chatbot,
 * so MicFAB is hidden there to avoid overlay conflict.
 */
export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWeatherPage = pathname === '/farmer/weather';

  return (
    <>
      {children}
      {!isWeatherPage && <MicFAB />}
      {!isWeatherPage && <VoiceTutorial />}
    </>
  );
}
