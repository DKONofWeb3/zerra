import { cn } from "@/lib/cn";
import { TokenIcon } from "./TokenIcon";
import type { ActivityItem } from "@/lib/types";

interface UserActivityMarqueeProps {
  items: ActivityItem[];
  className?: string;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  if (item.kind === "user") {
    return (
      <div className="flex items-center gap-3 shrink-0 pr-14">
        <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 bg-bg-elevated shrink-0">
          <img
            src={item.avatarUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="leading-tight">
          <div className="text-[13.5px] font-medium text-fg-primary">
            {item.name}
          </div>
          <div className="text-[11.5px] text-fg-tertiary mt-0.5">
            {item.postsThisWeek} posts this week
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 shrink-0 pr-14">
      <TokenIcon name={item.projectName} size={36} />
      <div className="leading-tight">
        <div className="text-[13.5px] font-medium text-fg-primary">
          {item.projectName}
        </div>
        <div className="text-[11.5px] text-fg-tertiary mt-0.5 tabular-nums">
          ${item.bountyUsdc.toLocaleString("en-US")} USDC Yap bounty
        </div>
      </div>
    </div>
  );
}

export function UserActivityMarquee({
  items,
  className,
}: UserActivityMarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden marquee-mask",
        // bordered strip — top + bottom hairline only
        "border-y border-white/[0.05]",
        className
      )}
    >
      <div className="marquee-track flex animate-marquee whitespace-nowrap py-3.5">
        {doubled.map((item, i) => (
          <ActivityRow key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
