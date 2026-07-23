import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Suspense, lazy } from 'react';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const RestaurantDashboard = lazy(() => import('./pages/restaurant/Dashboard'));
const RestaurantProfile = lazy(() => import('./pages/restaurant/Profile'));
const CreateDonation = lazy(() => import('./pages/restaurant/CreateDonation'));
const DonationHistory = lazy(() => import('./pages/restaurant/DonationHistory'));
const Certificates = lazy(() => import('./pages/restaurant/Certificates'));
const NGODashboard = lazy(() => import('./pages/ngo/Dashboard'));
const NGOProfile = lazy(() => import('./pages/ngo/Profile'));
const BrowseDonations = lazy(() => import('./pages/ngo/BrowseDonations'));
const NGODonationHistory = lazy(() => import('./pages/ngo/DonationHistory'));
const VolunteerDashboard = lazy(() => import('./pages/volunteer/Dashboard'));
const VolunteerProfile = lazy(() => import('./pages/volunteer/Profile'));
const MyAssignments = lazy(() => import('./pages/volunteer/MyAssignments'));
const MapPage = lazy(() => import('./pages/MapPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={`/${role}`} replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={`/${role}`} replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Restaurant */}
        <Route path="/restaurant" element={<ProtectedRoute requiredRole="restaurant"><RestaurantDashboard /></ProtectedRoute>} />
        <Route path="/restaurant/profile" element={<ProtectedRoute requiredRole="restaurant"><RestaurantProfile /></ProtectedRoute>} />
        <Route path="/restaurant/donate" element={<ProtectedRoute requiredRole="restaurant"><CreateDonation /></ProtectedRoute>} />
        <Route path="/restaurant/history" element={<ProtectedRoute requiredRole="restaurant"><DonationHistory /></ProtectedRoute>} />
        <Route path="/restaurant/certificates" element={<ProtectedRoute requiredRole="restaurant"><Certificates /></ProtectedRoute>} />

        {/* NGO */}
        <Route path="/ngo" element={<ProtectedRoute requiredRole="ngo"><NGODashboard /></ProtectedRoute>} />
        <Route path="/ngo/profile" element={<ProtectedRoute requiredRole="ngo"><NGOProfile /></ProtectedRoute>} />
        <Route path="/ngo/browse" element={<ProtectedRoute requiredRole="ngo"><BrowseDonations /></ProtectedRoute>} />
        <Route path="/ngo/history" element={<ProtectedRoute requiredRole="ngo"><NGODonationHistory /></ProtectedRoute>} />

        {/* Volunteer */}
        <Route path="/volunteer" element={<ProtectedRoute requiredRole="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/volunteer/profile" element={<ProtectedRoute requiredRole="volunteer"><VolunteerProfile /></ProtectedRoute>} />
        <Route path="/volunteer/assignments" element={<ProtectedRoute requiredRole="volunteer"><MyAssignments /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><AIChatPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
