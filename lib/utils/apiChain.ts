type ChainProvider<T> = () => Promise<T | null>;

/**
 * Tries each provider in order, returns the first successful (non-null) result.
 * If all providers fail or return null, returns the fallback value.
 * Logs which fallback was used for monitoring.
 *
 * Used for: mandi data, OTP, email, AI — all external API calls.
 */
export async function apiChain<T>(
  providers: ChainProvider<T>[],
  fallback: T,
  label: string
): Promise<T> {
  for (let i = 0; i < providers.length; i++) {
    try {
      const result = await providers[i]();
      if (result !== null && result !== undefined) {
        if (i > 0) {
          console.info(`[${label}] Used provider ${i + 1} (fallback)`);
        }
        return result;
      }
    } catch (err) {
      console.warn(`[${label}] Provider ${i + 1} failed:`, (err as Error).message);
    }
  }

  console.error(`[${label}] All providers failed. Using fallback value.`);
  return fallback;
}
