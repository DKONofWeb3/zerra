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

type Category =
  | "all"
  | "crypto"
  | "finance"
  | "tech"
  | "ai-business"
  | "entertainment"
  | "education"
  | "lifestyle"
  | "inspiration";

interface Topic {
  title: string;
  hashtags: string[];
  why: string;
  ideas: string[];
  relatedCoins: string[];
  category: Category;
}

const TIMEFRAMES = [
  { id: "1d", label: "1D" },
  { id: "7d", label: "7D" },
  { id: "3m", label: "3M" },
  { id: "6m", label: "6M" },
];

// Same niche list used on the Top Creators page dropdown
const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "crypto", label: "Crypto" },
  { id: "finance", label: "Finance" },
  { id: "tech", label: "Tech" },
  { id: "ai-business", label: "AI/Business" },
  { id: "entertainment", label: "Entertainment" },
  { id: "education", label: "Education" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "inspiration", label: "Inspiration" },
];

// Topics are static but we simulate timeframe filtering by rotating subsets
const ALL_TOPICS: Topic[] = [
  // ── Crypto ──
  { category: "crypto", title: "Bitcoin ETF inflows hit record high", hashtags: ["#Bitcoin", "#ETF", "#BTC", "#Crypto"], why: "Spot Bitcoin ETFs are seeing record inflows as institutional demand surges, pushing BTC to new highs.", ideas: ["Break down what a Bitcoin ETF is and why it matters", "Compare ETF inflows vs previous cycles", "Explain how ETFs affect BTC price", "Interview a retail investor about buying BTC via ETF"], relatedCoins: ["Bitcoin", "Ethereum"] },
  { category: "crypto", title: "Solana ecosystem growth in 2026", hashtags: ["#Solana", "#SOL", "#Web3", "#DeFi"], why: "Solana's developer activity and DeFi TVL have grown significantly, with major protocols launching on the network.", ideas: ["Top 5 Solana projects to watch", "Compare Solana vs Ethereum fees", "Beginner's guide to Solana DeFi", "Why builders are choosing Solana"], relatedCoins: ["Solana"] },
  { category: "crypto", title: "Layer 2 wars: Base vs Arbitrum", hashtags: ["#Base", "#Arbitrum", "#Layer2", "#Ethereum"], why: "Both Base and Arbitrum are competing for L2 dominance with different strategies, attracting billions in TVL.", ideas: ["Side-by-side comparison of Base and Arbitrum", "Which L2 has lower fees?", "Top dApps on each network", "Is L2 the future of Ethereum?"], relatedCoins: ["Ethereum"] },
  { category: "crypto", title: "DeFi yields rebounding", hashtags: ["#DeFi", "#Yield", "#Crypto", "#Staking"], why: "DeFi protocols are offering higher yields as liquidity providers return after a period of low activity.", ideas: ["Best DeFi yields right now", "How to safely farm DeFi yields", "Risks of chasing high APY", "Top yield protocols in 2026"], relatedCoins: ["Ethereum", "Solana"] },
  { category: "crypto", title: "Memecoins dominating TikTok", hashtags: ["#Memecoins", "#DOGE", "#PEPE", "#CryptoTikTok"], why: "Memecoin culture has merged with TikTok creator culture, generating massive organic reach and trading volume.", ideas: ["Why memecoins go viral on TikTok", "The memecoin creator playbook", "How to talk about memecoins safely", "Memecoin community building strategies"], relatedCoins: ["Dogecoin"] },
  { category: "crypto", title: "RWA tokenization wave", hashtags: ["#RWA", "#Tokenization", "#RealEstate", "#Crypto"], why: "Real-world asset tokenization is exploding as traditional finance starts bringing bonds, real estate and commodities on-chain.", ideas: ["What is RWA tokenization?", "Top RWA protocols to watch", "How to invest in tokenized assets", "Is RWA the next big crypto trend?"], relatedCoins: ["Ethereum"] },
  { category: "crypto", title: "Web3 gaming summer incoming", hashtags: ["#Web3Gaming", "#GameFi", "#NFT", "#PlayToEarn"], why: "Several AAA-quality Web3 games are launching this quarter, potentially driving a new wave of gaming-focused crypto users.", ideas: ["Top Web3 games launching in 2026", "Beginner's guide to GameFi", "Are Web3 games actually fun?", "How to earn from Web3 gaming"], relatedCoins: ["Ethereum", "Solana"] },
  { category: "crypto", title: "Stablecoin regulation clarity", hashtags: ["#Stablecoins", "#USDC", "#Regulation", "#Crypto"], why: "New regulatory frameworks are providing clearer rules for stablecoin issuers, boosting institutional confidence.", ideas: ["What the new stablecoin rules mean for you", "USDC vs USDT: which is safer?", "How regulation affects crypto prices", "Stablecoins explained simply"], relatedCoins: ["Ethereum"] },
  { category: "crypto", title: "NFT utility making a comeback", hashtags: ["#NFT", "#Web3", "#Digital", "#Utility"], why: "NFTs with real utility — memberships, gaming items, credentials — are gaining traction over pure speculative art.", ideas: ["NFTs that actually have utility", "How to use NFTs for community building", "Are NFTs dead or evolving?", "Best NFT projects of 2026"], relatedCoins: ["Ethereum", "Solana"] },
  { category: "crypto", title: "DAO governance improvements", hashtags: ["#DAO", "#Governance", "#Web3", "#DeFi"], why: "DAOs are experimenting with new governance models to improve participation rates and reduce voter apathy.", ideas: ["How DAOs are fixing their governance", "Should you join a DAO in 2026?", "Top DAOs to watch", "How DAO voting works"], relatedCoins: ["Ethereum"] },

  // ── Finance ──
  { category: "finance", title: "AI tokens gaining traction", hashtags: ["#AITokens", "#AI", "#Crypto", "#Web3AI"], why: "The intersection of AI and crypto is gaining momentum with several AI-powered protocols reaching new ATHs.", ideas: ["Top 5 AI crypto tokens explained", "How AI is changing DeFi", "Is AI crypto a bubble or the future?", "Which AI tokens have real utility?"], relatedCoins: ["Bitcoin"] },
  { category: "finance", title: "Crypto influencer marketing ROI", hashtags: ["#CryptoMarketing", "#Influencer", "#Web3", "#CreatorEconomy"], why: "Crypto projects are shifting budgets toward creator-led campaigns after seeing higher ROI vs traditional ads.", ideas: ["How much do crypto influencers earn?", "How to pitch crypto projects as a creator", "Building a crypto audience from zero", "Authentic vs paid crypto content"], relatedCoins: ["Bitcoin", "Ethereum"] },
  { category: "finance", title: "Retail investors returning to markets", hashtags: ["#Investing", "#Finance", "#Markets", "#Money"], why: "Retail trading volume is climbing back toward cycle highs as confidence returns across equities and crypto alike.", ideas: ["Signs retail money is coming back", "Building a diversified starter portfolio", "Common first-time investor mistakes", "How to read market sentiment"], relatedCoins: [] },

  // ── Tech ──
  { category: "tech", title: "On-device AI models going mainstream", hashtags: ["#AI", "#Tech", "#EdgeAI", "#Innovation"], why: "Smaller, faster AI models are now running directly on phones and laptops, cutting reliance on the cloud.", ideas: ["What on-device AI actually means", "Best apps using local AI right now", "Privacy wins of on-device processing", "Will this kill cloud AI subscriptions?"], relatedCoins: [] },
  { category: "tech", title: "Open-source tools reshaping dev workflows", hashtags: ["#OpenSource", "#DevTools", "#Coding", "#Tech"], why: "A wave of open-source developer tools is cutting the cost and complexity of shipping software.", ideas: ["Underrated open-source tools to try", "Why teams are ditching paid SaaS", "Building your dev stack for free", "Open source vs proprietary tradeoffs"], relatedCoins: [] },

  // ── AI/Business ──
  { category: "ai-business", title: "AI agents entering the workplace", hashtags: ["#AI", "#Business", "#Automation", "#Productivity"], why: "Companies are piloting autonomous AI agents to handle scheduling, research, and customer support at scale.", ideas: ["What AI agents can (and can't) do yet", "Jobs most likely to use agents first", "How to pilot an AI agent at your company", "Risks of over-automating too fast"], relatedCoins: [] },
  { category: "ai-business", title: "Solo founders scaling with AI tooling", hashtags: ["#Startups", "#AI", "#SoloFounder", "#Business"], why: "AI tooling is letting one-person teams handle work that used to require a full department.", ideas: ["How solo founders use AI to move faster", "The AI stack for a lean startup", "What still needs a human", "Case studies of AI-powered solo builders"], relatedCoins: [] },

  // ── Entertainment ──
  { category: "entertainment", title: "Short-form storytelling formats evolving", hashtags: ["#Entertainment", "#Storytelling", "#Content", "#Creators"], why: "Creators are experimenting with new short-form narrative structures that outperform standard talking-head content.", ideas: ["Story formats that are outperforming right now", "Hook structures that keep people watching", "Breaking down a viral short-form series", "How to plan a multi-part story arc"], relatedCoins: [] },
  { category: "entertainment", title: "Fan communities driving release hype", hashtags: ["#FanCommunity", "#Entertainment", "#Trending"], why: "Tight-knit fan communities are now the main driver of early buzz around new releases, ahead of traditional press.", ideas: ["How fan communities build hype organically", "Turning followers into a real community", "Case study of a fan-led campaign", "Community engagement tactics that work"], relatedCoins: [] },

  // ── Education ──
  { category: "education", title: "Micro-learning content on the rise", hashtags: ["#Education", "#Learning", "#EdTech"], why: "Short, focused educational clips are outperforming long-form tutorials as attention spans shift.", ideas: ["How to teach a concept in under 60 seconds", "Best micro-learning formats to try", "Turning a long course into bite-sized content", "Why short-form learning sticks better"], relatedCoins: [] },
  { category: "education", title: "Skill-based learning over degrees", hashtags: ["#Education", "#Skills", "#CareerGrowth"], why: "More people are choosing targeted skill-based learning paths over traditional degree programs.", ideas: ["In-demand skills people are learning now", "Building a skill-based content series", "Free vs paid learning resources compared", "How to prove skills without a degree"], relatedCoins: [] },

  // ── Lifestyle ──
  { category: "lifestyle", title: "Digital minimalism trend growing", hashtags: ["#Lifestyle", "#Wellness", "#DigitalDetox"], why: "More people are cutting screen time and simplifying their digital lives as a wellness trend.", ideas: ["A day of digital minimalism, documented", "Apps that actually help you disconnect", "Signs you need a digital detox", "Building healthier phone habits"], relatedCoins: [] },
  { category: "lifestyle", title: "Remote-work travel setups trending", hashtags: ["#Lifestyle", "#RemoteWork", "#DigitalNomad"], why: "Remote workers are sharing their travel and productivity setups, driving strong engagement on lifestyle content.", ideas: ["Best cities for remote work right now", "A minimalist remote work travel kit", "Balancing travel and deep work", "Remote work myths vs reality"], relatedCoins: [] },

  // ── Inspiration ──
  { category: "inspiration", title: "Small creators sharing real growth numbers", hashtags: ["#Inspiration", "#CreatorEconomy", "#Growth"], why: "Transparency around real (not vanity) growth numbers is resonating strongly with audiences right now.", ideas: ["Sharing your real numbers and lessons learned", "What actually moved the needle for you", "Debunking overnight success myths", "A realistic month-by-month growth story"], relatedCoins: [] },
  { category: "inspiration", title: "Career-pivot stories going viral", hashtags: ["#Inspiration", "#CareerChange", "#Motivation"], why: "Stories about people successfully pivoting careers are consistently high-performing across platforms.", ideas: ["Your pivot story, told in 3 acts", "What you wish you knew before pivoting", "How to start over without starting from zero", "Advice for someone about to make the leap"], relatedCoins: [] },
];

function getTopics(category: Category, timeframe: string): Topic[] {
  const filtered =
    category === "all" ? ALL_TOPICS : ALL_TOPICS.filter((t) => t.category === category);

  switch (timeframe) {
    case "1d":
      return filtered.slice(0, 6);
    case "7d":
      return filtered.slice(0, 9);
    case "3m":
      return filtered.slice(0, 11);
    case "6m":
      return filtered;
    default:
      return filtered.slice(0, 6);
  }
}

// ─── Coin pill (horizontal row) ───────────────────────────
function CoinPill({ coin, rank }: { coin: TrendingCoin; rank: number }) {
  const change = coin.data?.price_change_percentage_24h?.usd ?? 0;
  const isUp = change >= 0;

  return (
    <div
      className="relative overflow-hidden shrink-0 rounded-2xl border border-white/[0.06] p-4 flex flex-col gap-3 hover:border-white/[0.14] transition-all hover:-translate-y-0.5 cursor-default"
      style={{ background: "rgb(var(--bg-card))", width: 200, minWidth: 200 }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
      />
      {coin.data?.sparkline && (
        <img
          src={coin.data.sparkline}
          alt=""
          aria-hidden
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.12] pointer-events-none"
          style={{ height: "45%", objectFit: "fill" }}
        />
      )}

      <div className="relative flex items-center gap-2.5">
        <div className="relative shrink-0">
          <img
            src={coin.thumb}
            alt={coin.name}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
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

      <div className="relative flex items-end justify-between gap-2">
        <p className="text-[17px] font-display font-medium text-gradient leading-none">
          {coin.data?.price ?? "—"}
        </p>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums shrink-0",
            isUp ? "text-success" : "text-danger"
          )}
          style={{ backgroundColor: isUp ? "rgb(var(--success) / 0.12)" : "rgb(var(--danger) / 0.12)" }}
        >
          {isUp ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>

      <div className="relative flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        <span className="text-[10.5px] text-fg-tertiary">Trending</span>
      </div>
    </div>
  );
}

// ─── Topic card ───────────────────────────
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

// ─── Topic detail slide panel ───────────────────────────
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
          {topic.relatedCoins.length > 0 && (
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
          )}
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

// ─── Generic pill dropdown (used for both timeframe + category) ───────────────────────────
function PillDropdown<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.id === value) ?? options[0];

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
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12.5px] font-medium transition-all whitespace-nowrap",
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
          className="absolute right-0 top-full mt-1.5 z-20 rounded-xl border border-white/[0.08] overflow-hidden max-h-64 overflow-y-auto"
          style={{ background: "rgb(10 12 20)", minWidth: 140 }}
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-[12.5px] font-medium transition-colors whitespace-nowrap",
                opt.id === value ? "text-brand bg-brand/10" : "text-fg-tertiary hover:text-fg-primary hover:bg-white/[0.04]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────
export default function MarketPage() {
  usePageTitle("Zerra · Market");
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [timeframe, setTimeframe] = useState("1d");
  const [category, setCategory] = useState<Category>("all");

  const topics = getTopics(category, timeframe);

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
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-[18px] font-semibold text-fg-primary whitespace-nowrap">
              What Creators Are Talking About
            </h3>
            <span className="hidden sm:block text-[12px] text-fg-tertiary shrink-0">
              Click any topic for content ideas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PillDropdown value={category} options={CATEGORIES} onChange={setCategory} />
            <PillDropdown value={timeframe} options={TIMEFRAMES} onChange={setTimeframe} />
          </div>
        </div>

        {topics.length === 0 ? (
          <div
            className="rounded-card border border-white/[0.06] p-8 text-center"
            style={{ background: "rgb(var(--bg-card))" }}
          >
            <p className="text-[14px] text-fg-tertiary">No trending topics for this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {topics.map((topic, i) => (
              <TopicCard key={`${category}-${timeframe}-${i}`} topic={topic} onClick={() => setSelected(topic)} />
            ))}
          </div>
        )}
      </div>

      {/* Topic detail panel */}
      {selected && <TopicPanel topic={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}