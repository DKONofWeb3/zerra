import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import DashboardPage from "./pages/Dashboard";
import PortfolioPage from "./pages/Portfolio";
import InfluencePage from "./pages/Influence";
import TopCreatorsPage from "./pages/Influence/TopCreators";
import TopPerformingPage from "./pages/Influence/TopPerforming";
import ExplorePage from "./pages/Explore";
import MarketPage from "./pages/Market";
import WalletPage from "./pages/Wallet";
import SettingsPage from "./pages/Settings";
import NotFoundPage from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/influence" element={<InfluencePage />} />
        <Route path="/influence/top-creators" element={<TopCreatorsPage />} />
        <Route path="/influence/top-performing" element={<TopPerformingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
