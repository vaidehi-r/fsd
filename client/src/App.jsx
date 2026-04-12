import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useNotificationStore from './stores/notificationStore';
import useSocketStore from './stores/socketStore';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/public/Landing';
import CarListing from './pages/public/CarListing';
import CarDetail from './pages/public/CarDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import OwnerApply from './pages/public/OwnerApply';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// User pages
import UserDashboard from './pages/user/Dashboard';
import UserBookings from './pages/user/Bookings';
import BookingDetail from './pages/user/BookingDetail';
import Wishlist from './pages/user/Wishlist';
import UserProfile from './pages/user/Profile';
import Notifications from './pages/user/Notifications';

// Owner pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerCars from './pages/owner/Cars';
import AddCar from './pages/owner/AddCar';
import EditCar from './pages/owner/EditCar';
import OwnerBookings from './pages/owner/Bookings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOwners from './pages/admin/Owners';
import AdminOwnerRequests from './pages/admin/OwnerRequests';
import AdminCars from './pages/admin/Cars';
import AdminBookings from './pages/admin/Bookings';
import AdminReviews from './pages/admin/Reviews';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

const App = () => {
  const { fetchMe, isAuthenticated } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { initSocket, disconnectSocket } = useSocketStore();

  // Fetch user on app load
  useEffect(() => {
    fetchMe();
  }, []);

  // Initialize socket and fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
      fetchNotifications();
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/owner/apply" element={<OwnerApply />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute allowedRoles={['user']}><UserBookings /></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute allowedRoles={['user']}><BookingDetail /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['user']}><Wishlist /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/* Owner Routes */}
          <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/cars" element={<ProtectedRoute allowedRoles={['owner']}><OwnerCars /></ProtectedRoute>} />
          <Route path="/owner/cars/new" element={<ProtectedRoute allowedRoles={['owner']}><AddCar /></ProtectedRoute>} />
          <Route path="/owner/cars/:id/edit" element={<ProtectedRoute allowedRoles={['owner']}><EditCar /></ProtectedRoute>} />
          <Route path="/owner/bookings" element={<ProtectedRoute allowedRoles={['owner']}><OwnerBookings /></ProtectedRoute>} />
          <Route path="/owner/profile" element={<ProtectedRoute allowedRoles={['owner']}><UserProfile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/owners" element={<ProtectedRoute allowedRoles={['admin']}><AdminOwners /></ProtectedRoute>} />
          <Route path="/admin/owner-requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminOwnerRequests /></ProtectedRoute>} />
          <Route path="/admin/cars" element={<ProtectedRoute allowedRoles={['admin']}><AdminCars /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="pt-20 min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-700 mb-4">404</h1>
                <p className="text-xl text-slate-500 mb-8">Page not found</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
