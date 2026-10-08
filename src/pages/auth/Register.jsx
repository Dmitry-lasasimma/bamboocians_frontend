import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  {
    id: 'organizer',
    title: 'Event Organizer',
    desc: 'Plan weddings, corporate events, festivals — manage talent, venues & guests.',
    icon: '🎪',
    color: '#2d6a4f',
  },
  {
    id: 'talent',
    title: 'Talent / Performer',
    desc: 'Musician, DJ, speaker or performer — manage gigs, contracts & travel.',
    icon: '🎵',
    color: '#6d4c8f',
  },
  {
    id: 'venue',
    title: 'Venue',
    desc: 'Restaurant, hotel or event space — manage bookings and availability.',
    icon: '🏛️',
    color: '#b5451b',
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = pick role, 2 = fill details
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const pickRole = role => { setForm(f => ({ ...f, role })); setStep(2); };

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      const paths = { organizer: '/organizer', talent: '/talent', venue: '/venue' };
      navigate(paths[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === form.role);

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.logo}>Bamboocians</div>
        <p style={styles.sub}>Create your free account</p>

        {/* Step 1 — Choose role */}
        {step === 1 && (
          <>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 20, textAlign: 'center' }}>
              Who are you joining as?
            </p>
            {ROLES.map(role => (
              <button key={role.id} onClick={() => pickRole(role.id)} style={{
                ...styles.roleCard, borderColor: role.color + '44',
              }}>
                <span style={{ fontSize: 28, marginRight: 14 }}>{role.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: role.color, fontSize: 15 }}>{role.title}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{role.desc}</div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* Step 2 — Fill details */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} style={styles.back}>← Change role</button>
            <div style={{
              background: selectedRole?.color + '15', borderRadius: 8,
              padding: '8px 14px', marginBottom: 20, fontSize: 13,
              color: selectedRole?.color, fontWeight: 600,
            }}>
              {selectedRole?.icon} Registering as {selectedRole?.title}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={submit}>
              <label style={styles.label}>Full Name</label>
              <input name="name" value={form.name} onChange={handle}
                required placeholder="Your name" style={styles.input} />

              <label style={styles.label}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                required placeholder="you@example.com" style={styles.input} />

              <label style={styles.label}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                required placeholder="Min 6 characters" minLength={6} style={styles.input} />

              <button type="submit" disabled={loading} style={{
                ...styles.btn, background: selectedRole?.color,
              }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: 20, fontSize: 14, color: '#666', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2d6a4f', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)',
    padding: 20,
  },
  box: {
    background: '#fff', borderRadius: 14, padding: '40px 44px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '100%', maxWidth: 460,
  },
  logo: { fontSize: 28, fontWeight: 800, color: '#2d6a4f', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 28 },
  roleCard: {
    display: 'flex', alignItems: 'center', width: '100%',
    padding: '14px 18px', marginBottom: 12, background: '#fafafa',
    border: '2px solid #eee', borderRadius: 10, cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  back: {
    background: 'none', border: 'none', color: '#2d6a4f',
    cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0,
  },
  error: {
    background: '#fee', color: '#c0392b', padding: '10px 14px',
    borderRadius: 8, marginBottom: 16, fontSize: 13,
  },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4 },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, marginBottom: 16, outline: 'none',
  },
  btn: {
    width: '100%', padding: '12px 0', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
    cursor: 'pointer', marginTop: 4,
  },
};
