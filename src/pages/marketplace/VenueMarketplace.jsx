import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function VenueMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    client.get('/marketplace/venues').then(r => setVenues(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = venues.filter(v => {
    const q = search.toLowerCase();
    return (
      (v.venue_name || v.user?.name || '').toLowerCase().includes(q) ||
      (v.location || '').toLowerCase().includes(q) ||
      (v.amenities || '').toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Venue Marketplace</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Find the perfect space for your event</p>
      </div>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, location, amenities…"
        style={styles.search}
      />

      {loading
        ? <p>Loading venues…</p>
        : !filtered.length
          ? <Card><p style={{ color: '#999', textAlign: 'center', padding: 30 }}>No venues found.</p></Card>
          : (
            <div style={styles.grid}>
              {filtered.map(v => (
                <div key={v.id} style={styles.card}>
                  <div style={styles.avatar}>{(v.venue_name || v.user?.name || '?')[0].toUpperCase()}</div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{v.venue_name || v.user?.name}</div>
                  <div style={{ fontSize: 12, color: '#888', margin: '4px 0 6px' }}>
                    📍 {v.location || 'Location TBD'}
                  </div>
                  <div style={{ fontSize: 13, color: '#444', marginBottom: 8, minHeight: 40 }}>
                    {v.description ? v.description.substring(0, 80) + (v.description.length > 80 ? '…' : '') : 'No description.'}
                  </div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                    👥 Capacity: <strong>{v.capacity || '—'}</strong>
                  </div>
                  {v.amenities && (
                    <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {v.amenities.split(',').slice(0, 3).map(a => a.trim()).filter(Boolean).map(a => (
                        <span key={a} style={styles.tag}>{a}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, color: '#b5451b', fontSize: 14, marginBottom: 12 }}>
                    ${v.hourly_rate || 0}/hr
                  </div>
                  {user?.role === 'organizer' && (
                    <button onClick={() => setBooking(v)} style={styles.bookBtn}>Book Venue</button>
                  )}
                  {!user && (
                    <Link to="/register" style={styles.bookBtn}>Register to Book</Link>
                  )}
                </div>
              ))}
            </div>
          )
      }

      {booking && user?.role === 'organizer' && (
        <VenueBookingModal venue={booking} onClose={() => setBooking(null)} onBooked={() => {
          setBooking(null);
          navigate('/organizer/bookings');
        }} />
      )}
    </Layout>
  );
}

function VenueBookingModal({ venue, onClose, onBooked }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ event_id: '', price: venue.hourly_rate || '', notes: '', date: '' });
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
        booked_to_id: venue.user_id,
        booking_type: 'venue',
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
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Book {venue.venue_name || venue.user?.name}</h2>
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
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={styles.input} />

          <label style={styles.label}>Special Requirements</label>
          <textarea value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Setup requirements, timing, guest count…" rows={3}
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
    width: 52, height: 52, borderRadius: 10, background: '#ffe0d4',
    color: '#b5451b', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 800, marginBottom: 10,
  },
  tag: { background: '#ffe0d4', color: '#b5451b', borderRadius: 20, padding: '2px 8px', fontSize: 11 },
  bookBtn: {
    display: 'block', textAlign: 'center', padding: '9px 0',
    background: '#b5451b', color: '#fff', border: 'none',
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
    width: '100%', padding: '12px 0', background: '#b5451b', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 14,
  },
};
