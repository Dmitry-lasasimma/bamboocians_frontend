import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function TalentMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [booking, setBooking] = useState(null); // talent being booked

  useEffect(() => {
    client.get('/marketplace/talents').then(r => setTalents(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = talents.filter(t => {
    const q = search.toLowerCase();
    return (
      (t.stage_name || t.user?.name || '').toLowerCase().includes(q) ||
      (t.genre || '').toLowerCase().includes(q) ||
      (t.location || '').toLowerCase().includes(q) ||
      (t.skills || '').toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Talent Marketplace</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Browse musicians, DJs, speakers and performers</p>
      </div>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, genre, location, skills…"
        style={styles.search}
      />

      {loading
        ? <p>Loading talents…</p>
        : !filtered.length
          ? <Card><p style={{ color: '#999', textAlign: 'center', padding: 30 }}>No talents found.</p></Card>
          : (
            <div style={styles.grid}>
              {filtered.map(t => (
                <div key={t.id} style={styles.card}>
                  <div style={styles.avatar}>{(t.stage_name || t.user?.name || '?')[0].toUpperCase()}</div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{t.stage_name || t.user?.name}</div>
                  <div style={{ color: '#6d4c8f', fontSize: 13, margin: '2px 0 6px' }}>{t.genre || 'Performer'}</div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                    📍 {t.location || 'Location TBD'}
                  </div>
                  <div style={{ fontSize: 13, color: '#444', marginBottom: 8, minHeight: 40 }}>
                    {t.bio ? t.bio.substring(0, 80) + (t.bio.length > 80 ? '…' : '') : 'No bio yet.'}
                  </div>
                  {t.skills && (
                    <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {t.skills.split(',').slice(0, 3).map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} style={styles.tag}>{s}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, color: '#2d6a4f', fontSize: 14, marginBottom: 12 }}>
                    ${t.hourly_rate || 0}/hr
                  </div>
                  {user?.role === 'organizer' && (
                    <button onClick={() => setBooking(t)} style={styles.bookBtn}>Book Now</button>
                  )}
                  {!user && (
                    <Link to="/register" style={styles.bookBtn}>Register to Book</Link>
                  )}
                </div>
              ))}
            </div>
          )
      }

      {/* Booking Modal */}
      {booking && user?.role === 'organizer' && (
        <BookingModal talent={booking} onClose={() => setBooking(null)} onBooked={() => {
          setBooking(null);
          navigate('/organizer/bookings');
        }} />
      )}
    </Layout>
  );
}

function BookingModal({ talent, onClose, onBooked }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ event_id: '', price: talent.hourly_rate || '', notes: '', date: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get('/organizer/events').then(r => setEvents(r.data.data || []));
  }, []);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post('/organizer/bookings', {
        event_id: parseInt(form.event_id),
        booked_to_id: talent.user_id,
        booking_type: 'talent',
        price: parseFloat(form.price) || 0,
        notes: form.notes,
        date: new Date(form.date).toISOString(),
      });
      onBooked();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Book {talent.stage_name || talent.user?.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={submit}>
          <label style={styles.label}>Select Event *</label>
          <select value={form.event_id} onChange={e => setForm(f => ({ ...f, event_id: e.target.value }))}
            required style={styles.input}>
            <option value="">— Choose your event —</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>

          <label style={styles.label}>Date *</label>
          <input type="datetime-local" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required style={styles.input} />

          <label style={styles.label}>Agreed Price ($)</label>
          <input type="number" value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            style={styles.input} />

          <label style={styles.label}>Notes for Performer</label>
          <textarea value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Set up time, special requirements…" rows={3}
            style={{ ...styles.input, resize: 'vertical' }} />

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Sending request…' : 'Send Booking Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  search: {
    width: '100%', padding: '12px 18px', border: '1px solid #ddd',
    borderRadius: 30, fontSize: 14, marginBottom: 24, outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  card: {
    background: '#fff', borderRadius: 12, padding: '20px 22px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column',
  },
  avatar: {
    width: 52, height: 52, borderRadius: '50%', background: '#ede7f6',
    color: '#6d4c8f', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 800, marginBottom: 10,
  },
  tag: { background: '#ede7f6', color: '#6d4c8f', borderRadius: 20, padding: '2px 8px', fontSize: 11 },
  bookBtn: {
    display: 'block', textAlign: 'center', padding: '9px 0',
    background: '#6d4c8f', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    textDecoration: 'none', marginTop: 'auto',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  modal: {
    background: '#fff', borderRadius: 14, padding: '28px 32px',
    width: '100%', maxWidth: 480, boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
  },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4, marginTop: 12 },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 4,
  },
  submitBtn: {
    width: '100%', padding: '12px 0', background: '#6d4c8f', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 14,
  },
};
