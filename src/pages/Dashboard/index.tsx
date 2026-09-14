import { useSearchParams } from "react-router-dom";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import CreatorProfilePage from "@/pages/Creator";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function DashboardPage() {
  usePageTitle("Zerra · Overview");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "analytics" ? "analytics" : "overview";

  return (
    <div>
      {tab === "overview" ? <CreatorProfilePage ownProfile /> : <AnalyticsOverview />}
    </div>
  );
}
