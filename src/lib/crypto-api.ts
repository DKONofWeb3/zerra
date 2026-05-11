/**
 * CoinGecko public API client.
 *
 * No API key required — uses the free tier. Rate limit is ~30 req/min for
 * unauthenticated callers, well below what the dashboard generates (one
 * batched request per refresh).
 *
 * Docs: https://www.coingecko.com/api/documentation
 */

const BASE = "https://api.coingecko.com/api/v3";

/** Map CoinGecko id → ticker pair string used in priceCards. */
export type CoinGeckoId = "bitcoin" | "solana" | "ethereum";

export interface LivePrice {
  /** Last known USD price. */
  price: number;
  /** 24h percent change. Positive = up. */
  changePercent24h: number;
  /** Hourly sparkline values for the last 24h. */
  sparkline: number[];
}

/**
 * Fetch current price + 24h change + 24h hourly sparkline for one or more
 * coins in a single request. Returns a record keyed by CoinGecko id.
 */
export async function fetchLivePrices(
  ids: CoinGeckoId[]
): Promise<Partial<Record<CoinGeckoId, LivePrice>>> {
  if (ids.length === 0) return {};

  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: ids.join(","),
    order: "market_cap_desc",
    sparkline: "true",
    price_change_percentage: "24h",
  });

  const res = await fetch(`${BASE}/coins/markets?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`CoinGecko API responded ${res.status}`);
  }
  const data = (await res.json()) as Array<{
    id: CoinGeckoId;
    current_price: number;
    price_change_percentage_24h: number;
    sparkline_in_7d?: { price: number[] };
  }>;

  const out: Partial<Record<CoinGeckoId, LivePrice>> = {};
  for (const row of data) {
    // CoinGecko's free sparkline_in_7d returns 168 hourly points (7d).
    // Trim to the last 24 hours to match the % change context.
    const full = row.sparkline_in_7d?.price ?? [];
    const sparkline = full.length >= 24 ? full.slice(-24) : full;
    out[row.id] = {
      price: row.current_price,
      changePercent24h: row.price_change_percentage_24h ?? 0,
      sparkline,
    };
  }
  return out;
}
