import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Organizer
import OrganizerDashboard from './pages/organizer/Dashboard';
import OrganizerEvents from './pages/organizer/Events';
import CreateEvent from './pages/organizer/CreateEvent';
import GuestList from './pages/organizer/GuestList';
import OrganizerBookings from './pages/organizer/Bookings';

// Talent
import TalentDashboard from './pages/talent/Dashboard';
import TalentProfile from './pages/talent/Profile';
import TalentBookings from './pages/talent/Bookings';

// Venue
import VenueDashboard from './pages/venue/Dashboard';
import VenueProfile from './pages/venue/Profile';
import VenueBookings from './pages/venue/Bookings';
import VenueCalendar from './pages/venue/Calendar';

// Marketplace
import TalentMarketplace from './pages/marketplace/TalentMarketplace';
import VenueMarketplace from './pages/marketplace/VenueMarketplace';

// Shared
import Contracts from './pages/shared/Contracts';
import Messages from './pages/shared/Messages';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const paths = { organizer: '/organizer', talent: '/talent', venue: '/venue' };
  return <Navigate to={paths[user.role] || '/login'} replace />;
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace/talents" element={<TalentMarketplace />} />
          <Route path="/marketplace/venues" element={<VenueMarketplace />} />

          {/* Root → role dashboard */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Organizer */}
          <Route path="/organizer" element={<ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/organizer/events" element={<ProtectedRoute role="organizer"><OrganizerEvents /></ProtectedRoute>} />
          <Route path="/organizer/events/new" element={<ProtectedRoute role="organizer"><CreateEvent /></ProtectedRoute>} />
          <Route path="/organizer/events/:id/guests" element={<ProtectedRoute role="organizer"><GuestList /></ProtectedRoute>} />
          <Route path="/organizer/bookings" element={<ProtectedRoute role="organizer"><OrganizerBookings /></ProtectedRoute>} />

          {/* Talent */}
          <Route path="/talent" element={<ProtectedRoute role="talent"><TalentDashboard /></ProtectedRoute>} />
          <Route path="/talent/profile" element={<ProtectedRoute role="talent"><TalentProfile /></ProtectedRoute>} />
          <Route path="/talent/bookings" element={<ProtectedRoute role="talent"><TalentBookings /></ProtectedRoute>} />

          {/* Venue */}
          <Route path="/venue" element={<ProtectedRoute role="venue"><VenueDashboard /></ProtectedRoute>} />
          <Route path="/venue/profile" element={<ProtectedRoute role="venue"><VenueProfile /></ProtectedRoute>} />
          <Route path="/venue/bookings" element={<ProtectedRoute role="venue"><VenueBookings /></ProtectedRoute>} />
          <Route path="/venue/calendar" element={<ProtectedRoute role="venue"><VenueCalendar /></ProtectedRoute>} />

          {/* Shared (any authenticated user) */}
          <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
