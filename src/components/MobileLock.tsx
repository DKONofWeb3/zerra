import { useEffect, useState } from "react";

/**
 * MobileLock — shown only on screens < 768px.
 * Blocks the app with a slanted card matching Zerra's design language:
 * --bg-card surfaces, brand blue (#4a7dff), glass utilities, Satoshi font.
 */
export function MobileLock() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(6 8 14 / 0.80)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Atmospheric base glow — mirrors AppLayout */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 600px 500px at 20% 20%, rgb(74 125 255 / 0.18), transparent 60%), radial-gradient(ellipse 800px 600px at 15% 10%, rgb(100 145 255 / 0.08), transparent 65%)",
        }}
      />

      {/* Diagonal light ray — mirrors AppLayout .atmosphere-glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 40,
          left: 30,
          width: 80,
          height: 700,
          borderRadius: 9999,
          background: "#ffffff",
          transform: "rotate(-55deg)",
          transformOrigin: "top center",
          opacity: 0.55,
          filter: "blur(70px)",
          mixBlendMode: "plus-lighter",
          pointerEvents: "none",
        }}
      />

      {/* The card — rotated, card-base glass surface */}
      <div
        style={{
          position: "relative",
          width: 284,
          transform: "rotate(-4deg)",
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.025) 0%, rgb(255 255 255 / 0) 50%), rgb(8 10 16)",
          border: "1px solid rgb(28 32 44)",
          borderRadius: "1.25rem",
          overflow: "hidden",
          boxShadow:
            "inset 0 1px 0 0 rgb(255 255 255 / 0.08), 0 32px 80px -8px rgb(0 0 0 / 0.75), 0 0 0 1px rgb(0 0 0 / 0.4)",
          padding: "36px 28px 30px",
          textAlign: "center",
        }}
      >
        {/* Brand accent strip on left edge — .card-accent pattern */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 28,
            bottom: 28,
            width: 3,
            background: "rgb(74 125 255)",
            borderRadius: "0 4px 4px 0",
            boxShadow: "0 0 12px rgb(100 145 255 / 0.6)",
          }}
        />

        {/* Top inner highlight rim */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.14), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Top inner sheen */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: "30%",
            background:
              "linear-gradient(180deg, rgb(255 255 255 / 0.025) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Wordmark */}
        <p
          style={{
            position: "absolute",
            top: 16,
            right: 20,
            margin: 0,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "rgb(74 125 255)",
            opacity: 0.5,
          }}
        >
          ZERRA
        </p>

        {/* Lock icon — inline SVG, brand blue tint */}
        <div
          style={{
            width: 52,
            height: 52,
            background: "rgb(74 125 255 / 0.08)",
            border: "1px solid rgb(74 125 255 / 0.18)",
            borderRadius: 15,
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(100 145 255)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Title */}
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 17,
            fontWeight: 600,
            color: "rgb(245 245 247)",
            letterSpacing: "-0.25px",
          }}
        >
          Desktop only
        </p>

        {/* Body */}
        <p
          style={{
            margin: "0 0 22px",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "rgb(110 115 128)",
          }}
        >
          Zerra isn&apos;t optimised for mobile yet. Open it on a desktop or
          laptop for the full experience.
        </p>

        {/* Status pill — pill-surface pattern */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgb(8 10 16)",
            border: "1px solid rgb(28 32 44)",
            borderRadius: 9999,
            padding: "5px 14px",
            fontSize: 11.5,
            color: "rgb(158 162 175)",
            fontWeight: 500,
            letterSpacing: "0.2px",
          }}
        >
          {/* Brand dot */}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgb(74 125 255)",
              boxShadow: "0 0 6px rgb(100 145 255 / 0.7)",
              flexShrink: 0,
            }}
          />
          Mobile coming soon
        </span>
      </div>
    </div>
  );
}
