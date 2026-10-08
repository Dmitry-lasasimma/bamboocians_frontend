import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  organizer: [
    { label: 'Dashboard',   path: '/organizer' },
    { label: 'My Events',   path: '/organizer/events' },
    { label: 'Bookings',    path: '/organizer/bookings' },
    { label: 'Find Talent', path: '/marketplace/talents' },
    { label: 'Find Venues', path: '/marketplace/venues' },
    { label: 'Contracts',   path: '/contracts' },
    { label: 'Messages',    path: '/messages' },
  ],
  talent: [
    { label: 'Dashboard', path: '/talent' },
    { label: 'My Profile', path: '/talent/profile' },
    { label: 'Bookings',   path: '/talent/bookings' },
    { label: 'Contracts',  path: '/contracts' },
    { label: 'Messages',   path: '/messages' },
  ],
  venue: [
    { label: 'Dashboard', path: '/venue' },
    { label: 'My Profile', path: '/venue/profile' },
    { label: 'Bookings',   path: '/venue/bookings' },
    { label: 'Calendar',   path: '/venue/calendar' },
    { label: 'Contracts',  path: '/contracts' },
    { label: 'Messages',   path: '/messages' },
  ],
};

const ROLE_COLOR = {
  organizer: '#2d6a4f',
  talent:    '#6d4c8f',
  venue:     '#b5451b',
};

const ROLE_LABEL = {
  organizer: 'Organizer',
  talent:    'Talent',
  venue:     'Venue',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = NAV[user?.role] || [];
  const accent = ROLE_COLOR[user?.role] || '#2d6a4f';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f4' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        minWidth: sidebarOpen ? 240 : 0,
        background: '#fff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: '-0.5px' }}>
            Bamboocians
          </div>
          <div style={{
            marginTop: 6, display: 'inline-block',
            background: accent + '18', color: accent,
            fontSize: 11, fontWeight: 700, padding: '2px 10px',
            borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {ROLE_LABEL[user?.role]}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'block', padding: '10px 20px',
                color: active ? accent : '#444',
                background: active ? accent + '12' : 'transparent',
                borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
                textDecoration: 'none', fontWeight: active ? 600 : 400,
                fontSize: 14, transition: 'all 0.15s',
              }}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{user?.email}</div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px 0', background: '#fee', color: '#c0392b',
            border: '1px solid #fcc', borderRadius: 6, cursor: 'pointer', fontSize: 13,
          }}>
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: '#fff', borderBottom: '1px solid #e8e8e8',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: '#555', marginRight: 16,
          }}>☰</button>
          <span style={{ fontSize: 15, color: '#555' }}>
            Welcome back, <strong style={{ color: '#222' }}>{user?.name}</strong>
          </span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
