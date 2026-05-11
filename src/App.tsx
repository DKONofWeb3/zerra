import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import DashboardPage from "./pages/Dashboard";
import PortfolioPage from "./pages/Portfolio";
import YapPage from "./pages/Yap";
import TopCreatorsPage from "./pages/Yap/TopCreators";
import TopPerformingPage from "./pages/Yap/TopPerforming";
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
        <Route path="/yap" element={<YapPage />} />
        <Route path="/yap/top-creators" element={<TopCreatorsPage />} />
        <Route path="/yap/top-performing" element={<TopPerformingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
