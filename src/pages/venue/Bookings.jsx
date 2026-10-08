import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card, { Badge } from '../../components/Card';
import client from '../../api/client';

export default function VenueBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    client.get('/venue/bookings').then(r => setBookings(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const respond = async (id, status) => {
    await client.put(`/venue/bookings/${id}/respond`, { status });
    load();
  };

  const pending   = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const past      = bookings.filter(b => ['declined', 'cancelled'].includes(b.status));

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Venue Bookings</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Accept or decline booking requests from event organizers</p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <Card style={{ marginBottom: 20, borderLeft: '4px solid #e9a826' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#856404', marginBottom: 14 }}>
            Pending Requests ({pending.length})
          </h2>
          {pending.map(b => (
            <div key={b.id} style={styles.row}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{b.event?.title || 'Untitled Event'}</div>
                <div style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                  Organizer: <strong>{b.booked_by?.name}</strong> &bull;{' '}
                  {b.date ? new Date(b.date).toLocaleDateString() : 'No date'} &bull;{' '}
                  ${b.price || 0}
                </div>
                {b.notes && <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Note: {b.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => respond(b.id, 'confirmed')} style={styles.acceptBtn}>Accept</button>
                <button onClick={() => respond(b.id, 'declined')} style={styles.declineBtn}>Decline</button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Confirmed */}
      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Confirmed ({confirmed.length})</h2>
        {!confirmed.length
          ? <p style={{ color: '#999', fontSize: 14 }}>No confirmed bookings.</p>
          : <BookingTable bookings={confirmed} />
        }
      </Card>

      {/* History */}
      {past.length > 0 && (
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#888', marginBottom: 14 }}>History</h2>
          <BookingTable bookings={past} />
        </Card>
      )}
    </Layout>
  );
}

function BookingTable({ bookings }) {
  const s = {
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600, padding: '6px 0', borderBottom: '2px solid #eee' },
    td: { padding: '12px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5', paddingRight: 16 },
  };
  return (
    <table style={s.table}>
      <thead><tr>{['Event', 'Organizer', 'Date', 'Price', 'Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
      <tbody>
        {bookings.map(b => (
          <tr key={b.id}>
            <td style={{ ...s.td, fontWeight: 600 }}>{b.event?.title || '—'}</td>
            <td style={s.td}>{b.booked_by?.name || '—'}</td>
            <td style={s.td}>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
            <td style={s.td}>${b.price || 0}</td>
            <td style={s.td}><Badge status={b.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  row: { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #f5f5f5' },
  acceptBtn: { padding: '7px 16px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  declineBtn: { padding: '7px 16px', background: '#fee', color: '#c0392b', border: '1px solid #fcc', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
};
