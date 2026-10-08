import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card, { StatCard, Badge } from '../../components/Card';
import client from '../../api/client';

export default function VenueDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/venue/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Venue Dashboard</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Manage your venue bookings and availability</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Total Bookings" value={data?.total_bookings} color="#b5451b" />
        <StatCard label="Pending Requests" value={data?.pending_bookings} color="#e9a826" />
        <StatCard label="Confirmed Bookings" value={data?.confirmed_bookings} color="#2d6a4f" />
      </div>

      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/venue/profile" style={styles.btn('#b5451b')}>Edit Venue Profile</Link>
          <Link to="/venue/bookings" style={styles.btn('#2d6a4f')}>Manage Bookings</Link>
          <Link to="/venue/calendar" style={styles.btn('#0077b6')}>View Calendar</Link>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Upcoming Events at Your Venue</h2>
          <Link to="/venue/calendar" style={{ fontSize: 13, color: '#b5451b', fontWeight: 600 }}>Calendar →</Link>
        </div>

        {!data?.upcoming_bookings?.length
          ? <p style={{ color: '#999', fontSize: 14 }}>No upcoming events. Complete your profile to attract organizers!</p>
          : (
            <table style={styles.table}>
              <thead>
                <tr>{['Event', 'Organizer', 'Date', 'Price', 'Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {data.upcoming_bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{b.event?.title || '—'}</td>
                    <td style={styles.td}>{b.booked_by?.name || '—'}</td>
                    <td style={styles.td}>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                    <td style={styles.td}>{b.price ? `$${b.price}` : '—'}</td>
                    <td style={styles.td}><Badge status={b.status} /></td>
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
  btn: (bg) => ({
    padding: '10px 18px', background: bg, color: '#fff',
    borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
  }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600, padding: '6px 0', borderBottom: '1px solid #eee' },
  td: { padding: '12px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5', paddingRight: 16 },
};
