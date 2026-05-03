import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asueiylnppjxlpbmzxmz.supabase.co',
  'sb_publishable_URPMSXfHCT9qbM_IZXx8kg_gg9XWSsK'
);

export default function App() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    const { data } = await supabase
      .from('Appointments')
      .select('*')
      .order('created_at', { ascending: false });
    setAppointments(data || []);
  }

  async function updateStatus(id, status) {
    await supabase
      .from('Appointments')
      .update({ status })
      .eq('id', id);
    fetchAppointments();
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerText}>Varcare</h1>
        <p style={styles.headerSub}>Live appointment requests</p>
      </div>

      {appointments.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No appointments yet</p>
          <p style={styles.emptySubText}>Patients who book via WhatsApp will appear here</p>
        </div>
      ) : (
        appointments.map((apt) => (
          <div key={apt.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <p style={styles.name}>{apt.name}</p>
                <p style={styles.time}>⏰ {apt.time}</p>
                <p style={styles.phone}>📱 {apt.phone?.replace('whatsapp:+91', '+91 ')}</p>
              </div>
              <div style={{
                ...styles.statusBadge,
                background: apt.status === 'accepted' ? '#e8f5ee' :
                            apt.status === 'rejected' ? '#fef2f2' : '#fef3e2'
              }}>
                <p style={{
                  ...styles.statusText,
                  color: apt.status === 'accepted' ? '#1a6b3c' :
                         apt.status === 'rejected' ? '#b91c1c' : '#b45309'
                }}>
                  {apt.status || 'pending'}
                </p>
              </div>
            </div>

            {(!apt.status || apt.status === 'pending') && (
              <div style={styles.btnRow}>
                <button
                  style={styles.acceptBtn}
                  onClick={() => updateStatus(apt.id, 'accepted')}
                >
                  ✓ Accept
                </button>
                <button
                  style={styles.rejectBtn}
                  onClick={() => updateStatus(apt.id, 'rejected')}
                >
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif', background: '#f7f6f2', minHeight: '100vh' },
  header: { background: '#1a6b3c', borderRadius: 14, padding: '20px 16px', marginBottom: 16 },
  headerText: { color: '#fff', margin: 0, fontSize: 24, fontWeight: 700 },
  headerSub: { color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 13 },
  empty: { background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: 600, color: '#0f1117', margin: 0 },
  emptySubText: { fontSize: 13, color: '#6b7080', marginTop: 8 },
  card: { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 600, color: '#0f1117', margin: '0 0 4px' },
  time: { fontSize: 13, color: '#3a3d4a', margin: '0 0 2px' },
  phone: { fontSize: 13, color: '#6b7080', margin: 0 },
  statusBadge: { padding: '4px 12px', borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 500, margin: 0, textTransform: 'capitalize' },
  btnRow: { display: 'flex', gap: 8 },
  acceptBtn: { flex: 1, padding: '10px 0', background: '#e8f5ee', color: '#1a6b3c', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '10px 0', background: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};