import { MyEarningsHeader } from "@/components/portfolio/MyEarningsHeader";
import { OverviewChart } from "@/components/portfolio/OverviewChart";
import { PaypalHeroCard } from "@/components/portfolio/PaypalHeroCard";
import { ThisMonthCard } from "@/components/portfolio/ThisMonthCard";
import { PaymentAccountCard } from "@/components/portfolio/PaymentAccountCard";
import { PortfolioProjectsTable } from "@/components/portfolio/PortfolioProjectsTable";
import { portfolioTopProjects } from "@/lib/mock-data";

/**
 * Portfolio page layout — 3-column grid.
 *
 *   ┌──────────────────────┬──────────────────────┬─────────────┐
 *   │ My Earnings header   │ My Earnings header   │             │
 *   │ ─────────────────────┼──────────────────────┤  This Month │
 *   │ Overview chart card  │ PayPal hero card     │   card      │
 *   ├──────────────────────┼──────────────────────┤             │
 *   │ Payment Account      │ My top projects      │             │
 *   │                      │   (table)            │             │
 *   └──────────────────────┴──────────────────────┴─────────────┘
 *
 * Column widths follow the Figma source: roughly 2 : 2 : 1.3.
 * This Month card sizes naturally to its content (no infinite stretch).
 * A spacer aligns its top with the top card edges in the other columns.
 */
export default function PortfolioPage() {
  return (
    <div className="pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_2fr_1.3fr] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <div>
            <MyEarningsHeader />
            <OverviewChart />
          </div>
          <PaymentAccountCard />
        </div>

        {/* MIDDLE COLUMN */}
        <div className="space-y-6">
          <div>
            <MyEarningsHeader />
            <PaypalHeroCard />
          </div>
          <PortfolioProjectsTable rows={portfolioTopProjects} />
        </div>

        {/* RIGHT COLUMN — sized to its own content, doesn't stretch to fill */}
        <div className="self-start">
          {/* Spacer to align with top of card content (matches header height) */}
          <div className="hidden xl:block h-[88px]" />
          <ThisMonthCard />
        </div>
      </div>
    </div>
  );
}
