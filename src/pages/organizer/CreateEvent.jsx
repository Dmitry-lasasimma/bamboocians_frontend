import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import client from '../../api/client';

const EVENT_TYPES = ['wedding', 'corporate', 'festival', 'birthday', 'concert', 'other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'other',
    date: '', location: '', budget: '', capacity: '', status: 'draft',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        budget: parseFloat(form.budget) || 0,
        capacity: parseInt(form.capacity) || 0,
        date: new Date(form.date).toISOString(),
      };
      await client.post('/organizer/events', payload);
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Create New Event</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Fill in the details for your upcoming event</p>
      </div>

      <Card style={{ maxWidth: 700 }}>
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={submit}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Event Title *</label>
              <input name="title" value={form.title} onChange={handle}
                required placeholder="e.g. Sarah & James Wedding" style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Event Type</label>
              <select name="event_type" value={form.event_type} onChange={handle} style={styles.input}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <label style={styles.label}>Description</label>
          <textarea name="description" value={form.description} onChange={handle}
            placeholder="Describe your event…" rows={3}
            style={{ ...styles.input, resize: 'vertical' }} />

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Date & Time *</label>
              <input name="date" type="datetime-local" value={form.date} onChange={handle}
                required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input name="location" value={form.location} onChange={handle}
                placeholder="City, Venue name…" style={styles.input} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Budget ($)</label>
              <input name="budget" type="number" min="0" value={form.budget} onChange={handle}
                placeholder="5000" style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Expected Capacity</label>
              <input name="capacity" type="number" min="0" value={form.capacity} onChange={handle}
                placeholder="200" style={styles.input} />
            </div>
          </div>

          <label style={styles.label}>Status</label>
          <select name="status" value={form.status} onChange={handle} style={{ ...styles.input, maxWidth: 200 }}>
            <option value="draft">Draft (private)</option>
            <option value="published">Published</option>
          </select>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? 'Creating…' : 'Create Event'}
            </button>
            <button type="button" onClick={() => navigate('/organizer/events')} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}

const styles = {
  error: { background: '#fee', color: '#c0392b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  row: { display: 'flex', gap: 16, marginBottom: 0 },
  field: { flex: 1 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4, marginTop: 12 },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 4,
  },
  btn: {
    padding: '11px 28px', background: '#2d6a4f', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  cancelBtn: {
    padding: '11px 28px', background: '#f5f5f5', color: '#555',
    border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer',
  },
};
