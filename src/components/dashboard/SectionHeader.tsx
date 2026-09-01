import { DiamondIcon } from "@/components/icons/DiamondIcon";

interface SectionHeaderProps {
  label?: string; // omit to render just the title, no diamond+label row above it
  title: string; // e.g. "Influence Section"
}

/**
 * The Influence Section / Project Overview header pair:
 * a diamond icon + small label, with a big heading underneath.
 */
export function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      {label && (
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">{label}</span>
        </div>
      )}
      <h3 className="mt-2 font-display font-medium text-[26px] tracking-[-0.015em] text-fg-primary">
        {title}
      </h3>
    </div>
  );
}
