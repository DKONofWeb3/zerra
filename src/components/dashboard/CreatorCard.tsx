import { useRef, useState, useEffect } from "react";
import { Share2, Download, Copy, Check } from "lucide-react";
import QRCode from "qrcode";

interface CreatorCardProps {
  name: string;
  username?: string | null;
  avatar?: string | null;
  totalScore?: number;
  campaignsJoined?: number;
  globalRank?: number | null;
}

// Fixed internal coordinate system — the whole card is one SVG with a
// 680x324 viewBox. The SVG scales to whatever width the parent gives it
// via width="100%", so layout never breaks regardless of container size.
// This avoids the fragile %/clamp() mixing that caused the broken render.
const VB_W = 680;
const VB_H = 324;

function CardSVG({
  name, username, avatar, totalScore = 0, campaignsJoined = 0, globalRank, qrDataUrl,
}: CreatorCardProps & { qrDataUrl: string | null }) {
  const initials = name.charAt(0).toUpperCase();

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", borderRadius: 24, overflow: "hidden", boxShadow: "0 0 0 1px rgb(80 110 190 / 0.18)" }}
    >
      <defs>
        <linearGradient id="zc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#060a14" />
          <stop offset="45%" stopColor="#0a1020" />
          <stop offset="100%" stopColor="#050810" />
        </linearGradient>
        <radialGradient id="zc-glowA" cx="80%" cy="10%" r="65%">
          <stop offset="0%" stopColor="#2a4a8a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="zc-glowB" cx="10%" cy="90%" r="55%">
          <stop offset="0%" stopColor="#1a3060" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="zc-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6a8fd0" stopOpacity="0" />
          <stop offset="50%" stopColor="#7a9fe0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6a8fd0" stopOpacity="0" />
        </linearGradient>
        <clipPath id="zc-rounded">
          <rect width={VB_W} height={VB_H} rx="24" />
        </clipPath>
        <clipPath id="zc-avatar-clip">
          <rect x="44" y="36" width="76" height="76" rx="18" />
        </clipPath>
      </defs>

      <g clipPath="url(#zc-rounded)">
        {/* Background */}
        <rect width={VB_W} height={VB_H} fill="url(#zc-bg)" />
        <rect width={VB_W} height={VB_H} fill="url(#zc-glowA)" />
        <rect width={VB_W} height={VB_H} fill="url(#zc-glowB)" />

        {/* Abstract pattern */}
        <g opacity="0.6">
          <circle cx="540" cy="60" r="120" fill="none" stroke="#4a6aa8" strokeWidth="0.6" opacity="0.4" />
          <circle cx="540" cy="60" r="170" fill="none" stroke="#4a6aa8" strokeWidth="0.5" opacity="0.25" />
          <circle cx="540" cy="60" r="220" fill="none" stroke="#4a6aa8" strokeWidth="0.4" opacity="0.15" />
        </g>
        <path d="M 0 280 C 120 230, 200 310, 340 250 S 560 180, 680 220" stroke="url(#zc-stroke)" strokeWidth="1.2" fill="none" />
        <path d="M 0 310 C 150 270, 260 330, 400 280 S 600 230, 680 260" stroke="url(#zc-stroke)" strokeWidth="0.8" fill="none" opacity="0.7" />
        <path d="M 0 100 C 100 60, 180 130, 300 90" stroke="#4a6aa8" strokeWidth="0.6" fill="none" opacity="0.3" />
        <g fill="#6a8fd0">
          <circle cx="100" cy="50" r="1.4" opacity="0.7" />
          <circle cx="180" cy="35" r="1" opacity="0.5" />
          <circle cx="450" cy="40" r="1.2" opacity="0.6" />
          <circle cx="600" cy="90" r="1.4" opacity="0.6" />
          <circle cx="80" cy="270" r="1" opacity="0.4" />
          <circle cx="620" cy="260" r="1.2" opacity="0.5" />
        </g>

        {/* Diagonal sheen */}
        <polygon points="240,0 320,0 440,324 360,324" fill="rgb(140,165,235)" opacity="0.06" />

        {/* ── Top row: avatar + name + verified badge ── */}
        {avatar ? (
          <image href={avatar} x="44" y="36" width="76" height="76" clipPath="url(#zc-avatar-clip)" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <>
            <rect x="44" y="36" width="76" height="76" rx="18" fill="#1e2e4e" stroke="rgba(130,160,230,0.3)" />
            <text x="82" y="86" fontSize="30" fontWeight="600" fill="rgb(170,190,235)" fontFamily="Georgia, serif" textAnchor="middle">
              {initials}
            </text>
          </>
        )}

        <text x="136" y="68" fontSize="25" fontWeight="600" fill="rgb(232,238,252)" fontFamily="Georgia, serif">
          {name}
        </text>
        {username && (
          <text x="136" y="92" fontSize="13.5" fill="rgb(120,135,170)" fontFamily="sans-serif">
            @{username}
          </text>
        )}

        <rect x="540" y="36" width="96" height="26" rx="7" fill="none" stroke="rgba(110,140,210,0.3)" />
        <text x="588" y="53" fontSize="9.5" fontWeight="600" fill="rgb(140,160,210)" fontFamily="sans-serif" letterSpacing="0.8" textAnchor="middle">
          VERIFIED
        </text>

        {/* ── Middle-left: QR code ── */}
        {qrDataUrl && (
          <>
            <rect x="44" y="140" width="76" height="76" rx="11" fill="white" />
            <image href={qrDataUrl} x="50" y="146" width="64" height="64" />
            <text x="44" y="234" fontSize="9" fill="rgb(95,108,140)" fontFamily="sans-serif" letterSpacing="0.5" style={{ textTransform: "uppercase" }}>
              SCAN TO VIEW PROFILE
            </text>
          </>
        )}

        {/* ── Bottom row: stats + Zerra wordmark ── */}
        <text x="44" y="290" fontSize="32" fontWeight="600" fill="rgb(232,238,252)" fontFamily="Georgia, serif">
          {totalScore.toLocaleString()}
        </text>
        <text x="44" y="308" fontSize="11" fill="rgb(105,118,150)" fontFamily="sans-serif" letterSpacing="0.6" style={{ textTransform: "uppercase" }}>
          TOTAL SCORE
        </text>

        <text x="220" y="290" fontSize="32" fontWeight="600" fill="rgb(232,238,252)" fontFamily="Georgia, serif">
          {String(campaignsJoined).padStart(2, "0")}
        </text>
        <text x="220" y="308" fontSize="11" fill="rgb(105,118,150)" fontFamily="sans-serif" letterSpacing="0.6" style={{ textTransform: "uppercase" }}>
          CAMPAIGNS
        </text>

        {globalRank != null && (
          <>
            <text x="370" y="290" fontSize="32" fontWeight="600" fill="rgb(232,238,252)" fontFamily="Georgia, serif">
              #{globalRank}
            </text>
            <text x="370" y="308" fontSize="11" fill="rgb(105,118,150)" fontFamily="sans-serif" letterSpacing="0.6" style={{ textTransform: "uppercase" }}>
              GLOBAL RANK
            </text>
          </>
        )}

        <text x="636" y="296" fontSize="22" fontWeight="700" fill="rgb(190,205,240)" fontFamily="Georgia, serif" letterSpacing="1.2" textAnchor="end">
          Zerra
        </text>
      </g>
    </svg>
  );
}

export function CreatorCard(props: CreatorCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [copied,    setCopied]    = useState(false);
  const [sharing,   setSharing]   = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const profileUrl = `https://zerra.pro/${props.username ?? "creator"}`;

  useEffect(() => {
    QRCode.toDataURL(profileUrl, { margin: 0, width: 256, color: { dark: "#000000", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [profileUrl]);

  // Export the SVG directly to a PNG via an offscreen canvas — no html2canvas
  // dependency needed since the entire card IS an SVG already.
  const generatePng = async (): Promise<Blob | null> => {
    if (!wrapperRef.current) return null;
    const svgEl = wrapperRef.current.querySelector("svg");
    if (!svgEl) return null;

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = 3; // high-res export
        const canvas = document.createElement("canvas");
        canvas.width = VB_W * scale;
        canvas.height = VB_H * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, VB_W, VB_H);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob: Blob | null) => resolve(blob), "image/png");
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  };

  const handleDownload = async () => {
    setSharing(true);
    try {
      const blob = await generatePng();
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
      const blob = await generatePng();
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
      <div ref={wrapperRef} className="w-full" style={{ aspectRatio: `${VB_W}/${VB_H}` }}>
        <CardSVG {...props} qrDataUrl={qrDataUrl} />
      </div>

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