import { useEffect, useRef, useState } from "react";
import { fetchLivePrices } from "./crypto-api";
import type { CoinGeckoId, LivePrice } from "./crypto-api";

const REFRESH_MS = 60_000;

export type LivePriceMap = Partial<Record<CoinGeckoId, LivePrice>>;

export interface UseCryptoPricesResult {
  prices: LivePriceMap;
  /** True until the first successful fetch completes. */
  loading: boolean;
  /** Set if the most recent fetch failed (older data may still be present). */
  error: string | null;
  /** Timestamp of the last successful fetch (for "updated X ago" labels). */
  lastUpdated: Date | null;
}

/**
 * Fetch live crypto prices for the given CoinGecko ids and keep them
 * fresh by polling every 60s. Safe against component unmounts —
 * in-flight requests' results are discarded if the hook tears down.
 *
 * If a fetch fails (rate limited, offline, etc.), the previous good
 * data is kept so the UI doesn't flash empty.
 */
export function useCryptoPrices(ids: CoinGeckoId[]): UseCryptoPricesResult {
  const [prices, setPrices] = useState<LivePriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Stabilize ids by joining — avoids re-running on every render
  const idsKey = ids.join(",");

  // Track mount state so in-flight responses can be ignored after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const idList = idsKey ? (idsKey.split(",") as CoinGeckoId[]) : [];
    if (idList.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function refresh() {
      try {
        const data = await fetchLivePrices(idList);
        if (cancelled || !mountedRef.current) return;
        setPrices(data);
        setError(null);
        setLastUpdated(new Date());
      } catch (e) {
        if (cancelled || !mountedRef.current) return;
        setError(e instanceof Error ? e.message : "Failed to fetch prices");
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [idsKey]);

  return { prices, loading, error, lastUpdated };
}
