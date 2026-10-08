import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import client from '../../api/client';

export default function TalentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    client.get('/talent/profile').then(r => {
      const p = r.data.data;
      setProfile(p);
      setForm({
        stage_name: p.stage_name || '',
        genre: p.genre || '',
        bio: p.bio || '',
        hourly_rate: p.hourly_rate || '',
        location: p.location || '',
        skills: p.skills || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      await client.put('/talent/profile', { ...form, hourly_rate: parseFloat(form.hourly_rate) || 0 });
      setSuccess('Profile saved successfully!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>My Talent Profile</h1>
        <p style={{ color: '#666', marginTop: 4 }}>This is your public storefront — make it shine</p>
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
              <label style={styles.label}>Stage Name</label>
              <input name="stage_name" value={form.stage_name} onChange={handle}
                placeholder="Your performing name" style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Genre / Category</label>
              <input name="genre" value={form.genre} onChange={handle}
                placeholder="e.g. Jazz, DJ, Speaker" style={styles.input} />
            </div>
          </div>

          <label style={styles.label}>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handle}
            placeholder="Tell organizers about yourself, your experience, what makes you unique…"
            rows={4} style={{ ...styles.input, resize: 'vertical' }} />

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input name="location" value={form.location} onChange={handle}
                placeholder="City, Country" style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Rate per Hour ($)</label>
              <input name="hourly_rate" type="number" min="0" value={form.hourly_rate} onChange={handle}
                placeholder="150" style={styles.input} />
            </div>
          </div>

          <label style={styles.label}>Skills / Tags</label>
          <input name="skills" value={form.skills} onChange={handle}
            placeholder="e.g. live music, acoustic, corporate events (comma-separated)"
            style={styles.input} />
          <p style={{ fontSize: 11, color: '#aaa', marginTop: -8, marginBottom: 16 }}>
            These tags help organizers find you
          </p>

          <button type="submit" disabled={saving} style={styles.btn}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </Card>

      {/* Preview card */}
      <Card style={{ maxWidth: 680, marginTop: 20, background: '#faf7ff' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#6d4c8f', marginBottom: 12 }}>
          Public Profile Preview
        </h3>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#222' }}>{form.stage_name || profile?.user?.name}</div>
        <div style={{ color: '#6d4c8f', fontSize: 13, margin: '4px 0 8px' }}>{form.genre}</div>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>{form.bio || 'No bio yet.'}</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#888' }}>
          <span>📍 {form.location || 'Location not set'}</span>
          <span>💰 ${form.hourly_rate || 0}/hr</span>
        </div>
        {form.skills && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
              <span key={s} style={{
                background: '#ede7f6', color: '#6d4c8f', borderRadius: 20,
                padding: '3px 12px', fontSize: 12,
              }}>{s}</span>
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
    padding: '11px 28px', background: '#6d4c8f', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10,
  },
};
