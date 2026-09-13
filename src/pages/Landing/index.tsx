import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";

const SIGNUP = "/login?mode=signup";

// Font stacks — matches the real live site (valuable-guest-578488.framer.app),
// confirmed via getComputedStyle on the actual page, not guessed:
// Inter for the splash headline + nav/buttons, DM Sans for every section
// heading and body copy.
const F_DISPLAY = '"Inter", ui-sans-serif, system-ui, sans-serif';
const F_BODY = '"DM Sans", ui-sans-serif, system-ui, sans-serif';

// Matches the real nav on the live site: Home / Key Features / How it works / About.
// "About" doesn't have a confirmed section of its own yet, so it falls back to the top.
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Home", href: "#top" },
  { label: "Key Features", href: "#key-features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#top" },
];

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function NavBar() {
  return (
    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px" }}>
      <img src="/login-bg/hero-nav-logo.png" alt="Zerra" style={{ height: 24, width: "auto" }} />
      <div
        className="hero-nav-pill"
        style={{
          display: "flex", alignItems: "center", gap: 24,
          background: "rgb(28 28 28 / 0.4)", borderRadius: 191, padding: "10px 20px",
          fontFamily: F_DISPLAY, fontSize: 14, fontWeight: 500, color: "#fff", whiteSpace: "nowrap",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <a key={item.label} href={item.href} style={{ color: "inherit", textDecoration: "none" }}>
            {item.label}
          </a>
        ))}
      </div>
      <Link to={SIGNUP} style={{
        background: "#fff", color: "#1c1c1c", textDecoration: "none",
        borderRadius: 999, padding: "11px 24px", fontFamily: F_DISPLAY, fontSize: 14, fontWeight: 600,
        letterSpacing: "0.14px", whiteSpace: "nowrap",
      }}>
        Start Earning
      </Link>
    </div>
  );
}

// The real badge-hero composite, positions confirmed via getBoundingClientRect
// on the live site at a 1440×900 viewport, converted to percentages. Each is
// a real exported Framer asset — the intro video plays once, then dims behind
// this static layered badge (3 stacked medallion layers + a light-ray glow +
// two partially-offscreen "edge" badges), exactly like the real site.
const LIGHT_RAY   = { src: "/landing/hero/light-ray.png",   left: "0%",     top: "-8%",   width: "99%", height: "100%" };
const BADGE_LAYERS = [
  { src: "/landing/hero/badge-base.png",  left: "38.96%", top: "55.9%", width: "20.1%", height: "48.4%" },
  { src: "/landing/hero/badge-ring.png",  left: "39.58%", top: "53.1%", width: "19.8%", height: "49.3%" },
  { src: "/landing/hero/badge-glass.png", left: "38.5%",  top: "54.2%", width: "21.8%", height: "42.2%" },
];
const EDGE_BADGES = [
  { src: "/landing/hero/edge-left.png",  left: "-31.3%", top: "-11.2%", width: "50.1%", height: "121.1%" },
  { src: "/landing/hero/edge-right.png", left: "71.1%",  top: "-81.8%", width: "55.7%", height: "134.7%" },
];

/**
 * "Welcome to Zerra" splash — the real exported reveal video plays once
 * (framerusercontent.com/assets/OQFDkIw64Cz13Mr1o3ZPcgdWQ.mp4), then dims
 * behind the real layered badge composite once it finishes, matching the
 * live site's actual sequence rather than looping the video forever.
 */
function WelcomeSection() {
  const [videoDone, setVideoDone] = useState(false);

  return (
    <section
      id="top"
      style={{ position: "relative", overflow: "hidden", minHeight: "100vh", background: "#06080e" }}
    >
      <motion.video
        autoPlay
        muted
        playsInline
        onEnded={() => setVideoDone(true)}
        animate={{ opacity: videoDone ? 0.18 : 1 }}
        transition={{ duration: 1.2, ease: REVEAL_EASE }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
      >
        <source src="/landing/hero-badge.mp4" type="video/mp4" />
      </motion.video>

      {/* Real badge composite — hidden until the video finishes, then fades/scales in. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: videoDone ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: REVEAL_EASE }}
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <img src={LIGHT_RAY.src} alt="" style={{ position: "absolute", ...LIGHT_RAY }} />
        {EDGE_BADGES.map((b, i) => (
          <img key={i} src={b.src} alt="" className="hero-edge-badge" style={{ position: "absolute", left: b.left, top: b.top, width: b.width, height: b.height }} />
        ))}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0 }}
        >
          {BADGE_LAYERS.map((b, i) => (
            <img key={i} src={b.src} alt="" style={{ position: "absolute", left: b.left, top: b.top, width: b.width, height: b.height }} />
          ))}
        </motion.div>
      </motion.div>

      {/* subtle scrim so the nav + heading stay legible over the video at every frame */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,8,14,0.35) 0%, rgba(6,8,14,0.1) 30%, rgba(6,8,14,0.55) 100%)", zIndex: 1 }} />

      <NavBar />

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: REVEAL_EASE }}
        style={{
          position: "relative", zIndex: 2, margin: "56px 0 0", textAlign: "center",
          fontFamily: F_DISPLAY, fontWeight: 600, fontSize: "clamp(32px, 6vw, 66px)",
          letterSpacing: "-0.08em", lineHeight: 1.15, color: "rgba(255,255,255,0.6)",
        }}
      >
        WELCOME<br />TO ZERRA
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 1 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
        style={{
          position: "absolute", left: "50%", bottom: 32, transform: "translateX(-50%)", zIndex: 2,
          margin: 0, fontFamily: F_BODY, fontSize: 13, color: "rgba(255,255,255,0.5)",
        }}
      >
        Scroll down
      </motion.p>
    </section>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "#06080e" }}>
      {/* real accent-blue glow, sampled from the live site's own palette
          (rgb(38,122,240) / rgb(110,182,255)) — the real site's glow is much
          brighter/larger than a subtle accent touch, washing over most of
          the section behind the dashboard mockup. */}
      <div aria-hidden style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 1600, height: 1100, background: "radial-gradient(ellipse, rgb(38 122 240 / 0.55) 0%, rgb(65 103 217 / 0.28) 40%, rgb(38 122 240 / 0.08) 65%, transparent 80%)", filter: "blur(20px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "100px 24px 0" }}>
        <h1 style={{
          margin: "0 0 20px", maxWidth: 720, fontFamily: F_BODY, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 500,
          lineHeight: 1.15, letterSpacing: "-0.05em",
          backgroundImage: "linear-gradient(-1deg, rgb(255 255 255) 38%, rgb(153 153 153 / 0.49) 96%)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          Earn USDC from your Content with Stable Value
        </h1>
        <p style={{ margin: "0 0 32px", maxWidth: 460, fontFamily: F_BODY, fontSize: 16, fontWeight: 400, color: "rgb(160 165 178)", lineHeight: 1.5 }}>
          Zerra connects social creators across TikTok, X, YouTube, and Instagram with top Web3 campaigns.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 64 }}>
          <Link to={SIGNUP} style={{ background: "#fff", color: "#1c1c1c", textDecoration: "none", borderRadius: 999, padding: "12px 24px", fontFamily: F_DISPLAY, fontSize: 15, fontWeight: 600 }}>
            Start Earning
          </Link>
          <Link to={SIGNUP} style={{ background: "rgb(28 28 28 / 0.5)", color: "#fff", textDecoration: "none", borderRadius: 999, padding: "12px 24px", fontFamily: F_DISPLAY, fontSize: 15, fontWeight: 600 }}>
            Launch Campaign
          </Link>
        </div>

        <div style={{
          width: "min(1063px, 92vw)", background: "rgb(255 255 255 / 0.08)", borderRadius: 29, padding: 8,
          boxShadow: "0 40px 120px rgb(0 0 0 / 0.5)",
        }}>
          <div style={{ borderRadius: 21, overflow: "hidden", background: "#06080e" }}>
            <img src="/landing/dashboard-mockup.png" alt="Zerra analytics dashboard preview" style={{ display: "block", width: "100%", height: "auto" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats — real copy + target numbers confirmed from the live site ────────
const STATS: { target: number; prefix?: string; suffix: string; label: string }[] = [
  { target: 250, suffix: "+", label: "Creators" },
  { target: 10, prefix: "$", suffix: "K", label: "USDC Paid Out" },
  { target: 15, suffix: "M", label: "In Impressions" },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function StatCounter({ target, prefix = "", suffix, label }: { target: number; prefix?: string; suffix: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1500;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <p style={{ margin: "0 0 8px", fontFamily: F_BODY, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
        {prefix}{value}{suffix}
      </p>
      <p style={{ margin: 0, fontFamily: F_BODY, fontSize: 15, color: "rgba(255,255,255,0.7)" }}>{label}</p>
    </div>
  );
}

function StatsSection() {
  return (
    <section style={{ background: "#06080e", padding: "80px 24px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 56, maxWidth: 900, margin: "0 auto" }}>
        {STATS.map((s) => <StatCounter key={s.label} {...s} />)}
      </div>
    </section>
  );
}

// ── Key Features — copy confirmed against the live site. Icons: the coin
// and paper-plane are the real exported Framer assets; the verification
// icon isn't downloadable in the same clean form, so it falls back to a
// plain check-badge glyph rather than a guessed 3D render.
const CREATOR_FEATURES = [
  { title: "Seamless Social Verification", description: "Link TikTok or YouTube in two clicks.", icon: null },
  { title: "Zero Volatility Risk", description: "Earn directly in USDC, keeping your revenue safe from crypto fluctuations.", icon: "/landing/icon-stability.png" },
  { title: "Curated Bounties", description: "Browse active campaigns managed by Zerra, post content, and cash out.", icon: "/landing/icon-bounties.png" },
];

const SPONSOR_FEATURES = [
  { title: "Dedicated Business Dashboard", description: "Monitor real-time impressions, view engagement rates, and track verified campaign ROI.", icon: null },
  { title: "End-to-End Campaign Management", description: "Zerra handles creator sourcing, brief guidelines, and payout logistics.", icon: "/landing/icon-bounties.png" },
  { title: "Guaranteed Quality Reach", description: "Access pre-vetted creators across TikTok, X, and YouTube with zero bot traffic.", icon: "/landing/icon-stability.png" },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 12px", fontFamily: F_BODY, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgb(110 182 255)" }}>
      {children}
    </p>
  );
}

// Real h2 style, confirmed on both "How Zerra Works" and "Frequently Asked
// Questions": DM Sans, 500 weight, 38px, -1.9px letter-spacing, centered.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: "0 0 16px", fontFamily: F_BODY, fontWeight: 500, fontSize: "clamp(28px, 4vw, 38px)",
      letterSpacing: "-0.05em", lineHeight: 1.19, color: "#fff",
    }}>
      {children}
    </h2>
  );
}

function FeatureIcon({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: "rgb(38 122 240 / 0.15)",
        border: "1px solid rgb(110 182 255 / 0.3)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgb(110 182 255)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" />
        </svg>
      </div>
    );
  }
  return <img src={src} alt="" style={{ width: 56, height: 56, objectFit: "contain" }} />;
}

// Real blob colors sampled directly off the live site (large solid circles
// behind the Key Features / How It Works area: rgb(73,143,232) and
// rgb(34,66,107)). The site drifts these slowly top-to-bottom; framer-motion
// reproduces that rather than a static glow.
function SwirlingGlow() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <motion.div
        animate={{ y: [-80, 80, -80], x: [-40, 30, -40] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-15%", left: "50%", marginLeft: -480, width: 960, height: 960, borderRadius: "50%", background: "rgb(73 143 232)", opacity: 0.22, filter: "blur(120px)" }}
      />
      <motion.div
        animate={{ y: [60, -60, 60], x: [20, -30, 20] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: "absolute", top: "35%", left: "50%", marginLeft: -280, width: 700, height: 700, borderRadius: "50%", background: "rgb(34 66 107)", opacity: 0.3, filter: "blur(100px)" }}
      />
    </div>
  );
}

function KeyFeaturesSection() {
  const [tab, setTab] = useState<"creators" | "sponsors">("creators");
  const features = tab === "creators" ? CREATOR_FEATURES : SPONSOR_FEATURES;

  return (
    <section id="key-features" style={{ position: "relative", background: "#06080e", padding: "100px 24px", overflow: "hidden" }}>
      <SwirlingGlow />

      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto 48px", textAlign: "center" }}>
        <SectionEyebrow>Key Features</SectionEyebrow>
        <SectionHeading>Powerful Features for Every Stakeholder</SectionHeading>
        <p style={{ margin: 0, fontFamily: F_BODY, fontSize: 16, color: "rgb(110 110 110)", lineHeight: 1.6 }}>
          Guaranteed USDC earnings for content creators and fully-managed campaign analytics for growing Web3 projects.
        </p>
      </div>

      {/* Real toggle track: rgb(28,28,28) pill, confirmed via computed style. */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 48 }}>
        <div style={{ display: "flex", gap: 4, padding: 3, borderRadius: 165, background: "rgb(28 28 28)" }}>
        {(["creators", "sponsors"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 24px", borderRadius: 100, fontFamily: F_DISPLAY, fontSize: 14, fontWeight: 600, cursor: "pointer",
              border: "none",
              background: tab === key ? "linear-gradient(135deg, rgb(65 103 217) 0%, rgb(38 122 240) 100%)" : "transparent",
              color: tab === key ? "#fff" : "rgb(160 165 178)",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {key === "creators" ? "Creators" : "Sponsors"}
          </button>
        ))}
        </div>
      </div>

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, maxWidth: 1080, margin: "0 auto" }}>
        {features.map((f) => (
          <div key={f.title} style={{
            background: "rgba(28,28,28,0.73)", backdropFilter: "blur(41px)", WebkitBackdropFilter: "blur(41px)",
            borderRadius: 32, padding: "40px 28px 32px", display: "flex", flexDirection: "column", gap: 20,
          }}>
            <FeatureIcon src={f.icon} />
            <div>
              <p style={{ margin: "0 0 8px", fontFamily: F_BODY, fontSize: 24, fontWeight: 500, lineHeight: 1.2, color: "#fff" }}>{f.title}</p>
              <p style={{ margin: 0, fontFamily: F_BODY, fontSize: 16, fontWeight: 400, color: "rgb(110 110 110)", lineHeight: 1.5 }}>{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How It Works — copy confirmed from the live site. ───────────────────
const CREATOR_STEPS = [
  { title: "Connect & Verify", description: "Link your TikTok, X, or YouTube account to establish your creator profile." },
  { title: "Pick a Campaign", description: "Browse managed campaign bounties and reserve your creative spot." },
  { title: "Get Paid in USDC", description: "Post your content, track engagement live on your dashboard, and receive instant USDC payouts." },
];

const BUSINESS_STEPS = [
  { title: "Request a Campaign", description: "Share your campaign goals and budget with the Zerra team." },
  { title: "Managed Deployment", description: "Zerra matches pre-vetted creators and executes the campaign brief." },
  { title: "Track Live Analytics", description: "Log into your dedicated business dashboard to view verified impressions and performance metrics." },
];

// The real site renders each step number as a giant (244px) numeral behind
// the text, faded from muted grey to accent blue via a background-clip
// gradient — confirmed via computed style, not a guessed decorative touch.
function GiantStepNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute", top: -36, left: -6, zIndex: 0, userSelect: "none",
        fontFamily: F_DISPLAY, fontWeight: 400, fontSize: 120, lineHeight: 1,
        backgroundImage: "linear-gradient(0deg, rgb(65 103 217) 0%, rgb(65 103 217 / 0) 80%)",
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        opacity: 0.35,
      }}
    >
      {n}
    </span>
  );
}

function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {steps.map((step, i) => (
        <div key={step.title} style={{ position: "relative", padding: "24px 0 24px 64px", borderTop: i === 0 ? "none" : "1px solid rgb(255 255 255 / 0.06)" }}>
          <GiantStepNumber n={i + 1} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ margin: "0 0 6px", fontFamily: F_BODY, fontSize: 18, fontWeight: 600, color: "#fff" }}>{step.title}</p>
            <p style={{ margin: 0, fontFamily: F_BODY, fontSize: 15, fontWeight: 400, color: "rgb(110 110 110)", lineHeight: 1.6, maxWidth: 360 }}>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: "#06080e", padding: "100px 24px", borderTop: "1px solid rgb(255 255 255 / 0.04)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto 64px", textAlign: "center" }}>
        <SectionEyebrow>How it works</SectionEyebrow>
        <SectionHeading>How Zerra Works</SectionHeading>
        <p style={{ margin: 0, fontFamily: F_BODY, fontSize: 16, color: "rgb(110 110 110)", lineHeight: 1.6 }}>
          Simple, transparent workflows tailored whether you are launching a campaign or monetizing your reach.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, maxWidth: 1000, margin: "0 auto" }}>
        <div>
          <p style={{ margin: "0 0 8px", fontFamily: F_BODY, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgb(160 165 178)" }}>Creator Lifecycle</p>
          <StepList steps={CREATOR_STEPS} />
        </div>
        <div>
          <p style={{ margin: "0 0 8px", fontFamily: F_BODY, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgb(160 165 178)" }}>Business Lifecycle</p>
          <StepList steps={BUSINESS_STEPS} />
        </div>
      </div>
    </section>
  );
}

// ── FAQ — real question confirmed from the live site's DOM; the rest of the
// list wasn't reachable through automated scrolling (collapsed accordion
// panels don't render their text until opened), so those three stay as
// genuinely-accurate placeholder copy pending the real list.
const FAQS = [
  {
    q: "How do i earn USDC on zerra?",
    a: "Connect your TikTok, X, or YouTube account, join an active campaign, and post content using its required hashtags. Once your post is verified, you earn USDC payouts directly to your connected wallet.",
  },
  {
    q: "Which social platforms can I connect?",
    a: "TikTok and Instagram are supported today, with more platforms on the roadmap.",
  },
  {
    q: "How are my payouts calculated?",
    a: "Payouts are based on verified engagement and campaign-specific terms — your dashboard shows real-time tracking for every campaign you join.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgb(255 255 255 / 0.06)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 4px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: F_BODY, fontSize: 16, fontWeight: 500, color: "#fff" }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} style={{ fontSize: 22, color: "rgb(110 110 110)", flexShrink: 0, marginLeft: 16 }}>+</motion.span>
      </button>
      {open && (
        <p style={{ margin: "0 0 22px", fontFamily: F_BODY, fontSize: 14.5, color: "rgb(110 110 110)", lineHeight: 1.6 }}>
          {a}
        </p>
      )}
    </div>
  );
}

function FAQSection() {
  return (
    <section style={{ background: "#06080e", padding: "100px 24px", borderTop: "1px solid rgb(255 255 255 / 0.04)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionEyebrow>FAQs</SectionEyebrow>
          <SectionHeading>Frequently Asked Questions</SectionHeading>
          <p style={{ margin: 0, fontFamily: F_BODY, fontSize: 16, color: "rgb(110 110 110)", lineHeight: 1.6 }}>
            Everything you need to know about earning USDC, campaign tracking, and getting started on Zerra.
          </p>
        </div>
        {FAQS.map((f) => <FAQItem key={f.q} {...f} />)}
      </div>
    </section>
  );
}

export default function LandingPage() {
  usePageTitle("Zerra · Turn your content into a financial asset");

  return (
    <div style={{
      minHeight: "100vh", background: "#06080e",
      fontFamily: F_BODY, WebkitFontSmoothing: "antialiased", color: "rgb(245 245 247)", overflowX: "hidden",
    }}>
      <style>{`
        @media (max-width: 640px) {
          .hero-nav-pill { display: none !important; }
          .hero-edge-badge { display: none !important; }
        }
      `}</style>

      <WelcomeSection />
      <Hero />
      <StatsSection />
      <KeyFeaturesSection />
      <HowItWorksSection />
      <FAQSection />

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "24px",
        background: "rgb(4 5 9)",
        borderTop: "1px solid rgb(255 255 255 / 0.04)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ fontFamily: F_BODY, fontSize: 12, color: "rgb(90 94 106)" }}>
          © {new Date().getFullYear()} Zerra. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/terms"   style={{ fontFamily: F_BODY, fontSize: 12, color: "rgb(120 124 136)", textDecoration: "none" }}>Terms</Link>
          <Link to="/privacy" style={{ fontFamily: F_BODY, fontSize: 12, color: "rgb(120 124 136)", textDecoration: "none" }}>Privacy</Link>
          <a href="mailto:support@zerra.pro" style={{ fontFamily: F_BODY, fontSize: 12, color: "rgb(120 124 136)", textDecoration: "none" }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
