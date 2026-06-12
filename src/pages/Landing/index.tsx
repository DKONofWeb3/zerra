import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MobileLock } from "@/components/MobileLock";

 <MobileLock />

const CARDS = [
  { src: "/creator-cards/card-1.png", style: { top: "8%",  left: "52%", width: 210, transform: "rotate(-1.5deg)", zIndex: 5 } },
  { src: "/creator-cards/card-2.png", style: { top: "28%", left: "30%", width: 185, transform: "rotate(1deg)",    zIndex: 4 } },
  { src: "/creator-cards/card-3.png", style: { top: "53%", left: "24%", width: 195, transform: "rotate(-1deg)",   zIndex: 5 } },
  { src: "/creator-cards/card-4.png", style: { top: "50%", left: "53%", width: 200, transform: "rotate(1.5deg)",  zIndex: 4 } },
];

const STATS = [
  { value: "12,000+", label: "Creators" },
  { value: "$2.4M",   label: "USDC Paid Out" },
  { value: "340+",    label: "Campaigns" },
];

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Earn USDC",
    description: "Get paid in stablecoins for creating content that promotes crypto projects. No volatility, just real money.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: "Track Analytics",
    description: "Connect your TikTok and get deep insights into your post performance, engagement rate, and audience growth.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Real-time Campaigns",
    description: "Browse live campaigns from top crypto projects and claim bounties that match your niche and audience.",
  },
];

export default function LandingPage() {
  usePageTitle("Zerra · Turn your content into a financial asset");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased",
      color: "rgb(245 245 247)",
      overflowX: "hidden",
    }}>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: "rgb(0 0 0 / 0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgb(255 255 255 / 0.05)",
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgb(74 125 255)" }}>
          ZERRA
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/login" style={{
            padding: "8px 20px", borderRadius: 9999, fontSize: 13.5, fontWeight: 500,
            color: "rgb(158 162 175)", textDecoration: "none", transition: "color 0.15s",
          }}>
            Sign in
          </Link>
          <Link to="/login" style={{
            padding: "8px 20px", borderRadius: 9999, fontSize: 13.5, fontWeight: 600,
            background: "rgb(74 125 255)", color: "#fff", textDecoration: "none",
            boxShadow: "0 0 20px rgb(74 125 255 / 0.35)",
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden",
      }}>
        {/* LEFT — visual */}
        <div style={{ flex: "0 0 55%", position: "relative", overflow: "hidden" }}>
          {/* Blue curved rect */}
          <img src="/login-bg/rect-blue.png" alt="" aria-hidden draggable={false}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
          />
          {/* Overlay */}
          <img src="/login-bg/rect-overlay.png" alt="" aria-hidden draggable={false}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill", mixBlendMode: "overlay", opacity: 0.5, pointerEvents: "none", userSelect: "none" }}
          />
          {/* Bottom glow */}
          <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, width: "60%", height: "35%", background: "radial-gradient(ellipse 80% 80% at 0% 100%, rgb(40 70 160 / 0.4) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

          {/* Floating cards */}
          {CARDS.map((card, i) => (
            <img key={i} src={card.src} alt={`Creator ${i + 1}`} draggable={false}
              style={{ position: "absolute", borderRadius: 16, boxShadow: "0 24px 64px rgb(0 0 0 / 0.55), 0 4px 12px rgb(0 0 0 / 0.4)", objectFit: "cover", userSelect: "none", ...card.style }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ))}

          {/* Bottom text */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "48px", zIndex: 10 }}>
            <h1 style={{ margin: "0 0 14px", fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.5px" }}>
              Turn your content{" "}
              <span style={{ background: "linear-gradient(90deg, rgb(74 125 255), rgb(140 100 255))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                into a
              </span>
              {" "}financial asset
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: 15, color: "rgb(110 115 128)", lineHeight: 1.6, maxWidth: 400 }}>
              Join thousands of creators earning more, growing faster, and building their brand with Zerra.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/login" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 9999, fontSize: 14, fontWeight: 600,
                background: "rgb(74 125 255)", color: "#fff", textDecoration: "none",
                boxShadow: "0 0 24px rgb(74 125 255 / 0.4)",
              }}>
                Start earning
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/login" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 9999, fontSize: 14, fontWeight: 500,
                background: "rgb(12 14 20 / 0.75)", border: "1px solid rgb(44 50 65)",
                color: "rgb(245 245 247)", textDecoration: "none",
                backdropFilter: "blur(8px)",
              }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT — stats + features */}
        <div style={{
          flex: "0 0 45%", position: "relative", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "120px 64px 80px",
          background: "rgb(8 9 14)", borderLeft: "1px solid rgb(18 20 28)", overflow: "hidden",
        }}>
          <div aria-hidden style={{
            position: "absolute", bottom: "-10%", left: "-10%", right: "-10%", height: "55%",
            background: "radial-gradient(ellipse 90% 80% at 40% 100%, rgb(40 70 180 / 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 64 }}>
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", color: "rgb(245 245 247)" }}>{value}</p>
                  <p style={{ margin: 0, fontSize: 12.5, color: "rgb(100 104 116)" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {FEATURES.map(({ icon, title, description }) => (
                <div key={title} style={{ display: "flex", gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "rgb(74 125 255 / 0.08)", border: "1px solid rgb(74 125 255 / 0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgb(74 125 255)",
                  }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 14.5, fontWeight: 600, color: "rgb(245 245 247)" }}>{title}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "rgb(100 104 116)", lineHeight: 1.6 }}>{description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: 52 }}>
              <Link to="/login" style={{
                display: "block", width: "100%", padding: "14px",
                background: "rgb(11 13 20)", border: "1px solid rgb(36 40 55)",
                borderRadius: 12, fontSize: 14, fontWeight: 600,
                color: "rgb(230 230 235)", textDecoration: "none",
                textAlign: "center",
                boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.04)",
              }}>
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{
        padding: "32px 48px",
        background: "rgb(4 5 9)",
        borderTop: "1px solid rgb(18 20 28)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <span style={{ fontSize: 12.5, color: "rgb(60 64 78)" }}>
          © {new Date().getFullYear()} Zerra. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          <Link to="/terms"   style={{ fontSize: 12.5, color: "rgb(100 104 116)", textDecoration: "none" }}>Terms of Service</Link>
          <Link to="/privacy" style={{ fontSize: 12.5, color: "rgb(100 104 116)", textDecoration: "none" }}>Privacy Policy</Link>
          <a href="mailto:support@zerra.pro" style={{ fontSize: 12.5, color: "rgb(100 104 116)", textDecoration: "none" }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}