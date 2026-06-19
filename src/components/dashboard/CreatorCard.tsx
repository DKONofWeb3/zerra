import { useRef, useState } from "react";
import { Share2, Download, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface CreatorCardProps {
  name: string;
  username?: string | null;
  avatar?: string | null;
  totalScore?: number;
  campaignsJoined?: number;
  globalRank?: number | null;
}

// The visual card itself — used both for the dashboard hero size and the
// compact shareable export. Size is controlled entirely by the parent's width.
function CardFace({
  name, username, avatar, totalScore, campaignsJoined, globalRank, profileUrl,
}: CreatorCardProps & { profileUrl: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl w-full"
      style={{
        aspectRatio: "2.1/1",
        background: "linear-gradient(155deg, #060a14 0%, #0a1020 45%, #050810 100%)",
        boxShadow: "0 0 0 1px rgb(80 110 190 / 0.18)",
      }}
    >
      {/* Abstract topographic pattern */}
      <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 680 324" preserveAspectRatio="none">
        <defs>
          <radialGradient id="zc-glowA" cx="80%" cy="10%" r="65%">
            <stop offset="0%" stopColor="#2a4a8a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="zc-glowB" cx="10%" cy="90%" r="55%">
            <stop offset="0%" stopColor="#1a3060" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="zc-strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6a8fd0" stopOpacity="0" />
            <stop offset="50%" stopColor="#7a9fe0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6a8fd0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="680" height="324" fill="url(#zc-glowA)" />
        <rect width="680" height="324" fill="url(#zc-glowB)" />
        <g opacity="0.6">
          <circle cx="540" cy="60" r="120" fill="none" stroke="#4a6aa8" strokeWidth="0.6" opacity="0.4" />
          <circle cx="540" cy="60" r="170" fill="none" stroke="#4a6aa8" strokeWidth="0.5" opacity="0.25" />
          <circle cx="540" cy="60" r="220" fill="none" stroke="#4a6aa8" strokeWidth="0.4" opacity="0.15" />
        </g>
        <path d="M 0 280 C 120 230, 200 310, 340 250 S 560 180, 680 220" stroke="url(#zc-strokeGrad)" strokeWidth="1.2" fill="none" />
        <path d="M 0 310 C 150 270, 260 330, 400 280 S 600 230, 680 260" stroke="url(#zc-strokeGrad)" strokeWidth="0.8" fill="none" opacity="0.7" />
        <path d="M 0 100 C 100 60, 180 130, 300 90" stroke="#4a6aa8" strokeWidth="0.6" fill="none" opacity="0.3" />
        <g fill="#6a8fd0">
          <circle cx="100" cy="50" r="1.4" opacity="0.7" />
          <circle cx="180" cy="35" r="1" opacity="0.5" />
          <circle cx="450" cy="40" r="1.2" opacity="0.6" />
          <circle cx="600" cy="90" r="1.4" opacity="0.6" />
          <circle cx="80" cy="270" r="1" opacity="0.4" />
          <circle cx="620" cy="260" r="1.2" opacity="0.5" />
        </g>
      </svg>

      {/* Diagonal sheen */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(115deg, transparent 38%, rgb(100 130 210 / 0.05) 50%, rgb(140 165 235 / 0.09) 52%, rgb(100 130 210 / 0.05) 54%, transparent 64%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-stretch justify-between p-[5%]">
        {/* Top row */}
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-[2.5%]">
            <div
              className="rounded-[18%] overflow-hidden shrink-0 flex items-center justify-center"
              style={{
                width: "11.5%", height: "11.5%", minWidth: 40, minHeight: 40,
                background: "linear-gradient(135deg, #1e2e4e, #0e1830)",
                border: "1px solid rgb(130 160 230 / 0.3)",
              }}
            >
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontSize: "clamp(14px, 4vw, 30px)", fontWeight: 600, color: "rgb(170 190 235)", fontFamily: "Georgia, serif" }}>
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p style={{ fontSize: "clamp(13px, 3.6vw, 25px)", fontWeight: 600, color: "rgb(232 238 252)", margin: 0, fontFamily: "Georgia, serif" }}>
                {name}
              </p>
              {username && (
                <p style={{ fontSize: "clamp(8px, 2vw, 13.5px)", color: "rgb(120 135 170)", margin: "2px 0 0", fontFamily: "sans-serif" }}>
                  @{username}
                </p>
              )}
            </div>
          </div>
          <div
            className="shrink-0"
            style={{
              padding: "clamp(2px,0.8%,5px) clamp(6px,1.8%,12px)", borderRadius: 7,
              border: "1px solid rgb(110 140 210 / 0.3)",
              fontSize: "clamp(7px, 1.6vw, 11px)", fontWeight: 600, letterSpacing: "1px",
              color: "rgb(140 160 210)", fontFamily: "sans-serif", textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Verified Creator
          </div>
        </div>

        {/* Middle-left — QR code, under the name, above the score/campaigns row */}
        <div className="flex flex-col items-start w-full" style={{ gap: 4 }}>
          <div
            className="bg-white rounded-[14%] flex items-center justify-center"
            style={{ width: "11%", height: "11%", minWidth: 42, minHeight: 42, padding: "8%" }}
          >
            <QRCodeSVG value={profileUrl} size={256} style={{ width: "100%", height: "100%" }} fgColor="#000000" bgColor="#ffffff" />
          </div>
          <span style={{ fontSize: "clamp(6px, 1.3vw, 9px)", color: "rgb(95 108 140)", fontFamily: "sans-serif", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Scan to view profile
          </span>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between w-full">
          <div className="flex" style={{ gap: "6%" }}>
            <div>
              <p style={{ fontSize: "clamp(13px, 5vw, 34px)", fontWeight: 600, color: "rgb(232 238 252)", margin: 0, fontFamily: "Georgia, serif" }}>
                {(totalScore ?? 0).toLocaleString()}
              </p>
              <p style={{ fontSize: "clamp(6px, 1.7vw, 12px)", color: "rgb(105 118 150)", margin: "3px 0 0", fontFamily: "sans-serif", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                Total Score
              </p>
            </div>
            <div>
              <p style={{ fontSize: "clamp(13px, 5vw, 34px)", fontWeight: 600, color: "rgb(232 238 252)", margin: 0, fontFamily: "Georgia, serif" }}>
                {String(campaignsJoined ?? 0).padStart(2, "0")}
              </p>
              <p style={{ fontSize: "clamp(6px, 1.7vw, 12px)", color: "rgb(105 118 150)", margin: "3px 0 0", fontFamily: "sans-serif", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                Campaigns
              </p>
            </div>
            {globalRank != null && (
              <div>
                <p style={{ fontSize: "clamp(13px, 5vw, 34px)", fontWeight: 600, color: "rgb(232 238 252)", margin: 0, fontFamily: "Georgia, serif" }}>
                  #{globalRank}
                </p>
                <p style={{ fontSize: "clamp(6px, 1.7vw, 12px)", color: "rgb(105 118 150)", margin: "3px 0 0", fontFamily: "sans-serif", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                  Global Rank
                </p>
              </div>
            )}
          </div>
          <span style={{ fontSize: "clamp(11px, 3.2vw, 22px)", fontWeight: 700, letterSpacing: "1.2px", color: "rgb(190 205 240)", fontFamily: "Georgia, serif" }}>
            Zerra
          </span>
        </div>
      </div>
    </div>
  );
}

export function CreatorCard(props: CreatorCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied,  setCopied]  = useState(false);
  const [sharing, setSharing] = useState(false);

  const profileUrl = `https://zerra.pro/${props.username ?? "creator"}`;

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 3 });
    return new Promise((resolve) => canvas.toBlob((b: Blob | null) => resolve(b), "image/png"));
  };

  const handleDownload = async () => {
    setSharing(true);
    try {
      const blob = await generateImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zerra-creator-card-${props.username ?? "card"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setSharing(false);
    }
  };

  const handleNativeShare = async () => {
    setSharing(true);
    try {
      const blob = await generateImage();
      if (!blob) return;
      const file = new File([blob], "zerra-creator-card.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Zerra Creator Card", text: "Check out my creator profile on Zerra" });
      } else {
        await handleDownload();
      }
    } catch {
      // user cancelled — not an error
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Hidden compact version used purely for export — fixed width so the
          exported image is always consistent regardless of dashboard layout */}
      <div ref={cardRef} style={{ position: "absolute", left: -9999, top: 0, width: 760 }}>
        <CardFace {...props} profileUrl={profileUrl} />
      </div>

      {/* Visible hero card — scales to parent container width */}
      <CardFace {...props} profileUrl={profileUrl} />

      <div className="flex items-center gap-2 mt-4">
        <button onClick={handleNativeShare} disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ background: "rgb(74 125 255)" }}>
          <Share2 className="w-4 h-4" />
          {sharing ? "Preparing..." : "Share Card"}
        </button>
        <button onClick={handleDownload} disabled={sharing}
          className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors disabled:opacity-50"
          title="Download as image">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={handleCopyLink}
          className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors"
          title="Copy profile link">
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}