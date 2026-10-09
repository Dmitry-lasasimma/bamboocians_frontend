import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Public demo accounts seeded by the backend when SEED_DEMO=true
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';
const DEMO_PASSWORD = 'demo1234';
const DEMO_ACCOUNTS = [
  { label: 'Organizer', email: 'organizer@demo.bamboocians.com', color: '#2d6a4f' },
  { label: 'Talent',    email: 'talent@demo.bamboocians.com',    color: '#6d4c8f' },
  { label: 'Venue',     email: 'venue@demo.bamboocians.com',     color: '#b5451b' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const signIn = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const paths = { organizer: '/organizer', talent: '/talent', venue: '/venue' };
      navigate(paths[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const submit = e => {
    e.preventDefault();
    signIn(form.email, form.password);
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.logo}>Bamboocians</div>
        <p style={styles.sub}>The central hub for event management</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={submit}>
          <label style={styles.label}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handle}
            required placeholder="you@example.com" style={styles.input} />

          <label style={styles.label}>Password</label>
          <input name="password" type="password" value={form.password} onChange={handle}
            required placeholder="••••••••" style={styles.input} />

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {DEMO_MODE && (
          <div style={styles.demoBox}>
            <div style={styles.demoTitle}>Try a demo account</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {DEMO_ACCOUNTS.map(a => (
                <button key={a.email} type="button" disabled={loading}
                  onClick={() => signIn(a.email, DEMO_PASSWORD)}
                  style={{ ...styles.demoBtn, color: a.color, borderColor: a.color + '55' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 14, color: '#666', textAlign: 'center' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#2d6a4f', fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)',
  },
  box: {
    background: '#fff', borderRadius: 14, padding: '40px 44px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '100%', maxWidth: 420,
  },
  logo: { fontSize: 28, fontWeight: 800, color: '#2d6a4f', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 28 },
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
    width: '100%', padding: '12px 0', background: '#2d6a4f', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
    cursor: 'pointer', marginTop: 4,
  },
  demoBox: {
    marginTop: 20, padding: '14px 16px', background: '#f6faf7',
    border: '1px dashed #b7e4c7', borderRadius: 10,
  },
  demoTitle: { fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 10, textAlign: 'center' },
  demoBtn: {
    flex: 1, padding: '8px 0', background: '#fff', border: '1px solid',
    borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
};
