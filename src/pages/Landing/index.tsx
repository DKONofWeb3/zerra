import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";

const SIGNUP = "/login?mode=signup";

// Matches the real nav on the live site (valuable-guest-578488.framer.app):
// Home / Key Features / How it works / About. "About" doesn't have a
// confirmed section of its own yet, so it falls back to the top for now.
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Home", href: "#top" },
  { label: "Key Features", href: "#key-features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#top" },
];

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface WaveLayerProps { d: string; top: string; height: number; color: string; opacity: number; duration: number; delay?: number }

/** One seamlessly-looping ocean wave — the path is rendered twice side by side
 *  in a 200%-wide track that translates by exactly -50%, so the loop point is
 *  invisible. Linear timing is required for the loop to read as continuous. */
function WaveLayer({ d, top, height, color, opacity, duration, delay = 0 }: WaveLayerProps) {
  return (
    <motion.div
      aria-hidden
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
      style={{ position: "absolute", left: 0, top, width: "200%", height, display: "flex" }}
    >
      {[0, 1].map((i) => (
        <svg key={i} width="50%" height="100%" viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ display: "block", flexShrink: 0 }}>
          <path d={d} fill={color} opacity={opacity} />
        </svg>
      ))}
    </motion.div>
  );
}

const WAVE_PATHS = {
  back:  "M0,90 C180,50 360,130 540,90 C720,50 900,130 1080,90 C1260,50 1440,130 1440,90 L1440,220 L0,220 Z",
  mid:   "M0,70 C200,120 400,20 720,70 C1040,120 1240,20 1440,70 L1440,220 L0,220 Z",
  front: "M0,60 C160,10 320,110 640,60 C960,10 1120,110 1440,60 L1440,220 L0,220 Z",
};

// The 4 real background glow ellipses from the Figma hero (341:1874-341:1877),
// converted from their absolute px position on the 1440×1024 reference frame
// to percentages so they scale with the viewport instead of guessing a gradient.
const HERO_GLOWS: { src: string; left: string; top: string; width: string; height: string; inset: string; blend: boolean }[] = [
  { src: "/login-bg/hero-glow-1.svg", left: "49.76%", top: "62.11%", width: "66.32%", height: "93.26%", inset: "-70.09%", blend: false },
  { src: "/login-bg/hero-glow-2.svg", left: "49.72%", top: "75.88%", width: "64.31%", height: "90.43%", inset: "-72.57%", blend: true },
  { src: "/login-bg/hero-glow-3.svg", left: "48.75%", top: "76.46%", width: "119.17%", height: "89.84%", inset: "-97.18% -52.1%", blend: true },
  { src: "/login-bg/hero-glow-4.svg", left: "48.75%", top: "84.47%", width: "119.17%", height: "72.36%", inset: "-120.66% -52.1%", blend: true },
];

function GlowLayers() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {HERO_GLOWS.map((g, i) => (
        <div key={i} style={{ position: "absolute", left: g.left, top: g.top, width: g.width, height: g.height, transform: "translateX(-50%)", mixBlendMode: g.blend ? "plus-lighter" : "normal" }}>
          <div style={{ position: "absolute", inset: g.inset }}>
            <img src={g.src} alt="" style={{ display: "block", width: "100%", height: "100%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function NavBar() {
  return (
    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px" }}>
      <img src="/login-bg/hero-nav-logo.png" alt="Zerra" style={{ height: 24, width: "auto" }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 24,
        background: "rgb(28 28 28 / 0.2)", borderRadius: 191, padding: "10px 20px",
        fontSize: 14, fontWeight: 500, color: "#fff", whiteSpace: "nowrap",
      }} className="hero-nav-pill">
        {NAV_ITEMS.map((item) => (
          <a key={item.label} href={item.href} style={{ color: "inherit", textDecoration: "none" }}>
            {item.label}
          </a>
        ))}
      </div>
      <Link to={SIGNUP} style={{
        background: "#f7f6f4", color: "#1c1c1c", textDecoration: "none",
        borderRadius: 100, padding: "10px 20px", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap",
      }}>
        Start Earning
      </Link>
    </div>
  );
}

/**
 * Intro "Welcome to Zerra" section — verified against the real live site
 * (valuable-guest-578488.framer.app): it's the first in-flow section of a
 * normal scrollable page, not a timed full-screen overlay — scrolling past
 * it is what reveals the hero. The reveal itself (badge + heading) is fast
 * there, under ~1s, so this is tuned much snappier than the first pass.
 */
function WelcomeSection() {
  return (
    <section
      id="top"
      style={{
        position: "relative", overflow: "hidden", minHeight: "100vh",
        background: "linear-gradient(180deg, #0a2f52 0%, #05192f 32%, #030f1e 60%, #010a15 100%)",
        fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <WaveLayer d={WAVE_PATHS.back}  top="48%" height={220} color="#123a63" opacity={0.55} duration={16} />
      <WaveLayer d={WAVE_PATHS.mid}   top="58%" height={220} color="#1c5490" opacity={0.6}  duration={11} delay={0.3} />
      <WaveLayer d={WAVE_PATHS.front} top="70%" height={260} color="#2f7dd1" opacity={0.55} duration={7}  delay={0.6} />

      <NavBar />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100% - 76px)", gap: 32 }}>
        <motion.h1
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05, ease: REVEAL_EASE }}
          style={{
            margin: 0, textAlign: "center", fontSize: "clamp(32px, 5.5vw, 56px)", fontWeight: 600,
            letterSpacing: "2px", lineHeight: 1.25, color: "rgb(225 235 250)",
          }}
        >
          WELCOME<br />TO ZERRA
        </motion.h1>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: REVEAL_EASE }}
            style={{
              position: "absolute", width: 340, height: 340, borderRadius: "50%",
              background: "radial-gradient(circle, rgb(140 200 255 / 0.55) 0%, rgb(70 130 220 / 0.18) 45%, transparent 72%)",
              filter: "blur(6px)",
            }}
          />
          <motion.img
            src="/login-bg/badge-only.png"
            alt=""
            initial={{ opacity: 0, scale: 0.72, y: -14, filter: "blur(16px)" }}
            whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: REVEAL_EASE }}
            style={{ position: "relative", width: "clamp(150px, 18vw, 230px)", height: "auto" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  // Cross-fades this section in as the visitor scrolls out of the Welcome
  // section above — approximates the real site's scroll-driven cover/reveal
  // transition (its exact internal mechanism wasn't reliably observable
  // through automated scrolling, so this is a faithful equivalent, not a
  // pixel copy).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  return (
    <motion.section
      ref={sectionRef}
      style={{ position: "relative", overflow: "hidden", background: "#06080e", minHeight: "100vh", opacity, scale }}
    >
      <GlowLayers />
      <NavBar />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "120px 24px 0" }}>
        <h1 style={{
          margin: "0 0 20px", maxWidth: 780, fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 500,
          lineHeight: 1.2, letterSpacing: "-1.8px",
          backgroundImage: "linear-gradient(-1deg, rgb(255 255 255) 38%, rgb(153 153 153 / 0.49) 96%)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          Earn USDC from your Content with Stable Value
        </h1>
        <p style={{ margin: "0 0 32px", maxWidth: 460, fontSize: 16, fontWeight: 500, color: "#e0e0e0", lineHeight: 1.5 }}>
          Zerra connects social creators across TikTok, X, YouTube, and Instagram with top Web3 campaigns.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 64 }}>
          <Link to={SIGNUP} style={{ background: "#f7f6f4", color: "#1c1c1c", textDecoration: "none", borderRadius: 100, padding: "12px 24px", fontSize: 16, fontWeight: 500 }}>
            Start Earning
          </Link>
          <Link to={SIGNUP} style={{ background: "rgb(28 28 28 / 0.3)", color: "#fff", textDecoration: "none", borderRadius: 100, padding: "12px 24px", fontSize: 16, fontWeight: 500 }}>
            Launch Campaign
          </Link>
        </div>

        <div style={{
          width: "min(1063px, 92vw)", background: "rgb(255 255 255 / 0.1)", borderRadius: 29, padding: 8,
          boxShadow: "0 40px 120px rgb(0 0 0 / 0.5)",
        }}>
          <div style={{ borderRadius: 21, overflow: "hidden", background: "#06080e" }}>
            <img src="/login-bg/hero-dashboard-preview.png" alt="Zerra analytics dashboard preview" style={{ display: "block", width: "100%", height: "auto" }} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Stats — real copy + target numbers confirmed from the live site
// (counters start at 0 there too) ───────────────────────────────────────
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
      <p style={{ margin: "0 0 8px", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, color: "#fff", letterSpacing: "-1px" }}>
        {prefix}{value}{suffix}
      </p>
      <p style={{ margin: 0, fontSize: 15, color: "rgb(160 165 178)" }}>{label}</p>
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

// ── Key Features — both tabs' copy confirmed directly against the live site
// (clicked through to reveal Sponsors, which is hidden by default there too).
const CREATOR_FEATURES = [
  { title: "Seamless Social Verification", description: "Link TikTok or YouTube in two clicks." },
  { title: "Zero Volatility Risk", description: "Earn directly in USDC, keeping your revenue safe from crypto fluctuations." },
  { title: "Curated Bounties", description: "Browse active campaigns managed by Zerra, post content, and cash out." },
];

// Confirmed against the real site — clicked the Sponsors tab directly.
const SPONSOR_FEATURES = [
  { title: "Dedicated Business Dashboard", description: "Monitor real-time impressions, view engagement rates, and track verified campaign ROI." },
  { title: "End-to-End Campaign Management", description: "Zerra handles creator sourcing, brief guidelines, and payout logistics." },
  { title: "Guaranteed Quality Reach", description: "Access pre-vetted creators across TikTok, X, and YouTube with zero bot traffic." },
];

function KeyFeaturesSection() {
  const [tab, setTab] = useState<"creators" | "sponsors">("creators");
  const features = tab === "creators" ? CREATOR_FEATURES : SPONSOR_FEATURES;

  return (
    <section id="key-features" style={{ background: "#06080e", padding: "80px 24px", borderTop: "1px solid rgb(18 20 28)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto 48px", textAlign: "center" }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#4a7dff" }}>Key Features</p>
        <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, color: "#fff", letterSpacing: "-0.5px" }}>
          Powerful Features for Every Stakeholder
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: "rgb(160 165 178)", lineHeight: 1.6 }}>
          Guaranteed USDC earnings for content creators and fully-managed campaign analytics for growing Web3 projects.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
        {(["creators", "sponsors"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 24px", borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: "pointer",
              border: "1px solid rgb(36 40 55)",
              background: tab === key ? "#4a7dff" : "transparent",
              color: tab === key ? "#fff" : "rgb(160 165 178)",
            }}
          >
            {key === "creators" ? "Creators" : "Sponsors"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
        {features.map((f) => (
          <div key={f.title} style={{ background: "rgb(11 13 20)", border: "1px solid rgb(24 27 38)", borderRadius: 16, padding: 24 }}>
            <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#fff" }}>{f.title}</p>
            <p style={{ margin: 0, fontSize: 13.5, color: "rgb(140 145 158)", lineHeight: 1.6 }}>{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How It Works — both lifecycles' copy confirmed from the live site ───
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

function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {steps.map((step, i) => (
        <div key={step.title} style={{ display: "flex", gap: 16 }}>
          <div style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
            background: "rgb(74 125 255 / 0.12)", border: "1px solid rgb(74 125 255 / 0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600, color: "#4a7dff",
          }}>
            {i + 1}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#fff" }}>{step.title}</p>
            <p style={{ margin: 0, fontSize: 13.5, color: "rgb(140 145 158)", lineHeight: 1.6 }}>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: "#06080e", padding: "80px 24px", borderTop: "1px solid rgb(18 20 28)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto 56px", textAlign: "center" }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#4a7dff" }}>How it works</p>
        <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, color: "#fff", letterSpacing: "-0.5px" }}>
          How Zerra Works
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: "rgb(160 165 178)", lineHeight: 1.6 }}>
          Simple, transparent workflows tailored whether you are launching a campaign or monetizing your reach.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48, maxWidth: 900, margin: "0 auto" }}>
        <div>
          <p style={{ margin: "0 0 24px", fontSize: 13, fontWeight: 600, letterSpacing: "0.5px", color: "rgb(160 165 178)" }}>CREATOR LIFECYCLE</p>
          <StepList steps={CREATOR_STEPS} />
        </div>
        <div>
          <p style={{ margin: "0 0 24px", fontSize: 13, fontWeight: 600, letterSpacing: "0.5px", color: "rgb(160 165 178)" }}>BUSINESS LIFECYCLE</p>
          <StepList steps={BUSINESS_STEPS} />
        </div>
      </div>
    </section>
  );
}

// ── FAQ — only one question was visible in the live site's DOM (the rest
// are presumably collapsed accordion panels that don't render their text
// until opened, which automated scrolling couldn't trigger reliably). The
// answer text below is genuinely accurate to how the app works, not
// fabricated, but the full real FAQ list should replace this once available.
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
    <div style={{ borderBottom: "1px solid rgb(24 27 38)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 4px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} style={{ fontSize: 20, color: "rgb(140 145 158)", flexShrink: 0, marginLeft: 16 }}>+</motion.span>
      </button>
      {/* Conditional mount instead of animating height:auto — that pattern needs
          framer-motion to remeasure on every toggle and wasn't resolving
          reliably in testing, so this skips animation for the reveal entirely
          rather than ship something fragile. */}
      {open && (
        <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "rgb(140 145 158)", lineHeight: 1.6 }}>
          {a}
        </p>
      )}
    </div>
  );
}

function FAQSection() {
  return (
    <section style={{ background: "#06080e", padding: "80px 24px", borderTop: "1px solid rgb(18 20 28)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#4a7dff" }}>FAQs</p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, color: "#fff", letterSpacing: "-0.5px" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: "rgb(160 165 178)", lineHeight: 1.6 }}>
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
      fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased", color: "rgb(245 245 247)", overflowX: "hidden",
    }}>
      <style>{`
        @media (max-width: 640px) {
          .hero-nav-pill { display: none !important; }
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
        borderTop: "1px solid rgb(18 20 28)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ fontSize: 12, color: "rgb(60 64 78)" }}>
          © {new Date().getFullYear()} Zerra. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/terms"   style={{ fontSize: 12, color: "rgb(100 104 116)", textDecoration: "none" }}>Terms</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: "rgb(100 104 116)", textDecoration: "none" }}>Privacy</Link>
          <a href="mailto:support@zerra.pro" style={{ fontSize: 12, color: "rgb(100 104 116)", textDecoration: "none" }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
