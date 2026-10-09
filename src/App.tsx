import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './state/StoreContext';
import type { ReactNode } from 'react';

// Layouts
import { PublicLayout } from './components/PublicLayout';
import { CitizenLayout } from './components/CitizenLayout';
import { OrganizationLayout } from './components/OrganizationLayout';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ExplorePage } from './pages/public/ExplorePage';
import { OrganizationsPage } from './pages/public/OrganizationsPage';
import { OrganizationProfilePage } from './pages/public/OrganizationProfilePage';
import { AboutPage } from './pages/public/AboutPage';

// Citizen pages
import { CitizenHome } from './pages/citizen/CitizenHome';
import { CreatePostPage } from './pages/citizen/CreatePostPage';import { CitizenMapPage } from './pages/citizen/CitizenMapPage';
import { CitizenEventsPage } from './pages/citizen/CitizenEventsPage';
import { CitizenNotificationsPage } from './pages/citizen/CitizenNotificationsPage';
import { CitizenActivityPage } from './pages/citizen/CitizenActivityPage';
import { CitizenProfilePage } from './pages/citizen/CitizenProfilePage';
import { IssueDetailPage } from './pages/citizen/IssueDetailPage';

// Organization pages
import { OrgDashboard } from './pages/organization/OrgDashboard';
import { OrgIssues } from './pages/organization/OrgIssues';
import { OrgCommunitySignals } from './pages/organization/OrgCommunitySignals';
import { OrgMapPage } from './pages/organization/OrgMap';
import { OrgResolutionPending } from './pages/organization/OrgResolutionPending';
import { OrgResolved } from './pages/organization/OrgResolved';
import { OrgCommunityFeedback } from './pages/organization/OrgCommunityFeedback';
import { OrgPublicProfilePage } from './pages/organization/OrgPublicProfile';
import { OrgNotificationsPage } from './pages/organization/OrgNotificationsPage';

function LoadingGate({ children }: { children: ReactNode }) {
  const { loading } = useStore();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }
  return <>{children}</>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <StoreProvider>
      <LoadingGate>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/organizations/:id" element={<OrganizationProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/explore" element={<RequireAuth><ExplorePage /></RequireAuth>} />
            <Route path="/issue/:id" element={<RequireAuth><IssueDetailPage /></RequireAuth>} />
          </Route>

          {/* Auth routes (no layout wrapper) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen routes */}
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route index element={<CitizenHome />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="create" element={<CreatePostPage />} />
            <Route path="map" element={<CitizenMapPage />} />
            <Route path="events" element={<CitizenEventsPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/:id" element={<OrganizationProfilePage />} />
            <Route path="notifications" element={<CitizenNotificationsPage />} />
            <Route path="activity" element={<CitizenActivityPage />} />
            <Route path="profile" element={<CitizenProfilePage />} />
            <Route path="issue/:id" element={<IssueDetailPage />} />
          </Route>

          {/* Organization routes */}
          <Route path="/organization" element={<OrganizationLayout />}>
            <Route index element={<OrgDashboard />} />
            <Route path="issues" element={<OrgIssues />} />
            <Route path="create" element={<CreatePostPage />} />
            <Route path="signals" element={<OrgCommunitySignals />} />
            <Route path="map" element={<OrgMapPage />} />
            <Route path="resolution-pending" element={<OrgResolutionPending />} />
            <Route path="resolved" element={<OrgResolved />} />
            <Route path="feedback" element={<OrgCommunityFeedback />} />
            <Route path="profile" element={<OrgPublicProfilePage />} />
            <Route path="organizations/:id" element={<OrganizationProfilePage />} />
            <Route path="issue/:id" element={<IssueDetailPage />} />
            <Route path="notifications" element={<OrgNotificationsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </LoadingGate>
    </StoreProvider>
  );
}

export default App;
