import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function Messages() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [activeThread, setActiveThread] = useState(null); // { id, name }
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [newReceiverId, setNewReceiverId] = useState('');
  const endRef = useRef(null);

  const loadInbox = () => {
    client.get('/messages/inbox').then(r => {
      const msgs = r.data.data || [];
      // Deduplicate threads by sender
      const seen = new Set();
      const threads = [];
      msgs.forEach(m => {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        const otherName = m.sender_id === user.id ? m.receiver?.name : m.sender?.name;
        if (!seen.has(otherId)) { seen.add(otherId); threads.push({ id: otherId, name: otherName, last: m }); }
      });
      setInbox(threads);
    });
  };

  const loadThread = (otherId) => {
    client.get(`/messages/${otherId}`).then(r => setMessages(r.data.data || []));
  };

  useEffect(() => { loadInbox(); }, []);

  useEffect(() => {
    if (activeThread) loadThread(activeThread.id);
  }, [activeThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async e => {
    e.preventDefault();
    if (!text.trim() || !activeThread) return;
    setSending(true);
    try {
      await client.post('/messages', { receiver_id: activeThread.id, content: text.trim() });
      setText('');
      loadThread(activeThread.id);
      loadInbox();
    } finally { setSending(false); }
  };

  const openNew = () => {
    const id = parseInt(newReceiverId);
    if (!id) return;
    setActiveThread({ id, name: `User #${id}` });
    setNewReceiverId('');
  };

  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Messages</h1>
      </div>

      <div style={{ display: 'flex', gap: 0, height: 560, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        {/* Sidebar */}
        <div style={{ width: 240, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 6 }}>NEW CONVERSATION</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={newReceiverId} onChange={e => setNewReceiverId(e.target.value)}
                placeholder="User ID" style={styles.smallInput} type="number" />
              <button onClick={openNew} style={styles.smallBtn}>Go</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {inbox.map(t => (
              <div key={t.id} onClick={() => setActiveThread(t)} style={{
                padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
                background: activeThread?.id === t.id ? '#f0f8ff' : 'transparent',
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name || `User #${t.id}`}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {t.last?.content || ''}
                </div>
              </div>
            ))}
            {!inbox.length && (
              <div style={{ padding: 20, color: '#bbb', fontSize: 13 }}>No conversations yet</div>
            )}
          </div>
        </div>

        {/* Thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeThread
            ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                Select a conversation or start a new one
              </div>
            )
            : (
              <>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #eee', fontWeight: 700, fontSize: 15 }}>
                  {activeThread.name}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map(m => {
                    const mine = m.sender_id === user.id;
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '68%', padding: '9px 14px', borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: mine ? '#2d6a4f' : '#f0f0f0',
                          color: mine ? '#fff' : '#333', fontSize: 14,
                        }}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>
                <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: 10 }}>
                  <input value={text} onChange={e => setText(e.target.value)}
                    placeholder="Type a message…" style={styles.msgInput} />
                  <button type="submit" disabled={sending || !text.trim()} style={styles.sendBtn}>
                    {sending ? '…' : 'Send'}
                  </button>
                </form>
              </>
            )
          }
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  smallInput: { flex: 1, padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, outline: 'none' },
  smallBtn: { padding: '6px 12px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  msgInput: { flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 22, fontSize: 14, outline: 'none' },
  sendBtn: {
    padding: '10px 20px', background: '#2d6a4f', color: '#fff',
    border: 'none', borderRadius: 22, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};
