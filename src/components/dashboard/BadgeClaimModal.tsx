import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { BadgeGlyph } from "@/components/icons/BadgeIcon";
import type { BadgeState } from "@/lib/types";

interface BadgeClaimModalProps {
  badge: BadgeState | null;
  onClose: () => void;
}

const THEME_BG: Record<BadgeState["theme"], string> = {
  // Warm ember radial, matches IMG_6523 "Congratulation" panel
  ember:
    "radial-gradient(ellipse 900px 700px at 50% 28%, rgb(232 80 64 / 0.55), transparent 62%), " +
    "linear-gradient(180deg, rgb(10 6 8) 0%, rgb(58 16 14) 55%, rgb(94 24 20) 100%)",
  // Cool violet radial, matches IMG_6522 "You're Now an Influencer" panel
  violet:
    "radial-gradient(ellipse 900px 700px at 50% 26%, rgb(110 124 255 / 0.55), transparent 62%), " +
    "linear-gradient(180deg, rgb(7 8 14) 0%, rgb(28 24 70) 55%, rgb(45 38 130) 100%)",
};

const THEME_GLOW: Record<BadgeState["theme"], string> = {
  ember: "rgb(232 80 64 / 0.45)",
  violet: "rgb(110 124 255 / 0.5)",
};

/**
 * Full-screen reward reveal shown right after a user taps "Claim Badge".
 * Visual reference: IMG_6523 (ember/Congratulation) and IMG_6522
 * (violet/You're Now an Influencer). Renders via portal so it sits above
 * the app shell regardless of where it's mounted.
 */
export function BadgeClaimModal({ badge, onClose }: BadgeClaimModalProps) {
  useEffect(() => {
    if (!badge) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [badge, onClose]);

  const handleShare = async () => {
    const text = badge ? `I just unlocked the "${badge.name}" badge on Zerra 🎉` : "Check out Zerra";
    const shareUrl = "https://zerra.pro";
    const tiktokShare = `https://www.tiktok.com/upload?lang=en&caption=${encodeURIComponent(`${text} ${shareUrl}`)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Zerra", text, url: shareUrl });
        return;
      } catch {
        /* user cancelled — fall through to TikTok link */
      }
    }
    window.open(tiktokShare, "_blank", "noopener,noreferrer");
  };

  return createPortal(
    <AnimatePresence>
      {badge && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={badge.claimHeadline}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgb(4 5 9 / 0.78)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/[0.08]",
              "flex flex-col items-center text-center"
            )}
            style={{
              background: THEME_BG[badge.theme],
              boxShadow: "0 40px 120px -20px rgb(0 0 0 / 0.6)",
              padding: "clamp(28px, 5vw, 56px) clamp(20px, 6vw, 56px) clamp(28px, 4vw, 44px)",
              minHeight: "min(560px, 86vh)",
            }}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top inner rim highlight, consistent with .card-base sheen elsewhere */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.16), transparent)" }} />

            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
              {/* Badge glyph, glowing, floating */}
              <motion.div
                className="relative flex items-center justify-center mb-7 md:mb-9"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  aria-hidden
                  className="absolute rounded-full"
                  style={{
                    width: "clamp(180px, 30vw, 260px)",
                    height: "clamp(180px, 30vw, 260px)",
                    background: `radial-gradient(circle, ${THEME_GLOW[badge.theme]}, transparent 70%)`,
                    filter: "blur(4px)",
                  }}
                />
                <BadgeGlyph theme={badge.theme} size={148} glow={false} />
              </motion.div>

              <motion.h2
                className="font-display font-medium tracking-[-0.02em] text-[32px] md:text-[44px] leading-[1.05] text-white max-w-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
              >
                {badge.claimHeadline}
              </motion.h2>

              <motion.p
                className="mt-3 text-[14px] md:text-[15px] text-white/55 max-w-md leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {badge.claimSubtext}
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-3 mt-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
            >
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-[13.5px] font-semibold text-white/90 border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "rgb(74 125 255)" }}
              >
                <Share2 className="w-4 h-4" />
                Share to TikTok
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
