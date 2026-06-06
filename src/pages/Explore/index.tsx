import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSearchParams } from "react-router-dom";

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card border border-white/[0.06]",
        "min-h-[400px] flex flex-col items-center justify-center gap-4"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
      />
      <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="text-center px-8">
        <p className="text-[15px] font-medium text-fg-primary mb-1">{title}</p>
        <p className="text-[13px] text-fg-tertiary leading-relaxed max-w-sm">{description}</p>
      </div>
      <div className="px-4 py-2 rounded-full border border-white/[0.06] bg-bg-elevated text-[12px] text-fg-tertiary">
        Coming soon
      </div>
    </div>
  );
}

export default function ExplorePage() {
  usePageTitle("Zerra · Explore");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "past" ? "past" : "active";

  return (
    <div className="space-y-8 pb-12">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">
            {tab === "active" ? "Live now" : "Ended campaigns"}
          </span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          {tab === "active" ? "Active Campaigns" : "Past Campaigns"}
        </h2>
      </div>

      {tab === "active" ? (
        <EmptyState
          title="No active campaigns"
          description="Active influence campaigns from crypto projects will appear here once they go live."
        />
      ) : (
        <EmptyState
          title="No past campaigns yet"
          description="Ended campaigns will appear here so you can review your past participation."
        />
      )}
    </div>
  );
}