import { NICHES } from "@/lib/niches";

interface NicheSelectProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Niche picker for Settings. Accounts saved before this was a dropdown may hold
 * free text ("Tech", "Web3 memes"). A saved value that isn't in the list is kept
 * as its own "(custom)" option rather than silently swapped for the first choice;
 * picking a listed niche replaces it. (Values that only differ by case are
 * normalised by the caller with canonicalNiche() when the profile loads.)
 */
export function NicheSelect({ value, onChange }: NicheSelectProps) {
  const isCustom = value.trim() !== "" && !(NICHES as readonly string[]).includes(value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      // Opaque background + dark color-scheme so the native option list is readable on the dark theme
      style={{ colorScheme: "dark" }}
      className="w-full px-4 py-3 rounded-xl border border-white/[0.06] bg-bg-elevated text-[14px] text-fg-primary focus:outline-none focus:border-white/[0.15] transition-colors"
    >
      <option value="">Select a niche</option>
      {isCustom && <option value={value}>{value} (custom)</option>}
      {NICHES.map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}
