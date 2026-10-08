import React from 'react';

export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      padding: '20px 24px', ...style,
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, color = '#2d6a4f' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      padding: '20px 24px', borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value ?? '—'}</div>
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    pending:   { bg: '#fff3cd', color: '#856404' },
    confirmed: { bg: '#d4edda', color: '#155724' },
    declined:  { bg: '#f8d7da', color: '#721c24' },
    cancelled: { bg: '#e2e3e5', color: '#383d41' },
    draft:     { bg: '#e2e3e5', color: '#383d41' },
    published: { bg: '#cce5ff', color: '#004085' },
    active:    { bg: '#d4edda', color: '#155724' },
    invited:   { bg: '#cce5ff', color: '#004085' },
  };
  const s = map[status] || { bg: '#eee', color: '#555' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px',
      borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}
