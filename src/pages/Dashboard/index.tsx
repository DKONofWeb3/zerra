import CreatorProfilePage from "@/pages/Creator";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function DashboardPage() {
  usePageTitle("Zerra · Dashboard");
  // No Overview/Analytics split any more — the dashboard IS the creator
  // profile, shown in full. The profile's own section tabs live inside it.
  return <CreatorProfilePage ownProfile />;
}
