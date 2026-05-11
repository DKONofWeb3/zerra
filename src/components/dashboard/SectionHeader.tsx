import { DiamondIcon } from "@/components/icons/DiamondIcon";

interface SectionHeaderProps {
  label: string; // e.g. "Live Update"
  title: string; // e.g. "Yap Section"
}

/**
 * The Yap Section / Project Overview header pair:
 * a diamond icon + small label, with a big heading underneath.
 */
export function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5 text-fg-tertiary">
        <DiamondIcon size={14} />
        <span className="text-[12.5px]">{label}</span>
      </div>
      <h3 className="mt-2 font-display font-medium text-[26px] tracking-[-0.015em] text-fg-primary">
        {title}
      </h3>
    </div>
  );
}
