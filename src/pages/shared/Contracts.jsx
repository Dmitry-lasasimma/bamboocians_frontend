import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card, { Badge } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    client.get('/contracts').then(r => setContracts(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const sign = async (id) => {
    await client.put(`/contracts/${id}/sign`);
    load();
    if (selected?.id === id) {
      const res = await client.get(`/contracts/${id}`);
      setSelected(res.data.data);
    }
  };

  const canSign = (c) => {
    if (user.role === 'organizer') return !c.organizer_signed;
    return !c.talent_venue_signed;
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Contracts</h1>
        <p style={{ color: '#666', marginTop: 4 }}>All digital contracts you are a party to</p>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* List */}
        <div style={{ flex: 1 }}>
          {loading
            ? <p>Loading…</p>
            : !contracts.length
              ? <Card><p style={{ color: '#999', textAlign: 'center', padding: 30 }}>No contracts yet.</p></Card>
              : contracts.map(c => (
                <div key={c.id} onClick={() => setSelected(c)} style={{
                  ...styles.contractRow,
                  borderLeft: selected?.id === c.id ? '4px solid #0077b6' : '4px solid transparent',
                  background: selected?.id === c.id ? '#f0f8ff' : '#fff',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.booking?.event?.title || 'Untitled Event'}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    Between <strong>{c.booking?.booked_by?.name}</strong> &amp; <strong>{c.booking?.booked_to?.name}</strong>
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge status={c.status} />
                    {c.organizer_signed && <span style={styles.signedChip}>Organizer signed</span>}
                    {c.talent_venue_signed && <span style={styles.signedChip}>Performer signed</span>}
                  </div>
                </div>
              ))
          }
        </div>

        {/* Detail */}
        {selected && (
          <Card style={{ width: 380, flexShrink: 0, alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Contract Detail</h2>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              Event: <strong>{selected.booking?.event?.title}</strong>
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              Status: <Badge status={selected.status} />
            </div>
            <div style={{
              background: '#f8f8f8', borderRadius: 8, padding: 14,
              fontSize: 13, color: '#444', whiteSpace: 'pre-wrap', marginBottom: 16,
              maxHeight: 200, overflowY: 'auto',
            }}>
              {selected.content || 'No contract content.'}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              <div>Organizer signed: {selected.organizer_signed ? '✅' : '❌'}</div>
              <div>Performer signed: {selected.talent_venue_signed ? '✅' : '❌'}</div>
            </div>
            {canSign(selected) && (
              <button onClick={() => sign(selected.id)} style={styles.signBtn}>
                Sign Contract
              </button>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  contractRow: {
    padding: '14px 16px', marginBottom: 10, borderRadius: 10,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)', cursor: 'pointer',
    transition: 'background 0.1s',
  },
  signedChip: {
    background: '#d4edda', color: '#155724',
    borderRadius: 20, padding: '2px 8px', fontSize: 11,
  },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888' },
  signBtn: {
    width: '100%', padding: '10px 0', background: '#0077b6', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
};
