import { cn } from "@/lib/cn";

interface PagePlaceholderProps {
  title: string;
  description?: string;
  className?: string;
}

/**
 * Used for sidebar pages we haven't built yet.
 * Replace with the real page when its design is ready.
 */
export function PagePlaceholder({
  title,
  description,
  className,
}: PagePlaceholderProps) {
  return (
    <div className={cn("max-w-3xl py-16", className)}>
      <h1 className="font-display text-display-lg font-medium tracking-tight">
        {title}
      </h1>
      <p className="mt-4 text-fg-secondary text-[15px] leading-relaxed">
        {description ??
          "This page is part of the design system and will be implemented in a later milestone."}
      </p>

      <div className="mt-12 card-base p-8">
        <div className="flex items-center gap-3 text-fg-tertiary text-[13px]">
          <span className="inline-block w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgb(var(--warning)/0.6)]" />
          Coming soon
        </div>
        <div className="mt-3 text-fg-secondary text-[14px]">
          The layout shell, navigation, and design tokens are wired up. Real
          content will be added once the page design is finalized.
        </div>
      </div>
    </div>
  );
}
