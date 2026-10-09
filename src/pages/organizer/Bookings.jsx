import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card, { Badge } from '../../components/Card';
import client from '../../api/client';

export default function OrganizerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    client.get('/organizer/bookings').then(r => setBookings(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await client.put(`/organizer/bookings/${id}/cancel`);
    load();
  };

  const createContract = async (b) => {
    const content = window.prompt(
      `Contract terms for "${b.event?.title}" with ${b.booked_to?.name}:`,
      `${b.booked_to?.name} agrees to provide ${b.booking_type} services for "${b.event?.title}" on ${new Date(b.date).toLocaleDateString()} for $${b.price}.`
    );
    if (!content) return;
    try {
      await client.post('/organizer/contracts', { booking_id: b.id, content });
      alert('Contract created. It is now waiting for the other party to sign.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create contract');
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>My Bookings</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Talent and venue bookings you have made</p>
      </div>

      <Card>
        {loading
          ? <p>Loading…</p>
          : !bookings.length
            ? <p style={{ color: '#999' }}>No bookings yet. Browse talent or venues to make a booking.</p>
            : (
              <table style={styles.table}>
                <thead>
                  <tr>{['Event', 'Booked To', 'Type', 'Date', 'Price', 'Status', 'Action'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{b.event?.title || '—'}</td>
                      <td style={styles.td}>{b.booked_to?.name || '—'}</td>
                      <td style={styles.td}>{b.booking_type}</td>
                      <td style={styles.td}>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                      <td style={styles.td}>{b.price ? `$${b.price}` : '—'}</td>
                      <td style={styles.td}><Badge status={b.status} /></td>
                      <td style={styles.td}>
                        {b.status === 'pending' && (
                          <button onClick={() => cancel(b.id)} style={styles.cancelBtn}>Cancel</button>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => createContract(b)} style={styles.contractBtn}>Create Contract</button>
                        )}
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
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600, padding: '8px 0', borderBottom: '2px solid #eee' },
  td: { padding: '14px 0', fontSize: 14, color: '#333', borderBottom: '1px solid #f5f5f5', paddingRight: 16 },
  cancelBtn: {
    background: '#fee', color: '#c0392b', border: '1px solid #fcc',
    borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
  },
  contractBtn: {
    background: '#e8f5ee', color: '#2d6a4f', border: '1px solid #b7e4c7',
    borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
  },
};
