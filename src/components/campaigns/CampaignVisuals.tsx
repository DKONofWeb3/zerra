import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * ValidatedImage
 * -------------------------------------------------
 * Drop-in replacement for a plain <img> anywhere a campaign asset
 * (cover image, token icon, project logo) is rendered. Renders
 * `fallback` instead of a broken-image icon if:
 *   - src is missing/empty, or
 *   - the image fails to load (404, CORS block, bad URL, etc.)
 */
export function ValidatedImage({
  src,
  alt = "",
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  // Reset failed-state if a new src comes in (e.g. admin edits the URL)
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * useImageCheck
 * -------------------------------------------------
 * For form inputs where a human pastes a URL and needs to know
 * *immediately* whether it actually resolves to an image, before
 * it ever reaches a campaign card in production.
 */
export function useImageCheck(url: string) {
  const [state, setState] = useState<"idle" | "checking" | "ok" | "error">("idle");

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setState("idle");
      return;
    }
    let cancelled = false;
    setState("checking");
    const img = new Image();
    img.onload = () => { if (!cancelled) setState("ok"); };
    img.onerror = () => { if (!cancelled) setState("error"); };
    img.src = trimmed;
    return () => { cancelled = true; };
  }, [url]);

  return state;
}

/**
 * useDominantAccent
 * -------------------------------------------------
 * Samples the average color out of a project's logo/icon to build
 * a light->deep gradient pair unique to that project — this is what
 * drives the "mixed colors based on the project" card background.
 * Falls back to a deterministic hash-based hue (from the project name)
 * if there's no image, the image fails, or the canvas gets CORS-tainted.
 */
export function useDominantAccent(imageUrl: string | null | undefined, seed: string) {
  const [accent, setAccent] = useState<{ light: string; deep: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hashFallback = () => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      return {
        light: `hsl(${hue} 85% 90%)`,
        deep: `hsl(${hue} 50% 15%)`,
      };
    };

    if (!imageUrl) {
      setAccent(hashFallback());
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 20) continue; // skip transparent pixels
          r += data[i]; g += data[i + 1]; b += data[i + 2];
          n++;
        }
        if (n === 0) throw new Error("image is fully transparent");
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);

        setAccent({
          light: `rgba(${r}, ${g}, ${b}, 0.22)`,
          deep: `rgb(${Math.round(r * 0.22)}, ${Math.round(g * 0.22)}, ${Math.round(b * 0.22)})`,
        });
      } catch {
        // Canvas tainted by CORS or unreadable image — fall back safely
        if (!cancelled) setAccent(hashFallback());
      }
    };
    img.onerror = () => { if (!cancelled) setAccent(hashFallback()); };
    img.src = imageUrl;

    return () => { cancelled = true; };
  }, [imageUrl, seed]);

  // Neutral placeholder while sampling happens
  return accent ?? { light: "rgba(255,255,255,0.06)", deep: "rgb(10,12,20)" };
}