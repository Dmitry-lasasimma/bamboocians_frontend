import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card, { StatCard, Badge } from '../../components/Card';
import client from '../../api/client';

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/organizer/dashboard')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>Organizer Dashboard</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Your event management overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Total Events" value={data?.total_events} color="#2d6a4f" />
        <StatCard label="Upcoming Events" value={data?.upcoming_events} color="#52b788" />
        <StatCard label="Pending Bookings" value={data?.pending_bookings} color="#e9a826" />
      </div>

      {/* Quick Actions */}
      <Card style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/organizer/events/new" style={styles.actionBtn('#2d6a4f')}>+ Create New Event</Link>
          <Link to="/marketplace/talents" style={styles.actionBtn('#6d4c8f')}>Browse Talent</Link>
          <Link to="/marketplace/venues" style={styles.actionBtn('#b5451b')}>Browse Venues</Link>
          <Link to="/organizer/bookings" style={styles.actionBtn('#0077b6')}>View Bookings</Link>
        </div>
      </Card>

      {/* Recent Events */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Events</h2>
          <Link to="/organizer/events" style={{ fontSize: 13, color: '#2d6a4f', fontWeight: 600 }}>View all →</Link>
        </div>
        {!data?.recent_events?.length
          ? <p style={{ color: '#999', fontSize: 14 }}>No events yet. <Link to="/organizer/events/new">Create your first event</Link></p>
          : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Title', 'Type', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent_events.map(ev => (
                  <tr key={ev.id}>
                    <td style={styles.td}>{ev.title}</td>
                    <td style={styles.td}>{ev.event_type}</td>
                    <td style={styles.td}>{new Date(ev.date).toLocaleDateString()}</td>
                    <td style={styles.td}><Badge status={ev.status} /></td>
                    <td style={styles.td}>
                      <Link to={`/organizer/events/${ev.id}/guests`} style={{ color: '#2d6a4f', fontSize: 13 }}>
                        Guests
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Card>
    </Layout>
  );
}

const styles = {
  actionBtn: (bg) => ({
    padding: '10px 18px', background: bg, color: '#fff',
    borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
  }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600, padding: '6px 0', borderBottom: '1px solid #eee' },
  td: { padding: '12px 0', fontSize: 14, color: '#333', borderBottom: '1px solid #f5f5f5' },
};
