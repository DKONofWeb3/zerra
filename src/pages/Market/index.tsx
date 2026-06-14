import { useEffect, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { cn } from "@/lib/cn";
import { X, ChevronDown } from "lucide-react";

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
  data?: {
    price: string;
    price_change_percentage_24h: { usd: number };
    sparkline: string;
  };
}

interface Topic {
  title: string;
  hashtags: string[];
  why: string;
  ideas: string[];
  relatedCoins: string[];
}

const TIMEFRAMES = [
  { id: "1d",  label: "1D" },
  { id: "7d",  label: "7D" },
  { id: "3m",  label: "3M" },
  { id: "6m",  label: "6M" },
];

// Topics are static but we simulate timeframe filtering by rotating subsets
const ALL_TOPICS: Topic[] = [
  { title: "Bitcoin ETF inflows hit record high", hashtags: ["#Bitcoin", "#ETF", "#BTC", "#Crypto"], why: "Spot Bitcoin ETFs are seeing record inflows as institutional demand surges, pushing BTC to new highs.", ideas: ["Break down what a Bitcoin ETF is and why it matters", "Compare ETF inflows vs previous cycles", "Explain how ETFs affect BTC price", "Interview a retail investor about buying BTC via ETF"], relatedCoins: ["Bitcoin", "Ethereum"] },
  { title: "Solana ecosystem growth in 2026", hashtags: ["#Solana", "#SOL", "#Web3", "#DeFi"], why: "Solana's developer activity and DeFi TVL have grown significantly, with major protocols launching on the network.", ideas: ["Top 5 Solana projects to watch", "Compare Solana vs Ethereum fees", "Beginner's guide to Solana DeFi", "Why builders are choosing Solana"], relatedCoins: ["Solana"] },
  { title: "Layer 2 wars: Base vs Arbitrum", hashtags: ["#Base", "#Arbitrum", "#Layer2", "#Ethereum"], why: "Both Base and Arbitrum are competing for L2 dominance with different strategies, attracting billions in TVL.", ideas: ["Side-by-side comparison of Base and Arbitrum", "Which L2 has lower fees?", "Top dApps on each network", "Is L2 the future of Ethereum?"], relatedCoins: ["Ethereum"] },
  { title: "DeFi yields rebounding", hashtags: ["#DeFi", "#Yield", "#Crypto", "#Staking"], why: "DeFi protocols are offering higher yields as liquidity providers return after a period of low activity.", ideas: ["Best DeFi yields right now", "How to safely farm DeFi yields", "Risks of chasing high APY", "Top yield protocols in 2026"], relatedCoins: ["Ethereum", "Solana"] },
  { title: "AI tokens gaining traction", hashtags: ["#AITokens", "#AI", "#Crypto", "#Web3AI"], why: "The intersection of AI and crypto is gaining momentum with several AI-powered protocols reaching new ATHs.", ideas: ["Top 5 AI crypto tokens explained", "How AI is changing DeFi", "Is AI crypto a bubble or the future?", "Which AI tokens have real utility?"], relatedCoins: ["Bitcoin"] },
  { title: "Memecoins dominating TikTok", hashtags: ["#Memecoins", "#DOGE", "#PEPE", "#CryptoTikTok"], why: "Memecoin culture has merged with TikTok creator culture, generating massive organic reach and trading volume.", ideas: ["Why memecoins go viral on TikTok", "The memecoin creator playbook", "How to talk about memecoins safely", "Memecoin community building strategies"], relatedCoins: ["Dogecoin"] },
  { title: "RWA tokenization wave", hashtags: ["#RWA", "#Tokenization", "#RealEstate", "#Crypto"], why: "Real-world asset tokenization is exploding as traditional finance starts bringing bonds, real estate and commodities on-chain.", ideas: ["What is RWA tokenization?", "Top RWA protocols to watch", "How to invest in tokenized assets", "Is RWA the next big crypto trend?"], relatedCoins: ["Ethereum"] },
  { title: "Crypto influencer marketing ROI", hashtags: ["#CryptoMarketing", "#Influencer", "#Web3", "#CreatorEconomy"], why: "Crypto projects are shifting budgets toward creator-led campaigns after seeing higher ROI vs traditional ads.", ideas: ["How much do crypto influencers earn?", "How to pitch crypto projects as a creator", "Building a crypto audience from zero", "Authentic vs paid crypto content"], relatedCoins: ["Bitcoin", "Ethereum"] },
  { title: "Web3 gaming summer incoming", hashtags: ["#Web3Gaming", "#GameFi", "#NFT", "#PlayToEarn"], why: "Several AAA-quality Web3 games are launching this quarter, potentially driving a new wave of gaming-focused crypto users.", ideas: ["Top Web3 games launching in 2026", "Beginner's guide to GameFi", "Are Web3 games actually fun?", "How to earn from Web3 gaming"], relatedCoins: ["Ethereum", "Solana"] },
  { title: "Stablecoin regulation clarity", hashtags: ["#Stablecoins", "#USDC", "#Regulation", "#Crypto"], why: "New regulatory frameworks are providing clearer rules for stablecoin issuers, boosting institutional confidence.", ideas: ["What the new stablecoin rules mean for you", "USDC vs USDT: which is safer?", "How regulation affects crypto prices", "Stablecoins explained simply"], relatedCoins: ["Ethereum"] },
  { title: "NFT utility making comeback", hashtags: ["#NFT", "#Web3", "#Digital", "#Utility"], why: "NFTs with real utility — memberships, gaming items, credentials — are gaining traction over pure speculative art.", ideas: ["NFTs that actually have utility", "How to use NFTs for community building", "Are NFTs dead or evolving?", "Best NFT projects of 2026"], relatedCoins: ["Ethereum", "Solana"] },
  { title: "DAO governance improvements", hashtags: ["#DAO", "#Governance", "#Web3", "#DeFi"], why: "DAOs are experimenting with new governance models to improve participation rates and reduce voter apathy.", ideas: ["How DAOs are fixing their governance", "Should you join a DAO in 2026?", "Top DAOs to watch", "How DAO voting works"], relatedCoins: ["Ethereum"] },
];

// Simulate different topic sets per timeframe
function getTopicsForTimeframe(tf: string): Topic[] {
  switch (tf) {
    case "1d": return ALL_TOPICS.slice(0, 6);
    case "7d": return ALL_TOPICS.slice(0, 9);
    case "3m": return ALL_TOPICS.slice(0, 11);
    case "6m": return ALL_TOPICS;
    default:   return ALL_TOPICS.slice(0, 6);
  }
}

// ─── Coin pill (horizontal row) ──────────────────────────────────────────────
function CoinPill({ coin, rank }: { coin: TrendingCoin; rank: number }) {
  const change = coin.data?.price_change_percentage_24h?.usd ?? 0;
  const isUp   = change >= 0;

  return (
    <div
      className="relative overflow-hidden shrink-0 rounded-2xl border border-white/[0.06] p-4 flex flex-col gap-3 hover:border-white/[0.14] transition-all hover:-translate-y-0.5 cursor-default"
      style={{ background: "rgb(var(--bg-card))", width: 200, minWidth: 200 }}
    >
      {/* shimmer top line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
      />
      {/* faint sparkline bg */}
      {coin.data?.sparkline && (
        <img
          src={coin.data.sparkline}
          alt=""
          aria-hidden
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.12] pointer-events-none"
          style={{ height: "45%", objectFit: "fill" }}
        />
      )}

      {/* header: coin + rank badge */}
      <div className="relative flex items-center gap-2.5">
        <div className="relative shrink-0">
          <img
            src={coin.thumb}
            alt={coin.name}
            className="w-8 h-8 rounded-full"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-bg-elevated border border-white/[0.08] text-[8px] font-bold text-fg-tertiary flex items-center justify-center">
            {rank}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-fg-primary truncate">{coin.name}</p>
          <p className="text-[11px] text-fg-tertiary uppercase">{coin.symbol}</p>
        </div>
      </div>

      {/* price + change */}
      <div className="relative flex items-end justify-between gap-2">
        <p className="text-[17px] font-display font-medium text-gradient leading-none">
          {coin.data?.price ?? "—"}
        </p>
        <span
          className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums shrink-0", isUp ? "text-success" : "text-danger")}
          style={{ backgroundColor: isUp ? "rgb(var(--success) / 0.12)" : "rgb(var(--danger) / 0.12)" }}
        >
          {isUp ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>

      {/* trending dot */}
      <div className="relative flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        <span className="text-[10.5px] text-fg-tertiary">Trending</span>
      </div>
    </div>
  );
}

// ─── Topic card ───────────────────────────────────────────────────────────────
function TopicCard({ topic, onClick }: { topic: Topic; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 text-left hover:border-white/[0.14] transition-all hover:-translate-y-0.5 w-full"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
      />
      <div className="relative">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand"># Trending</span>
        <p className="mt-2 text-[14.5px] font-semibold text-fg-primary leading-snug">{topic.title}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topic.hashtags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[11px] text-fg-tertiary border border-white/[0.06] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── Topic detail slide panel ─────────────────────────────────────────────────
function TopicPanel({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed top-0 right-0 bottom-0 z-40 flex flex-col overflow-hidden border-l border-white/[0.06] w-full max-w-[440px]"
        style={{ background: "rgb(6 8 14)" }}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/[0.06]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand"># Trending</span>
            <h2 className="mt-1.5 text-[18px] font-semibold text-fg-primary leading-snug">{topic.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg border border-white/[0.06] bg-bg-elevated grid place-items-center text-fg-tertiary hover:text-fg-primary transition-colors mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <p className="text-[12px] text-fg-tertiary uppercase tracking-wider font-medium mb-2">Why it's trending</p>
            <p className="text-[13.5px] text-fg-secondary leading-relaxed">{topic.why}</p>
          </div>
          <div>
            <p className="text-[12px] text-fg-tertiary uppercase tracking-wider font-medium mb-3">Hashtags to use</p>
            <div className="flex flex-wrap gap-2">
              {topic.hashtags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-[12.5px] font-medium border border-brand/25 bg-brand/10 text-brand">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] text-fg-tertiary uppercase tracking-wider font-medium mb-3">Content ideas</p>
            <div className="space-y-2">
              {topic.ideas.map((idea, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04] bg-bg-elevated/40">
                  <span className="w-5 h-5 rounded-full bg-brand/15 border border-brand/25 text-[10px] font-bold text-brand flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-fg-secondary leading-relaxed">{idea}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] text-fg-tertiary uppercase tracking-wider font-medium mb-3">Related coins</p>
            <div className="flex flex-wrap gap-2">
              {topic.relatedCoins.map((coin) => (
                <span key={coin} className="px-3 py-1.5 rounded-full text-[12.5px] border border-white/[0.08] bg-bg-elevated text-fg-secondary">
                  {coin}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-2 pb-4">
            <a
              href="/explore"
              className="block w-full py-3 rounded-xl text-center text-[13.5px] font-semibold text-white transition-colors"
              style={{ background: "rgb(74 125 255)" }}
            >
              Browse Related Campaigns
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Timeframe dropdown ───────────────────────────────────────────────────────
function TimeframeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = TIMEFRAMES.find((t) => t.id === value) ?? TIMEFRAMES[0];

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12.5px] font-medium transition-all",
          open
            ? "border-brand/40 bg-brand/10 text-fg-primary"
            : "border-white/[0.06] bg-bg-elevated text-fg-tertiary hover:border-white/[0.12] hover:text-fg-secondary"
        )}
      >
        {current.label}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-20 rounded-xl border border-white/[0.08] overflow-hidden"
          style={{ background: "rgb(10 12 20)", minWidth: 80 }}
        >
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => { onChange(tf.id); setOpen(false); }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-[12.5px] font-medium transition-colors",
                tf.id === value
                  ? "text-brand bg-brand/10"
                  : "text-fg-tertiary hover:text-fg-primary hover:bg-white/[0.04]"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MarketPage() {
  usePageTitle("Zerra · Market");
  const [coins,     setCoins]     = useState<TrendingCoin[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [selected,  setSelected]  = useState<Topic | null>(null);
  const [timeframe, setTimeframe] = useState("1d");

  const topics = getTopicsForTimeframe(timeframe);

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
      {/* Page header */}
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Live from CoinGecko</span>
          <span className="ml-auto text-[11.5px] px-2.5 py-1 rounded-full border border-white/[0.06] bg-bg-elevated text-fg-muted">
            Updates every 5 min
          </span>
        </div>
        <h2
          className={cn(
            "mt-4 font-display font-medium tracking-[-0.03em]",
            "text-[48px] md:text-[64px] leading-[0.95]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}
        >
          Market
        </h2>
      </div>

      {/* ── Trending Coins — horizontal scroll row ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h3 className="text-[18px] font-semibold text-fg-primary">Trending Coins</h3>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-white/[0.06] bg-bg-elevated text-fg-tertiary">
            Top 8 on CoinGecko
          </span>
        </div>

        {loading ? (
          /* Skeleton row */
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div
                key={i}
                className="shrink-0 h-[130px] rounded-2xl border border-white/[0.06] animate-pulse"
                style={{ background: "rgb(var(--bg-card))", width: 200 }}
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-card border border-white/[0.06] p-8 text-center"
            style={{ background: "rgb(var(--bg-card))" }}
          >
            <p className="text-[14px] text-fg-tertiary">
              Could not load trending coins. CoinGecko rate limit may apply.
            </p>
          </div>
        ) : (
          /* Horizontal scroll row — same pattern as price cards */
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`.coins-row::-webkit-scrollbar { display: none; }`}</style>
            {coins.map((coin, i) => (
              <CoinPill key={coin.id} coin={coin} rank={i + 1} />
            ))}
          </div>
        )}
      </div>

      {/* ── Trending Topics ── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-[18px] font-semibold text-fg-primary whitespace-nowrap">
              What Creators Are Talking About
            </h3>
            <span className="hidden sm:block text-[12px] text-fg-tertiary shrink-0">
              Click any topic for content ideas
            </span>
          </div>
          {/* Timeframe dropdown */}
          <TimeframeDropdown value={timeframe} onChange={setTimeframe} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {topics.map((topic, i) => (
            <TopicCard key={`${timeframe}-${i}`} topic={topic} onClick={() => setSelected(topic)} />
          ))}
        </div>
      </div>

      {/* Topic detail panel */}
      {selected && <TopicPanel topic={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}