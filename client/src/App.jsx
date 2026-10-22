import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ErrorState, Loading } from './components/ui/Common';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import LandingPage from './pages/LandingPage';
import FeedbackPage from './pages/FeedbackPage';
import SuccessPage from './pages/SuccessPage';
import AdminLogin from './pages/AdminLogin';
const Dashboard = lazy(() => import('./pages/Dashboard'));
import FeedbackManagement from './pages/FeedbackManagement';
import EventsManagement from './pages/EventsManagement';
function ProtectedRoute() {
  const { admin, loading, error, retry } = useAuth();
  if (loading) return <Loading label="Checking your session…" />;
  if (error) return <ErrorState message={error} retry={retry} />;
  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
export default function App() {
  return (
    <Suspense fallback={<Loading label="Loading workspace…" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="feedback/success" element={<SuccessPage />} />
          <Route path="admin/login" element={<AdminLogin />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="feedback" element={<FeedbackManagement />} />
            <Route path="events" element={<EventsManagement />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
