import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card, { Badge } from '../../components/Card';
import client from '../../api/client';

export default function GuestList() {
  const { id } = useParams();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [adding, setAdding] = useState(false);

  const load = () => {
    client.get(`/organizer/events/${id}/guests`)
      .then(r => setGuests(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const addGuest = async e => {
    e.preventDefault();
    setAdding(true);
    try {
      await client.post(`/organizer/events/${id}/guests`, form);
      setForm({ name: '', email: '', phone: '' });
      load();
    } finally {
      setAdding(false);
    }
  };

  const updateStatus = async (guestId, status) => {
    await client.put(`/organizer/guests/${guestId}`, { status });
    load();
  };

  const confirmed = guests.filter(g => g.status === 'confirmed').length;
  const declined  = guests.filter(g => g.status === 'declined').length;
  const invited   = guests.filter(g => g.status === 'invited').length;

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <Link to="/organizer/events" style={{ color: '#2d6a4f', fontSize: 13 }}>← Back to Events</Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Guest List</h1>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', value: guests.length, color: '#0077b6' },
          { label: 'Confirmed', value: confirmed, color: '#2d6a4f' },
          { label: 'Invited', value: invited, color: '#e9a826' },
          { label: 'Declined', value: declined, color: '#e63946' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: '#fff', borderRadius: 10, padding: '14px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add Guest */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Add Guest</h2>
        <form onSubmit={addGuest} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required placeholder="Full Name" style={styles.input} />
          <input value={form.email} type="email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="Email (optional)" style={styles.input} />
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="Phone (optional)" style={styles.input} />
          <button type="submit" disabled={adding} style={styles.addBtn}>
            {adding ? 'Adding…' : '+ Add'}
          </button>
        </form>
      </Card>

      {/* Guest table */}
      <Card>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
          All Guests ({guests.length})
        </h2>
        {loading
          ? <p>Loading…</p>
          : !guests.length
            ? <p style={{ color: '#999' }}>No guests yet. Add the first one above.</p>
            : (
              <table style={styles.table}>
                <thead>
                  <tr>{['Name', 'Email', 'Phone', 'Status', 'Update Status'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {guests.map(g => (
                    <tr key={g.id}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{g.name}</td>
                      <td style={styles.td}>{g.email || '—'}</td>
                      <td style={styles.td}>{g.phone || '—'}</td>
                      <td style={styles.td}><Badge status={g.status} /></td>
                      <td style={styles.td}>
                        <select
                          value={g.status}
                          onChange={e => updateStatus(g.id, e.target.value)}
                          style={styles.select}
                        >
                          <option value="invited">Invited</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                        </select>
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
  input: {
    padding: '9px 14px', border: '1px solid #ddd', borderRadius: 8,
    fontSize: 13, flex: 1, minWidth: 160, outline: 'none',
  },
  addBtn: {
    padding: '9px 20px', background: '#2d6a4f', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600, padding: '6px 0', borderBottom: '2px solid #eee' },
  td: { padding: '12px 0', fontSize: 14, color: '#333', borderBottom: '1px solid #f5f5f5', paddingRight: 16 },
  select: { padding: '5px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 },
};
