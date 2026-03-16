import { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LibraryProvider } from './context/LibraryContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminRequests from './pages/admin/AdminRequests';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBooks from './pages/admin/AdminBooks';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import Reader from './pages/Reader';
import UploadPage from './pages/UploadPage';
import Marketplace from './pages/Marketplace';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nx-gradient">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-violet-500 rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 text-sm animate-pulse">Loading NexusRead…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Reader — full screen, no sidebar layout */}
      <Route path="/reader/:bookId" element={<ProtectedRoute><Reader /></ProtectedRoute>} />

      {/* Admin — has its own layout */}
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="users"    element={<AdminUsers />} />
        <Route path="books"    element={<AdminBooks />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* All other app pages — wrapped in AppLayout */}
      <Route path="/*" element={
        <AppLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
          <Routes>
            <Route path="/dashboard"        element={<ProtectedRoute><Dashboard searchQuery={searchQuery} /></ProtectedRoute>} />
            <Route path="/explore"          element={<Explore searchQuery={searchQuery} />} />
            <Route path="/marketplace"      element={<Marketplace />} />
            <Route path="/marketplace/:bookId" element={<BookDetail />} />
            <Route path="/cart"             element={<Cart />} />
            <Route path="/upload"           element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/leaderboard"      element={<Leaderboard />} />
            <Route path="/profile"          element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:userId"  element={<Profile />} />
            <Route path="/analytics"        element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/"                 element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
            <Route path="*"                 element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      } />

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <LibraryProvider>
          <CartProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </NotificationProvider>
          </CartProvider>
        </LibraryProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
