import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { cn } from "@/lib/cn";

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
  price_btc: number;
  score: number;
  data?: {
    price: string;
    price_change_percentage_24h: { usd: number };
    market_cap: string;
    sparkline: string;
  };
}

function CoinCard({ coin, rank }: { coin: TrendingCoin; rank: number }) {
  const change = coin.data?.price_change_percentage_24h?.usd ?? 0;
  const isUp   = change >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 flex flex-col gap-4 hover:border-white/[0.12] transition-all hover:-translate-y-0.5"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      {/* Sparkline background */}
      {coin.data?.sparkline && (
        <img
          src={coin.data.sparkline}
          alt=""
          aria-hidden
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.15] pointer-events-none"
          style={{ height: "50%", objectFit: "fill" }}
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={coin.thumb} alt={coin.name} className="w-10 h-10 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-bg-elevated border border-white/[0.08] text-[9px] font-bold text-fg-tertiary flex items-center justify-center">
              {rank}
            </span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-fg-primary">{coin.name}</p>
            <p className="text-[12px] text-fg-tertiary uppercase">{coin.symbol}</p>
          </div>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums",
          isUp ? "text-success" : "text-danger"
        )} style={{ backgroundColor: isUp ? "rgb(var(--success) / 0.12)" : "rgb(var(--danger) / 0.12)" }}>
          {isUp ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>

      <div className="relative">
        <p className="text-[24px] font-display font-medium text-gradient leading-none">
          {coin.data?.price ?? "—"}
        </p>
        <p className="text-[11.5px] text-fg-tertiary mt-1.5">
          Market cap rank #{coin.market_cap_rank ?? "—"}
        </p>
      </div>

      <div className="relative flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        <span className="text-[11.5px] text-fg-tertiary">Trending on CoinGecko</span>
      </div>
    </div>
  );
}

function TopicCard({ topic, index }: { topic: string; index: number }) {
  const colors = [
    "rgb(74 125 255)", "rgb(140 100 255)", "rgb(80 220 130)",
    "rgb(255 180 50)", "rgb(255 80 80)", "rgb(50 200 220)",
  ];
  const color = colors[index % colors.length];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all cursor-default"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      <div aria-hidden className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }} />
      <div className="relative">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color }}># Trending</span>
        <p className="mt-2 text-[15px] font-semibold text-fg-primary">{topic}</p>
      </div>
    </div>
  );
}

const TRENDING_TOPICS = [
  "Bitcoin ETF inflows hit record high",
  "Solana ecosystem growth in 2026",
  "Layer 2 wars: Base vs Arbitrum",
  "DeFi yields rebounding",
  "AI tokens gaining traction",
  "Memecoins dominating TikTok",
  "RWA tokenization wave",
  "Crypto influencer marketing ROI",
  "Web3 gaming summer incoming",
  "Stablecoin regulation clarity",
  "NFT utility making comeback",
  "DAO governance improvements",
];

export default function MarketPage() {
  usePageTitle("Zerra · Market");
  const [coins,   setCoins]   = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/search/trending", {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((d) => setCoins(d.coins?.slice(0, 8).map((c: any) => c.item) ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12 space-y-10">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Live from CoinGecko</span>
          <span className="ml-auto text-[11.5px] px-2.5 py-1 rounded-full border border-white/[0.06] bg-bg-elevated text-fg-muted">
            Updates every 5 min
          </span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Market
        </h2>
      </div>

      {/* Trending coins */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h3 className="text-[18px] font-semibold text-fg-primary">Trending Coins</h3>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-white/[0.06] bg-bg-elevated text-fg-tertiary">
            Top 8 on CoinGecko
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="h-[180px] rounded-card border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-card border border-white/[0.06] p-8 text-center" style={{ background: "rgb(var(--bg-card))" }}>
            <p className="text-[14px] text-fg-tertiary">Could not load trending coins. CoinGecko rate limit may apply.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {coins.map((coin, i) => (
              <CoinCard key={coin.id} coin={coin} rank={i + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Trending topics */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h3 className="text-[18px] font-semibold text-fg-primary">What Creators Are Talking About</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {TRENDING_TOPICS.map((topic, i) => (
            <TopicCard key={i} topic={topic} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}