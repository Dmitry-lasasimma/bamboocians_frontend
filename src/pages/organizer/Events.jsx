import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card, { Badge } from '../../components/Card';
import client from '../../api/client';

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    client.get('/organizer/events').then(r => setEvents(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await client.delete(`/organizer/events/${id}`);
    load();
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>My Events</h1>
          <p style={{ color: '#666', marginTop: 4 }}>All events you have created</p>
        </div>
        <Link to="/organizer/events/new" style={styles.createBtn}>+ New Event</Link>
      </div>

      <Card>
        {loading
          ? <p>Loading…</p>
          : !events.length
            ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#999', marginBottom: 16 }}>You have no events yet.</p>
                <Link to="/organizer/events/new" style={styles.createBtn}>Create Your First Event</Link>
              </div>
            )
            : (
              <table style={styles.table}>
                <thead>
                  <tr>{['Title', 'Type', 'Date', 'Location', 'Budget', 'Status', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} style={{ ':hover': { background: '#f9f9f9' } }}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{ev.title}</td>
                      <td style={styles.td}>{ev.event_type || '—'}</td>
                      <td style={styles.td}>{new Date(ev.date).toLocaleDateString()}</td>
                      <td style={styles.td}>{ev.location || '—'}</td>
                      <td style={styles.td}>{ev.budget ? `$${ev.budget.toLocaleString()}` : '—'}</td>
                      <td style={styles.td}><Badge status={ev.status} /></td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link to={`/organizer/events/${ev.id}/guests`} style={styles.link}>Guests</Link>
                          <button onClick={() => deleteEvent(ev.id)} style={styles.deleteBtn}>Delete</button>
                        </div>
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
  createBtn: {
    padding: '10px 20px', background: '#2d6a4f', color: '#fff',
    borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600, padding: '8px 0', borderBottom: '2px solid #eee' },
  td: { padding: '14px 0', fontSize: 14, color: '#333', borderBottom: '1px solid #f5f5f5', paddingRight: 16 },
  link: { color: '#2d6a4f', fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  deleteBtn: {
    background: '#fee', color: '#c0392b', border: '1px solid #fcc',
    borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer',
  },
};
