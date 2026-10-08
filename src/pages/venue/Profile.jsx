import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import client from '../../api/client';

export default function VenueProfile() {
  const [form, setForm] = useState({
    venue_name: '', description: '', capacity: '',
    location: '', amenities: '', hourly_rate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    client.get('/venue/profile').then(r => {
      const p = r.data.data;
      setForm({
        venue_name: p.venue_name || '',
        description: p.description || '',
        capacity: p.capacity || '',
        location: p.location || '',
        amenities: p.amenities || '',
        hourly_rate: p.hourly_rate || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      await client.put('/venue/profile', {
        ...form,
        capacity: parseInt(form.capacity) || 0,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
      });
      setSuccess('Venue profile saved!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Venue Profile</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Your public listing — make it attractive to organizers</p>
      </div>

      <Card style={{ maxWidth: 680 }}>
        {success && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {success}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Venue Name</label>
              <input name="venue_name" value={form.venue_name} onChange={handle}
                placeholder="e.g. The Grand Ballroom" style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input name="location" value={form.location} onChange={handle}
                placeholder="Address or city" style={styles.input} />
            </div>
          </div>

          <label style={styles.label}>Description</label>
          <textarea name="description" value={form.description} onChange={handle}
            placeholder="Describe your venue — size, ambiance, what makes it special…"
            rows={4} style={{ ...styles.input, resize: 'vertical' }} />

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Capacity (people)</label>
              <input name="capacity" type="number" min="0" value={form.capacity} onChange={handle}
                placeholder="300" style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Hourly Rate ($)</label>
              <input name="hourly_rate" type="number" min="0" value={form.hourly_rate} onChange={handle}
                placeholder="200" style={styles.input} />
            </div>
          </div>

          <label style={styles.label}>Amenities</label>
          <input name="amenities" value={form.amenities} onChange={handle}
            placeholder="e.g. Parking, Catering, AV System, Wi-Fi (comma-separated)" style={styles.input} />

          <button type="submit" disabled={saving} style={styles.btn}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </Card>

      {/* Preview */}
      <Card style={{ maxWidth: 680, marginTop: 20, background: '#fff5f2' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#b5451b', marginBottom: 12 }}>
          Public Listing Preview
        </h3>
        <div style={{ fontWeight: 800, fontSize: 20 }}>{form.venue_name || 'Venue Name'}</div>
        <div style={{ fontSize: 13, color: '#888', margin: '4px 0 8px' }}>📍 {form.location || 'Location not set'}</div>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>{form.description || 'No description yet.'}</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#666' }}>
          <span>👥 Capacity: {form.capacity || '—'}</span>
          <span>💰 ${form.hourly_rate || 0}/hr</span>
        </div>
        {form.amenities && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {form.amenities.split(',').map(a => a.trim()).filter(Boolean).map(a => (
              <span key={a} style={{
                background: '#ffe0d4', color: '#b5451b', borderRadius: 20,
                padding: '3px 12px', fontSize: 12,
              }}>{a}</span>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}

const styles = {
  row: { display: 'flex', gap: 16 },
  field: { flex: 1 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4, marginTop: 14 },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 4,
  },
  btn: {
    padding: '11px 28px', background: '#b5451b', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10,
  },
};
