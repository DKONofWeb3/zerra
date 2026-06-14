import { useEffect, useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiGetPublic } from "@/lib/api/client";

interface Creator {
  user_id: string;
  name: string | null;
  avatar: string | null;
  username: string | null;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  post_count: number;
  avg_engagement_rate: number;
  niche?: string;
}

const NICHES = ["All","Education","Entertainment","Inspiration","Lifestyle","Crypto","Finance","AI / Business","Tech"];

// unavatar.io fetches TikTok profile pics by username — no expiry, cached CDN
function tikAvatar(username: string) {
  return `https://unavatar.io/tiktok/${username}`;
}

const TIKTOK_CREATORS: Creator[] = [
  // Education
  { user_id:"tt-edu-1",  name:"Andrei Jikh",       username:"andreijikh",     avatar: tikAvatar("andreijikh"),     niche:"Education",     total_views:420_000_000,      total_likes:18_000_000,      total_comments:310_000,  total_shares:2_100_000,  post_count:310, avg_engagement_rate:7.2 },
  { user_id:"tt-edu-2",  name:"Mark Tilbury",      username:"marktilbury",    avatar: tikAvatar("marktilbury"),    niche:"Education",     total_views:290_000_000,      total_likes:12_500_000,      total_comments:220_000,  total_shares:1_400_000,  post_count:240, avg_engagement_rate:6.8 },
  { user_id:"tt-edu-3",  name:"Humphrey Yang",     username:"humphreytalks",  avatar: tikAvatar("humphreytalks"),  niche:"Education",     total_views:185_000_000,      total_likes:8_200_000,       total_comments:140_000,  total_shares:890_000,    post_count:190, avg_engagement_rate:6.1 },
  { user_id:"tt-edu-4",  name:"Daniel Iles",       username:"daniel.iles",    avatar: tikAvatar("daniel.iles"),    niche:"Education",     total_views:95_000_000,       total_likes:4_100_000,       total_comments:72_000,   total_shares:410_000,    post_count:140, avg_engagement_rate:5.8 },
  // Entertainment
  { user_id:"tt-ent-1",  name:"Khaby Lame",        username:"khaby.lame",     avatar: tikAvatar("khaby.lame"),     niche:"Entertainment", total_views:12_000_000_000,   total_likes:2_200_000_000,   total_comments:18_000_000,total_shares:120_000_000,post_count:1100,avg_engagement_rate:9.4 },
  { user_id:"tt-ent-2",  name:"Bella Poarch",      username:"bellapoarch",    avatar: tikAvatar("bellapoarch"),    niche:"Entertainment", total_views:8_400_000_000,    total_likes:1_400_000_000,   total_comments:11_000_000,total_shares:84_000_000, post_count:650, avg_engagement_rate:8.8 },
  { user_id:"tt-ent-3",  name:"Zach King",         username:"zachking",       avatar: tikAvatar("zachking"),       niche:"Entertainment", total_views:5_200_000_000,    total_likes:880_000_000,     total_comments:7_200_000,total_shares:52_000_000, post_count:820, avg_engagement_rate:8.2 },
  { user_id:"tt-ent-4",  name:"Dixie D'Amelio",    username:"dixiedamelio",   avatar: tikAvatar("dixiedamelio"),   niche:"Entertainment", total_views:3_800_000_000,    total_likes:580_000_000,     total_comments:4_900_000,total_shares:34_000_000, post_count:480, avg_engagement_rate:7.6 },
  // Inspiration
  { user_id:"tt-ins-1",  name:"Jay Shetty",        username:"jayshetty",      avatar: tikAvatar("jayshetty"),      niche:"Inspiration",   total_views:620_000_000,      total_likes:62_000_000,      total_comments:980_000,  total_shares:8_100_000,  post_count:430, avg_engagement_rate:7.6 },
  { user_id:"tt-ins-2",  name:"Prince Ea",         username:"princeea",       avatar: tikAvatar("princeea"),       niche:"Inspiration",   total_views:380_000_000,      total_likes:34_000_000,      total_comments:540_000,  total_shares:4_200_000,  post_count:290, avg_engagement_rate:6.9 },
  { user_id:"tt-ins-3",  name:"Mel Robbins",       username:"melrobbins",     avatar: tikAvatar("melrobbins"),     niche:"Inspiration",   total_views:240_000_000,      total_likes:19_000_000,      total_comments:310_000,  total_shares:2_600_000,  post_count:180, avg_engagement_rate:6.4 },
  { user_id:"tt-ins-4",  name:"Gary Vaynerchuk",   username:"garyvee",        avatar: tikAvatar("garyvee"),        niche:"Inspiration",   total_views:890_000_000,      total_likes:74_000_000,      total_comments:1_200_000,total_shares:9_800_000,  post_count:610, avg_engagement_rate:8.1 },
  // Lifestyle
  { user_id:"tt-lif-1",  name:"Charli D'Amelio",   username:"charlidamelio",  avatar: tikAvatar("charlidamelio"),  niche:"Lifestyle",     total_views:11_200_000_000,   total_likes:1_800_000_000,   total_comments:14_000_000,total_shares:105_000_000,post_count:1400,avg_engagement_rate:8.6 },
  { user_id:"tt-lif-2",  name:"Addison Rae",       username:"addisonre",      avatar: tikAvatar("addisonre"),      niche:"Lifestyle",     total_views:7_800_000_000,    total_likes:1_100_000_000,   total_comments:9_200_000,total_shares:74_000_000, post_count:920, avg_engagement_rate:7.9 },
  { user_id:"tt-lif-3",  name:"Noah Beck",         username:"noahbeck",       avatar: tikAvatar("noahbeck"),       niche:"Lifestyle",     total_views:3_100_000_000,    total_likes:420_000_000,     total_comments:3_800_000,total_shares:28_000_000, post_count:540, avg_engagement_rate:7.1 },
  { user_id:"tt-lif-4",  name:"Alix Earle",        username:"alixearle",      avatar: tikAvatar("alixearle"),      niche:"Lifestyle",     total_views:2_400_000_000,    total_likes:310_000_000,     total_comments:2_900_000,total_shares:19_000_000, post_count:380, avg_engagement_rate:7.4 },
  // Crypto
  { user_id:"tt-cry-1",  name:"Crypto Banter",     username:"cryptobanter",   avatar: tikAvatar("cryptobanter"),   niche:"Crypto",        total_views:310_000_000,      total_likes:22_000_000,      total_comments:420_000,  total_shares:3_400_000,  post_count:580, avg_engagement_rate:8.1 },
  { user_id:"tt-cry-2",  name:"Lark Davis",        username:"larkdavis",      avatar: tikAvatar("larkdavis"),      niche:"Crypto",        total_views:190_000_000,      total_likes:14_000_000,      total_comments:260_000,  total_shares:1_900_000,  post_count:340, avg_engagement_rate:7.4 },
  { user_id:"tt-cry-3",  name:"Michael Wrubel",    username:"michaelwrubel",  avatar: tikAvatar("michaelwrubel"),  niche:"Crypto",        total_views:140_000_000,      total_likes:9_800_000,       total_comments:180_000,  total_shares:1_200_000,  post_count:260, avg_engagement_rate:6.8 },
  { user_id:"tt-cry-4",  name:"Wendy O",           username:"wendyobrien",    avatar: tikAvatar("wendyobrien"),    niche:"Crypto",        total_views:88_000_000,       total_likes:6_200_000,       total_comments:110_000,  total_shares:740_000,    post_count:190, avg_engagement_rate:6.2 },
  { user_id:"tt-cry-5",  name:"BitBoy Crypto",     username:"bitboycrypto",   avatar: tikAvatar("bitboycrypto"),   niche:"Crypto",        total_views:210_000_000,      total_likes:16_000_000,      total_comments:300_000,  total_shares:2_100_000,  post_count:420, avg_engagement_rate:7.1 },
  // Finance
  { user_id:"tt-fin-1",  name:"Vivian Tu",         username:"yourrichbff",    avatar: tikAvatar("yourrichbff"),    niche:"Finance",       total_views:480_000_000,      total_likes:41_000_000,      total_comments:710_000,  total_shares:5_200_000,  post_count:390, avg_engagement_rate:9.1 },
  { user_id:"tt-fin-2",  name:"Graham Stephan",    username:"grahamstephan",  avatar: tikAvatar("grahamstephan"),  niche:"Finance",       total_views:520_000_000,      total_likes:38_000_000,      total_comments:620_000,  total_shares:4_800_000,  post_count:460, avg_engagement_rate:7.8 },
  { user_id:"tt-fin-3",  name:"Tori Dunlap",       username:"herfirst100k",   avatar: tikAvatar("herfirst100k"),   niche:"Finance",       total_views:340_000_000,      total_likes:28_000_000,      total_comments:490_000,  total_shares:3_600_000,  post_count:310, avg_engagement_rate:8.4 },
  { user_id:"tt-fin-4",  name:"Andrei Jikh",       username:"andreijikh",     avatar: tikAvatar("andreijikh"),     niche:"Finance",       total_views:420_000_000,      total_likes:18_000_000,      total_comments:310_000,  total_shares:2_100_000,  post_count:310, avg_engagement_rate:7.2 },
  { user_id:"tt-fin-5",  name:"Humphrey Yang",     username:"humphreytalks",  avatar: tikAvatar("humphreytalks"),  niche:"Finance",       total_views:185_000_000,      total_likes:8_200_000,       total_comments:140_000,  total_shares:890_000,    post_count:190, avg_engagement_rate:6.1 },
  // AI / Business
  { user_id:"tt-ai-1",   name:"Wes Roth",          username:"wes.roth",       avatar: tikAvatar("wes.roth"),       niche:"AI / Business", total_views:160_000_000,      total_likes:11_000_000,      total_comments:210_000,  total_shares:1_600_000,  post_count:220, avg_engagement_rate:7.6 },
  { user_id:"tt-ai-2",   name:"Matt Wolfe",        username:"mattwolfe",      avatar: tikAvatar("mattwolfe"),      niche:"AI / Business", total_views:140_000_000,      total_likes:9_200_000,       total_comments:170_000,  total_shares:1_300_000,  post_count:190, avg_engagement_rate:6.9 },
  { user_id:"tt-ai-3",   name:"The AI Advantage",  username:"theaiadvantage", avatar: tikAvatar("theaiadvantage"), niche:"AI / Business", total_views:110_000_000,      total_likes:7_400_000,       total_comments:130_000,  total_shares:980_000,    post_count:160, avg_engagement_rate:6.4 },
  { user_id:"tt-ai-4",   name:"Gary Vaynerchuk",   username:"garyvee",        avatar: tikAvatar("garyvee"),        niche:"AI / Business", total_views:890_000_000,      total_likes:74_000_000,      total_comments:1_200_000,total_shares:9_800_000,  post_count:610, avg_engagement_rate:8.1 },
  { user_id:"tt-ai-5",   name:"Alex Hormozi",      username:"alexhormozi",    avatar: tikAvatar("alexhormozi"),    niche:"AI / Business", total_views:720_000_000,      total_likes:58_000_000,      total_comments:940_000,  total_shares:7_600_000,  post_count:510, avg_engagement_rate:8.6 },
  // Tech
  { user_id:"tt-tec-1",  name:"Marques Brownlee",  username:"mkbhd",          avatar: tikAvatar("mkbhd"),          niche:"Tech",          total_views:890_000_000,      total_likes:72_000_000,      total_comments:1_100_000,total_shares:8_400_000,  post_count:620, avg_engagement_rate:8.8 },
  { user_id:"tt-tec-2",  name:"Linus Tech Tips",   username:"linustechtips",  avatar: tikAvatar("linustechtips"),  niche:"Tech",          total_views:640_000_000,      total_likes:48_000_000,      total_comments:780_000,  total_shares:5_800_000,  post_count:480, avg_engagement_rate:8.1 },
  { user_id:"tt-tec-3",  name:"Dave2D",            username:"dave2d",         avatar: tikAvatar("dave2d"),         niche:"Tech",          total_views:280_000_000,      total_likes:19_000_000,      total_comments:310_000,  total_shares:2_100_000,  post_count:240, avg_engagement_rate:7.2 },
  { user_id:"tt-tec-4",  name:"iJustine",          username:"ijustine",       avatar: tikAvatar("ijustine"),       niche:"Tech",          total_views:410_000_000,      total_likes:32_000_000,      total_comments:520_000,  total_shares:3_800_000,  post_count:350, avg_engagement_rate:7.9 },
  { user_id:"tt-tec-5",  name:"Unbox Therapy",     username:"unboxtherapy",   avatar: tikAvatar("unboxtherapy"),   niche:"Tech",          total_views:560_000_000,      total_likes:44_000_000,      total_comments:680_000,  total_shares:5_100_000,  post_count:390, avg_engagement_rate:8.3 },
];

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Avatar({ creator }: { creator: Creator }) {
  const [failed, setFailed] = useState(false);
  const initials = (creator.name ?? creator.username ?? "?").charAt(0).toUpperCase();

  if (!creator.avatar || failed) {
    return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-bg-elevated border border-white/[0.06] flex items-center justify-center text-[12px] md:text-[14px] font-semibold text-fg-secondary shrink-0">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={creator.avatar}
      alt={creator.name ?? ""}
      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shrink-0 border border-white/[0.06]"
      onError={() => setFailed(true)}
    />
  );
}

function CreatorRow({ creator, rank }: { creator: Creator; rank: number }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] md:text-[13px] text-fg-muted tabular-nums w-5 md:w-6 text-center shrink-0">{rank}</span>
      <Avatar creator={creator} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] md:text-[13.5px] font-medium text-fg-primary truncate">
          {creator.name ?? creator.username ?? "Unknown"}
        </p>
        {creator.username && (
          <p className="text-[11px] md:text-[12px] text-fg-tertiary truncate">@{creator.username}</p>
        )}
      </div>
      <div className="text-right shrink-0 w-16 md:w-20">
        <p className="text-[12px] md:text-[13px] font-semibold text-fg-primary tabular-nums">
          {creator.avg_engagement_rate.toFixed(1)}%
        </p>
        <p className="text-[10px] md:text-[11px] text-fg-tertiary">Engagement</p>
      </div>
      <div className="hidden sm:block text-right shrink-0 w-16 md:w-20">
        <p className="text-[12px] md:text-[13px] text-fg-secondary tabular-nums">{fmt(creator.total_views)}</p>
        <p className="text-[10px] md:text-[11px] text-fg-tertiary">Views</p>
      </div>
      <div className="hidden md:block text-right shrink-0 w-14">
        <p className="text-[13px] text-fg-secondary tabular-nums">{creator.post_count}</p>
        <p className="text-[11px] text-fg-tertiary">Posts</p>
      </div>
    </div>
  );
}

export default function TopCreatorsPage() {
  usePageTitle("Zerra · Top Creators");
  const [dbCreators, setDbCreators] = useState<Creator[]>([]);
  const [loading, setLoading]       = useState(true);
  const [niche,   setNiche]         = useState("All");
  const [open,    setOpen]          = useState(false);
  const [query,   setQuery]         = useState("");

  useEffect(() => {
    const handler = (e: Event) => setQuery((e as CustomEvent).detail.query ?? "");
    window.addEventListener("zerra:search", handler);
    return () => window.removeEventListener("zerra:search", handler);
  }, []);

  useEffect(() => {
    apiGetPublic<{ creators: Creator[] }>("/analytics/top-creators")
      .then((d) => setDbCreators(d.creators ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Merge DB creators first, then fill with hardcoded (no duplicates by username)
  const dbUsernames = new Set(dbCreators.map((c) => c.username?.toLowerCase()));
  const merged: Creator[] = [
    ...dbCreators,
    ...TIKTOK_CREATORS.filter((c) => !dbUsernames.has(c.username?.toLowerCase())),
  ];

  const byNiche  = niche === "All" ? merged : merged.filter((c) => (c as any).niche === niche);
  const filtered = query.trim()
    ? byNiche.filter((c) =>
        (c.name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (c.username ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : byNiche;
  const sorted = [...filtered].sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate);

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <Star className="w-3.5 h-3.5" />
          <span className="text-[12.5px]">Live leaderboard</span>
        </div>
        <div className="flex items-end justify-between gap-4 mt-4">
          <h2 className={cn(
            "font-display font-medium tracking-[-0.03em]",
            "text-[48px] md:text-[64px] leading-[0.95]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Top Creators
          </h2>
          <div className="relative mb-2 shrink-0">
            <button onClick={() => setOpen((p) => !p)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-white/[0.08] bg-bg-elevated text-[12px] md:text-[13px] font-medium text-fg-primary hover:border-white/[0.15] transition-colors">
              {niche}
              <ChevronDown className={cn("w-3.5 h-3.5 text-fg-tertiary transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/[0.08] overflow-hidden z-20"
                style={{ background: "rgb(8 10 16)" }}>
                {NICHES.map((n) => (
                  <button key={n} onClick={() => { setNiche(n); setOpen(false); }}
                    className={cn("w-full px-4 py-2.5 text-left text-[13px] transition-colors",
                      niche === n ? "bg-brand/10 text-brand font-medium" : "text-fg-secondary hover:bg-white/[0.03] hover:text-fg-primary")}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {(niche !== "All" || query) && (
        <div className="flex flex-wrap items-center gap-2">
          {niche !== "All" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand/20 bg-brand/5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="text-[12px] text-brand">{niche}</span>
            </div>
          )}
          {query && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand/20 bg-brand/5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="text-[12px] text-brand">"{query}"</span>
            </div>
          )}
          <span className="text-[12px] text-fg-tertiary">{sorted.length} creators</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-14 md:h-16 rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-6 py-2"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {sorted.map((c, i) => <CreatorRow key={c.user_id} creator={c} rank={i + 1} />)}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[280px] flex flex-col items-center justify-center gap-4"
          style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No creators found{query ? ` for "${query}"` : ""}.</p>
        </div>
      )}
    </div>
  );
}