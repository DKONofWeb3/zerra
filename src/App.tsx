import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/Landing";
import DashboardPage from "./pages/Dashboard";
import PortfolioPage from "./pages/Portfolio";
import TopCreatorsPage from "./pages/Influence/TopCreators";
import InfluencePage from "./pages/Influence";
import TopPerformingPage from "./pages/Influence/TopPerforming";
import ExplorePage from "./pages/Explore";
import MarketPage from "./pages/Market";
import WalletPage from "./pages/Wallet";
import SettingsPage from "./pages/Settings";
import NotFoundPage from "./pages/NotFound";
import LoginPage from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";
import { MobileLock } from "./components/MobileLock";
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <p className="text-fg-secondary text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}


export default function App() {
  return (
    <>
      <MobileLock />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/influence" element={<TopCreatorsPage />} />
          <Route path="/influence/top-creators" element={<InfluencePage />} />
          <Route path="/influence/top-performing" element={<TopPerformingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}