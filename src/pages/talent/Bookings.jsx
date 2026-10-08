import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card, { Badge } from '../../components/Card';
import client from '../../api/client';

export default function TalentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    client.get('/talent/bookings').then(r => setBookings(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const respond = async (id, status) => {
    await client.put(`/talent/bookings/${id}/respond`, { status });
    load();
  };

  const pending   = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const past      = bookings.filter(b => ['declined', 'cancelled'].includes(b.status));

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>My Bookings</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Accept or decline booking requests from organizers</p>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <Card style={{ marginBottom: 20, borderLeft: '4px solid #e9a826' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#856404', marginBottom: 14 }}>
            Pending Requests ({pending.length})
          </h2>
          {pending.map(b => (
            <div key={b.id} style={styles.bookingRow}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{b.event?.title || 'Untitled Event'}</div>
                <div style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                  Organizer: <strong>{b.booked_by?.name}</strong> &bull;{' '}
                  {b.date ? new Date(b.date).toLocaleDateString() : '—'} &bull;{' '}
                  ${b.price || 0}
                </div>
                {b.notes && <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{b.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => respond(b.id, 'confirmed')} style={styles.acceptBtn}>Accept</button>
                <button onClick={() => respond(b.id, 'declined')} style={styles.declineBtn}>Decline</button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Confirmed gigs */}
      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
          Confirmed Gigs ({confirmed.length})
        </h2>
        {!confirmed.length
          ? <p style={{ color: '#999', fontSize: 14 }}>No confirmed bookings yet.</p>
          : (
            <table style={styles.table}>
              <thead>
                <tr>{['Event', 'Organizer', 'Date', 'Price', 'Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {confirmed.map(b => (
                  <tr key={b.id}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{b.event?.title || '—'}</td>
                    <td style={styles.td}>{b.booked_by?.name || '—'}</td>
                    <td style={styles.td}>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                    <td style={styles.td}>${b.price || 0}</td>
                    <td style={styles.td}><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Card>

      {/* History */}
      {past.length > 0 && (
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#888' }}>
            History ({past.length})
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>{['Event', 'Organizer', 'Date', 'Price', 'Status'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {past.map(b => (
                <tr key={b.id}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{b.event?.title || '—'}</td>
                  <td style={styles.td}>{b.booked_by?.name || '—'}</td>
                  <td style={styles.td}>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                  <td style={styles.td}>${b.price || 0}</td>
                  <td style={styles.td}><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Layout>
  );
}

const styles = {
  bookingRow: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '14px 0', borderBottom: '1px solid #f5f5f5',
  },
  acceptBtn: {
    padding: '7px 16px', background: '#2d6a4f', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  declineBtn: {
    padding: '7px 16px', background: '#fee', color: '#c0392b',
    border: '1px solid #fcc', borderRadius: 6, fontSize: 13, cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600, padding: '6px 0', borderBottom: '2px solid #eee' },
  td: { padding: '12px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5', paddingRight: 16 },
};
