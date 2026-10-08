import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import client from '../../api/client';

export default function VenueCalendar() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/venue/calendar').then(r => setEntries(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  // Group entries by month
  const byMonth = entries.reduce((acc, entry) => {
    const d = new Date(entry.date);
    const key = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Venue Calendar</h1>
        <p style={{ color: '#666', marginTop: 4 }}>All confirmed events scheduled at your venue</p>
      </div>

      {loading
        ? <p>Loading…</p>
        : !entries.length
          ? (
            <Card>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <p style={{ color: '#999' }}>No confirmed bookings yet. Your calendar will fill up soon!</p>
              </div>
            </Card>
          )
          : Object.entries(byMonth).map(([month, items]) => (
            <Card key={month} style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#b5451b', marginBottom: 14 }}>{month}</h2>
              {items.map(entry => (
                <div key={entry.booking_id} style={styles.entry}>
                  <div style={styles.dateBadge}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#b5451b' }}>
                      {new Date(entry.date).getDate()}
                    </span>
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {new Date(entry.date).toLocaleString('default', { weekday: 'short' })}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{entry.event_title}</div>
                    <div style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                      📍 {entry.location || 'No location'}
                    </div>
                  </div>
                  <div style={{
                    background: '#d4edda', color: '#155724',
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>
                    Confirmed
                  </div>
                </div>
              ))}
            </Card>
          ))
      }
    </Layout>
  );
}

const styles = {
  entry: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '12px 0', borderBottom: '1px solid #f5f5f5',
  },
  dateBadge: {
    width: 52, height: 52, background: '#fff5f2', borderRadius: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', border: '1px solid #ffe0d4', flexShrink: 0,
  },
};
