import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asueiylnppjxlpbmzxmz.supabase.co',
  'sb_publishable_URPMSXfHCT9qbM_IZXx8kg_gg9XWSsK'
);

export default function App() {
  const [screen, setScreen] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  async function fetchAppointments() {
    const { data } = await supabase
      .from('Appointments')
      .select('*')
      .order('created_at', { ascending: false });
    setAppointments(data || []);
  }

  async function fetchPatients() {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .order('last_visit', { ascending: false });
    setPatients(data || []);
  }

  async function updateStatus(id, status, apt) {
    await supabase
      .from('Appointments')
      .update({ status })
      .eq('id', id);

    if (status === 'accepted') {
      // Check if patient already exists
      const { data: existing } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', apt.phone)
        .single();

      if (existing) {
        // Update existing patient
        await supabase
          .from('patients')
          .update({
            last_visit: new Date().toISOString(),
            visit_count: (existing.visit_count || 0) + 1
          })
          .eq('phone', apt.phone);
      } else {
        // Create new patient
        await supabase
          .from('patients')
          .insert([{
            name: apt.name,
            phone: apt.phone,
            last_visit: new Date().toISOString(),
            visit_count: 1
          }]);
      }
    }
    fetchAppointments();
    fetchPatients();
  }

  // PATIENT DETAIL SCREEN
  if (selectedPatient) {
    const patientAppointments = appointments.filter(
      a => a.phone === selectedPatient.phone
    );
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => setSelectedPatient(null)} style={styles.backBtn}>← Back</button>
          <h1 style={styles.headerText}>{selectedPatient.name}</h1>
          <p style={styles.headerSub}>📱 {selectedPatient.phone?.replace('whatsapp:+91', '+91 ')}</p>
          <p style={styles.headerSub}>🏥 {selectedPatient.visit_count} visit{selectedPatient.visit_count > 1 ? 's' : ''}</p>
          <p style={styles.headerSub}>🕐 Last visit: {new Date(selectedPatient.last_visit).toLocaleDateString('en-IN')}</p>
        </div>

        <p style={styles.sectionTitle}>Visit History</p>
        {patientAppointments.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No visits yet</p>
          </div>
        ) : (
          patientAppointments.map(apt => (
            <div key={apt.id} style={styles.card}>
              <p style={styles.name}>📅 {apt.time}</p>
              <p style={styles.time}>Booked: {new Date(apt.created_at).toLocaleDateString('en-IN')}</p>
              <div style={{
                ...styles.statusBadge,
                background: apt.status === 'accepted' ? '#e8f5ee' :
                            apt.status === 'rejected' ? '#fef2f2' : '#fef3e2',
                display: 'inline-block',
                marginTop: 6
              }}>
                <p style={{
                  ...styles.statusText,
                  color: apt.status === 'accepted' ? '#1a6b3c' :
                         apt.status === 'rejected' ? '#b91c1c' : '#b45309'
                }}>{apt.status || 'pending'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerText}>Varcare</h1>
        <p style={styles.headerSub}>Doctor Dashboard</p>
      </div>

      {/* Bottom nav */}
      <div style={styles.nav}>
        <button
          style={screen === 'appointments' ? styles.navBtnActive : styles.navBtn}
          onClick={() => setScreen('appointments')}
        >
          📋 Appointments
        </button>
        <button
          style={screen === 'patients' ? styles.navBtnActive : styles.navBtn}
          onClick={() => setScreen('patients')}
        >
          👥 Patients
        </button>
      </div>

      {/* APPOINTMENTS SCREEN */}
      {screen === 'appointments' && (
        <>
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
                    <button style={styles.acceptBtn} onClick={() => updateStatus(apt.id, 'accepted', apt)}>✓ Accept</button>
                    <button style={styles.rejectBtn} onClick={() => updateStatus(apt.id, 'rejected', apt)}>✗ Reject</button>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* PATIENTS SCREEN */}
      {screen === 'patients' && (
        <>
          <p style={styles.sectionTitle}>{patients.length} patients registered</p>
          {patients.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>No patients yet</p>
              <p style={styles.emptySubText}>Patients appear here when you accept their appointment</p>
            </div>
          ) : (
            patients.map((patient) => (
              <div key={patient.id} style={styles.card} onClick={() => setSelectedPatient(patient)}>
                <div style={styles.cardTop}>
                  <div>
                    <p style={styles.name}>{patient.name}</p>
                    <p style={styles.time}>📱 {patient.phone?.replace('whatsapp:+91', '+91 ')}</p>
                    <p style={styles.phone}>🕐 Last visit: {new Date(patient.last_visit).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div style={styles.visitBadge}>
                    <p style={styles.visitCount}>{patient.visit_count}</p>
                    <p style={styles.visitLabel}>visit{patient.visit_count > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif', background: '#f7f6f2', minHeight: '100vh' },
  header: { background: '#1a6b3c', borderRadius: 14, padding: '20px 16px', marginBottom: 16 },
  headerText: { color: '#fff', margin: 0, fontSize: 24, fontWeight: 700 },
  headerSub: { color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 13 },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginBottom: 8 },
  nav: { display: 'flex', gap: 8, marginBottom: 16 },
  navBtn: { flex: 1, padding: '10px 0', background: '#fff', border: '0.5px solid #e0ddd5', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#6b7080' },
  navBtnActive: { flex: 1, padding: '10px 0', background: '#1a6b3c', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#fff', fontWeight: 600 },
  sectionTitle: { fontSize: 13, color: '#6b7080', marginBottom: 10, fontWeight: 500 },
  empty: { background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', marginTop: 20 },
  emptyText: { fontSize: 18, fontWeight: 600, color: '#0f1117', margin: 0 },
  emptySubText: { fontSize: 13, color: '#6b7080', marginTop: 8 },
  card: { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 600, color: '#0f1117', margin: '0 0 4px' },
  time: { fontSize: 13, color: '#3a3d4a', margin: '0 0 2px' },
  phone: { fontSize: 13, color: '#6b7080', margin: 0 },
  statusBadge: { padding: '4px 12px', borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 500, margin: 0, textTransform: 'capitalize' },
  btnRow: { display: 'flex', gap: 8 },
  acceptBtn: { flex: 1, padding: '10px 0', background: '#e8f5ee', color: '#1a6b3c', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '10px 0', background: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  visitBadge: { background: '#e8f5ee', borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 50 },
  visitCount: { fontSize: 20, fontWeight: 700, color: '#1a6b3c', margin: 0 },
  visitLabel: { fontSize: 11, color: '#1a6b3c', margin: 0 },
};