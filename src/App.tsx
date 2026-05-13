import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import StudentDashboard from './pages/student/Dashboard';
import MealBooking from './pages/student/MealBooking';
import Wallet from './pages/student/Wallet';
import Canteen from './pages/student/Canteen';
import Notifications from './pages/student/Notifications';
import Complaints from './pages/student/Complaints';
import History from './pages/student/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import AdminComplaints from './pages/admin/AdminComplaints';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading MessMind AI...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && profile && !['mess_admin', 'super_admin'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, profile } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={profile?.role?.includes('admin') ? '/admin' : '/dashboard'} replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

      {/* Student routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/meals" element={<MealBooking />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/canteen" element={<Canteen />} />
        <Route path="/night-canteen" element={<Canteen nightMode />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute adminOnly><AppLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />
        <Route path="/admin/menus" element={<MealBooking />} />
        <Route path="/admin/bookings" element={<History />} />
        <Route path="/admin/students" element={<StudentDashboard />} />
        <Route path="/admin/waste" element={<Analytics />} />
        <Route path="/admin/canteen" element={<Canteen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
