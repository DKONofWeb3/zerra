import { MyEarningsHeader } from "@/components/portfolio/MyEarningsHeader";
import { OverviewChart } from "@/components/portfolio/OverviewChart";
import { PaypalHeroCard } from "@/components/portfolio/PaypalHeroCard";
import { ThisMonthCard } from "@/components/portfolio/ThisMonthCard";
import { PaymentAccountCard } from "@/components/portfolio/PaymentAccountCard";
import { PortfolioProjectsTable } from "@/components/portfolio/PortfolioProjectsTable";
import { portfolioTopProjects } from "@/lib/mock-data";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function PortfolioPage() {
  usePageTitle("Zerra · Portfolio");

  return (
    <div className="pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_2fr_1.3fr] gap-6">
        <div className="space-y-6">
          <div>
            <MyEarningsHeader />
            <OverviewChart />
          </div>
          <PaymentAccountCard />
        </div>

        <div className="space-y-6">
          <div>
            <MyEarningsHeader />
            <PaypalHeroCard />
          </div>
          <PortfolioProjectsTable rows={portfolioTopProjects} />
        </div>

        <div className="self-start">
          <div className="hidden xl:block h-[88px]" />
          <ThisMonthCard />
        </div>
      </div>
    </div>
  );
}