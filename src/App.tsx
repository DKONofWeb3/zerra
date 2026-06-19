import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { useAuth } from "./contexts/AuthContext";
import { supabase } from "./lib/api/supabase";
import LandingPage from "./pages/Landing";
import DashboardPage from "./pages/Dashboard";
import PortfolioPage from "./pages/Portfolio";
import TopCreatorsPage from "./pages/Influence/TopCreators";
import InfluencePage from "./pages/Influence";
import TopPerformingPage from "./pages/Influence/TopPerforming";
import ExplorePage from "./pages/Explore";
import CampaignLeaderboardPage from "./pages/Explore/Leaderboard";
import MarketPage from "./pages/Market";
import WalletPage from "./pages/Wallet";
import SettingsPage from "./pages/Settings";
import NotFoundPage from "./pages/NotFound";
import LoginPage from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";
import AdminOverviewPage from "./pages/Admin/index";
import AdminCampaignsPage from "./pages/Admin/Campaigns/index";
import AdminCampaignNewPage from "./pages/Admin/Campaigns/New";
import AdminUsersPage from "./pages/Admin/Users/index";
import AdminTrendingPage from "./pages/Admin/Trending/index";
import AdminMetricsPage from "./pages/Admin/Metrics/index";
import AdminAuditLogPage from "./pages/Admin/AuditLog/index";
import { ProjectLayout } from "./components/project/ProjectLayout";
import ProjectOverviewPage from "./pages/Project/index";
import ProjectLeaderboardPage from "./pages/Project/Leaderboard/index";
import ProjectVideosPage from "./pages/Project/Videos/index";
import ProjectParticipantsPage from "./pages/Project/Participants/index";

function AuthHashRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token") && location.pathname !== "/auth/callback") {
      navigate("/auth/callback" + hash, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <p className="text-fg-secondary text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [roleState, setRoleState] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    if (loading) return;
    if (!session) { setRoleState("denied"); return; }

    const checkRole = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setRoleState(data?.role === "admin" ? "admin" : "denied");
      } catch {
        setRoleState("denied");
      }
    };
    checkRole();
  }, [session, loading]);

  if (loading || roleState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <p className="text-fg-secondary text-sm">Checking access...</p>
      </div>
    );
  }

  if (roleState === "denied") {
    return <Navigate to={session ? "/dashboard" : "/login"} replace />;
  }

  return <>{children}</>;
}

// Project route guard — role = 'project' or 'admin'
function ProjectRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [roleState, setRoleState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    if (loading) return;
    if (!session) { setRoleState("denied"); return; }

    const checkRole = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = data?.role;
        setRoleState(role === "project" || role === "admin" ? "ok" : "denied");
      } catch {
        setRoleState("denied");
      }
    };
    checkRole();
  }, [session, loading]);

  if (loading || roleState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <p className="text-fg-secondary text-sm">Checking access...</p>
      </div>
    );
  }

  if (roleState === "denied") {
    return <Navigate to={session ? "/dashboard" : "/login"} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <AuthHashRedirect />
      <Routes>
        {/* Public */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/terms"         element={<TermsPage />} />
        <Route path="/privacy"       element={<PrivacyPage />} />

        {/* Creator protected */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"                element={<DashboardPage />} />
          <Route path="/portfolio"                element={<PortfolioPage />} />
          <Route path="/influence"                element={<TopCreatorsPage />} />
          <Route path="/influence/top-creators"   element={<InfluencePage />} />
          <Route path="/influence/top-performing" element={<TopPerformingPage />} />
          <Route path="/explore"                  element={<ExplorePage />} />
          <Route path="/explore/leaderboard"      element={<CampaignLeaderboardPage />} />
          <Route path="/market"                   element={<MarketPage />} />
          <Route path="/wallet"                   element={<WalletPage />} />
          <Route path="/settings"                 element={<SettingsPage />} />
          <Route path="*"                         element={<NotFoundPage />} />
        </Route>

        {/* Admin protected */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin"               element={<AdminOverviewPage />} />
          <Route path="/admin/campaigns"     element={<AdminCampaignsPage />} />
          <Route path="/admin/campaigns/new" element={<AdminCampaignNewPage />} />
          <Route path="/admin/users"         element={<AdminUsersPage />} />
          <Route path="/admin/trending"      element={<AdminTrendingPage />} />
          <Route path="/admin/metrics"       element={<AdminMetricsPage />} />
          <Route path="/admin/audit-log"     element={<AdminAuditLogPage />} />
        </Route>

        {/* Project client dashboard */}
        <Route element={<ProjectRoute><ProjectLayout /></ProjectRoute>}>
          <Route path="/project"                element={<ProjectOverviewPage />} />
          <Route path="/project/leaderboard"    element={<ProjectLeaderboardPage />} />
          <Route path="/project/videos"         element={<ProjectVideosPage />} />
          <Route path="/project/participants"   element={<ProjectParticipantsPage />} />
        </Route>
      </Routes>
    </>
  );
}